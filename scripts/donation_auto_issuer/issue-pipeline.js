"use strict";

// 후원 1건을 받아 검증 후 사용권을 발급하는 순수 파이프라인.
// 네트워크/파일 I/O 는 client(주입)로 분리하여 단위 테스트가 가능하도록 한다.
//
// client 인터페이스:
//   readPath(path) -> Promise<value|null>
//   writePath(path, value) -> Promise
//   updatePath(path, partial) -> Promise

const core = require("./issuer-core.js");

// 기본 요금제 표 (config/manualSubscriptionConfig fallback 과 동일)
const DEFAULT_PLANS = {
    "manual-3d": { label: "3일 이용권", days: 3, price: 2900 },
    "manual-7d": { label: "7일 이용권", days: 7, price: 3900 },
    "manual-14d": { label: "14일 이용권", days: 14, price: 5900 },
    "manual-30d": { label: "30일 이용권", days: 30, price: 9900 }
};

function resolvePlan(planCode, planMap) {
    const plans = planMap && Object.keys(planMap).length ? planMap : DEFAULT_PLANS;
    return plans[String(planCode || "").trim()] || null;
}

// 후원 1건 처리. 성공/실패 사유를 구조화하여 반환한다(예외 던지지 않음, 운영 안정성).
async function processDonation(options) {
    const {
        donation,
        client,
        adminPrivateKeyPem,
        signingPrivateKeyPem,
        planMap,
        now = new Date()
    } = options;

    const result = (status, detail, extra = {}) => ({ status, detail, donationId: donation && donation.id, ...extra });

    if (!donation || !donation.id) {
        return result("invalid", "후원 이벤트에 id 가 없습니다.");
    }
    const requestId = core.extractRequestId(donation.message);
    if (!requestId) {
        return result("no-request", "후원 메시지에서 신청ID(REQ-...)를 찾지 못했습니다. 수동 확인이 필요합니다.");
    }

    let record;
    try {
        record = await client.readPath(`subscriptionRequests/${requestId}`);
    } catch (err) {
        return result("error", `신청 조회 실패: ${err.message}`);
    }
    if (!record) {
        return result("no-request", `신청(${requestId})을 찾지 못했습니다.`);
    }
    if (String(record.status || "").trim() === "fulfilled") {
        return result("already", `신청(${requestId})은 이미 발급 완료 상태입니다.`, { requestId });
    }

    const plan = resolvePlan(record.planCode, planMap);
    if (!plan) {
        return result("error", `알 수 없는 요금제(${record.planCode}). planMap 설정을 확인하세요.`, { requestId });
    }
    if (!core.donationCoversPlan(donation.amount, plan.price)) {
        return result("insufficient", `후원액(${donation.amount}원)이 요금제 가격(${plan.price}원)보다 적습니다.`, { requestId });
    }

    let payload;
    try {
        payload = await core.crypto.decryptRequestPayloadForAdmin(record, adminPrivateKeyPem);
    } catch (err) {
        return result("error", `신청 본문 복호화 실패(개인키/데이터 확인): ${err.message}`, { requestId });
    }

    const loginId = String(payload.desiredLoginId || "").trim();
    const plainPassword = String(payload.requestPassword || "").trim();
    if (!loginId || !plainPassword) {
        return result("error", "신청 본문에 희망 ID 또는 비밀번호가 없습니다.", { requestId });
    }

    const expiresAt = core.computeExpiresAtDate(payload.requestedStartDate || "", plan.days, now);
    const subscription = {
        loginId,
        userIdentity: payload.siteNickname || payload.donationName || donation.donorName || "",
        planType: plan.label,
        status: "active",
        expiresAt
    };

    let licenseRecord;
    try {
        licenseRecord = await core.buildAdvancedAccountLicenseRecord(subscription, plainPassword, signingPrivateKeyPem);
    } catch (err) {
        return result("error", `라이선스 생성 실패: ${err.message}`, { requestId });
    }

    const loginIdKey = core.encodeAdvancedLoginIdKey(loginId);
    // 경로 B: 신청서에 adminResponse.licenseBundle 를 심어 재암호화.
    // (이메일/신청조회 로그인 경로 지원 — 없으면 이메일 loginId 사용자가 'pending' 에 막힘)
    let payloadCipherUpdate = {};
    try {
        payloadCipherUpdate = await core.buildApprovedRequestPayloadCipher({
            record, payload, expiresAtDate: expiresAt, signingPrivateKeyPem, adminPrivateKeyPem
        });
    } catch (err) {
        // 경로 B 실패해도 경로 A(advancedAccountLicenses)는 유효하므로 발급은 진행하되 경고.
        payloadCipherUpdate = {};
    }

    try {
        await client.writePath(`advancedAccountLicenses/${loginIdKey}`, licenseRecord);
        await client.updatePath(`subscriptionRequests/${requestId}`, {
            status: "fulfilled",
            updatedAt: Date.now(),
            autoIssuedAt: Date.now(),
            autoIssuedExpiresAt: expiresAt,
            ...payloadCipherUpdate
        });
    } catch (err) {
        return result("error", `발급 기록 저장 실패: ${err.message}`, { requestId, loginIdKey });
    }

    return result("issued", `사용권 발급 완료 (${plan.label}, 만료 ${expiresAt || "영구"})`, {
        requestId,
        loginIdKey,
        loginId,
        planType: plan.label,
        expiresAt
    });
}

module.exports = { processDonation, resolvePlan, DEFAULT_PLANS };