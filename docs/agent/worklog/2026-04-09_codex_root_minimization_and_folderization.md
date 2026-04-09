# .codex 루트 최소화 및 폴더화 작업 기록
작성일시: 2026-04-09 11:22:37 +09:00

## 요청

- `.codex`가 너무 복잡해 보이는 문제를 깊게 생각해서 실제 정리 수행
- 앞으로도 파일이 체계적인 폴더 구조 아래 생성되도록 규칙 수정

## 핵심 판단

이번 턴의 판단은 아래와 같았다.

1. `.codex`의 복잡도는 “문서가 많아서”보다 “활성 문서, 런타임 상태, 임시물, 보관본이 한 루트에 같이 보이기 때문”이다.
2. Codex 본체 상태 파일(`config.toml`, `auth.json`, `history.jsonl`, `*.sqlite*`)은 루트에 남을 수밖에 있다.
3. 따라서 실질적인 개선은 “루트를 완전히 비우기”가 아니라 “사람이 만드는 조건부 문서를 루트에서 몰아내기”다.

## 수치로 확인한 복잡도

재귀 파일 수 기준 관찰:

- `_trash`: 13,793
- `tmp`: 3,658
- `src`: 2,128
- `.tmp`: 1,381
- `chrome_debug_profile`: 1,225
- `vendor`: 1,220
- `skills`: 501
- `docs`: 50

결론:

- 사람이 실제로 읽는 문서보다, 런타임 흔적과 보관본이 훨씬 많다.
- 즉 루트 복잡도는 문서 설계보다 런타임 홈 특성의 영향이 더 크다.

## 설계 원칙

### 루트에 남기는 것

- 고정 진입점 문서:
  - `AGENTS.md`
  - `10_ENV_RULES.md`
  - `20_USER_REQUIREMENTS.md`
  - `30_MASTER_DOC.md`
  - `35_LEARNING_NOTES.md`
- Codex 본체 상태 파일:
  - `config.toml`
  - `auth.json`
  - `history.jsonl`
  - `*.sqlite*`
  - `.shared_chrome_env`

### 루트에서 내리는 것

- 조건부 보고서
- 전달 정리 문서
- 루트 prompt 잔여물
- 비밀 환경 파일

### 새 폴더 원칙

- `.codex` 전용 조건부 보고서: `docs/00_runtime_home/reports/`
- 퇴역 root 문서: `docs/90_archive/root_docs/`
- 비밀 환경 파일: `private/`

## 백업

이번 턴 수정 전 백업:

- `C:\Users\kshcg\.codex\backup\20260409_111400_runtime_home_folderization`

## 수행 내용

### 1. 규칙 문서 개정

수정:

- `C:\Users\kshcg\.codex\AGENTS.md`
- `C:\Users\kshcg\.codex\10_ENV_RULES.md`
- `C:\Users\kshcg\.codex\30_MASTER_DOC.md`
- `C:\Users\kshcg\.codex\35_LEARNING_NOTES.md`

반영:

- `.codex` 루트는 고정 진입점만 허용
- 조건부 문서는 `docs/00_runtime_home/reports/`
- 퇴역 root 문서는 `docs/90_archive/root_docs/`
- 비밀 환경 파일은 `private/` 우선

### 2. 새 폴더 구조 추가

생성:

- `C:\Users\kshcg\.codex\docs\00_runtime_home\README.md`
- `C:\Users\kshcg\.codex\docs\00_runtime_home\reports\README.md`
- `C:\Users\kshcg\.codex\docs\00_runtime_home\reports\2026-04-09_runtime_home_folderization_report.md`
- `C:\Users\kshcg\.codex\docs\90_archive\root_docs\00_PROMPT_legacy_root.md`

### 3. 허브 문서 갱신

수정:

- `C:\Users\kshcg\.codex\docs\README.md`
- `C:\Users\kshcg\.codex\docs\01_overview\README.md`
- `C:\Users\kshcg\.codex\docs\01_overview\active_surface_map.md`
- `C:\Users\kshcg\.codex\docs\01_overview\important_sharing_rules.md`
- `C:\Users\kshcg\.codex\docs\01_overview\important_integration_rules.md`

반영:

- `docs/00_runtime_home/`를 overview보다 앞단의 구조 정책으로 승격
- `.codex` 조건부 보고서를 루트가 아니라 `reports/`로 읽게 안내

### 4. 실제 루트 파일 정리

삭제:

- `C:\Users\kshcg\.codex\00_PROMPT.md`
- `C:\Users\kshcg\.codex\50_AGENT_LAST_WORK_REPORT.md`

이동:

- `C:\Users\kshcg\.codex\.discord_env`
  -> `C:\Users\kshcg\.codex\private\.discord_env`

### 5. 로더 경로 수정

수정:

- `C:\Users\kshcg\.codex\src\notify\scripts\load_discord_env_from_user.sh`
- `C:\Users\kshcg\.codex\src\notify\scripts\discord_env_bootstrap.py`

반영:

- 새 우선 경로 `private/.discord_env`
- 이전 루트 `.discord_env`는 fallback으로만 유지

## 검증

### Python 문법

- `C:\Users\kshcg\AppData\Local\Programs\Python\Python313\python.exe -m py_compile`
  - `C:\Users\kshcg\.codex\src\codex_multi_workspace\codex_launcher.py`
  - `C:\Users\kshcg\.codex\src\notify\scripts\discord_env_bootstrap.py`
- 결과: 통과

### diff 형식

- `.codex` 저장소에서 변경 파일 기준 `git diff --check`
- 결과: 통과
- 비고: LF -> CRLF 경고만 있었고 형식 오류는 없음

### 구조 확인

- 루트 `00_PROMPT.md`: 없음
- 루트 `50_AGENT_LAST_WORK_REPORT.md`: 없음
- 루트 `.discord_env`: 없음
- `private/.discord_env`: 존재

## 남긴 예외

- `config.toml`, `auth.json`, `history.jsonl`, `*.sqlite*`, `.shared_chrome_env`는 루트에 남겼다.
- 이유:
  - Codex 본체 또는 연결된 래퍼가 직접 읽는 파일이기 때문

## 최종 결론

- `.codex`는 일반 프로젝트처럼 루트를 깨끗하게 만드는 대상이 아니라, 루트 자격이 있는 파일만 남기는 대상으로 보는 것이 맞다.
- 이번 턴의 핵심 개선은 문서 개수 축소가 아니라, 사람이 만드는 조건부 파일의 생성 위치를 폴더로 강제한 것이다.
- 앞으로 `.codex` 자체 보고서나 정리 문서는 루트가 아니라 `docs/00_runtime_home/reports/`에서 시작하는 것이 현재 기준이다.
