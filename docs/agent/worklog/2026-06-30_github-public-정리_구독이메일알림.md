# 2026-06-30 작업 로그: GitHub public 저장소 정리 + 구독 이메일 알림 추가

## 사용자 요청
1. 내 GitHub에 skct-tool 저장소가 2개 다 public인데 정상인가? 정상 상태로 만들어.
2. 구독 신청 시 텔레그램 외에도 이메일이 오도록 해줘. zhdlsqpdj@gmail.com 으로.

## 1) GitHub 저장소 진단
AgenticLab-SH 계정의 skct 관련 public 저장소는 정확히 2개.

- skct_practice_tool (public): 실제 도구. 커스텀 도메인 skct.agenticfabworks.com 으로
  GitHub Pages 서비스. 무료 플랜에서 Pages를 띄우려면 public이 필수라 정상이며 그대로 둠.
- skct_tool (public): 옛 GitHub Pages 주소(agenticlab-sh.github.io/skct_tool/)용 리다이렉트 스텁.
  동작은 했으나 리다이렉트 타겟이 구 주소로 박혀 있었음.

즉 "2개 다 public" 자체가 비정상은 아니다. 실제 문제는 skct_tool의 리다이렉트가
현재 운영 도메인이 아닌 옛 GitHub Pages 주소를 가리키고 있었던 점.

### 조치 (완료, 운영 영향 낮음)
skct_tool의 index.html, 404.html, README.md 3개 파일의 리다이렉트/canonical 타겟을
https://skct.agenticfabworks.com/ 로 갱신해서 푸시함.
- 커밋: 6ba0a84 (skct_tool/main)
- 리다이렉트는 search/hash/path를 보존하므로 옛 북마크가 운영 도메인으로 정확히 연결됨.

### 남은 판단 (사용자 결정 필요)
skct_tool 저장소를 계속 둘지(옛 링크 보호용), 아니면 삭제할지는 사용자 결정 사항.
삭제는 비가역이라 임의 수행하지 않음. private 전환 시 Pages가 죽어 리다이렉트가 무의미해지므로
살릴 거면 public 유지, 필요 없으면 삭제가 선택지.

## 2) 구독 신청 이메일 알림 추가
기존에는 구독 신청(subscriptionRequests/<id> 생성) 시 운영자 텔레그램으로만 알림이 갔음.
여기에 운영자 메일함(zhdlsqpdj@gmail.com)으로도 병행 발송하도록 추가.

### 변경 파일 (functions/)
- index.js
  - nodemailer require 추가.
  - 이메일 시크릿 정의: EMAIL_USER(보내는 Gmail), EMAIL_APP_PASSWORD(Gmail 앱 비밀번호).
  - 수신 주소 상수 NOTIFY_EMAIL_TO = "zhdlsqpdj@gmail.com" 고정.
  - sendSubscriptionEmail() 헬퍼 추가. Gmail SMTP + 앱 비밀번호. 시크릿 미설정 시 조용히 건너뜀.
  - notifyNewSubscriptionRequest를 텔레그램/이메일 독립 try 블록으로 재구성.
    한쪽이 실패해도 다른 쪽은 발송. 시크릿 배열에 EMAIL_USER, EMAIL_APP_PASSWORD 추가.
- package.json / package-lock.json: nodemailer ^9.0.1 추가
  (6.x는 다수 high/critical 권고 → 패치된 9.0.1로 설치).

### 보안/프라이버시
- 메일 본문에는 텔레그램과 동일하게 마스크 필드만 담음(실명/이메일 전체/ID/비밀번호 미포함).
- 자격증명은 코드에 두지 않고 Functions 시크릿으로 처리.

### 로컬 검증
- node --check index.js → SYNTAX_OK
- nodemailer transport/sendMail 함수 존재 확인 (실제 발송은 안 함).

## 배포 대기 (사용자 단계, 운영 반영)
AGENTS.md에 따라 운영 반영(Functions 배포)은 승인 전까지 보류. 배포 시 필요:

    firebase functions:secrets:set EMAIL_USER           # 보내는 Gmail 주소
    firebase functions:secrets:set EMAIL_APP_PASSWORD   # Gmail 앱 비밀번호(16자, 공백 제거)
    firebase deploy --only functions

- Gmail 앱 비밀번호는 보내는 계정의 Google 계정 보안 > 2단계 인증 > 앱 비밀번호에서 발급.
- 보내는 계정과 받는 계정이 같은 zhdlsqpdj@gmail.com 이어도 무방(자기 자신에게 발송).
- 시크릿 미설정 상태로 배포해도 텔레그램은 그대로 동작하고 메일만 조용히 건너뜀.

## 미적용/주의
- 운영 Functions 배포는 사용자 승인 후 진행.
- untracked 파일(scripts/oci/, 일부 worklog)은 이번 작업과 무관해 손대지 않음.
