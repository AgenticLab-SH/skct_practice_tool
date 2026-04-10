# 일반·고급 안내 흐름 정리 운영 배포
작성일시: 2026-04-10 13:16:34 +09:00

## 1. 요청

- 로컬 검증이 끝났고 더 최적화할 부분이 없다면, 일반 모드와 고급 모드의 안내 흐름 정리 결과를 운영에 배포한다.

## 2. 배포 전 상태

- 작업 브랜치: `work/20260409_201424-local-safe-hardening`
- 기능 반영 커밋: `8067606`
- 공개 배포 브랜치: `public-clean`
- 이전 공개 반영 커밋: `92f31d1`

## 3. 수행 내용

- `build-info.js`, `main.js`, `index.html`, `admin.html`, `study-archive.html`, `extension-info.html`, `staging/site/index.html`의 자산 버전을 `202604101313`, `v2026.04.10.1313`으로 올렸다.
- 작업 브랜치에서 일반/고급 안내 흐름 정리와 문서 동기화 내용을 `feat: unify general and advanced help flows` (`8067606`)으로 커밋하고 push했다.
- `pwsh -File scripts/export_public_clean.ps1 -OutputDir artifacts/releases/public-clean`로 공개 배포 산출물을 다시 만들었다.
- `C:\dev\01_career\_assets\tools\skct_tool_public_clean_wt` worktree에 산출물을 복사하고, `deploy: publish unified help flow cleanup` (`1a039d9`)로 커밋 후 `origin/public-clean`에 push했다.

## 4. 라이브 검증

- `https://agenticlab-sh.github.io/skct_tool/build-info.js`
  - `v2026.04.10.1313`
  - `assetVersion 202604101313`
- `https://agenticlab-sh.github.io/skct_tool/`
  - `main.css?v=202604101313`
  - `site-text-config.js?v=202604101313`
  - `main.js?v=202604101313`
- `https://agenticlab-sh.github.io/skct_tool/admin.html`
  - 차단 페이지 기준 `200 OK`

## 5. 비고

- 이번 반영은 일반 공개 화면의 안내 구조 정리와 자산 버전 갱신 중심이며, 공개 관리자 차단 정책은 그대로 유지했다.
- 로컬 전용 관리자 실행기, 운영 Firebase rules, secure API 전환 상태는 이번 배포 범위에 포함하지 않았다.
