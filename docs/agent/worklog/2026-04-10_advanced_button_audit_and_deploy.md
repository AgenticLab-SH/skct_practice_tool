# 고급 버튼 점검 및 배포 준비
작성일시: 2026-04-10 09:32:07 +09:00

## 1. 요청 요약

- `docs/TODO/TODO1.md`에 적힌 로컬 관리자 실행 오류를 해결한다.
- 고급 모드와 버튼 내부 화면을 하나씩 점검해, 원래 있었지만 동작하지 않는 기능을 복구한다.
- 확인이 끝나면 공개 서버 반영까지 진행한다.

## 2. 이번 턴의 실제 문제 확인

### 2.1 로컬 관리자 실행
- `docs/TODO/TODO1.md`에는 `open_local_admin.cmd` 실행 시 `-Command`를 찾지 못한다는 오류가 기록되어 있었다.
- 원인은 `.vscode/tasks.json`이 `.cmd`를 PowerShell shell task로 직접 실행하게 되어 있어, VS Code가 `-Command` 경로로 감싸며 꼬이는 구조였다.

### 2.2 고급 모드 버튼 전수 점검
- Playwright로 로컬 페이지를 띄운 뒤, 테스트용 고급 라이선스를 브라우저 안에서 서명해 주입하고 고급 모드 상태를 강제로 유지한 다음 버튼별 동작을 확인했다.
- 정상 동작으로 확인한 항목:
  - 고급 OMR `?` 도움말
  - 정오표 일괄입력 모달, 분석, 반영
  - 채점 결과 표시
  - 과목별 상세 통계 모달과 `?` 도움말
  - 고급 활용 모달, 신청 안내 이동
  - 고급 안내 모달의 빈값 검증
  - 타이머 `다음 / 과↺ / 전↺`
- 실제 수정이 필요했던 항목:
  - `mockChatBtn`이 placeholder alert만 띄우는 상태
  - `자료 보관함` 버튼이 새 탭을 열면서 현재 페이지도 같이 넘어갈 수 있는 구조
  - 고급 라이선스 활성 직후 타이머 고급 버튼의 제목/비활성 상태가 바로 갱신되지 않는 문제

## 3. 적용한 수정

### 3.1 로컬 관리자 실행 경로
- `.vscode/tasks.json`을 `shell` task에서 `process` task로 바꾸고, `cmd.exe /d /c`로 `open_local_admin.cmd`, `stop_local_admin.cmd`를 직접 호출하게 수정했다.

### 3.2 고급 모드 빠른 버튼
- `index.html`의 우측 상단 말풍선 버튼 라벨을 `고급 활용 빠른 열기`로 명확히 바꿨다.
- `main.js`에서는 placeholder alert를 제거하고, 이 버튼이 실제로 `고급 활용` 모달을 여는 빠른 진입 버튼이 되게 바꿨다.

### 3.3 자료 보관함 진입
- `openStudyArchivePage()`에서 `window.open(..., '_blank', 'noopener')` 반환값을 실패로 오해하던 구조를 제거했다.
- 새 탭이 열리면 현재 페이지는 그대로 유지하고, 정말 새 탭 열기에 실패했을 때만 같은 탭 이동을 하도록 수정했다.

### 3.4 타이머 고급 버튼 초기 상태
- 고급 라이선스가 활성화되면 `updateTimerActionButtons()`를 다음 tick에서 다시 호출해, `다음 / 과↺ / 전↺` 버튼의 제목과 disabled 상태가 첫 진입 직후에도 즉시 맞게 보이도록 수정했다.

## 4. 검증

### 4.1 로컬 관리자 실행
- `cmd.exe /d /c "scripts\\open_local_admin.cmd"` 실행 결과:
  - 관리자 페이지 URL 출력 정상
  - 정적 서버 PID 출력 정상
  - 키 브리지 PID 출력 정상
- `cmd.exe /d /c "scripts\\stop_local_admin.cmd"` 실행 결과:
  - 정적 서버 중지 정상
  - 키 브리지 중지 정상

### 4.2 코드 검증
- `node --check main.js` 통과

### 4.3 Playwright 고급 버튼 검증
- 말풍선 버튼 클릭 시 더 이상 alert가 뜨지 않고 `고급 활용` 모달이 열린다.
- 고급 진입 직후 타이머 버튼 title은 바로 `타이머 실행 중에만 사용할 수 있습니다.`, `현재 과목 타이머를 처음부터 다시 시작`, `전체 타이머를 처음 상태로 다시 세팅`으로 맞게 보인다.
- `더보기 > 자료 보관함` 클릭 시:
  - 현재 페이지 URL 유지
  - 새 탭으로 `study-archive.html` 열림
- `문항별 상세 통계 TXT 다운로드` 버튼은 클릭 후 상태 문구 `문항별 상세 통계 TXT 다운로드를 시작했습니다.`를 표시한다.

## 5. 배포 메모

- 공개 반영 전 캐시 꼬임을 막기 위해 `build-info.js`, `main.js` fallback, `index.html`, `admin.html`, `staging/site/index.html`의 asset version을 `202604100932`로 올렸다.
- 공개 반영 커밋과 라이브 검증 결과는 배포 직후 `50_AGENT_LAST_WORK_REPORT.md`에 추가 기록한다.
