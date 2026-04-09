# SKCT Tool 통합 TODO
작성일시: 2026-04-10 00:15:50 +09:00

이 문서는 현재 기준으로 실제 남은 일만 모은 단일 TODO입니다.  
이전에 완료된 항목과 공개 노출 정리 결과는 [2026-04-10_todo_consolidation.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/worklog/2026-04-10_todo_consolidation.md)에 기록했습니다.

## 1. 최우선: 민감 흐름 서버 전환 마무리

1. Firebase 프로젝트에서 `Cloud Functions API`를 활성화합니다.
2. 필요하면 첫 배포 중 안내되는 `Cloud Run`, `Cloud Build`, `Artifact Registry`도 같이 활성화합니다.
3. `functions/`를 실제 운영 Firebase에 배포합니다.
4. 배포 후 발급된 `skctSecureApi` URL을 확보합니다.

## 2. 관리자 설정 저장과 운영 검증

1. 관리자 페이지에서 `수동 구독 신청 관리 > 보안 API 기본 URL`에 실제 함수 URL을 저장합니다.
2. 저장 후 아래 3개 흐름을 실제 운영 기준으로 검증합니다.
   - 신청 저장
   - 신청 이메일 + 조회 비밀번호 조회
   - 승인된 이메일 또는 로그인 ID 기반 고급 로그인

## 3. RTDB 민감 경로 최종 잠금

1. secure API 경유가 정상 동작하는 것이 확인되면 아래 경로를 rules에서 최종 잠급니다.
   - `subscriptionRequests`
   - `subscriptionRequestLookup`
   - `advancedAccountLicenses`
2. 잠금 후 아래를 다시 점검합니다.
   - 신청 저장 정상 동작
   - 신청 조회 정상 동작
   - 고급 로그인 정상 동작
   - 커뮤니티와 활성 세션이 현재 강화된 검증과 충돌하지 않는지

## 4. 공개 배포 경계 유지

1. 앞으로 공개 배포는 항상 `public-clean` 기준으로만 갱신합니다.
2. 공개 배포 점검 시 아래 조건을 유지합니다.
   - 메인 URL은 `200`
   - `admin.html`은 실제 관리자 화면이 아니라 차단 페이지
   - 내부 문서와 `docs/agent/*` 공개 경로는 `404`
   - `advanced-tools.html`, `bypass.html`, `study-archive.html`은 `404`

## 5. 선택 후속 작업

### 5.1 커스텀 도메인

- 지금 당장 필수는 아닙니다.
- 쓰기로 결정하면 `CNAME`에 넣을 실제 도메인을 정하고 GitHub Pages에 연결합니다.

### 5.2 광고

- 지금 당장 필수는 아닙니다.
- 붙이기로 결정하면 `ads.txt` 퍼블리셔 ID가 필요합니다.
- 광고는 연습 화면이 아니라 문서형 페이지 위주로 검토합니다.

### 5.3 Search Console / GA 마감

- 사이트 구조가 안정된 뒤 Search Console 속성, 사이트맵, GA4 주요 이벤트를 최종 점검합니다.
- 현재는 공개 경계와 민감 흐름 전환이 더 우선입니다.

## 6. 더 이상 TODO가 아닌 결정 사항

- 커뮤니티는 유지
- 활성 세션 표시는 유지
- 확장 ZIP은 메인 앱이 아니라 별도 안내 페이지에서만 연결
- 공개 배포는 `public-clean`, 작업 기준 브랜치는 별도 work 브랜치 유지
