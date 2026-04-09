# 메모장 커서 기본 텍스트 형태 복구
작성일시: 2026-04-09 17:47:30 KST

## 요청
- 메모장에서 마우스 커서가 십자가로 보이는 문제를 일반 메모장 형태의 텍스트 커서로 복구

## 원인
- `main.css`의 `#notepad`에 `cursor: crosshair;`가 직접 지정되어 있어 브라우저 기본 텍스트 커서가 막히고 있었습니다.

## 조치
- `main.css`에서 `#notepad` 커서를 `text`로 변경했습니다.
- 캐시 잔존으로 예전 CSS가 남지 않도록 `build-info.js`, `index.html`, `admin.html`의 자산 버전을 `202604091745`로 올렸습니다.
- 기능 문서와 에이전트 보존 문서를 함께 갱신했습니다.

## 반영
- 운영 반영 커밋: `b719d36` (`fix: restore notepad text cursor`)
- `origin/main` push 완료

## 검증
- 라이브 CSS 확인: `https://agenticlab-sh.github.io/skct_tool/main.css?v=202604091745` 에서 `#notepad` 커서 값이 `text`
- 라이브 페이지 확인: `https://agenticlab-sh.github.io/skct_tool/?t=cursor-verify-202604091745` 에서 `getComputedStyle(document.getElementById('notepad')).cursor === "text"`
- 브라우저 콘솔 에러 없음

## 사용자 영향
- 메모장 입력 영역은 일반 텍스트 커서로 다시 보입니다.
- 그림판/드로잉 영역의 별도 커서 동작은 그대로 유지됩니다.
