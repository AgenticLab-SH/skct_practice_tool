# 2026-04-08 수동 구독 중복 신청 점검 및 승인 처리
작성일시: 2026-04-08 23:34:48 KST

사용자 요청: 현재 운영 `subscriptionRequests` 목록을 점검해 2명에게 여러 번 들어온 신청의 로직 이슈를 확인하고, 실제 승인 후 `고급 구독 내역` 반영까지 검증한다.

## 1. 확인한 실제 운영 데이터
- 운영 RTDB `subscriptionRequests`를 조회해 총 10건을 확인했다.
- 현재 복호화 가능한 최신 묶음은 2명 기준으로 아래와 같았다.
  - `ods1945@naver.com`: `REQ-MNPY4OLR-3GX6`, `REQ-MNPY94OC-CPZX`, `REQ-MNPY9CFK-HV1J`, `REQ-MNPY9MK8-S365`, `REQ-MNPYAO37-O84O`, `REQ-MNPYGTBA-B5Y4`
  - `mingyu7275@naver.com`: `REQ-MNQ2AWW8-KK10`, `REQ-MNQ2AXHH-A2NV`, `REQ-MNQ2I11P-IIXB`
- 별도 오래된 1건 `REQ-MNPSNTEB-GVLO`는 현재 신청 복호화 키로 열리지 않았다. 예전 키로 생성된 요청일 가능성이 높아 이번 중복 처리 대상에서는 제외했다.

## 2. 원인 점검
- `main.js`의 `submitManualSubscriptionRequest`는 기존에 아래 보호가 없었다.
  - 제출 중 중복 클릭 방지
  - 동일 브라우저에서 방금 보낸 같은 신청 재전송 방지
- 실제 운영 데이터 시각을 보면 `mingyu7275@naver.com`의 첫 두 건은 약 1초 이내, `ods1945@naver.com`도 짧은 간격으로 여러 번 누적되었다.
- 따라서 이번 중복은 서버 중복 생성보다 **프론트 제출 보호 부재** 영향이 크다고 판단했다.

## 3. 코드 수정
### 3.1 신청 중복 방지
- `main.js`
  - 제출 중에는 버튼을 잠그고 문구를 `신청 저장 중...`으로 변경
  - 최근 10분 안에 같은 브라우저에서 `플랜 + 후원명 + 닉네임 + 이메일 + 희망 ID + 시작일`이 같은 신청을 다시 보내면 차단
  - 이미 저장된 신청번호가 있으면 그 번호로 먼저 조회하라고 안내

### 3.2 승인 시 고급 구독 내역 동기화
- `admin.html`
  - 승인 처리 시 라이선스 발급만 하지 않고 `config/advancedFeatureConfig`도 같이 upsert
  - 신청 비밀번호로 `passwordSalt + passwordHash` 생성
  - 가능하면 관리자 메모리 비밀번호로 복구용 암호화 필드도 함께 저장하도록 유지
  - 승인 카드의 기본 만료일은 `오늘` 기준이 아니라 `신청자가 고른 시작일 + 이용권 일수` 기준으로 계산

## 4. 운영 처리 결정
- 최신 신청만 승인하고 이전 중복 신청은 `중복 신청`으로 반려하는 방식으로 정리했다.
- 승인
  - `REQ-MNPYGTBA-B5Y4` -> `ods1106`
  - `REQ-MNQ2I11P-IIXB` -> `mingyu7275`
- 반려
  - `REQ-MNPY4OLR-3GX6`
  - `REQ-MNPY94OC-CPZX`
  - `REQ-MNPY9CFK-HV1J`
  - `REQ-MNPY9MK8-S365`
  - `REQ-MNPYAO37-O84O`
  - `REQ-MNQ2AWW8-KK10`
  - `REQ-MNQ2AXHH-A2NV`

## 5. 운영 반영 방식
- 반영 전 백업:
  - `_backup/20260408_145500_manual_subscription_review/subscriptionRequests_before.json`
  - `_backup/20260408_145500_manual_subscription_review/advancedFeatureConfig_before.json`
- 처리용 산출물:
  - `_backup/20260408_145500_manual_subscription_review/ops/*.json`
  - `_backup/20260408_145500_manual_subscription_review/ops/advancedFeatureConfig_after.json`
  - `_backup/20260408_145500_manual_subscription_review/ops/summary.json`
- Firebase CLI로 아래 경로만 개별 반영했다.
  - `subscriptionRequests/<requestId>` 9건
  - `config/advancedFeatureConfig`

## 6. 검증 결과
- 운영 DB 재조회 결과
  - `subscriptionRequests/REQ-MNPYGTBA-B5Y4/status` = `fulfilled`
  - `subscriptionRequests/REQ-MNQ2I11P-IIXB/status` = `fulfilled`
  - `subscriptionRequests/REQ-MNPY4OLR-3GX6/status` = `rejected`
  - `config/advancedFeatureConfig.subscriptions.length` = `2`
- 사용자 경로 검증
  - 승인된 2건 모두 `requestPassword`로 사용자 복호화 성공
  - 두 신청 모두 `licensePublicKeyPem` 기준 라이선스 서명 검증 성공
  - 두 신청 모두 만료일 `2026-04-15` 확인
- 로컬 코드 검증
  - `node --check main.js` 통과
  - 로컬 `http://127.0.0.1:8787/admin.html` 로드 시 치명적 콘솔 오류 없음

## 7. 남은 메모
- 이번 승인 반영은 CLI 배치로 수행했기 때문에, 새로 생성된 `고급 구독 내역` 2건의 `passwordCipher*`는 비어 있다. 로그인에는 영향 없지만, 관리자 페이지에서 평문 비밀번호 즉시 확인은 불가능하다.
- 이후 동일 흐름을 관리자 페이지 버튼으로 처리하면 `currentAdminPassword`가 메모리에 있으므로 `passwordCipher*`도 같이 저장된다.

## 8. 후속 정리
- 관리자 페이지를 탭 구조로 재배치해 한 화면 길이를 줄였다.
  - `🔐 구독`
  - `⚙️ 기본 설정`
  - `📝 문구/공지`
  - `💬 커뮤니티`
  - `🧭 운영 개요`
- 빠른 이동 버튼은 이제 대상 카드가 있는 탭을 먼저 연 뒤 해당 위치로 스크롤한다.
- 키 안내 문구도 실제 표준 경로 기준으로 정리했다.
  - `C:\Users\kshcg\.codex\private\skct_tool\manual_subscription_request_private.pem`
  - `C:\Users\kshcg\.codex\private\skct_tool\manual_subscription_license_private.pem`
- 운영 HTTPS 관리자 페이지에서는 더 이상 로컬 키 브리지를 자동 시도하지 않는다. 기본 흐름은 `키 폴더 연결`이며, 로컬 브리지는 개발용 예비 기능으로만 남겼다.
- `고급 구독 내역`의 `확인` 버튼은 이제 관리자 암호문이 없는 계정이어도, 메모 안의 신청번호와 신청 복호화 키가 있으면 수동 신청 원본에서 비밀번호를 다시 보여줄 수 있다.
