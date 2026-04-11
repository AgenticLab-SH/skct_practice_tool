# 2026-04-11 고급모드 정오표 일괄입력 운영 반영

## 요청
- 고급모드 `정오표 일괄입력` 수정분을 운영에 반영

## 반영 대상
- 작업 브랜치 커밋: `ff28f2a` (`fix: harden advanced bulk correct import trigger`)
- 공개 배포 브랜치: `public-clean`
- 공개 배포 커밋: `31a4364` (`deploy: publish advanced bulk import fix`)

## 수행 내용
1. 고급모드 `정오표 일괄입력` 버튼/분석/반영 클릭 경로를 `id` 기준 위임 바인딩으로 보강했습니다.
2. 메인 화면 버튼 문구를 `📥 정오표 일괄입력`으로 통일하고 `type="button"`을 명시했습니다.
3. 캐시 잔존을 막기 위해 아래 자산 버전을 `202604112005`, `v2026.04.11.2005`로 올렸습니다.
   - `build-info.js`
   - `main.js` fallback build info
   - `index.html`
   - `admin.html`
   - `study-archive.html`
   - `extension-info.html`
   - `staging/site/index.html`
4. `pwsh -File scripts/export_public_clean.ps1 -OutputDir artifacts/releases/public-clean`로 공개 번들을 다시 만들었습니다.
5. `C:\dev\01_career\_assets\tools\skct_tool_public_clean_wt` worktree에 공개 번들을 동기화한 뒤 `origin/public-clean`에 push했습니다.

## 검증
### 로컬
- `node --check main.js` 통과
- Playwright 로컬 고급 팝업 상태 복원 후 확인
  - OMR 열기
  - 정답 입력 모드 전환
  - `정오표 일괄입력` 모달 열림
  - 예시 표 분석
  - 정답 일괄 반영

### 운영
- `git push origin public-clean`
  - `415950f -> 31a4364`
- `gh api repos/AgenticLab-SH/skct_tool/pages/builds`
  - 최신 빌드 `31a43640697f3cb2e979bc89f6a0abe6471dfbdc`
  - 상태 `built`
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/build-info.js`
  - `v2026.04.11.2005`
  - `assetVersion 202604112005`
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/`
  - `main.css?v=202604112005`
  - `build-info.js?v=202604112005`
  - `site-text-config.js?v=202604112005`
  - `main.js?v=202604112005`
  - `📥 정오표 일괄입력` 버튼 문구 확인
- `curl.exe -I https://agenticlab-sh.github.io/skct_tool/admin.html`
  - 차단 페이지 기준 `200 OK`

## 메모
- `public-clean` 로컬 worktree의 `.git` 연결이 깨져 있어, 배포 전에 worktree를 재생성한 뒤 반영했습니다.
- 작업 브랜치의 unrelated 변경(`docs/TODO/TODO1.md` 삭제, 별도 untracked worklog)은 이번 운영 반영에 포함하지 않았습니다.

## 추가 운영 재검증
- 재검증 시각: `2026-04-11 20:31:36 +09:00`
- 재검증 URL: `https://agenticlab-sh.github.io/skct_tool/?advanced=1`
- 확인 항목
  - `window.SKCTBuildInfo.version = v2026.04.11.2005`
  - `window.SKCTBuildInfo.assetVersion = 202604112005`
  - 실제 라이브 고급 로그인 계정(`sh / 235813`)으로 진입 가능
  - OMR 열기 -> `정답 입력` 전환 후 `정오표 일괄입력` 클릭 시 모달 열림 확인
- 관찰 메모
  - 같은 라이브 세션에서 버튼 라벨 텍스트가 구버전 문구 `📥 정오표 입력`으로 남아 보이는 혼재 현상이 있었음
  - 그러나 클릭 후 실제 모달 제목은 `📥 정오표 일괄입력`으로 표시되었고 기능도 열렸음
  - 따라서 운영 코드 미반영보다는, 기존에 열려 있던 고급 창/팝업 또는 브라우저 캐시가 남은 세션 혼재 가능성이 높음
