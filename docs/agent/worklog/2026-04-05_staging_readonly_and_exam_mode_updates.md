# 2026-04-05 스테이징 읽기전용 미러 및 실전모드 입력제한 작업기록
작성일시: 2026-04-05 13:12:30 KST

## 작업 배경
- 운영 사이트를 직접 흔들지 않고 먼저 숨은 테스트 사이트에서 검증하는 흐름이 필요했습니다.
- 관리자 페이지에서 운영 확인용 `사이트 보기`와 별개로, 개발 전용 `테스트 사이트` 진입점을 추가해야 했습니다.
- 동시에 실제 사이트에서는 `GUIDE` 문구, 관리자 운영 가이드, 실전모드 OMR 입력 제한 같은 운영성 개선이 이어졌습니다.

## 이번 묶음의 핵심 목표
- 운영 사용자 페이지는 그대로 두고, 관리자만 접근 가능한 숨은 스테이징 사본 제공
- 스테이징은 운영 데이터와 최대한 비슷하게 보되, 쓰기는 막는 읽기 전용 미러로 구성
- 검증이 끝난 로직만 운영본에 반영
- 운영/테스트/점검 전환에서 헷갈리는 부분을 관리자 페이지에 문서화

## 반영 내용
### 1. 관리자 전용 숨은 스테이징 진입
- 루트 [admin.html](C:/dev/01_career/_assets/tools/skct_tool/admin.html)에 `🧪 테스트 사이트` 버튼 추가
- 기존 `🔗 사이트 보기`는 운영 사이트 개발자 우회 확인용으로 유지
- 테스트 사이트 버튼은 `stg_skct_admin_gate_until` 값을 저장한 뒤 팝업으로 스테이징을 엽니다.

### 2. 스테이징 읽기 전용 미러 구성
- 스테이징 사용자 사이트는 [staging/site/index.html](C:/dev/01_career/_assets/tools/skct_tool/staging/site/index.html) 아래에서 동작
- 운영 Firebase의 `config`, `posts`, `replies`, 방문 통계는 읽음
- 방문 기록 증가, 글 작성, 댓글, 좋아요, 관리자 저장 등 쓰기 흐름은 차단
- 게이트 없이 직접 들어오면 [staging/site/update.html](C:/dev/01_career/_assets/tools/skct_tool/staging/site/update.html)로 되돌림
- 커뮤니티는 읽기 전용 안내를 띄우고 조작 버튼을 숨김

### 3. GUIDE 문구 최신화
- 실제 운영 사용자 페이지 [index.html](C:/dev/01_career/_assets/tools/skct_tool/index.html)의 `GUIDE` 모달 기능 설명 갱신
- 누락되어 있던 `화면 더 줄이기`, `무적모드(테스트)`, `정답 입력 모드`, `채점 및 통계 확인` 설명 추가
- 타이머, 연습장, 계산기 설명도 현재 동작 기준으로 재정리

### 4. 관리자 운영 가이드 추가
- [admin.html](C:/dev/01_career/_assets/tools/skct_tool/admin.html) 상단에 `🧭 운영 가이드` 카드 추가
- 내용:
  - `사이트 보기`와 `테스트 사이트`의 차이
  - `접속 차단`의 의미
  - 배포 전 체크 순서
  - 자주 바꾸는 설정 요약
  - 문제 발생 시 우선 확인할 항목

### 5. 실전모드 OMR 입력 제한
- 요구사항: 실전모드에서는 현재 포커스된 문항만 답 입력 가능, 이전 문항 재클릭 금지
- 먼저 [staging/site/assets/scripts/app.bundle.js](C:/dev/01_career/_assets/tools/skct_tool/staging/site/assets/scripts/app.bundle.js)에 적용
- 검증 후 운영본 [main.js](C:/dev/01_career/_assets/tools/skct_tool/main.js)에 동일 로직 이식
- 최종 규칙:
  - 연습모드: 모든 문항 자유 입력
  - 실전모드: 현재 문항만 입력 가능
  - 시간 종료로 잠긴 과목은 일시정지 상태에서도 다시 열리지 않음

## 검증 기록
### 스테이징 읽기 전용 미러
- 관리자 페이지에서 `🧪 테스트 사이트` 클릭 시 게이트 저장 확인
- 게이트가 있을 때만 스테이징 진입 가능 확인
- 게이트 삭제 후 동일 URL 재접속 시 차단 페이지로 이동 확인
- 스테이징 커뮤니티에서 글/댓글 읽기만 가능하고 쓰기 버튼은 숨겨지는 것 확인
- Playwright 기준 콘솔 에러 0건 확인

### 실전모드 입력 제한
- 스테이징:
  - 실전모드 기본 진입 시 1번 문항만 활성
  - 1번 답 입력 후 2번 문항으로 자동 이동
  - 이동 후 1번 문항은 다시 비활성화
  - 연습모드 전환 시 1번/2번 모두 다시 활성
- 운영본 로컬:
  - 동일 시나리오 재현 및 확인
  - Playwright 콘솔 에러 0건 확인

## 관련 커밋
- `e437ba6`: 숨은 읽기전용 스테이징 미러 추가
- `a25fb22`: GUIDE 문구를 현재 버튼 구성에 맞게 갱신
- `ee09677`: 관리자 페이지 운영 가이드 패널 추가
- `dee7554`: 실전모드 OMR 입력을 현재 문항으로 제한

## 작업 파일
- [admin.html](C:/dev/01_career/_assets/tools/skct_tool/admin.html)
- [index.html](C:/dev/01_career/_assets/tools/skct_tool/index.html)
- [main.js](C:/dev/01_career/_assets/tools/skct_tool/main.js)
- [staging/README.md](C:/dev/01_career/_assets/tools/skct_tool/staging/README.md)
- [staging/site/index.html](C:/dev/01_career/_assets/tools/skct_tool/staging/site/index.html)
- [staging/site/update.html](C:/dev/01_career/_assets/tools/skct_tool/staging/site/update.html)
- [staging/site/assets/scripts/app.bundle.js](C:/dev/01_career/_assets/tools/skct_tool/staging/site/assets/scripts/app.bundle.js)

## 후속 메모
- 현재 스테이징은 “운영 데이터 읽기 전용 미러” 수준입니다.
- 운영 DB에 대한 강제 읽기 전용을 더 강하게 보장하려면 Firebase 보안 규칙 또는 별도 프록시가 필요합니다.
- 이후 OMR, 타이머, 게시판 같은 핵심 UX 변경은 계속 `스테이징 선반영 -> 브라우저 검증 -> 운영 반영` 순서를 유지하는 편이 안전합니다.
