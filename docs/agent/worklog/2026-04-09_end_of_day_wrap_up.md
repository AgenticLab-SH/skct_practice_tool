# 2026-04-09 작업 마감 정리
작성일시: 2026-04-09 02:10:00 KST

사용자 요청: 오늘 작업을 마무리하고, 에이전트가 수행한 일을 `agent` 폴더에 기록한다.

## 1. 오늘 운영 반영까지 끝난 핵심 작업
- 관리자 인증 구조를 Firebase Auth 기준으로 정리
- 공개 RTDB에서 민감 설정이 새지 않도록 rules와 공개 읽기 경로 재구성
- 수동 구독 신청/승인/고급 라이선스 발급 흐름 복구
- `advancedAccountLicenses/<loginId>` 공개 로그인 레코드 구조 복구
- 관리자 페이지의 신청 목록 차단/반려/삭제/승인 흐름 정리
- 고급 구독 저장 시 `Permission denied`가 나던 경로 수정
- `active_visitors` 유령 세션 정리 기능 정리
- 신청 조회를 `이메일 + 비밀번호` 중심으로 전환
- 신청번호는 사용자 화면에서 숨기고 내부 식별자로만 유지
- 운영 `siteTextConfig`까지 이메일 기준 문구로 동기화

## 2. 오늘 실제 운영 반영 결과
- Firebase RTDB rules 재배포 완료
- Firebase `config/siteTextConfig` 동기화 완료
- GitHub `main` push 완료
- GitHub Pages 빌드 성공 확인
- 최신 운영 커밋: `835e8b1`

## 3. 현재 운영 기준 상태
- 이용권 신청 조회: 사용자 기준 `이메일 + 조회 비밀번호`
- 고급 모드 진입: `신청 이메일 또는 승인 ID + 비밀번호`
- 신청번호: 관리자/DB 내부용으로만 유지
- 고급 구독 내역: `ods1106`, `mingyu7275` 정상 유지
- 공개 보호 상태:
  - `config.json` 비인증 차단
  - `advancedAccountLicenses.json` 비인증 차단
  - 공개 페이지는 필요한 개별 경로만 읽도록 유지

## 4. 오늘 생성/갱신한 주요 기록
- [2026-04-09_presence_cleanup_and_advanced_license_write_fix.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/worklog/2026-04-09_presence_cleanup_and_advanced_license_write_fix.md)
- [2026-04-09_additional_operational_verification.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/worklog/2026-04-09_additional_operational_verification.md)
- [2026-04-09_advanced_account_license_root_read_fix.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/worklog/2026-04-09_advanced_account_license_root_read_fix.md)
- [2026-04-09_email_based_subscription_lookup.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/worklog/2026-04-09_email_based_subscription_lookup.md)
- [2026-04-09_hide_request_id_from_user_flow.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/worklog/2026-04-09_hide_request_id_from_user_flow.md)
- [2026-04-09_email_lookup_operational_rollout.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/worklog/2026-04-09_email_lookup_operational_rollout.md)

## 5. 남은 메모
- 워크트리에는 이번 운영 반영과 무관한 `docs/TODO/*`, `90_*` 계열 변경이 남아 있다.
- 오늘 반영 범위에는 위 TODO 정리 파일들을 포함하지 않았다.
- 다음 작업자는 운영 기준 기능 수정과 TODO 문서 구조 정리를 분리해서 보는 것이 안전하다.
