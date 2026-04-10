# 메모장 drag native selection 복귀 및 운영 반영
작성일시: 2026-04-10 21:04:27 +09:00

## 사용자 요청
- 메모장 drag가 이상하게 되는 문제를 해결
- 깜박거리고 제대로 drag 안 되는 경우를 개선
- 서버에 반영

## 원인 판단
- 메모장 custom drag 보조 자체가 native textarea selection과 계속 충돌하고 있었다.
- 부분 보정으로는 수치상 통과해도 실제 체감에서 여전히 이상하게 느껴질 가능성이 커서, custom 보조를 유지한 채 미세 조정하는 방향은 중단했다.
- 이번에는 drag를 브라우저 기본 동작으로 되돌리는 편이 더 안정적이라고 판단했다.

## 수정 내용
- `main.js`
  - 메모장 custom drag/auto-scroll 보조 로직을 제거했다.
  - drag와 selection은 브라우저 기본 textarea 동작에 맡겼다.
  - 메모장 상호작용 직후 계산기 포커스가 끼어들어 끊겨 보이지 않도록 짧은 suppression만 남겼다.
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
  - drag 1회: `selectedLength 4536`, `scrollTop 1880`
  - 전체 선택 후 클릭: `selectedLength 0`

### 운영
- `public-clean` 브랜치 배포 후 확인
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/build-info.js`
  - `v2026.04.10.2104`
  - `assetVersion 202604102104`
- `curl.exe -I https://agenticlab-sh.github.io/skct_tool/admin.html`
  - 차단 페이지 기준 `200 OK`
- Playwright 라이브 확인
  - drag 1회: `selectedLength 4894`, `scrollTop 1880`
  - 전체 선택 후 클릭: `selectedLength 0`

## 반영 결과
- 공개 배포 브랜치 커밋: `415950f`
