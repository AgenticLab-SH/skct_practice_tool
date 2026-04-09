# 그림판 커서 원형 프리뷰 제거 및 얇은 십자 운영 반영
작성일시: 2026-04-09 19:52:03 KST

## 요청
- 그림판 커서를 원 없는 일반 얇은 십자로 바꾸고 운영에 반영

## 원인
- 그림판은 브라우저 기본 커서를 숨긴 뒤 `canvas-cursor-indicator`를 별도로 그리는 구조였다.
- 이때 십자선 외에 원형 ring 프리뷰가 같이 붙어 있어, 사용자가 기대한 단순 조준점보다 두껍고 복잡하게 보였다.

## 조치
- `main.css`에서 그림판 커서 인디케이터 크기를 줄이고, 가로/세로 선 두께를 각각 `1px`로 조정했다.
- `canvas-cursor-ring`은 `display: none`으로 숨겨 원형 프리뷰를 제거했다.
- 캐시 잔존을 막기 위해 `build-info.js`, `index.html`, `admin.html`, `study-archive.html`의 자산 버전을 `202604091948`로 올렸다.
- 기능 카탈로그와 운영/학습 문서를 함께 갱신했다.

## 반영
- 운영 반영 커밋: `5a77599` (`fix: simplify canvas cursor crosshair`)
- `origin/main` push 완료

## 검증
- 로컬 검증: `http://127.0.0.1:8131/index.html?t=canvas-cursor-202604091948`
- `canvas-cursor-ring` 계산값 `display: none`
- `canvas-cursor-indicator::before` 높이 `1px`
- `canvas-cursor-indicator::after` 너비 `1px`
- `drawingBoard` 계산 커서 `none`
- 라이브 검증: `https://agenticlab-sh.github.io/skct_tool/?t=canvas-cursor-live-202604091948`
- 라이브 HTML이 `main.css?v=202604091948`, `build-info.js?v=202604091948`를 참조하는 것 확인
- 라이브 페이지에서도 `ringDisplay: none`, `beforeHeight: 1px`, `afterWidth: 1px`, `canvasCursor: none` 확인
- 브라우저 콘솔 에러 없음

## 사용자 영향
- 그림판 커서는 원형 없이 얇은 십자 형태로 보인다.
- 실제 그리기 동작과 선 굵기 설정은 그대로 유지된다.
