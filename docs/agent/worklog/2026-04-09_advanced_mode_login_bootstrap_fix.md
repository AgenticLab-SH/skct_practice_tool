# 고급 모드 로그인 부트스트랩 초기화 순서 수정
작성일시: 2026-04-09 10:12:59 KST

이 문서는 `SB / 123456` 계정으로 고급 모드 로그인을 시도했을 때 운영에서 고급 모드가 열리지 않던 문제를 확인하고 수정한 기록입니다.

## 요청 요약
- 사용자가 운영 페이지에서 고급 안내 로그인으로 고급 모드를 열려고 했지만, 고급 모드가 열리지 않는다고 제보했습니다.
- 실제 사용한 자격 증명은 `ID: SB`, `PW: 123456`입니다.

## 확인 결과
- 운영 RTDB `advancedAccountLicenses/sb` 레코드는 정상 존재했습니다.
- 운영 페이지에서 `window.SKCTAdvancedBridge.validateCredentialsDetailed('SB', '123456')`를 새 페이지 기준으로 직접 호출했을 때도 검증은 정상 통과했습니다.
- 즉 문제는 자격 증명 자체가 아니라, 로그인 직후 `?advanced=1` 페이지로 넘어갈 때 발생했습니다.

## 원인
- `main.js`는 시작 직후 `applyManualSubscriptionConfig()`를 기본값으로 한 번 먼저 호출하고 있었습니다.
- 이 시점에는 운영 Firebase에서 내려오는 라이선스 공개키가 아직 도착하지 않았는데도, 저장된 `skct_advanced_license_bundle`를 곧바로 검증하려고 했습니다.
- 공개키가 없으니 검증은 실패처럼 보였고, 코드가 저장된 라이선스를 즉시 삭제했습니다.
- 그 결과 로그인 자체는 성공해도, 막상 `?advanced=1`로 이동한 새 페이지는 저장된 라이선스를 잃어버린 상태가 되어 일반 모드로 되돌아갔습니다.

## 수정 내용
- `main.js`
- 초기 기본값 적용과 실제 원격 설정 적용을 분리했습니다.
- 부트스트랩 단계에서는 수동 구독 설정 UI만 렌더링하고, 저장된 고급 라이선스 동기화는 하지 않도록 바꿨습니다.
- 저장된 라이선스를 검증할 공개키 또는 검증 함수가 아직 준비되지 않았을 때는, 저장값을 지우지 않고 그대로 보류하도록 바꿨습니다.
- `index.html`
- Firebase에서 실제 `manualSubscriptionConfig`가 도착해 적용되는 호출에는 `{ source: 'remote' }`를 넘겨, 이 시점부터만 라이선스 동기화가 실행되도록 맞췄습니다.
- `index.html`
- `main.js` 캐시 버전을 `202604091010`으로 올려, 운영 브라우저가 수정된 JS를 새로 받도록 했습니다.

## 검증
- `node --check main.js`
- 로컬 서버 `http://127.0.0.1:8126/index.html`에서 저장된 라이선스를 넣고 `?advanced=1`로 직접 진입했을 때:
- URL 유지
- `body.advanced-mode === true`
- 저장된 라이선스 유지
- 운영 HTML 응답에서 `main.js?v=202604091010` 반영 확인
- 운영 페이지에서 `SB / 123456`로 실제 로그인 버튼을 눌렀을 때:
- `https://agenticlab-sh.github.io/skct_tool/?case=live-login-after-fix&advanced=1`로 이동
- `body.advanced-mode === true`
- 저장된 라이선스 유지
- 새로고침 후에도 고급 모드 유지
- 운영 페이지 콘솔 `error` 0건 확인

## 운영 반영
- 운영 반영 커밋: `ef0e08f`
- GitHub Pages 빌드 상태: `built`
- 빌드 완료 시각: 2026-04-09 10:11:48 KST
