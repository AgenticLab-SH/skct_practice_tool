# 버튼 내부 도움말 축소 및 공개 배포
작성일시: 2026-04-10 02:26:32 +09:00

## 요청 요약

- 로컬로 열었을 때 실제 운영 반영 여부를 먼저 빠르게 설명
- 고급 OMR의 `고급 복기 모드 설명`을 기본 화면에서 없애고 `?` 버튼으로 대체
- 일반 모드와 고급 모드의 버튼 내부 페이지에서 장문 설명을 줄이고, 필요한 설명은 `?` 빠른 도움말로 정리
- 문구 겹침과 흐름을 다듬은 뒤 바로 공개 배포

## 수행 내용

- `index.html`
  - 고급 OMR의 인라인 설명 패널을 기본 노출에서 제거하고 `#advancedCoachHelpBtn`만 보이도록 정리
  - 설정, 고급 안내, 고급 활용, 과목별 상세 통계, 정오표 일괄입력, 더보기, 활성 세션에 헤더 `?` 도움말 유지
  - 고급 안내와 고급 활용의 기본 노출 문구를 더 짧게 정리
- `main.js`
  - `data-context-help` 공통 처리 유지
  - `advanced-entry`, `advanced-tools`, `advanced-omr` 빠른 도움말 본문을 다시 정리해 중복 제목 제거
- `site-text-config.js`
  - 운영 `siteTextConfig`가 예전 장문을 다시 덮지 않도록 기본값과 legacy migration을 함께 보강
  - 고급 안내/고급 활용의 기본 노출 문구를 더 짧은 기준으로 갱신
- `build-info.js`, `index.html`, `admin.html`, `staging/site/index.html`
  - 자산 버전을 `202604100219`, 빌드 버전을 `v2026.04.10.0219`로 갱신

## 검증

- `node --check main.js`
- `node --check site-text-config.js`
- 로컬 `http://127.0.0.1:8123/` Playwright 검증
  - 설정, 더보기, 활성 세션, 고급 안내, 고급 활용, 과목별 상세 통계, 정오표 일괄입력의 `?` 도움말 정상 오픈 확인
  - 고급 OMR 강제 상태에서 `?` 버튼만 남고 입력칸과 하단 버튼 줄이 유지되는 것 확인
  - 고급 신청/고급 활용/고급 OMR 빠른 도움말에서 중복 제목 제거 확인
- 공개 번들 로컬 서버 `http://127.0.0.1:8125/`
  - `index.html` 200
  - `admin.html` 차단 페이지 200
- 원격 배포
  - `public-clean` 브랜치에 `33f85d5` push 완료
  - GitHub Pages `build-info.js`가 `v2026.04.10.0219`로 갱신된 것 확인
  - 라이브 메인 HTML에서 `main.css`, `site-text-config.js`, `main.js` 쿼리 버전 `202604100219` 확인
  - 라이브 `admin.html`이 공개 차단 페이지를 반환하는 것 확인

## 판단 메모

- 로컬 `admin.html`은 파일을 로컬에서 여는 것과 관계없이 실제 운영 Firebase를 쓰므로, 승인/저장 버튼을 누르면 운영 데이터에 반영됩니다.
- 그래서 운영 관리자 작업은 `공개 admin.html`이 아니라 로컬 관리자 페이지에서 하되, 저장 버튼을 누를 때는 실제 운영 반영이라는 전제로 다뤄야 합니다.

## 기능 문서 동기화

- `docs/SKCT_TOOL_기능_카탈로그.md` 갱신
- `docs/agent/runtime/30_MASTER_DOC.md` 갱신
- `docs/agent/runtime/35_LEARNING_NOTES.md` 갱신
- `50_AGENT_LAST_WORK_REPORT.md` 갱신
