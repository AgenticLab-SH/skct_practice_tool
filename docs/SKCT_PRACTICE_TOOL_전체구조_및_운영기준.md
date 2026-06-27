# SKCT Tool 전체 구조 및 운영 기준
작성일시: 2026-04-10 00:03:31 +09:00

이 문서는 현재 SKCT Tool 프로젝트를 한 번에 이해하기 위한 기준 문서입니다.  
개별 작업 로그가 많아도, 이 문서 하나로 “무슨 화면이 있고, 어디서 수정하고, 어떤 순서로 반영하는지”를 바로 파악할 수 있도록 정리합니다.

## 1. 프로젝트 한 줄 설명

이 프로젝트는 `순수 HTML/CSS/Vanilla JS + Firebase RTDB + GitHub Pages + Firebase Functions 준비 코드` 기반의 SKCT 연습 웹입니다.

핵심 기능:
- OMR
- 과목별/전체 타이머
- 메모장
- 그림판
- 계산기
- 팝업 모드
- 게시판
- 후원/공지/통계
- 숨김 고급모드

## 2. 환경 구분

### 로컬
- 현재 작업 PC에서만 확인하는 개발 환경입니다.
- 가장 먼저 여기서 수정하고 검증합니다.

### 스테이징
- 운영 반영 전 원격 확인용 환경입니다.
- 현재는 `staging/site/` 경로를 사용합니다.
- 원칙상 운영과 분리해서 먼저 검증합니다.

### 운영
- 실제 사용자들이 쓰는 페이지입니다.
- 현재 GitHub Pages 게시 원본은 `public-clean / (root)`입니다.
- 사용자 승인 전에는 운영 반영을 하지 않는 것이 기준입니다.

## 3. 모드 구분

### 일반모드
- 기본 사용자 화면입니다.
- 일반 사용자에게 보이는 기본 기능만 제공합니다.

### 고급모드
- 인증 후 진입하는 숨김 확장 모드입니다.
- 일반모드보다 실전 유사 기능과 통계 기능이 더 많습니다.

### 관리자 페이지
- 기본값 저장, 공지, 후원 문구, 구독 관리 등을 처리하는 전용 화면입니다.
- 일반 사용자 화면과 분리된 관리용 UI입니다.
- 공개 배포물에서는 실제 관리자 화면을 직접 노출하지 않고, 차단 안내 페이지로 대체합니다.

## 4. 주요 파일 역할

### 운영 사용자 화면
- [index.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/index.html)
- [main.js](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/main.js)
- [main.css](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/main.css)
- [docs-pages.css](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/docs-pages.css)
- [guide/index.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/guide/index.html)
- [faq/index.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/faq/index.html)
- [pricing/index.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/pricing/index.html)
- [privacy/index.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/privacy/index.html)
- [terms/index.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/terms/index.html)
- [extension-info.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/extension-info.html)

### 운영 관리자 화면
- [admin.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/admin.html)

### 민감 흐름 서버 분리 준비
- [functions/index.js](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/functions/index.js)
- [functions/README.md](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/functions/README.md)

### 공개 배포 추출 준비
- [scripts/export_public_clean.ps1](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/scripts/export_public_clean.ps1)
- [scripts/public-clean-admin-stub.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/scripts/public-clean-admin-stub.html)

### 스테이징 사용자 화면
- [staging/site/index.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/staging/site/index.html)
- [staging/site/assets/scripts/app.bundle.js](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/staging/site/assets/scripts/app.bundle.js)
- [staging/site/assets/styles/main.css](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/staging/site/assets/styles/main.css)

### 스테이징 관리자 화면
- [staging/site/admin.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/staging/site/admin.html)

### 고급 기능 인증 팝업
- [advanced-tools.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/advanced-tools.html)
- [staging/site/advanced-tools.html](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/staging/site/advanced-tools.html)

## 5. Firebase 설정 구조

### 운영 기본 경로
- `config/*`

대표 저장 항목:
- `timerDefaults`
- `guideDefaults`
- `layoutRatios`
- `popupLayout`
- `toolUiConfig`
- `supportConfig`
- `manualSubscriptionConfig`
- `advancedFeatureConfig`
- `notice_*`

### 스테이징 기본 경로
- `staging_hidden_v1/config/*`

의미:
- 스테이징에서 기본값을 저장해도 운영 기본값을 바로 건드리지 않도록 분리한 경로입니다.

## 6. 현재 운영 흐름 기준

### 일반 사용자
1. 일반 페이지 진입
2. 타이머/OMR/메모장/계산기 사용
3. 필요하면 팝업 모드로 더 좁은 화면 사용
4. `더보기`에서 게시판, 활성 세션, 문서형 안내, 후원 확인
5. 공개 배포에서는 관리자 경로를 열어도 차단 안내만 보입니다.

### 고급 사용자
1. 일반 화면의 `고급 안내` 버튼 또는 숨김 진입 사용
2. 비밀번호 인증
3. 고급모드 팝업으로 전환
4. 고급 기능 사용

### 관리자
1. 관리자 페이지 로그인
2. 공지/후원/기본값/고급 구독 관리
3. 필요하면 `manualSubscriptionConfig.secureApiBaseUrl`에 서버 경유 API 기본 URL 저장
4. 스테이징에서 먼저 저장/검증
5. 승인 후 운영으로 이식

## 7. 지금까지 크게 정리된 기능 묶음

### 팝업/레이아웃
- 팝업 크기, 위치, 하단 여백, 우측 버튼 열, OMR 폭을 비율 기반으로 저장
- 관리자 페이지에서만 기본값 저장
- 스테이징 저장과 운영 반영을 분리

### 계산기
- 실전형 버튼 배열 정리
- `=` 입력 시 계산
- 일반 계산기 우선순위 반영
- 이전 계산 결과를 이어서 계산 가능
- 최근 이력 표시 개선

### OMR
- 번호 정렬 보정
- 이전 문항 재선택 허용
- 문항별 시간은 처음 넘어갈 때 고정
- 실전/연습 모드에 따라 입력 제한 로직 분리

### 타이머
- 전체 시간 75분 기준 정리
- 쉬는 시간 건너뛰기 버튼 추가
- 과목별 시간 초기화/고정 로직 정리

### 후원/공지/통계
- 후원 문구를 관리자 페이지에서 저장 가능
- 후원 목록 위치와 속도 조절 가능
- 통계 표시와 상세 통계 다운로드 개선

### 보안/배포 준비
- 공개 쓰기 경로는 완전 차단 대신 먼저 값 검증을 강화해 스팸과 비정상 입력 폭을 줄였습니다.
- 신청 저장/조회/고급 라이선스 확인은 나중에 Functions로 옮길 수 있도록 서버 경유 경로를 먼저 준비했습니다.
- 공개 배포는 `scripts/export_public_clean.ps1`로 추출한 결과를 기준으로 별도 브랜치에 올릴 수 있게 정리했습니다.

### 고급모드
- 숨김 진입 + 비밀번호 인증
- 일반모드/고급모드 기능 차등화
- 고급 구독 관리 표 도입
- 평문 비밀번호 제거, 해시 기반 검증 전환

## 8. 문서 읽는 순서 추천

1. [README.md](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/docs/README.md)
2. [SKCT_PRACTICE_TOOL_전체구조_및_운영기준.md](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/docs/SKCT_PRACTICE_TOOL_전체구조_및_운영기준.md)
3. [SKCT_PRACTICE_TOOL_기능_변경이력_요약.md](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/docs/SKCT_PRACTICE_TOOL_기능_변경이력_요약.md)
4. [SKCT_PRACTICE_TOOL_지시_용어집.md](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/docs/SKCT_PRACTICE_TOOL_지시_용어집.md)
5. 세부 작업은 [docs/agent/worklog](/C:/Users/kshcg/dev/projects/03_commercialization_products/11_skct_practice_tool/docs/agent/worklog)에서 추적

## 9. 작업 원칙 요약

- 먼저 로컬에서 수정합니다.
- 가능하면 스테이징에서 먼저 확인합니다.
- 사용자 승인 전 운영 반영은 하지 않는 것이 기준입니다.
- 기본값 문제는 `HTML 표시값 + JS fallback + 관리자 저장 로직 + Firebase 실제값 + 브라우저 저장값`을 같이 봐야 합니다.
- 정적 웹은 코드가 결국 노출되므로, 보안은 `평문 제거`, `해시화`, `서버 분리` 방향으로 생각해야 합니다.

## 10. 앞으로 문서 유지 원칙

- 새로운 기능을 넣으면:
  - 작업 로그에 상세 기록
  - 이 문서에는 구조 변화만 요약 반영
  - 변경 이력 요약 문서에는 사용자 관점 변화 중심으로 반영

- 문서가 충돌하면:
  - 구조 기준은 이 문서
  - 날짜별 상세는 작업 로그
  - 사용 지시는 용어집
