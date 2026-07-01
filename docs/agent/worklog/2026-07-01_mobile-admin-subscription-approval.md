# 2026-07-01 모바일 관리자 승인 및 안내 UI 운영 반영

## 요청
- 타이머 우측 불필요한 빈 공간 제거, 팝업 기준에서 시간 표시 확대.
- 설정 도움말의 풀이 방식 설명을 실제 설정 영역에 직접 표시.
- 후원 모달 문구를 간결한 운영 안내와 문의 이메일 중심으로 교체.
- `나중에 하기`, 후원 모달 제목 제거.
- `더보기` 모달 내부 기능을 좌측 개별 버튼으로 분리.
- PC가 꺼져 있어도 폰 관리자 페이지와 텔레그램/메일 경유로 구독 승인 가능하게 구성.

## 수행
- 좌측 사이드바에 접속 현황, 커뮤니티, 자료 보관함, 별도 자료 버튼을 개별 배치하고 `더보기` 모달을 제거했다.
- 타이머 컨트롤이 실제 표시 버튼 폭만 차지하도록 조정하고, 전체/과목 시간 숫자를 키웠다.
- 설정 모달에서 풀이 방식 설명을 항상 보이도록 바꾸고 도움말 버튼을 제거했다.
- 후원 모달 제목과 `나중에 하기` 버튼을 제거하고, 운영 목적/비용/후기/문의 이메일 문구로 교체했다.
- Firebase Functions `skctSecureApi`에 관리자 승인/반려 라우트를 추가했다.
- 관리자 페이지는 로컬 개인키가 없어도 Firebase 로그인 토큰으로 서버 승인/반려를 호출할 수 있게 했다.
- 신규 신청 이메일에 신청번호가 포함된 관리자 페이지 링크를 추가했다.
- 운영 RTDB `config/supportConfig`, `config/siteTextConfig/settingsModal`, `config/manualSubscriptionConfig/secureApiBaseUrl`을 새 기준으로 갱신했다.

## 검증
- `node --check main.js`
- `node --check site-text-config.js`
- `node --check functions/index.js`
- `node --check scripts/donation_auto_issuer/issue-pipeline.js`
- `npm test` in `scripts/donation_auto_issuer`
- 로컬 브라우저에서 자산 버전, 타이머 폭, 좌측 개별 버튼, 설정 설명, 후원 문구, 콘솔 오류 없음 확인.
- Firebase Functions 운영 배포 완료.
- `skctSecureApi/health` 정상 응답 확인.
- 관리자 승인 라우트가 토큰 없이 401로 거부되는 것 확인.

## 남은 주의
- Functions Node.js 20 런타임은 2026-10-30 지원 종료 예정이므로 Node.js 22 업그레이드를 별도 작업으로 처리해야 한다.
- 테스트용 고급 모드 계정은 관리자 승인 토큰 또는 텔레그램 승인으로 실제 신청을 승인해야 발급할 수 있다.