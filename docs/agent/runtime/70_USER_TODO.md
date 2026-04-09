# SKCT Tool 운영 반영 전 사용자 TODO
작성일시: 2026-04-09 23:42:19 +09:00

이 문서는 코드 준비는 끝났지만, 실제 운영 반영 전에 사용자가 직접 결정하거나 실행해야 하는 항목만 모아 둔 목록입니다.

## 1. Firebase Functions 배포

1. 먼저 Cloud Functions API를 활성화합니다.
   현재 읽기 전용 점검에서 `skct-tool` 프로젝트의 `cloudfunctions.googleapis.com`이 비활성 상태로 확인됐습니다.
   열기: `https://console.developers.google.com/apis/api/cloudfunctions.googleapis.com/overview?project=skct-tool`
2. 첫 배포에서는 추가 API 활성화 안내가 더 나올 수 있습니다.
   `firebase-functions/v2` 기준으로 `Cloud Run`, `Cloud Build`, `Artifact Registry` 활성화가 함께 요구될 가능성이 높습니다.
   이 경우 안내에 따라 활성화한 뒤 몇 분 기다렸다가 다시 배포합니다.
3. 프로젝트 루트에서 아래 순서로 실행합니다.
   `cd C:\dev\01_career\_assets\tools\skct_tool`
   `cd functions`
   `npm install`
   `cd ..`
4. 로컬 점검이 필요하면 아래 명령으로 emulator를 띄웁니다.
   `npx firebase-tools emulators:start --only functions --project skct-tool`
5. 실제 배포는 아래 명령으로 진행합니다.
   `npx firebase-tools deploy --only functions --project skct-tool`
6. 배포가 끝나면 출력된 함수 URL을 확인합니다.
   예: `https://REGION-PROJECT.cloudfunctions.net/skctSecureApi`

## 2. 관리자 설정 저장

1. 관리자 페이지 로그인 후 `수동 구독 신청 관리` 섹션으로 갑니다.
2. `보안 API 기본 URL` 칸에 위 함수 URL을 그대로 넣습니다.
3. `신청 설정 저장`을 눌러 저장합니다.
4. 저장 후 아래 3가지를 다시 확인합니다.
   - 신청 저장
   - 신청 이메일 + 조회 비밀번호 조회
   - 승인된 이메일 또는 로그인 ID로 고급 로그인

## 3. RTDB rules 최종 잠금

1. secure API 동작이 확인되면 `database.rules.json`에서 아래 경로를 더 강하게 잠급니다.
   - `subscriptionRequests`
   - `subscriptionRequestLookup`
   - `advancedAccountLicenses`
2. 이 단계는 운영 Firebase Rules 탭에서 반영합니다.
3. 잠근 뒤 아래를 다시 확인합니다.
   - 신청 저장이 서버 경유로 정상 동작하는지
   - 신청 조회가 정상 동작하는지
   - 고급 로그인이 정상 동작하는지
   - 커뮤니티 / 활성 세션이 현재 강화된 검증과 충돌하지 않는지

## 4. public-clean 배포 브랜치

1. 로컬 `public-clean` 브랜치는 이미 준비돼 있습니다.
2. GitHub에 `public-clean` 브랜치를 push합니다.
   `git push origin public-clean`
3. GitHub 저장소 `Settings -> Pages`에서 게시 원본을 `public-clean / (root)`로 바꿀지 최종 승인 후 결정합니다.

## 5. 도메인/광고 값

1. 커스텀 도메인을 쓸지 결정합니다.
2. `CNAME`에 넣을 실제 도메인이 있으면 값이 필요합니다.
3. 광고를 붙일 계획이면 `ads.txt`에 넣을 실제 퍼블리셔 ID가 필요합니다.

## 6. 배포 직전 최소 체크

1. 현재 작업 브랜치 HEAD가 `4c41105` 이후인지 확인합니다.
2. `public-clean` 브랜치가 준비돼 있는지 확인합니다.
   `git branch --list public-clean`
3. 공개 배포물 미리보기가 필요하면 아래 명령을 실행합니다.
   `pwsh -File scripts\export_public_clean.ps1 -OutputDir tmp\public-clean-preview`
4. `tmp\public-clean-preview`만 별도 정적 서버로 열어 메인 화면이 정상 표시되는지 확인합니다.
