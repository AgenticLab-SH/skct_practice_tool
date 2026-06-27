#!/usr/bin/env node
"use strict";

// =============================================================================
// 투네이션(toon.at) 알림창 -> 로컬 자동발급 웹훅 중계 (실제 구현)
// =============================================================================
// 투네이션은 공식 웹훅 API 가 없고, "알림창(AlertBox) 위젯 키" 기반의 실시간
// WebSocket(소켓) 만 제공합니다. 따라서 상시 연결 리스너가 후원 이벤트를 받아
// 로컬 자동발급 수신기(run.js --webhook)로 정규화하여 POST 합니다.
//
// === 검증된 연결 방식 (2026-06-28 실연결로 확인) ===========================
//   1) https://toon.at/widget/alertbox/<KEY> HTML 을 가져온다.
//   2) 인라인 <script> 의  window.payload = JSON.parse("...")  를 해제해
//      그 객체의 .payload(base64url 토큰)를 얻는다. (구 포맷 "payload":"..." 폴백 지원)
//   3) raw WebSocket 으로  wss://ws.toon.at/<payload>  에 연결한다.
//      (socket.io 가 아니라 표준 WebSocket. 추가 의존성 불필요.)
//      연결 후 12초마다 "#ping" 을 보내야 한다(서버가 #pong 응답, 미응답 누적 시 끊김).
//      제어 프레임 "#pong"/"#block" 은 후원이 아니므로 무시한다.
//   4) 수신 메시지 JSON 의 content 객체에서 후원 정보를 꺼낸다.
//        name -> 후원자명,  amount -> 금액(원),  message -> 후원 메시지(신청ID REQ-... 포함)
//      (설정 메시지는 {"type":0,"conf":{...}} 처럼 content 가 없어 자동 무시됨)
//   레퍼런스: https://github.com/outstanding1301/donation-alert-api (+ 실제 위젯 번들 확인)
//
// === 운영 주의 ===============================================================
// - 투네이션은 프로토콜을 예고 없이 바꿀 수 있다. 첫 실연결 시 실제 후원 1건의
//   원문(raw)을 로그로 확인하고( DONATION_BRIDGE_DEBUG=1 ), 포맷이 다르면
//   parseToonationMessage() 만 보정하면 나머지는 그대로 동작한다.
// - 후원 id 는 run.js 의 state(멱등) 키로 쓰인다. 동일 신청ID 는 발급 후
//   subscriptionRequests 의 status=fulfilled 로 이중 보호되므로 과발급되지 않는다.
//
// === 설정 ===================================================================
// 값은 환경변수 우선, 없으면 private/donation-auto-issuer.config.json 에서 읽는다.
//   TOONATION_ALERTBOX_KEY  (config: toonationAlertboxKey)  필수
//   SKCT_WEBHOOK_SECRET     (config: webhookSecret)          필수(run.js 와 동일)
//   SKCT_WEBHOOK_PORT       (config: webhookPort, 기본 8137)
//   SKCT_WEBHOOK_URL        (기본 http://127.0.0.1:<port>/donation)
// =============================================================================

const fs = require("fs");
const path = require("path");
const nodeCrypto = require("crypto");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const WIDGET_BASE = "https://toon.at/widget/alertbox/";
const SOCKET_BASE = "wss://ws.toon.at/";
const PING_INTERVAL_MS = 12000; // 투네이션 공식 클라이언트와 동일(12초마다 #ping)
const DEBUG = process.env.DONATION_BRIDGE_DEBUG === "1";

// ----------------------------------------------------------------------------
// 설정 로딩
// ----------------------------------------------------------------------------
function loadBridgeConfig() {
    const cfgPath = process.env.SKCT_ISSUER_CONFIG
        || path.join(PROJECT_ROOT, "private", "donation-auto-issuer.config.json");
    let fileCfg = {};
    if (fs.existsSync(cfgPath)) {
        try { fileCfg = JSON.parse(fs.readFileSync(cfgPath, "utf8")) || {}; }
        catch (e) { /* 손상된 설정은 무시하고 env 로만 시도 */ }
    }
    const port = Number(process.env.SKCT_WEBHOOK_PORT || fileCfg.webhookPort || 8137);
    return {
        alertboxKey: process.env.TOONATION_ALERTBOX_KEY || fileCfg.toonationAlertboxKey || "",
        webhookSecret: process.env.SKCT_WEBHOOK_SECRET || fileCfg.webhookSecret || "",
        webhookUrl: process.env.SKCT_WEBHOOK_URL || `http://127.0.0.1:${port}/donation`
    };
}

// ----------------------------------------------------------------------------
// 위젯 페이지에서 연결 payload 추출 (순수 함수 - 테스트 대상)
//
// 현재(2025+) 투네이션 포맷:
//   window.payload = JSON.parse("{...\u0022payload\u0022:\u0022<base64url 토큰>\u0022...}");
//   -> 이 객체의 .payload 가 wss://toon.at:8071/<payload> 연결 토큰.
// 구(舊) 포맷 폴백: "payload":"<토큰>" 직접 노출.
// ----------------------------------------------------------------------------
function extractPayload(html) {
    const text = String(html || "");
    // 신규 포맷: window.payload = JSON.parse("....") 의 인자(유니코드 이스케이프된 JSON 문자열)를 해제 후 .payload
    const m = text.match(/window\.payload\s*=\s*JSON\.parse\(\s*"([\s\S]*?)"\s*\)/);
    if (m) {
        try {
            const jsonText = JSON.parse('"' + m[1] + '"'); // \uXXXX 이스케이프 해제
            const obj = JSON.parse(jsonText);
            if (obj && typeof obj.payload === "string" && obj.payload) return obj.payload;
        } catch (e) { /* 폴백으로 진행 */ }
    }
    // 구 포맷: "payload":"<값>" (값에 따옴표 없음 가정)
    const legacy = text.match(/"payload"\s*:\s*"([^"]+)"/);
    return legacy ? legacy[1] : "";
}

// ----------------------------------------------------------------------------
// 수신 메시지 -> 정규화 후원 이벤트 (순수 함수 - 테스트 대상)
//   반환: { id, donorName, amount, message } | null(후원 아님: 핸드셰이크/하트비트 등)
// ----------------------------------------------------------------------------
function parseToonationMessage(raw) {
    let json;
    try {
        json = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (e) {
        return null;
    }
    if (!json || typeof json !== "object") return null;

    // content 는 객체이거나, 드물게 JSON 문자열로 올 수 있다.
    let content = json.content;
    if (typeof content === "string") {
        try { content = JSON.parse(content); } catch (e) { content = null; }
    }
    if (!content || typeof content !== "object") return null;

    const amount = Number(content.amount);
    const donorName = String(content.name || content.nickname || content.from || "").trim();
    const message = String(content.message || content.comment || "").trim();

    // 고유 후원 식별자: 명시 id 우선, 없으면 안정 해시(타임스탬프 미포함 -> 중복수신 방지).
    const explicitId = content.id || content.tid || content.key || content.uuid || content.seq;
    const id = explicitId
        ? String(explicitId)
        : "toon-" + nodeCrypto.createHash("sha1")
            .update(`${content.account || ""}|${donorName}|${amount}|${message}`)
            .digest("hex").slice(0, 16);

    return { id, donorName, amount: Number.isFinite(amount) ? amount : 0, message };
}

// ----------------------------------------------------------------------------
// 정규화 후원 -> 로컬 자동발급 수신기로 HMAC 서명 POST
// ----------------------------------------------------------------------------
async function forwardDonation(donation, cfg) {
    const raw = JSON.stringify(donation);
    const sig = nodeCrypto.createHmac("sha256", cfg.webhookSecret).update(raw).digest("hex");
    const res = await fetch(cfg.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-signature": sig },
        body: raw
    });
    const data = await res.json().catch(() => ({}));
    const status = data.result ? data.result.status : (data.error || res.status);
    console.log(`[relay] don=${donation.id} amount=${donation.amount} -> ${res.status} (${status})`);
    return data;
}

// ----------------------------------------------------------------------------
// WebSocket 구현 해석: Node 22+ 전역 WebSocket 우선, 없으면 ws 패키지(선택) 폴백
// ----------------------------------------------------------------------------
function resolveWebSocket() {
    if (typeof WebSocket !== "undefined") return WebSocket;
    try { return require("ws"); } catch (e) {
        throw new Error("WebSocket 을 찾지 못했습니다. Node 22+ 를 쓰거나 `npm i ws` 로 ws 패키지를 설치하세요.");
    }
}

// 전역 WebSocket(addEventListener)과 ws 패키지(EventEmitter) 를 동일하게 다루는 래퍼
function bindSocketEvents(ws, handlers) {
    const isEmitter = typeof ws.on === "function" && typeof ws.addEventListener !== "function";
    if (isEmitter) {
        ws.on("open", () => handlers.open());
        ws.on("message", (data) => handlers.message(Buffer.isBuffer(data) ? data.toString("utf8") : String(data)));
        ws.on("close", (code) => handlers.close(code));
        ws.on("error", (err) => handlers.error(err));
    } else {
        ws.addEventListener("open", () => handlers.open());
        ws.addEventListener("message", (ev) => handlers.message(
            typeof ev.data === "string" ? ev.data : Buffer.from(ev.data).toString("utf8")
        ));
        ws.addEventListener("close", (ev) => handlers.close(ev && ev.code));
        ws.addEventListener("error", (ev) => handlers.error(ev && (ev.error || ev.message || ev)));
    }
}

async function fetchWidgetPayload(alertboxKey) {
    const url = WIDGET_BASE + encodeURIComponent(alertboxKey);
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (SKCT-auto-issuer)" } });
    if (!res.ok) throw new Error(`위젯 페이지 요청 실패(${res.status}). 알림창 KEY 를 확인하세요.`);
    const html = await res.text();
    const payload = extractPayload(html);
    if (!payload) {
        throw new Error("위젯 페이지에서 payload 를 찾지 못했습니다. KEY 가 맞는지/투네이션 프로토콜 변경 여부를 확인하세요.");
    }
    return payload;
}

// ----------------------------------------------------------------------------
// 상시 연결 + 자동 재연결 (지수 백오프)
// ----------------------------------------------------------------------------
function runBridge(cfg) {
    let backoffMs = 1000;
    const MAX_BACKOFF = 30000;
    let stopped = false;

    async function connect() {
        if (stopped) return;
        let payload;
        try {
            payload = await fetchWidgetPayload(cfg.alertboxKey);
        } catch (err) {
            console.error(`[relay] 핸드셰이크 실패: ${err.message} (${backoffMs}ms 후 재시도)`);
            scheduleReconnect();
            return;
        }

        const WS = resolveWebSocket();
        const ws = new WS(SOCKET_BASE + payload);
        let pingTimer = null;
        const stopPing = () => { if (pingTimer) { clearInterval(pingTimer); pingTimer = null; } };

        bindSocketEvents(ws, {
            open: () => {
                backoffMs = 1000;
                console.log("[relay] 투네이션 알림창 소켓 연결됨");
                // 투네이션 공식 클라이언트와 동일: 12초마다 #ping 전송(미응답 누적 시 서버가 끊으므로 필수)
                stopPing();
                pingTimer = setInterval(() => {
                    try { ws.send("#ping"); } catch (e) { /* 닫히는 중이면 무시 */ }
                }, PING_INTERVAL_MS);
            },
            message: async (text) => {
                // 제어 프레임은 후원이 아니므로 조용히 무시(#pong=하트비트 응답, #block=차단)
                if (text === "#pong" || text === "#block") return;
                if (DEBUG) console.log("[relay][raw]", text.slice(0, 500));
                let donation;
                try {
                    donation = parseToonationMessage(text);
                } catch (e) {
                    console.error("[relay] 메시지 파싱 오류:", e.message);
                    return;
                }
                if (!donation || !donation.id) return; // 설정(type:0)/기타 알림 등은 무시
                try {
                    await forwardDonation(donation, cfg);
                } catch (e) {
                    console.error(`[relay] 전달 실패 don=${donation.id}: ${e.message}`);
                }
            },
            close: (code) => {
                stopPing();
                console.log(`[relay] 연결 종료(code=${code ?? "?"}). ${backoffMs}ms 후 재연결`);
                scheduleReconnect();
            },
            error: (err) => {
                stopPing();
                console.error("[relay] 소켓 오류:", (err && err.message) || err);
                try { ws.close && ws.close(); } catch (e) { /* noop */ }
            }
        });
    }

    function scheduleReconnect() {
        if (stopped) return;
        const wait = backoffMs;
        backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF);
        setTimeout(() => connect().catch((e) => {
            console.error("[relay] 재연결 예외:", e.message);
            scheduleReconnect();
        }), wait);
    }

    connect().catch((e) => {
        console.error("[relay] 최초 연결 예외:", e.message);
        scheduleReconnect();
    });

    return () => { stopped = true; };
}

// ----------------------------------------------------------------------------
// 엔트리포인트
// ----------------------------------------------------------------------------
function main() {
    const cfg = loadBridgeConfig();
    if (!cfg.alertboxKey) {
        throw new Error("투네이션 알림창 KEY 가 없습니다. 환경변수 TOONATION_ALERTBOX_KEY 또는 config.toonationAlertboxKey 를 설정하세요.");
    }
    if (!cfg.webhookSecret) {
        throw new Error("webhookSecret 이 없습니다(run.js 와 동일 값 필요). 환경변수 SKCT_WEBHOOK_SECRET 또는 config.webhookSecret 를 설정하세요.");
    }
    console.log(`[relay] 시작: 위젯 KEY ...${cfg.alertboxKey.slice(-4)} -> ${cfg.webhookUrl}`);
    runBridge(cfg);
}

if (require.main === module) {
    try { main(); }
    catch (err) { console.error("중계 실행 실패:", err.message); process.exit(1); }
}

module.exports = { extractPayload, parseToonationMessage, loadBridgeConfig, forwardDonation };
