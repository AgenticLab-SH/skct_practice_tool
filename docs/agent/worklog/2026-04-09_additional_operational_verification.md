# 2026-04-09 추가 운영 점검
작성일시: 2026-04-09 01:14:00 KST

사용자 요청: 최근 권한/구독/접속자 관련 수정 이후 추가적으로 남은 문제가 없는지 운영 기준으로 다시 확인한다.

## 1. 점검 범위
- 라이브 `admin.html`에 최신 저장 로직이 실제 배포되었는지 확인
- 운영 Firebase RTDB 공개/비공개 경로 응답 상태 재확인
- 고급 구독/수동 신청 관련 운영 데이터 정합성 재확인
- 접속자 집계 값에 stale/legacy 세션이 다시 남아 있는지 확인

## 2. 확인 결과
- 라이브 `admin.html`에는 최신 코드가 반영되어 있었다.
  - `유령 세션 정리` 버튼 문자열 확인
  - `loadCurrentAdvancedAccountLicenseMap` 문자열 확인
  - 즉 `advancedAccountLicenses`를 자식 키 단위로 저장하는 최신 로직이 실제 배포본에 들어가 있었다.
- 운영 RTDB 공개/비공개 응답은 여전히 의도대로 유지되고 있었다.
  - `config.json` -> `401`
  - `config/appName.json` -> `200`
  - `advancedAccountLicenses.json` -> `401`
  - `advancedAccountLicenses/ods1106.json` -> `200`
  - `subscriptionRequests.json` -> `401` (비인증 기준)
- 운영 데이터 정합성은 현재 깔끔했다.
  - `config/advancedFeatureConfig`에는 `ods1106`, `mingyu7275`만 존재
  - `advancedAccountLicenses`에도 동일하게 `ods1106`, `mingyu7275`만 존재
  - `subscriptionRequests`에는 승인 완료된 2건만 남아 있었다.

## 3. 남은 관찰 사항
- `active_visitors`에는 legacy 형식의 오래된 키 1건이 다시 보였다.
  - 키: `-Opho56UtvQbALL7wGUq`
  - 즉 현재 접속자 수는 여전히 “사람 수”가 아니라 “최근 heartbeat를 보낸 세션/탭 수 + 일부 legacy 찌꺼기 가능성”으로 해석해야 한다.
- 이번 점검 세션에서는 관리자 로그인 상태를 재사용할 수 없어서, 라이브 관리자 페이지에서 실제 저장 버튼 클릭까지는 E2E로 다시 검증하지 못했다.
  - 다만 배포본 HTML과 운영 rules는 저장 경로 수정본과 일치했다.

## 4. 결론
- 치명적인 추가 문제는 현재 점검 범위에서 발견되지 않았다.
- 고급 구독/수동 신청/공개 인증 경로는 현재 운영 데이터 기준으로 정합성이 맞다.
- 남은 것은 접속자 집계의 legacy 키 1건과, 사용자 브라우저에서의 실제 저장 재시도 확인 정도다.
