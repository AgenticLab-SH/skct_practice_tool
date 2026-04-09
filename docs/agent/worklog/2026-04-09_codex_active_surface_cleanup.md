# .codex 활성 표면 정리 작업 기록
작성일시: 2026-04-09 10:56:13 +09:00

## 요청

- 현재 사용하지 않는 방식은 없애고, 사용하는 방식에 최적화되도록 `.codex`의 문서와 코드를 전수 검토
- 판단 기준을 먼저 세우고, 읽고, 분류하고, 개선
- 필요 시 백업 후 작업

## 판단 기준

이번 턴에서는 `.codex` 전체를 동일 비중으로 읽지 않고, 아래 4범주로 먼저 분류했다.

1. 활성 시작 문서
- 지금도 사람이 먼저 읽는 기준 문서와 허브

2. 범위별 현재 운영 문서
- 특정 하위 프로젝트에서 현재도 직접 따라 하는 README/runbook

3. 생성물 / 런타임 상태
- `runtime/`, `logs/`, `tmp/`, `sessions/`, `90_*_CODEX_OUTPUT.md` 같은 재생성 가능한 상태

4. 역사 / 보관 문서
- `docs/90_archive/`, `backup/`, `_trash/`, 오래된 handoff/report

핵심 판단:

- “현재 사용하지 않는 방식 제거”는 모든 과거 문서를 지우는 뜻이 아니라, 활성 허브에서 오래된 방식을 걷어내고 보관 영역으로 내리는 것으로 해석했다.
- 아직 코드가 사용하는 예외 경로는 삭제보다 `기본값 아님`으로 강등하는 쪽을 선택했다.

## 사전 조사 결과

- `.codex`는 Git 저장소이지만 워크트리가 이미 많이 더러워져 있었음
- Markdown 문서가 매우 많아, 수천 개 문서를 개별 수정하는 방식은 비효율적이라고 판단
- 현재 혼선을 일으키는 핵심은 “활성 문서 허브의 오래된 설명”과 “서브프로젝트 현재 README의 잘못된 기본값 설명”이었음

## 백업

### 기존 백업 확인

- `C:\Users\kshcg\.codex\backup\20260409_104200_active_doc_rewrite`

### 이번 턴 추가 백업

- `C:\Users\kshcg\.codex\backup\20260409_111900_active_surface_cleanup`

백업 대상:

- 루트 기준 문서
- overview 허브 문서
- prompt
- `codex_multi_workspace` 핵심 README/runbook
- `notify` 핵심 문서
- handoff 문서

## 분류 및 개선 내용

### 1. 루트 활성 허브 재작성

수정:

- `C:\Users\kshcg\.codex\10_ENV_RULES.md`
- `C:\Users\kshcg\.codex\30_MASTER_DOC.md`
- `C:\Users\kshcg\.codex\50_AGENT_LAST_WORK_REPORT.md`
- `C:\Users\kshcg\.codex\35_LEARNING_NOTES.md`

반영 내용:

- `.codex`를 일반 프로젝트가 아닌 런타임 홈으로 재정의
- 활성 문서 / 생성물 / 보관본 구분 명시
- 일반 프로젝트 출력은 `docs/agent/output/90_*`가 기본임을 명시
- `workspace_homes`는 기본값이 아니라 예외 경로라고 명시

### 2. overview 허브 재구성

수정:

- `C:\Users\kshcg\.codex\docs\README.md`
- `C:\Users\kshcg\.codex\docs\01_overview\README.md`
- `C:\Users\kshcg\.codex\docs\01_overview\important_sharing_rules.md`
- `C:\Users\kshcg\.codex\docs\01_overview\important_integration_rules.md`
- `C:\Users\kshcg\.codex\docs\01_overview\docs_reclassification_review.md`

신규:

- `C:\Users\kshcg\.codex\docs\01_overview\active_surface_map.md`

반영 내용:

- overview의 첫 문서를 `active_surface_map.md`로 고정
- overview 문서가 “무엇을 먼저 읽고 무엇을 나중에 볼지” 결정하는 역할을 하도록 재편
- 공유/연동 문서에서 `60_*` 기준 설명 제거

### 3. 서브프로젝트 현재 문서 정렬

수정:

- `C:\Users\kshcg\.codex\src\codex_multi_workspace\README.md`
- `C:\Users\kshcg\.codex\src\codex_multi_workspace\docs\PROJECT_KNOWLEDGE_BASE.md`
- `C:\Users\kshcg\.codex\src\codex_multi_workspace\docs\RESUME_UPGRADE_RUNBOOK.md`
- `C:\Users\kshcg\.codex\src\codex_multi_workspace\codex_launcher.py`

핵심 정리:

- 터미널 기본 실행은 `profile home`
- `workspace home`은 VSCode 확장/호환 경로
- startup prompt 템플릿도 출력/아카이브보다 기준 문서를 먼저 읽게 수정

### 4. notify / handoff 구형 참조 정리

수정:

- `C:\Users\kshcg\.codex\prompts\read_codex_output.md`
- `C:\Users\kshcg\.codex\src\notify\docs\CODEX_NOTIFY_EVENTS.md`
- `C:\Users\kshcg\.codex\src\notify\30_AGENT_LAST_WORK_REPORT.md`
- `C:\Users\kshcg\.codex\src\devsynth\70_HANDOFF.md`
- `C:\Users\kshcg\.codex\src\codex_shared_tui\70_HANDOFF.md`

반영 내용:

- `60_*_CODEX_OUTPUT.md` 설명을 활성 문서에서 제거
- 출력 파일은 `docs/agent/output/90_*` 기준으로 통일
- 과거 전달 보고서는 “현재 시작 문서 아님”을 명시

### 5. 퇴역 문서 분리

이동:

- `C:\Users\kshcg\.codex\70_TRANSFER_CLEANUP_GUIDE.md`
  -> `C:\Users\kshcg\.codex\docs\90_archive\root_docs\70_TRANSFER_CLEANUP_GUIDE_2026-03-29.md`

추가:

- `C:\Users\kshcg\.codex\docs\90_archive\root_docs\README.md`

의도:

- 과거 전달용 정리 문서가 루트 활성 허브에 남아 다음 시작을 오염시키지 않게 분리

## 이번에 일부러 남긴 것

### `workspace_homes`

남김.

이유:

- `C:\Users\kshcg\.codex\src\codex_multi_workspace\src\extension.ts`가 아직 사용
- 완전 삭제는 기능 회귀 위험이 큼
- 대신 문서상 기본값에서 제외하고 예외/호환 경로로 강등

### 역사 보고서와 archive

남김.

이유:

- 현재 기준은 아니지만, 구현 근거와 과거 판단 기록으로는 가치가 있음
- 삭제보다 “첫 읽기 대상에서 제외”하는 편이 안전

## 검증

### Python 문법

- `C:\Users\kshcg\AppData\Local\Programs\Python\Python313\python.exe -m py_compile C:\Users\kshcg\.codex\src\codex_multi_workspace\codex_launcher.py`
- 결과: 통과

### diff 형식 점검

- `.codex` 저장소에서 변경 대상 파일만 지정해 `git diff --check` 수행
- 결과: 통과
- 비고: LF -> CRLF 경고만 있었고, 형식 오류는 없었음

### 구형 참조 재검색

- 활성 문서 범위에서 `60_*` 출력 기준 설명 제거 확인
- `70_TRANSFER_CLEANUP_GUIDE.md`는 archive 경로로 이동 확인

## 최종 결론

- `.codex`의 현재 혼선 원인은 “문서가 많다”보다 “활성 허브가 오래된 기본값을 계속 노출한다”에 있었다.
- 따라서 이번 턴의 최적화는 전체 문서 삭제가 아니라, 활성 허브 재작성 + 현재 README 정렬 + 퇴역 문서 archive 분리가 핵심이었다.
- 다음 작업자는 이제 루트 기준 문서와 `docs/01_overview/active_surface_map.md`만 먼저 읽어도 현재 흐름을 잡을 수 있다.
