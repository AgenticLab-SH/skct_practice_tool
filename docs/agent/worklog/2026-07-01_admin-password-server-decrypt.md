# 2026-07-01 관리자 신청 비밀번호 서버 확인

## 요청
- Google 관리자 로그인으로 들어오는 구조라면 로컬 복호화 없이 관리자 페이지에서 신청 비밀번호를 확인하고 싶음.
- Codex 내장 브라우저에서는 Google 로그인 콜백이 멈추거나 `auth/network-request-failed`가 발생함.

## 처리
- Firebase Functions `skctSecureApi`에 `/admin/subscription/decrypt` 라우트를 추가했다.
- 해당 라우트는 Firebase Auth bearer token을 검증하고, 허용 관리자 이메일만 신청 본문을 서버에서 복호화할 수 있다.
- 관리자 페이지의 신청 목록 `복호화` 버튼은 로컬 개인키가 있으면 기존 로컬 복호화를 쓰고, 없으면 Google 관리자 세션으로 서버 복호화를 호출하도록 변경했다.
- 복호화된 신청 본문에 `로그인 비밀번호`를 표시한다.

## 운영 기준
- 권장 관리자 주소는 `/admin/`이다.
- `admin.html`은 호환용으로 유지된다.
- Codex 내장 브라우저는 Google/Firebase Auth 콜백 처리가 불안정할 수 있으므로 실제 운영 관리는 외부 브라우저 또는 휴대폰 브라우저 기준으로 확인한다.

## 검증
- `node --check functions/index.js` 통과.
