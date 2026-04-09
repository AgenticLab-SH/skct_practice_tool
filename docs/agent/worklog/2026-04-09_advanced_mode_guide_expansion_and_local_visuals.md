# 2026-04-09 고급 모드 가이드 확장 및 로컬 시각 가이드 보강
작성일시: 2026-04-09 11:08:00 KST

## 1. 요청 요약
- 고급 모드를 집중적으로 보강한다.
- 사용자가 어떤 기능을 어떻게 써야 하는지 더 쉽게 이해할 수 있게 설명을 늘린다.
- 필요하면 스크린샷을 캡처하고, 강조/자르기를 적용한 뒤 품질이 괜찮을 때만 도움말에 넣는다.

## 2. 이번 변경
- 메인 화면 상단에 `고급 모드 상태 바`를 추가했다.
  - 로그인 식별자
  - 만료 시각
  - 자료 보관함 사용 가능 여부
  - 우측 실제환경 여백 복원 여부
- OMR 하단에 `고급 버튼 빠른 설명` 패널을 추가했다.
  - 정답 입력 -> 채점/통계 -> 반복 연습 순서를 바로 읽을 수 있게 정리했다.
- 도움말 모달에 `고급 모드 활용 가이드` 섹션을 추가했다.
  - `images/advanced_mode_status_highlight.png`
  - `images/advanced_mode_omr_highlight.png`
- 강조 이미지 생성용 스크립트 `scripts/annotate_advanced_help_images.py`를 추가했다.
- 사용자/관리자 화면의 버전 표기를 `build-info.js` 공용 정보로 정리했다.
- 새 설명 문구는 모두 `site-text-config.js` 카탈로그와 관리자 편집기에서 수정 가능한 키로 연결했다.

## 3. 문구/관리 키 확장
- `helpModal.advanced*`
- `advancedMode.*`
- 기존 `advancedGuide.*`, `advancedFeature.*`와 함께 관리자 페이지 scope `고급`에서 편집 가능하도록 유지했다.

## 4. 로컬 검증
- `node --check main.js`
- `node --check site-text-config.js`
- 로컬 서버 `http://127.0.0.1:8128/`
- Playwright 로컬 확인
  - 고급 라이선스 주입 후 `?advanced=1`에서 `body.advanced-mode === true`
  - 상태 바 값: `활성 / SB / 2026. 04. 16. 오후 12:00 / 사용 가능 / 복원됨`
  - 우측 레일 CSS 값: `--tools-right-rail-reserve = 92px`, `--tools-right-rail-button-size = 78px`
  - 자료 보관함 버튼 고급 모드에서 노출 확인
  - 도움말 이미지 2장 `naturalWidth > 0` 로딩 확인

## 5. 문서 동기화
- `AGENTS.md`
- `docs/SKCT_TOOL_기능_카탈로그.md`
- `docs/agent/36_HIDDEN_ADVANCED_FEATURES.md`
- `docs/agent/runtime/35_LEARNING_NOTES.md`

## 6. 운영 반영 여부
- 이번 턴에서는 운영 반영하지 않았다.
- 현재 상태는 로컬 코드, 로컬 서버, 로컬 시각 가이드 자산 기준 검증 완료이다.
