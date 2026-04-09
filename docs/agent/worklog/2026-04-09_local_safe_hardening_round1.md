# 2026-04-09 로컬 안전 하드닝 1차
작성일시: 2026-04-09 20:18:43 +09:00

## 사용자 요청
- 실제 서버와 운영 사용자는 건드리지 않고 로컬에서만 다음 작업을 진행합니다.
- 작업 전 반드시 복구 가능한 백업 지점을 남깁니다.
- 나중에 한 번에 운영에 반영할 수 있게 안전하게 정리합니다.

## 먼저 한 백업
- 백업 브랜치: `backup/20260409_201424-local-safe-start`
- 백업 태그: `backup-20260409_201424-local-safe-start`
- 백업 커밋: `57d14a3`
- 작업 브랜치: `work/20260409_201424-local-safe-hardening`
- 의미:
  - 이번 로컬 정리 전 상태를 그대로 되돌릴 수 있게 현재 워크트리 전체를 별도 백업 브랜치와 태그로 고정했습니다.
  - 운영 브랜치 `main`에는 push하지 않았고, GitHub Pages나 Firebase RTDB 운영값도 변경하지 않았습니다.

## 이번 라운드에서 한 일

### 1. 공개 화면의 숨은 관리자 진입 제거
- 메인 페이지 도움말 제목 더블클릭으로 `admin.html`이 열리던 숨은 통로를 제거했습니다.
- 이런 종류의 숨은 운영 통로는 일반 사용자 화면에 남겨둘수록 위험하고, 나중에 운영자가 잊고 지나갈 가능성도 큽니다.

### 2. 과한 메타/숨김 SEO 문구 정리
- `index.html`의 `meta keywords`를 제거했습니다.
- 숨김 H1과 숨김 설명문도 과한 키워드 반복 대신, 화면 구조와 접근성에 맞는 짧은 설명으로 줄였습니다.
- 이 변경은 검색 스팸처럼 보일 수 있는 표현을 줄이면서도, 문서 구조용 텍스트는 유지하는 목적입니다.

### 3. GA4 주요 이벤트 기반 추가
- 기존 gtag 로더는 유지하고, 아래 4개 이벤트를 코드에 연결했습니다.
  - `practice_start`
  - `result_view`
  - `support_click`
  - `advanced_apply_submit`
- 기준은 아래처럼 잡았습니다.
  - 타이머를 실제로 처음 시작할 때 `practice_start`
  - 채점 결과 패널을 실제로 열 때 `result_view`
  - 후원 모달에서 외부 링크로 나갈 때 `support_click`
  - 고급 신청 저장이 실제 성공했을 때 `advanced_apply_submit`
- 분석 이벤트에는 이메일, 로그인 ID 같은 개인식별정보는 넣지 않았습니다.

### 4. runtime 기준 문서 복구
- 없던 `docs/agent/runtime/30_MASTER_DOC.md`를 새로 만들어, 현재 운영 경계, 우선순위, 읽기 순서를 얇게 정리했습니다.
- `docs/agent/runtime/35_LEARNING_NOTES.md`도 새로 만들어, 이번 라운드에서 확인한 재발 방지 포인트를 적었습니다.
- `docs/README.md`는 현재 실제 파일 상태에 맞게 다시 연결했습니다.

## 수정한 파일
- [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js)
- [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html)
- [docs/README.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/README.md)
- [30_MASTER_DOC.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/runtime/30_MASTER_DOC.md)
- [35_LEARNING_NOTES.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/runtime/35_LEARNING_NOTES.md)

## 검증
- `node --check main.js`
- 코드 재검색으로 아래를 확인했습니다.
  - `window.open('admin.html', '_blank')` 제거
  - `practice_start`, `result_view`, `support_click`, `advanced_apply_submit` 이벤트 훅 추가
  - `docs/agent/runtime/30_MASTER_DOC.md` 생성
  - `docs/agent/runtime/35_LEARNING_NOTES.md` 생성

## 기능 문서 동기화
- 기능 문서 변경 없음
- 이유:
  - 이번 변경은 숨은 운영 통로 제거, 메타 정리, 분석 이벤트 추가, 문서 기준선 복구 중심이어서 일반 사용자가 체감하는 기능 목록 자체는 바뀌지 않았습니다.

## 다음 후보 작업
1. 메인 공개 화면에서 `커뮤니티`, `활성 세션`, `확장 ZIP`을 계속 유지할지 결정
2. 유지한다면 `database.rules.json`의 공개 쓰기 범위를 먼저 줄이기
3. 고급 신청/조회/로그인 흐름의 서버측 이전 설계 초안 만들기
4. 문서 페이지(`/guide`, `/faq`, `/pricing`, `/privacy`, `/terms`) 분리 착수 여부 결정
