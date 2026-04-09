# 2026-04-09 프로젝트 분석 및 TODO 대조 검토
작성일시: 2026-04-09 20:09:16 +09:00

이 문서는 현재 `skct_tool` 프로젝트 구조를 빠르게 파악하고, `docs/TODO/TODO.md`의 초기 정리 제안이 실제 코드와 문서에 얼마나 반영됐는지 대조한 결과를 정리합니다.

## 1. 현재 프로젝트 한 줄 분석

- 현재 프로젝트는 `GitHub Pages + Firebase RTDB + Firebase Auth + 순수 HTML/CSS/JS` 구조를 유지하는 정적 웹 앱입니다.
- 메인 사용자 화면은 [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html), 핵심 로직은 [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js), 관리자 화면은 [admin.html](/C:/dev/01_career/_assets/tools/skct_tool/admin.html), 자료 보관함은 [study-archive.html](/C:/dev/01_career/_assets/tools/skct_tool/study-archive.html) / [study-archive.js](/C:/dev/01_career/_assets/tools/skct_tool/study-archive.js)에 분리되어 있습니다.
- 2026-04-08 보안 점검 이후, 관리자 인증 구조와 고급 라이선스 검증은 초기에 비해 많이 정리됐지만, 공개 화면에서 직접 RTDB를 읽고 쓰는 경로는 아직 남아 있습니다.
- 최근 작업 로그와 기능 카탈로그 기준으로, 프로젝트 방향은 `위험 기능 제거`보다 `권한 분리 후 유지` 쪽으로 진화했습니다.

## 2. TODO와 비교했을 때 이미 반영된 축

### 2.1 일반 모드와 고급 모드 분리
- 일반 가이드에서 고급 설명을 분리하고, 별도 `고급 기능` 진입 버튼을 둔 구조는 반영되어 있습니다.
- 근거:
  - [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html#L64)
  - [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html#L311)
  - [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js#L4017)

### 2.2 신청번호 중심 흐름 정리
- 사용자 흐름은 신청번호가 아니라 `이메일 + 비밀번호`, 또는 `이메일/로그인 ID + 비밀번호` 기준으로 재설계되어 있습니다.
- 조회 lookup 인덱스도 따로 둬서 신청번호를 UI 전면에서 밀어냈습니다.
- 근거:
  - [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html#L607)
  - [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html#L615)
  - [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js#L1317)
  - [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js#L1554)

### 2.3 자료 보관함을 별도 경로로 분리
- TODO 초안은 자료 보관함 제거에 가깝지만, 실제 구현은 `별도 경로 + 고급 라이선스 확인 + Firebase Auth` 조합으로 바뀌었습니다.
- 일반 모드에서는 버튼을 숨기고, 자료 보관함 페이지 안에서도 고급 라이선스가 없으면 접근을 막습니다.
- 근거:
  - [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html#L786)
  - [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js#L4275)
  - [study-archive.js](/C:/dev/01_career/_assets/tools/skct_tool/study-archive.js#L245)
  - [study-archive.js](/C:/dev/01_career/_assets/tools/skct_tool/study-archive.js#L729)

### 2.4 일부 민감 설정 경로 비공개화
- 초기 감사에서 문제였던 `config/adminHash`, `config/advancedFeatureConfig`는 현재 rules에서 비공개로 막혀 있습니다.
- 근거:
  - [database.rules.json](/C:/dev/01_career/_assets/tools/skct_tool/database.rules.json#L78)
  - [database.rules.json](/C:/dev/01_career/_assets/tools/skct_tool/database.rules.json#L82)

## 3. TODO와 비교했을 때 아직 남아 있는 핵심 차이

### 3.1 메인 공개 화면에 아직 남아 있는 위험/혼합 진입점
- TODO는 커뮤니티, 통계, 확장 ZIP, 숨은 관리자 진입을 메인 공개면에서 내리자는 방향이었는데, 현재는 여전히 남아 있습니다.
- 근거:
  - 커뮤니티/활성 세션 버튼: [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html#L776)
  - 확장 ZIP 다운로드: [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html#L1391)
  - 숨은 관리자 더블클릭 진입: [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js#L4373)

### 3.2 Firebase rules는 부분 잠금만 됐고, 커뮤니티/통계는 아직 공개 쓰기
- 상단 `config` 민감값은 잠겼지만, `active_visitors`, `total_visits`, `daily_visits`, `stats.live_peak_daily`, `posts`, `replies`, `userLikes`는 여전히 공개 쓰기입니다.
- 즉 TODO의 “권한 잠금”은 절반만 끝난 상태입니다.
- 근거:
  - [database.rules.json](/C:/dev/01_career/_assets/tools/skct_tool/database.rules.json#L5)
  - [database.rules.json](/C:/dev/01_career/_assets/tools/skct_tool/database.rules.json#L11)
  - [database.rules.json](/C:/dev/01_career/_assets/tools/skct_tool/database.rules.json#L19)
  - [database.rules.json](/C:/dev/01_career/_assets/tools/skct_tool/database.rules.json#L124)

### 3.3 신청/조회/고급 로그인은 여전히 공개 브라우저가 RTDB를 직접 호출
- 암호화와 lookup 분리는 들어갔지만, 구조 자체는 아직 “브라우저에서 직접 RTDB에 신청 저장/조회”입니다.
- TODO의 최종 방향인 “민감 로직을 서버/API 쪽으로 이동”은 완료되지 않았습니다.
- 근거:
  - 신청 조회: [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js#L1306)
  - 고급 계정 라이선스 조회: [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js#L1334)
  - 신청 저장: [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js#L1511)
  - lookup 저장: [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js#L1554)

### 3.4 배포 경계 분리 전략은 실제 운영 구조에 반영되지 않음
- TODO는 `public-clean` 브랜치와 Pages source 분리를 강하게 권장하지만, 현재 로컬 브랜치 목록에는 `public-clean`이 없고 최근 운영 로그도 `origin/main` 자동 배포 기준으로 작성돼 있습니다.
- 즉 `배포용 브랜치 분리`는 아직 채택되지 않았습니다.

### 3.5 문서 구조가 현재 실제 파일 상태와 어긋남
- `docs/README.md`는 [00_TODO_INDEX.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/00_TODO_INDEX.md)를 현재 TODO 기준 문서라고 가리키지만, 지금 `docs/TODO`에는 `TODO.md`만 있습니다.
- 기능 카탈로그는 [30_MASTER_DOC.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/runtime/30_MASTER_DOC.md)를 링크하지만, 현재 해당 파일은 없습니다.
- 즉 TODO 정리 작업 로그와 실제 파일 트리가 다시 어긋난 상태입니다.
- 근거:
  - TODO 인덱스 링크: [docs/README.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/README.md#L19)
  - 없는 `30_MASTER_DOC` 링크: [docs/SKCT_TOOL_기능_카탈로그.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/SKCT_TOOL_기능_카탈로그.md#L62)

### 3.6 문서/측정/광고 축은 아직 착수 흔적이 약함
- TODO가 제안한 `/guide`, `/faq`, `/pricing`, `/privacy`, `/terms`, `ads.txt`, `CNAME`은 현재 없습니다.
- 코드 검색 기준 `practice_start`, `result_view`, `support_click`, `advanced_apply_submit` 이벤트도 없습니다.
- 프로젝트 파일에서 Google Analytics 로더 흔적도 확인되지 않았습니다.

## 4. 해석: 무엇이 “미완료”이고, 무엇이 “방향 변경”인가

- `자료 보관함 분리`, `이메일 중심 조회`, `고급 라이선스 검증`, `관리자 Auth 강화`는 TODO가 제기한 문제를 다른 방식으로 해소한 항목입니다.
- 반대로 `커뮤니티/통계/확장 ZIP 정리`, `공개면 축소`, `배포 브랜치 분리`, `문서 페이지 신설`, `GA4/광고/도메인 체계 정리`, `민감 흐름의 서버측 이전`은 아직 그대로 남아 있는 미완료 항목입니다.
- 그래서 현재 프로젝트 상태는 “초기 보안 구멍은 꽤 줄였지만, 공개 화면의 역할이 여전히 너무 많고 배포 경계는 아직 두껍지 않다”로 요약할 수 있습니다.

## 5. 지금 기준 우선순위 제안

1. `커뮤니티/통계/확장 ZIP/숨은 관리자 진입`을 계속 메인 공개면에 둘지 먼저 결정합니다.
2. 남길 기능이라면 RTDB 공개 쓰기 경로부터 줄입니다.
3. 고급 신청/조회/로그인 흐름은 장기적으로 서버/API 이전 계획을 따로 세웁니다.
4. `docs/README.md`, `docs/TODO`, `docs/agent/runtime` 링크 불일치를 먼저 정리합니다.
5. 이후에야 `/guide`, `/faq`, `/pricing`, GA4 이벤트, Search Console, 광고/도메인 작업으로 넘어가는 편이 맞습니다.

## 6. 이번 검토에서 확인한 부가 메모

- 현재 워크트리는 깨끗하지 않습니다. `docs/TODO/TODO.md`, `docs/참고사진/image.png` 수정과 일부 문서 미추적 파일이 있습니다.
- 이번 검토에서는 코드 변경을 하지 않았고, 읽기/비교만 수행했습니다.
