"use strict";

// 운영자 알림 순수 함수 테스트 (네트워크 불필요)
const assert = require("assert");
const { shouldNotify, buildNotificationMessage, DEFAULT_NOTIFY_EVENTS } = require("../notify.js");

let passed = 0;
function check(name, fn) { fn(); console.log(`  ok - ${name}`); passed += 1; }

const tg = { telegram: { botToken: "x", chatId: "y" } };
const hook = { webhookUrl: "https://example.com/hook" };

check("채널이 없으면 알림 안 함", () => {
    assert.strictEqual(shouldNotify({ status: "error" }, {}), false);
    assert.strictEqual(shouldNotify({ status: "error" }, null), false);
});

check("기본 이벤트(issued/insufficient/no-request/error)는 알림", () => {
    for (const s of DEFAULT_NOTIFY_EVENTS) {
        assert.strictEqual(shouldNotify({ status: s }, tg), true, `${s} 는 알림 대상`);
    }
});

check("already/invalid 는 기본 알림 제외", () => {
    assert.strictEqual(shouldNotify({ status: "already" }, hook), false);
    assert.strictEqual(shouldNotify({ status: "invalid" }, hook), false);
});

check("events 를 커스텀하면 그 목록만 알림", () => {
    const cfg = { ...hook, events: ["issued"] };
    assert.strictEqual(shouldNotify({ status: "issued" }, cfg), true);
    assert.strictEqual(shouldNotify({ status: "error" }, cfg), false);
});

check("telegram 은 token+chatId 둘 다 있어야 채널 인정", () => {
    assert.strictEqual(shouldNotify({ status: "issued" }, { telegram: { botToken: "x" } }), false);
});

check("메시지에 후원ID/신청/상태가 포함되고 비밀번호는 없음", () => {
    const msg = buildNotificationMessage(
        { id: "don-1", amount: 4900, message: "REQ-AB12CD34 비밀:secret" },
        { status: "issued", requestId: "REQ-AB12CD34", loginId: "tester", detail: "발급 완료" }
    );
    assert.ok(msg.includes("don-1"), "후원ID 포함");
    assert.ok(msg.includes("REQ-AB12CD34"), "신청ID 포함");
    assert.ok(msg.includes("4900"), "금액 포함");
    assert.ok(msg.includes("tester"), "로그인ID 포함");
    assert.ok(!msg.includes("secret"), "원문 메시지(비밀번호 등)는 포함하지 않음");
});

console.log(`All ${passed} checks passed.`);
