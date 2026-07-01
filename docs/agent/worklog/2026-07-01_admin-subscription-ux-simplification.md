# 관리자 구독 처리 UX 단순화

- 일시: 2026-07-01 KST
- 요청: 관리자 페이지에서 키 설명 영역이 너무 크고, 복호화 버튼 위치를 찾기 어렵다는 피드백 반영.
- 변경:
  - 구독 신청 관리 상단을 `처리 순서 -> 승인 대기 목록 -> 요금/키/백업 설정` 순서로 재배치.
  - 복호화 버튼을 미열람 신청에서는 기본 파란 버튼으로 표시.
  - 요금, 키, 백업 설정은 기본 닫힘 `details` 영역으로 이동.
  - 로컬 개인키 설명을 서버 복호화/Google 관리자 세션 기준 문구로 정리.
- 검증:
  - `http://127.0.0.1:8787/admin/?v=admin-ux-local` HTTP 200 확인.
  - `http://127.0.0.1:8787/admin.css?v=admin-ux-local` HTTP 200 확인.
  - in-app Browser 로컬 관리자 로그인 화면 로드 및 콘솔 오류 없음 확인.
  - 임시 HTTP 미리보기에서 처리 순서, 승인 대기 목록, 고급 설정 접힘, 복호화 버튼 표시 확인.
  - 고급 설정 클릭 전 닫힘, 클릭 후 열림, 요금 입력 표시 확인.
  - 모바일 390px 폭에서 가로 넘침 없음 확인.
- 반영 범위:
  - 로컬 파일만 수정. 운영 배포는 하지 않음.

## 2026-07-02 예전 관리자 비밀번호 복구 입력

- 요청: 예전 관리자 비밀번호를 찾으면 기존 암호문 계정도 복구 가능한지 확인.
- 변경:
  - 고급 구독 내역에 `예전 관리자 비밀번호` 입력칸 추가.
  - `기존 비밀번호 보강 저장` 실행 시 입력값을 `passwordCipher` 복호화 키로 사용.
  - 신청번호가 있는 계정은 신청 원본으로, 신청번호가 없지만 예전 암호문이 있는 계정은 입력한 관리자 비밀번호로 복구 시도.
  - 입력값이 틀리거나 복구 재료가 없는 항목은 실패 건으로 안내.
- 검증:
  - 관리자 모듈 스크립트 `node --check` 통과.
  - `legacyAdminPasswordInput` 양쪽 관리자 파일 존재 확인.
  - `http://127.0.0.1:8787/admin/?v=legacy-password-input-local` HTTP 200 확인.
- 반영 범위:
  - 로컬 파일만 수정. 운영 배포는 하지 않음.

## 2026-07-02 기존 구독 계정 평문 보강

- 요청: 이전 구독 계정들도 복구 가능한 비밀번호를 평문으로 저장할 수 있는지 확인 및 반영.
- 변경:
  - 고급 구독 내역 상단에 `기존 비밀번호 보강 저장` 버튼 추가.
  - 신청번호가 연결된 기존 구독 계정은 신청 원본에서 비밀번호를 읽어 평문 칸에 채운 뒤 `config/advancedFeatureConfig.plainPassword`로 저장.
  - 이미 평문이 있거나 화면에 비밀번호가 채워진 계정은 그대로 저장.
  - 신청번호도 없고 예전 관리자 비밀번호로만 암호화된 계정은 자동 복구 실패 건으로 안내.
- 검증:
  - 관리자 모듈 스크립트 `node --check` 통과.
  - `admin.html`과 `admin/index.html`은 `<base href="../">` 차이만 남는 것 확인.
  - `http://127.0.0.1:8787/admin/?v=plaintext-migrate-local` HTTP 200 확인.
  - in-app Browser DOM에서 `advancedSubscriptionPlaintextMigrateBtn` 존재와 버튼 문구 확인.
- 반영 범위:
  - 로컬 파일만 수정. 운영 배포는 하지 않음.

## 2026-07-02 추가 변경

- 요청: 구독 목록과 신청 목록을 관리자 화면에서 평문으로 바로 볼 수 있게 변경. 복호화 버튼 제거.
- 변경:
  - 신청 목록 로드 시 관리자 세션으로 신청 본문을 자동 확인하고, 화면에는 ID/비밀번호/알림 이메일을 바로 표시.
  - `복호화` 작업 버튼을 제거하고, 실패 시에만 `다시 불러오기` 버튼 표시.
  - 구독 계정 비밀번호 입력칸을 기본 평문 표시로 변경.
  - 관리자 전용 `config/advancedFeatureConfig`에 `plainPassword`를 저장해 다음 접속 때도 구독 목록 비밀번호가 바로 보이도록 변경.
  - 공개 로그인용 `advancedAccountLicenses`에는 평문 비밀번호를 저장하지 않고 기존 암호화 번들 구조 유지.
  - 자동 평문 표시 상태에서도 승인/반려는 서버 API 경로를 우선 사용하도록 조건 수정.
- 검증:
  - 관리자 모듈 스크립트 `node --check` 통과.
  - `data-request-act="decrypt"`, `>복호화<`, `복호화 버튼` 잔여 노출 없음 확인.
  - `http://127.0.0.1:8787/admin/?v=plain-list-local` HTTP 200 확인.
  - in-app Browser에서 `http://127.0.0.1:8787/admin/?v=plain-lists-local` 로드 및 콘솔 오류 없음 확인.
- 반영 범위:
  - 로컬 파일만 수정. 운영 배포는 하지 않음.

## 2026-07-02 승인건 구독 내역 누락 복구

- 요청: 최근 승인한 `REQ-MR1RE0SP-HW1O`, `REQ-MQVYF5UR-29GU` 신청이 실제 로그인에는 문제 없어야 하는데 관리자 `고급 구독 내역`에는 보이지 않는 원인 파악.
- 원인:
  - 서버/텔레그램 승인 경로가 `advancedAccountLicenses/{loginIdKey}` 로그인 라이선스는 생성했지만, 관리자 표가 읽는 `config/advancedFeatureConfig` 장부를 갱신하지 않았다.
  - 그래서 사용자의 고급 로그인 가능성과 관리자 구독 목록 표시가 분리될 수 있었다.
- 변경:
  - 서버 승인 함수가 승인 즉시 `config/advancedFeatureConfig.subscriptions`에 ID, 평문 비밀번호, 해시, 만료일, 신청번호 메모를 함께 upsert하도록 변경.
  - 이미 승인된 신청을 다시 장부에 반영하는 `/admin/subscription/sync-ledger` 보안 API 추가.
  - 관리자 신청 카드의 `발급 완료/승인 완료` 상태에 `구독 내역 반영` 버튼 추가.
  - 버튼은 신청 본문 자동 표시 실패 여부와 무관하게 서버가 직접 복호화/장부 반영을 수행한다.
  - 관리자 복호화 API 제한은 신청 목록 자동 표시를 고려해 완화하고, 승인/반려/장부 동기화는 별도 제한을 유지했다.
- 검증:
  - `node --check functions/index.js` 통과.
  - `admin.html`, `admin/index.html` 모듈 스크립트 추출 후 `node --check` 통과.
  - Firebase Functions 운영 배포 완료.
  - `skctSecureApi/health` 정상 응답 확인.
  - 인증 없는 `/admin/subscription/sync-ledger` 호출은 401로 거부됨 확인.
  - GitHub Pages 배포 성공 확인.
  - 운영 관리자 페이지 `/admin.html`, `/admin/`에서 `sync-ledger`와 `구독 내역 반영` 문자열 로드 확인.
  - 운영 RTDB 확인: `REQ-MR1RE0SP-HW1O`, `REQ-MQVYF5UR-29GU`는 모두 `fulfilled`이나 `config/advancedFeatureConfig`에는 아직 신청번호가 없음.
- 반영 범위:
  - Firebase Functions는 운영 배포 완료.
  - 정적 관리자 페이지는 GitHub Pages `main` 커밋 `34d71f85301acd021681f06c2d10278740a39492`로 반영 완료.
  - 기존 두 승인건의 실제 장부 반영은 관리자 Google 로그인 후 각 카드의 `구독 내역 반영` 버튼을 눌러 실행해야 한다.

## 2026-07-02 승인 시 구독 내역 자동 반영 고정

- 요청: `구독 내역 반영`을 별도 버튼으로 누르는 구조가 아니라 승인 시 자동으로 고급 구독 내역에 반영되도록 수정.
- 변경:
  - 관리자 UI의 `구독 내역 반영` 버튼 제거.
  - 관리자 승인은 서버 보안 API가 있으면 로컬 키 보유 여부와 무관하게 서버 승인 경로를 우선 사용하도록 변경.
  - 서버 승인 API는 기존처럼 `advancedAccountLicenses`와 `config/advancedFeatureConfig`를 함께 갱신한다.
  - `subscriptionRequests/{requestId}`가 `fulfilled/approved` 상태로 기록되면 서버 DB 트리거가 자동으로 장부 동기화를 수행하도록 `syncApprovedSubscriptionRequestLedger` 추가.
  - 관리자 페이지 로드 시 `fulfilled/approved`인데 `ledgerSyncedAt`이 없는 신청은 `/admin/subscription/sync-approved-ledgers`로 자동 보강한다.
  - 만료일 문구를 `정오 12:00`에서 `선택한 날짜 23:59까지 사용 (다음 날 00:00 전)`으로 통일.
  - 승인 메일 만료 문구도 `YYYY-MM-DD 한국시간 23:59까지 (다음날 00:00 전까지)` 형식으로 변경.
- 운영 반영:
  - Firebase Functions 배포 완료.
  - 기존 누락 승인건 `REQ-MR1RE0SP-HW1O`, `REQ-MQVYF5UR-29GU`에 더미 갱신을 넣어 서버 트리거로 장부 반영 완료.
- 검증:
  - `node --check functions/index.js` 통과.
  - `admin.html`, `admin/index.html` 모듈 스크립트 추출 후 `node --check` 통과.
  - `정오 12:00`, `syncApprovedRequestToLedger`, `canSyncLedger` 잔여 검색 결과 없음.
  - 운영 RTDB 확인: 두 신청 모두 `ledgerSynced=true`, `config/advancedFeatureConfig`에 두 신청번호 포함, 구독 장부 13건.
