# TODO1 문구 정리 및 운영 재배포
작성일시: 2026-04-10 16:45:13 +09:00

## 사용자 요청
- `docs/TODO/TODO1.md`를 해결
- 수정된 글들도 함께 GitHub에 push
- 서버에도 반영

## 판단
- TODO1의 메모장 클릭/드래그 이슈 자체는 이미 공통 `#notepad` 로직에서 정리된 상태였다.
- 이번 턴의 실제 남은 작업은 미커밋 상태로 남아 있던 문구 수정분을 정리하고, 그 변경을 작업 브랜치와 `public-clean` 운영 브랜치에 각각 반영하는 일이었다.
- 공개 배포는 작업 브랜치를 그대로 push하면 안 되고, `scripts/export_public_clean.ps1`로 추출한 공개 번들을 `public-clean` worktree에 별도로 반영해야 했다.

## 수행 내용
1. 현재 남아 있던 문구 수정분을 확인했다.
   - `index.html`
   - `main.js`
   - `site-text-config.js`
2. TODO 상태 문서를 갱신했다.
   - `docs/TODO/TODO1.md`를 완료 상태와 반영 요약 기준으로 다시 작성했다.
3. 사용자 기준 문서를 최소 범위로 동기화했다.
   - `docs/SKCT_TOOL_기능_카탈로그.md`
   - `docs/agent/runtime/30_MASTER_DOC.md`
   - `50_AGENT_LAST_WORK_REPORT.md`
   - `AGENTS.md`
4. 캐시 버전을 올렸다.
   - `build-info.js`
   - `main.js` fallback build info
   - `index.html`
   - `admin.html`
   - `study-archive.html`
   - `extension-info.html`
   - `staging/site/index.html`
5. 공개 배포 번들을 다시 만들고 `public-clean` worktree에 반영했다.
   - export: `pwsh -File scripts/export_public_clean.ps1 -OutputDir artifacts/releases/public-clean`
   - 공개 배포 커밋: `b7f8bca` (`deploy: publish todo1 copy refresh`)

## 검증
### 로컬
- `node --check main.js` 통과
- Playwright 로컬 확인
  - 메모장 `전체 선택 후 클릭 -> selectedLength 0`
  - 메모장 `긴 드래그 -> selectedLength 4309, scrollTop 1880`
  - 주요 라벨 `안내 / 고급 모드 / 팝업으로 열기 / 전체 시간` 반영 확인

### 운영
- `git push origin public-clean`
- `gh api repos/AgenticLab-SH/skct_tool/pages/builds`
  - 최신 빌드 `commit b7f8bca2d5c96a92da45f4db40ee80b22d272fed`
  - 상태 `built`
- `curl.exe -s https://agenticlab-sh.github.io/skct_tool/build-info.js`
  - `v2026.04.10.1645`
  - `assetVersion 202604101645`
- `curl.exe -I https://agenticlab-sh.github.io/skct_tool/admin.html`
  - 차단 페이지 기준 `200 OK`
- Playwright 라이브 확인
  - 메모장 `전체 선택 후 클릭 -> selectedLength 0`

## 메모
- `artifacts/releases/public-clean`은 export 산출물이라 작업 브랜치 커밋 대상에 포함하지 않았다.
- 작업 중 `public-clean` worktree 동기화에서 `Copy-Item -LiteralPath`가 와일드카드를 확장하지 않아 삭제 상태가 잠깐 생겼지만, 같은 export 산출물로 즉시 복구한 뒤 정상 커밋했다.
