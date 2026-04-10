# 로컬 관리자 Python 런처 정리
작성일시: 2026-04-10 11:16:32 +09:00

## 요청 요약

- 관리자 페이지 작업이 끝났는지 확인한다.
- `cmd` 방식이 불편하니, Python으로 더 간단하게 여는 방법을 만든다.

## 결과

- 관리자 페이지 저장 권한 복구와 상단 상태 배너 보강까지 포함한 이전 관리자 작업 범위는 완료 상태로 정리했다.
- 로컬 관리자 실행 기본 진입점을 `cmd/ps1` 우회 대신 Python으로 바꿨다.

## 이번 작업

### 1. Python 런처 추가

- [open_local_admin.py](/C:/dev/01_career/_assets/tools/skct_tool/scripts/open_local_admin.py) 추가
- [stop_local_admin.py](/C:/dev/01_career/_assets/tools/skct_tool/scripts/stop_local_admin.py) 추가

동작은 아래를 한 번에 처리한다.

- 로컬 정적 서버 시작 또는 재사용
- 로컬 키 브리지 시작 또는 재사용
- 상태 파일 `tmp/local_admin_launcher_state.json` 저장
- 브라우저에서 관리자 페이지 열기

### 2. 기존 cmd 래퍼 단순화

- [open_local_admin.cmd](/C:/dev/01_career/_assets/tools/skct_tool/scripts/open_local_admin.cmd)
- [stop_local_admin.cmd](/C:/dev/01_career/_assets/tools/skct_tool/scripts/stop_local_admin.cmd)

위 두 파일은 이제 PowerShell 스크립트를 직접 타지 않고, 같은 Python 스크립트를 호출하는 호환용 래퍼로 정리했다.

### 3. VS Code 작업도 Python 기준으로 정리

- [.vscode/tasks.json](/C:/dev/01_career/_assets/tools/skct_tool/.vscode/tasks.json)

`SKCT: 로컬 관리자 페이지 열기/종료` 작업이 이제 `py` process task로 같은 Python 런처를 직접 실행한다.

## 사용 방법

### 가장 간단한 실행

```powershell
cd C:\dev\01_career\_assets\tools\skct_tool
py scripts\open_local_admin.py
```

### 종료

```powershell
cd C:\dev\01_career\_assets\tools\skct_tool
py scripts\stop_local_admin.py
```

### VS Code

- `Ctrl+Shift+P`
- `Tasks: Run Task`
- `SKCT: 로컬 관리자 페이지 열기`

## 검증

- `py scripts/open_local_admin.py --no-browser` 실행 성공
- 출력 URL `http://127.0.0.1:8135/admin.html`
- `Invoke-WebRequest`로 관리자 URL `200 OK` 확인

## 운영 반영 여부

- 이번 작업은 로컬 관리자 접근 편의 개선이다.
- 공개 GitHub Pages나 운영 Firebase에는 새로 배포하지 않았다.
