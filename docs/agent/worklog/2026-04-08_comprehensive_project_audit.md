# 2026-04-08 프로젝트 종합 점검
작성일시: 2026-04-08 16:28:39 +09:00

현재 `skct_tool` 프로젝트를 정적 코드 검토, 로컬 실행 검증, 공개 Firebase 접근 확인 기준으로 종합 점검한 결과를 정리합니다.

## 점검 범위
- 핵심 진입 파일: `index.html`, `admin.html`, `main.js`, `community.js`, `site-text-config.js`, `subscription-crypto.js`
- 스테이징 산출물: `staging/site/index.html`, `staging/site/assets/scripts/app.bundle.js`
- 문서/운영 흔적: `README.md`, `AGENTS.md`, `logs/app.log`

## 실행한 검증
- `node --check main.js`
- `node --check community.js`
- `node --check site-text-config.js`
- `node --check subscription-crypto.js`
- 로컬 서버 `python -m http.server 8129` 실행 후 Playwright로 기본 페이지, 고급모드, 스테이징 페이지 진입 확인
- Firebase RTDB 공개 읽기 확인
  - `config/adminHash`
  - `config/advancedFeatureConfig`

## 주요 발견사항

### 1. 치명적: 고급모드 접근 제어가 브라우저 `localStorage`만으로 우회됩니다
- 근거 코드
  - `index.html:795`
  - `main.js:6`
  - `main.js:70`
  - `main.js:932`
- 현재 구조는 `skct_advanced_unlock` 값만 살아 있으면 `?advanced=1` 진입 시 `advanced-mode`가 바로 켜집니다.
- Playwright 재현 결과:
  - `localStorage.setItem('skct_advanced_unlock', ...)`
  - `index.html?advanced=1` 재진입
  - `document.body.classList.contains('advanced-mode') === true`
  - 고급 전용 버튼 `bulkCorrectImportBtn` 노출 확인
- 의미:
  - 로그인 검증을 통과하지 않아도 개발자 도구 한 번으로 고급 기능을 열 수 있습니다.
  - “고급 기능 보호”가 실제 인증이 아니라 브라우저 상태 토글 수준입니다.

### 2. 치명적: 관리자/고급 계정 검증 데이터가 공개 RTDB에서 그대로 읽힙니다
- 근거 코드
  - `admin.html:1143`
  - `main.js:291`
  - `main.js:956`
- 실제 확인:
  - 비인증 `GET https://skct-tool-default-rtdb.firebaseio.com/config/adminHash.json` 성공
  - 비인증 `GET https://skct-tool-default-rtdb.firebaseio.com/config/advancedFeatureConfig.json` 성공
- 문제점:
  - 관리자 로그인은 브라우저가 `config/adminHash`를 읽어 SHA-256 비교하는 구조입니다.
  - 고급 계정도 브라우저가 `advancedFeatureConfig`를 읽어 `passwordSalt + passwordHash`로 직접 비교합니다.
  - 즉 인증 비밀이 서버에 숨겨진 것이 아니라, 공개 데이터를 클라이언트가 검사하는 방식입니다.
- 추가 위험:
  - `main.js:81`의 기본 시드 구독 정보는 원격 설정이 비어도 fallback으로 활성화됩니다.

### 3. 높음: 저장형 XSS가 가능합니다
- 근거 코드
  - `main.js:812`
  - `site-text-config.js:317`
  - `admin.html:2367`
- 현재 구조는 관리자 입력값을 별도 sanitize 없이 Firebase에 저장하고, 공개 페이지에서 `innerHTML`로 다시 주입합니다.
- Playwright 재현:
  - `window.applySupportConfig({ modalTitle: '<iframe srcdoc="<script>parent.__xss_probe=1</script>"></iframe>' })`
  - `window.__xss_probe === 1` 확인
- 영향:
  - 악성 HTML/스크립트가 실행되면 `localStorage`의 고급모드 unlock 값, 관리자 개인키, 브라우저 세션 상태가 모두 탈취 대상이 됩니다.
  - 위 1번, 4번 문제와 결합 시 피해가 더 커집니다.

### 4. 높음: 스테이징 보호가 실질적인 보호가 아닙니다
- 근거 코드
  - `admin.html:1202`
  - `staging/site/index.html:690`
- 현재 스테이징 접근 허용 조건은 `stg_skct_admin_gate_until`이라는 로컬 스토리지 값뿐입니다.
- Playwright 재현:
  - 기본 상태에서는 `staging/site/update.html?...`로 리다이렉트
  - `localStorage.setItem('stg_skct_admin_gate_until', ...)` 후 동일 URL 재진입
  - `window.SKCT_FLAGS.stagingAccess === true` 확인
- 의미:
  - 개발자 도구 사용자는 누구나 스테이징 페이지를 열 수 있습니다.
  - 로컬 규칙의 “운영과 분리된 검증 환경 보호” 요구를 만족하지 못합니다.

### 5. 중간: 관리자 개인키를 브라우저 `localStorage`에 저장합니다
- 근거 코드
  - `admin.html:749`
  - `admin.html:963`
  - `admin.html:968`
- 설명:
  - 수동 구독 신청 복호화용 개인키가 현재 브라우저 `localStorage`에 평문 저장됩니다.
  - 단독으로도 안전하지 않고, XSS가 있으면 즉시 탈취됩니다.

### 6. 낮음: 문서가 현재 코드 구조와 어긋납니다
- 근거 코드
  - `README.md:48`
  - `README.md:50`
  - `README.md:54`
- 현재 README는 `style.css`, `script.js`, `notice.json` 중심 구조를 설명하지만 실제 운영 파일은 `main.css`, `main.js`, Firebase 기반 설정 구조입니다.
- 신규 작업자나 다음 에이전트가 잘못된 파일을 기준으로 판단할 가능성이 있습니다.

## 검증 결과 요약
- JS 구문 검사: 통과
- 기본 페이지 로컬 렌더링: 통과
- 치명적/높음 보안 이슈: 다수 확인
- 자동 테스트/빌드 파이프라인: 프로젝트 내에서 확인되지 않음

## 우선 조치 권장 순서
1. 고급모드/관리자 인증을 클라이언트 검증 구조에서 분리합니다.
2. Firebase RTDB 규칙을 재설계해 `adminHash`, `advancedFeatureConfig`, 민감한 신청 데이터의 공개 읽기를 차단합니다.
3. 관리자 입력이 공개 페이지로 나가는 모든 HTML 경로에 sanitize 또는 허용 태그 기반 렌더링을 적용합니다.
4. 스테이징 보호를 로컬 스토리지 플래그가 아닌 별도 인증/비공개 경로로 교체합니다.
5. 개인키 브라우저 영구 저장을 제거하거나 최소한 세션 메모리/사용자 수동 업로드 방식으로 전환합니다.
