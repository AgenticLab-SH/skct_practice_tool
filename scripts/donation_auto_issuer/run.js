#!/usr/bin/env node
"use strict";

// 후원 자동 사용권 발급 - 실행 러너
//
// 투네이션은 공식 웹훅 API 가 없으므로(알림창 위젯 키 기반 소켓만 제공),
// 이 러너는 "정규화된 후원 이벤트"를 받아 검증 후 자동 발급하는 부분을 담당한다.
// 후원 이벤트는 아래 소스 중 하나로 들어온다:
//   --webhook : 로컬 HTTP 수신기 (Toonation->중계기 또는 커뮤니티 리스너가 POST)
//   --file    : JSON 배열 파일을 일괄 처리
//   --once    : 단일 후원 이벤트(JSON)를 즉시 처리 (수동/테스트)
//
// 개인키(관리자 RSA, 라이선스 ECDSA)는 로컬 파일에서만 읽으며 서버로 보내지 않는다.

const fs = require("fs");
const http = require("http");
const path = require("path");
const nodeCrypto = require("crypto");

const { FirebaseRestClient } = require("./firebase-rest.js");
const { processDonation } = require("./issue-pipeline.js");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

function parseArgs(argv) {
    const args = { mode: null, value: null, config: null };
    for (let i = 2; i < argv.length; i += 1) {
        const a = argv[i];
        if (a === "--webhook") args.mode = "webhook";
        else if (a === "--file") { args.mode = "file"; args.value = argv[++i]; }
        else if (a === "--once") { args.mode = "once"; args.value = argv[++i]; }
        else if (a === "--config") args.config = argv[++i];
    }
    return args;
}

function loadConfig(explicitPath) {
    const candidate = explicitPath
        || process.env.SKCT_ISSUER_CONFIG
        || path.join(PROJECT_ROOT, "private", "donation-auto-issuer.config.json");
    if (!fs.existsSync(candidate)) {
        throw new Error(`설정 파일을 찾지 못했습니다: ${candidate}\n(config.example.json 을 복사해 private/donation-auto-issuer.config.json 으로 채우세요.)`);
    }
    const cfg = JSON.parse(fs.readFileSync(candidate, "utf8"));
    for (const key of ["apiKey", "databaseURL", "email", "password", "adminPrivateKeyPath", "signingPrivateKeyPath"]) {
        if (!cfg[key]) throw new Error(`설정에 ${key} 가 없습니다: ${candidate}`);
    }
    return cfg;
}

function resolveMaybeRelative(p) {
    return path.isAbsolute(p) ? p : path.join(PROJECT_ROOT, p);
}

function readPem(p, label) {
    const full = resolveMaybeRelative(p);
    if (!fs.existsSync(full)) throw new Error(`${label} 개인키 파일이 없습니다: ${full}`);
    return fs.readFileSync(full, "utf8");
}

function makeStateStore(statePath) {
    let processed = {};
    if (fs.existsSync(statePath)) {
        try { processed = JSON.parse(fs.readFileSync(statePath, "utf8")) || {}; } catch (e) { processed = {}; }
    }
    return {
        has: (id) => Boolean(processed[id]),
        mark: (id, info) => {
            processed[id] = { at: Date.now(), ...info };
            fs.mkdirSync(path.dirname(statePath), { recursive: true });
            fs.writeFileSync(statePath, JSON.stringify(processed, null, 2), "utf8");
        }
    };
}

function logResult(donation, res) {
    const tag = {
        issued: "발급완료", already: "이미발급", insufficient: "금액부족",
        "no-request": "수동확인", error: "오류", invalid: "무효"
    }[res.status] || res.status;
    console.log(`[${new Date().toISOString()}] [${tag}] don=${donation.id} ${res.detail}${res.loginId ? ` (id=${res.loginId})` : ""}`);
}

async function main() {
    const args = parseArgs(process.argv);
    if (!args.mode) {
        console.error("사용법: node run.js (--webhook | --file <경로> | --once '<json>') [--config <경로>]");
        process.exit(2);
    }
    const config = loadConfig(args.config);
    const adminPrivateKeyPem = readPem(config.adminPrivateKeyPath, "관리자 RSA");
    const signingPrivateKeyPem = readPem(config.signingPrivateKeyPath, "라이선스 서명 ECDSA");
    const client = new FirebaseRestClient(config);
    const statePath = resolveMaybeRelative(config.processedStatePath || path.join("tmp", "donation_auto_issuer_state.json"));
    const state = makeStateStore(statePath);

    const handle = async (donation) => {
        if (!donation || !donation.id) {
            return { status: "invalid", detail: "id 없음" };
        }
        if (state.has(donation.id)) {
            return { status: "already", detail: "이미 처리한 후원 id (멱등)", donationId: donation.id };
        }
        const res = await processDonation({
            donation, client, adminPrivateKeyPem, signingPrivateKeyPem, planMap: config.planMap
        });
        // issued/insufficient/no-request/already 모두 재시도 무한루프를 막기 위해 기록.
        // (insufficient/no-request 는 추가 후원/수동 처리 후 신청 상태로 재판단되므로 안전)
        state.mark(donation.id, { status: res.status, requestId: res.requestId, loginId: res.loginId });
        return res;
    };

    if (args.mode === "once") {
        const donation = JSON.parse(args.value);
        const res = await handle(donation);
        logResult(donation, res);
        return;
    }

    if (args.mode === "file") {
        const list = JSON.parse(fs.readFileSync(resolveMaybeRelative(args.value), "utf8"));
        for (const donation of (Array.isArray(list) ? list : [list])) {
            logResult(donation, await handle(donation));
        }
        return;
    }

    if (args.mode === "webhook") {
        const port = Number(config.webhookPort || 8137);
        const secret = String(config.webhookSecret || "");
        if (!secret) throw new Error("webhook 모드는 config.webhookSecret 가 필요합니다(HMAC 검증).");
        const server = http.createServer((req, res) => {
            if (req.method !== "POST" || req.url !== "/donation") {
                res.writeHead(404).end("not found");
                return;
            }
            const chunks = [];
            req.on("data", (c) => chunks.push(c));
            req.on("end", async () => {
                const raw = Buffer.concat(chunks);
                const sig = String(req.headers["x-signature"] || "");
                const expected = nodeCrypto.createHmac("sha256", secret).update(raw).digest("hex");
                const sigOk = sig.length === expected.length
                    && nodeCrypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
                if (!sigOk) {
                    res.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ ok: false, error: "서명 불일치" }));
                    return;
                }
                let donation;
                try { donation = JSON.parse(raw.toString("utf8")); } catch (e) {
                    res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ ok: false, error: "JSON 파싱 실패" }));
                    return;
                }
                try {
                    const result = await handle(donation);
                    logResult(donation, result);
                    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ ok: true, result }));
                } catch (err) {
                    console.error("처리 오류:", err);
                    res.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ ok: false, error: err.message }));
                }
            });
        });
        server.listen(port, "127.0.0.1", () => {
            console.log(`후원 자동 발급 수신기 대기: http://127.0.0.1:${port}/donation (HMAC-SHA256 서명 필요)`);
        });
        return;
    }
}

main().catch((err) => {
    console.error("실행 실패:", err.message);
    process.exit(1);
});
