# TODO 상태 재점검
작성일시: 2026-04-09 21:20:30 +09:00

## 1. 질문

- 사용자가 `docs/TODO/TODO.md` 기준으로 지금까지 작업이 모두 끝난 것인지 확인을 요청했습니다.

## 2. 결론

- 원래 TODO 기준으로는 **아직 전부 끝나지 않았습니다**.
- 다만 최근 사용자 합의 기준으로는 다음 항목은 의도적으로 TODO와 다르게 유지했습니다.
  - 커뮤니티 유지
  - 활성 세션 유지

## 3. 이미 반영된 항목

- `meta keywords` 제거
- 숨김 SEO 문구 축소
- GA4 주요 이벤트 일부 추가
  - `practice_start`
  - `result_view`
  - `support_click`
  - `advanced_apply_submit`
- 확장 ZIP 직접 노출 제거 후 `extension-info.html` 별도 안내 페이지 분리
- `guide`, `faq`, `pricing`, `privacy`, `terms` 문서형 페이지 추가

## 4. 아직 남은 항목

### 4.1 배포 경계 정리
- `public-clean` 같은 배포 전용 브랜치/원본 분리는 아직 하지 않았습니다.
- 현재 로컬 작업 브랜치는 `work/20260409_201424-local-safe-hardening`이고, 배포 브랜치 분리 작업은 미실행 상태입니다.

### 4.2 Firebase 권한 잠금
- 아래 경로는 아직 공개 쓰기 또는 공개 직접 쓰기 구조가 남아 있습니다.
  - `active_visitors`
  - `total_visits`
  - `daily_visits`
  - `stats/live_peak_daily`
  - `posts`
  - `replies`
  - `userLikes`

### 4.3 민감 흐름의 서버측 이전
- 신청 저장, 신청 조회, 고급 로그인 확인은 여전히 공개 클라이언트 코드가 직접 RTDB를 만지는 구조입니다.
- 장기적으로는 서버측 경유 구조가 필요하지만 아직 구현하지 않았습니다.

### 4.4 검색/광고/운영 마감
- `ads.txt`, `CNAME`은 아직 없습니다.
- Search Console/광고 체계 정리는 아직 마감하지 않았습니다.

## 5. 판단 메모

- 이번까지의 작업은 “운영 건드리지 않고 로컬에서 안전하게 정리할 수 있는 저위험 항목” 위주였습니다.
- 원래 TODO가 제안한 `커뮤니티 제거`, `활성 세션 제거`는 사용자 요청에 따라 현재는 진행 대상에서 제외한 상태입니다.
