const { onRequest } = require("firebase-functions/v2/https");
const { onValueCreated } = require("firebase-functions/v2/database");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

initializeApp();

const db = getDatabase();
const rateLimitStore = new Map();
const ALLOWED_ORIGIN_PATTERNS = [
    /^https:\/\/agenticlab-sh\.github\.io$/i,
    /^https?:\/\/localhost(?::\d+)?$/i,
    /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i
];

function getAllowedOrigin(origin) {
    const normalized = String(origin || "").trim();
    if (!normalized) return "";
    return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(normalized)) ? normalized : "";
}

function applyCorsHeaders(req, res) {
    const allowedOrigin = getAllowedOrigin(req.headers.origin);
    if (allowedOrigin) {
        res.set("Access-Control-Allow-Origin", allowedOrigin);
        res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        res.set("Vary", "Origin");
    }
}

function readClientAddress(req) {
    const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    return forwarded || String(req.ip || "").trim() || "unknown";
}

function cleanupRateLimitStore(now) {
    for (const [key, bucket] of rateLimitStore.entries()) {
        const fresh = bucket.filter((value) => now - value < 10 * 60 * 1000);
        if (fresh.length) rateLimitStore.set(key, fresh);
        else rateLimitStore.delete(key);
    }
}

function isRateLimited(routeKey, clientAddress, limit, windowMs) {
    const now = Date.now();
    cleanupRateLimitStore(now);
    const bucketKey = `${routeKey}:${clientAddress}`;
    const current = rateLimitStore.get(bucketKey) || [];
    const fresh = current.filter((value) => now - value < windowMs);
    if (fresh.length >= limit) {
        rateLimitStore.set(bucketKey, fresh);
        return true;
    }
    fresh.push(now);
    rateLimitStore.set(bucketKey, fresh);
    return false;
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isHex64(value) {
    return /^[a-f0-9]{64}$/.test(String(value || "").trim());
}

function isRequestId(value) {
    return /^REQ-[A-Z0-9-]{8,40}$/.test(String(value || "").trim());
}

function isSafeNumber(value) {
    return Number.isFinite(value) && value >= 0;
}

function isShortString(value, maxLength = 256) {
    const normalized = String(value || "");
    return normalized.length > 0 && normalized.length <= maxLength;
}

function toAdvancedLoginIdKey(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized) return "";
    if (/^[a-z0-9_-]+$/.test(normalized)) {
        return normalized;
    }
    return `e~${Array.from(normalized).map((char) => (
        /[a-z0-9_-]/.test(char)
            ? char
            : `_${char.codePointAt(0).toString(16)}_`
    )).join("")}`;
}

function readJsonBody(req) {
    if (isPlainObject(req.body)) return req.body;
    if (typeof req.body === "string") {
        try {
            return JSON.parse(req.body);
        } catch (error) {
            return null;
        }
    }
    return null;
}

function sendJson(res, status, payload) {
    res.status(status).json(payload);
}

function validateSubscriptionWriteBody(body) {
    const requestId = String(body?.requestId || "").trim();
    const lookupKey = String(body?.lookupKey || "").trim();
    const record = body?.record;
    const lookupRecord = body?.lookupRecord;
    if (!isRequestId(requestId)) {
        return "requestId 형식이 올바르지 않습니다.";
    }
    if (!isHex64(lookupKey)) {
        return "lookupKey 형식이 올바르지 않습니다.";
    }
    if (!isPlainObject(record) || !isPlainObject(lookupRecord)) {
        return "record 또는 lookupRecord 형식이 올바르지 않습니다.";
    }
    if (String(record.requestId || "").trim() !== requestId) {
        return "record.requestId가 일치하지 않습니다.";
    }
    if (String(record.lookupEmailPasswordKey || "").trim() !== lookupKey) {
        return "record.lookupEmailPasswordKey가 일치하지 않습니다.";
    }
    if (String(record.status || "").trim() !== "pending") {
        return "record.status는 pending이어야 합니다.";
    }
    if (!isSafeNumber(record.createdAt) || !isSafeNumber(record.updatedAt)) {
        return "record 시간 값이 올바르지 않습니다.";
    }
    if (!isShortString(record.planCode, 40) || !isShortString(record.planLabel, 80)) {
        return "record 요금제 정보가 올바르지 않습니다.";
    }
    if (!isShortString(record.requesterMask, 32) || !isShortString(record.emailMask, 80) || !isShortString(record.donationMask, 32)) {
        return "record 마스킹 값이 올바르지 않습니다.";
    }
    if (!isSafeNumber(lookupRecord.createdAt) || String(lookupRecord.requestId || "").trim() !== requestId) {
        return "lookupRecord 형식이 올바르지 않습니다.";
    }
    if (!isShortString(record.payloadCipher, 20000) || !isShortString(record.payloadIv, 512) || !isShortString(record.userKeyCipher, 2048) || !isShortString(record.userKeyIv, 512) || !isShortString(record.userKeySalt, 512) || !isShortString(record.adminKeyCipher, 4096)) {
        return "암호화 필드 형식이 올바르지 않습니다.";
    }
    return "";
}

exports.skctSecureApi = onRequest(async (req, res) => {
    applyCorsHeaders(req, res);
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        sendJson(res, 405, { ok: false, errorMessage: "POST 요청만 허용됩니다." });
        return;
    }

    const route = String(req.path || "/").replace(/\/+$/, "") || "/";
    const body = readJsonBody(req);
    const clientAddress = readClientAddress(req);

    if (route === "/health") {
        sendJson(res, 200, { ok: true, service: "skctSecureApi" });
        return;
    }

    if (!body) {
        sendJson(res, 400, { ok: false, errorMessage: "JSON 본문을 읽지 못했습니다." });
        return;
    }

    try {
        if (route === "/subscription/request") {
            if (isRateLimited(route, clientAddress, 3, 10 * 60 * 1000)) {
                sendJson(res, 429, { ok: false, errorMessage: "신청 요청이 너무 많습니다. 잠시 후 다시 시도해주세요." });
                return;
            }
            const validationError = validateSubscriptionWriteBody(body);
            if (validationError) {
                sendJson(res, 400, { ok: false, errorMessage: validationError });
                return;
            }
            const requestId = String(body.requestId).trim();
            const lookupKey = String(body.lookupKey).trim();
            const requestRef = db.ref(`subscriptionRequests/${requestId}`);
            const lookupRef = db.ref(`subscriptionRequestLookup/${lookupKey}`);
            const [requestSnap, lookupSnap] = await Promise.all([requestRef.get(), lookupRef.get()]);
            if (requestSnap.exists() || lookupSnap.exists()) {
                sendJson(res, 409, { ok: false, errorMessage: "이미 처리된 신청이 있어 중복 저장을 막았습니다." });
                return;
            }
            await db.ref().update({
                [`subscriptionRequests/${requestId}`]: body.record,
                [`subscriptionRequestLookup/${lookupKey}`]: body.lookupRecord
            });
            sendJson(res, 200, { ok: true, requestId });
            return;
        }

        if (route === "/subscription/lookup") {
            if (isRateLimited(route, clientAddress, 20, 10 * 60 * 1000)) {
                sendJson(res, 429, { ok: false, errorMessage: "조회 요청이 너무 많습니다. 잠시 후 다시 시도해주세요." });
                return;
            }
            const lookupKey = String(body.lookupKey || "").trim();
            if (!isHex64(lookupKey)) {
                sendJson(res, 400, { ok: false, errorMessage: "lookupKey 형식이 올바르지 않습니다." });
                return;
            }
            const lookupSnap = await db.ref(`subscriptionRequestLookup/${lookupKey}`).get();
            if (!lookupSnap.exists()) {
                sendJson(res, 404, { ok: false, errorMessage: "해당 신청을 찾지 못했습니다." });
                return;
            }
            const requestId = String(lookupSnap.val()?.requestId || "").trim();
            if (!isRequestId(requestId)) {
                sendJson(res, 404, { ok: false, errorMessage: "연결된 신청 ID가 없습니다." });
                return;
            }
            sendJson(res, 200, { ok: true, requestId });
            return;
        }

        if (route === "/subscription/request-record") {
            if (isRateLimited(route, clientAddress, 20, 10 * 60 * 1000)) {
                sendJson(res, 429, { ok: false, errorMessage: "조회 요청이 너무 많습니다. 잠시 후 다시 시도해주세요." });
                return;
            }
            const requestId = String(body.requestId || "").trim();
            if (!isRequestId(requestId)) {
                sendJson(res, 400, { ok: false, errorMessage: "requestId 형식이 올바르지 않습니다." });
                return;
            }
            const requestSnap = await db.ref(`subscriptionRequests/${requestId}`).get();
            if (!requestSnap.exists()) {
                sendJson(res, 404, { ok: false, errorMessage: "해당 신청을 찾지 못했습니다." });
                return;
            }
            sendJson(res, 200, { ok: true, requestId, record: requestSnap.val() });
            return;
        }

        if (route === "/advanced/license") {
            if (isRateLimited(route, clientAddress, 20, 10 * 60 * 1000)) {
                sendJson(res, 429, { ok: false, errorMessage: "조회 요청이 너무 많습니다. 잠시 후 다시 시도해주세요." });
                return;
            }
            const loginIdKey = toAdvancedLoginIdKey(body.loginIdKey || body.loginId || "");
            if (!isShortString(loginIdKey, 240)) {
                sendJson(res, 400, { ok: false, errorMessage: "loginIdKey 형식이 올바르지 않습니다." });
                return;
            }
            const licenseSnap = await db.ref(`advancedAccountLicenses/${loginIdKey}`).get();
            if (!licenseSnap.exists()) {
                sendJson(res, 404, { ok: false, errorMessage: "해당 고급 계정을 찾지 못했습니다." });
                return;
            }
            sendJson(res, 200, { ok: true, record: licenseSnap.val() });
            return;
        }

        sendJson(res, 404, { ok: false, errorMessage: "지원하지 않는 경로입니다." });
    } catch (error) {
        console.error("[skctSecureApi]", route, error);
        sendJson(res, 500, { ok: false, errorMessage: "보안 API 처리 중 오류가 발생했습니다." });
    }
});

// =============================================================================
// 신규 고급 구독 신청 알림 (운영자 텔레그램)
// =============================================================================
// subscriptionRequests/<id> 가 새로 생성되면 운영자 폰으로 텔레그램 알림을 보낸다.
// 24/7 서버리스(Google 인프라)에서 동작하므로 로컬 PC/GitHub Pages 와 무관하게 항상 작동.
// 민감정보는 보내지 않는다(마스크 필드만). 신청 본문 복호화는 하지 않음(개인키 미보유).
//
// 배포 전 시크릿 설정 필요:
//   firebase functions:secrets:set TELEGRAM_BOT_TOKEN
//   firebase functions:secrets:set TELEGRAM_CHAT_ID
//   firebase deploy --only functions
const TELEGRAM_BOT_TOKEN = defineSecret("TELEGRAM_BOT_TOKEN");
const TELEGRAM_CHAT_ID = defineSecret("TELEGRAM_CHAT_ID");

exports.notifyNewSubscriptionRequest = onValueCreated(
    {
        ref: "/subscriptionRequests/{requestId}",
        instance: "skct-tool-default-rtdb",
        secrets: [TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID]
    },
    async (event) => {
        try {
            const token = TELEGRAM_BOT_TOKEN.value();
            const chatId = TELEGRAM_CHAT_ID.value();
            if (!token || !chatId) {
                console.warn("[notifyNewSubscriptionRequest] 텔레그램 시크릿 미설정 - 알림 건너뜀");
                return;
            }
            const r = (event.data && event.data.val()) || {};
            const requestId = event.params.requestId;
            const created = r.createdAt ? new Date(r.createdAt).toISOString().replace("T", " ").slice(0, 16) + " UTC" : "-";
            const text = [
                "🔔 새 고급 구독 신청이 들어왔습니다",
                `신청번호: ${requestId}`,
                `플랜: ${r.planLabel || r.planCode || "?"}`,
                `신청자(마스크): ${r.requesterMask || "?"} / ${r.emailMask || "?"}`,
                `시각: ${created}`,
                "",
                "관리자 페이지에서 승인하세요."
            ].join("\n");
            const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
            });
            if (!resp.ok) {
                const body = await resp.text().catch(() => "");
                console.error("[notifyNewSubscriptionRequest] 텔레그램 전송 실패:", resp.status, body);
            } else {
                console.log("[notifyNewSubscriptionRequest] 알림 전송 완료:", requestId);
            }
        } catch (error) {
            console.error("[notifyNewSubscriptionRequest] 오류:", error.message);
        }
    }
);
