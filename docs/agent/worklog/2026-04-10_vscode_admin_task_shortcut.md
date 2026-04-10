# VS Code 관리자 실행 Task 추가
작성일시: 2026-04-10 02:43:10 +09:00

## 요청 요약

- 관리자 페이지를 더 간단하게 여는 방법 요청
- VS Code에서 바로 실행할 수 있는 방법 질문
- 공개 서버 반영 범위도 함께 재확인

## 수행 내용

- [.vscode/tasks.json](/C:/dev/01_career/_assets/tools/skct_tool/.vscode/tasks.json) 추가
  - `SKCT: 로컬 관리자 페이지 열기`
  - `SKCT: 로컬 관리자 페이지 종료`
- 기존 [open_local_admin.cmd](/C:/dev/01_career/_assets/tools/skct_tool/scripts/open_local_admin.cmd), [stop_local_admin.cmd](/C:/dev/01_career/_assets/tools/skct_tool/scripts/stop_local_admin.cmd)와 연결
- 기능 카탈로그와 기준 문서에 VS Code Task 진입점을 함께 기록

## 사용 방법

1. VS Code에서 이 프로젝트 폴더를 엽니다.
2. `Ctrl+Shift+P`
3. `Tasks: Run Task`
4. `SKCT: 로컬 관리자 페이지 열기` 선택

종료할 때는 같은 방식으로 `SKCT: 로컬 관리자 페이지 종료`를 선택하면 됩니다.

## 서버 반영 범위 정리

- 공개 사이트 사용자 화면 개선사항은 이미 GitHub Pages에 반영된 상태입니다.
- 현재 라이브 빌드 기준은 `v2026.04.10.0219`입니다.
- 이번 VS Code Task 추가는 로컬 운영 편의 기능이라 공개 서버 배포 대상이 아닙니다.
