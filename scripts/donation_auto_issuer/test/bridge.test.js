"use strict";

// 투네이션 브리지 순수 함수 테스트 (네트워크 불필요)
//   - extractPayload(): 위젯 페이지 HTML 에서 payload 추출
//   - parseToonationMessage(): 소켓 메시지 -> 정규화 후원 이벤트

const assert = require("assert");
const { extractPayload, parseToonationMessage } = require("../toonation-bridge.js");

let passed = 0;
function check(name, fn) {
    fn();
    console.log(`  ok - ${name}`);
    passed += 1;
}

// --- extractPayload ---------------------------------------------------------
check("현재 포맷: window.payload = JSON.parse(...) 의 .payload 추출", () => {
    // 실제 위젯과 동일하게 내부 따옴표가 \u0022 로 이스케이프된 형태
    const inner = '{\\u0022uid\\u0022:\\u0022abc\\u0022,\\u0022payload\\u0022:\\u0022eyJhdXRoIjoiYWJjIn0\\u0022,\\u0022cm\\u0022:true}';
    const html = `<script>"use strict";window.payload = JSON.parse("${inner}");Object.freeze(window.payload);</script>`;
    assert.strictEqual(extractPayload(html), "eyJhdXRoIjoiYWJjIn0");
});

check("구 포맷 폴백: \"payload\":\"...\" 직접 노출", () => {
    const html = `<html><head><script>var x={"key":1,"payload":"AbC123-_payload","other":true};</script></head></html>`;
    assert.strictEqual(extractPayload(html), "AbC123-_payload");
});

check("payload 가 없으면 빈 문자열", () => {
    const html = `<html><script>var x={"nope":1};</script></html>`;
    assert.strictEqual(extractPayload(html), "");
});

check("공백이 섞인 구 포맷 payload 도 추출", () => {
    const html = `<script>{ "payload" : "ZZ99" }</script>`;
    assert.strictEqual(extractPayload(html), "ZZ99");
});

// --- parseToonationMessage --------------------------------------------------
check("후원 content 를 정규화", () => {
    const raw = JSON.stringify({
        content: { account: "donor01", name: "홍길동", amount: 10000, message: "화이팅 REQ-AB12CD34" }
    });
    const d = parseToonationMessage(raw);
    assert.strictEqual(d.donorName, "홍길동");
    assert.strictEqual(d.amount, 10000);
    assert.strictEqual(d.message, "화이팅 REQ-AB12CD34");
    assert.ok(d.id && d.id.length > 0, "id 가 생성되어야 함");
});

check("명시 id 가 있으면 그대로 사용", () => {
    const raw = JSON.stringify({ content: { id: "tx-777", name: "A", amount: 5000, message: "" } });
    assert.strictEqual(parseToonationMessage(raw).id, "tx-777");
});

check("동일 내용은 동일 id(멱등) 로 안정 해시", () => {
    const c = { account: "a", name: "B", amount: 4900, message: "REQ-XXXXYYYY" };
    const a = parseToonationMessage(JSON.stringify({ content: c }));
    const b = parseToonationMessage(JSON.stringify({ content: c }));
    assert.strictEqual(a.id, b.id);
});

check("content 가 JSON 문자열로 와도 파싱", () => {
    const raw = JSON.stringify({ content: JSON.stringify({ name: "C", amount: 7900, message: "REQ-1234ABCD" }) });
    const d = parseToonationMessage(raw);
    assert.strictEqual(d.amount, 7900);
    assert.strictEqual(d.message, "REQ-1234ABCD");
});

check("후원 아님(핸드셰이크/하트비트)은 null", () => {
    assert.strictEqual(parseToonationMessage(JSON.stringify({ type: "ping" })), null);
    assert.strictEqual(parseToonationMessage("not-json"), null);
    assert.strictEqual(parseToonationMessage(JSON.stringify({ content: 123 })), null);
});

console.log(`All ${passed} checks passed.`);
