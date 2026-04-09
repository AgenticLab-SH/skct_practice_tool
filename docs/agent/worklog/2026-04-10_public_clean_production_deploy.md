# public-clean 운영 배포
작성일시: 2026-04-10 00:03:31 +09:00

## 1. 요청

- 사용자가 커스텀 도메인과 광고 없이도 문제가 없으면 바로 배포하자고 승인했습니다.

## 2. 수행 내용

1. GitHub 인증 상태를 확인했습니다.
   - `gh auth status`에서 `AgenticLab-SH` 로그인 상태를 확인했습니다.
2. `public-clean` 브랜치를 원격에 push했습니다.
3. GitHub Pages 소스를 `public-clean / (root)`로 전환했습니다.
4. Pages API로 현재 운영 URL과 소스 브랜치가 `public-clean`으로 바뀐 것을 확인했습니다.
5. 라이브 검증 중 `admin.html`이 예상과 다르게 실제 관리자 화면을 응답하는 문제를 발견했습니다.
6. 이를 막기 위해 공개 배포 추출 스크립트에 차단용 `admin.html` 스텁을 추가했습니다.
7. 새 산출물을 `public-clean` 브랜치에 다시 커밋하고 push했습니다.

## 3. 핵심 판단

- 커스텀 도메인과 광고는 배포 필수 조건이 아니므로 이번 운영 반영의 blocker가 아닙니다.
- 실제 운영 위험은 `도메인/광고`가 아니라 `공개 배포 경계`와 `민감 흐름 서버 분리`입니다.
- 공개 배포에서 숨길 경로는 단순히 파일을 빼는 것보다, 차단 페이지를 명시적으로 넣는 편이 안전하다고 판단했습니다.

## 4. 검증

- `gh api repos/AgenticLab-SH/skct_tool/pages` 조회
- `gh api repos/AgenticLab-SH/skct_tool/pages/builds` 조회
- `curl.exe -I https://agenticlab-sh.github.io/skct_tool/`
- `curl.exe -I https://agenticlab-sh.github.io/skct_tool/admin.html`
- `node --check main.js`
- `pwsh -File scripts/export_public_clean.ps1 -OutputDir tmp/public-clean-preview`

## 5. 남은 것

- Cloud Functions API 활성화
- `functions/` 실제 배포
- 관리자 `보안 API 기본 URL` 저장
- `subscriptionRequests`, `subscriptionRequestLookup`, `advancedAccountLicenses` rules 최종 잠금
- 필요 시 커스텀 도메인과 광고는 나중에 별도 진행

## 6. 기능 문서 동기화

- 운영 경계가 바뀌었으므로 `AGENTS.md`, `30_MASTER_DOC.md`, `70_USER_TODO.md`, `50_AGENT_LAST_WORK_REPORT.md`, `SKCT_TOOL_전체구조_및_운영기준.md`, `35_LEARNING_NOTES.md`를 함께 갱신했습니다.
