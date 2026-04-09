# 고급 모드 전용 기능 기준서
작성일시: 2026-04-09 09:27:20 KST

이 문서는 일반 모드와 고급 모드의 기능 경계를 한 번에 확인하기 위한 기준 문서입니다. 특히 `자료 보관함`처럼 별도 페이지가 있어도 실제로는 고급 모드 전용인 기능을 어디에서 어떻게 막아야 하는지까지 같이 정리합니다.

## 1. 진입 원칙
- 일반 화면에는 `🔒 고급 안내`만 보여주고, 실제 고급 기능은 승인된 라이선스가 확인된 뒤에만 열립니다.
- 고급 모드 로그인은 `신청 이메일 또는 로그인 ID + 비밀번호`만 사용합니다.
- 신청 상태 조회는 `신청 이메일 + 조회 비밀번호`만 사용합니다.
- 신청번호는 내부 식별과 관리자 작업용으로만 남기고, 사용자 로그인에는 쓰지 않습니다.

## 2. 고급 모드 전용 기능 목록

### 2.1 메인 연습 화면 안에서만 열리는 기능
- `문항 건너뛰기`
- `과목 초기화`
- `전체 초기화`
- `문항별 시간 가이드`
- `과목별 상세 통계`
- `문항별 상세 통계 TXT 다운로드`
- `정오표 일괄입력`

### 2.2 고급 모드에서만 노출되는 보조 기능
- `자료 보관함`
  - 일반 모드 `더보기`에서는 버튼을 숨깁니다.
  - 고급 모드 `더보기`에서만 버튼을 노출합니다.
  - 직접 URL로 들어오더라도 브라우저에 유효한 고급 라이선스가 없으면 접근을 막습니다.
  - 라이선스가 있더라도 자료보관함 안에서 다시 로그인한 계정만 자기 자료를 읽고 수정할 수 있습니다.

## 3. 자료 보관함 접근 정책
- 조건 1: 이 브라우저에 유효한 고급 라이선스 번들이 있어야 합니다.
- 조건 2: 자료 보관함 페이지에서 Firebase Auth 이메일/비밀번호 로그인이 되어 있어야 합니다.
- 조건 3: 위 두 조건이 모두 맞을 때만 `userStudyLibrary/$uid/items` 데이터를 구독하고 화면에 보여줍니다.
- 조건 4: 조건이 하나라도 깨지면 목록 구독을 끊고 작업 공간을 숨깁니다.

## 4. 문구 관리 원칙
- 일반 사용자에게 보이는 설명과 고급 사용자에게 보이는 설명이 다르면, 코드 분기만 두지 말고 `config/siteTextConfig`에서 각각 수정 가능해야 합니다.
- 이번 기준으로 아래 문구는 관리자 페이지에서 수정 가능해야 합니다.
- `utilityModal.descriptionHtml`
- `utilityModal.descriptionAdvancedHtml`
- `utilityModal.archiveDescription`
- `advancedGuide.feature*`
- `advancedGuide.featureAccessHtml`
- `advancedFeature.summaryHtml`
- `advancedFeature.planHtml`
- `archivePage.*`
- `messages.archive*`

## 5. 문서와 구현을 같이 묶어야 하는 이유
- 버튼만 숨기고 직접 URL 접근을 막지 않으면 일반 모드 사용자가 기능을 우회할 수 있습니다.
- 페이지 게이트만 만들고 안내 문구를 안 바꾸면, 일반 모드 도움말과 고급 안내가 서로 충돌합니다.
- 코드 기본값만 바꾸고 `siteTextConfig` 편집 대상을 안 늘리면 운영자가 문구를 수정할 때 다시 하드코딩으로 돌아갑니다.

## 6. 회귀 점검 기준
- 일반 모드 `더보기`에 자료 보관함 버튼이 보이지 않는지
- 고급 모드 `더보기`에 자료 보관함 버튼이 보이는지
- 고급 라이선스 없는 브라우저에서 `study-archive.html` 직접 접근 시 차단되는지
- 고급 라이선스는 있지만 자료보관함 로그인이 없을 때 로그인 화면만 보이는지
- 고급 라이선스와 자료보관함 로그인 둘 다 있을 때만 작업 공간이 보이는지
- 관리자 페이지 문구 편집기에서 고급 안내/자료 보관함 관련 키를 수정할 수 있는지

## 7. 관련 파일
- [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js)
- [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html)
- [study-archive.html](/C:/dev/01_career/_assets/tools/skct_tool/study-archive.html)
- [study-archive.js](/C:/dev/01_career/_assets/tools/skct_tool/study-archive.js)
- [site-text-config.js](/C:/dev/01_career/_assets/tools/skct_tool/site-text-config.js)
- [admin.html](/C:/dev/01_career/_assets/tools/skct_tool/admin.html)
