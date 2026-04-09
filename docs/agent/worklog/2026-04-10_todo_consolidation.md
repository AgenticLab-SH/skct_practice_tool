# TODO 통합 정리
작성일시: 2026-04-10 00:15:50 +09:00

## 1. 요청

- 사용자가 배포 여부를 다시 확인해 달라고 요청했습니다.
- `docs/TODO` 폴더를 읽고, 수행 완료된 항목은 worklog로 옮긴 뒤 TODO에서 제거하고, 남은 일만 하나의 TODO 문서로 통합해 달라고 요청했습니다.

## 2. 배포 확인

- 공개 운영 URL `https://agenticlab-sh.github.io/skct_tool/`는 `200 OK`로 응답하는 것을 다시 확인했습니다.
- GitHub Pages 운영 원본은 이미 `public-clean / (root)`로 전환된 상태입니다.
- 공개 `admin.html`은 실제 관리자 대시보드가 아니라 차단 안내 페이지를 반환하는 것을 다시 확인했습니다.

## 3. 정리 전 보호 조치

- 문서 덮어쓰기와 삭제 전에 원본 TODO 문서를 아래 경로로 백업했습니다.
- `_trash/20260410_001550/docs/TODO/TODO.md`
- `_trash/20260410_001550/docs/TODO/TODO1.md`
- 추가로 git 백업 기준도 만들었습니다.
  - 브랜치: `backup/20260410_0016-todo-consolidation-start`
  - 태그: `backup-20260410_0016-todo-consolidation-start`

## 4. 완료 처리한 항목

### 4.1 기존 `TODO.md`에서 완료로 본 항목

- `backup` 브랜치와 안전 백업 기준 마련
- `public-clean` 공개 배포 브랜치 준비 및 운영 Pages 전환
- 공개 배포물에서 내부 문서와 운영 파일 제거
- `meta keywords` 제거
- 숨김 SEO 문구 축소
- 확장 ZIP을 메인 앱에서 떼어 별도 안내 페이지로 분리
- `guide`, `faq`, `pricing`, `privacy`, `terms` 문서 페이지 추가
- GA4 핵심 이벤트 일부 연결
- 숨은 관리자 진입 제거
- 로컬 관리자 키 브리지의 운영 origin 허용 제거
- 민감 흐름 서버 분리용 `functions/` 준비 코드 추가

### 4.2 기존 `TODO1.md`에서 완료로 본 항목

- 루트 내부 문서 공개 경로 차단
  - `/00_PROMPT.md` -> `404`
  - `/35_LEARNING_NOTES.md` -> `404`
  - `/50_AGENT_LAST_WORK_REPORT.md` -> `404`
  - `/70_USER_TODO.md` -> `404`
- `docs/agent/*` 공개 노출 차단
  - `/docs/agent/36_HIDDEN_ADVANCED_FEATURES.md` -> `404`
  - `/docs/agent/worklog/2026-04-08_admin_password_lookup.md` -> `404`
- 공개 우회/관리 보조 페이지 차단
  - `/advanced-tools.html` -> `404`
  - `/bypass.html` -> `404`
  - `/study-archive.html` -> `404`
- `/admin.html`은 완전 삭제 대신 안전한 차단 안내 페이지로 대체

## 5. TODO에서 제외한 항목

- `커뮤니티 제거`
- `활성 세션 제거`

위 두 항목은 미완료가 아니라, 사용자가 유지하기로 명시적으로 결정했기 때문에 남은 TODO에서 제외했습니다.

## 6. 남은 일 통합 방식

- `docs/TODO/TODO.md`를 남은 일만 담는 단일 TODO 문서로 교체했습니다.
- `docs/TODO/TODO1.md`는 이 worklog에 흡수한 뒤 제거했습니다.
- 새 TODO는 현재 기준으로 실제 남은 작업만 남겼습니다.
  - Functions 실제 배포
  - 관리자 `secureApiBaseUrl` 저장과 민감 흐름 검증
  - RTDB 민감 경로 최종 잠금
  - 선택 후속: 커스텀 도메인, 광고, Search Console/GA 최종 정리

## 7. 기능 문서 변경 여부

- 기능 변화는 없고, TODO 구조와 작업 기준 문서만 정리했습니다.
