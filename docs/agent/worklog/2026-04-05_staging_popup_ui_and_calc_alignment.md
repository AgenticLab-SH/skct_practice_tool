# 2026-04-05 스테이징 팝업 UI 정렬 및 계산기 개선 작업 기록
작성일시: 2026-04-05 16:35:34 KST

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
