# SKCT Tool Firebase Functions 준비 메모
작성일시: 2026-04-09 23:02:00 +09:00

이 폴더는 GitHub Pages 정적 앱에서 직접 RTDB를 두드리던 민감 흐름을, 나중에 Firebase Functions로 분리해 붙이기 위한 준비물입니다.

## 목적

- 수동 이용권 신청 저장
- 신청 조회용 lookup key 조회
- 신청 레코드 조회
- 고급 계정 라이선스 레코드 조회

위 4가지는 브라우저가 RTDB를 직접 읽고 쓰지 않아도 되도록 서버 경유 경로를 먼저 만들어 두는 용도입니다.

## 현재 구조

- 함수 이름: `skctSecureApi`
- 예상 엔드포인트 예시:
  - `https://REGION-PROJECT.cloudfunctions.net/skctSecureApi/subscription/request`
  - `https://REGION-PROJECT.cloudfunctions.net/skctSecureApi/subscription/lookup`
  - `https://REGION-PROJECT.cloudfunctions.net/skctSecureApi/subscription/request-record`
  - `https://REGION-PROJECT.cloudfunctions.net/skctSecureApi/advanced/license`

## 연결 방식

- 메인 공개 앱은 `config/manualSubscriptionConfig.secureApiBaseUrl` 값이 비어 있으면 기존 direct RTDB 경로를 그대로 씁니다.
- 이 값이 채워지면 위 보안 API를 우선 사용합니다.
- 즉, 운영 반영 순서는 다음이 안전합니다.
  1. Functions 배포
  2. 관리자 페이지에서 `보안 API 기본 URL` 저장
  3. 충분히 확인한 뒤 RTDB rules 추가 잠금
