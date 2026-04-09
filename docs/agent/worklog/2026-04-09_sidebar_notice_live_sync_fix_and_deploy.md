# 사이드바 공지 저장 즉시 반영 복구 및 운영 반영
작성일시: 2026-04-09 16:52:00 KST

## 요청 요약
- 관리자 페이지에서 `공지 관리 > 사이드바 공지`를 수정하고 저장했는데 운영 화면에 바로 반영되지 않는 문제를 확인하고, 수정 후 운영에 반영하는 작업.

## 원인
- 운영 Firebase `config/notice_sidebar` 저장 자체는 정상 동작했다.
- 문제는 메인 페이지가 공개 설정을 최초 1회만 읽고 끝내는 구조라서, 이미 열려 있던 페이지는 저장 직후에도 새 공지를 다시 받지 못하는 점이었다.
- 추가로 공개 키 1개 읽기 실패 시 `fetchConfig()` 전체가 중단될 수 있는 구조라, 운영 확인 때 체감상 “전체가 안 바뀌는 것처럼” 보일 위험이 있었다.

## 수정 내용
- `index.html`
  - 공지 관련 키 `notice`, `notice_help`, `notice_sidebar`를 별도 `onValue` 실시간 구독으로 분리했다.
  - 공지 구독 상태를 합쳐 Help 모달 공지와 사이드바 공지에 각각 다시 렌더링하도록 정리했다.
  - 초기 `fetchConfig()`는 유지하되, 키별 읽기 오류를 개별 처리하게 바꿨다.
- `main.js`
  - Help 모달 상단 공지를 숨길 때 기존 DOM이 남지 않도록 `renderNotice()`에서 `show=false`면 내용을 비우게 수정했다.
- `build-info.js`, `index.html`, `admin.html`
  - 운영 캐시를 우회하도록 자산 버전을 `202604091640`으로 올렸다.

## 검증
- 로컬 `http://127.0.0.1:8129/index.html?case=sidebar-live-refresh-check`
  - 공지 버튼 노출 및 공지 모달 표시 확인
  - 콘솔 에러 0건 확인
  - `renderNotice({ show: false })` 호출 후 `#devNotice`가 비워지는 것 확인
- 운영 `https://agenticlab-sh.github.io/skct_tool/`
  - `build-info.js`가 `v2026.04.09.1640` 반환 확인
  - HTML에 `main.js?v=202604091640`, `subscribeLiveNoticeConfig`, `notice_sidebar` 포함 확인
  - 운영 배포 커밋 `e748b82` 푸시 완료 확인

## 문서 동기화
- `docs/SKCT_TOOL_기능_카탈로그.md` 갱신
- `35_LEARNING_NOTES.md` 갱신
- `50_AGENT_LAST_WORK_REPORT.md` 갱신
