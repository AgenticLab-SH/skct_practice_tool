# 2026-04-08 운영 반영 상태 기록
작성일시: 2026-04-08 18:50:00 KST

## 요약
- GitHub Pages 정적 코드 반영: 완료
- Firebase RTDB rules 배포: 완료
- 운영 Firebase 설정 동기화: 완료

## 실제 반영 내용
### 1. GitHub Pages
- 커밋 `ab86209`를 `main`에 push 완료
- 원격 저장소: `https://github.com/AgenticLab-SH/skct_tool.git`
- GitHub Pages API 확인 결과:
  - source: `main` / `/`
  - status: `built`
  - latest built commit: `ab862099ba5a62db7925f999e382d83c4807bc3e`

### 2. Firebase
- `npx firebase-tools login` 후 `kshcgd28@gmail.com` 계정으로 인증 완료
- `npx firebase-tools deploy --only database --project skct-tool` 실행으로 RTDB rules 배포 완료
- `config/manualSubscriptionConfig`에 `licensePublicKeyPem` 추가 완료
- `config/siteTextConfig/advancedGuide`, `config/siteTextConfig/messages`를 최신 코드 기준으로 동기화 완료
- 레거시 민감 경로 `config/adminHash`, `config/advancedFeatureConfig` 실제 DB 삭제 완료
- 라이선스 서명 키는 아래 개인 보관 경로에 저장 완료
  - `C:\Users\kshcg\.codex\private\skct_tool\manual_subscription_license_private_20260408_1836.pem`
  - `C:\Users\kshcg\.codex\private\skct_tool\manual_subscription_license_public_20260408_1836.pem`

## 확인 명령 결과 요약
- `git push origin main` 성공
- `gh api repos/AgenticLab-SH/skct_tool/pages/builds`에서 최신 build commit이 `ab86209`로 확인됨
- `npx firebase-tools login:list` 결과: `Logged in as kshcgd28@gmail.com`
- `curl https://skct-tool-default-rtdb.firebaseio.com/config.json` 상태코드: `401`
- `curl https://skct-tool-default-rtdb.firebaseio.com/config/adminHash.json` 상태코드: `401`
- `curl https://skct-tool-default-rtdb.firebaseio.com/config/advancedFeatureConfig.json` 상태코드: `401`
- `curl https://skct-tool-default-rtdb.firebaseio.com/config/appName.json` 상태코드: `200`

## 남은 메모
1. 향후 수동 신청 승인을 할 때는 위 라이선스 개인키 파일을 관리자 화면에 직접 넣어 서명해야 합니다.
2. 현재 워크트리에는 사용자가 만든 `docs/TODO/TODO2.md`만 untracked 상태로 남아 있습니다.
