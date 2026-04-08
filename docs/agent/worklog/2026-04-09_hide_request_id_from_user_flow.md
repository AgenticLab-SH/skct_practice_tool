# 2026-04-09 신청번호 사용자 비노출 정리
작성일시: 2026-04-09 01:46:00 KST

사용자 요청: 신청번호는 내부용으로만 남기고, 사용자 화면에서는 보이지 않게 정리한다.

## 1. 목표
- 신청번호는 Firebase 내부 식별자와 관리자 작업용으로만 유지
- 사용자 신청/조회/고급 모드 진입 흐름에서는 `이메일 + 비밀번호`만 안내
- 새 신청은 이메일 조회 인덱스까지 반드시 같이 저장되도록 강제

## 2. 반영 내용
- [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js)
  - 신청 조회 결과 카드에서 `신청번호` 표시 제거
  - 중복 신청 안내에서 신청번호 노출 제거
  - 신청 성공 메시지에서 신청번호 노출 제거
  - 새 신청 저장 후 `subscriptionRequestLookup` 저장이 실패하면, 기존 `subscriptionRequests/<requestId>`를 즉시 되돌리고 전체 신청을 실패 처리
  - 즉 이제 사용자에게 성공으로 보이는 신청은 항상 이메일 조회가 가능한 신청만 남도록 바뀜
  - 조회 필수값 안내도 `이메일과 조회 비밀번호` 기준으로 정리
- [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html)
  - 신청 조회 입력 placeholder를 `신청 이메일`로 변경
  - 조회 설명에서 신청번호 언급 제거
- [site-text-config.js](/C:/dev/01_career/_assets/tools/skct_tool/site-text-config.js)
  - 기본 안내 문구와 상태 메시지를 신청번호 비노출 기준으로 수정

## 3. 검증
- `node --check main.js` 통과
- `node --check site-text-config.js` 통과
- `database.rules.json` 파싱 통과

## 4. 주의
- 로컬 브라우저 확인 시 일부 안내 문구가 아직 예전 `신청번호` 표현으로 보였다.
- 원인은 현재 화면이 코드 기본값보다 Firebase 원격 `siteTextConfig` 값을 우선 적용하기 때문이다.
- 즉 코드 수정은 반영됐지만, 운영/로컬 화면 문구를 완전히 통일하려면 관리자에서 사이트 텍스트를 한 번 저장하거나 원격 설정을 동기화해야 한다.
