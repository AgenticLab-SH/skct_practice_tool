#!/usr/bin/env node
"use strict";

// =============================================================================
// 투네이션 -> 로컬 자동발급 웹훅 중계 (템플릿)
// =============================================================================
// 투네이션(toon.at)은 공식 웹훅 API 가 없고, "알림창(AlertBox) 위젯 키" 기반의
// 실시간 소켓만 제공합니다. 따라서 상시 연결 리스너가 후원 이벤트를 받아
// 로컬 자동발급 수신기(run.js --webhook)로 정규화하여 POST 해야 합니다.
//
// 이 파일은 "연결 골격 + 정규화 + 안전한 전달" 템플릿입니다.
// 실제 소켓 메시지 포맷은 투네이션 알림창 위젯의 현재 프로토콜을 1회 확인해
// parseToonationMessage() 를 맞춰야 합니다(아래 주석 참고).
//
// 권장 확인 방법:
//   1) 투네이션 대시보드 > 알림창 위젯 URL 에서 KEY 를 확보
//   2) 커뮤니티 리퍼런스로 메시지 포맷 확인:
//      - https://github.com/outstanding1301/donation-alert-api (Twip/Toonation)
//      - https://github.com/nomomo/Twip-Toonation-Afreehp-Parser-Example
//   3) parseToonationMessage() 를 실제 포맷에 맞춰 보정
//
// 정규화 결과(웹훅 본문) 형식:
//   { id: string, donorName: string, amount: number(원), message: string }
//   - amount 는 원화 정수, message 에는 후원자가 적은 글(신청ID REQ-... 포함 권장)
// =============================================================================

const nodeCrypto = require("crypto");

const ALERTBOX_KEY = process.env.TOONATION_ALERTBOX_KEY || "";
const WEBHOOK_URL = process.env.SKCT_WEBHOOK_URL || "http://127.0.0.1:8137/donation";
const WEBHOOK_SECRET = process.env.SKCT_WEBHOOK_SECRET || "";

function sign(rawBody) {
    return nodeCrypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
}

async function forwardDonation(donation) {
    const raw = JSON.stringify(donation);
    const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-signature": sign(raw) },
        body: raw
    });
    const data = await res.json().catch(() => ({}));
    console.log(`[relay] don=${donation.id} -> ${res.status}`, data.result ? data.result.status : data.error || "");
}

// 실제 투네이션 알림창 소켓 메시지를 정규화 이벤트로 변환.
// 현재 프로토콜 확인 후 이 함수만 맞추면 나머지는 그대로 동작합니다.
function parseToonationMessage(rawMessage) {
    // 예시(확인 필요): 투네이션 알림 payload 에서 후원자명/금액/메시지 추출
    //   const obj = JSON.parse(rawMessage);
    //   return { id: obj.id, donorName: obj.from, amount: Number(obj.amount), message: obj.comment };
    throw new Error("parseToonationMessage(): 투네이션 현재 메시지 포맷에 맞춰 구현하세요.");
}

async function main() {
    if (!ALERTBOX_KEY) throw new Error("환경변수 TOONATION_ALERTBOX_KEY 가 필요합니다.");
    if (!WEBHOOK_SECRET) throw new Error("환경변수 SKCT_WEBHOOK_SECRET 가 필요합니다(run.js 의 webhookSecret 과 동일).");
    if (typeof WebSocket === "undefined") {
        throw new Error("이 Node 버전에 전역 WebSocket 이 없습니다. Node 22+ 를 쓰거나 'ws' 패키지를 사용하세요.");
    }

    // 투네이션 알림창 소켓 엔드포인트는 위젯 페이지에서 동적으로 결정됩니다.
    // 아래는 연결 골격이며, 실제 엔드포인트/핸드셰이크는 위 커뮤니티 리퍼런스로 확인하세요.
    const endpoint = `wss://toon.at/widget/alertbox/${encodeURIComponent(ALERTBOX_KEY)}`;
    const ws = new WebSocket(endpoint);

    ws.addEventListener("open", () => console.log("[relay] 투네이션 알림창 소켓 연결됨"));
    ws.addEventListener("close", () => {
        console.log("[relay] 연결 종료 - 5초 후 재연결");
        setTimeout(() => main().catch(console.error), 5000);
    });
    ws.addEventListener("error", (e) => console.error("[relay] 소켓 오류:", e.message || e));
    ws.addEventListener("message", async (ev) => {
        try {
            const donation = parseToonationMessage(ev.data);
            if (donation && donation.id) await forwardDonation(donation);
        } catch (err) {
            console.error("[relay] 메시지 처리 실패:", err.message);
        }
    });
}

main().catch((err) => {
    console.error("중계 실행 실패:", err.message);
    process.exit(1);
});
