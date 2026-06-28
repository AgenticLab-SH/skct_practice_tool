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

---

## 추가 작업 (2026-06-28 세션2 — 핸드오프 #2 잔여작업: 통계 CSV/회차 누적)

요청: `docs/HANDOFF_2026-06-28_session2.md` 의 남은 작업을 이어서 수행.

### 무엇이 실제 남아 있었나 (핸드오프 재판독)
- 🟡 경쟁사 도입 항목 중 **#1 통계 CSV/엑셀 내보내기 + 회차 누적**만 실제 코드 작업이 남음.
  - #3 계산기 히스토리, #5 영역명은 **이미 보유** → 작업 불필요(핸드오프 4절·6절 확인).
- 🔴 커스텀 도메인 / 🟢 광고는 도메인 구매·DNS·AdSense 계정 등 **사용자 자원**이 전제 → 코드로 종결 불가(분리 보고).
- ⏸ 보류(타이머 드리프트, 커뮤니티 변조, 자료실 서버검증, OMR 렌더, presence 청소)는 위험·대형이라 사용자 승인 전 미착수.

### 1) 통계 CSV 내보내기 + 회차 누적 (`main.js`, `index.html`)
- **배경:** 기존 상세통계는 TXT 한 장(`downloadDetailedStatsText`)만 있고 회차 개념이 없었음.
- **회차 기록:** `skct_stat_rounds` localStorage 배열에 채점 시 1회 기록(`recordCurrentStatRound`).
  - 같은 미채점 세션 안에서 재채점하면 같은 `currentStatRoundId` 로 덮어쓰기. 답안 마킹 복귀/초기화 시 `currentStatRoundId=null` → 다음 채점은 새 회차.
  - `scoreBtn` 핸들러에서 `recordCurrentStatRound(model)` 호출. `attempted<=0`(아무것도 안 푼 채점)은 기록 안 함.
  - 저장 상한 `STAT_ROUNDS_MAX=200`, 용량 초과 등 setItem 예외는 조용히 무시(통계는 보조 기능).
- **CSV 내보내기(`downloadStatRoundsCsv`):** UTF-8 BOM(`\uFEFF`) + CRLF → 엑셀 한글/줄바꿈 안전.
  - 상단: `#` 주석 행으로 사람이 읽는 영역별 누적 정답률 요약(파서는 `#` 행 건너뜀).
  - 본문: 문항 단위 행(회차ID/채점시각/모드/영역/문항번호/입력답/정답/결과/소요시간/정답여부) — **재업로드 시 이 테이블만 파싱**.
- **CSV 불러와 누적(`importStatRoundsCsv`):** 따옴표·콤마 이스케이프 처리 파서(`parseCsvLine`)로 복원 →
  같은 회차ID는 보존(덮어쓰지 않음), 새 회차만 추가, `ts` 기준 정렬. 영역/전체 요약은 항목에서 재계산.
- **UI:** OMR 액션줄에 `📊 통계 CSV 내보내기(회차 누적)`, `📂 통계 CSV 불러와 누적`, 숨김 `<input type=file>` 추가.
  기존 고급 채점 액션과 동일 가시성 토글(`updateModeUI` → 고급+채점모드+unlock 시에만 노출). 상태 문구는 `advancedToolsStatus` 재사용.
- 팝업 브리지(`window.SKCTAdvancedBridge`)에도 `downloadStatRoundsCsv`/`importStatRoundsCsv` 노출.

### 검증
- `node --check main.js` 통과.
- **CSV 왕복 단위 검증**(순수 로직 복제본, 콤마 포함 입력답 케이스 포함): 8/8 + 병합 2/2 통과
  (회차/문항 복원, `1, 3` 같은 콤마값 보존, 영역ID 매핑, 응답/정답/전체 집계, 동일 회차 재업로드 added=0, 새 회차 added=1).
- `scripts/donation_auto_issuer` `npm test`: 6 checks 통과(만료 자정 경계 회귀 무손상 확인).
- **로컬 헤드리스 점검**(127.0.0.1:8123): index.html 200, 페이지 **콘솔 에러 0**, CSV 버튼 DOM 정상 존재.

### 운영 반영 안전수칙
- `main` push / 운영 Firebase 변경 **안 함**. 변경은 `index.html`/`main.js` 로컬에만 머무름.
- 운영 프론트 영향 변경이므로 배포 전 브라우저 회귀 점검 권장: 고급 채점 → CSV 내보내기 → 같은 파일 불러오기(누적 added=0 확인) → 새 회차 채점 후 다시 내보내 누적 확인.
- 도메인/광고는 사용자 자원 필요 단계로 미착수(분리 보고).

OUTPUT_FILE: C:\Users\kshcg\dev\projects\03_commercialization_products\11_skct_practice_tool\docs\agent\worklog\2026-06-28_handoff-remaining-work.md

---

## 추가 작업 (2026-06-29 세션3 — 보류항목 #2 커뮤니티 보호 + #5 세션 청소)

요청: 보류 항목 중 #2(크더라도 제대로), #5(문제없게)를 구현. #1(타이머)·#3(자료실 서버검증)은 사용자 이해 보류, #4(OMR 렌더)는 효용 낮아 미착수.

### #2 커뮤니티 글/댓글 변조·삭제 방어 (서버 비번검증 + 규칙강화 + 클라 이관)
- **취약점(근본원인):** `posts/$postId`·`replies/.../$replyId` 의 `content`/`deleted` 필드에 "익명은 기존값 유지" 가드가 없었음.
  공격자가 글을 읽어 `passwordHash` 만 그대로 두고 `content` 를 덮어쓰거나 `deleted:true` 로 다시 쓰면 **비번 없이 남의 글 변조·삭제 가능**.
  규칙은 해시만 보여 평문 비번 검증 불가 → 규칙 단독으로는 못 막음.
- **3중 조치(같은 턴에 묶음):**
  1. **서버 함수**(`functions/index.js`, `skctSecureApi` 에 라우트 추가): `/community/post/edit|delete`, `/community/reply/edit|delete`.
     평문 비번을 HTTPS 로 받아 `sha256` 해시를 `crypto.timingSafeEqual` 로 저장 해시와 대조한 뒤에만 admin 권한으로 쓰기.
     관리자글(`isAdmin`)·빈 해시는 익명 경로 차단(403). rate-limit 10분당 30회. 댓글 삭제 시 `replyCount` 도 서버가 함께 감소.
  2. **규칙 강화**(`database.rules.json`): 게시글·댓글의 `content`/`deleted` 에 `(!data.exists() || auth != null || newData.val() == data.val())` 가드 추가.
     → 익명은 **신규 작성만** 가능, 기존 노드의 내용/삭제 직접변경은 **로그인(admin SDK 우회) 시에만**. 좋아요/replyCount 증감 가드는 그대로 보존.
  3. **클라이언트 이관**(`community.js`): `editPost`/`softDeletePost`/`editReply`/`softDeleteReply` 의 익명 경로를 서버 API 호출로 변경.
     base URL 은 `config/manualSubscriptionConfig.secureApiBaseUrl`(공개 read)에서 로드(`postToCommunityApi`). 관리자(Auth)는 기존 직접 쓰기 유지(규칙 통과).
- **검증:** 비번검증 단위 12/12(정상통과/오답차단/빈값/경로조작 차단/hex64/내용 길이 경계). `node --check` 3파일 통과. 규칙 JSON 파싱+가드 4곳 확인. Whale 실브라우저 커뮤니티 모달 로드 콘솔에러 0.

### #5 stale active_visitors 세션 청소 (예약 함수)
- `functions/index.js` 에 `cleanupStaleVisitors`(`onSchedule`, 6시간마다, Asia/Seoul, us-central1) 추가.
  24시간보다 오래된(또는 숫자 아닌) `active_visitors/<sid>` 노드를 일괄 `null` 로 제거. 표시 카운트는 클라가 150초 신선도로 이미 거르므로 표시엔 영향 없고, DB 누적/읽기비용만 정리.
- firebase-functions v7 에 scheduler 모듈 존재 확인. `node --check` 통과.

### ⚠️ 배포 필요(사용자 단계) — 코드만으론 미작동
- #2·#5 는 **Functions 배포 + 규칙 배포**가 있어야 실제 작동:
  `firebase deploy --only functions` (cleanupStaleVisitors 는 Cloud Scheduler API 활성화 필요),
  `firebase deploy --only database` (규칙).
- **중요:** 클라가 서버 API 를 찾으려면 운영 `config/manualSubscriptionConfig.secureApiBaseUrl` 이 `skctSecureApi` 함수 URL 로 설정돼 있어야 함(신청 기능이 이미 이 값을 쓰므로 보통 설정돼 있음 — 배포 전 확인).
  설정 비어 있으면 익명 수정/삭제 시 "보안 서버 설정 준비 안 됨" 안내 후 차단(안전 측 fallback).
- `main` push/운영 배포는 사용자 승인 후. 현재 변경은 전부 로컬.

### 미착수(사용자 결정)
- #1 타이머 백그라운드 드리프트: 위험·대형, 사용자 추가검토 보류.
- #3 자료실 서버측 라이선스 강제: 사용자 이해 보류.
- #4 OMR 렌더 성능: 효용 대비 회귀위험 커서 실사용 피드백 시점까지 보류.

OUTPUT_FILE: C:\Users\kshcg\dev\projects\03_commercialization_products\11_skct_practice_tool\docs\agent\worklog\2026-06-28_handoff-remaining-work.md
