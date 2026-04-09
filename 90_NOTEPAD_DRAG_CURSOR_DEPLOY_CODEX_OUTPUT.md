# 메모장 드래그 끊김 및 커서 수정 운영 반영 보고
작성일시: 2026-04-09 14:20:58 KST

이 문서는 메모장 드래그 끊김 완화, 메모장 십자 커서 적용, 운영 반영 결과를 한 번에 정리한 보고서입니다.

## 변경 요약
- 메모장 드래그 선택 중 하단 경계에서 끊기던 느낌을 줄이기 위해 auto-scroll 보조를 넣었습니다.
- capture 단계 `mouse`/`pointer` 이벤트와 selection fallback을 추가해 브라우저별 차이를 줄였습니다.
- 드래그 종료 직후 계산기 포커스 개입을 잠깐 막아 체감 끊김을 줄였습니다.
- 메모장 커서는 `crosshair`로 맞췄습니다.
- 캐시 버전은 `202604091417`로 올렸습니다.

## 로컬 검증 요약
- `node --check main.js` 통과
- Chromium `1366x768`: `scrollTop 2952`, `endLine 176`
- Firefox `1366x768`: `scrollTop 1801`, `endLine 100`
- WebKit `1366x768`: `scrollTop 462`, `endLine 40`
- Chromium `1920x1080`: `scrollTop 2068`, `endLine 114`
- Chromium `390x844`: `scrollTop 2948`, `endLine 178`
- Firefox `390x844`: `scrollTop 1871`, `endLine 104`

## 운영 반영 결과
- 운영 반영 커밋: `262f73e`
- GitHub Pages run: `24173838768`
- 라이브 자산 버전: `main.css?v=202604091417`, `main.js?v=202604091417`, `build-info.js?v=202604091417`
- 라이브 검증: 메모장 커서 `crosshair`, drag selection `scrollTop 2946`, `endLine 177`
