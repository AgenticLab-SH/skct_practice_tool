# 남은 TODO 안전 실행
작성일시: 2026-04-09 23:13:20 +09:00

## 1. 요청

- 사용자가 원래 TODO에서 남아 있던 항목을 계속 진행하되, 문제 없이 안전하게 처리해 달라고 요청했습니다.
- 기존 합의 사항은 유지했습니다.
  - 운영 서버와 운영 Firebase는 건드리지 않음
  - 커뮤니티 유지
  - 활성 세션 유지
  - 확장 ZIP은 별도 안내 페이지 유지

## 2. 이번 턴의 목표

- 로컬 상태를 다시 백업 고정
- 배포 경계 분리 준비
- RTDB 공개 쓰기 경로의 검증 강화
- 민감 흐름의 서버 경유 준비 코드 추가
- 운영자가 나중에 실제 반영할 때 필요한 TODO 문서화

## 3. 수행 내용

### 3.1 백업 고정
- 현재 로컬 상태를 `chore: checkpoint local hardening and docs split` 커밋으로 고정했습니다.
- 추가 백업 기준:
  - 브랜치: `backup/20260409_225421-remaining-todo-start`
  - 태그: `backup-20260409_225421-remaining-todo-start`

### 3.2 민감 흐름 서버 경유 준비
- `functions/` 폴더를 추가하고 Firebase Functions 준비 코드를 만들었습니다.
- `functions/index.js`에는 아래 경로를 받는 `skctSecureApi`를 넣었습니다.
  - `/subscription/request`
  - `/subscription/lookup`
  - `/subscription/request-record`
  - `/advanced/license`
- 메인 앱은 `config/manualSubscriptionConfig.secureApiBaseUrl` 값이 있으면 이 서버 경로를 우선 사용하도록 바꿨고, 값이 없으면 기존 direct RTDB 경로를 fallback으로 유지합니다.
- 관리자 페이지에는 `보안 API 기본 URL` 입력을 추가했습니다.

### 3.3 RTDB rules 강화
- `database.rules.json`의 공개 쓰기 경로를 완전 차단 대신 먼저 검증 강화 방식으로 조정했습니다.
- 강화 대상:
  - `active_visitors`
  - `total_visits`
  - `daily_visits`
  - `stats/live_peak_daily`
  - `posts`
  - `replies`
  - `userLikes`
- 이 단계는 현재 기능을 최대한 살리면서 비정상 입력 폭을 줄이는 목적입니다.

### 3.4 로컬 관리자 키 브리지 제한
- `scripts/local_admin_key_bridge.py`의 허용 origin에서 `agenticlab-sh.github.io`를 제거하고 `127.0.0.1`, `localhost`만 남겼습니다.

### 3.5 배포 경계 준비
- `scripts/export_public_clean.ps1`를 추가해 공개 배포용 파일만 따로 추출할 수 있게 했습니다.
- 로컬 검증으로 `tmp/public-clean-preview`에 실제 추출 결과를 만들어 확인했습니다.

### 3.6 문서 동기화
- 구조 문서와 기준 문서를 이번 구조에 맞게 갱신했습니다.
- 새로 만든 문서:
  - `functions/README.md`
  - `docs/agent/runtime/70_USER_TODO.md`

## 4. 검증

- `node --check main.js`
- `node --check functions/index.js`
- `python -m py_compile scripts/local_admin_key_bridge.py`
- `node -e "JSON.parse(...)"`로 `database.rules.json`, `firebase.json` 파싱 확인
- `pwsh -File scripts/export_public_clean.ps1 -OutputDir tmp/public-clean-preview`

## 5. 아직 남는 수동 작업

- 운영 Firebase에 `functions/` 실제 배포
- 관리자 페이지에 `보안 API 기본 URL` 실제 저장
- secure API 동작 확인 후 민감 경로 rules 최종 잠금
- `public-clean` 브랜치 최종 생성 및 GitHub Pages 원본 전환
- `ads.txt`, `CNAME`에 들어갈 실제 값 결정

## 6. 기능 문서 변경

- 관리자/운영자 관점 기능이 바뀌어 기능 카탈로그와 구조 문서를 함께 갱신했습니다.
