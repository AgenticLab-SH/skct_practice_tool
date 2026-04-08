# 2026-04-09 이메일 기반 이용권 신청 조회 전환
작성일시: 2026-04-09 01:38:00 KST

사용자 요청: 이용권 신청 조회에서 신청번호 대신 본인 이메일로 조회할 수 있게 바꾸고, 이용자 입장에서 덜 복잡한 흐름으로 정리한다.

## 1. 변경 목표
- 기존 `신청번호 + 조회 비밀번호` 중심 흐름을 `이메일 + 조회 비밀번호` 중심으로 전환
- 기존 신청번호 조회도 당장 깨지지 않게 유지
- 이메일 원문을 공개 인덱스로 노출하지 않도록 보안 수준 유지

## 2. 구현 방식
- [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js)
  - `normalizeLookupEmail`, `isLikelyEmailAddress`, `sha256Hex`, `buildSubscriptionLookupKey` 추가
  - `이메일 + 조회 비밀번호`를 합친 SHA-256 키를 생성
  - 새 신청 저장 시:
    - 기존 `subscriptionRequests/<requestId>` 저장 유지
    - 추가로 `subscriptionRequestLookup/<lookupKey>`에 `requestId` 매핑 저장
  - 신청 조회와 고급 모드 라이선스 확인은:
    - 입력값이 이메일처럼 보이면 lookup 인덱스로 `requestId`를 먼저 찾고
    - 이후 기존 신청 복호화/라이선스 검증 흐름을 재사용
  - 최근 신청 자동 채움도 `requestId` 대신 `이메일`을 우선 사용하도록 변경
- [admin.html](/C:/dev/01_career/_assets/tools/skct_tool/admin.html)
  - 관리자 페이지에서 신청 삭제 시 `subscriptionRequestLookup/<lookupKey>`도 함께 정리
- [database.rules.json](/C:/dev/01_career/_assets/tools/skct_tool/database.rules.json)
  - `subscriptionRequestLookup` 경로 추가
  - 공개 사용자는 lookup 키를 알아야만 개별 읽기 가능
  - 관리자(`auth != null`)는 정리/수정 가능
- [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html)
  - 플레이스홀더와 안내 문구를 이메일 중심으로 수정
- [site-text-config.js](/C:/dev/01_career/_assets/tools/skct_tool/site-text-config.js)
  - 기본 메시지와 관리자 편집용 라벨을 이메일 조회 기준으로 수정

## 3. 보안 판단
- 단순 `email -> requestId` 공개 인덱스는 이메일 존재 여부를 유추하기 쉬워서 사용하지 않았다.
- 대신 `정규화한 이메일 + 조회 비밀번호` 조합으로 lookup 키를 만들었다.
- 즉 이메일 원문은 공개 조회 경로에 직접 쓰이지 않는다.

## 4. 검증
- `node --check main.js` 통과
- `node --check site-text-config.js` 통과
- `database.rules.json` JSON 파싱 확인
- 로컬 브라우저에서 고급 안내 모달 열기 후 아래 반영 확인
  - `신청 이메일 또는 승인 ID 입력`
  - `신청 이메일 또는 기존 신청번호`

## 5. 남은 메모
- 이번 턴에서는 코드와 규칙 파일만 수정했다. 운영 배포는 하지 않았다.
- 현재 운영 Firebase의 원격 `siteTextConfig` 문구가 예전 값이면, 배포 후에도 일부 안내 문구는 관리자 저장 전까지 예전 표현이 보일 수 있다.
