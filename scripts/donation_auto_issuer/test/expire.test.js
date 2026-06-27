"use strict";

// 만료 라이선스 정리 순수 함수 테스트 (네트워크 불필요)
const assert = require("assert");
const { isLicenseExpired, needsExpireMark } = require("../expire-licenses.js");

let passed = 0;
function check(name, fn) { fn(); console.log(`  ok - ${name}`); passed += 1; }

const NOW = new Date("2026-06-28T03:00:00+09:00");

check("영구(expiresAt 빈 값)는 만료 아님", () => {
    assert.strictEqual(isLicenseExpired({ expiresAt: "", planType: "영구 이용권" }, NOW), false);
    assert.strictEqual(isLicenseExpired({ expiresAt: "" }, NOW), false);
});

check("미래 만료일은 만료 아님", () => {
    assert.strictEqual(isLicenseExpired({ expiresAt: "2026-07-10" }, NOW), false);
});

check("과거 만료일은 만료", () => {
    assert.strictEqual(isLicenseExpired({ expiresAt: "2026-06-20" }, NOW), true);
});

check("만료일 당일 정오 경계", () => {
    // 임계 = 2026-06-28T12:00:00+09:00, NOW=03:00 KST -> 아직 만료 아님
    assert.strictEqual(isLicenseExpired({ expiresAt: "2026-06-28" }, NOW), false);
    const afterNoon = new Date("2026-06-28T12:30:00+09:00");
    assert.strictEqual(isLicenseExpired({ expiresAt: "2026-06-28" }, afterNoon), true);
});

check("형식 불명 expiresAt 은 건드리지 않음", () => {
    assert.strictEqual(isLicenseExpired({ expiresAt: "곧" }, NOW), false);
});

check("이미 expired 상태면 재표시 불필요", () => {
    assert.strictEqual(needsExpireMark({ expiresAt: "2026-06-20", status: "expired" }, NOW), false);
    assert.strictEqual(needsExpireMark({ expiresAt: "2026-06-20", status: "active" }, NOW), true);
});

console.log(`All ${passed} checks passed.`);
