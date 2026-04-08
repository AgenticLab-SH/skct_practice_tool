# 2026-04-09 이메일 조회 전환 운영 반영
작성일시: 2026-04-09 02:02:00 KST

사용자 요청: 신청번호를 사용자 화면에서 없애고, 이메일 기반 조회 전환을 실제 운영에 반영한다.

## 1. 반영 대상
- [main.js](/C:/dev/01_career/_assets/tools/skct_tool/main.js)
- [index.html](/C:/dev/01_career/_assets/tools/skct_tool/index.html)
- [admin.html](/C:/dev/01_career/_assets/tools/skct_tool/admin.html)
- [site-text-config.js](/C:/dev/01_career/_assets/tools/skct_tool/site-text-config.js)
- [database.rules.json](/C:/dev/01_career/_assets/tools/skct_tool/database.rules.json)
- [50_AGENT_LAST_WORK_REPORT.md](/C:/dev/01_career/_assets/tools/skct_tool/50_AGENT_LAST_WORK_REPORT.md)

## 2. 수행 내용
- 사용자 신청/조회/고급 모드 안내를 `이메일 + 비밀번호` 중심으로 정리
- 신청번호는 사용자 UI에서 숨기고 내부 식별자로만 유지
- `subscriptionRequestLookup/<sha256(email::password)>` 인덱스 추가
- 새 신청은 lookup 인덱스 저장이 실패하면 전체 신청을 되돌리도록 변경
- 관리자 신청 삭제 시 lookup 인덱스도 함께 삭제하도록 변경
- 운영 Firebase `config/siteTextConfig`를 코드 기본값으로 동기화

## 3. 검증
- `node --check main.js`
- `node --check site-text-config.js`
- `database.rules.json` JSON 파싱
- 로컬 브라우저에서 이메일 기준 입력칸 반영 확인

## 4. 운영 반영 결과
- Git 커밋: `009ee15 feat: switch manual subscription lookup to email`
- GitHub `main` push 완료
- GitHub Pages 빌드 `24146827392` 성공
- Firebase RTDB rules 재배포 완료
- Firebase `config/siteTextConfig` 코드 기본값 동기화 완료

## 5. 최종 확인
- 라이브 `index.html`에서 아래가 실제 반영됨을 확인
  - `신청 이메일 또는 승인 ID 입력`
  - `신청 이메일`
  - 신청 흐름/비밀번호 안내/조회 설명에서 신청번호 제거
- Firebase `config/siteTextConfig`에서도 `신청 이메일` 기준 문구가 저장된 상태를 확인
