"use strict";

// 후원 자동 사용권 발급 - 핵심 로직 (브라우저 관리자 페이지와 100% 동일한 레코드 생성)
//
// 이 모듈은 admin.html 의 다음 흐름을 서버/로컬 Node 에서 그대로 재현합니다.
//   buildAdvancedLicensePayloadForSubscription() -> signLicensePayload()
//   -> encryptJsonWithPassword() -> advancedAccountLicenses/$loginIdKey 레코드
//
// 암호화 상호운용을 보장하기 위해 프론트엔드와 동일한 subscription-crypto.js 를 그대로 재사용합니다.

const path = require("path");
const SKCTSubscriptionCrypto = require("./subscription-crypto.js");

const DEFAULT_ADVANCED_PLAN_TYPE = "14일 이용권";
const PERMANENT_ADVANCED_PLAN_TYPE = "영구 이용권";
const REQUEST_ID_PATTERN = /REQ-[A-Z0-9-]{8,40}/;

// admin.html / main.js 의 encodeAdvancedLoginIdKey 와 바이트 단위로 동일해야 합니다.
function encodeAdvancedLoginIdKey(value) {
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

// 후원 메시지에서 신청 ID(REQ-...) 추출
function extractRequestId(text) {
    const match = String(text || "").toUpperCase().match(REQUEST_ID_PATTERN);
    return match ? match[0] : "";
}

// 금액 비교: 후원액이 요금제 가격 이상이면 통과
function donationCoversPlan(amountKRW, planPriceKRW) {
    const amount = Number(amountKRW);
    const price = Number(planPriceKRW);
    if (!Number.isFinite(amount) || amount <= 0) return false;
    if (!Number.isFinite(price) || price <= 0) return false;
    return amount >= price;
}

function pad2(n) {
    return String(n).padStart(2, "0");
}

// 시작일(YYYY-MM-DD, 없으면 오늘 KST) + 이용 일수 -> 만료일(YYYY-MM-DD, KST 기준)
function computeExpiresAtDate(startDateStr, days, now = new Date()) {
    const dayCount = Number(days);
    let base;
    const trimmed = String(startDateStr || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        base = new Date(`${trimmed}T00:00:00+09:00`);
    } else {
        // 현재 시각을 KST 자정으로 정규화
        const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        base = new Date(Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()));
        base = new Date(base.getTime() - 9 * 60 * 60 * 1000);
        base = new Date(`${base.getUTCFullYear()}-${pad2(base.getUTCMonth() + 1)}-${pad2(base.getUTCDate())}T00:00:00+09:00`);
    }
    if (!Number.isFinite(dayCount) || dayCount <= 0) {
        return ""; // 영구
    }
    const expires = new Date(base.getTime() + dayCount * 24 * 60 * 60 * 1000);
    const kst = new Date(expires.getTime() + 9 * 60 * 60 * 1000);
    return `${kst.getUTCFullYear()}-${pad2(kst.getUTCMonth() + 1)}-${pad2(kst.getUTCDate())}`;
}

// admin.html 의 buildAdvancedLicensePayloadForSubscription 과 동일한 페이로드
function buildAdvancedLicensePayload(subscription) {
    const payload = {
        licenseId: (typeof crypto !== "undefined" && crypto.randomUUID)
            ? crypto.randomUUID()
            : `license-${Date.now()}`,
        source: "advanced-account",
        loginId: subscription.loginId || "",
        userIdentity: subscription.userIdentity || "",
        planType: subscription.planType || DEFAULT_ADVANCED_PLAN_TYPE,
        status: subscription.status || "active",
        issuedAt: Date.now()
    };
    if (subscription.expiresAt) {
        payload.expiresAt = `${subscription.expiresAt}T12:00:00+09:00`;
    }
    return payload;
}

// admin.html 의 buildEncryptedAdvancedAccountLicenseRecord 와 동일한 레코드
async function buildAdvancedAccountLicenseRecord(subscription, plainPassword, signingPrivateKeyPem) {
    if (!plainPassword) {
        throw new Error("사용자 비밀번호(plainPassword)가 없으면 로그인용 라이선스를 만들 수 없습니다.");
    }
    if (!signingPrivateKeyPem) {
        throw new Error("라이선스 서명 개인키(signingPrivateKeyPem)가 필요합니다.");
    }
    const licenseBundle = await SKCTSubscriptionCrypto.signLicensePayload(
        buildAdvancedLicensePayload(subscription),
        signingPrivateKeyPem
    );
    const encryptedBundle = await SKCTSubscriptionCrypto.encryptJsonWithPassword(licenseBundle, plainPassword);
    return {
        version: 1,
        loginId: subscription.loginId,
        status: subscription.status || "active",
        expiresAt: subscription.expiresAt || "",
        planType: subscription.planType || DEFAULT_ADVANCED_PLAN_TYPE,
        bundleCipher: encryptedBundle.cipher,
        bundleIv: encryptedBundle.iv,
        bundleSalt: encryptedBundle.salt,
        updatedAt: Date.now()
    };
}

// 경로 B: 신청서 payload 에 adminResponse.licenseBundle 를 넣어 재암호화.
// (admin.html approveSubscriptionRequest 와 동일 형태 — 이메일/신청조회 로그인 경로 지원)
// 반환: { payloadCipher, payloadIv } (subscriptionRequests update 에 머지)
async function buildApprovedRequestPayloadCipher(options) {
    const { record, payload, expiresAtDate, signingPrivateKeyPem, adminPrivateKeyPem, statusMessage } = options;
    const expiresAtIso = expiresAtDate ? `${expiresAtDate}T12:00:00+09:00` : "";
    const licenseBundle = await SKCTSubscriptionCrypto.signLicensePayload({
        licenseId: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `license-${Date.now()}`,
        requestId: record.requestId || "",
        planCode: record.planCode || "",
        planLabel: record.planLabel || "",
        desiredLoginId: payload.desiredLoginId || "",
        siteNickname: payload.siteNickname || "",
        email: payload.email || "",
        issuedAt: Date.now(),
        expiresAt: expiresAtIso
    }, signingPrivateKeyPem);
    const nextPayload = {
        ...payload,
        adminResponse: {
            expiresAt: expiresAtDate || "",
            licenseBundle,
            statusMessage: statusMessage || "자동 발급되었습니다.",
            approvedAt: Date.now()
        }
    };
    return SKCTSubscriptionCrypto.reencryptRequestPayloadForAdmin(record, nextPayload, adminPrivateKeyPem);
}

module.exports = {
    DEFAULT_ADVANCED_PLAN_TYPE,
    PERMANENT_ADVANCED_PLAN_TYPE,
    crypto: SKCTSubscriptionCrypto,
    encodeAdvancedLoginIdKey,
    extractRequestId,
    donationCoversPlan,
    computeExpiresAtDate,
    buildAdvancedLicensePayload,
    buildAdvancedAccountLicenseRecord,
    buildApprovedRequestPayloadCipher
};
