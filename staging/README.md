# Staging Hidden Copy
작성일시: 2026-04-05 12:48:00 KST

이 폴더는 운영 서버와 기존 파일을 건드리지 않고 별도 테스트를 진행하기 위한 복제본 작업 공간입니다.

## 목적
- 현재 운영본과 완전히 분리된 테스트 사본 유지
- 관리자 페이지에서만 열 수 있는 숨은 테스트 사이트 제공
- 운영본 회귀 없이 리팩토링과 구조 개선 실험
- 운영 데이터를 읽기 전용으로 비춰보며 실제 UI 동작 검증

## 원칙
- `staging/site/` 아래 파일만 테스트용으로 사용합니다.
- 루트의 운영 사용자 페이지 파일은 수정 대상이 아닙니다.
- 루트 `admin.html`에는 스테이징 진입 버튼만 추가할 수 있습니다.
- 테스트 요구사항은 이후 사용자 지시를 받은 뒤 이 복제본에서만 반영합니다.

## 현재 정리 방식
- HTML 엔트리: `staging/site/index.html`, `admin.html`, `update.html`, `bypass.html`
- 스타일: `staging/site/assets/styles/`
- 스크립트: `staging/site/assets/scripts/app.bundle.js` 단일 번들
- 이미지: `staging/site/assets/images/`
- 배포 패키지: `staging/site/assets/packages/stg_skct_extension.zip`

## 추가 분리 규칙
- 브라우저 저장소 키는 운영본과 겹치지 않게 `stg_skct_*` 접두사를 사용합니다.
- 스테이징 사용자 사이트는 운영 Firebase 데이터를 읽기 전용으로만 사용합니다.
- 방문자수, 좋아요, 댓글, 게시글, 관리자 저장 같은 쓰기 동선은 스테이징 UI에서 차단합니다.
- 스테이징 관리자 사본과 향후 쓰기 테스트는 `staging_hidden_v1/*` 네임스페이스를 유지합니다.
- 스테이징 정리 과정에서 제거한 원본 사본은 `_trash/`에 보관합니다.

## 현재 접근 방식
- 운영 관리자 페이지의 `🧪 테스트 사이트` 버튼으로만 진입합니다.
- 버튼 클릭 시 `stg_skct_admin_gate_until` 값을 저장하고 팝업으로 `staging/site/index.html?stage=1&preview=1`를 엽니다.
- 직접 URL을 알아도 게이트 값이 없으면 `staging/site/update.html`로 되돌립니다.
- 이 구조는 숨은 테스트 링크 제공에는 충분하지만, 정적 GitHub Pages 특성상 강한 인증을 대체하지는 않습니다.
- 운영 DB에 대한 진짜 읽기 전용 보장은 Firebase 보안 규칙 또는 별도 서버 프록시가 있어야 완성됩니다.

## 다음 단계
- 개발자 페이지 전용 숨은 진입 경로 설계
- 테스트 대상 기능별 분리 작업
- 사본 기준 리팩토링 후 별도 서버 배포 검증
