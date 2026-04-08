# 2026-04-09 운영 DB 이상 항목 및 정리 후보
작성일시: 2026-04-09 00:17:08 KST

사용자 요청: 운영 Firebase RTDB에서 이상하거나 정합성이 어긋난 항목을 종합해 알려주고, 삭제는 사용자 승인 후 진행한다.

## 1. 확인 범위
- `config`
- `subscriptionRequests`
- `advancedAccountLicenses`
- 루트 shallow key

## 2. 현재 운영 상태 요약
- `config/advancedFeatureConfig/subscriptions`: 4건
  - `ods1106`
  - `mingyu7275`
  - `esun`
  - `sh`
- `advancedAccountLicenses`: 2건
  - `ods1106`
  - `mingyu7275`
- `subscriptionRequests`: 10건

## 3. 이상 항목 분류

### 3.1 사용 불가 상태의 수동 계정 2건
- 경로
  - `config/advancedFeatureConfig/subscriptions` 안의 `esun`
  - `config/advancedFeatureConfig/subscriptions` 안의 `sh`
- 상태
  - 해시(`passwordSalt`, `passwordHash`)는 있음
  - 관리자 복구용 암호문(`passwordCipher*`) 없음
  - 공개 로그인용 레코드 `advancedAccountLicenses/esun`, `advancedAccountLicenses/sh` 없음
- 의미
  - 관리자 장부에는 남아 있지만, 실제 로그인에 쓰는 공개 레코드가 없어서 현재 로그인 불가
- 조치 권장
  - 삭제보다 **비밀번호 재입력 후 다시 저장**이 우선
  - 재저장 후 공개 로그인 레코드가 같이 생성되면 정상 계정으로 복구됨

### 3.2 오래된 미처리 신청 1건
- 경로
  - `subscriptionRequests/REQ-MNPSNTEB-GVLO`
- 상태
  - `status = pending`
  - `desiredLoginIdKey = ss`
  - 이전 점검에서 현재 신청 복호화 키로 본문 복호화 실패
- 의미
  - 현재 운영 키 체계와 맞지 않는 예전 신청일 가능성이 높음
  - 승인/반려/삭제 어느 쪽으로도 정리되지 않아 사실상 고아 데이터에 가까움
- 조치 후보
  - `반려`로 정리
  - 또는 `삭제`
- 현재 판단
  - 운영상 가장 이상한 항목 1순위

### 3.3 이미 처리 끝난 중복 신청 이력 7건
- 경로
  - `subscriptionRequests/REQ-MNPY4OLR-3GX6`
  - `subscriptionRequests/REQ-MNPY94OC-CPZX`
  - `subscriptionRequests/REQ-MNPY9CFK-HV1J`
  - `subscriptionRequests/REQ-MNPY9MK8-S365`
  - `subscriptionRequests/REQ-MNPYAO37-O84O`
  - `subscriptionRequests/REQ-MNQ2AWW8-KK10`
  - `subscriptionRequests/REQ-MNQ2AXHH-A2NV`
- 상태
  - 모두 `rejected`
- 의미
  - 현재 기능상 문제는 없고, 운영 이력/감사 로그로는 의미가 있음
  - 다만 신청 목록 노이즈는 큼
- 조치 후보
  - 계속 보관
  - 또는 사용자 승인 후 일괄 삭제
- 현재 판단
  - 보안/기능 이슈는 아니고 **정리 여부만 남은 항목**

### 3.4 정상 동작하지만 관리자 비밀번호 재확인이 안 되는 활성 계정 2건
- 경로
  - `config/advancedFeatureConfig/subscriptions` 안의 `ods1106`
  - `config/advancedFeatureConfig/subscriptions` 안의 `mingyu7275`
- 상태
  - 실제 로그인용 `advancedAccountLicenses/*` 존재
  - 공개 로그인 정상
  - `passwordCipher*`는 비어 있음
- 의미
  - 사용자 로그인은 정상
  - 관리자 페이지에서 평문 비밀번호 즉시 확인은 불가
- 조치 권장
  - 삭제 대상 아님
  - 필요하면 관리자 로그인 세션에서 비밀번호를 다시 저장해 `passwordCipher*`만 보강

## 4. 이상하지 않은 항목
- `config/adminHash` 없음
- `config/advancedFeatureConfigPublic` 없음
- `advancedAccountLicenses`는 루트 목록 공개가 막혀 있고, 개별 계정 키만 읽힘
- `ods1106`, `mingyu7275`는 신청번호 경로와 ID 로그인 경로 모두 정상

## 5. 삭제 승인 시 추천 순서
1. `subscriptionRequests/REQ-MNPSNTEB-GVLO`
2. 중복 반려 이력 7건 일괄 삭제 여부 결정
3. `esun`, `sh`는 재등록 완료 후 구버전 행을 치울지 결정

## 6. 현재 결론
- 지금 당장 “문제성”이 큰 건 아래 3종뿐이다.
  - 복구 불가한 오래된 `pending` 신청 1건
  - 실제 로그인 레코드가 없는 `esun`, `sh`
  - 목록 노이즈만 남은 `rejected` 중복 신청 7건
- 반대로 `ods1106`, `mingyu7275`는 현재 정상 계정으로 본다.

## 7. 사용자 승인 후 실제 정리 내용
- 실행 시각: 2026-04-09 00시대
- 백업 경로:
  - `_backup/20260409_002351_live_cleanup_approved/advancedFeatureConfig_before.json`
  - `_backup/20260409_002351_live_cleanup_approved/subscriptionRequests_before.json`
  - `_backup/20260409_002351_live_cleanup_approved/advancedAccountLicenses_before.json`

### 7.1 삭제한 수동 계정
- `config/advancedFeatureConfig`에서 아래 2건 제거
  - `esun`
  - `sh`

### 7.2 삭제한 신청
- 오래된 `pending` 1건 삭제
  - `REQ-MNPSNTEB-GVLO`
- 중복 반려 이력 7건 삭제
  - `REQ-MNPY4OLR-3GX6`
  - `REQ-MNPY94OC-CPZX`
  - `REQ-MNPY9CFK-HV1J`
  - `REQ-MNPY9MK8-S365`
  - `REQ-MNPYAO37-O84O`
  - `REQ-MNQ2AWW8-KK10`
  - `REQ-MNQ2AXHH-A2NV`

## 8. 정리 후 현재 운영 상태
- `config/advancedFeatureConfig/subscriptions`: 2건
  - `ods1106`
  - `mingyu7275`
- `subscriptionRequests`: 2건
  - `REQ-MNPYGTBA-B5Y4` (`fulfilled`)
  - `REQ-MNQ2I11P-IIXB` (`fulfilled`)
- `advancedAccountLicenses`: 2건
  - `ods1106`
  - `mingyu7275`

## 9. 관리자 페이지 보강
- 신청 카드가 복호화되지 않은 상태여도 각 카드에서 바로 `삭제` 버튼이 보이도록 `admin.html`을 수정했다.
- 이제 신청 복호화 키가 없어도, 목록에서 개별 신청 삭제는 바로 실행할 수 있다.
