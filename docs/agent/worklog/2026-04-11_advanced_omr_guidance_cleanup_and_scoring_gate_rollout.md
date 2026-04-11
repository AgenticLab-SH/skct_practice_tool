# 2026-04-11 고급 OMR 안내 정리 및 정오표 일괄입력 채점 후 노출 운영 반영

## 요청
- 고급 OMR 중간의 설명 박스를 없애고, `접기` 버튼 오른쪽의 작은 `?` 버튼으로만 안내를 열고 싶다는 요청
- `정오표 일괄입력` 버튼은 항상 보이지 말고 `채점`을 눌렀을 때만 보이게 바꿔 달라는 요청
- 수정 후 운영 반영 요청

## 적용한 수정
1. OMR 상단 도움말 위치 변경
- `index.html`
  - OMR 상단 바를 `접기 + ?` 묶음 구조로 바꿨음
  - 기존 하단 중간 설명 박스 `advancedCoachPanel`은 제거했음
- `main.css`
  - `omr-top-bar-actions`
  - `omr-top-help-btn`
  - 상단 작은 `?` 버튼이 좁은 팝업 폭에서도 자연스럽게 보이도록 스타일 추가

2. 정오표 일괄입력 노출 조건 변경
- `main.js`
  - 기존에는 고급 `정답 입력` 상태로만 들어가도 `정오표 일괄입력`이 보일 수 있었음
  - 이제는 `advancedScoringActionsUnlocked` 플래그를 두고, `채점` 버튼을 실제로 누른 뒤에만 고급 복기 버튼 구역이 열리도록 바꿨음
  - `답안 마킹`으로 되돌리거나 `초기화`하면 다시 숨김 상태로 돌아가게 맞춤
- `staging/site/assets/scripts/app.bundle.js`
  - 같은 로직 반영

3. 캐시 버전 상향
- `build-info.js`, `main.js` fallback 버전: `v2026.04.11.2107`, `202604112107`
- 자산 query string 갱신
  - `index.html`
  - `admin.html`
  - `study-archive.html`
  - `extension-info.html`
  - `staging/site/index.html`

4. 기능 문서 동기화
- `docs/SKCT_TOOL_기능_카탈로그.md`
  - 중간 설명 박스 제거, `접기` 오른쪽 `?` 도움말, `채점 후 정오표 일괄입력 노출` 기준으로 설명 갱신

## 반영 커밋
- 작업 브랜치 커밋
  - `015d4e7` (`fix: simplify advanced omr guidance`)
  - `9fb6824` (`fix: gate bulk import after scoring`)
- 공개 배포 브랜치 커밋
  - `e8f92ad` (`deploy: publish advanced omr guidance cleanup`)
  - `e70cae1` (`deploy: publish scoring-gated bulk import`)

## 검증
### 코드 검증
- `node --check main.js` 통과
- `node --check staging/site/assets/scripts/app.bundle.js` 통과

### 운영 정적 응답 확인
- `git push origin public-clean`
  - `5b956ba -> e8f92ad -> e70cae1`
- `gh api repos/AgenticLab-SH/skct_tool/pages/builds`
  - 최신 커밋 `e70cae1c651a360621b78785805138f3510355c8`
  - 상태 `built`
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/build-info.js`
  - `v2026.04.11.2107`
  - `assetVersion 202604112107`
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/`
  - `main.css?v=202604112107`
  - `build-info.js?v=202604112107`
  - `site-text-config.js?v=202604112107`
  - `main.js?v=202604112107`
  - OMR 상단에 `advancedCoachHelpBtn` 존재 확인
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/main.js?v=202604112107`
  - `advancedScoringActionsUnlocked`
  - `bulkCorrectImportBtn.classList.toggle('hidden', !showAdvancedScoringActions)`
  - `advancedScoringActionsUnlocked = true`
  - 위 문자열 기준으로 최신 노출 제어 로직 반영 확인
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/main.css?v=202604112107`
  - `.omr-top-bar-actions`
  - `.omr-top-help-btn`
  - 상단 `?` 레이아웃용 스타일 반영 확인

## 메모
- Playwright MCP는 탭 컨텍스트가 예전 세션과 섞여 보이는 경우가 있어, 최종 운영 반영 확인은 `curl` 기준 정적 응답 검증을 우선 기준으로 삼았음
- 작업 브랜치의 unrelated 변경(`docs/TODO/TODO1.md` 삭제, 사용자 참고 이미지 수정, 별도 untracked worklog)은 이번 반영에 포함하지 않았음
