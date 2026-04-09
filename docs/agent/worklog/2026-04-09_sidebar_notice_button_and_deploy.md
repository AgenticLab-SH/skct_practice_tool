# 사이드바 공지사항 버튼 추가 및 운영 반영
작성일시: 2026-04-09 14:59:12 KST

이번 작업은 메인 좌측 사이드바에 공지사항 버튼을 새로 추가하고, 운영자가 관리자 페이지에서 내용을 바꿀 수 있게 연결한 뒤, 현재 공지 문구를 운영에 반영하는 것이 목적이었다.

## 적용 내용
- `index.html`
- 좌측 사이드바에 `공지` 버튼을 추가했다.
- 버튼 아이콘은 빨간색 느낌표 배지로 넣었다.
- 별도 `noticeModal`을 추가해 공지를 Help 모달과 분리했다.
- `main.js`
- `renderSidebarNotice()`를 추가해 `config/notice_sidebar` 값을 읽어 전용 모달에 렌더링하도록 했다.
- `noticeToggle` 클릭 시 공지 모달이 열리도록 연결했다.
- `index.html`의 공개 설정 로딩 목록에 `notice_sidebar`를 추가했다.
- `main.css`
- 공지 버튼 전용 스타일과 빨간 느낌표 배지를 추가했다.
- `admin.html`
- 공지 관리 대상에 `사이드바 공지`를 추가했다.
- 저장 토스트도 `사이드바 / Help / 커뮤니티`를 구분해 보이도록 바꿨다.
- `site-text-config.js`
- 버튼 라벨과 공지 모달 제목 관련 키를 추가해 관리자 문구 편집기에서도 수정 가능하게 했다.
- `build-info.js`, `index.html`, `admin.html`, `study-archive.html`
- 자산 버전을 `202604091454`로 올려 캐시 혼선을 줄였다.

## 운영 데이터 반영
- 백업 폴더: `_backup/20260409_145900_sidebar_notice_deploy/`
- 백업 파일
- `notice_sidebar.before.json`
- `siteTextConfig.before.json`
- 운영 RTDB에 아래를 반영했다.
- `config/notice_sidebar`
- `config/siteTextConfig`

## 운영 공지 문구
- `메모장 일부분이 안 그려지는 문제를 개선하였습니다. 컨트롤 + f5 를 눌러서 페이지 강력 새로고침 후에 사용해주세요. 그래도 문제가 발생할 시에 게시판에 남겨주세요!`

## 검증
- `node --check main.js` 통과
- 로컬 Playwright로 버튼 노출, 모달 열림, 공지 본문 표시를 확인했다.
- 운영 Firebase `config/notice_sidebar`와 `config/siteTextConfig` 저장 성공을 확인했다.

## 배포 후 확인 포인트
- 좌측 사이드바에 빨간 느낌표 공지 버튼이 보이는지
- 버튼 클릭 시 공지 모달이 열리는지
- 관리자 페이지 `공지 관리`에서 `사이드바 공지` 선택이 보이는지
