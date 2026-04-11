# 2026-04-11 정오표 일괄입력 라벨 siteText 기본값 동기화 및 운영 반영

## 요청
- 라이브 고급모드에서 버튼 문구가 여전히 `정오표 입력`으로 보인다는 사용자 제보 확인 및 수정

## 원인
- `index.html`의 버튼 본문은 이미 `📥 정오표 일괄입력`으로 수정돼 있었음
- 그러나 런타임에서 `site-text-config.js` 기본값 `tools.bulkImportButton`이 여전히 `📥 정오표 입력`으로 남아 있었음
- 페이지 초기 렌더 후 site text 적용 단계에서 이 기본값이 버튼 텍스트를 다시 덮어써, 실제 라이브에서는 예전 라벨이 보였음

## 적용한 수정
1. `site-text-config.js`
- `tools.bulkImportButton` 기본값을 `📥 정오표 일괄입력`으로 수정
- `advancedGuide.featureCard2Html`의 `정오표 입력` 표현도 `정오표 일괄입력`으로 통일
- legacy migration의 `tools.bulkImportButton` 구문구 목록에 `📥 정오표 입력`을 넣어, 예전 저장값도 새 기본값으로 승격되게 보강

2. 캐시 버전 상향
- `build-info.js`, `main.js` fallback 버전을 `v2026.04.11.2035`, `202604112035`로 올림
- `index.html`, `admin.html`, `study-archive.html`, `extension-info.html`, `staging/site/index.html`의 자산 query string도 같은 버전으로 갱신

## 반영 커밋
- 작업 브랜치 커밋: `e9d95f0` (`fix: sync bulk import label fallback text`)
- 공개 배포 브랜치 커밋: `872ae95` (`deploy: publish bulk import label sync`)

## 검증
### 로컬 코드
- `node --check main.js` 통과
- `node --check site-text-config.js` 통과
- 소스 확인
  - `site-text-config.js` 기본값: `bulkImportButton: '📥 정오표 일괄입력'`
  - legacy migration 목록: `['📥 정오표 입력', '📥 정오표 한번에 넣기']`

### 운영 반영
- `git push origin public-clean`
  - `31a4364 -> 872ae95`
- `gh api repos/AgenticLab-SH/skct_tool/pages/builds`
  - 최신 커밋 `872ae959db4427adfc3d668d44bb9b0f9a15f8c6`
  - 상태 `built`
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/build-info.js`
  - `v2026.04.11.2035`
  - `assetVersion 202604112035`
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/`
  - `site-text-config.js?v=202604112035`
  - `main.js?v=202604112035`
  - `bulkCorrectImportBtn` 본문 `📥 정오표 일괄입력` 확인
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/site-text-config.js?v=202604112035`
  - `bulkImportButton: '📥 정오표 일괄입력'` 확인

## 메모
- 운영 Firebase `config/siteTextConfig.tools.bulkImportButton`는 이미 `📥 정오표 일괄입력`이었음
- 이번 문제는 원격 설정값이 아니라, 화면 초기화 시 fallback 기본값이 예전 문구로 남아 있던 쪽에 가까웠음
- 작업 브랜치의 unrelated 변경(`docs/TODO/TODO1.md` 삭제, 별도 untracked worklog)은 이번 반영에 포함하지 않았음
