# 2026-04-09 고급 구독 저장용 루트 읽기 권한 수정
작성일시: 2026-04-09 01:23:00 KST

사용자 요청: 수동으로 `esun` 계정을 다시 추가하고 비밀번호까지 입력했는데 `고급 구독 저장` 시 `Permission denied`가 뜨는 원인을 해결한다.

## 1. 원인
- 관리자 페이지의 고급 구독 저장 흐름은 저장 전에 `advancedAccountLicenses` 현재 목록을 읽는다.
- 이 읽기는 [admin.html](/C:/dev/01_career/_assets/tools/skct_tool/admin.html) 의 `loadCurrentAdvancedAccountLicenseMap()` 경로에서 수행된다.
- 그런데 운영 Firebase rules는 아래처럼 되어 있었다.
  - `advancedAccountLicenses/.read = false`
  - `advancedAccountLicenses/$loginIdKey/.read = true`
- 그래서 공개 사용자는 개별 로그인 ID만 읽을 수 있었고, 관리자도 루트 전체 목록은 읽을 수 없었다.
- 결과적으로 관리자 로그인 후에도 저장 시작 단계에서 루트 읽기가 막혀 `Permission denied`가 발생했다.

## 2. 조치
- [database.rules.json](/C:/dev/01_career/_assets/tools/skct_tool/database.rules.json) 수정
  - `advancedAccountLicenses/.read = "auth != null"` 로 변경
  - 공개 비인증 사용자는 여전히 루트 목록을 읽을 수 없고, 관리자 로그인 상태에서만 루트 읽기가 가능해졌다.
- Firebase RTDB rules를 운영에 즉시 재배포했다.

## 3. 영향
- `고급 구독 저장` 시 기존 레코드 목록 조회가 정상화된다.
- 새 수동 구독 추가, 기존 계정 만료일 수정, 삭제 반영 시 더 이상 루트 읽기 단계에서 막히지 않아야 한다.
- 공개 사용자의 루트 목록 노출은 여전히 차단된다.

## 4. 사용자 확인 포인트
- 관리자 페이지에서 `Ctrl+F5`
- 다시 로그인
- `esun` 계정 추가 후 저장 재시도
- 저장 후 공개 페이지에서 `esun` + 방금 입력한 비밀번호로 로그인 확인
