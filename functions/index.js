const { onRequest } = require("firebase-functions/v2/https");
const { onValueCreated } = require("firebase-functions/v2/database");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const { getAuth } = require("firebase-admin/auth");
const issuerCore = require("./issuer-core.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

initializeApp();

const db = getDatabase();
const rateLimitStore = new Map();
const TELEGRAM_BOT_TOKEN = defineSecret("TELEGRAM_BOT_TOKEN");
const TELEGRAM_CHAT_ID = defineSecret("TELEGRAM_CHAT_ID");
const TELEGRAM_WEBHOOK_SECRET = defineSecret("TELEGRAM_WEBHOOK_SECRET");
const ADMIN_RSA_PRIVATE_KEY = defineSecret("ADMIN_RSA_PRIVATE_KEY");
const LICENSE_SIGNING_PRIVATE_KEY = defineSecret("LICENSE_SIGNING_PRIVATE_KEY");
const EMAIL_USER = defineSecret("EMAIL_USER");
const EMAIL_APP_PASSWORD = defineSecret("EMAIL_APP_PASSWORD");
const ADMIN_ALLOWED_EMAIL = "zhdlsqpdj@gmail.com";
const ALLOWED_ORIGIN_PATTERNS = [
    /^https:\/\/agenticlab-sh\.github\.io$/i,
    /^https:\/\/([a-z0-9-]+\.)*agenticfabworks\.com$/i,
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
        res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
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

function sha256Hex(value) {
    return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function formatKstDateTime(value) {
    const date = value ? new Date(value) : new Date();
    if (!Number.isFinite(date.getTime())) return "-";
    const parts = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).formatToParts(date).reduce((acc, part) => {
        if (part.type !== "literal") acc[part.type] = part.value;
        return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} KST`;
}

// 타이밍 공격 완화를 위한 상수시간 hex 비교
function safeHexEqual(a, b) {
    const bufA = Buffer.from(String(a || ""), "utf8");
    const bufB = Buffer.from(String(b || ""), "utf8");
    if (bufA.length !== bufB.length) return false;
    try {
        return crypto.timingSafeEqual(bufA, bufB);
    } catch (error) {
        return false;
    }
}

function isPostId(value) {
    // RTDB push 키(-로 시작, 20자) 또는 영숫자 키 허용
    return /^[A-Za-z0-9_-]{1,64}$/.test(String(value || "").trim());
}

function isCommunityContent(value) {
    const normalized = String(value || "");
    return normalized.trim().length > 0 && normalized.length <= 1000;
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

async function verifyFirebaseAuthRequest(req) {
    const header = String(req.get("Authorization") || "").trim();
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        const error = new Error("관리자 로그인 토큰이 필요합니다.");
        error.status = 401;
        throw error;
    }
    try {
        const decoded = await getAuth().verifyIdToken(match[1]);
        if (String(decoded.email || "").trim().toLowerCase() !== ADMIN_ALLOWED_EMAIL) {
            const error = new Error("허용된 관리자 계정이 아닙니다.");
            error.status = 403;
            throw error;
        }
        return decoded;
    } catch (cause) {
        if (cause && cause.status) throw cause;
        const error = new Error("관리자 로그인 토큰을 확인하지 못했습니다.");
        error.status = 401;
        throw error;
    }
}

function normalizeOptionalDate(value) {
    const normalized = String(value || "").trim();
    if (!normalized) return "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        const error = new Error("만료일은 YYYY-MM-DD 형식이어야 합니다.");
        error.status = 400;
        throw error;
    }
    return normalized;
}

function formatExpiryForEmail(expiresAt) {
    const normalized = String(expiresAt || "").trim();
    if (!normalized) return "영구";
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        return `${normalized} 23:59 KST`;
    }
    return normalized;
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

exports.skctSecureApi = onRequest(
    { secrets: [ADMIN_RSA_PRIVATE_KEY, LICENSE_SIGNING_PRIVATE_KEY, EMAIL_USER, EMAIL_APP_PASSWORD] },
    async (req, res) => {
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
        if (route === "/admin/subscription/approve" || route === "/admin/subscription/reject") {
            if (isRateLimited(route, clientAddress, 30, 10 * 60 * 1000)) {
                sendJson(res, 429, { ok: false, errorMessage: "관리자 처리 요청이 너무 많습니다. 잠시 후 다시 시도해주세요." });
                return;
            }
            const decoded = await verifyFirebaseAuthRequest(req);
            const requestId = String(body.requestId || "").trim();
            if (!isRequestId(requestId)) {
                sendJson(res, 400, { ok: false, errorMessage: "requestId 형식이 올바르지 않습니다." });
                return;
            }
            const statusMessage = isShortString(body.statusMessage || " ", 300)
                ? String(body.statusMessage || "").trim()
                : "";
            const handledBy = decoded.email || decoded.uid || "firebase-auth-admin";
            const result = route.endsWith("/approve")
                ? await approveRequest(requestId, {
                    expiresAt: normalizeOptionalDate(body.expiresAt),
                    statusMessage,
                    approvedBy: handledBy
                })
                : await rejectRequest(requestId, {
                    statusMessage,
                    rejectedBy: handledBy
                });
            sendJson(res, result.ok ? 200 : 400, { ok: Boolean(result.ok), message: result.msg, ...result });
            return;
        }

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

        // =====================================================================
        // 커뮤니티 익명 글/댓글 수정·삭제 (서버측 비밀번호 검증)
        // 클라이언트에서만 비번을 보던 과거 구조는 우회 가능했음.
        // 이제 평문 비번을 HTTPS로 받아 서버가 저장된 해시와 대조한 뒤에만 쓰기.
        // =====================================================================
        if (route === "/community/post/edit" || route === "/community/post/delete"
            || route === "/community/reply/edit" || route === "/community/reply/delete") {
            if (isRateLimited("community/mutate", clientAddress, 30, 10 * 60 * 1000)) {
                sendJson(res, 429, { ok: false, errorMessage: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." });
                return;
            }

            const postId = String(body.postId || "").trim();
            const password = String(body.password || "");
            if (!isPostId(postId)) {
                sendJson(res, 400, { ok: false, errorMessage: "게시글 ID 형식이 올바르지 않습니다." });
                return;
            }
            if (!password) {
                sendJson(res, 400, { ok: false, errorMessage: "비밀번호가 필요합니다." });
                return;
            }

            const isReply = route.startsWith("/community/reply/");
            const isEdit = route.endsWith("/edit");

            let targetPath;
            if (isReply) {
                const replyId = String(body.replyId || "").trim();
                if (!isPostId(replyId)) {
                    sendJson(res, 400, { ok: false, errorMessage: "댓글 ID 형식이 올바르지 않습니다." });
                    return;
                }
                targetPath = `replies/${postId}/${replyId}`;
            } else {
                targetPath = `posts/${postId}`;
            }

            const targetRef = db.ref(targetPath);
            const snap = await targetRef.get();
            if (!snap.exists()) {
                sendJson(res, 404, { ok: false, errorMessage: "대상을 찾지 못했습니다." });
                return;
            }
            const current = snap.val() || {};
            if (current.deleted === true) {
                sendJson(res, 410, { ok: false, errorMessage: "이미 삭제된 글입니다." });
                return;
            }

            // 관리자 답변/관리자 작성 글은 익명 비번 경로로 수정·삭제 불가
            if (current.isAdmin === true || !isHex64(current.passwordHash)) {
                sendJson(res, 403, { ok: false, errorMessage: "이 글은 비밀번호로 수정·삭제할 수 없습니다." });
                return;
            }
            if (!safeHexEqual(sha256Hex(password), current.passwordHash)) {
                sendJson(res, 403, { ok: false, errorMessage: "비밀번호가 일치하지 않습니다." });
                return;
            }

            if (isEdit) {
                const newContent = String(body.content || "");
                if (!isCommunityContent(newContent)) {
                    sendJson(res, 400, { ok: false, errorMessage: "내용은 1~1000자여야 합니다." });
                    return;
                }
                await targetRef.update({ content: newContent.trim(), editedAt: Date.now() });
                sendJson(res, 200, { ok: true, action: "edit" });
                return;
            }

            // soft delete
            await targetRef.update({ deleted: true, deletedAt: Date.now() });
            if (isReply) {
                await db.ref(`posts/${postId}/replyCount`).transaction((c) => Math.max((c || 0) - 1, 0));
            }
            sendJson(res, 200, { ok: true, action: "delete" });
            return;
        }

        sendJson(res, 404, { ok: false, errorMessage: "지원하지 않는 경로입니다." });
    } catch (error) {
        console.error("[skctSecureApi]", route, error);
        sendJson(res, error.status || 500, { ok: false, errorMessage: error.status ? error.message : "보안 API 처리 중 오류가 발생했습니다." });
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
// --- 이메일 알림 시크릿 ------------------------------------------------------
// 구독 신청 시 텔레그램과 병행으로 운영자 메일함에도 알림을 보낸다.
// Gmail SMTP + 앱 비밀번호 사용. 시크릿 미설정 시 메일은 조용히 건너뛴다.
//   firebase functions:secrets:set EMAIL_USER          (보내는 Gmail 주소)
//   firebase functions:secrets:set EMAIL_APP_PASSWORD  (Gmail 앱 비밀번호 16자)
// 알림 수신 주소(운영자 메일함). 고정값.
const NOTIFY_EMAIL_TO = "zhdlsqpdj@gmail.com";
const SUPPORT_EMAIL = "zhdlsqpdj@gmail.com";
const PUBLIC_ADMIN_PAGE_URL = "https://skct.agenticfabworks.com/admin/";
const DEFAULT_MANUAL_PLANS = [
    { code: "manual-3d", label: "3일 이용권", days: 3, price: 2900 },
    { code: "manual-7d", label: "7일 이용권", days: 7, price: 3900 },
    { code: "manual-14d", label: "14일 이용권", days: 14, price: 5900 },
    { code: "manual-30d", label: "30일 이용권", days: 30, price: 9900 }
];

// --- Telegram API helpers ---------------------------------------------------
async function tg(token, method, payload) {
    const resp = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    const data = await resp.json().catch(() => ({}));
    if (!data.ok) console.error(`[tg:${method}]`, resp.status, data.description || "");
    return data;
}

function buildRequestNotifyText(requestId, r) {
    const created = r.createdAt ? formatKstDateTime(r.createdAt) : "-";
    return [
        "🔔 새 고급 구독 신청이 들어왔습니다",
        `신청번호: ${requestId}`,
        `플랜: ${r.planLabel || r.planCode || "?"}`,
        `신청자(마스크): ${r.requesterMask || "?"} / ${r.emailMask || "?"}`,
        `시각: ${created}`,
        "",
        "아래 버튼으로 승인/거절하세요. (후원 확인 후 승인)"
    ].join("\n");
}

// --- 이메일 알림 helper -----------------------------------------------------
// 텔레그램과 병행으로 운영자 메일함에 신규 신청 알림을 보낸다.
// 민감정보(실명/이메일 전체/ID/비밀번호)는 보내지 않고 마스크 필드만 담는다.
async function sendSubscriptionEmail(requestId, r) {
    const user = EMAIL_USER.value();
    const pass = EMAIL_APP_PASSWORD.value();
    if (!user || !pass) {
        console.warn("[sendSubscriptionEmail] 이메일 시크릿 미설정 - 메일 건너뜀");
        return;
    }
    const created = r.createdAt ? formatKstDateTime(r.createdAt) : "-";
    const planText = r.planLabel || r.planCode || "?";
    const requesterText = `${r.requesterMask || "?"} / ${r.emailMask || "?"}`;
    const adminUrl = `${PUBLIC_ADMIN_PAGE_URL}?subscriptionRequest=${encodeURIComponent(requestId)}`;
    const lines = [
        "새 고급 구독 신청이 들어왔습니다.",
        "",
        `신청번호: ${requestId}`,
        `플랜: ${planText}`,
        `신청자(마스크): ${requesterText}`,
        `시각: ${created}`,
        "",
        "승인/거절은 텔레그램 알림 버튼 또는 아래 관리자 페이지에서 처리하세요. (후원 확인 후 승인)",
        adminUrl
    ];
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
    });
    await transporter.sendMail({
        from: `"SKCT 구독 알림" <${user}>`,
        to: NOTIFY_EMAIL_TO,
        subject: `[SKCT] 새 고급 구독 신청 (${planText})`,
        text: lines.join("\n")
    });
    console.log("[sendSubscriptionEmail] 메일 전송 완료:", requestId);
}

async function sendSubscriptionApprovalEmail({ requestId, payload, planLabel, loginId, expiresAt }) {
    const user = EMAIL_USER.value();
    const pass = EMAIL_APP_PASSWORD.value();
    const to = String(payload && payload.email || "").trim();
    if (!user || !pass || !to) {
        console.warn("[sendSubscriptionApprovalEmail] 이메일 시크릿 또는 수신 이메일 없음 - 메일 건너뜀");
        return;
    }
    const lines = [
        "고급 구독 신청이 승인되었습니다.",
        "",
        `신청번호: ${requestId}`,
        `이용권: ${planLabel || "-"}`,
        `로그인 ID: ${loginId || "-"}`,
        `만료일: ${formatExpiryForEmail(expiresAt)}`,
        "",
        "구독 신청 때 사용한 ID와 PW로 고급 모드에 로그인해 주세요.",
        `불편한 점은 언제든지 ${SUPPORT_EMAIL}으로 문의해주시기 바랍니다.`
    ];
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
    });
    await transporter.sendMail({
        from: `"SKCT 구독 알림" <${user}>`,
        to,
        subject: `[SKCT] 고급 구독 승인 완료 (${planLabel || "이용권"})`,
        text: lines.join("\n")
    });
    console.log("[sendSubscriptionApprovalEmail] 메일 전송 완료:", requestId);
}

exports.notifyNewSubscriptionRequest = onValueCreated(
    {
        ref: "/subscriptionRequests/{requestId}",
        instance: "skct-tool-default-rtdb",
        secrets: [TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, EMAIL_USER, EMAIL_APP_PASSWORD]
    },
    async (event) => {
        const r = (event.data && event.data.val()) || {};
        const requestId = event.params.requestId;
        // 자동 생성된 테스트/내부 항목이 아닌 실제 pending 신청만 알림
        if (String(r.status || "") !== "pending") return;

        // 텔레그램 알림 (승인/거절 버튼 포함)
        try {
            const token = TELEGRAM_BOT_TOKEN.value();
            const chatId = TELEGRAM_CHAT_ID.value();
            if (!token || !chatId) {
                console.warn("[notifyNewSubscriptionRequest] 텔레그램 시크릿 미설정 - 알림 건너뜀");
            } else {
                await tg(token, "sendMessage", {
                    chat_id: chatId,
                    text: buildRequestNotifyText(requestId, r),
                    disable_web_page_preview: true,
                    reply_markup: {
                        inline_keyboard: [[
                            { text: "✅ 승인", callback_data: `approve:${requestId}` },
                            { text: "❌ 거절", callback_data: `reject:${requestId}` }
                        ]]
                    }
                });
                console.log("[notifyNewSubscriptionRequest] 텔레그램 알림 전송 완료:", requestId);
            }
        } catch (error) {
            console.error("[notifyNewSubscriptionRequest] 텔레그램 오류:", error.message);
        }

        // 이메일 알림 (텔레그램과 독립적으로 시도)
        try {
            await sendSubscriptionEmail(requestId, r);
        } catch (error) {
            console.error("[notifyNewSubscriptionRequest] 이메일 오류:", error.message);
        }
    }
);

// --- 승인/거절 처리(공용) ---------------------------------------------------
async function approveRequest(requestId, options = {}) {
    const rsaPem = ADMIN_RSA_PRIVATE_KEY.value();
    const signPem = LICENSE_SIGNING_PRIVATE_KEY.value();
    if (!rsaPem || !signPem) throw new Error("개인키 시크릿 미설정");
    const reqRef = db.ref(`subscriptionRequests/${requestId}`);
    const record = (await reqRef.get()).val();
    if (!record) return { ok: false, msg: "신청을 찾지 못했습니다." };
    if (String(record.status || "") === "fulfilled") return { ok: false, msg: "이미 승인된 신청입니다." };

    const payload = await issuerCore.crypto.decryptRequestPayloadForAdmin(record, rsaPem);
    const loginId = String(payload.desiredLoginId || "").trim();
    const pw = String(payload.requestPassword || "").trim();
    if (!loginId || !pw) return { ok: false, msg: "신청 본문에 ID/비밀번호가 없습니다." };

    // 요금제 일수
    const msc = (await db.ref("config/manualSubscriptionConfig").get()).val() || {};
    const plansRaw = msc.plans || [];
    const remotePlans = Array.isArray(plansRaw) ? plansRaw : Object.values(plansRaw);
    const plans = DEFAULT_MANUAL_PLANS.map((fallback) => ({
        ...fallback,
        ...(remotePlans.find((p) => p && p.code === fallback.code) || {})
    }));
    const plan = plans.find((p) => p && p.code === record.planCode);
    const days = plan ? Number(plan.days) : 14;
    const planLabel = record.planLabel || (plan && plan.label) || "14일 이용권";
    const expiresAt = String(options.expiresAt || "").trim() || issuerCore.computeExpiresAtDate(payload.requestedStartDate || "", days);
    const statusMessage = String(options.statusMessage || "").trim() || "승인되었습니다.";

    // 경로 A
    const subscription = { loginId, userIdentity: payload.siteNickname || payload.donationName || "", planType: planLabel, status: "active", expiresAt };
    const licenseRecord = await issuerCore.buildAdvancedAccountLicenseRecord(subscription, pw, signPem);
    const loginIdKey = issuerCore.encodeAdvancedLoginIdKey(loginId);
    await db.ref(`advancedAccountLicenses/${loginIdKey}`).set(licenseRecord);

    // 경로 B
    const enc = await issuerCore.buildApprovedRequestPayloadCipher({
        record, payload, expiresAtDate: expiresAt, signingPrivateKeyPem: signPem, adminPrivateKeyPem: rsaPem, statusMessage
    });
    const now = Date.now();
    await reqRef.update({
        status: "fulfilled",
        updatedAt: now,
        tgApprovedAt: now,
        serverApprovedAt: now,
        serverApprovedBy: options.approvedBy || null,
        manualIssuedExpiresAt: expiresAt,
        payloadCipher: enc.payloadCipher,
        payloadIv: enc.payloadIv
    });
    try {
        await sendSubscriptionApprovalEmail({ requestId, payload, planLabel, loginId, expiresAt });
    } catch (error) {
        console.error("[approveRequest] 승인 이메일 오류:", error.message);
    }
    return { ok: true, msg: `승인 완료: ${loginId} / 만료 ${expiresAt}`, loginId, expiresAt };
}

async function rejectRequest(requestId, options = {}) {
    const rsaPem = ADMIN_RSA_PRIVATE_KEY.value();
    if (!rsaPem) throw new Error("개인키 시크릿 미설정");
    const reqRef = db.ref(`subscriptionRequests/${requestId}`);
    const record = (await reqRef.get()).val();
    if (!record) return { ok: false, msg: "신청을 찾지 못했습니다." };
    const payload = await issuerCore.crypto.decryptRequestPayloadForAdmin(record, rsaPem);
    const statusMessage = String(options.statusMessage || "").trim() || "후원 확인이 필요해 거절되었습니다.";
    const now = Date.now();
    const nextPayload = { ...payload, adminResponse: { ...(payload.adminResponse || {}), statusMessage, rejectedAt: now } };
    const enc = await issuerCore.crypto.reencryptRequestPayloadForAdmin(record, nextPayload, rsaPem);
    await reqRef.update({
        status: "rejected",
        updatedAt: now,
        serverRejectedAt: now,
        serverRejectedBy: options.rejectedBy || null,
        payloadCipher: enc.payloadCipher,
        payloadIv: enc.payloadIv
    });
    return { ok: true, msg: "거절 처리 완료" };
}

// --- 텔레그램 콜백 웹훅 (승인/거절 버튼) ------------------------------------
exports.telegramApprovalWebhook = onRequest(
    { secrets: [TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_WEBHOOK_SECRET, ADMIN_RSA_PRIVATE_KEY, LICENSE_SIGNING_PRIVATE_KEY, EMAIL_USER, EMAIL_APP_PASSWORD] },
    async (req, res) => {
        try {
            if (req.get("X-Telegram-Bot-Api-Secret-Token") !== TELEGRAM_WEBHOOK_SECRET.value()) {
                res.status(403).send("forbidden");
                return;
            }
            const token = TELEGRAM_BOT_TOKEN.value();
            const cq = req.body && req.body.callback_query;
            if (!cq) { res.status(200).send("ok"); return; }

            // 소유자(허용된 chatId)만 승인 가능
            if (String(cq.from && cq.from.id) !== String(TELEGRAM_CHAT_ID.value())) {
                await tg(token, "answerCallbackQuery", { callback_query_id: cq.id, text: "권한이 없습니다.", show_alert: true });
                res.status(200).send("ok");
                return;
            }

            const [action, requestId] = String(cq.data || "").split(":");
            let result;
            if (action === "approve") result = await approveRequest(requestId);
            else if (action === "reject") result = await rejectRequest(requestId);
            else result = { ok: false, msg: "알 수 없는 동작" };

            await tg(token, "answerCallbackQuery", { callback_query_id: cq.id, text: result.msg.slice(0, 190), show_alert: true });
            if (cq.message) {
                const base = (cq.message.text || "").split("\n\n")[0];
                const stamp = formatKstDateTime(Date.now());
                await tg(token, "editMessageText", {
                    chat_id: cq.message.chat.id,
                    message_id: cq.message.message_id,
                    text: `${base}\n\n${result.ok ? "✅" : "⚠️"} ${result.msg}\n(${stamp})`
                });
            }
            res.status(200).send("ok");
        } catch (error) {
            console.error("[telegramApprovalWebhook] 오류:", error.message);
            res.status(200).send("ok"); // 텔레그램 재시도 폭주 방지
        }
    }
);

// =============================================================================
// stale active_visitors 세션 정리 (예약 함수)
// =============================================================================
// 비정상 종료(탭 강제 종료/네트워크 끊김) 시 onDisconnect 가 동작하지 못하면
// active_visitors/<sessionId> 노드가 남는다. 표시 카운트는 클라이언트가
// 150초 신선도로 거르므로 영향 없지만, 노드가 무한 누적되면 읽기 비용/DB 가
// 커진다. 24시간(86400000ms)보다 오래된 하트비트를 주기적으로 제거한다.
exports.cleanupStaleVisitors = onSchedule(
    { schedule: "every 6 hours", timeZone: "Asia/Seoul", region: "us-central1" },
    async () => {
        const STALE_MS = 24 * 60 * 60 * 1000; // 24시간
        const cutoff = Date.now() - STALE_MS;
        const ref = db.ref("active_visitors");
        const snap = await ref.get();
        if (!snap.exists()) {
            console.log("[cleanupStaleVisitors] active_visitors 비어 있음");
            return;
        }
        const updates = {};
        let removed = 0;
        let kept = 0;
        snap.forEach((child) => {
            const value = child.val();
            // 숫자(타임스탬프)가 아니거나 cutoff 보다 오래된 노드는 제거
            if (typeof value !== "number" || value < cutoff) {
                updates[child.key] = null;
                removed += 1;
            } else {
                kept += 1;
            }
        });
        if (removed > 0) {
            await ref.update(updates);
        }
        console.log(`[cleanupStaleVisitors] 제거 ${removed}건 / 유지 ${kept}건`);
    }
);
