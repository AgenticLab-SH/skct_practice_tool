# 사용자 후속 작업
작성일시: 2026-04-09 02:42:28 KST

이 문서는 이번 라운드에서 코드와 문서는 끝냈지만, 사용자 승인이나 운영 절차가 있어 내가 바로 진행하지 않은 항목만 따로 모아 둔 문서입니다.

## 1. 배포 승인
- 메인 화면 구조 변경, 안내 문구 개편, 그림판 커서 개선, 보관함 새 페이지는 아직 로컬 코드에만 반영돼 있습니다.
- 운영 서버를 안전하게 유지해야 하므로, 스테이징 또는 운영 배포는 사용자 승인 후에만 진행합니다.

## 2. RTDB rules 배포
- `database.rules.json`에 아래 경로를 추가했습니다.
- `userStudyLibrary/$uid/items/$itemId`
- `staging_hidden_v1/userStudyLibrary/$uid/items/$itemId`
- 보관함을 실제로 쓰려면 rules 배포가 필요합니다.

## 3. 보관함 운영 검증
- `study-archive.html`은 Firebase Auth Email/Password 기반입니다.
- 운영 또는 스테이징에서 아래를 확인해야 합니다.
- Email/Password Auth 활성화 여부
- 배포 도메인 허용 도메인 등록 여부
- 실제 테스트 계정으로 저장, 조회, 수정, 삭제 끝까지 동작하는지

## 4. 운영 문구 공식 동기화 여부 결정
- 이번에는 운영 Firebase `config/siteTextConfig`를 직접 덮어쓰지 않고, 코드에서만 레거시 기본값 자동 보정을 넣었습니다.
- 새 문구를 운영 기준값으로 공식 저장할지 여부는 사용자 승인 후 결정하면 됩니다.
