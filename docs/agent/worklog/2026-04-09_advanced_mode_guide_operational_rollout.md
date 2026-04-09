# 2026-04-09 고급 모드 가이드 확장 운영 반영
작성일시: 2026-04-09 11:30:10 KST

## 1. 요청 요약
- 로컬에서 보강해 둔 고급 모드 설명, 상태 바, 빠른 설명 패널, 시각 가이드를 실제 운영에 반영한다.
- 일반 모드와 고급 모드의 노출 경계가 유지되는지 함께 확인한다.

## 2. 운영 반영 내용
- 고급 모드 가이드 확장 코드 커밋 `176099e`를 `main`에 반영했고, 운영 기록 정리 커밋 `5af7b34`까지 포함해 `origin/main`으로 push했다.
- 새 정적 자산 버전은 `202604091119`로 통일했다.
- `build-info.js`를 운영 자산에 포함해 사용자/관리자 화면 버전 정보를 공용값으로 읽게 정리했다.
- 도움말 모달에 `고급 모드 활용 가이드` 섹션과 강조 이미지 2장을 운영 반영했다.
- 상단 `고급 모드 상태 바`, OMR 하단 `고급 버튼 빠른 설명`, 자료 보관함 버튼/우측 레일 복원 상태 표시를 운영 반영했다.
- 운영 Firebase `config/siteTextConfig`는 코드 기본값 JSON으로 다시 저장해, 새 문구 키 `helpModal.advanced*`, `advancedMode.*`가 운영 기준에도 포함되게 맞췄다.

## 3. 백업 및 안전 조치
- 운영 Firebase 반영 전 기존 `config/siteTextConfig`를 아래 경로에 백업했다.
- `_backup/20260409_112409_site_text_before_advanced_guide_deploy/siteTextConfig.before.json`

## 4. 검증
- 로컬 코드 검증
  - `node --check main.js`
  - `node --check site-text-config.js`
  - `python scripts/annotate_advanced_help_images.py`
- GitHub Pages
  - workflow `pages-build-deployment` run `24169232511`
  - 대상 커밋 `5af7b34`
  - 상태 `completed / success`
  - 완료 시각 `2026-04-09 11:29:33 KST`
- 라이브 자산 확인
  - 메인 HTML에서 `main.css?v=202604091119`, `build-info.js?v=202604091119`, `main.js?v=202604091119` 확인
  - `study-archive.html`에서 `build-info.js?v=202604091119`, `study-archive.js?v=202604091119` 확인
  - 라이브 `build-info.js`에서 `v2026.04.09.1119`, `2026-04-09 11:19:44 +09:00` 확인
- 운영 브라우저 확인
  - 일반 모드에서는 자료 보관함 버튼 숨김 확인
  - `SB / 123456`으로 고급 안내 로그인 후 `advanced=1` 진입 확인
  - 고급 모드 상태 바 값 `활성 / SB` 확인
  - 자료 보관함 버튼 노출 확인
  - 도움말 가이드 이미지 `naturalWidth 1030 / 430` 로딩 확인
  - 우측 실제환경 레일 값 `92px / 78px` 복원 확인

## 5. 문서 동기화
- `50_AGENT_LAST_WORK_REPORT.md`
- `docs/agent/worklog/2026-04-09_advanced_mode_guide_expansion_and_local_visuals.md`
- `docs/agent/worklog/2026-04-09_advanced_mode_guide_operational_rollout.md`

## 6. 남은 사용자 작업
- 없음
