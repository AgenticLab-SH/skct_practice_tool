# 메모장 클릭 전체선택 오동작 수정 및 운영 반영
작성일시: 2026-04-10 11:30:12 +09:00

## 요청 요약

- 일반 모드와 고급 모드 메모장이 같은지 확인한다.
- 메모장 안을 클릭하면 `Ctrl+A`처럼 전체 선택되는 문제를 고친다.
- 일반 메모장처럼 동작하게 만든 뒤 서버에 반영한다.

## 판단

- 일반 모드와 고급 모드는 같은 `#notepad` 입력창과 같은 메모장 이벤트 로직을 공유한다.
- 따라서 이번 문제는 일반/고급을 따로 고치는 일이 아니라, 공통 메모장 선택 처리 로직을 바로잡는 작업이다.

## 원인

- `2026-04-09`에 들어간 메모장 drag auto-scroll 보조가 `pointerdown` 순간부터 바로 drag selection 상태를 켜고 있었다.
- 이 구조는 브라우저의 native caret 이동과 충돌할 수 있고, 클릭만 했는데도 selection 상태가 비정상적으로 남거나 전체 선택처럼 보이는 원인이 된다.
- 여기에 `pointer*`와 `mouse*`를 같이 걸어 두어 같은 시작 이벤트가 중복으로 들어갈 여지도 있었다.

## 수정 내용

- `main.js`
  - 메모장 drag selection 보조는 이제 실제 이동 거리가 `4px` threshold를 넘겼을 때만 시작한다.
  - 단순 클릭은 native textarea 동작에 맡겨 caret만 이동하게 정리했다.
  - `pointer` 이벤트 지원 브라우저에서는 `pointerdown/move/up/cancel`만 사용하고, 그렇지 않을 때만 `mouse` fallback을 사용하게 바꿨다.
  - anchor 위치는 클릭 직후 native caret가 반영된 뒤 잡도록 조정했다.
- 캐시 꼬임 방지
  - `build-info.js`
  - `main.js` fallback build info
  - `index.html`
  - `admin.html`
  - `staging/site/index.html`
  - 위 파일의 버전을 `202604101124`, `v2026.04.10.1124`로 올렸다.

## 검증

### 로컬

- `node --check main.js` 통과
- Playwright 확인
  - `전체 선택 상태에서 클릭 -> selectedLength 0`
  - `실제 드래그 -> selectedLength 608, scrollTop 378`

### 운영

- `public-clean` 브랜치에 공개 파일 반영 후 push
- 라이브 `build-info.js` 확인
  - `v2026.04.10.1124`
  - `assetVersion 202604101124`
- 라이브 메모장 Playwright 확인
  - `전체 선택 상태에서 클릭 -> selectedLength 0`

## 반영 결과

- 작업 브랜치 커밋: `65b2702`
- 공개 배포 브랜치 커밋: `92f31d1`
- 공개 운영 URL: `https://agenticlab-sh.github.io/skct_tool/`

## 문서 동기화

- `docs/SKCT_TOOL_기능_카탈로그.md` 갱신
- `docs/agent/runtime/30_MASTER_DOC.md` 갱신
- `docs/agent/runtime/35_LEARNING_NOTES.md` 갱신
- `50_AGENT_LAST_WORK_REPORT.md` 갱신
