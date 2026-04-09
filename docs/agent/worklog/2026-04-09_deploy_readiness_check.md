# 배포 준비 상태 점검
작성일시: 2026-04-09 23:44:30 +09:00

## 1. 질문

- 사용자가 남은 일을 정확히 알려 달라고 요청했고, 지금 바로 배포해도 되는 상태인지 확인을 요청했습니다.

## 2. 현재 상태 요약

- 작업 브랜치: `work/20260409_201424-local-safe-hardening`
- 작업 브랜치 HEAD: `9e382e7`
- 로컬 `public-clean` 브랜치: 준비 완료
- `public-clean` HEAD: `4acd264`
- 백업 기준:
  - `backup/20260409_225421-remaining-todo-start`
  - `backup-20260409_225421-remaining-todo-start`
- Firebase CLI 로그인 확인: `kshcgd28@gmail.com`
- Firebase 프로젝트 조회: `skct-tool` 확인

## 3. 결론

- **코드 준비는 거의 끝났지만, 지금 바로 보안 전환까지 포함한 운영 배포를 끝낼 수 있는 상태는 아닙니다.**
- 이유는 코드가 깨져서가 아니라, 운영 전환에 필요한 수동 단계가 아직 남아 있기 때문입니다.
- 다만 `public-clean` 자체는 로컬 미리보기 기준으로 정상 동작했고, `admin.html`은 404로 빠져 배포 경계도 의도대로 정리됐습니다.
- 가장 먼저 확인된 외부 blocker는 `skct-tool` 프로젝트의 Cloud Functions API 비활성 상태입니다.

## 4. 남은 일

### 4.1 필수
1. Cloud Functions API 활성화
2. `functions/` 실제 배포
3. 관리자 페이지에서 `보안 API 기본 URL` 저장
4. 신청 저장 / 신청 조회 / 고급 로그인이 서버 경유로 정상 동작하는지 확인
5. 그 다음 `subscriptionRequests`, `subscriptionRequestLookup`, `advancedAccountLicenses` rules 최종 잠금
6. GitHub Pages 원본을 `public-clean`으로 전환할지 승인 후 결정

### 4.2 실제로 확인된 blocker
1. `npx firebase-tools functions:list --project skct-tool` 조회가 403으로 실패했습니다.
2. 원인은 권한 부족이 아니라 `cloudfunctions.googleapis.com` 비활성입니다.
3. 따라서 지금 바로 `deploy --only functions`를 넣으면 이 단계에서 먼저 막힐 가능성이 높습니다.

### 4.3 선택 또는 값 필요
1. `CNAME`에 넣을 실제 도메인 결정
2. `ads.txt`에 넣을 실제 광고 퍼블리셔 ID 결정

## 5. 배포 판단

### 지금 배포하면 안 좋은 이유
- `public-clean` 브랜치는 로컬에만 있고 아직 운영 원본으로 연결되지 않았습니다.
- secure API 준비 코드는 들어갔지만, 실제 Functions 배포 전에는 main 앱이 fallback으로 direct RTDB를 계속 사용합니다.
- Cloud Functions API가 아직 꺼져 있어서, 민감 흐름 서버 분리도 아직 실제 운영 경로에 올라가지 못했습니다.
- 즉, 지금 배포해도 “보안 목표가 끝난 상태”는 아닙니다.

### 지금 배포해도 코드가 깨질 가능성
- 낮습니다.
- 메인 앱은 `secureApiBaseUrl`이 비어 있으면 기존 경로를 fallback으로 사용하도록 만들어 두었습니다.
- 다만 이건 “안 깨진다”는 뜻이지, “운영 전환이 완료됐다”는 뜻은 아닙니다.

## 6. 이번에 추가로 확인한 항목

- `npx firebase-tools --version` 확인
- `npx firebase-tools login:list` 확인
- `npx firebase-tools projects:list --json`으로 `skct-tool` 프로젝트 조회 확인
- `npx firebase-tools functions:list --project skct-tool` 403 확인
- `functions/` 의존성 설치 완료
- Functions emulator 구동 확인
- `skctSecureApi/health` 응답 확인
- `public-clean-preview` 정적 서버에서 메인 화면 확인
- `public-clean-preview/admin.html` 404 확인

## 7. 문서 동기화 메모

- 이번 턴은 기능 자체를 더 바꾼 것이 아니라 배포 가능 상태를 다시 점검한 것입니다.
- 기능 문서 변경은 없고, 운영 전환 TODO와 점검 기록만 갱신했습니다.

## 8. 현재 워크트리 메모

- 추적되지 않은 파일 2개가 남아 있습니다.
  - `docs/TODO/TODO1.md`
  - `docs/agent/worklog/2026-04-09_pages_exposure_todo1_doc.md`
- 이번 판단에서는 이 파일들을 건드리지 않았습니다.
