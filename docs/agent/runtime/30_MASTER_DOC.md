# SKCT Tool 작업 기준서
작성일시: 2026-04-09 21:10:58 +09:00

이 문서는 이 프로젝트에서 작업을 시작할 때 가장 먼저 읽는 얇은 기준서입니다. 긴 worklog를 처음부터 다 읽지 않고도, 현재 운영 경계와 다음 우선순위를 바로 파악할 수 있게 유지합니다.

## 1. 현재 운영 경계

- 운영 반영 기준 브랜치는 여전히 `main`입니다.
- 사용자의 명시적 승인 전에는 `main` push, GitHub Pages 운영 반영, 운영 Firebase RTDB 기본값 변경을 하지 않습니다.
- 이번 로컬 작업은 운영 서버와 운영 DB를 건드리지 않고, 로컬 브랜치에서만 진행합니다.
- 현재 로컬 안전 백업 기준:
  - 백업 브랜치: `backup/20260409_201424-local-safe-start`
  - 백업 태그: `backup-20260409_201424-local-safe-start`
  - 작업 브랜치: `work/20260409_201424-local-safe-hardening`

## 2. 현재 프로젝트 한 줄 상태

- 구조는 `GitHub Pages + Firebase RTDB + Firebase Auth + 순수 HTML/CSS/JS`입니다.
- 2026-04-08 이후 관리자 인증, 고급 라이선스 검증, 자료 보관함 게이트는 강화됐습니다.
- 공개 메인 화면에서는 `커뮤니티`와 `활성 세션`을 유지하고, 확장 ZIP은 `extension-info.html` 같은 별도 안내 페이지로 분리했습니다.
- `guide`, `faq`, `pricing`, `privacy`, `terms`는 메인 연습 도구와 분리된 문서형 경로로 준비했습니다.
- 다만 일부 공개 RTDB 쓰기 경로와 민감 흐름의 클라이언트 직결 구조는 아직 남아 있습니다.

## 3. 가장 먼저 볼 문서

1. [AGENTS.md](/C:/dev/01_career/_assets/tools/skct_tool/AGENTS.md)
2. [SKCT_TOOL_기능_카탈로그.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/SKCT_TOOL_기능_카탈로그.md)
3. [TODO.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/TODO.md)
4. [2026-04-09_project_analysis_and_todo_review.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/worklog/2026-04-09_project_analysis_and_todo_review.md)

## 4. 현재 우선순위

1. RTDB 공개 쓰기 범위 축소
- `active_visitors`, `daily_visits`, `posts`, `replies`, `userLikes`처럼 공개 화면이 직접 쓰는 경로를 기능 보존 전제 아래 더 좁히는 설계가 다음 우선순위입니다.

2. 민감 흐름의 서버측 이전 설계
- 신청 저장, 신청 조회, 고급 로그인 확인은 여전히 클라이언트가 RTDB를 직접 만지는 구조라서, 장기적으로는 서버 경유 구조가 필요합니다.

3. 문서형 페이지와 부가 경로 운영 정리
- `guide`, `faq`, `pricing`, `privacy`, `terms`, `extension-info.html`을 운영 반영 전에 한 번 더 검토하고 문구 기준을 관리자 설정값과 맞춰야 합니다.

4. 측정과 검색 노출 마감
- 이미 심은 GA4 이벤트가 실제 운영 플로우와 맞는지 확인하고, 사이트맵과 문서형 페이지 연결을 최종 점검합니다.

## 5. 기능 문서 동기화 기준

- 사용자 체감 기능이 바뀌면 [SKCT_TOOL_기능_카탈로그.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/SKCT_TOOL_기능_카탈로그.md)도 같은 턴에 갱신합니다.
- 구조나 작업 기준이 바뀌면 이 문서를 갱신합니다.
- 상세한 변경 이유와 검증 결과는 `docs/agent/worklog/`에 남깁니다.
- 기능 변화가 없고 내부 정리만 했다면 worklog에 `기능 문서 변경 없음`을 남깁니다.
