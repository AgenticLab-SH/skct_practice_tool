# SKCT Tool 운영 반영 전 사용자 TODO
작성일시: 2026-04-09 23:13:20 +09:00

이 문서는 코드 준비는 끝났지만, 실제 운영 반영 전에 사용자가 직접 결정하거나 실행해야 하는 항목만 모아 둔 목록입니다.

## 1. Firebase Functions 배포

1. `functions/` 의존성을 설치합니다.
2. 운영 Firebase 프로젝트에 `skctSecureApi`를 배포합니다.
3. 실제 엔드포인트 URL을 확인합니다.

## 2. 관리자 설정 저장

1. 관리자 페이지 `수동 구독 신청 관리`에서 `보안 API 기본 URL`에 위 엔드포인트를 저장합니다.
2. 로컬 또는 스테이징에서 신청 저장, 신청 조회, 고급 로그인 흐름을 한 번 더 확인합니다.

## 3. RTDB rules 최종 잠금

1. secure API 동작이 확인되면 `subscriptionRequests`, `subscriptionRequestLookup`, `advancedAccountLicenses`의 공개 read/write를 auth 또는 admin 전용으로 잠급니다.
2. 커뮤니티와 활성 세션은 유지하되, 현재 강화된 검증 rules가 실제 사용과 충돌하지 않는지 확인합니다.

## 4. public-clean 배포 브랜치

1. `scripts/export_public_clean.ps1` 결과를 기준으로 `public-clean` 브랜치를 만듭니다.
2. GitHub Pages 게시 원본을 `public-clean`으로 바꿀지 최종 승인 후 결정합니다.

## 5. 도메인/광고 값

1. 커스텀 도메인을 쓸지 결정합니다.
2. `CNAME`에 넣을 실제 도메인이 있으면 값이 필요합니다.
3. 광고를 붙일 계획이면 `ads.txt`에 넣을 실제 퍼블리셔 ID가 필요합니다.
