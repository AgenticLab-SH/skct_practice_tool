# 관리자 접속 및 구독 승인 안내
작성일시: 2026-04-10 11:23:00 +09:00

## 요청

- 사용자가 관리자 페이지 접속 방법과 새 구독 신청 승인 방법을 물었습니다.

## 확인한 내용

- 공개 배포 `public-clean`에서는 `admin.html`이 실제 관리자 UI가 아니라 차단 페이지입니다.
- 실제 관리자 화면은 프로젝트 로컬의 [admin.html](/C:/dev/01_career/_assets/tools/skct_tool/admin.html)에 남아 있습니다.
- 관리자 로그인은 Firebase Auth 관리자 계정 기준입니다.
- 신청 승인에는 아래 두 개인키가 모두 필요합니다.
  - `manual_subscription_request_private.pem`
  - `manual_subscription_license_private.pem`
- 기본 권장 저장 위치는 `C:\Users\kshcg\.codex\private\skct_tool` 입니다.

## 안내 요약

1. 프로젝트 루트에서 로컬 정적 서버를 띄웁니다.
2. `http://127.0.0.1:<port>/admin.html` 로 접속합니다.
3. Firebase Auth 관리자 이메일/비밀번호로 로그인합니다.
4. `🔐 구독 운영` 아래 `🧾 수동 구독 신청 관리`에서 키를 불러옵니다.
5. 신청 카드를 `복호화`한 뒤 `승인 후 라이선스 발급`을 누릅니다.

## 기능 문서 변경 여부

- 기능 문서 변경 없음
