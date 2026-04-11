# 2026-04-11 OMR 하단 버튼 hover 흔들림 수정 및 운영 반영

## 요청
- 일반모드와 고급모드에서 OMR을 열고, OMR 아래 버튼 구역에 마우스를 올리면 위아래로 심하게 흔들리는 현상 점검 및 수정
- 수정 후 운영 반영 요청

## 원인
- `main.css`의 `.omr-action-btn:hover`에 `transform: scale(1.02)`가 걸려 있었음
- OMR 하단 버튼은 세로 스택 구조라, 포인터 경계에서 hover 진입/이탈이 반복되면 버튼 시각 크기가 계속 바뀌며 흔들리는 체감이 날 수 있는 상태였음
- 특히 OMR 하단처럼 버튼이 촘촘한 구역에서는 이 scale 효과가 안정적이지 않음

## 적용한 수정
1. `main.css`
- `.omr-action-btn` transition을 `all`에서 아래 3개로 축소
  - `background-color`
  - `filter`
  - `box-shadow`
- `.omr-action-btn:hover`에서 `transform: scale(1.02)` 제거
- 대신 크기 변화 없는 hover 강조로 `box-shadow`만 추가

2. 캐시 버전 상향
- `build-info.js`, `main.js` fallback 버전을 `v2026.04.11.2121`, `202604112121`로 갱신
- `index.html`, `admin.html`, `study-archive.html`, `extension-info.html`, `staging/site/index.html`의 자산 query string도 함께 올림

## 반영 커밋
- 작업 브랜치 커밋: `1903e5e` (`fix: stabilize omr action hover`)
- 공개 배포 브랜치 커밋: `c8a755b` (`deploy: publish omr hover stabilization`)

## 검증
### 코드 확인
- `main.css`
  - `transition: background-color 0.15s, filter 0.15s, box-shadow 0.15s;`
  - `transform: none;`
  - `box-shadow: 0 2px 6px rgba(15, 23, 42, 0.18);`

### 운영 반영
- `git push origin public-clean`
  - `e70cae1 -> c8a755b`
- `gh api repos/AgenticLab-SH/skct_tool/pages/builds`
  - 최신 커밋 `c8a755be02ac38ee09620a81995d4a877a99360a`
  - 상태 `built`
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/build-info.js`
  - `v2026.04.11.2121`
  - `assetVersion 202604112121`
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/main.css?v=202604112121`
  - hover transition/box-shadow 최신 규칙 반영 확인

## 메모
- 이번 수정은 OMR 하단 버튼 hover 안정화만 대상으로 한 CSS 조정이며, 버튼 기능이나 고급/일반 모드 조건 분기 로직은 건드리지 않았음
- 작업 브랜치의 unrelated 변경(`docs/TODO/TODO1.md` 삭제, 사용자 참고 이미지 수정, 별도 untracked worklog)은 이번 반영에 포함하지 않았음
