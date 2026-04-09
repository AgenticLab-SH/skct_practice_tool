# 메모장 드래그 끊김 및 커서 수정 작업 기록
작성일시: 2026-04-09 14:20:58 KST

사용자 요청은 메모장에서 드래그 선택을 할 때 중간에 막힌 듯 끊기는 느낌을 줄이고, 메모장 커서를 작은 검은 십자가 느낌으로 바꾸며, 확인 후 운영에 반영하는 것이었다.

## 왜 문제였는가
- 메모장 `textarea`는 하단 경계 근처에서 native auto-scroll 동작이 브라우저마다 다르게 보였다.
- 특히 드래그가 계속되고 있어도 선택 끝점이 충분히 내려가지 않아, 사용자는 어느 지점에서 선택이 막힌 것처럼 느낄 수 있었다.
- 드래그가 끝나는 순간 계산기 영역 포커스가 개입하면 체감상 끊김이 더 크게 보일 수 있었다.

## 이번에 적용한 수정
- `main.js`
- 메모장 드래그 중 포인터 Y 위치를 추적하고, 상하 경계 근처에서는 `requestAnimationFrame` 기반 auto-scroll 보조를 추가했다.
- capture 단계 `mouse`와 `pointer` 이벤트를 함께 받아 브라우저별 selection 이벤트 차이를 줄였다.
- auto-scroll은 내려가지만 selection 끝점이 멈추는 브라우저를 위해, 다음 줄 경계까지 보조 확장하는 fallback을 넣었다.
- 드래그 종료 직후 계산기 포커스가 바로 끼어들지 않도록 짧은 suppression 구간을 넣었다.
- `main.css`
- 메모장 래퍼를 flex 기반으로 단순화하고 overflow 경계를 정리했다.
- 메모장 커서를 `crosshair`로 지정해 검은색 십자가 느낌으로 통일했다.
- `build-info.js`, `index.html`, `admin.html`, `study-archive.html`
- 운영 캐시 갱신을 위해 자산 버전을 `202604091417`로 올렸다.

## 검증
- `node --check main.js` 통과
- Playwright MCP로 로컬 `127.0.0.1:8129`에서 `1366x768`, `1920x1080`, `390x844`를 확인했다.
- 번들 브라우저 경로를 직접 사용한 자동 검증으로 아래를 확인했다.
- Chromium `1366x768`: `scrollTop 2952`, `endLine 176`, `cursor crosshair`
- Firefox `1366x768`: `scrollTop 1801`, `endLine 100`, `cursor crosshair`
- WebKit `1366x768`: `scrollTop 462`, `endLine 40`, `cursor crosshair`
- Chromium `1920x1080`: `scrollTop 2068`, `endLine 114`, `cursor crosshair`
- Chromium `390x844`: `scrollTop 2948`, `endLine 178`, `cursor crosshair`
- Firefox `390x844`: `scrollTop 1871`, `endLine 104`, `cursor crosshair`

## 판단
- Chromium과 Firefox에서는 사용자가 느끼던 하단 경계 끊김이 크게 완화됐고, 모바일 폭에서도 selection이 계속 이어졌다.
- WebKit은 selection 확장 폭이 더 보수적이지만 auto-scroll 자체는 유지됐다.
- 운영 반영 시에는 자산 버전이 올라가므로 기존 캐시 때문에 예전 JS/CSS가 남는 가능성도 낮아진다.

## 운영 반영 결과
- `main` 반영 커밋은 `262f73e`이다.
- GitHub Pages run `24173838768`가 성공으로 끝났다.
- 라이브 HTML은 `main.css?v=202604091417`, `main.js?v=202604091417`, `build-info.js?v=202604091417`를 가리킨다.
- 라이브 페이지에서 메모장 커서가 `crosshair`로 계산되고, drag selection 테스트 결과 `scrollTop 2946`, `endLine 177`까지 내려가는 것을 확인했다.
