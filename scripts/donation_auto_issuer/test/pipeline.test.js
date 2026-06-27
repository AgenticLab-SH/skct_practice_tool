"use strict";

// 종단 검증: 실제 암호화된 구독 신청을 만든 뒤, 후원 이벤트를 흘려보내
// processDonation 이 advancedAccountLicenses 레코드를 올바르게 발급하고
// 신청을 fulfilled 로 표시하는지, 그리고 브라우저 경로로 복호화/검증되는지 확인한다.
//
// 실행: node scripts/donation_auto_issuer/test/pipeline.test.js

const assert = require("assert");
const core = require("../issuer-core.js");
const { processDonation } = require("../issue-pipeline.js");
const cryptoApi = core.crypto;

let passed = 0;
function ok(name) { passed += 1; console.log(`  ok - ${name}`); }

// 메모리 기반 가짜 Firebase client
function makeFakeClient(seed = {}) {
    const store = JSON.parse(JSON.stringify(seed));
    const get = (p) => p.split("/").reduce((acc, k) => (acc == null ? acc : acc[k]), store);
    return {
        store,
        async readPath(p) { return get(p) ?? null; },
        async writePath(p, v) {
            const keys = p.split("/");
            let node = store;
            for (let i = 0; i < keys.length - 1; i += 1) {
                node[keys[i]] = node[keys[i]] || {};
                node = node[keys[i]];
            }
            node[keys[keys.length - 1]] = v;
        },
        async updatePath(p, partial) {
            const cur = get(p) || {};
            const merged = { ...cur, ...partial };
            await this.writePath(p, merged);
        }
    };
}

async function main() {
    const adminKeys = await cryptoApi.generateAdminKeyPairPem();      // RSA-OAEP (신청 복호화용)
    const licenseKeys = await cryptoApi.generateLicenseKeyPairPem();  // ECDSA (라이선스 서명용)

    const requestId = "REQ-TEST1234";
    const requestPassword = "유저비번-tiger7";
    const requestPayload = {
        desiredLoginId: "buyer_김철수",
        requestPassword,
        siteNickname: "철수",
        email: "buyer@example.com",
        requestedStartDate: "2026-07-01"
    };
    const encrypted = await cryptoApi.encryptRequestPayload(requestPayload, requestPassword, adminKeys.publicKeyPem);
    const requestRecord = {
        requestId,
        planCode: "manual-14d",
        planLabel: "14일 이용권",
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...encrypted
    };

    const client = makeFakeClient({ subscriptionRequests: { [requestId]: requestRecord } });

    // 1) 정상 후원: 금액 충분 + 메시지에 신청ID 포함
    const res = await processDonation({
        donation: { id: "don-1", donorName: "익명", amount: 10000, message: `후원합니다 ${requestId}` },
        client,
        adminPrivateKeyPem: adminKeys.privateKeyPem,
        signingPrivateKeyPem: licenseKeys.privateKeyPem
    });
    assert.strictEqual(res.status, "issued", `발급 성공이어야 함 (got ${res.status}: ${res.detail})`);
    assert.strictEqual(res.expiresAt, "2026-07-15", "2026-07-01 + 14일 = 2026-07-15");
    ok("정상 후원 -> 사용권 발급");

    // 2) 신청이 fulfilled 로 표시됨
    const updatedReq = client.store.subscriptionRequests[requestId];
    assert.strictEqual(updatedReq.status, "fulfilled", "신청 status=fulfilled");
    assert.ok(updatedReq.autoIssuedAt, "autoIssuedAt 기록");
    ok("신청이 fulfilled 로 표시됨");

    // 3) 발급된 레코드가 브라우저 경로로 복호화/검증됨
    const loginIdKey = core.encodeAdvancedLoginIdKey("buyer_김철수");
    const issued = client.store.advancedAccountLicenses[loginIdKey];
    assert.ok(issued && issued.bundleCipher, "라이선스 레코드 존재");
    const bundle = await cryptoApi.decryptJsonWithPassword(
        { cipher: issued.bundleCipher, iv: issued.bundleIv, salt: issued.bundleSalt },
        requestPassword
    );
    const verified = await cryptoApi.verifyLicenseBundle(bundle, licenseKeys.publicKeyPem);
    assert.strictEqual(verified, true, "발급 라이선스가 공개키로 검증됨");
    assert.strictEqual(bundle.payload.loginId, "buyer_김철수", "payload.loginId 일치");
    ok("발급 레코드가 브라우저 검증 경로 통과");

    // 4) 같은 후원 재처리 -> already (멱등 방어, 신청이 이미 fulfilled)
    const resAgain = await processDonation({
        donation: { id: "don-1b", donorName: "익명", amount: 10000, message: `후원합니다 ${requestId}` },
        client,
        adminPrivateKeyPem: adminKeys.privateKeyPem,
        signingPrivateKeyPem: licenseKeys.privateKeyPem
    });
    assert.strictEqual(resAgain.status, "already", "이미 발급된 신청은 already");
    ok("이미 발급된 신청 재처리 거부(already)");

    // 5) 금액 부족
    const reqId2 = "REQ-TEST5678";
    const enc2 = await cryptoApi.encryptRequestPayload(
        { ...requestPayload, desiredLoginId: "buyer_low" }, requestPassword, adminKeys.publicKeyPem
    );
    client.store.subscriptionRequests[reqId2] = { requestId: reqId2, planCode: "manual-14d", status: "pending", createdAt: Date.now(), updatedAt: Date.now(), ...enc2 };
    const resLow = await processDonation({
        donation: { id: "don-2", donorName: "x", amount: 3000, message: `${reqId2}` },
        client, adminPrivateKeyPem: adminKeys.privateKeyPem, signingPrivateKeyPem: licenseKeys.privateKeyPem
    });
    assert.strictEqual(resLow.status, "insufficient", "금액 부족은 insufficient");
    ok("금액 부족 후원 거부(insufficient)");

    // 6) 신청ID 없는 메시지
    const resNo = await processDonation({
        donation: { id: "don-3", donorName: "x", amount: 10000, message: "그냥 응원해요" },
        client, adminPrivateKeyPem: adminKeys.privateKeyPem, signingPrivateKeyPem: licenseKeys.privateKeyPem
    });
    assert.strictEqual(resNo.status, "no-request", "신청ID 없으면 no-request");
    ok("신청ID 없는 후원 -> 수동확인(no-request)");

    console.log(`\nAll ${passed} checks passed.`);
}

main().catch((err) => {
    console.error("TEST FAILED:", err);
    process.exit(1);
});
