# 2026-04-09 TODO 전체 일괄 처리와 안전 백업
작성일시: 2026-04-09 02:42:28 KST

## 사용자 요청
- 기존 서버를 계속 안전하게 유지한 상태에서 개발 진행
- 작업 시작 전에 현재 단계 전체를 복구 가능한 상태로 백업
- `docs/TODO` 폴더 전체 항목 처리
- 중간에 보인 개선점은 TODO 문서에 반영
- 사용자 개입이 필요한 항목은 일단 건너뛰고 기록
- 최종 보고는 한 번에 정리

## 백업
- 작업 브랜치: `work/todo-sweep-20260409_0215`
- 백업 커밋: `4b40945`
- 백업 태그: `backup-20260409-0215-todo-sweep-start`
- 파일 백업 경로: `_backup/20260409_0215_todo_sweep_start/`
- 백업 메모 파일: `_backup/20260409_0215_todo_sweep_start/snapshot-info.txt`

## 수행 내용
- 메인 화면 사이드바를 핵심 진입 위주로 줄이고 `더보기` 유틸리티 모달을 추가했다.
- 일반 도움말, 고급 안내, 고급 기능 모달 문구를 단계형 행동 중심으로 다시 정리했다.
- 사이트 텍스트 카탈로그를 확장하고, 관리자 문구 편집기에 scope 필터와 선택 힌트를 추가했다.
- 운영 Firebase의 예전 기본 문구가 새 코드 기본값을 덮지 않도록 레거시 기본값 자동 보정 로직을 넣었다.
- 그림판에 전용 커서 인디케이터를 넣어 밝은 배경에서도 커서가 보이게 했다.
- `study-archive.html`, `study-archive.css`, `study-archive.js`를 추가해 개인 학습자료 보관함을 별도 경로로 구현했다.
- RTDB `userStudyLibrary/<uid>/items/<itemId>` 경로와 사용자별 rules를 추가했다.
- 세션성 민감값 일부를 `localStorage`에서 `sessionStorage`로 이동했다.
- `docs/TODO` 전체 문서를 현재 처리 결과와 운영 후속 기준으로 다시 정리했다.
- `docs/README.md`, `35_LEARNING_NOTES.md`, `50_AGENT_LAST_WORK_REPORT.md`를 함께 갱신했다.
- `docs/agent/37_SECURITY_RENDERING_CHECKLIST.md`, `70_USER_TODO.md`, `90_TODO_FULL_SWEEP_CODEX_OUTPUT.md`를 새로 만들었다.

## 로컬 검증
- `node --check main.js`
- `node --check study-archive.js`
- `node -e "JSON.parse(require('fs').readFileSync('database.rules.json','utf8')); console.log('OK')"`
- 로컬 정적 서버 구동 후 메인 페이지, 유틸리티 모달, 고급 안내, 고급 기능, 활성 세션 현황 모달, 보관함 진입 확인
- 관리자 페이지 로딩과 새 scope 필터 DOM 존재 확인
- 메인 페이지와 관리자 페이지 모두 콘솔 `error` 0건 확인
- 캔버스 커서 인디케이터가 마우스 이동 시 표시되는지 확인

## 사용자 개입 또는 승인 필요
- 운영 반영이나 `main` push는 사용자 승인 후 진행해야 한다.
- `database.rules.json` 변경분은 실제 RTDB rules 배포가 필요하다.
- `study-archive.html` 운영 사용 전에는 Email/Password Auth, 허용 도메인, 실계정 저장과 조회를 확인해야 한다.
- 새 기본 문구를 운영 Firebase `config/siteTextConfig`의 공식 기본값으로 저장할지는 별도 승인 후 진행해야 한다.

## 메모
- 이번 라운드에서는 운영 서버, 운영 RTDB 기본값, 운영 브랜치를 직접 바꾸지 않았다.
- 비밀번호 입력창이 `<form>` 밖에 있다는 브라우저 verbose 경고는 남아 있지만, 현재 확인한 범위에서 기능 오류는 아니고 콘솔 `error`는 없었다.
