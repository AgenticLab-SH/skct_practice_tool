# 관리자 인증 상태와 RTDB 쓰기 권한 간극 축소
작성일시: 2026-04-09 17:32:00 KST

## 요청 요약
- 관리자 페이지에서는 로그인된 것처럼 보이는데 `공지 저장` 시 `권한 없음/세션 만료` 메시지가 떠서, 로그인 로직 변화 이력을 추적하고 재발되지 않도록 핵심 원인을 해결해 달라는 요청.

## 이력 추적
- `git blame` 기준 로그인 관련 핵심 변경은 `aa6ccc20` (`2026-04-08 18:19:51 +0900`, `feat: harden auth and public config access`)에서 들어갔다.
- 이 커밋에서 관리자 로그인은 예전 해시 비교 방식에서 Firebase Auth 기반으로 바뀌고, `browserSessionPersistence`와 `onAuthStateChanged()` 진입 구조가 도입됐다.

## 핵심 원인
- 관리자 화면은 `onAuthStateChanged()`에서 사용자 객체가 있으면 바로 대시보드로 들어갔다.
- 하지만 실제 RTDB 쓰기 직전에는 토큰 유효성을 다시 확인하지 않았다.
- 그래서 아래 상태가 가능했다.
  - 화면상으로는 로그인됨
  - 실제 RTDB `config` 쓰기에서는 `Permission denied`
- 즉 문제의 본질은 단순 세션 만료 안내 부족이 아니라, **UI 로그인 상태와 실제 DB 쓰기 가능 상태를 같은 기준으로 묶지 않은 것**이었다.

## 수정 내용
- `admin.html`
  - `ensureAdminWriteSession()` 추가
    - 대시보드 진입 전 / 모든 관리자 쓰기 전 `auth.currentUser`와 `getIdToken()` 확인
  - `runAdminDatabaseWrite()` 추가
    - 쓰기 전 토큰 확인
    - `Permission denied`면 `getIdToken(true)`로 강제 갱신 후 1회 자동 재시도
  - `adminSetValue()`, `adminUpdateValue()`, `adminRemoveValue()`, `adminRunTransactionValue()` 추가
    - 관리자 페이지의 주요 RTDB 쓰기를 공통 래퍼로 통일
  - `onAuthStateChanged()` 보강
    - 사용자 객체만 보고 진입하지 않고, 실제 토큰 확인까지 통과해야 대시보드 진입
    - 토큰 확인 실패 시 로그인 화면으로 되돌리고 재로그인 안내

## 적용 범위
- 공지 저장
- 기본 설정/사이트 텍스트/후원 저장
- 게시글/댓글 관리
- 수동 구독 설정 저장
- 신청 승인/반려/차단/삭제
- 고급 구독 반영
- 백업 복원
- 접속자 정리

## 검증
- 정적 코드 확인
  - 관리자 페이지의 직접 RTDB 쓰기 호출이 공통 래퍼 호출로 치환된 것 확인
- 라이브 관리자 페이지 로드 확인
  - 로그인 화면까지 정상 렌더링
  - 콘솔 에러 0건 확인
- 라이브 HTML 확인
  - `runAdminSaveAction`, `formatAdminSaveError` 포함 확인
  - 이후 추가로 `ensureAdminWriteSession`, 공통 쓰기 래퍼 반영 여부도 운영 반영 후 확인 필요

## 사용자 안내
- 관리자 페이지를 새로고침한 뒤 다시 로그인하면 새 인증 보강 로직을 받는다.
- 그 뒤 공지 저장 시에는
  - 정상 저장되거나
  - 토큰 재확인/재시도 후에도 실패하면 명확한 실패 사유가 바로 보이게 된다.
