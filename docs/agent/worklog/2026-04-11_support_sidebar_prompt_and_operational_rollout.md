# 2026-04-11 좌측 후원 버튼 노출 및 운영 반영

## 요청
- 후원 버튼을 `더보기`에서 빼고 좌측 버튼란에 상시 노출
- 페이지 진입 시 가끔 연한 갈색으로 여러 번 깜빡이며 후원을 자연스럽게 유도
- 후원 문구를 부담스럽지 않게 정리
- 운영 반영까지 진행

## 적용한 변경
1. 메인 UI
- [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html)에 좌측 `☕ 후원` 버튼을 추가했습니다.
- 기존 `더보기` 모달에서는 후원 카드를 제거했고, `더보기`는 접속 현황, 커뮤니티, 외부 테스트 자료 중심으로 다시 정리했습니다.
- 기본 도움말의 좌측 버튼 설명도 새 구조에 맞게 갱신했습니다.

2. 시선 유도 스타일
- [main.css](/C:/dev/01_career/_assets/tools/skct_tool/main.css)에 `donate-burst-attention` 애니메이션을 추가했습니다.
- 이 애니메이션은 접속 직후 자동으로 시작되고, 긴 주기 안에서 짧은 버스트만 연한 갈색으로 번쩍이게 구성했습니다.
- hover는 기존처럼 크기 강조를 주되, 평소에는 과도하게 움직이지 않게 유지했습니다.

3. 문구와 운영 기준값
- [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js), [admin.html](/C:/dev/01_career/_assets/tools/skct_tool/admin.html), [site-text-config.js](/C:/dev/01_career/_assets/tools/skct_tool/site-text-config.js)의 후원 기본 문구를 `부담 없는 응원` 톤으로 통일했습니다.
- 예전 운영값이 남아 있어도 새 문구로 승격되도록 `LEGACY_SUPPORT_DEFAULTS`와 site text legacy migration을 함께 보강했습니다.
- 로컬 관리자 인증 세션으로 운영 RTDB를 직접 확인한 뒤 아래 값을 동기화했습니다.
- `config/supportConfig`
- `config/siteTextConfig.sidebar.supportLabel`
- `config/siteTextConfig.breakOverlay.supportHint`
- `config/siteTextConfig.utilityModal.descriptionHtml`
- `config/siteTextConfig.utilityModal.descriptionAdvancedHtml`
- `config/siteTextConfig.helpModal.sidebarFeatureHtml`

## 검증
1. 로컬 코드 검증
- `node --check main.js`
- `node --check site-text-config.js`
- `pwsh -File scripts/export_public_clean.ps1 -OutputDir tmp/public-clean-preview`

2. 로컬 브라우저 검증
- `http://127.0.0.1:8142/index.html`에서 좌측 후원 버튼 상시 노출 확인
- `더보기` 모달에 후원 카드가 사라진 것 확인
- 후원 버튼 클릭 시 후원 모달이 열리고 CTA가 `☕ 커피 한 잔 보태기`로 보이는 것 확인
- 애니메이션 keyframe을 강제로 샘플링해 연한 갈색 상태(`rgb(199, 157, 117)`)와 기본 상태가 모두 계산되는 것 확인

3. 운영 검증
- 운영 RTDB 패치 직후 `supportButtonLabel`, `supportBreakFooter`, `sidebarSupportLabel` 등 핵심 키 재조회 성공
- `gh api repos/AgenticLab-SH/skct_tool/pages/builds`에서 `781c1cb` 기준 `built` 확인
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/build-info.js`에서 `v2026.04.11.2208`, `202604112208` 확인
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/`에서 `sidebarDonateLabel`, 새 자산 query string 확인
- `curl.exe -I https://agenticlab-sh.github.io/skct_tool/admin.html`에서 공개 차단 페이지 `200 OK` 유지 확인

## 반영 커밋
- 작업 브랜치 커밋: `44dd061` (`feat: surface support button in sidebar`)
- 공개 배포 브랜치 커밋: `781c1cb` (`deploy: publish support sidebar prompt`)

## 메모
- 작업 트리의 unrelated 변경(`docs/TODO/TODO1.md` 삭제, 사용자 참고 이미지 수정, 기존 untracked worklog)은 건드리지 않았습니다.
