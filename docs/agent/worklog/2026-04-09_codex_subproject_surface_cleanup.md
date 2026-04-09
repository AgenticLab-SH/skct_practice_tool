# .codex 서브프로젝트 표면 정리 기록
작성일시: 2026-04-09 11:53:41 KST

## 1. 사용자 요청

`.codex` 폴더가 복잡하므로, 불필요한 파일과 문서를 체계적으로 정리해 달라는 요청을 받았습니다. 이번 턴의 초점은 루트만이 아니라 `src/*` 하위 프로젝트 상단까지 포함해, 현재 문서와 보관 문서를 분리하는 것이었습니다.

## 2. 판단 기준

이번 정리는 파일명을 기준으로 하지 않고 역할을 기준으로 분류했습니다.

1. 현재 운영 문서
- 현재 README
- 현재 runbook
- 현재 handoff 또는 체크리스트
- 실제 실행 파일과 필수 설정

2. 역사 / 보관 문서
- 과거 전달 보고서
- 완료 메모
- 외부 조사 메모

3. 구형 출력
- 예전 `60_*_CODEX_OUTPUT.md`
- 관련 `.meta.json`

4. 배포물 / 임시물
- 설치 패키지, VSIX
- 임시 스크린샷, 수동 점검 캡처

위 기준에 따라 프로젝트 상단에는 현재 운영 표면만 남기고, 나머지는 역할별 폴더로 이동했습니다.

## 3. 실제 이동 내용

### 3.1 notify

- `src/notify/30_AGENT_LAST_WORK_REPORT.md`
  -> `src/notify/docs/archive/30_AGENT_LAST_WORK_REPORT_2026-02_historical.md`
- `src/notify/60_notify_CODEX_OUTPUT.md`
  -> `src/notify/docs/archive/legacy_output/60_notify_CODEX_OUTPUT.md`
- `src/notify/60_notify_CODEX_OUTPUT.meta.json`
  -> `src/notify/docs/archive/legacy_output/60_notify_CODEX_OUTPUT.meta.json`
- `src/notify/개발완료.md`
  -> `src/notify/docs/archive/개발완료_legacy.md`

### 3.2 codex_multi_workspace

- `src/codex_multi_workspace/60_codex_multi_workspace_CODEX_OUTPUT.md`
  -> `src/codex_multi_workspace/docs/archive/legacy_output/60_codex_multi_workspace_CODEX_OUTPUT.md`
- `src/codex_multi_workspace/codex-multi-account-manager-0.3.15.vsix`
  -> `src/codex_multi_workspace/dist/archive/codex-multi-account-manager-0.3.15.vsix`
- `src/codex_multi_workspace/codex-multi-account-manager-0.3.16.vsix`
  -> `src/codex_multi_workspace/dist/codex-multi-account-manager-0.3.16.vsix`

### 3.3 codex_shared_tui

- `src/codex_shared_tui/60_codex_shared_tui_CODEX_OUTPUT.md`
  -> `src/codex_shared_tui/docs/archive/legacy_output/60_codex_shared_tui_CODEX_OUTPUT.md`
- `src/codex_shared_tui/TIP.md`
  -> `src/codex_shared_tui/docs/archive/TIP_telegram_cokacdir_legacy.md`

### 3.4 codex_browser_tool_project

- `src/codex_browser_tool_project/60_codex_browser_tool_project_CODEX_OUTPUT.md`
  -> `src/codex_browser_tool_project/docs/archive/legacy_output/60_codex_browser_tool_project_CODEX_OUTPUT.md`
- `src/codex_browser_tool_project/60_codex_browser_tool_project_CODEX_OUTPUT.meta.json`
  -> `src/codex_browser_tool_project/docs/archive/legacy_output/60_codex_browser_tool_project_CODEX_OUTPUT.meta.json`
- `src/codex_browser_tool_project/tmp_test.png`
  -> `src/codex_browser_tool_project/artifacts/tmp/tmp_test.png`

## 4. 규칙 및 문서 갱신

다음 문서에 “서브프로젝트 상단 최소화” 규칙을 반영했습니다.

- `C:\Users\kshcg\.codex\AGENTS.md`
- `C:\Users\kshcg\.codex\10_ENV_RULES.md`
- `C:\Users\kshcg\.codex\30_MASTER_DOC.md`
- `C:\Users\kshcg\.codex\docs\00_runtime_home\README.md`
- `C:\Users\kshcg\.codex\docs\01_overview\active_surface_map.md`

다음 프로젝트 README에도 새 배치를 반영했습니다.

- `C:\Users\kshcg\.codex\src\notify\docs\README.md`
- `C:\Users\kshcg\.codex\src\codex_multi_workspace\README.md`
- `C:\Users\kshcg\.codex\src\codex_shared_tui\README.md`
- `C:\Users\kshcg\.codex\src\codex_browser_tool_project\README.md`

새 안내 파일도 추가했습니다.

- `src/notify/docs/archive/README.md`
- `src/codex_multi_workspace/docs/archive/README.md`
- `src/codex_multi_workspace/dist/README.md`
- `src/codex_shared_tui/docs/archive/README.md`
- `src/codex_browser_tool_project/docs/archive/README.md`

## 5. 백업

이동 전 원본은 아래 경로에 백업했습니다.

- `C:\Users\kshcg\.codex\backup\20260409_114817_subproject_surface_cleanup`

## 6. 검증

1. 이동 대상이 원래 상단 경로에서 사라졌는지 확인
- `30_AGENT_LAST_WORK_REPORT.md`, `60_*_CODEX_OUTPUT.md`, `TIP.md`, `tmp_test.png`, 루트 VSIX가 원래 위치에 남아 있지 않음을 확인했습니다.

2. 문서/코드 최소 검증
- `python -m py_compile C:\Users\kshcg\.codex\src\codex_multi_workspace\codex_launcher.py C:\Users\kshcg\.codex\src\notify\scripts\discord_env_bootstrap.py`
- 통과

3. 문서 diff 검사
- `.codex` 대상 파일들에 대해 `git diff --check` 실행
- 문제 없음
- CRLF 경고만 존재

## 7. 이번에 의도적으로 유지한 것

- `.codex` 루트의 `config.toml`, `auth.json`, `history.jsonl`, `*.sqlite*`
  - Codex 본체 상태 파일이라 유지
- `src/devsynth`의 `40/50/55/70` 문서
  - 아직 서로 참조가 살아 있어 이번 턴에서는 이동하지 않음
- `src/codex_shared_tui/70_HANDOFF.md`
  - 현재도 참고 가능성이 있어 유지

## 8. 기능 문서 동기화 여부

- 일반 사용자 기능 카탈로그 갱신 대상은 아니므로 `기능 문서 변경 없음`
- 대신 `.codex` 운영 규칙과 서브프로젝트 README를 최신 구조에 맞게 동기화했습니다.
