# 고급 팝업 OMR 정상화 및 고급 안내 배포
작성일시: 2026-04-10 00:40:27 +09:00

## 요청

- 고급 모드 팝업에서 `연습 OMR`을 열었을 때 긴 중간 설명 때문에 아래 버튼이 안 보이는 문제를 고친다.
- 고급 모드 팝업에서 OMR 입력칸이 사라진 것처럼 보이는 문제를 정상화한다.
- `고급 기능 안내`의 깨진 글씨 이미지, 어긋난 강조, 도움말과 겹치는 설명을 정리한다.
- 로컬 검증 후 바로 운영 `public-clean`까지 배포한다.

## 수행 내용

### 1. 팝업 OMR 레이아웃 정상화

- `main.js`에 `body.popup-mode` 클래스를 명시적으로 주입해, 팝업 전용 CSS 훅을 안정적으로 쓸 수 있게 했습니다.
- `main.css`에서 `omr-body`의 고정 `40vh` 제한을 제거하고 최소 높이를 보장해, OMR 입력칸이 너무 작아지지 않도록 바꿨습니다.
- `고급 버튼 빠른 설명` 패널은 `고급 복기 순서` 압축형 패널로 바꾸고, 팝업에서는 긴 lead/hint를 숨겨 `정답 입력 -> 채점 확인 -> 복기 버튼` 3단계만 보이게 조정했습니다.

### 2. 고급 기능 안내 정상화

- `index.html`의 `advancedFeatureModal`에서 이미지 2장을 제거하고, `상단 상태 바`와 `OMR 아래 복기 구역`을 설명하는 CSS 도식 카드로 교체했습니다.
- 일반 도움말과 중복되는 설명은 줄이고, 고급 모드에서만 달라지는 위치와 사용 흐름 위주로 문구를 다시 정리했습니다.
- `site-text-config.js` 기본값, 카탈로그 라벨, legacy migration을 함께 갱신해 운영 `siteTextConfig`의 예전 문구가 새 레이아웃을 부분적으로 덮지 않게 맞췄습니다.

### 3. 공개 배포 번들 정리

- `scripts/export_public_clean.ps1`에 `advanced-tools.html`을 포함시켜, 공개 배포에서도 고급 팝업 인증 페이지가 실제로 열리도록 복구했습니다.
- `admin.html` 차단 stub 유지 정책은 그대로 두었습니다.
- 자산 버전은 `build-info.js`와 `index.html`/`admin.html` query string을 `202604101045` 기준으로 갱신했습니다.

## 검증

### 로컬 검증

- `node --check main.js`
- `node --check site-text-config.js`
- 로컬 정적 서버 `http://127.0.0.1:4175/`에서 Playwright로 팝업 강제 상태를 재현했습니다.
- 팝업 + 고급 모드 강제 상태에서 OMR 입력칸, `과목별 상세 통계`, `문항별 상세 통계 TXT 다운로드`, `정오표 일괄입력`, `RESET` 버튼이 함께 보이는 것을 확인했습니다.
- `advancedFeatureModal`은 이미지 대신 도식 카드가 보이고, `advancedFeatureIntro/summary/plan` 문구가 새 기본값으로 마이그레이션되는 것을 확인했습니다.

### 라이브 검증

- `https://agenticlab-sh.github.io/skct_tool/build-info.js`에서 `v2026.04.10.1045` 확인
- `https://agenticlab-sh.github.io/skct_tool/advanced-tools.html` -> `200 OK`
- `https://agenticlab-sh.github.io/skct_tool/admin.html` -> 차단 페이지 기준 `200 OK`

## 배포 기록

- 작업 브랜치 코드 커밋: `377e616` (`fix: normalize advanced popup omr guide`)
- 공개 배포 브랜치 커밋: `98f392a` (`chore: refresh public clean deploy bundle`)
- 원격 반영: `origin/public-clean`까지 push 완료

## 비고

- 이번 반영에서는 운영 Firebase 기본값이나 RTDB rules는 변경하지 않았습니다.
- 남은 큰 과제는 여전히 `Functions 배포 + secureApiBaseUrl 저장 + 민감 rules 최종 잠금`입니다.
