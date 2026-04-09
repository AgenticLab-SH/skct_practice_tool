# TODO 작업 인덱스
작성일시: 2026-04-09 02:42:28 KST

이 폴더는 2026-04-09 TODO 전체 일괄 처리 결과와, 다음에 새 TODO를 추가할 때 다시 이어갈 기준을 함께 보관하는 실행 기록입니다.

## 현재 상태
- 이번 라운드에서 `10_부분해결`, `20_미해결`, `30_추가개선` 문서를 모두 로컬 코드와 문서 기준으로 처리했습니다.
- 운영 서버와 운영 Firebase 기본값은 건드리지 않았습니다.
- 폴더 이름은 이력 추적을 위해 유지했고, 실제 남은 항목은 `사용자 승인 또는 운영 반영이 필요한 후속`뿐입니다.

## 문서별 처리 결과
1. [관리자 문구 편집기 확장](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/10_부분해결/01_관리자_문구_편집기_확장.md)
- 완료: 사이트 텍스트 카탈로그 범위를 확장하고, 관리자 화면에 `공통/고급/운영` scope 필터와 선택 힌트를 추가했습니다.

2. [일반 고급 활용 가이드 정리](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/10_부분해결/02_일반_고급_활용_가이드_정리.md)
- 완료: 일반 모드와 고급 모드 안내 모달을 사용자 행동 중심으로 다시 정리했습니다.

3. [그림판 커서 가시성 문제](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/20_미해결/01_그림판_커서_가시성_문제.md)
- 완료: 캔버스 전용 커스텀 커서 오버레이를 추가해 밝은 배경에서도 가시성을 유지하게 했습니다.

4. [개인 학습자료 저장 뷰어 기능](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/20_미해결/02_개인_학습자료_저장_뷰어_기능.md)
- 완료: `study-archive.html` 전용 경로, 사용자별 RTDB 저장소, 기본 필터와 자동 태깅 흐름을 구현했습니다.

5. [추가개선 인덱스](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/00_추가개선_INDEX.md)
- 완료: 추가개선 6건의 반영 결과와 남은 운영 후속을 인덱스에 재정리했습니다.

6. [메인 화면 정보구조 단순화](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/01_메인_화면_정보구조_단순화.md)
- 완료: 좌측 사이드바를 핵심 진입 위주로 줄이고, 부가 기능은 `더보기` 유틸리티 모달로 분리했습니다.

7. [사용자 진입흐름 재설계](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/02_사용자_진입흐름_재설계.md)
- 완료: 신청, 조회, 고급 열기, 활용 흐름을 단계형 설명으로 다시 묶었습니다.

8. [문구 체계와 카피라이팅 개선](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/03_문구_체계와_카피라이팅_개선.md)
- 완료: 주요 버튼과 안내 문구를 신뢰형 표현으로 통일하고, 레거시 기본값 자동 보정 로직을 추가했습니다.

9. [관리자 운영 UX 단순화](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/04_관리자_운영_UX_단순화.md)
- 완료: 사이트 텍스트 편집기에서 문구 범위와 노출 위치를 더 쉽게 구분하도록 관리자 힌트를 보강했습니다.

10. [지표 표현과 신뢰 문구 정정](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/05_지표_표현과_신뢰_문구_정정.md)
- 완료: `접속자 수` 표현을 `활성 세션 현황` 중심으로 고치고, 후원 문구 톤도 과장형에서 신뢰형으로 조정했습니다.

11. [보안 2차 강화](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/30_추가개선/06_보안_2차_강화.md)
- 완료: 세션성 민감값을 `sessionStorage`로 축소하고, 개인 자료 저장소 규칙과 보안 체크 문서를 추가했습니다.

## 남은 운영 후속
- 코드와 정적 파일 배포는 사용자 승인 후에만 진행합니다.
- `database.rules.json`의 `userStudyLibrary` 규칙은 실제 RTDB rules 배포가 필요합니다.
- `study-archive.html`을 운영에서 쓰려면 Email/Password Auth 활성화, 허용 도메인, 실계정 검증을 별도로 확인해야 합니다.
- 새 기본 문구를 운영 Firebase `config/siteTextConfig`의 공식 기본값으로 덮어쓸지는 별도 승인 후 진행해야 합니다.

## 다시 사용할 핵심 문서
- [01_AGENT_RUNBOOK.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/01_AGENT_RUNBOOK.md)
- [02_AGENT_WORK_QUEUE.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/02_AGENT_WORK_QUEUE.md)
- [03_AGENT_PROMPT.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/TODO/03_AGENT_PROMPT.md)

## 함께 확인할 기록
- [2026-04-09_todo_full_sweep_and_backup.md](/C:/dev/01_career/_assets/tools/skct_tool/docs/agent/worklog/2026-04-09_todo_full_sweep_and_backup.md)
- [35_LEARNING_NOTES.md](/C:/dev/01_career/_assets/tools/skct_tool/35_LEARNING_NOTES.md)
- [70_USER_TODO.md](/C:/dev/01_career/_assets/tools/skct_tool/70_USER_TODO.md)
