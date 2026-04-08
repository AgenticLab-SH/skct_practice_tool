# 2026-04-08 보안 강화 및 공개 설정 잠금 정리
작성일시: 2026-04-08 18:09:00 KST

## 작업 목적
2026-04-08 종합 점검에서 확인된 주요 보안 문제를 최신 코드 기준으로 실제 수정 가능한 범위까지 정리했다.

핵심 목표는 아래 4가지였다.

1. 공개 RTDB에서 민감 설정이 부모 경로 읽기로 다시 노출되지 않게 막기
2. 고급 모드 해금을 로컬 저장소 플래그가 아니라 서명 검증 구조로 고정하기
3. 관리자/스테이징 관리자 인증을 Firebase Auth 기준으로 맞추기
4. 운영/스테이징 화면의 HTML 주입 지점을 sanitize 하도록 정리하기

## 이번 턴에서 반영한 내용
### 1. RTDB 규칙 구조 재설계
- `database.rules.json`에서 `config/.read = true`를 제거하고, 공개가 필요한 키만 개별 `.read = true`로 열도록 변경했다.
- `config` 루트 전체 읽기는 `auth != null`일 때만 가능하게 바꿨다.
- `staging_hidden_v1/config`도 같은 방식으로 바꿔, 공개 키만 개별 읽기 허용하고 전체 읽기는 인증 후에만 가능하게 정리했다.
- 민감 경로인 `config/adminHash`, `config/advancedFeatureConfig`, `staging_hidden_v1/config/adminHash`는 더 이상 공개 읽기 대상이 아니다.

### 2. 공개 페이지 설정 조회 방식 축소
- `index.html`, `community.js`, `staging/site/index.html`, `staging/site/assets/scripts/app.bundle.js`에서 더 이상 `config` 루트를 통째로 읽지 않도록 수정했다.
- 공개 페이지는 필요한 안전 키만 `config/<key>` 단위로 읽도록 변경했다.
- 이 변경으로 “부모 읽기 허용 때문에 자식 비밀이 같이 새는” 문제가 코드 경로에서도 사라졌다.

### 3. 인증/라이선스 구조 보강
- 운영 관리자 페이지는 이미 이번 작업 흐름에서 Firebase Auth 기반으로 바뀐 상태였고, 이번 턴에서는 스테이징 관리자 페이지도 같은 방식으로 전환했다.
- 스테이징 관리자 로그인 화면에 이메일 입력을 추가하고, `signInWithEmailAndPassword()` 기반 인증으로 변경했다.
- 고급 모드는 기존 로컬 저장소 해금 토큰이 아니라 서명된 라이선스 번들 검증 구조를 계속 사용하도록 유지했다.

### 4. XSS 방어 보강
- 운영 페이지는 이전 수정분에 이어 sanitize 기반 렌더링을 유지했다.
- 스테이징 페이지도 유용한 링크, 후원 메시지, 공지 HTML 렌더링에서 escape/sanitize 경로를 맞췄다.
- 스테이징 번들의 커뮤니티 공지 렌더링도 sanitize 하도록 보강했다.

### 5. 레거시 스테이징 관리자 프롬프트 정리
- 스테이징 번들에 남아 있던 더블클릭 관리자 프롬프트는 비활성화했다.
- 이제 스테이징 관리자 작업은 로컬 전용 `staging/site/admin.html`에서 Firebase Auth 로그인으로만 진행하도록 유도한다.

## 검증 기록
### 정적 검사
- `node --check main.js` 통과
- `node --check community.js` 통과
- `node --check site-text-config.js` 통과
- `node --check subscription-crypto.js` 통과
- `rg -F "ref(db, 'config')"` 검사 결과, 운영 공개 페이지 코드에서는 루트 읽기가 사라지고 관리자 페이지에만 남아 있는 것을 확인했다.
- `rg -F "adminHash"` 검사 결과, 실행 코드 기준 레거시 스테이징 관리자 해시 참조도 제거/비활성화된 상태를 확인했다.

### 브라우저 검증
- 로컬 `http://127.0.0.1:8130/index.html`에서 가짜 라이선스 번들을 `localStorage`에 넣은 뒤 `?advanced=1` 진입 시 `advanced-mode`가 켜지지 않는 것을 확인했다.
- 같은 페이지에서 임시 서명 키로 만든 정상 라이선스 번들은 `window.SKCTAdvancedBridge.syncStoredLicense()` 기준으로 검증 성공하는 것을 확인했다.
- `applySupportConfig()`에 `iframe srcdoc`, `img onerror`, `script` 형태 페이로드를 넣어도 `window.__xssProbe`가 실행되지 않는 것을 확인했다.
- `http://127.0.0.1:8130/staging/site/index.html?stage=1&preview=1`는 관리자 게이트가 없으면 `update.html`로 이동하고, 게이트를 넣으면 정상 진입하는 것을 확인했다.
- `http://127.0.0.1:8130/staging/site/admin.html`는 Firebase Auth 로그인 문구/이메일 입력 필드가 정상 렌더링되는 것을 확인했다.

## 남은 외부 작업
- 이 턴에서는 저장소 파일까지만 수정했다. 실제 운영 보호를 완성하려면 Firebase RTDB 규칙을 `database.rules.json` 기준으로 배포해야 한다.
- Firebase Auth 관리자 계정이 아직 준비되지 않았다면, 운영/스테이징 관리자 로그인에 사용할 계정을 콘솔에서 생성해야 한다.
- 기존 RTDB에 남아 있을 수 있는 `config/adminHash`, `config/advancedFeatureConfig` 값은 관리자 설정 저장 또는 직접 정리로 최종 삭제 여부를 확인하는 편이 안전하다.

## 메모
- 현재 워크트리에는 사용자가 만든 것으로 보이는 `50_AGENT_LAST_WORK_REPORT.md` 삭제 상태와 `docs/TODO/TODO2.md` 신규 파일이 함께 존재한다. 이번 작업에서는 건드리지 않았다.
