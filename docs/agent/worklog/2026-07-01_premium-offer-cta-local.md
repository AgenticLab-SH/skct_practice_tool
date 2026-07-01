# 2026-07-01 SKCT 고급 복기팩 전환 CTA 로컬 개선

## 계획

- 상업화 전환율을 높이기 위해 첫 화면에서 고급 모드 신청/가격 진입을 더 명확하게 노출한다.
- 운영 URL, `public-clean` 브랜치, 운영 Firebase 값은 건드리지 않고 로컬 파일만 수정한다.

## 실행

- 변경 전 백업 생성:
  - `C:\Users\kshcg\dev\backups\03_commercialization_products\11_skct_practice_tool-20260701-020233`
- `index.html`
  - 상단 타이머 바에 `고급 복기팩` 전환 스트립 추가.
  - `신청` 버튼은 기존 고급 모드 신청 모달을 재사용하고, `가격`은 기존 `pricing/` 페이지로 연결.
- `main.css`
  - 전환 스트립의 데스크톱/모바일 스타일 추가.
  - 모바일에서는 기존 상단 `팝업으로 열기` 버튼을 숨김. 동일 기능은 좌측 사이드바에 남아 있음.
- `main.js`
  - `premiumOfferOpenBtn` 클릭 시 기존 `openAdvancedEntryModal()` 호출.
  - `premium_offer_click` 분석 이벤트 추가.

## 검증

- 로컬 정적 서버:
  - `python -m http.server 4177 --bind 127.0.0.1`
- 문법 검사:
  - `node --check main.js` 통과.
- Playwright 로컬 렌더링 검증:
  - URL: `http://127.0.0.1:4177/`
  - Desktop 1440x1000: 고급 복기팩 스트립 표시, `신청` 클릭 시 고급 모드 모달 열림.
  - Mobile 390x844: 타이머와 고급 CTA 모두 표시, 상단 팝업 버튼 잘림 제거.
  - 콘솔 error/warning 없음.
- 스크린샷 증거:
  - `C:\Users\kshcg\dev\backups\03_commercialization_products\11_skct_practice_tool-20260701-020233\screenshots-final\mobile-final.png`

## 남은 작업

- 운영 반영 전에는 `public-clean` 추출/스테이징 검증/사용자 승인 필요.
- 고급 모드 가격은 운영 Firebase 설정값이 최상위 기준이므로, 코드 fallback 가격과 운영 표시 가격 불일치 여부를 별도 점검해야 한다.
- 전환율 개선 다음 단계는 pricing 페이지 문구와 신청 완료 후 후원 메모 복사 흐름을 함께 점검하는 것이다.

## 추가 실행: pricing 페이지와 신청 모달 연결

- `pricing/index.html`
  - 히어로 문구를 `고급 복기팩` 중심으로 바꾸고, 첫 CTA를 `../index.html?open=advanced`로 연결.
  - 기존 가격 표를 7일/14일 플랜 카드로 바꿔 신청 버튼을 바로 노출.
  - 신청 절차 3단계(이용권 선택 -> 후원 메모 신청번호 -> 승인 후 진입)를 별도 섹션으로 정리.
  - 공개 RTDB `config/manualSubscriptionConfig`를 읽어 운영 가격을 표시하도록 추가. 운영 DB 쓰기는 하지 않음.
- `main.js`
  - `?open=advanced` 진입 시 기존 고급 모드 신청 모달을 자동으로 열고, URL에서 `open` 파라미터를 제거.
- `docs-pages.css`
  - 가격 카드와 신청 절차 카드의 반응형 스타일 추가.

## 추가 검증

- `node --check main.js` 통과.
- `http://127.0.0.1:4177/pricing/` 200 확인.
- Playwright 렌더링 검증:
  - Desktop 1440x1000: pricing 첫 화면, 플랜 카드 표시 확인.
  - Mobile 390x844: 히어로/CTA/상단 nav 겹침 없음.
  - `고급 복기팩 신청하기` 클릭 -> `index.html` 이동 -> 기존 고급 신청 모달 자동 열림.
  - pricing 페이지 플랜 가격이 운영 설정 기준 `3,900원 / 6,900원`으로 동기화됨.
  - 콘솔 error/warning 없음.
- 스크린샷 증거:
  - `C:\Users\kshcg\dev\backups\03_commercialization_products\11_skct_practice_tool-20260701-020233\screenshots-pricing-2\01-pricing-desktop-synced.png`
  - `C:\Users\kshcg\dev\backups\03_commercialization_products\11_skct_practice_tool-20260701-020233\screenshots-pricing-2\03-pricing-mobile-synced.png`

## 추가 실행: 로컬 서비스 모드

- `scripts/start_local_service.ps1` 추가.
  - 기본 정적 앱 서버 실행.
  - `-ExportPublic` 사용 시 `tmp/local-service-public/` 공개 추출물을 서비스.
  - 로컬 서비스 확인에 필요한 공개 Firebase config를 `tmp/local-service-public/config/`에 복사.
  - `-BindAddress 0.0.0.0`로 같은 네트워크 테스트를 열 수 있게 준비.
  - `-WithFunctions`로 Firebase Functions 에뮬레이터를 별도 백그라운드 프로세스로 띄울 수 있게 준비.
- `scripts/stop_local_service.ps1` 추가.
  - `tmp/local_service_state.json`에 기록된 정적 서버/Functions 에뮬레이터 PID를 종료.
- `docs/agent/runbooks/local-service-mode.md` 추가.
  - 이 PC를 임시 서비스 서버처럼 쓸 때의 실행/종료/공개 추출/검증 절차 정리.

## 추가 검증: 로컬 서비스 모드

- 실행:
  - `powershell -ExecutionPolicy Bypass -File .\scripts\start_local_service.ps1 -Port 4187 -ExportPublic`
- 응답:
  - `http://127.0.0.1:4187/` 200
  - `http://127.0.0.1:4187/pricing/` 200
  - `http://127.0.0.1:4187/index.html?open=advanced` 200
- 공개 추출물:
  - `tmp/local-service-public/config/firebase-config.mjs` 존재
  - `tmp/local-service-public/config/firebase-web-config.js` 존재
- Playwright:
  - 공개 추출 서버에서도 pricing 가격 `3,900원 / 6,900원` 표시.
  - `고급 복기팩 신청하기` 클릭 후 고급 신청 모달 자동 오픈.
  - 콘솔 error/warning 없음.
- 종료:
  - `powershell -ExecutionPolicy Bypass -File .\scripts\stop_local_service.ps1`
  - 테스트 서버 PID 종료 확인.
- 스크린샷 증거:
  - `C:\Users\kshcg\dev\backups\03_commercialization_products\11_skct_practice_tool-20260701-020233\screenshots-local-service-2\01-public-pricing-mobile.png`
  - `C:\Users\kshcg\dev\backups\03_commercialization_products\11_skct_practice_tool-20260701-020233\screenshots-local-service-2\02-public-modal-mobile.png`

## 추가 실행: export_public_clean config 누락 수정

- 문제:
  - GitHub Actions는 secret으로 `config/firebase-web-config.js`를 생성하고, checkout된 `config/firebase-config.mjs`와 함께 Pages 산출물에 포함한다.
  - 로컬 `scripts/export_public_clean.ps1`는 `config/`를 복사하지 않아 직접 export 산출물을 서비스하면 Firebase 초기화가 실패하고, 신청 모달 가격이 fallback 값으로 돌아갈 수 있었다.
- 수정:
  - `scripts/export_public_clean.ps1`가 `config/firebase-config.mjs`와 로컬에 존재하는 `config/firebase-web-config.js`를 공개 산출물 `config/`에 복사하도록 변경.
- 검증:
  - `export_public_clean.ps1` PowerShell parse OK.
  - `powershell -ExecutionPolicy Bypass -File .\scripts\export_public_clean.ps1 -OutputDir tmp\public-clean-smoke` 성공.
  - `tmp/public-clean-smoke/config/firebase-config.mjs` 존재.
  - `tmp/public-clean-smoke/config/firebase-web-config.js` 존재.
  - `tmp/public-clean-smoke`를 `http://127.0.0.1:4197/`로 서비스했을 때 `/`, `/pricing/`, 두 config 파일 모두 200.
  - Playwright 모바일 검증에서 pricing 가격 `3,900원 / 6,900원`, CTA -> 고급 신청 모달 오픈, 콘솔 error/warning 없음.
- 스크린샷 증거:
  - `C:\Users\kshcg\dev\backups\03_commercialization_products\11_skct_practice_tool-20260701-020233\screenshots-export-smoke\pricing-mobile.png`
  - `C:\Users\kshcg\dev\backups\03_commercialization_products\11_skct_practice_tool-20260701-020233\screenshots-export-smoke\modal-mobile.png`

## 추가 실행: 공개 산출물 자동 smoke test

- `scripts/test_public_export.ps1` 추가.
  - `scripts/export_public_clean.ps1`를 실행해 `tmp/public-clean-smoke/`를 새로 만든다.
  - 필수 공개 파일, `config/firebase-config.mjs`, `config/firebase-web-config.js`, 공개 admin stub을 확인한다.
  - 임시 Python 정적 서버를 띄워 `/`, `/pricing/`, 두 config 파일의 HTTP 200을 확인한다.
  - 메인 HTML에 `premiumOfferOpenBtn`, pricing HTML에 `index.html?open=advanced`, `manualSubscriptionConfig`, `pricingPlanSyncStatus`가 포함됐는지 확인한다.
  - 기본적으로 검증 후 임시 서버를 종료하고, 디버깅 시 `-KeepServer`로 유지할 수 있다.
- 첫 실패와 수정:
  - PowerShell 예약 변수 `$HOME` 충돌을 피하려고 내부 변수명을 `$homeResponse`로 변경.
  - 한국어 정규식 검증이 Windows 출력 인코딩에서 깨질 수 있어 ASCII DOM 토큰 기반 검증으로 변경.
- 검증:
  - `test_public_export.ps1` PowerShell parse OK.
  - `powershell -ExecutionPolicy Bypass -File .\scripts\test_public_export.ps1 -Port 4207` 성공.
  - 결과 JSON `ok: true`, `keptServer: false`.
  - 실행 후 4207 listen 프로세스 없음.