"use strict";

// 자동발급 결과 운영자 알림 (선택 기능, 무의존성)
//
// 설정(private/donation-auto-issuer.config.json)에 notify 섹션이 있으면 동작한다.
//   "notify": {
//     "events": ["issued", "insufficient", "no-request", "error"],   // 생략 시 기본값
//     "telegram": { "botToken": "...", "chatId": "..." },             // 선택
//     "webhookUrl": "https://..."                                      // 선택(범용 POST {text})
//   }
// telegram/webhookUrl 중 설정된 것으로만 보낸다. 둘 다 없으면 알림은 비활성.
// 네트워크 오류는 자동발급 본 흐름을 막지 않도록 절대 throw 하지 않는다(best-effort).

const DEFAULT_NOTIFY_EVENTS = ["issued", "insufficient", "no-request", "error"];

const STATUS_LABEL = {
    issued: "✅ 발급완료",
    insufficient: "⚠️ 금액부족",
    "no-request": "❓ 수동확인필요",
    error: "❌ 오류",
    already: "↺ 이미발급",
    invalid: "⛔ 무효"
};

// 알림을 보낼 상태인지 판정 (순수 함수)
function shouldNotify(result, notifyConfig) {
    if (!notifyConfig) return false;
    const hasChannel = Boolean(notifyConfig.webhookUrl)
        || Boolean(notifyConfig.telegram && notifyConfig.telegram.botToken && notifyConfig.telegram.chatId);
    if (!hasChannel) return false;
    const events = Array.isArray(notifyConfig.events) && notifyConfig.events.length
        ? notifyConfig.events
        : DEFAULT_NOTIFY_EVENTS;
    return events.includes(result && result.status);
}

// 알림 메시지 본문 생성 (순수 함수) - 민감정보(비밀번호/평문) 미포함
function buildNotificationMessage(donation, result) {
    const label = STATUS_LABEL[result.status] || result.status;
    const lines = [
        `[SKCT 자동발급] ${label}`,
        `후원ID: ${donation && donation.id ? donation.id : "-"}`
    ];
    if (donation && Number.isFinite(Number(donation.amount))) lines.push(`금액: ${Number(donation.amount)}원`);
    if (result.requestId) lines.push(`신청: ${result.requestId}`);
    if (result.loginId) lines.push(`로그인ID: ${result.loginId}`);
    if (result.detail) lines.push(`내용: ${result.detail}`);
    return lines.join("\n");
}

// best-effort 전송 (throw 하지 않음)
async function sendNotification(notifyConfig, message) {
    if (typeof fetch !== "function") return { ok: false, skipped: "no-fetch" };
    const tasks = [];
    if (notifyConfig.telegram && notifyConfig.telegram.botToken && notifyConfig.telegram.chatId) {
        const url = `https://api.telegram.org/bot${notifyConfig.telegram.botToken}/sendMessage`;
        tasks.push(fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: notifyConfig.telegram.chatId, text: message })
        }).catch((e) => ({ ok: false, error: e.message })));
    }
    if (notifyConfig.webhookUrl) {
        tasks.push(fetch(notifyConfig.webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message })
        }).catch((e) => ({ ok: false, error: e.message })));
    }
    try {
        await Promise.all(tasks);
        return { ok: true, channels: tasks.length };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// donation+result 를 받아 조건 충족 시 알림 (best-effort). run.js 에서 호출.
async function notifyResult(notifyConfig, donation, result) {
    try {
        if (!shouldNotify(result, notifyConfig)) return { ok: false, skipped: "filtered" };
        return await sendNotification(notifyConfig, buildNotificationMessage(donation, result));
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

module.exports = {
    DEFAULT_NOTIFY_EVENTS,
    shouldNotify,
    buildNotificationMessage,
    sendNotification,
    notifyResult
};
