# 그림판 커서 원형 프리뷰 제거 및 얇은 십자 복구 작업 기록
작성일시: 2026-04-09 19:48:35 KST

사용자 요청은 그림판 커서를 원 없는 일반 얇은 십자로 바꾸고, 실제 운영에 반영하는 것이었다.

## 왜 문제였는가
- 현재 그림판은 브라우저 기본 커서를 숨기고 `canvas-cursor-indicator`라는 커스텀 커서를 따로 그리고 있었다.
- 이 커스텀 커서는 십자 선 위에 원형 ring 프리뷰가 같이 붙어 있어서, 사용자가 기대한 단순 조준점보다 더 두껍고 복잡하게 보였다.

## 이번에 적용한 수정
- `main.css`
- 그림판 커서 인디케이터 크기를 줄이고, 가로/세로 선 두께를 1px로 낮췄다.
- 원형 ring 요소는 `display: none`으로 숨겨, 외형이 일반 얇은 십자로만 보이게 정리했다.
- `build-info.js`, `index.html`, `admin.html`, `study-archive.html`
- 운영 캐시 갱신을 위해 자산 버전을 `202604091948`로 올렸다.
- `docs/SKCT_TOOL_기능_카탈로그.md`, `35_LEARNING_NOTES.md`, `50_AGENT_LAST_WORK_REPORT.md`
- 현재 기능 기준과 재발 방지 메모를 함께 갱신했다.

## 로컬 검증
- `http://127.0.0.1:8131/index.html?t=canvas-cursor-202604091948`에서 그림판 탭을 열고 계산 스타일을 확인했다.
- `canvas-cursor-ring`의 `display`는 `none`으로 계산됐다.
- `canvas-cursor-indicator::before` 높이는 `1px`, `::after` 너비는 `1px`로 계산됐다.
- `drawingBoard` 자체 커서는 계속 `none`이라 브라우저 기본 화살표가 섞이지 않았다.

## 운영 검증 계획
- GitHub Pages 반영 후 `main.css?v=202604091948`와 라이브 페이지 계산 스타일을 다시 확인한다.
