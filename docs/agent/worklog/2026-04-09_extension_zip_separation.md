# 2026-04-09 확장 ZIP 별도 안내 페이지 분리
작성일시: 2026-04-09 20:42:39 +09:00

## 사용자 요청
- 실제 서버는 아직 건드리지 않고 로컬에서만 작업합니다.
- 커뮤니티와 활성 세션은 유지합니다.
- 확장 ZIP은 사이트 본체와 책임 경계가 분리되어 보이도록 별도 링크 형태로 정리합니다.

## 판단
- 커뮤니티와 활성 세션은 현재 사용자 가치가 분명하므로 이번 라운드에서 유지했습니다.
- 반면 확장 ZIP은 핵심 연습 도구와 성격이 달라, 메인 앱 안에서 바로 설치/다운로드를 유도하는 구조보다 별도 안내 페이지로 분리하는 편이 맞다고 판단했습니다.
- 이 방식이면 메인 도구는 연습용 앱, ZIP은 별도 테스트 자료라는 경계가 UI 자체로 드러납니다.

## 수행 내용

### 1. 메인 `더보기`에 별도 테스트 자료 링크 추가
- `index.html`의 `더보기` 카드 영역에 `별도 테스트 자료` 링크 카드를 추가했습니다.
- 이 카드는 새 탭에서 [extension-info.html](/C:/dev/01_career/_assets/tools/skct_tool/extension-info.html)로 이동합니다.

### 2. 확장 ZIP 전용 안내 페이지 추가
- [extension-info.html](/C:/dev/01_career/_assets/tools/skct_tool/extension-info.html)을 새로 만들었습니다.
- 페이지 성격은 아래처럼 분리했습니다.
  - 핵심 연습 도구와 분리된 별도 안내
  - `noindex, nofollow`
  - 설치/사용/충돌 책임은 사용자에게 있다는 경고
  - 실제 시험/약관/보안 정책 충돌 가능성 안내
  - ZIP 다운로드 버튼과 메인 페이지 복귀 버튼 분리

### 3. 죽은 확장 모달 코드 제거
- 메인 페이지 하단에 남아 있던 `extensionModal` 대형 마크업을 제거했습니다.
- `main.js`의 `extToggle`, `extModal`, `extClose`, 설치 상태 점검 로직도 함께 제거했습니다.
- 현재 인덱스에는 `extensionToggle` 자체가 없었기 때문에, 이 코드는 실제로도 죽어 있는 잔재였습니다.

### 4. 링크 카드 스타일 보정
- `더보기` 안의 새 링크 카드가 버튼 카드와 같은 모양으로 보이도록 [main.css](/C:/dev/01_career/_assets/tools/skct_tool/main.css)에서 `.utility-action-card`에 `text-decoration: none`, `color: inherit`를 추가했습니다.

### 5. 문서 동기화
- [SKCT_TOOL_기능_카탈로그.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/SKCT_TOOL_기능_카탈로그.md)에 `더보기` 안의 `별도 테스트 자료` 이동 흐름을 반영했습니다.
- [SKCT_TOOL_전체구조_및_운영기준.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/SKCT_TOOL_전체구조_및_운영기준.md)에 운영 사용자 화면 파일 목록으로 `extension-info.html`을 추가했습니다.
- runtime 학습 메모에도 “핵심 앱과 별도 테스트 자료는 화면 구조부터 분리해야 한다”는 기준을 추가했습니다.

## 검증
- `node --check main.js`
- `rg -n -F "extensionModal" index.html main.js`
  - 결과 없음 확인
- `rg -n -F "extension-info.html" index.html docs/SKCT_TOOL_기능_카탈로그.md docs/SKCT_TOOL_전체구조_및_운영기준.md`
  - 새 경로 참조 정상 확인

## 기능 문서 동기화
- 기능 문서 변경 있음
- 이유:
  - 사용자가 `더보기`에서 확장 ZIP을 직접 받는 구조에서, 별도 안내 페이지로 이동하는 구조로 사용자 흐름이 바뀌었습니다.

## 비고
- 이번 라운드도 운영 서버, GitHub Pages, 운영 Firebase RTDB는 건드리지 않았습니다.
- `2번`으로 설명했던 것은 `database.rules.json`에서 공개 쓰기 범위를 얼마나 허용할지 조정하자는 뜻이었는데, 이번 라운드에서는 사용자가 유지하기로 한 `커뮤니티`와 `활성 세션`을 건드리지 않았습니다.
