# SKCT Tool 작업 기준서
작성일시: 2026-04-10 02:39:56 +09:00

이 문서는 이 프로젝트에서 작업을 시작할 때 가장 먼저 읽는 얇은 기준서입니다. 긴 worklog를 처음부터 다 읽지 않고도, 현재 운영 경계와 다음 우선순위를 바로 파악할 수 있게 유지합니다.

## 1. 현재 운영 경계

- 현재 GitHub Pages 운영 반영 기준 브랜치는 `public-clean`입니다.
- 최근 운영 공개 반영은 `public-clean` 커밋 `33f85d5` 기준으로 끝났습니다.
- 사용자의 명시적 승인 전에는 `public-clean` push, GitHub Pages 운영 반영, 운영 Firebase RTDB 기본값 변경을 하지 않습니다.
- 현재 남은 민감 흐름 전환 작업은 아직 운영 Firebase를 직접 건드리지 않은 상태입니다.
- 현재 로컬 안전 백업 기준:
  - 백업 브랜치: `backup/20260409_201424-local-safe-start`
  - 백업 태그: `backup-20260409_201424-local-safe-start`
  - 추가 백업 브랜치: `backup/20260409_225421-remaining-todo-start`
  - 추가 백업 태그: `backup-20260409_225421-remaining-todo-start`
  - 작업 브랜치: `work/20260409_201424-local-safe-hardening`
  - 공개 배포 브랜치(운영 반영 완료): `public-clean`

## 2. 현재 프로젝트 한 줄 상태

- 구조는 `GitHub Pages + Firebase RTDB + Firebase Auth + 순수 HTML/CSS/JS`입니다.
- 2026-04-08 이후 관리자 인증, 고급 라이선스 검증, 자료 보관함 게이트는 강화됐습니다.
- 공개 메인 화면에서는 `커뮤니티`와 `활성 세션`을 유지하고, 확장 ZIP은 `extension-info.html` 같은 별도 안내 페이지로 분리했습니다.
- `guide`, `faq`, `pricing`, `privacy`, `terms`는 메인 연습 도구와 분리된 문서형 경로로 준비했습니다.
- 수동 신청/조회/고급 라이선스 확인은 `secureApiBaseUrl`이 설정되면 서버 경유를 우선 사용하도록 바뀌었고, `functions/` 준비 코드도 추가했습니다.
- 공개 RTDB 쓰기는 완전 차단 전 단계로, 통계/커뮤니티 경로에 입력 검증을 먼저 넣었습니다.
- 로컬 관리자 진입은 `scripts/open_local_admin.cmd` 또는 `scripts/open_local_admin.ps1`로 한 번에 열 수 있게 정리했습니다.
- 고급 팝업은 기본 열림 폭이 너무 좁아지지 않도록 최소 폭 보정을 넣었고, 팝업 기준 폭에서도 OMR 입력칸과 하단 버튼이 같이 보이게 맞췄습니다.
- 일반 `가이드`, `고급 안내`, `고급 활용`은 역할을 나눠 다시 정리했습니다.
  - `가이드`: 일반 모드 기본 흐름
  - `고급 안내`: 신청, 승인 확인, 진입
  - `고급 활용`: 이미 들어온 뒤 버튼 사용 순서
- 고급 기능 빠른 안내는 깨진 텍스트 이미지 대신 도식 카드와 짧은 문구 중심으로 다시 구성했습니다.
- 좁은 버튼 내부 화면은 긴 설명을 기본 노출하지 않고, 헤더 `?` 빠른 도움말로 다시 보게 정리했습니다.
- 고급 OMR은 긴 인라인 설명 대신 `?` 버튼만 남기고, 도움말 모달에서 복기 순서를 다시 보게 바꿨습니다.

## 3. 가장 먼저 볼 문서

1. [AGENTS.md](/C:/dev/01_career/_assets/tools/skct_tool/AGENTS.md)
2. [SKCT_TOOL_기능_카탈로그.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/SKCT_TOOL_기능_카탈로그.md)
3. [TODO.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/TODO.md)
4. [2026-04-09_project_analysis_and_todo_review.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/worklog/2026-04-09_project_analysis_and_todo_review.md)

## 4. 현재 우선순위

1. Functions 배포와 secure API URL 저장
- `functions/index.js`를 운영 Firebase에 배포하고, 관리자 페이지 `보안 API 기본 URL`에 실제 엔드포인트를 저장해야 민감 흐름의 direct RTDB fallback을 끊을 수 있습니다.

2. 민감 경로 rules 최종 잠금
- secure API가 검증되면 `subscriptionRequests`, `subscriptionRequestLookup`, `advancedAccountLicenses`의 공개 read/write를 auth 전용으로 잠가야 합니다.

3. 공개 배포 경계 유지
- `public-clean`에는 일반 공개 화면과 고급 인증용 `advanced-tools.html`만 둡니다.
- 공개 배포에서 `admin.html`은 실제 관리자 UI가 아니라 차단 안내 페이지로 유지해야 합니다.

4. 검색/광고 운영 마감
- `ads.txt`, `CNAME`, Search Console/GA 최종 점검은 실제 운영 도메인과 광고 계정 값이 있어야 마무리할 수 있습니다.

## 5. 기능 문서 동기화 기준

- 사용자 체감 기능이 바뀌면 [SKCT_TOOL_기능_카탈로그.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/SKCT_TOOL_기능_카탈로그.md)도 같은 턴에 갱신합니다.
- 구조나 작업 기준이 바뀌면 이 문서를 갱신합니다.
- 상세한 변경 이유와 검증 결과는 `docs/agent/worklog/`에 남깁니다.
- 기능 변화가 없고 내부 정리만 했다면 worklog에 `기능 문서 변경 없음`을 남깁니다.
