# 2026-04-08 관리자 사이트 텍스트 기준값 승격 기록
작성일시: 2026-04-08 17:06:01 KST

## 사용자 요청
- 관리자 페이지가 항상 최상위 기준이 되게 만들고 싶음
- 이번에 코드에서 만든 고급 모드 문구도 관리자 기준값으로 옮기길 원함
- 이 원칙을 `AGENTS.md`에도 반영해 달라고 요청함

## 문제 판단
- 기존 구조는 운영 페이지가 `config/siteTextConfig`가 비어 있으면 `site-text-config.js` 하드코딩 기본값을 그대로 사용했음
- 즉 화면은 정상 동작했지만, 실제 운영 기준이 “관리자 저장값”이 아니라 “코드 fallback”에 걸려 있는 상태였음
- 이렇게 두면 이후 문구 변경 때 코드와 관리자 값이 따로 놀 수 있어, 운영 기준이 분산되는 문제가 생김

## 적용 내용
- `admin.html`
  - `코드 기본값 → 관리자 기준값` 버튼 추가
  - 운영 기준은 Firebase `config/siteTextConfig`이고, 코드 기본값은 seed/fallback 이라는 안내 문구 추가
  - 운영 `siteTextConfig`가 비어 있으면 경고 상태 메시지를 보여주도록 보강
  - 코드 기본 문구 전체를 관리자 기준값으로 저장하는 함수 `promoteCodeDefaultsToAdminBaseline()` 추가
  - 자동 검증/운영 동기화를 위해 `window.__skctPromoteSiteTextDefaults` helper 노출
- `AGENTS.md`
  - 운영 문구/기본값의 최상위 기준은 관리자 페이지가 저장하는 Firebase 값이라는 규칙 추가
  - `config/siteTextConfig`를 원격 검증 항목과 운영 기준 저장 위치에 명시
  - 문구 변경 시 코드 수정만 하지 말고 같은 턴 안에서 관리자 저장값도 함께 동기화하라는 규칙 추가

## 운영 동기화
- 로컬 관리자 페이지(`http://127.0.0.1:8135/admin.html`)를 띄운 뒤 helper를 실행해 현재 코드 기본 문구 전체를 운영 Firebase `config/siteTextConfig`에 저장함
- 저장 후 REST 조회 결과 `config/siteTextConfig`가 `null`이 아닌 실제 객체로 채워졌고, `advancedFeature.title`, `advancedFeature.statsButton` 값도 기대한 문구로 확인됨

## 검증
- 로컬 관리자 페이지 로드 후 `window.__skctPromoteSiteTextDefaults` helper 존재 확인
- helper 실행 후 `https://skct-tool-default-rtdb.firebaseio.com/config/siteTextConfig.json` 재조회
  - `saved: true`
  - `advancedFeature.title: 🔒 고급 기능`
  - `advancedFeature.statsButton: 문항별 상세 통계 TXT 다운로드`
- 운영 사용자 페이지는 이미 `config/siteTextConfig`를 읽는 구조이므로, 이제 코드 fallback이 아니라 관리자 저장값이 실제 기준으로 적용되는 상태가 됨
