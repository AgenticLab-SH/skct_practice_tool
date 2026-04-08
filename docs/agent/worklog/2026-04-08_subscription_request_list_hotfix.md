# 2026-04-08 신청 목록 무한 로딩 핫픽스
작성일시: 2026-04-08 21:48:00 KST

## 문제
- 관리자 페이지에서 수동 구독 신청 목록이 `신청 목록을 불러오는 중...`에서 멈춤

## 원인
- RTDB rules에서 `subscriptionRequests/$requestId` 개별 읽기만 열고, 부모 경로 `subscriptionRequests` 목록 읽기를 열지 않았다.
- 관리자 화면은 `get(ref(db, 'subscriptionRequests'))`로 전체 목록을 읽기 때문에, 인증된 관리자라도 부모 `.read`가 없으면 권한 오류가 발생했다.
- 화면 쪽에는 `loadSubscriptionRequests()` 예외 처리가 없어 에러가 나도 로딩 문구가 그대로 남았다.

## 조치
- `database.rules.json`에 `subscriptionRequests/.read = "auth != null"` 추가
- `admin.html`의 `loadSubscriptionRequests()`에 `try/catch` 추가
- rules를 운영 Firebase에 다시 배포 완료

## 현재 상태
- 신청 데이터 자체는 삭제되지 않았고 `/subscriptionRequests`에 그대로 남아 있었다.
- 이번 조치는 “데이터 복구”가 아니라 “관리자 목록 읽기 권한 복구”다.
