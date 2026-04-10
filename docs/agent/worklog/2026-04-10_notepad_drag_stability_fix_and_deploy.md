# 메모장 drag 깜박임 완화 및 운영 반영
작성일시: 2026-04-10 20:48:28 +09:00

## 사용자 요청
- 메모장 drag가 이상하게 되는 문제를 해결
- 깜박거리고 제대로 drag 안 되는 경우를 개선
- 서버에 반영

## 원인 판단
- 기존 메모장 보조 로직은 drag가 시작되면 pointer 위치와 상관없이 `requestAnimationFrame` 루프를 계속 돌면서 selection 상태를 매 프레임 관찰했다.
- selection 보조 확장도 너무 자주 개입해 native textarea selection과 충돌할 여지가 있었고, 이 때문에 drag 중 깜박임이나 끊김처럼 느껴질 수 있었다.
- drag 시작 anchor를 `requestAnimationFrame` 뒤에 잡는 구조도 빠른 drag에서 시작점이 늦게 고정되는 불안 요소였다.

## 수정 내용
- `main.js`
  - 메모장 auto-scroll 루프는 pointer가 상하 edge 근처에 있을 때만 돌게 조정했다.
  - selection이 실제로 멈춘 프레임이 누적된 경우에만 보조 확장을 넣도록 `NOTEPAD_SELECTION_STALL_FRAME_LIMIT` 기준을 추가했다.
  - drag 시작 anchor는 `pointerdown` 시점에 바로 고정하도록 바꿨다.
  - 이벤트 추적 안정성은 유지하기 위해 document pointer/mouse 리스너의 capture 단계는 유지했다.
- 캐시 버전 갱신
  - `build-info.js`
  - `main.js` fallback build info
  - `index.html`
  - `admin.html`
  - `study-archive.html`
  - `extension-info.html`
  - `staging/site/index.html`

## 검증
### 로컬
- `node --check main.js`
- Playwright 로컬 확인
  - drag 1회: `selectedLength 3589`, `scrollTop 1520`
  - drag 1회 추가: `selectedLength 5309`, `scrollTop 2240`
  - 전체 선택 후 클릭: `selectedLength 0`

### 운영
- `public-clean` 브랜치 배포 후 확인
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/build-info.js`
  - `v2026.04.10.2048`
  - `assetVersion 202604102048`
- `curl.exe -I https://agenticlab-sh.github.io/skct_tool/admin.html`
  - 차단 페이지 기준 `200 OK`
- Playwright 라이브 확인
  - 전체 선택 후 클릭: `selectedLength 0`

## 반영 결과
- 공개 배포 브랜치 커밋: `c605166`
