"use strict";

// 상호운용 검증: Node 자동 발급기가 만든 advancedAccountLicenses 레코드를
// 브라우저(main.js)의 검증 경로와 동일하게 복호화/서명검증하여 호환을 증명한다.
//
// 브라우저 advanced 로그인 흐름(main.js):
//   record.bundleCipher 를 사용자 비밀번호로 복호화(decryptJsonWithPassword)
//   -> licenseBundle -> verifyLicenseBundle(bundle, licensePublicKeyPem)
//
// 실행: node scripts/donation_auto_issuer/test/interop.test.js

const assert = require("assert");
const core = require("../issuer-core.js");
const cryptoApi = core.crypto;

let passed = 0;
function ok(name) { passed += 1; console.log(`  ok - ${name}`); }

async function main() {
    // 1) 라이선스 서명 키쌍 생성 (관리자가 보유하는 ECDSA P-256)
    const { publicKeyPem, privateKeyPem } = await cryptoApi.generateLicenseKeyPairPem();

    // 2) 후원 자동 발급 시뮬레이션 입력
    const plainPassword = "사용자가-정한-비밀번호-9animal";
    const subscription = {
        loginId: "buyer_홍길동01",
        userIdentity: "홍길동",
        planType: "14일 이용권",
        status: "active",
        expiresAt: core.computeExpiresAtDate("", 14)
    };

    // 3) Node 발급기로 레코드 생성
    const record = await core.buildAdvancedAccountLicenseRecord(subscription, plainPassword, privateKeyPem);

    // 4) 레코드 형태 검증 (admin.html 과 동일 필드)
    assert.strictEqual(record.version, 1, "version=1");
    assert.ok(record.bundleCipher && record.bundleIv && record.bundleSalt, "암호화 필드 존재");
    assert.strictEqual(record.loginId, subscription.loginId, "loginId 보존");
    assert.strictEqual(record.planType, "14일 이용권", "planType 보존");
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(record.expiresAt), "expiresAt YYYY-MM-DD 형식");
    ok("레코드 구조가 admin.html 포맷과 일치");

    // 5) 브라우저 복호화 경로 재현: 비밀번호로 번들 복호화
    const decryptedBundle = await cryptoApi.decryptJsonWithPassword(
        { cipher: record.bundleCipher, iv: record.bundleIv, salt: record.bundleSalt },
        plainPassword
    );
    assert.ok(decryptedBundle && decryptedBundle.payload && decryptedBundle.signature, "복호화된 번들에 payload/signature 존재");
    assert.strictEqual(decryptedBundle.payload.source, "advanced-account", "payload.source");
    assert.strictEqual(decryptedBundle.payload.loginId, subscription.loginId, "payload.loginId");
    ok("사용자 비밀번호로 번들 복호화 성공");

    // 6) 브라우저 서명검증 경로 재현: 공개키로 ECDSA 검증
    const verified = await cryptoApi.verifyLicenseBundle(decryptedBundle, publicKeyPem);
    assert.strictEqual(verified, true, "verifyLicenseBundle == true");
    ok("공개키로 ECDSA 서명 검증 성공 (브라우저가 수락)");

    // 7) 잘못된 비밀번호는 복호화 실패해야 함
    let wrongFailed = false;
    try {
        await cryptoApi.decryptJsonWithPassword(
            { cipher: record.bundleCipher, iv: record.bundleIv, salt: record.bundleSalt },
            "틀린-비밀번호"
        );
    } catch (e) {
        wrongFailed = true;
    }
    assert.strictEqual(wrongFailed, true, "틀린 비밀번호는 복호화 실패");
    ok("틀린 비밀번호 복호화 거부");

    // 8) 다른 키로 서명검증 실패해야 함 (위조 방지)
    const other = await cryptoApi.generateLicenseKeyPairPem();
    const verifiedWrong = await cryptoApi.verifyLicenseBundle(decryptedBundle, other.publicKeyPem);
    assert.strictEqual(verifiedWrong, false, "다른 공개키로는 검증 실패");
    ok("위조 서명(다른 키) 거부");

    // 9) 보조 유틸 검증
    assert.strictEqual(core.extractRequestId("후원합니다 REQ-AB12CD34 화이팅"), "REQ-AB12CD34", "requestId 추출");
    assert.strictEqual(core.donationCoversPlan(7900, 7900), true, "금액 동일 통과");
    assert.strictEqual(core.donationCoversPlan(5000, 7900), false, "금액 부족 거부");
    assert.strictEqual(core.encodeAdvancedLoginIdKey("Buyer_홍길동01"), core.encodeAdvancedLoginIdKey("buyer_홍길동01"), "loginIdKey 소문자 정규화");
    ok("보조 유틸(금액/요청ID/키인코딩) 동작");

    console.log(`\nAll ${passed} checks passed.`);
}

main().catch((err) => {
    console.error("TEST FAILED:", err);
    process.exit(1);
});
