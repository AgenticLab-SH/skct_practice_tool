# 관리자 공지 저장 세션 재동기화 수정
작성일시: 2026-04-10 09:48:25 +09:00

## 요청

- 관리자 페이지에서 공지를 수정하려고 하면 이미 로그인된 상태인데도 `공지 저장 실패: 로그인 세션이 만료되었거나 쓰기 권한이 없습니다.`가 뜨는 원인을 찾고 해결해 달라는 요청이 있었습니다.

## 확인한 내용

- `database.rules.json` 기준으로 `config/*` 쓰기 권한은 `auth != null`이면 허용됩니다.
- 실패 토스트는 `admin.html`의 `runAdminSaveAction -> formatAdminSaveError` 경로에서 `permission-denied`를 만나면 노출됩니다.
- 저장 직전에는 `auth.currentUser.getIdToken()`만 확인하고 있었고, RTDB 연결 자체를 다시 붙이는 절차는 없었습니다.
- 이 구조에서는 Firebase Auth 사용자 객체가 살아 있어도 Realtime Database 연결이 예전 인증 상태를 유지하면 첫 쓰기에서 `permission-denied`가 날 수 있습니다.

## 수정 내용

- `admin.html`에 `goOffline`, `goOnline`을 추가로 import했습니다.
- `waitForDatabaseReconnect()`를 만들어 `goOnline()` 뒤에 `.info/connected`가 다시 살아날 때까지 짧게 기다리도록 했습니다.
- `syncAdminDatabaseAuth()` 공통 함수를 추가해 `토큰 확인 -> 필요 시 RTDB 재연결`을 한 번에 처리하도록 바꿨습니다.
- `runAdminDatabaseWrite()`는 첫 시도에서 `permission-denied`가 나면 `forceRefresh + RTDB 재연결`을 수행한 뒤 같은 쓰기를 한 번 더 자동 재시도하도록 바꿨습니다.
- `onAuthStateChanged()`에서도 대시보드 진입 전에 RTDB 연결을 한 번 다시 맞추도록 바꿨습니다.
- 저장 실패 토스트는 `세션 없음/토큰 확인 실패`와 `권한 재확인 실패`를 더 정확히 구분해 안내하도록 문구를 보강했습니다.

## 검증

- `http://127.0.0.1:8136/admin.html` 로 로컬 관리자 페이지를 열어 초기 로드와 로그인 화면 노출을 확인했습니다.
- Playwright 콘솔 점검에서 새 JS 오류는 없었고, 치명적 에러 없이 관리자 페이지가 로드되는 것을 확인했습니다.
- 실제 Firebase 관리자 계정 자격정보가 이 세션에 없어서, 실로그인 후 저장 버튼까지 끝단 검증은 수행하지 못했습니다.

## 판단

- 이번 수정은 공개 GitHub Pages 화면이 아니라 로컬 관리자 도구의 저장 경로를 안정화하는 작업입니다.
- 공개 배포의 `admin.html`은 계속 차단 페이지여야 하므로, 이번 수정은 `public-clean`에 억지로 올리는 것보다 로컬 관리자 소스에 반영하는 것이 맞습니다.
- 기능 문서와 기준서에는 운영자 체감 동작 변화만 반영했습니다.
