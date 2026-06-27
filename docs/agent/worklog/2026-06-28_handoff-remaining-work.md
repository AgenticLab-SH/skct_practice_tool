# 작업 로그 — 핸드오프 잔여작업 이어서 수행

작성일시: 2026-06-28 KST
요청: "핸드오프 문서를 읽고 나머지 작업을 다 이어서 해봐. 실수없도록 해."

## 무엇을 했나 (왜 / 어디서 꼬일 수 있었나)

### 1) 투네이션 실시간 연결 (자동발급의 핵심)
- **꼬일 뻔한 지점:** 핸드오프는 "socket.io 로 재작성"이라고 적혀 있었음. 그러나 검증된 레퍼런스
  (`outstanding1301/donation-alert-api` 의 `Toonation.java`)를 직접 읽어보니 **socket.io 가 아니라 raw WebSocket**.
  실제 방식: `https://toon.at/widget/alertbox/<KEY>` HTML → 인라인 script 의 `"payload":"..."` 추출 →
  `wss://toon.at:8071/<payload>` raw WS → 메시지 `content{account,name,amount,message}`.
  → 가정을 따르지 않고 근거(소스)대로 raw WebSocket 으로 구현. 덤으로 프로젝트의 "무의존성" 설계와도 일치(socket.io-client 불필요).
- 산출물: `toonation-bridge.js`(실구현, 지수백오프 재연결, Node22+ 전역WebSocket 우선 ws 폴백),
  `test/bridge.test.js`(8 checks, 네트워크 불필요), `start_toonation_bridge.cmd`.
  기존 `toonation-bridge.example.js` 는 대체되어 제거.
- **보류:** 라이브 종단 테스트는 사용자의 실제 알림창 KEY + 소액 후원이 있어야 가능.

### 2) 백로그 개선
- **신청완료 UX(자동발급 전제):** 신청 성공 화면이 "이메일/조회 비번"만 안내하고 **신청번호(REQ-)를
  후원 메시지에 넣으라는 안내가 전혀 없었음** → 자동매칭 불가의 원인. 신청번호를 강조 박스+복사 버튼으로 노출하고
  후원 메모 안내 문구(설정 가능: `messages.manualDonationMemoGuide`) 추가. (`main.js`)
- **운영자 알림:** `notify.js`(telegram/범용 webhook, best-effort, 비밀번호 미포함) → `run.js` 가 결과를 통지.
- **만료 정리:** `expire-licenses.js`(기본 dry-run, `--apply`). 로그인은 이미 서명 payload 의 expiresAt 로 만료를 강제하므로
  이 배치는 DB 위생/관리자 가시성 용도.
- 테스트 추가: `test/notify.test.js`(6), `test/expire.test.js`(6). 전체 `npm test` = 35 checks 통과.

### 3) 서버 부하/오류 정리
- **배포 아티팩트 축소:** `.github/workflows/deploy-pages.yml` 가 `path: .` 로 repo 전체(functions/node_modules,
  artifacts 미러, scripts, docs 등)를 Pages 에 올리고 있었음 → `_site` 스테이징 단계에서 dev/내부/대용량 제외 후 업로드.
- **RTDB 읽기 누수(근본원인) 수정:** `index.html` 의 `stopPresencePolling()` 이 **정의만 되고 호출되지 않아**,
  통계 모달을 한 번 열면 `active_visitors` 전체 노드 라이브 구독이 페이지 세션 내내 유지되어
  모든 방문자의 60초 하트비트마다 전체 노드를 재다운로드했음 → 모달이 닫히면 구독 해제(MutationObserver)하도록 수정.
- Functions in-memory 레이트리밋은 분산 부정확 이슈가 있으나 저트래픽에선 수용 가능 → 재아키텍처 대신 문서화.

### 4) AWS 24/7 구동 준비
- `scripts/donation_auto_issuer/deploy/`: systemd 유닛 2개, pm2 ecosystem, `setup-aws.sh`(키 미포함).
- `docs/AWS_AUTO_ISSUER_DEPLOY.md`: 절차 + **보안 트레이드오프(키를 서버에 둘지)는 사용자 승인 필요**.

### 5) 도메인 + 광고 준비
- `docs/DOMAIN_AND_ADS.md`: 커스텀 도메인 연결(CNAME/DNS/HTTPS), URL 일괄 갱신 대상 표, AdSense 준비/정책 일관성.

## 운영 반영 안전수칙 준수
- `main` push / 운영 Firebase 변경은 하지 않음. 모든 변경은 로컬에 머무르며, 배포는 사용자가 승인·push 할 때만 적용됨.
- `index.html`/`main.js` 변경은 운영 프론트에 영향 → 배포 전 브라우저 회귀 점검 권장(통계 모달 열고/닫기, 신청 성공 화면 복사 버튼).

## 검증
- `node --check`: main.js / run.js / toonation-bridge.js / notify.js / expire-licenses.js / ecosystem.config.js 통과.
- `npm test`(donation_auto_issuer): 35 checks 통과(6+6+3+8+6+6).
- 배포 워크플로 YAML: `yaml.safe_load` 통과.

---

## 추가 작업 (2026-06-28, 사용자 승인 운영 반영)

요청: 최신 main 운영 배포 + 신규 고급신청 텔레그램 알림 + 최신 6900원 14일 신청을 요청일+17일(14+3)로 수동 승인·검증 + 실제 요금제 가격 동기화.

1. **요금제 가격 동기화:** Firebase `config/manualSubscriptionConfig` 실제값 확인 → 7일=3900원, 14일=6900원.
   (기존 코드값 4900/7900은 둘 다 틀렸음) → `issue-pipeline.js DEFAULT_PLANS`, `config.example.json`, 운영 private config planMap 모두 3900/6900으로 수정.
2. **수동 승인 + 검증 (운영 DB 쓰기):** `REQ-MQVYF5UR-29GU`(14일권, rsef4292@gmail.com) 복호화 → 요청시작일 2026-06-27 + 17일 = **만료 2026-07-14** 로 발급.
   `advancedAccountLicenses/e~rsef4292_40_gmail_2e_com` 기록, 신청 fulfilled 처리. 검증: 비번 복호화 OK + ECDSA 서명검증 true + active + 미만료 → 고급 로그인 가능 판정 ✅.
   (같은 신청자 중복건 REQ-MQVY9IU2-E8P2 는 pending 으로 남김 — 동일 loginId 라 이미 커버됨.)
3. **신규 고급신청 텔레그램 알림:** `functions/index.js` 에 `notifyNewSubscriptionRequest`(RTDB `onValueCreated` `/subscriptionRequests/{id}`) 추가.
   민감정보 제외 마스크 필드만 전송. 토큰/chatId 는 Functions secret(`TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`). 텔레그램 전달 채널은 실제 메시지로 검증됨(chatId 5235839333 수신 확인).
   **배포 대기(사용자 단계):** firebase CLI 미설치 + 토큰 시크릿 설정 필요 → `firebase functions:secrets:set TELEGRAM_BOT_TOKEN`, `... TELEGRAM_CHAT_ID`(=5235839333), `firebase deploy --only functions`.
4. **운영 배포:** 커밋 `64700bc` → `origin/main` push → GitHub Actions "Deploy GitHub Pages" **success**. 라이브 검증: `/`,`main.js`,`main.css`,`config/firebase-web-config.js`,`.nojekyll`,`guide/` 모두 200,
   main.js 에 `copyTextToClipboard`/`manualDonationMemoGuide`, index.html 에 `statsPresenceObserver` 반영 확인. (deploy-pages.yml `_site` 필터 정상 동작 — 파일 누락 없음.)

> 본 세션은 사용자 명시 승인 하에 운영 Firebase 쓰기(라이선스 발급)와 main 배포를 수행함. private 설정/키는 깃 미포함(gitignore) 유지.
