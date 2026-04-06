# SKCT Tool 최근 진단 및 로컬 수정 리포트
작성일시: 2026-04-06 15:10:41 KST

이 문서는 2026-04-05 기준 로컬 작업에서 확인한 회귀 원인과 임시 수정 사항을 빠르게 이어보기 위한 기록입니다.

## 2026-04-06 운영 반영: 고급 진입/구독 관리 개선
- 운영 사용자 화면 [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html), [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js), [advanced-tools.html](/C:/dev/01_career/_assets/tools/skct_tool/advanced-tools.html)에 스테이징에서 검증한 고급 진입 UX를 이식했습니다.
- 일반 화면의 `고급 안내` 모달에서 바로 비밀번호 입력, `비밀번호 보기`, `인증된 브라우저면 바로 열기`, 현재 이용권 상태 요약이 동작합니다.
- 운영 Firebase `config/advancedFeatureConfig`는 기존 평문 목록 `0208`, `dgd0392`를 해시 기반 `subscriptions` 구조로 직접 마이그레이션했습니다.
- 운영 관리자 페이지 [admin.html](/C:/dev/01_career/_assets/tools/skct_tool/admin.html)는 이제 `고급 구독 관리` 표 기반으로 상태, 만료일, 외부 ID, 메모, 새 비밀번호를 다룹니다.
- 저장 버튼도 `앱/링크`, `타이머/레이아웃`, `후원 문구`, `후원 내역`, `고급 구독`으로 나눴고, `전체 저장`은 이 개별 저장을 묶어 실행하도록 정리했습니다.
- 운영 코드 기준 최신 커밋은 `0b02d9f`입니다.

## 핵심 원인
- `0b08056` 커밋에서 메인 페이지 진입 시 자동으로 팝업을 여는 로직이 다시 들어오면서, 사용자가 첫 화면 대신 `팝업 모드 실행 중...` 안내 화면에 갇히는 회귀가 발생했습니다.
- 타이머 기본값이 `전체 75분 / 과목당 15분 / 쉬는 시간 1분`으로 저장되어 있었지만 실제 필요한 총 시간은 79분이라, 기본 설정만으로도 전체 타이머가 먼저 끝나는 구조였습니다.
- 확장 설치 모달이 가리키는 `skct_extension.zip` 파일이 저장소에 없어 다운로드 버튼이 실질적으로 동작하지 않았습니다.
- 자동 팝업 회귀에 가려져 있던 초기화 순서 오류(`timerIsRunning`, `applyPhaseToOMR` 선언 전 접근)가 실제 페이지 로딩 시 추가로 드러났습니다.

## 이번 로컬 수정
- `main.js`
  - 자동 팝업 실행 로직 제거
  - 타이머 총시간 최소값 자동 보정 추가
  - 타이머 상태 변수/초기 렌더 호출 순서 정리
- `index.html`
  - 초기 총시간 표시와 기본 입력값을 79분 기준으로 조정
- `admin.html`
  - 관리자 기본 타이머 저장값도 최소 총시간 규칙을 따르도록 보정
- `chrome-extension/content.js`
  - 화면 대부분을 덮는 overlay를 더 넓게 탐지하고 반복 스캔하도록 보강
- `skct_extension.zip`
  - 현재 `chrome-extension` 폴더 기준으로 재생성

## 확인 결과
- 로컬 서버에서 `index.html` 진입 시 더 이상 자동 팝업 안내 화면으로 덮이지 않음
- Playwright 기준 콘솔 에러 0건
- 타이머 시작 버튼 클릭 시 `79:00 -> 78:59`, `15:00 -> 14:59`로 정상 감소 확인
- 설정 모달에서 총시간 기본값이 `79`로 표시되는 것 확인
- `http://127.0.0.1:8123/skct_extension.zip` 응답 코드 `200` 확인

## 남은 메모
- `admin.html`, `update.html`에는 이번 수정 외에도 기존 로컬 변경분이 일부 섞여 있으므로 커밋 전 diff를 한 번 더 확인하는 것이 안전합니다.
- 실제 링커리어 CBT 사이트에서 overlay 패턴이 또 바뀌었을 가능성은 있으므로, 확장 보강 후 실사용 브라우저에서도 한 번 더 확인하는 것이 좋습니다.
- 점검 중 개발자 테스트용 링크는 `index.html?dev=1`입니다. 같은 탭에서 우회 해제는 `index.html?dev=0`으로 할 수 있습니다.
- 관리자 페이지 상단 `사이트 보기`는 이제 `index.html?dev=1&preview=1`로 열리며, 이 탭에서는 로컬 타이머/가이드/레이아웃 값 대신 Firebase 기본값을 우선 반영합니다.
- 이후 추가 수정으로 `dev/preview`는 URL에 있을 때만 유효하게 바꿨고, `config` 10분 캐시를 제거해서 점검 차단과 관리자 저장 반영이 새로고침마다 즉시 보이도록 정리했습니다.
- 사용자 설정 모달과 관리자 설정 영역 상단에 현재 업데이트 일시와 버전(`v2026.04.05.1107`) 표시를 최신 값으로 갱신했습니다.
- 추가 수정으로 관리자 `사이트 보기`를 실제 사용자 팝업과 같은 창 방식으로 열리게 바꿨고, `preview=1`일 때는 원격 타이머/가이드/레이아웃 기본값을 항상 다시 적용하도록 조건을 강화했습니다.

## 2026-04-06 후원 목록 속도 설정 추가
- 운영/스테이징 관리자 페이지의 `후원/운영 문구 관리`에 `후원 목록 전환 속도(초)` 입력칸을 추가했습니다.
- 저장값은 `supportConfig.sponsorTickerSeconds`로 Firebase에 저장되며, 기본값은 `4초`입니다.
- 사용자 페이지 후원 ticker는 더 이상 `4000ms` 하드코드를 쓰지 않고, 저장된 초 값을 읽어 회전합니다.
- 후원 목록이 다시 렌더링될 때 이전 interval이 남아 속도가 꼬이지 않도록 `clearInterval(window.__sponsorTickerIntervalId)`를 먼저 수행하도록 바꿨습니다.
- 운영 기준 최신 코드 커밋은 `b0d3b0a`입니다.

## 2026-04-06 후원 목록 위치 이동
- 후원 목록 ticker를 `사용 가이드` 모달에서 제거하고 `커피후원` 모달 본문 최상단으로 이동했습니다.
- 렌더링 로직과 속도 설정은 그대로 두고, `id="sponsorTicker"` 컨테이너 위치만 바꿔 normal/고급 버전이 같은 후원 모달 폼팩터를 유지하도록 정리했습니다.
- 스테이징에서 먼저 확인한 뒤 같은 변경을 운영 `index.html`에 이식했습니다.
- 운영 기준 최신 코드 커밋은 `fcf1fcd`입니다.

## 2026-04-06 OMR 번호 정렬 보정 운영 이식
- 스테이징에서 승인된 OMR 번호 정렬 보정을 운영 `main.css`에 그대로 이식했습니다.
- 문항 번호 칸을 `18px` 고정 폭으로 줄이고, `text-align: left`, `font-variant-numeric: tabular-nums`를 적용해 `1.`과 `10.` 이후가 같은 단위 칸에 맞도록 조정했습니다.
- 행 gap을 `0`으로 줄여 `nn.` 뒤 공백처럼 보이던 영역을 최소화했고, 선택지 버튼 쪽은 더 촘촘하게 붙도록 유지했습니다.
- 운영 기준 최신 코드 커밋은 `61ade84`입니다.

## 2026-04-06 고급 기능 안내 문구 개편
- 일반모드용 `고급 기능 안내`와 고급모드용 `고급 기능` 설명 문구를 별도로 유지한 채, 기능 이득이 더 직접 보이도록 문장을 전면 정리했습니다.
- 일반모드 안내에는 `4분 빨리 끝나는 문제 보정`을 넣지 않았고, 고급모드 안내에만 `전체 시간 75분 고정`과 조기 종료 보정 설명을 유지했습니다.
- `문항별 상세 통계 TXT 다운로드`는 과목별 정오답, 미응답, 문항별 소요 시간 복기 자료라는 점이 바로 보이도록 바꿨습니다.
- 운영 기준 최신 코드 커밋은 `5ebe604`입니다.

## 2026-04-06 고급 안내 정렬/추상화 조정
- `SKCT와 거의 동일한 축`으로 보이는 `계산기 고급 동작`, `우측 버튼 열`을 일반모드/고급모드 안내 모두에서 최상단으로 재배치했습니다.
- 설명 문구는 기능 이득은 이해되되 그대로 카피하기 어렵도록, 세부 구현 나열 대신 `실전 감각`, `복기`, `시야 적응`, `시간 운영` 중심의 표현으로 다듬었습니다.
- 일반모드와 고급모드 설명은 계속 분리 유지했고, 고급모드에만 시간 보정 관련 문구를 남겼습니다.
- 운영 기준 최신 코드 커밋은 `04e81c2`입니다.

## 2026-04-06 건너뛴 문제 정답 입력 안내 보강
- 코드 확인 결과, 건너뛴 문제도 원래 `정답 입력 모드`에서는 클릭해서 정답 입력이 가능했습니다.
- 실제 불편은 로직 누락이 아니라 UI 안내 부족에 가까워, 점수/정답 입력 모드 진입 시 `미응답(건너뛴) 문제도 번호를 바로 클릭해 정답을 입력할 수 있습니다.` 안내를 노출하도록 보강했습니다.
- 운영과 스테이징 모두 같은 방식으로 적용했고, 캐시 우회를 위해 CSS/JS 자산 버전도 `202604061155`로 갱신했습니다.
- 운영 기준 최신 코드 커밋은 `3db1fb8`입니다.

## 2026-04-05 추가 수정
- `main.js`
  - OMR 문항 번호 옆 개별 `건너뛰기` 버튼 제거
  - `정답 입력 모드` 진입 시 전체 타이머와 문항 가이드 타이머가 즉시 멈추도록 공통 정지 헬퍼 추가
  - 과목별 상세 통계를 `details/summary` 기반 접기 UI로 재구성하고, 과목별 오답/미응답과 소요 시간을 한 묶음으로 표시
  - 총시간 기본값 강제 최소 보정 제거로 `75분` 저장 허용
- `index.html`
  - 무적모드에 `(테스트)` 표기 추가
  - 사용자 기본 총시간 표시/설정값을 `75`로 조정
  - 무적모드 설치 모달에도 테스트 기능 안내 문구 반영
- `admin.html`
  - 관리자 타이머 기본값 저장 로직에서 `79분 이상 강제 보정` 제거
  - 관리자 기본 입력값을 `75`로 조정
- `chrome-extension/popup.html`
  - 확장 팝업에도 테스트 기능 표기 추가
- `skct_extension.zip`
  - 수정된 `chrome-extension` 기준으로 재생성

## 2026-04-05 검증 메모
- Playwright 로컬 검증 기준:
  - OMR 좌측 문항 행에 개별 `건너뛰기` 버튼이 더 이상 보이지 않음
  - 타이머 실행 후 `정답 입력 모드` 전환 시 버튼 문구가 `▶ 시작 / 정지`로 즉시 돌아오고, 2초 대기 후에도 시간이 더 줄지 않음
  - 같은 시점에 문항 가이드 표시도 숨겨짐
  - 과목별 상세 통계 모달에 과목별 `details` 요소 5개가 생성되고 모두 기본 접힘(`open=false`) 상태임
  - 관리자 저장 동선으로 `전체 시간 75 / 과목 15 / 쉬는 시간 1` 저장 후 `index.html?dev=1&preview=1` 재진입 시 `75:00` 표시 확인
- ZIP 점검:
  - 포함 파일은 `content.js`, `icon128.png`, `icon48.png`, `manifest.json`, `popup.html` 5개뿐
  - `chrome-extension` 내부에서 사용자명, 절대경로, 토큰, 개인 설정 문자열 검색 결과 없음
- 추가 원인 확인:
  - Firebase 원격 `config/timerDefaults` 값은 이미 `75/15/1`로 정상 저장되어 있었음
  - 그럼에도 실제 웹에서 `79`가 남아 보인 이유는 브라우저 `localStorage`의 예전 기본값 `79/15/1`이 사용자 커스텀 값처럼 계속 우선 적용됐기 때문
  - 이에 `main.js`에서 오래된 기본 저장 패턴(`79/15/1`, `source !== 'user'`)은 자동 삭제하도록 보강
  - 이후 사용자가 직접 저장한 값만 `source: 'user'`로 기록하도록 변경
  - `main.js?v=2026040512`로 캐시 버스팅도 추가

## 운영 기준 고정 메모
- 현재 최신 운영 기준 커밋은 `03dc990`입니다.
- 이후 프로세스는 `로컬 개발 -> 스테이징 검증 -> 사용자 승인 -> 운영 반영` 순서로 분리합니다.
- 이 기준은 로컬 [AGENTS.md](C:/dev/01_career/_assets/tools/skct_tool/AGENTS.md)에 반영했습니다.

## 2026-04-06 운영 반영 메모
- 일반 모드와 고급 모드의 UI 경계를 다시 분리했습니다.
  - 일반 모드에서는 `무적모드`, 우측 버튼 열, `√` 버튼, 상세 통계 직접 버튼, 문항별 시간 가이드, 도구 설정이 숨겨집니다.
  - 고급 모드에서는 위 항목이 다시 살아나고, 제목과 설정 버전에 `고급버전` 표기가 붙습니다.
- 일반 사용자용으로 좌측 사이드바에 `고급 안내` 버튼을 추가했습니다.
  - 이 버튼은 고급 기능 목록만 설명하고, 사용 문의 메일 `drgon28@naver.com`을 안내합니다.
- 중요한 구현 포인트
  - 우측 버튼 열은 단순 숨김이 아니라 CSS 변수 `--tools-right-rail-reserve`, `--tools-right-rail-button-size`를 `0px`로 만들어 실제 폭도 반납합니다.
  - 문항별 가이드 타이머는 DOM만 숨기지 않고 `isAdvancedMode` 조건을 표시 로직에 넣어 회귀를 막았습니다.
  - 브라우저 제목은 Firebase `cfg.appName` 로딩 시 다시 덮이므로, 원격 설정 적용 시에도 `advanced=1`이면 `| 고급버전`이 유지되게 처리했습니다.
- 현재 최신 운영 기준 커밋은 `a0f33d6`입니다.
- 운영 `index.html`, 스테이징 `staging/site/index.html`의 CSS/JS 자산 URL에 `v=202604060950`를 붙여 캐시 버스팅도 같이 반영했습니다.

## 2026-04-05 스테이징 읽기 전용 미러 구성
- 운영 사용자 페이지 파일은 건드리지 않고 `staging/site/` 아래에 숨은 테스트 사본을 유지했습니다.
- 루트 `admin.html` 상단에 기존 `사이트 보기`와 별개로 `🧪 테스트 사이트` 버튼을 추가했습니다.
- 이 버튼은 `stg_skct_admin_gate_until` 값을 먼저 저장한 뒤 `staging/site/index.html?stage=1&preview=1`를 팝업으로 엽니다.
- 게이트 값 없이 스테이징 URL에 직접 접근하면 `staging/site/update.html?time=개발자 전용 테스트 사이트`로 되돌립니다.

## 스테이징 데이터 정책
- 스테이징 사용자 사이트는 운영 Firebase 데이터를 읽기 전용으로만 사용합니다.
- 운영 `config`, `posts`, `replies`, 방문 통계는 운영 DB에서 읽습니다.
- 스테이징 사용자 사이트에서는 방문 기록, 좋아요, 댓글, 게시글 작성, 관리자 저장 등 쓰기 흐름을 모두 차단합니다.
- 스테이징 관리자 사본은 향후 격리된 쓰기 테스트를 위해 `staging_hidden_v1/*` 네임스페이스를 유지합니다.
- 주의: 정적 GitHub Pages만으로는 운영 DB에 대한 진짜 강제 읽기 전용을 완성할 수 없고, 그 보장은 Firebase 보안 규칙 또는 별도 서버 프록시가 필요합니다.

## 이번 보강
- `admin.html`
  - `🧪 테스트 사이트` 버튼 추가
  - 기존 `사이트 보기`와 동일한 팝업 크기/위치 로직 재사용
- `staging/site/index.html`
  - 읽기 전용 배너 추가
  - 관리자 게이트 검증 로직 추가
  - 운영 DB의 방문 통계와 `config`를 읽되, 방문 기록 증분은 건너뛰도록 분기
- `staging/site/assets/scripts/app.bundle.js`
  - 커뮤니티 작성 폼을 읽기 전용 안내 박스로 교체
  - 좋아요/수정/삭제/관리자 조작 버튼 비노출 처리
  - 댓글은 펼쳐서 읽을 수만 있고, 답글 작성 폼 대신 읽기 전용 안내만 보이도록 정리
- `staging/site/update.html`
  - favicon 추가로 불필요한 404 콘솔 에러 제거
- `staging/README.md`
  - 현재 스테이징 구조와 읽기 전용 미러 원칙 문서화

## 최종 검증
- 관리자 페이지에서 숨겨진 `stagingPreviewLink` 클릭 시 `stg_skct_admin_gate_until` 저장 확인
- 게이트가 있는 상태에서 `staging/site/index.html?stage=1&preview=1` 정상 진입 확인
- 게이트를 지우고 같은 주소 재진입 시 `staging/site/update.html`로 차단 확인
- 스테이징 커뮤니티에서 읽기 전용 안내 노출 확인
- 스테이징 커뮤니티에서 좋아요 버튼은 숫자 표시만 남고, 수정/삭제 버튼 비노출 확인
- 댓글 펼치기 시 운영 댓글은 보이되, 하단에는 `읽기만 가능` 안내만 표시되는 것 확인
- Playwright 기준 최종 콘솔 에러 0건 확인

## 2026-04-05 GUIDE 문구 최신화
- 실제 운영 사용자 페이지 [index.html](C:/dev/01_career/_assets/tools/skct_tool/index.html)의 `GUIDE` 모달 기능 설명을 현재 버튼 구성에 맞게 갱신했습니다.
- 새로 반영한 항목:
  - `화면 더 줄이기`
  - `무적모드(테스트)`
  - `정답 입력 모드`
  - `채점 및 통계 확인`
  - `접속자 수`와 `게시판`의 상세 설명 최신화
- 타이머/연습장/계산기 설명도 현재 동작 기준으로 정리했습니다.
- 사용자 설정창과 관리자 페이지의 버전 표시는 `2026-04-05 12:52:36 +09:00`, `v2026.04.05.1252`로 올렸습니다.
- 커밋 `a25fb22`로 원격 `main` 푸시 완료했습니다.

## 2026-04-05 실전모드 OMR 입력 제한
- 요구사항: 실전모드에서는 현재 포커스된 문항에만 답을 입력할 수 있어야 하고, 이전 문항을 다시 클릭해 바꾸면 안 되도록 제한
- 먼저 [staging/site/assets/scripts/app.bundle.js](C:/dev/01_career/_assets/tools/skct_tool/staging/site/assets/scripts/app.bundle.js)에 동일 로직을 적용해 검증했습니다.
- 반영 방식:
  - 실전모드에서는 타이머가 멈춰 있어도 현재 문항 외 버튼은 모두 비활성화
  - 시간이 끝나 잠긴 과목은 일시정지 상태에서도 계속 잠금 유지
  - 연습모드에서는 기존처럼 모든 문항 자유 입력 유지
- 검증 결과:
  - 스테이징에서 실전모드 기본 진입 시 1번만 활성, 2번 이후는 모두 비활성 확인
  - 1번 답 입력 후 현재 문항이 2번으로 이동하고, 1번은 다시 비활성화되는 것 확인
  - 연습모드로 전환 후 1번과 2번 모두 다시 활성화되는 것 확인
  - 운영본 로컬 [main.js](C:/dev/01_career/_assets/tools/skct_tool/main.js) 적용 후 같은 시나리오로 재검증했고 Playwright 콘솔 에러 0건 확인

## 2026-04-05 팝업 진입 UX 정리
- 자동 팝업 진입은 복원하지 않았습니다. 브라우저 팝업 차단에 걸리면 다시 `팝업 모드 실행 중...` 같은 안내 화면에 갇히는 회귀가 날 수 있기 때문입니다.
- 대신 실제 사용자 페이지 [index.html](C:/dev/01_career/_assets/tools/skct_tool/index.html)에 `화면 더 줄이기` 진입점을 2곳으로 맞췄습니다.
  - 상단 타이머 바 버튼
  - 좌측 탭 목록 버튼
- 두 버튼은 모두 같은 `launchPopupMode()` 로직을 사용하도록 [main.js](C:/dev/01_career/_assets/tools/skct_tool/main.js)에서 공통화했습니다.
- 팝업 안으로 들어간 뒤에는 상단 버튼과 좌측 탭 버튼을 모두 숨겨서, 일반 페이지와 기능은 같고 "더 좁게 줄일 수 있느냐"만 다른 실제 사용 형태로 맞췄습니다.
- 팝업이 브라우저에 의해 차단되면 사전 설명 경고창 대신, 차단된 경우에만 해제 안내를 보여주도록 정리했습니다.

## 2026-04-05 이번 검증 메모
- 로컬 서버 `http://127.0.0.1:8125/index.html?dev=1&preview=1`에서 확인
- 좌측 `화면 더 줄이기` 탭 클릭 시 `skct_popup_mode` 새 창 열림 확인
- 상단 `화면 더 줄이기` 버튼 클릭 시 동일 이름 팝업으로 재사용 열림 확인
- 팝업 내부에서는 상단 버튼/좌측 팝업 탭 모두 숨김 확인
- 사용자 설정 모달과 관리자 페이지 버전 표시는 `v2026.04.05.1148`로 갱신

## 추가 진단: 자동 팝업 모드 미동작 원인
- 현재 운영 코드의 `main.js`에는 `popupBtn` 클릭 시에만 `window.open(...)`이 실행되는 로직만 남아 있습니다.
- 과거 자동 팝업 진입 로직은 `0b08056` 커밋에서 `if (!window.opener && window.name !== 'skct_popup_mode') { ... window.open(...) ... return; }` 형태로 존재했습니다.
- 하지만 이후 운영 코드에서는 이 자동 진입 블록이 제거되어, 현재 실제 서버에서는 접속 즉시 팝업 모드로 전환되지 않습니다.
- 즉, 현재 증상은 브라우저 오작동이 아니라 **자동 팝업 로직 자체가 운영 코드에서 빠진 상태**입니다.

## 2026-04-05 후원 문구 운영화
- 관리자 페이지 [admin.html](C:/dev/01_career/_assets/tools/skct_tool/admin.html)에 `☕ 후원/운영 문구 관리` 영역을 추가했습니다.
- 공지와 별도로 아래 항목을 관리자 저장 버튼으로 직접 바꿀 수 있게 했습니다.
  - 후원 모달 제목
  - 첫 문단 / 운영 배경 / 운영 원칙
  - 후원 요청 강조 문구
  - 쉬는 시간 하단 안내 문구
  - 문의 문구 / 문의 링크(또는 메일)
  - 후원 버튼 문구 / 후원 링크
- 사용자 페이지는 `config/supportConfig`를 읽어 후원 모달과 쉬는 시간 안내를 동시에 갱신하도록 연결했습니다.
- 기본 문구 톤은 [docs/TODO/TODO1.md](C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/TODO1.md)의 `광고 없는 무료 공간`, `함께 지켜주세요`, `커피 한 잔` 흐름을 반영해 정리했습니다.

## 2026-04-05 후원 문구 검증
- 로컬 서버 `http://127.0.0.1:8126/index.html?dev=1&preview=1`에서 `window.applySupportConfig(...)` 호출 시 제목/본문/강조문구/문의 링크/버튼 링크가 실제 DOM에 반영되는 것 확인
- 관리자 페이지 소스 기준으로 `config/supportConfig` 로드/저장 경로 연결 확인

## 2026-04-05 안정 버전 백업
- 현재 만족 상태인 운영 커밋 `6c90bed` 기준으로 로컬 백업 ZIP 생성
- 백업 파일: [skct_tool_backup_20260405_120941_6c90bed.zip](C:/dev/01_career/_assets/tools/skct_tool/_backup/skct_tool_backup_20260405_120941_6c90bed.zip)
- 복구용 Git 태그: `backup-20260405-120941-stable`
- 이 백업은 현재 배포된 안정 상태만 대상으로 만들었고, 워크트리에 남아 있던 로컬 메모 파일(`docs/TODO/TODO1.md`, `AGENTS.md`, `docs/agent/worklog/2026-04-05_release_process_design.md`)은 포함하지 않았습니다.

## 2026-04-05 운영 분리용 스테이징 사본 생성
- 운영 파일을 건드리지 않고 별도 복제본 작업 공간 [staging/README.md](C:/dev/01_career/_assets/tools/skct_tool/staging/README.md), [staging/site/index.html](C:/dev/01_career/_assets/tools/skct_tool/staging/site/index.html)을 만들었습니다.
- 스테이징 사본은 루트 파일을 늘리지 않도록 `assets/styles`, `assets/scripts`, `assets/images`, `assets/packages`, `assets/extension` 구조로 정리했습니다.
- 원본 운영 파일은 그대로 두고, 복제본만 아래처럼 재배치했습니다.
  - 사용자/관리자 엔트리: `staging/site/*.html`
  - 스타일: `staging/site/assets/styles/`
  - 스크립트: `staging/site/assets/scripts/`
  - 이미지: `staging/site/assets/images/`
  - 확장 ZIP: `staging/site/assets/packages/stg_skct_extension.zip`
- 같은 도메인 하위 페이지로 올려도 운영본과 충돌하지 않게 스테이징 사본의 저장소 키를 `stg_skct_*`로 분리했습니다.
- Firebase도 운영 데이터와 섞이지 않도록 `staging_hidden_v1/*` 네임스페이스만 읽고 쓰게 바꿨습니다.
- 아직 현재 운영 `admin.html`에는 연결하지 않았습니다. 사용자가 금지한 “기존 파일/서버 수정” 없이 사본만 준비한 상태입니다.

## 2026-04-05 스테이징 사본 검증
- 로컬 `http://127.0.0.1:8127/staging/site/index.html?dev=1&preview=1` 정상 렌더링 확인
- 스테이징 확장 ZIP `http://127.0.0.1:8127/staging/site/assets/packages/stg_skct_extension.zip` 응답 코드 `200` 확인

## 2026-04-05 스테이징 사본 리팩토링
- 작업 대상은 운영본이 아닌 [staging/site](C:/dev/01_career/_assets/tools/skct_tool/staging/site) 복제본만 사용
- 파일 수 축소:
  - 리팩토링 전 파일 수: `24`
  - 리팩토링 후 파일 수: `14`
- 주요 정리 내용:
  - `main.js` + `community.js`를 [app.bundle.js](C:/dev/01_career/_assets/tools/skct_tool/staging/site/assets/scripts/app.bundle.js)로 통합
  - 미사용 확장 사본 폴더 `staging/site/assets/extension/` 제거
  - 스테이징 내 중복 ZIP `skct_extension.zip` 제거, [stg_skct_extension.zip](C:/dev/01_career/_assets/tools/skct_tool/staging/site/assets/packages/stg_skct_extension.zip)만 유지
  - HTML은 그대로 두되 `assets/` 하위 경로만 참조하도록 정리
  - 운영본과 저장소 충돌 방지를 위한 `stg_skct_*` / `staging_hidden_v1/*` 분리 유지
- 안전장치:
  - 제거한 스테이징 원본 사본은 [_trash/20260405_122937](C:/dev/01_career/_assets/tools/skct_tool/_trash/20260405_122937)에 보관
- 최종 검증:
  - `http://127.0.0.1:8128/staging/site/index.html?dev=1&preview=1` 렌더링 정상
  - Playwright 콘솔 에러 `0`
  - 스테이징 ZIP 응답 코드 `200`

## 2026-04-05 운영 계산기 수식 표시 반영
- 사용자 승인 범위에 맞춰 계산기 부분만 운영 서버에 반영했습니다.
- 운영 기준 커밋은 `15b14c3`입니다.
- 반영 내용:
  - 운영 `index.html` 계산기 마크업을 staging 계산기 구조로 이식
  - 운영 `main.js` 계산 상태를 `storedValue / operator / history` 구조로 교체
  - `=` 전까지 현재 줄에 전체 수식이 유지되도록 표시 방식 수정
  - `BACK`, `SQRT`, `00` 키와 계산 기록 3줄 + 현재 입력 1줄 구조 반영
- 검증:
  - `node --check main.js` 통과
  - `node --check staging/site/assets/scripts/app.bundle.js` 통과
  - 원격 `https://agenticlab-sh.github.io/skct_tool/index.html` 응답에서 `calcHistory`, `data-val="SQRT"` 문자열 확인
  - 원격 `https://agenticlab-sh.github.io/skct_tool/main.js` 응답에서 `CALC_MAX_INPUT_LENGTH = 32`, `storedValue`, `calcHistory` 문자열 확인

## 2026-04-05 계산기 표시 구조 재보정
- 참고 사진 기준으로 계산기 줄 구조를 다시 맞췄습니다.
- 운영 기준 계산 로직 커밋은 `0d205d8`입니다.
- 핵심 변경:
  - 마지막 줄은 항상 현재 입력값 또는 결과값만 표시
  - 진행 중인 식은 위쪽 줄(`pending`)에 표시
  - 연속 계산 시 직전 식이 위쪽 이력으로 남고, 마지막 줄 결과값에서 다음 연산을 바로 이어감
  - `SQRT`도 마지막 줄에는 결과값이 남고 적용식은 위쪽 줄에 누적
- 시나리오 검증:
  - `7 + 8 =` 이후 `위: 7 + 8 / 아래: 15`
  - 이어서 `× 2` 입력 중 `위: 7 + 8, 15 × 2 / 아래: 2`
  - 다시 `=` 후 `위: 7 + 8, 15 × 2 / 아래: 30`
  - 이어서 `- 5` 입력 중 `위: 7 + 8, 15 × 2, 30 - 5 / 아래: 5`

## 2026-04-05 계산기 `=` 평가 및 우선순위 반영
- 운영 기준 계산 로직 커밋은 `af6262f`입니다.
- 핵심 변경:
  - 연산자 버튼 입력 시 즉시 계산하지 않고 식만 누적
  - `=`를 누를 때만 전체 식 계산
  - `*`, `/`를 먼저 계산하고 `+`, `-`를 나중에 계산하는 2단계 우선순위 평가 추가
  - 결과값에서 바로 다음 식을 이어 계산하는 흐름 유지
- 검증:
  - `2 + 3 × 4 = 14`
  - `10 - 2 × 3 = 4`
  - `4 + 5 = 9`
  - `node --check main.js` 통과
  - `node --check staging/site/assets/scripts/app.bundle.js` 통과

## 2026-04-05 운영 반영: 승인된 팝업/도구 UI 기본값 이식
- 운영 반영 코드 커밋은 `862ee50`입니다.
- 반영 내용:
  - 운영 `index.html`
    - `삭제` 버튼, 우측 채팅/물음표 자리 버튼, 운영 팝업 편집 패널 슬라이더, 메모장/그림판 기본값 슬라이더 추가
  - 운영 `main.css`
    - 우측 버튼 열 예약 공간, 도구 헤더 축소, 계산기 표시부 4줄 체감 높이, 현재 줄 확대, 버튼 높이 재분배 반영
  - 운영 `main.js`
    - 팝업 기본값 fallback을 `26.9 / 98.0 / 73.1 / 0.0 / OMR 34.0` 기준으로 갱신
    - 세로 비율 기본값 `8.6 / 45.0 / 46.4` 반영
    - `toolUiConfig.sideButtonColumnRatio` 지원 추가
    - 메모 `12px`, 그림판 `2px`, 하단 여백 `11%`, 우측 버튼 열 `9%` 기본값 반영
    - 우측 가짜 버튼 알림, 팝업 편집 패널 접기/펼치기, 리사이즈 최소 높이 해제 반영
- 운영 Firebase 실제값:
  - `config/popupLayout` → `window 0.269 / 0.98 / 0.731 / 0`, `omrWidthRatio 0.34`
  - `config/layoutRatios` → `timer 8.6 / utils 45.0 / calc 46.4`
  - `config/toolUiConfig` → `bottomPaddingRatio 0.11 / sideButtonColumnRatio 0.09 / noteFontSize 12 / canvasLineWidth 2`
## 2026-04-05 운영 OMR 폭 축소 및 팝업 최적화
- 운영 기준 커밋은 `b85a0be`입니다.
- 사용자 요청
  - 팝업 창 크기는 그대로 유지하면서 OMR 폭을 더 줄이고, OMR을 켰을 때도 5번 선택지까지 보여야 함
  - 적정값은 실제 팝업 캡처를 보며 판단하고 운영 서버까지 반영
- 원인
  - 기존 기본값 `OMR 34%` 자체보다, OMR 내부 패딩과 번호/선택지 버튼 크기가 커서 팝업 폭 400px대에서 5번이 잘렸음
- 수정 내용
  - 운영 `main.css`, 스테이징 `staging/site/assets/styles/main.css`
    - OMR 내부 오른쪽 패딩 축소
    - 과목 카드 패딩/간격 축소
    - 문항 번호 폭, 선택지 원형 버튼 크기, 버튼 간격 축소
    - 건너뛰기 버튼도 같이 축소
  - 운영 `main.js`, 스테이징 `staging/site/assets/scripts/app.bundle.js`
    - 팝업 OMR 기본값을 `34% -> 30%`로 조정
    - 팝업 OMR 리사이즈 최소폭을 `130px -> 120px`로 조정
    - 팝업 OMR 비율 하한을 더 낮춰 편집기/관리자 정규화와 동기화
  - `admin.html`
    - 관리자 요약/정규화 fallback도 `30%` 기준으로 갱신
- 캡처 기준 판단
  - `28%`에서는 5번 선택지가 다시 잘렸음
  - `30%`에서는 5지선다가 모두 보이면서 메인 도구 영역도 더 넓어졌음
- 운영 Firebase 실제값
  - `config/popupLayout` → `window 0.269 / 0.98 / 0.731 / 0`, `omrWidthRatio 0.30`
  - `staging_hidden_v1/config/popupLayout`도 같은 값으로 맞춤
- 검증
  - `node --check main.js` 통과
  - `node --check staging/site/assets/scripts/app.bundle.js` 통과
  - 14인치에 가까운 팝업 폭(약 400px)에서 실제 캡처로 `30%` 상태 확인
  - `30%`에서는 1~5 선택지가 모두 보이는 것 확인
## 2026-04-05 시작/정지 버튼 아이콘 단순화
- 운영 기준 커밋은 `8e462d2`입니다.
- 사용자 요청
  - 시작/정지 버튼을 훨씬 더 간략하게 보이게 하고 싶음
  - 시작 상태는 시작 기호, 정지 상태는 중지 기호만 표시
- 수정 내용
  - 운영 `index.html`, 스테이징 `staging/site/index.html`
    - 타이머 버튼을 아이콘 전용 폭으로 축소
    - 기본 표시를 `▶`로 변경
  - 운영 `main.js`, 스테이징 `staging/site/assets/scripts/app.bundle.js`
    - `syncTimerPlayButtonLabel()` helper 추가
    - 정지 상태는 `▶`, 실행 상태는 `■`만 보이도록 통일
    - 클릭 토글, 전체 시간 종료, 과목 종료 후 종료, 점수 모드 진입에 따른 타이머 정지까지 같은 helper를 쓰도록 정리
    - `aria-label`, `title`도 각각 `타이머 시작`, `타이머 중지`로 같이 갱신
- 검증
  - `node --check main.js` 통과
  - `node --check staging/site/assets/scripts/app.bundle.js` 통과

## 2026-04-06 숨김 고급 기능 운영 반영
- 운영 기준 커밋은 `172e5bb`입니다.
- 사용자 요청
  - `통합 설정` 연타로만 진입 가능한 숨김 고급 기능 추가
  - 비밀번호 목록 인증 후에만 사용하는 별도 팝업 제공
  - 기본 비밀번호는 `0208`
  - 문항 건너뛰기 시 문항 시간 즉시 초기화
  - 문항별 상세 통계 TXT 다운로드
  - 계산기 기록을 `Ans = 값`, `수식 = 결과`, 현재 줄 1개 구조로 일반 계산기처럼 유지
  - 총 시간이 조기 종료되지 않도록 남은 잔재 로직 정리
- 수정 내용
  - 운영 `index.html`
    - `통합 설정` 제목에 숨김 진입 트리거 ID 추가
  - 운영 `advanced-tools.html`
    - 비밀번호 인증, 현재 상태 확인, 상세 통계 TXT 다운로드, 비밀번호 목록 관리 전용 팝업 신설
  - 운영 `main.js`
    - `SKCTAdvancedBridge` 추가
    - 비밀번호 목록 기본값 `0208`
    - 제목 7연타 시에만 고급 팝업 열기
    - 문항 전환 로직을 공통 함수로 정리해 건너뛰기 시 `questionSpentSec` 즉시 초기화
    - 상세 통계 HTML/TXT 생성을 공통 모델 함수로 분리
    - 계산기 기록에 `Ans = 결과값` 보관 로직 추가
    - 총시간은 `전체 설정값`과 `과목+쉬는시간 합계` 중 큰 값을 사용하도록 보정
- 검증
  - `node --check main.js` 통과
  - 원격 운영 HTML에서 `settingsTitleTrigger` 반영 확인
  - 원격 운영 JS에서 `SKCTAdvancedBridge`, `recordCurrentQuestionTiming`, `downloadDetailedStatsText`, `Ans =`, `getEffectiveConfiguredTotalSeconds` 반영 확인
  - 원격 운영 `advanced-tools.html`에서 비밀번호/TXT 다운로드 버튼 문자열 확인

## 2026-04-06 쉬는 시간 스킵 및 이전 문항 재선택 허용
- 운영 기준 커밋은 `3121797`입니다.
- 사용자 요청
  - 쉬는 시간 오버레이에서 바로 다음 과목으로 넘어가는 스킵 버튼 추가
  - 실전 모드에서도 이전 문항 답안 수정 허용
  - 다만 문항별 소요 시간은 처음 넘어갈 때 기록된 값만 유지
- 수정 내용
  - 운영 `index.html`, 스테이징 `staging/site/index.html`
    - 쉬는 시간 오버레이에 `쉬는 시간 건너뛰기` 버튼 추가
  - 운영 `main.js`, 스테이징 `staging/site/assets/scripts/app.bundle.js`
    - `advancePhaseBoundary()`로 페이즈 종료/전환 로직 공통화
    - 쉬는 시간 스킵 시 남은 쉬는 시간 초를 전체 남은 시간에서도 같이 차감한 뒤 바로 다음 과목 시작
    - OMR 활성 조건을 `현재 문항만`에서 `현재+이전 문항`으로 확장
    - 현재 문항 클릭일 때만 자동 다음 문항 이동, 이전 문항 수정은 자리 이동 없이 답만 갱신
    - 문항별 시간 기록은 기존처럼 현재 문항을 떠날 때만 확정되어 과거 문항 재수정에 영향 없도록 유지
- 로컬 검증
  - `node --check main.js` 통과
  - `node --check staging/site/assets/scripts/app.bundle.js` 통과
  - 문자열 확인
    - `breakSkipBtn`
    - `isAnswerEditableIndex`

## 2026-04-06 전체 시간 75분 고정 복원
- 운영 기준 커밋은 `9f9fa20`입니다.
- 사용자 요청
  - 전체 시간은 75분으로 유지
  - 4분 일찍 끝나던 문제는 해결
- 수정 내용
  - 운영 `main.js`, 스테이징 `staging/site/assets/scripts/app.bundle.js`
    - 전체 제한 시간은 다시 `configTotalMins * 60`만 사용
    - 쉬는 시간(`break`)에는 `totalSeconds`를 차감하지 않도록 변경
    - 그래서 과목 풀이 시간 총합은 75분, 쉬는 시간 4분은 별도 벽시계 시간으로만 흐름
  - 운영 `advanced-tools.html`, 스테이징 `staging/site/advanced-tools.html`
    - 상태 표시 문구를 `전체 제한 시간(쉬는 시간 제외)` 기준으로 수정
  - 상세 통계 TXT 머리말도 같은 문구로 통일
- 검증
  - `node --check main.js` 통과
  - `node --check staging/site/assets/scripts/app.bundle.js` 통과
  - 문자열 확인
    - `전체 제한 시간(쉬는 시간 제외)`
    - `return configTotalMins * 60;`
    - `currentPhase?.type !== 'break'`

## 2026-04-06 고급 기능 팝업을 실제 고급 버전 사용자 화면으로 전환
- 운영 기준 커밋은 `83471ce`입니다.
- 사용자 정정 요청
  - 숨김 진입 뒤에 뜨는 창은 별도 TXT 도구창이 아니라, 우리가 실제 사용하는 팝업 웹의 고급 버전이어야 함
  - TXT 다운로드와 비밀번호 목록 관리도 그 고급 버전 화면 안에 포함되어야 함
- 문제 원인
  - 기존 `advanced-tools.html`은 인증 후에도 자체 UI를 유지하는 독립 도구창이었음
  - 그래서 사용자가 기대한 `실제 팝업 웹이 고급 기능 포함 버전으로 열린다`는 흐름과 달랐음
- 수정 내용
  - 운영 `advanced-tools.html`, 스테이징 `staging/site/advanced-tools.html`
    - 인증 전용 게이트 화면으로 축소
    - 비밀번호 성공 시 `window.name`을 실제 팝업 이름으로 바꾸고 `index.html?advanced=1`로 전환
  - 운영 `index.html`, 스테이징 `staging/site/index.html`
    - `advanced=1` 플래그 인식 추가
    - 설정 모달 안에 고급 기능 섹션 추가
  - 운영 `main.js`, 스테이징 `staging/site/assets/scripts/app.bundle.js`
    - 고급 잠금 해제 상태를 `localStorage`에 30분 유지
    - `activateAdvancedSession()`으로 인증 성공 후 실제 팝업 URL/이름 반환
    - 고급 모드에서만 설정 모달 안에 아래 기능 노출
      - `문항별 상세 통계 TXT 다운로드`
      - 허용 비밀번호 목록 저장
    - 숨김 트리거로 여는 인증 창도 일반 팝업과 같은 창 크기/위치 규칙 재사용
- 로컬 검증
  - `node --check main.js` 통과
  - `node --check staging/site/assets/scripts/app.bundle.js` 통과
  - `index.html?dev=1`에서 설정 제목 7연타 후 인증 창 열림 확인
  - 비밀번호 `0208` 입력 후 인증 창이 `advanced-tools.html`에 남지 않고 `index.html?advanced=1`로 전환됨 확인
  - 전환된 창의 `window.name`이 `skct_popup_mode`로 설정되어 실제 팝업 모드로 열림 확인
  - 전환된 창에서 설정 모달을 열면 고급 기능 섹션, TXT 다운로드 버튼, 비밀번호 목록 기본값 `0208` 노출 확인

## 2026-04-06 고급 기능 안내 버튼 추가
- 사용자 요청
  - 고급 기능 화면 안에서 어떤 기능이 들어갔는지 한 번에 설명하는 버튼 추가
- 수정 내용
  - 운영 `index.html`, 스테이징 `staging/site/index.html`
    - 고급 기능 섹션 최상단에 `고급 기능 안내` 버튼 추가
  - 운영 `main.js`, 스테이징 `staging/site/assets/scripts/app.bundle.js`
    - 버튼 클릭 시 고급 버전 개요, TXT 다운로드, 비밀번호 목록 관리, 숨김 진입 방식 설명을 담은 안내창 표시
- 검증
  - `node --check main.js` 통과
  - `node --check staging/site/assets/scripts/app.bundle.js` 통과

## 2026-04-06 고급 이용자 화면과 개발자 비밀번호 관리를 분리
- 운영 기준 커밋은 `37045eb`입니다.
- 사용자 요청
  - 고급 기능은 실제 고급 이용자들이 쓰는 화면답게 별도 버튼 구획에서 보여야 함
  - 고급 기능 안내에는 앞서 반영한 실제 고급 기능 항목들이 들어가야 함
  - 고급 기능 비밀번호 목록은 고급 이용자 화면에 보이면 안 되고, 개발자 페이지에서만 보여야 함
- 수정 내용
  - 운영/스테이징 사용자 페이지
    - 설정 모달 안에 있던 고급 기능 섹션 제거
    - 좌측 사이드바에 `🔒 고급 기능` 전용 버튼 추가
    - 고급 모드일 때만 이 버튼과 구분선이 보이도록 CSS 분기 추가
    - 전용 모달에서 아래 내용을 설명하고 TXT 다운로드 버튼 제공
      - 문항별 상세 통계 TXT 다운로드
      - 쉬는 시간 건너뛰기
      - 이전 문항 재선택 허용 및 시간 고정 규칙
      - 문항 건너뛰기 시간 처리 보정
      - 계산기 `Ans` 누적 및 일반 계산기 동작
      - 전체 시간 75분 고정
  - 운영/스테이징 개발자 페이지
    - `고급 기능 인증 비밀번호` textarea 추가
    - 비밀번호 목록을 `config/advancedFeatureConfig`, `staging_hidden_v1/config/advancedFeatureConfig`에 저장하도록 연결
  - 운영/스테이징 런타임
    - 고급 인증 검증 비밀번호를 더 이상 로컬 저장소에서 쓰지 않고 원격 설정값에서 읽도록 변경
- 로컬 검증
  - 고급 인증 뒤에 사이드바 `고급 기능` 버튼 노출 확인
  - 설정 모달에 `허용 비밀번호 목록` UI가 더 이상 보이지 않음 확인
  - `고급 기능` 버튼 클릭 시 고급 기능 모달 열림 확인
  - 모달 설명에 `쉬는 시간 건너뛰기`, `이전 문항 재선택 허용`, `계산기 고급 동작` 포함 확인

## 2026-04-06 문항 통계 요약 확장 및 건너뜀 처리 기준 추가
- 운영 기준 커밋은 `52ea5cc`입니다.
- 사용자 요청
  - 현재 통계가 `푼 문제 / 맞은 개수 / 푼 문제 대비 정답률`만 보여서 부족함
  - `맞은 / 푼 / 전체`, `정답률(푼 문제 대비)`, `정답률(전체 대비)`, `건너뛴 문제`, `못 푼 문제`를 compact하게 보여주고
  - 고급 모드 상세 통계에서는 문항별 `입력답`, `정답`, `결과`, `소요시간`까지 함께 보이게 해달라는 요청
  - 설정에서 `건너뛴 문제를 오답 처리`할지 선택 가능해야 함
- 사실 확인
  - `건너뛴 문제는 정답 입력 모드에서 클릭이 안 된다`는 제보는 실제 로직 버그는 아니었음
  - 기존에도 건너뛴 문제는 정답 입력 모드에서 다시 클릭 가능했으므로, 문제의 본질은 채점 모델과 표시 방식이 단순했던 점이었음
- 수정 내용
  - 운영/스테이징 공통 HTML에서 점수 요약 패널을 5줄 구조로 확장
  - 운영/스테이징 공통 JS에서 문항 단위 통계 모델(`answered / skipped / unanswered / correct / wrong`)을 새로 계산
  - 상세 통계 모달과 TXT 다운로드에 전체 요약, 과목별 요약, 문항별 결과 테이블을 추가
  - 설정 모달에 `건너뛴 문제를 오답으로 처리` 체크박스를 추가하고 로컬 저장값(`skct_score_cfg`, `stg_skct_score_cfg`)과 연결
  - 설정 변경 후 이미 열려 있는 요약 패널과 상세 통계 모달도 다시 그리도록 보강
- 검증
  - `node --check main.js` 통과
  - `node --check staging/site/assets/scripts/app.bundle.js` 통과
  - 로컬 HTTP 서버 응답 `200` 확인
  - 원격 스테이징/운영 HTML, JS 응답에서 새 통계 ID와 설정 키 문자열 반영 확인

## 2026-04-06 공개 문의 이메일 교체
- 운영 기준 커밋은 `eb59be3`입니다.
- 사용자 요청
  - 웹에 노출되는 문의 이메일을 `drgon28@naver.com`에서 `zhdlsqpdj@gmail.com`으로 변경
  - 운영 반영까지 완료
- 수정 내용
  - 운영 `index.html`
  - 스테이징 `staging/site/index.html`
  - 공개 문서 `README.md`
  - 고급 기능 사용 문의 문구를 새 메일로 교체
- 확인 내용
  - 운영/스테이징 RTDB `supportConfig.contactUrl`은 비어 있어 원격 설정에서 덮어쓰는 메일은 없었음
  - 원격 운영/스테이징 HTML 응답에서 새 메일 노출, 구 메일 미노출 확인
  - 추가로 운영 RTDB `config/notice`, `config/notice_help`, `config/notice_community`의 공지 문구 안에도 구 메일이 남아 있어 수동 교체함
  - 교체 후 운영 RTDB 전체 `config` JSON에서 구 메일 미존재, 신 메일 존재 확인
