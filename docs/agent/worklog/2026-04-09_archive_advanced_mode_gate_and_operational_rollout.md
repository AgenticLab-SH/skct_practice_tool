# 2026-04-09 자료 보관함 고급 모드 게이트 및 운영 반영 기록
작성일시: 2026-04-09 09:55:30 KST

## 사용자 요청
- 자료 보관함은 고급 모드에서만 보여야 함
- 일반 모드에서는 사용 불가여야 함
- 로그인된 사람만 접근할 수 있어야 함
- 고급 안내에 고급 모드 전용 기능 설명을 체계적으로 넣어야 함
- 관련 문구는 하드코딩보다 관리자 페이지에서 수정 가능한 `siteTextConfig` 구조를 우선해야 함
- 이 정책을 `AGENTS.md`와 문서에도 반영하고 실제 운영 반영까지 끝내야 함

## 문제 판단
- 기존 `더보기` 모달은 일반 모드에서도 자료 보관함 버튼을 그대로 보여주고 있었음
- `study-archive.html`은 Firebase Auth 로그인만 요구했고, 고급 라이선스 여부는 따로 확인하지 않았음
- 고급 안내 모달에는 “무슨 기능이 고급 전용인지”가 체계적으로 묶여 있지 않았음
- 운영 화면은 코드 기본값보다 Firebase `config/siteTextConfig`를 우선하기 때문에, 코드만 바꾸면 실제 안내 문구는 예전 값을 계속 보여줄 수 있었음

## 코드 반영
- `main.js`
  - 일반 모드에서는 자료 보관함 버튼을 숨기고, 고급 모드에서만 노출하도록 변경
  - `더보기` 설명 문구를 일반 모드/고급 모드로 분기
  - 고급 안내 상단 상태 메시지를 관리자 수정 가능 메시지 키 기반으로 정리
- `study-archive.html`, `study-archive.js`
  - 페이지 자체에 `고급 라이선스 게이트`를 추가
  - 유효한 고급 라이선스가 없으면 접근 차단 화면만 보이도록 변경
  - 라이선스가 있어도 로그인 전에는 작업 공간이 아니라 로그인 화면만 보이도록 변경
  - 자료보관함 상단/게이트/로그인 안내 문구를 `archivePage.*`, `messages.archive*` 키로 읽도록 정리
- `site-text-config.js`
  - `utilityModal.descriptionAdvancedHtml`
  - `advancedGuide.featureAccessHtml`
  - `archivePage.*`
  - `messages.archive*`
  - `messages.advancedConfigMissing`
  - 위 키들을 기본값과 관리자 편집 카탈로그에 추가
- `admin.html`
  - 자료 보관함 관련 키를 `고급` 스코프로 분류하도록 보강
- `AGENTS.md`
  - 고급 전용 기능은 일반 모드 숨김 + 직접 URL 재차단 + 관리자 수정 가능 문구 유지 원칙 추가
- `docs/agent/36_HIDDEN_ADVANCED_FEATURES.md`
  - 고급 전용 기능 목록과 자료 보관함 접근 정책을 기준서 형태로 재정리
- `35_LEARNING_NOTES.md`
  - 고급 전용 기능은 버튼 숨김만이 아니라 URL·문구·로그인까지 한 묶음으로 맞춰야 한다는 학습 포인트 추가

## 운영 반영
- GitHub Pages 코드 반영
  - 배포 커밋: `7b5001e`
  - `origin/main`에 push 완료
  - GitHub Pages 최신 빌드 상태: `built`
  - 빌드 커밋: `7b5001ed86c8a86d56bafd3827efcf98b9b053ce`
  - 빌드 완료 시각: `2026-04-09 09:54:14 KST`
- Firebase RTDB 운영 텍스트 기준 동기화
  - `site-text-config.js`의 현재 기본값을 JSON으로 생성
  - `npx firebase-tools database:set /config/siteTextConfig ...`로 운영 RTDB에 저장
  - 확인 키
    - `advancedGuide/featureTitle = "2. 고급 모드 전용 기능"`
    - `archivePage/gateTitle = "고급 모드 확인이 먼저 필요합니다"`

## 검증
- 구문 검증
  - `node --check main.js`
  - `node --check study-archive.js`
  - `node --check site-text-config.js`
- 로컬 브라우저 검증
  - 일반 모드 `index.html`에서 자료 보관함 버튼 숨김 확인
  - 고급 라이선스 검증을 stub한 상태의 `index.html?advanced=1`에서 자료 보관함 버튼 노출 확인
  - `study-archive.html` 직접 접근 시 게이트 화면만 보이고 로그인/작업공간은 숨김 확인
  - 고급 라이선스 검증을 stub한 상태의 `study-archive.html`에서 로그인 화면만 보이고 작업공간은 숨김 확인
- 라이브 검증
  - `https://agenticlab-sh.github.io/skct_tool/` 응답 `200`
  - 라이브 HTML에 `main.js?v=202604090955`, `site-text-config.js?v=202604090955` 반영 확인
  - 라이브 일반 모드에서 자료 보관함 버튼 숨김 확인
  - 라이브 일반 모드에서 고급 안내 제목이 `2. 고급 모드 전용 기능`으로 보이는 것 확인
  - 라이브 일반 모드에서 `advancedGuideFeatureAccess` 설명 노출 확인
  - 라이브 고급 모드 시뮬레이션에서 자료 보관함 버튼 노출과 고급용 `더보기` 설명 확인
  - 라이브 `study-archive.html` 직접 접근 시 게이트 화면만 보이는 것 확인

## 남은 사용자 후속
- 이번 요청 범위 기준으로 필수 사용자 후속은 없음
