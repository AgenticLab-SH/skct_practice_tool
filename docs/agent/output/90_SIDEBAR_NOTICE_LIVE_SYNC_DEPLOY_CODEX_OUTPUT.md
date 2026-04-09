# 사이드바 공지 저장 즉시 반영 운영 반영 결과
작성일시: 2026-04-09 16:58:00 KST

사이드바 공지를 관리자 페이지에서 저장해도 이미 열려 있던 메인 페이지에 바로 반영되지 않던 문제를 수정했고, 운영 반영까지 완료했습니다.

## 핵심 결과
- 원인: 메인 페이지가 공개 설정을 최초 1회만 읽고 끝내서, `config/notice_sidebar` 저장 후 열린 페이지가 자동 갱신되지 않았습니다.
- 수정: 메인 페이지가 `config/notice_sidebar`, `config/notice_help`, `config/notice`를 실시간 구독하도록 변경했습니다.
- 보강: 공지 관련 키 하나가 읽기 실패해도 다른 공개 설정 로딩까지 같이 멈추지 않도록 키별 오류 처리로 바꿨습니다.
- 보강: Help 모달 상단 공지는 `show=false`일 때 이전 DOM이 남지 않게 정리했습니다.

## 운영 반영
- 기능 반영 커밋: `e748b82` (`fix: live-sync sidebar notices after admin save`)
- 문서 반영 커밋: `66d2fc5` (`docs: record sidebar notice live-sync deploy`)
- 운영 자산 버전: `build-info.js?v=202604091640`, `main.js?v=202604091640`

## 검증
- 로컬 페이지에서 공지 버튼 클릭 시 공지 모달 정상 표시 확인
- 로컬 페이지 콘솔 에러 0건 확인
- `renderNotice({ show: false })` 호출 시 `#devNotice`가 비워지는 것 확인
- 운영 `build-info.js`가 `v2026.04.09.1640` 반환 확인
- 운영 HTML에 `main.js?v=202604091640`, `subscribeLiveNoticeConfig`, `notice_sidebar` 포함 확인
- 운영 페이지에서 사이드바 공지 버튼 클릭 시 공지 본문과 업데이트 날짜 표시 확인

## 함께 갱신한 문서
- `docs/agent/worklog/2026-04-09_sidebar_notice_live_sync_fix_and_deploy.md`
- `docs/SKCT_TOOL_기능_카탈로그.md`
- `35_LEARNING_NOTES.md`
- `50_AGENT_LAST_WORK_REPORT.md`
