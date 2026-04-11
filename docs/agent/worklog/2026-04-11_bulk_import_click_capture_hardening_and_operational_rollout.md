# 2026-04-11 정오표 일괄입력 클릭 capture 보강 및 운영 반영

## 요청
- 사용자가 제공한 실제 팝업 화면 기준으로 `정오표 일괄입력` 버튼을 눌러도 아무 변화가 없다고 제보
- 원래 기능을 다시 확인하고, 실제로 열리도록 더 강하게 보강 요청

## 확인한 내용
- 사용자 참고 이미지 `docs/참고사진/image.png`는 고급 팝업에서 OMR을 열고 `정답 입력` 상태로 들어간 정상 화면이었음
- 코드 기준 모달은 이미 존재했고, `openBulkCorrectImportModal()`도 `bulkCorrectImportModal.classList.remove('hidden')`만 수행하는 단순 구조였음
- 자동화 재현 결과
  - 라이브 `https://agenticlab-sh.github.io/skct_tool/?advanced=1`
  - 팝업과 유사한 좁은 뷰포트 `484 x 791`
  - `OMR 열기 -> 정답 입력 -> 정오표 일괄입력 클릭`
  - 클릭 후 `bulkCorrectImportModal.hidden = false`
  - `display = flex`
  - 모달 rect가 뷰포트 전체(`484 x 791`)를 덮으며 실제로 보이는 것을 스크린샷으로 확인
- 따라서 기능 자체는 살아 있었지만, 기존 구현이 문서 버블링 단계의 click 위임에만 의존해 특정 세션/팝업 환경에서는 클릭이 중간에서 막히면 무반응처럼 보일 여지가 있었음

## 적용한 수정
1. `main.js`
- `bindClickById()`를 capture 단계 위임 + 버튼 직접 바인딩 구조로 보강
- 같은 클릭에서 중복 실행되지 않도록 `event.__skctHandledClickIds`로 dedupe 처리
- 대상
  - `bulkCorrectImportBtn`
  - `bulkCorrectImportParseBtn`
  - `bulkCorrectImportApplyBtn`

2. `staging/site/assets/scripts/app.bundle.js`
- 메인과 동일하게 click 바인딩 보강 반영

3. 캐시 버전 상향
- `build-info.js`, `main.js` fallback 버전을 `v2026.04.11.2045`, `202604112045`로 갱신
- `index.html`, `admin.html`, `study-archive.html`, `extension-info.html`, `staging/site/index.html`의 자산 query string도 함께 갱신

## 반영 커밋
- 작업 브랜치 커밋: `b347268` (`fix: harden bulk import click binding`)
- 공개 배포 브랜치 커밋: `5b956ba` (`deploy: publish bulk import click hardening`)

## 검증
### 로컬 코드
- `node --check main.js` 통과
- `node --check staging/site/assets/scripts/app.bundle.js` 통과

### 라이브 재현
- 라이브 URL: `https://agenticlab-sh.github.io/skct_tool/?advanced=1`
- 실제 계정: `sh / 235813`
- 확인 결과
  - 버튼 문구: `📥 정오표 일괄입력`
  - 클릭 후 모달 제목: `📥 정오표 일괄입력`
  - 모달 상태: `hidden = false`, `display = flex`
- 팝업 유사 뷰포트 스크린샷
  - `artifacts/bulk-import-modal-live-popup.png`

### 운영 반영
- `git push origin public-clean`
  - `872ae95 -> 5b956ba`
- `gh api repos/AgenticLab-SH/skct_tool/pages/builds`
  - 최신 커밋 `5b956ba0b7702b11bf71f09f5d722c5734755ef9`
  - 상태 `built`
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/build-info.js`
  - `v2026.04.11.2045`
  - `assetVersion 202604112045`

## 메모
- Playwright MCP 탭 컨텍스트 출력은 이전 로컬 탭 정보가 섞여 보이는 경우가 있었으나, DOM 평가값과 `curl` 기준 운영 빌드 값은 정상적으로 최신 반영을 가리켰음
- 작업 브랜치의 unrelated 변경(`docs/TODO/TODO1.md` 삭제, 별도 untracked worklog)은 이번 반영에 포함하지 않았음
