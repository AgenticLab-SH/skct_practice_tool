#!/usr/bin/env node
"use strict";

// 만료된 고급 라이선스 정리 배치 (운영 위생용)
//
// 참고: 고급 로그인은 이미 "서명된 payload 의 expiresAt" 으로 만료를 강제하므로
//       (main.js verifyAdvancedLicenseBundle: expiryTime < Date.now() -> 거부),
//       만료 라이선스가 남아 있어도 접근은 막힌다. 이 배치는 DB 위생/관리자 가시성을
//       위해 만료 레코드의 status 를 "expired" 로 표시(비활성)하는 housekeeping 이다.
//
// 사용:
//   node expire-licenses.js            # dry-run: 만료 대상만 출력(쓰기 없음)
//   node expire-licenses.js --apply    # 실제로 status=expired 로 표시
//   node expire-licenses.js --config <경로>
//
// 안전: 영구 라이선스(expiresAt 빈 값/영구 플랜)는 절대 만료 처리하지 않는다.
//       로그인 검증과 동일한 임계(expiresAt T23:59:59+09:00, 종료일 자정 직전)를 사용한다.

const fs = require("fs");
const path = require("path");
const { FirebaseRestClient } = require("./firebase-rest.js");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const PERMANENT_PLAN = "영구 이용권";

// 로그인 검증과 동일한 만료 임계: expiresAt(YYYY-MM-DD) 의 KST 종료일 끝(자정 직전 23:59:59).
// 반환: 만료되었으면 true (순수 함수, 테스트 대상)
function isLicenseExpired(record, now = new Date()) {
    if (!record || typeof record !== "object") return false;
    const expiresAt = String(record.expiresAt || "").trim();
    const planType = String(record.planType || "").trim();
    if (!expiresAt || planType === PERMANENT_PLAN) return false; // 영구
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) return false;     // 형식 불명 -> 건드리지 않음
    const threshold = Date.parse(`${expiresAt}T23:59:59+09:00`);
    if (!Number.isFinite(threshold)) return false;
    return now.getTime() >= threshold;
}

function needsExpireMark(record, now) {
    if (!isLicenseExpired(record, now)) return false;
    return String(record.status || "").trim().toLowerCase() !== "expired";
}

function parseArgs(argv) {
    const args = { apply: false, config: null };
    for (let i = 2; i < argv.length; i += 1) {
        if (argv[i] === "--apply") args.apply = true;
        else if (argv[i] === "--config") args.config = argv[++i];
    }
    return args;
}

function loadConfig(explicitPath) {
    const candidate = explicitPath
        || process.env.SKCT_ISSUER_CONFIG
        || path.join(PROJECT_ROOT, "private", "donation-auto-issuer.config.json");
    if (!fs.existsSync(candidate)) {
        throw new Error(`설정 파일을 찾지 못했습니다: ${candidate}`);
    }
    return JSON.parse(fs.readFileSync(candidate, "utf8"));
}

async function main() {
    const args = parseArgs(process.argv);
    const config = loadConfig(args.config);
    const client = new FirebaseRestClient(config);
    const now = new Date();

    const all = await client.readPath("advancedAccountLicenses");
    if (!all || typeof all !== "object") {
        console.log("정리할 라이선스가 없습니다.");
        return;
    }

    const targets = Object.entries(all).filter(([, rec]) => needsExpireMark(rec, now));
    if (targets.length === 0) {
        console.log(`만료 표시가 필요한 라이선스가 없습니다. (전체 ${Object.keys(all).length}건 점검)`);
        return;
    }

    console.log(`만료 대상 ${targets.length}건${args.apply ? " (적용)" : " (dry-run - 쓰기 없음)"}:`);
    for (const [key, rec] of targets) {
        console.log(`  - ${key} (loginId=${rec.loginId || "?"}, expiresAt=${rec.expiresAt}, status=${rec.status || "?"})`);
        if (args.apply) {
            await client.updatePath(`advancedAccountLicenses/${key}`, { status: "expired", updatedAt: Date.now() });
        }
    }
    if (!args.apply) console.log("실제 반영하려면 --apply 를 붙여 다시 실행하세요.");
    else console.log("완료: 만료 라이선스를 status=expired 로 표시했습니다.");
}

if (require.main === module) {
    main().catch((err) => { console.error("실행 실패:", err.message); process.exit(1); });
}

module.exports = { isLicenseExpired, needsExpireMark };
