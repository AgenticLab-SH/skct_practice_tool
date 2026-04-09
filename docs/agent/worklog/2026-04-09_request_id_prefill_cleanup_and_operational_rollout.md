# 2026-04-09 신청번호 프리필 정리 및 운영 반영
작성일시: 2026-04-09 09:15:00 KST

## 사용자 요청
- 운영 화면의 고급 이용 안내 로그인 입력칸에 `REQ-MNQ8YWJO-I37J` 같은 신청번호가 자동으로 들어가는 현상을 확인해달라.
- 이전에 로컬에서만 끝난 TODO 전체 정리와 로그인 ID/이메일 정리를 함께 운영 반영해달라.

## 원인
- 운영 `origin/main` 기준 옛 코드에서는 최근 신청 정보를 `localStorage`에 저장했고, 고급 안내 모달을 열 때 `lookupIdentifier`가 없으면 `requestId`를 그대로 fallback 해 로그인 입력칸에 다시 채웠다.
- 그래서 `Ctrl+F5`로 정적 파일을 다시 받아도, 같은 브라우저 저장값이 남아 있으면 `REQ-...`가 다시 보일 수 있었다.

## 수정
- [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js)
  - 최근 신청 정보는 이메일 형태만 유효한 값으로 인정하도록 정규화 로직을 추가했다.
  - `sessionStorage`의 현재값과 `localStorage`의 레거시값을 함께 검사하되, 이메일이 아닌 값은 즉시 삭제하게 했다.
  - 예전 `localStorage`에 남아 있던 `requestId` 전용 값은 모달을 열 때 자동 제거되도록 만들었다.
- [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html)
  - `site-text-config.js`, `main.js` 버전을 올려 운영 CDN 캐시를 강제로 갱신하게 했다.
- [admin.html](/C:/dev/01_career/_assets/tools/skct_tool/admin.html)
  - 운영 관리자 페이지도 최신 사이트 문구 파일을 강제로 다시 받도록 버전을 올렸다.

## 포함한 운영 반영 범위
- TODO 전체 일괄 처리분
- 개인 학습자료 보관함 페이지 및 관련 정적 자산
- `database.rules.json`의 `userStudyLibrary`, `advancedAccountLicenses` 관련 운영 rules
- 공개 로그인 `이메일 또는 로그인 ID` 정리
- 신청번호 공개 노출 제거 및 신청 조회 이메일 전환
- 이번 레거시 `REQ-...` 자동채움 정리

## 로컬 검증
- `node --check main.js`
- `node --check site-text-config.js`
- Playwright로 아래 시나리오 확인
  - 옛 `localStorage` 값 `{ "requestId": "REQ-MNQ8YWJO-I37J" }`를 넣은 뒤 고급 안내를 열면 로그인 입력칸이 비어 있고, `localStorage/sessionStorage` 값도 함께 제거됨
  - 신청 조회 입력란에 `REQ-TEST-1234`를 넣으면 이메일 전용 안내 문구가 즉시 표시됨
  - mock 기반 분기 검증에서 `REQ-TEST-1234` 로그인 실패, `manualOnlyId` 로그인 성공, `me@example.com` 로그인 성공 확인

## 운영 반영 메모
- GitHub Pages는 `origin/main` push 후 자동 배포된다.
- Firebase RTDB rules는 `npx firebase-tools deploy --only database --project skct-tool`로 별도 반영한다.
