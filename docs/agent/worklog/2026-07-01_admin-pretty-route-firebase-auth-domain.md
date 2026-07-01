# 2026-07-01 관리자 짧은 주소 및 Firebase Auth 도메인 안내

## 요청
- `admin.html` 주소가 어색하므로 더 나은 관리자 접속 주소가 가능한지 확인.
- Google 로그인 시 `auth/unauthorized-domain` 오류가 뜨는 원인과 조치 방법 확인.

## 처리
- 기존 `admin.html`은 호환용으로 유지한다.
- 동일한 관리자 화면을 `/admin/`에서도 열 수 있도록 `admin/index.html`을 추가했다.
- `/admin/` 하위 경로에서 기존 루트 자산을 그대로 읽도록 `<base href="../">`를 지정했다.
- Google 로그인 후 허용되지 않은 계정으로 돌아왔을 때 선택된 이메일과 허용 이메일을 화면에 남기도록 했다.
- 신규 구독 알림의 관리자 링크 기준도 `https://skct.agenticfabworks.com/admin/`으로 바꿨다.

## 확인
- 로컬 서버에서 `http://127.0.0.1:8765/admin/` 응답 200 확인.
- `auth/unauthorized-domain`은 코드 문제가 아니라 Firebase Authentication의 Authorized domains에 운영 도메인이 등록되지 않은 상태에서 발생한다.
- 현재 허용 관리자 이메일은 `zhdlsqpdj@gmail.com`이다.

## 운영자 조치
- Firebase Console의 `skct-tool` 프로젝트에서 Authentication 설정의 Authorized domains에 `skct.agenticfabworks.com`을 추가해야 한다.
- Google 제공업체가 꺼져 있으면 Sign-in method에서 Google을 활성화해야 한다.
