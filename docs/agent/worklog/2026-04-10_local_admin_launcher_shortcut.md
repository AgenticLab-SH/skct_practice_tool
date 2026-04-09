# 로컬 관리자 페이지 원클릭 실행 스크립트 추가
작성일시: 2026-04-10 02:39:56 +09:00

## 요청 요약

- 관리자 페이지 링크를 다시 묻는 상황이 반복됨
- `python -m http.server` 실행 후 로컬 URL을 직접 여는 절차가 번거롭다는 피드백
- 더 간단한 실행 방법 요청

## 수행 내용

- [open_local_admin.ps1](/C:/dev/01_career/_assets/tools/skct_tool/scripts/open_local_admin.ps1) 추가
  - 로컬 정적 서버 자동 실행
  - `admin.html` 브라우저 자동 열기
  - `local_admin_key_bridge.py` 백그라운드 실행
  - 상태 파일 `tmp/local_admin_launcher_state.json` 저장
  - 재실행 시 기존 서버/브리지 재사용
- [stop_local_admin.ps1](/C:/dev/01_career/_assets/tools/skct_tool/scripts/stop_local_admin.ps1) 추가
  - launcher가 띄운 정적 서버와 키 브리지 중지
- [open_local_admin.cmd](/C:/dev/01_career/_assets/tools/skct_tool/scripts/open_local_admin.cmd), [stop_local_admin.cmd](/C:/dev/01_career/_assets/tools/skct_tool/scripts/stop_local_admin.cmd) 추가
  - Windows Explorer 더블클릭용 래퍼
  - `pwsh` 우선, 없으면 `powershell` fallback

## 검증

- `pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/open_local_admin.ps1`
  - `http://127.0.0.1:8135/admin.html` 출력 확인
  - 기존 실행 중 프로세스 재사용 출력 확인
- `curl.exe -I http://127.0.0.1:8135/admin.html`
  - `200 OK` 확인
- `pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/stop_local_admin.ps1`
  - 정적 서버 중지 완료
  - 키 브리지 중지 완료

## 사용 메모

- 가장 간단한 실행 방법은 [open_local_admin.cmd](/C:/dev/01_career/_assets/tools/skct_tool/scripts/open_local_admin.cmd) 더블클릭입니다.
- 서버를 내릴 때는 [stop_local_admin.cmd](/C:/dev/01_career/_assets/tools/skct_tool/scripts/stop_local_admin.cmd) 더블클릭 또는 PowerShell에서 `scripts/stop_local_admin.ps1` 실행입니다.
