# 에이전트 작업 큐
작성일시: 2026-04-09 02:42:28 KST

이 문서는 `docs/TODO` 기준 순차 실행 큐의 완료 이력과, 아직 사용자 승인 없이는 진행하지 않는 후속 큐를 함께 기록합니다.

## 2026-04-09 처리 결과
1. [10_부분해결/01_관리자_문구_편집기_확장.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/10_부분해결/01_관리자_문구_편집기_확장.md)
- 상태: 완료
- 핵심 결과: 사이트 텍스트 카탈로그 확대, 관리자 scope 필터, 선택 힌트, 레거시 기본값 자동 보정

2. [10_부분해결/02_일반_고급_활용_가이드_정리.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/10_부분해결/02_일반_고급_활용_가이드_정리.md)
- 상태: 완료
- 핵심 결과: 일반 안내와 고급 활용 설명 재구성, 행동 중심 카피 정리

3. [20_미해결/01_그림판_커서_가시성_문제.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/20_미해결/01_그림판_커서_가시성_문제.md)
- 상태: 완료
- 핵심 결과: 캔버스 커스텀 커서 오버레이 도입, 터치 입력과 기존 캔버스 동작 보존

4. [20_미해결/02_개인_학습자료_저장_뷰어_기능.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/20_미해결/02_개인_학습자료_저장_뷰어_기능.md)
- 상태: 완료
- 핵심 결과: 개인 전용 보관함 페이지, RTDB 사용자별 저장 모델, 검색과 필터, 자동 태깅

5. [30_추가개선/00_추가개선_INDEX.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/00_추가개선_INDEX.md)
- 상태: 완료
- 핵심 결과: 추가개선 6건의 결과와 운영 후속 재정리

6. [30_추가개선/01_메인_화면_정보구조_단순화.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/01_메인_화면_정보구조_단순화.md)
- 상태: 완료
- 핵심 결과: 핵심 진입만 남긴 사이드바와 `더보기` 유틸리티 모달

7. [30_추가개선/02_사용자_진입흐름_재설계.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/02_사용자_진입흐름_재설계.md)
- 상태: 완료
- 핵심 결과: 신청, 조회, 고급 열기, 활용 흐름의 단계 정리

8. [30_추가개선/03_문구_체계와_카피라이팅_개선.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/03_문구_체계와_카피라이팅_개선.md)
- 상태: 완료
- 핵심 결과: 용어 통일, 버튼과 제목 카피 재정리, 레거시 원격 기본값 자동 보정

9. [30_추가개선/04_관리자_운영_UX_단순화.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/04_관리자_운영_UX_단순화.md)
- 상태: 완료
- 핵심 결과: 문구 편집기에서 문구 범위와 노출 위치를 더 쉽게 판별하게 개선

10. [30_추가개선/05_지표_표현과_신뢰_문구_정정.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/05_지표_표현과_신뢰_문구_정정.md)
- 상태: 완료
- 핵심 결과: 세션 지표 명칭 정정, 신뢰형 후원 문구 적용

11. [30_추가개선/06_보안_2차_강화.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/06_보안_2차_강화.md)
- 상태: 완료
- 핵심 결과: 세션성 민감값 저장 범위 축소, 개인 자료 경계 규칙 추가, 보안 체크 문서 보강

## 남은 후속 큐
1. 사용자 승인 후 스테이징 또는 운영 배포
- 이유: 운영 반영 금지 규칙 때문에 현재는 로컬 코드와 문서만 정리함

2. RTDB rules 실제 배포
- 대상: `userStudyLibrary/$uid/items/$itemId`, `staging_hidden_v1/userStudyLibrary/$uid/items/$itemId`

3. `study-archive.html` 운영 검증
- 확인 항목: Email/Password Auth, 허용 도메인, 실제 계정 저장과 조회

4. 운영 `siteTextConfig` 공식 기본값 동기화 여부 결정
- 현재는 코드에서 레거시 기본값만 자동 보정하고 운영 DB 값은 직접 덮어쓰지 않음

## 각 작업 종료 시 남긴 산출물
- 변경 코드와 변경 문서
- 로컬 검증 결과
- [2026-04-09_todo_full_sweep_and_backup.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/worklog/2026-04-09_todo_full_sweep_and_backup.md)
- [35_LEARNING_NOTES.md](/C:/dev/01_career/_assets/tools/skct_tool/35_LEARNING_NOTES.md)
- [70_USER_TODO.md](/C:/dev/01_career/_assets/tools/skct_tool/70_USER_TODO.md)
