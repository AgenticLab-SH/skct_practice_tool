# 문서형 페이지 분리 및 운영 문구 동기화
작성일시: 2026-04-09 21:10:58 +09:00

## 1. 요청

- 사용자가 "다음 할 일을 찾아서 해"라고 요청했습니다.
- 직전 합의 사항은 다음과 같았습니다.
  - 운영 서버와 운영 Firebase는 건드리지 않는다.
  - 커뮤니티와 활성 세션은 유지한다.
  - 확장 ZIP은 메인 서비스 책임처럼 보이지 않게 별도 안내 경로로 둔다.

## 2. 이번 턴의 판단

- TODO 기준에서 아직 비어 있던 `guide`, `faq`, `pricing`, `privacy`, `terms` 문서형 페이지 분리가 다음 저위험 작업으로 적절하다고 판단했습니다.
- 이 작업은 운영 배포 없이도 로컬에서 완결할 수 있고, 기존 핵심 연습 기능을 건드리지 않으면서 메인 화면의 역할 경계를 더 분명하게 만들 수 있습니다.
- 작업 중 `index.html`의 숨김 제목/설명이 다시 예전 문구로 덮이는 현상을 확인해, `site-text-config.js` 기본값과 legacy migration도 함께 정리했습니다.

## 3. 수행 내용

### 3.1 문서형 페이지 추가
- `docs-pages.css`를 추가해 문서형 페이지 공통 스타일을 분리했습니다.
- 아래 정적 페이지를 새로 만들었습니다.
  - `guide/index.html`
  - `faq/index.html`
  - `pricing/index.html`
  - `privacy/index.html`
  - `terms/index.html`

### 3.2 메인 화면 연결점 정리
- `index.html`의 `더보기` 모달 하단에 문서형 페이지 링크 묶음을 추가했습니다.
- 커뮤니티, 활성 세션, 운영 후원은 유지했습니다.
- 확장 ZIP은 직접 다운로드 모달이 아니라 `extension-info.html` 안내 페이지를 통해서만 접근하도록 유지했습니다.

### 3.3 운영 문구 기본값 동기화
- `site-text-config.js`의 기본 `srTitle`, `srDescription`, `utilityModal` 설명, 가이드 내부 `sidebarFeatureHtml`을 현재 화면 구조에 맞게 수정했습니다.
- `utilityModal.extensionTitle`, `utilityModal.extensionDescription` 기본값을 추가했습니다.
- 오래된 운영 기본 문구가 자동으로 남지 않도록 `LEGACY_SITE_TEXT_DEFAULTS`에 `meta.srTitle`, `meta.srDescription` 마이그레이션 규칙을 추가했습니다.

### 3.4 문서/배포 보조 정리
- `sitemap.xml`에 새 문서형 경로를 추가했습니다.
- `README.md`, `docs/SKCT_TOOL_기능_카탈로그.md`, `docs/SKCT_TOOL_전체구조_및_운영기준.md`, `docs/agent/runtime/30_MASTER_DOC.md`, `docs/agent/runtime/35_LEARNING_NOTES.md`를 현재 구조에 맞게 갱신했습니다.
- `index.html`, `admin.html`, `staging/site/index.html`의 `main.css`, `main.js`, `site-text-config.js` 캐시 버전 문자열을 올렸습니다.

## 4. 검증

- `node --check main.js`
- `node --check site-text-config.js`
- 로컬 정적 서버(`python -m http.server 4173`)로 문서형 페이지와 `더보기` 링크 노출을 확인했습니다.

## 5. 운영 영향

- 운영 배포 없음
- 운영 Firebase rules 변경 없음
- 운영 관리자 설정 저장 없음
- 커뮤니티/활성 세션 기능 제거 없음

## 6. 다음 우선순위

1. `database.rules.json` 기준 공개 쓰기 범위를 기능 보존 전제 아래 더 줄일 수 있는지 검토
2. 신청 저장/조회/고급 로그인 확인을 장기적으로 서버 경유 구조로 옮기는 설계 정리
3. 문서형 페이지 문구와 관리자 저장값(`config/siteTextConfig`)의 최종 반영 전략 정리
