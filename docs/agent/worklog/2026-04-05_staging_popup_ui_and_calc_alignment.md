# 2026-04-05 스테이징 팝업 UI 정렬 및 계산기 개선 작업 기록
작성일시: 2026-04-05 17:15:32 KST

## 사용자 요청
- 운영 반영 전, `staging/site`에서 먼저 개선 작업 진행
- 실제 SKCT 우측 화면처럼 하단 여백을 둘 수 있게 하고, 우측 상단 채팅 버튼 자리와 우측 하단 물음표 버튼 자리 추가
- 메모장/그림판/삭제 상단 UI와 계산기 버튼 디자인을 실제 화면에 더 가깝게 조정
- 계산기는 이전 계산 결과 3개 + 현재 계산 1개를 쌓아 보여주고, `=` 후 연산 기호를 이어 쓰는 일반 계산기 흐름 지원
- 메모장 글씨 크기, 그림판 굵기 조절 기능 추가
- 위 기본값은 개발자 페이지에서만 저장 가능하고 Firebase 스테이징 경로에 저장

## 이번 턴에서 수정한 대상
- `staging/site/index.html`
- `staging/site/assets/styles/main.css`
- `staging/site/assets/scripts/app.bundle.js`
- `staging/site/admin.html`

## 구현 내용
- 스테이징 사용자 화면
  - 상단 툴 영역을 `메모장 / 그림판 / 삭제` 구조로 정리
  - 메모장 글씨 크기 슬라이더, 그림판 굵기 슬라이더 추가
  - 계산기 표시부를 입력창 방식에서 히스토리 스택 방식으로 변경
  - 계산 결과 최대 3개 이력 + 현재 계산 1개를 우측 하단 정렬로 표시
  - `C`, `←`, `÷`, `×`, `-`, `+`, `00`, `=` 포함 계산기 버튼 배열로 변경
  - 우측 상단 채팅 버튼 자리, 우측 하단 물음표 버튼 자리 추가
  - 두 버튼 클릭 시 `skct와 동일한 위치에 존재하는 기능 없는 버튼입니다` 알림 표시
- 스테이징 팝업 편집기
  - 팝업 편집 모드에서 상단/중간 가로 분리선 드래그 가능
  - 하단 여백 비율 슬라이더 추가
  - 팝업 편집기 안에서 조절된 메모 글씨 크기, 그림판 굵기까지 함께 저장 대상에 포함
- 스테이징 관리자 페이지
  - `팝업 편집기 열기` 버튼 추가
  - 현재 스테이징 팝업 기본값 요약 박스 추가
  - 팝업 편집기에서 전달한 값을 받아 아래 경로에 저장하도록 연결
    - `staging_hidden_v1/config/popupLayout`
    - `staging_hidden_v1/config/layoutRatios`
    - `staging_hidden_v1/config/toolUiConfig`
  - 스테이징 링크를 `stage=1` 게이트와 관리자 접근 토큰(`stg_skct_admin_gate_until`)을 사용하도록 정리

## 추가된 기본값 구조
- `popupLayout`
  - `window.widthRatio`
  - `window.heightRatio`
  - `window.leftRatio`
  - `window.topRatio`
  - `omrWidthRatio`
- `layoutRatios`
  - `timer`
  - `utils`
  - `calc`
- `toolUiConfig`
  - `bottomPaddingRatio`
  - `noteFontSize`
  - `canvasLineWidth`

## 검증 결과
- `node --check staging/site/assets/scripts/app.bundle.js` 통과
- 로컬 서버 `http://127.0.0.1:8000` 기준 브라우저 검증
  - `staging/site/index.html?stage=1&preview=1` 접근 확인
  - `stg_skct_popup_mode` 팝업 편집 모드에서 편집 패널, 리사이저, 숨김 처리 정상 확인
  - 메모장 글씨 크기 조절 시 `18px` 반영 확인
  - 그림판 탭 전환 후 굵기 값 `7` 반영 확인
  - 계산기 `2 + 3 =`, 이어서 `+ 4 =` 수행 시 히스토리 `2 + 3 = 5`, `5 + 4 = 9`, 현재값 `9` 누적 확인
  - 물음표 버튼 클릭 시 실제 알림창 발생 후 수동 수락 확인
  - 스테이징 사용자 화면 / 관리자 화면 모두 콘솔 에러·경고 없음 확인

## 운영 반영 상태
- 이번 턴 변경은 `staging/site`에만 적용했습니다.
- 운영본(`index.html`, `main.js`, `main.css`, `admin.html`)에는 아직 반영하지 않았습니다.

## 스테이징 배포 계획
- 운영 GitHub Pages는 `main` 루트가 실사용자 화면이므로, 이번 배포에서는 `staging/site/*`와 관련 작업 기록만 선택적으로 커밋합니다.
- 서버 관리자 페이지에는 이미 `🧪 테스트 사이트` 진입 버튼이 배포되어 있으므로, 스테이징 경로 파일만 갱신해도 개발자 페이지에서 새 테스트 화면을 열 수 있습니다.
- 운영 사용자 화면 루트 파일은 이번 배포 범위에서 제외합니다.

## 스테이징 배포 결과
- 선택 커밋: `6db4fe7` (`Deploy staging popup editor UI improvements`)
- 원격 반영: `origin/main` push 완료
- 원격 확인
  - `https://agenticlab-sh.github.io/skct_tool/staging/site/index.html`에서 `mockQuestionBtn`, `calcHistory`, `noteFontSizeRange` 문자열 확인
  - `https://agenticlab-sh.github.io/skct_tool/staging/site/admin.html`에서 `popupLayoutEditorBtn`, `popupLayoutSummary`, `toolUiConfig` 문자열 확인
  - 운영 관리자 페이지 `https://agenticlab-sh.github.io/skct_tool/admin.html`에는 기존 `🧪 테스트 사이트` 버튼이 유지됨 확인
- 영향 범위
  - 실사용 루트 페이지(`index.html`, `main.js`, `main.css`)는 이번 배포에 포함하지 않음
  - 숨은 스테이징 경로(`staging/site/*`)만 갱신

## 참고 사진 기준 최종 시각 점검
- 점검 대상
  - 사용자 첨부 계산기 참고 사진
  - `docs/참고사진/image copy.png`
  - 원격 스테이징 팝업 `https://agenticlab-sh.github.io/skct_tool/staging/site/index.html?stage=1&preview=1`
- 확인 결과
  - 일치한 부분
    - 상단 탭이 `메모장 / 그림판 / 삭제` 구조로 보임
    - 계산기 표시부가 우측 하단 정렬로 표시됨
    - `=` 버튼이 진한 색으로 강조됨
    - 우측 상단 채팅 버튼, 우측 하단 물음표 버튼 자리 자체는 존재함
  - 아직 다른 부분
    - 현재 팝업은 “우측 도구 패널만” 뜨는 형태가 아니라, 왼쪽 GUIDE/OMR 사이드바와 상단 배너가 같이 보이는 축소 화면 형태임
    - 계산기 첫 줄 우측 버튼이 참고 사진의 `√`가 아니라 현재 `×`로 배치되어 있음
    - 참고 사진의 `×`는 둘째 줄 맨 오른쪽인데, 현재 배열은 한 줄씩 위로 당겨진 형태임
    - 표시부 안의 이전 계산 3줄은 참고 사진처럼 희미하게 누적된 모습까지는 아직 완전히 맞지 않고, 초기 상태에서는 `0`만 강하게 보임
    - 우측 하단 물음표 버튼은 현재 뷰포트 기준 일부만 걸쳐 보이며, 참고 사진처럼 버튼 전체가 안정적으로 노출되지는 않음
    - 전체 여백/간격도 참고 사진보다 조금 넓어 실제 시험 화면보다 더 여유 있게 보임
- 결론
  - 기능 방향은 대부분 반영되었지만, 참고 사진과 “최종 동일” 수준은 아직 아닙니다.
  - 특히 팝업 전체 구조와 계산기 버튼 배열은 한 번 더 맞춤 보정이 필요합니다.

## 3단계 반영 프로세스 추가
- 사용자 요청
  - 테스트 사이트에서 조정한 값은 저장 버튼을 눌러야 테스트 기본값으로 반영
  - 개발자 페이지에서 `테스트 저장 -> 테스트 화면 확인 -> 실제 서버 반영` 흐름을 단계별 버튼으로 분리
- 이번 추가 수정
  - `staging/site/index.html`
    - 테스트 사용자 페이지가 `config`가 아니라 `staging_hidden_v1/config`를 읽도록 수정
    - 팝업 편집기 저장 버튼 문구를 `테스트 기본값 저장`으로 변경
  - `admin.html`
    - 팝업 기본값 섹션을 3단계 프로세스 UI로 개편
    - `1. 테스트 기본값 편집`
    - `2. 테스트 화면 열기`
    - `3. 실제 서버 반영`
    - 테스트 기본값 요약 / 실제 서버 기본값 요약을 분리 표시
    - 테스트 팝업 편집기 저장 메시지를 받아 `staging_hidden_v1/config/*`에만 저장
    - 마지막 단계 버튼을 눌렀을 때만 `config/popupLayout`, `config/layoutRatios`, `config/toolUiConfig`로 복사
  - `index.html`, `main.js`, `main.css`
    - 운영 사용자 페이지가 `config/toolUiConfig`를 읽어 하단 여백, 메모 글씨 크기, 그림판 굵기 기본값을 적용하도록 연결
    - 기본값이 없으면 기존 동작과 거의 같게 유지되도록 안전 기본값 사용
- 로컬 검증
  - `node --check main.js` 통과
  - 로컬 `admin.html`에서 3단계 버튼 DOM 존재 확인
  - 로컬 `staging/site/index.html?stage=1&preview=1`에서 실제 읽기 경로가 `staging_hidden_v1/config`로 바뀐 것 확인
  - 로컬 `staging/site/index.html` 팝업 편집기 저장 버튼 문구가 `테스트 기본값 저장`으로 표시되는 것 확인

## 일반 페이지 팝업 편집 패널 노출 회귀 수정
- 증상
  - 일반 운영 페이지(`index.html?dev=1&preview=1`)에서도 팝업 기본값 편집 패널과 분리선이 보임
- 원인
  - 운영 `index.html`의 팝업 편집 패널은 `class="hidden"`으로 들어가 있었지만, 운영 `main.css`에는 범용 `.hidden { display:none; }` 규칙이 없어 실제로 숨겨지지 않았음
- 수정
  - 운영 `main.css`에 범용 `.hidden { display: none !important; }` 추가
- 검증
  - 로컬 `http://127.0.0.1:8000/index.html?dev=1&preview=1`에서 편집 패널/분리선 모두 비표시 확인
  - 원격 `https://agenticlab-sh.github.io/skct_tool/index.html?dev=1&preview=1`에서도 편집 패널/분리선 비표시 확인
  - 콘솔 에러 없음 확인

## 스테이징 참고사진 추가 보정
- 사용자 요청
  - 테스트 팝업에서 편집 패널이 화면을 너무 가리므로 접히게 만들기
  - 계산기 우측 연산 기호를 참고사진처럼 `√ / × / - / + / =` 흐름으로 맞추기
  - 계산기 영역 상단에도 `계산기` 제목 표시
  - 스테이징 테스트 사이트만 먼저 수정
- 수정 대상
  - `staging/site/index.html`
  - `staging/site/assets/styles/main.css`
  - `staging/site/assets/scripts/app.bundle.js`
- 구현 내용
  - 팝업 편집 패널에 `펼치기 / 접기` 토글 버튼 추가
  - 실제 팝업 편집 모드에서는 기본값을 `접힘 상태`로 시작하도록 변경
  - 계산기 상단에 `계산기` 라벨 추가
  - 계산기 키 배열을 `C / ← / ÷ / √`, `7 / 8 / 9 / ×`, `4 / 5 / 6 / -`, `1 / 2 / 3 / +`, `0 / 00 / . / =`로 변경
  - `√` 버튼 동작 추가
    - 현재 입력값 기준 제곱근 계산
    - 이력 줄에 `√값 = 결과` 형태로 누적
- 검증
  - `node --check staging/site/assets/scripts/app.bundle.js` 통과
  - 로컬 실제 팝업(`stg_skct_popup_mode`)에서 편집 패널이 접힌 상태로 표시됨 확인
  - 로컬 팝업 화면에서 계산기 라벨이 `계산기`로 보이는 것 확인
  - 계산기 버튼 배열이 `√` 포함 20개 키 순서로 바뀐 것 확인
