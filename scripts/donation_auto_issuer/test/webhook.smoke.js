"use strict";

// 러너(run.js --webhook) 스모크 테스트: 임시 키/설정으로 서버를 띄우고
// HMAC 서명 검증, 신청ID 없는 메시지 처리(no-request), 멱등(already) 을 확인한다.
// Firebase 네트워크 없이 동작(신청ID 없으면 네트워크 호출 전에 결론).
//
// 실행: node scripts/donation_auto_issuer/test/webhook.smoke.js

const assert = require("assert");
const os = require("os");
const fs = require("fs");
const path = require("path");
const nodeCrypto = require("crypto");
const { spawn } = require("child_process");
const core = require("../issuer-core.js");

const PORT = 8231;
const SECRET = "smoke-secret-1234567890";

function sign(raw) {
    return nodeCrypto.createHmac("sha256", SECRET).update(raw).digest("hex");
}

async function post(body, sig) {
    const raw = JSON.stringify(body);
    const res = await fetch(`http://127.0.0.1:${PORT}/donation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-signature": sig === undefined ? sign(raw) : sig },
        body: raw
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function main() {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "skct-issuer-smoke-"));
    const adminKeys = await core.crypto.generateAdminKeyPairPem();
    const licenseKeys = await core.crypto.generateLicenseKeyPairPem();
    const adminPath = path.join(tmp, "admin.pem");
    const signPath = path.join(tmp, "license.pem");
    fs.writeFileSync(adminPath, adminKeys.privateKeyPem);
    fs.writeFileSync(signPath, licenseKeys.privateKeyPem);
    const statePath = path.join(tmp, "state.json");
    const configPath = path.join(tmp, "config.json");
    fs.writeFileSync(configPath, JSON.stringify({
        apiKey: "test-key",
        databaseURL: "https://example-rtdb.firebaseio.com",
        email: "test@example.com",
        password: "test-pw",
        adminPrivateKeyPath: adminPath,
        signingPrivateKeyPath: signPath,
        webhookPort: PORT,
        webhookSecret: SECRET,
        processedStatePath: statePath
    }));

    const child = spawn(process.execPath, [path.join(__dirname, "..", "run.js"), "--webhook", "--config", configPath], { stdio: "pipe" });
    let ready = false;
    child.stdout.on("data", (d) => { if (String(d).includes("수신기 대기")) ready = true; });
    child.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));

    for (let i = 0; i < 50 && !ready; i += 1) { await new Promise((r) => setTimeout(r, 100)); }
    assert.ok(ready, "웹훅 서버가 기동되어야 함");

    let passed = 0;
    const ok = (n) => { passed += 1; console.log(`  ok - ${n}`); };

    try {
        // 1) 잘못된 서명 -> 401
        const bad = await post({ id: "s1", donorName: "x", amount: 10000, message: "no ref" }, "deadbeef");
        assert.strictEqual(bad.status, 401, "잘못된 서명은 401");
        ok("HMAC 서명 불일치 거부(401)");

        // 2) 올바른 서명 + 신청ID 없음 -> 200 no-request
        const noref = await post({ id: "s2", donorName: "x", amount: 10000, message: "그냥 응원" });
        assert.strictEqual(noref.status, 200, "정상 서명은 200");
        assert.strictEqual(noref.data.result.status, "no-request", "신청ID 없으면 no-request");
        ok("정상 서명 + 신청ID 없음 -> no-request");

        // 3) 같은 id 재전송 -> already (멱등)
        const again = await post({ id: "s2", donorName: "x", amount: 10000, message: "그냥 응원" });
        assert.strictEqual(again.data.result.status, "already", "같은 id 재처리는 already");
        ok("동일 후원 id 멱등 처리(already)");
    } finally {
        child.kill();
        fs.rmSync(tmp, { recursive: true, force: true });
    }

    console.log(`\nAll ${passed} checks passed.`);
}

main().catch((err) => { console.error("SMOKE FAILED:", err); process.exit(1); });
