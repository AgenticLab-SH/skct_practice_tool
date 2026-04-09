# 사이드바 공지사항 버튼 운영 반영 보고
작성일시: 2026-04-09 14:59:12 KST

이 문서는 사이드바 공지 버튼 추가, 관리자 편집 연결, 운영 반영 결과를 요약합니다.

## 변경 요약
- 좌측 사이드바에 빨간 느낌표 `공지` 버튼을 추가했습니다.
- 공지 내용은 Help 공지와 분리된 `config/notice_sidebar`를 읽도록 했습니다.
- 관리자 페이지 `공지 관리`에 `사이드바 공지` 항목을 추가했습니다.
- 버튼 라벨과 공지 모달 제목은 `siteTextConfig` 기반으로 관리되게 맞췄습니다.
- 운영 공지 문구는 요청하신 메모장 개선 안내로 반영했습니다.

## 운영 반영 대상
- 정적 파일: `index.html`, `main.js`, `main.css`, `admin.html`, `site-text-config.js`, `build-info.js`, `study-archive.html`
- 운영 RTDB: `config/notice_sidebar`, `config/siteTextConfig`
- 백업: `_backup/20260409_145900_sidebar_notice_deploy/`
