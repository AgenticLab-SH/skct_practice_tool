# SKCT Practice Tool — 핸드오프 #2

작성일시: 2026-06-28 KST (세션 2)
직전 핸드오프: `docs/HANDOFF_2026-06-28.md` (세션 1, 자동발급 파이프라인 위주) — 함께 참고.

> ⚠️ 이 파일은 **공개 GitHub repo**에 올라갑니다. 비밀(봇 토큰·비밀번호·개인키·고객 이메일/비번)은 **절대 값으로 적지 말 것.** 위치/이름으로만 표기합니다.

---

## 0. 한눈에 보기

| 항목 | 값 |
|------|-----|
| 로컬 경로 | `C:\Users\kshcg\dev\projects\03_commercialization_products\11_skct_practice_tool` |
| GitHub | `AgenticLab-SH/skct_practice_tool` |
| 배포 | `main` push → GitHub Actions(`.github/workflows/deploy-pages.yml`) → Pages. **Actions가 `_site`로 dev/내부/대용량 제외 후 배포** |
| 라이브 | `https://agenticlab-sh.github.io/skct_practice_tool/` (※ **하위경로** — 네이버 문제의 핵심, 5번 참조) |
| Firebase | 프로젝트 `skct-tool`, RTDB `skct-tool-default-rtdb`(us-central1), Auth, Functions(2nd gen, node20) |
| firebase CLI | 이 PC에서 `kshcgd28@gmail.com`로 로그인됨(배포 가능) |
| 셸 | PowerShell. **git/firebase 출력이 `Out-String`으로 안 잡힐 때가 많음 → `git log`로 따로 확인** |

**운영 안전(AGENTS.md):** `main` push=운영 배포. 운영 Firebase 변경·반영은 사용자 승인 후. 개인키/비밀은 `private/`(gitignore) 밖으로 절대 커밋 금지. 이번 세션은 사용자 명시 승인 하에 운영 배포·DB쓰기를 수행함.

---

## 1. 비밀/자격증명 위치 (값은 여기 없음)

- `private/donation-auto-issuer.config.json` (gitignore): Firebase apiKey/databaseURL, 관리자 Auth email/password, 개인키 경로, webhookSecret, `toonationAlertboxKey`, `planMap`(7일=3900, 14일=6900).
- `private/keys/skct-manual-subscription-private-key.pem` (RSA, 신청 복호화)
- `private/keys/skct-manual-license-signing-private-key.pem` (ECDSA, 라이선스 서명)
- `private/admin.local.env`: 관리자 Auth email/password
- `private/deploy-telegram-function.ps1` (gitignore): 텔레그램 함수 배포 헬퍼(agent-hub 토큰 읽어 시크릿 주입)
- `config/firebase-web-config.js` (gitignore 로컬): Firebase 웹 설정(apiKey 등). Pages는 Actions secret `FIREBASE_WEB_CONFIG_JSON`으로 생성.
- **Firebase Functions Secrets**(서버 보관, 사용자 승인): `TELEGRAM_BOT_TOKEN`(=전용봇), `TELEGRAM_CHAT_ID`(운영자 chatId), `TELEGRAM_WEBHOOK_SECRET`, `ADMIN_RSA_PRIVATE_KEY`, `LICENSE_SIGNING_PRIVATE_KEY`.

---

## 2. 아키텍처 / 핵심 흐름

- **프론트(정적, Pages):** `index.html`(메인 SPA), `admin.html`(운영자), `community.js`(게시판), `study-archive.*`, `guide/faq/pricing/privacy/terms`, `site-text-config.js`, `subscription-crypto.js`(암호화 UMD: 브라우저+Node 공용).
- **Functions(`functions/index.js`):**
  - `skctSecureApi` — 신청 저장/조회/라이선스 조회 보안 API(Origin 화이트리스트+rate-limit+검증).
  - `notifyNewSubscriptionRequest` — RTDB `subscriptionRequests/{id}` onCreate → 운영자 텔레그램 알림(+[승인][거절] 버튼).
  - `telegramApprovalWebhook` — 텔레그램 콜백(버튼 탭) 수신 → 승인/거절 처리. `X-Telegram-Bot-Api-Secret-Token` 검증 + 소유자 chatId 검증.
  - functions에 `subscription-crypto.js`/`issuer-core.js` 사본 동봉(배포 패키지가 functions/만 포함하므로).
- **고급 로그인 2경로 (★중요):**
  - **경로 A**: `advancedAccountLicenses/<loginIdKey>` — ID+비번 로그인.
  - **경로 B**: `subscriptionRequests/<id>` 의 암호화 payload 안 `adminResponse.licenseBundle` — 이메일+신청비번(신청조회) 로그인.
  - 통합 로그인(main.js `hydrateAdvancedLicenseFromCredentials`)은 **입력이 이메일이면 경로 B를 먼저** 시도. 그래서 **발급 시 A·B 둘 다 채워야** 함(`issuer-core.buildApprovedRequestPayloadCipher`). 안 그러면 이메일 ID 사용자가 'pending'에 막힘(과거 버그, 수정됨).
  - `loginIdKey` 인코딩: 소문자화 후 `[a-z0-9_-]`면 그대로, 아니면 `e~` + 문자별 `_<hex>_`. (예: `user@example.com` → `e~user_40_example_2e_com`) — main.js/admin.html/issuer-core 모두 동일해야 함.
- **만료 시각(★변경됨):** `종료일T23:59:59+09:00`(자정 직전 = 종료일 하루 끝). 과거엔 정오(T12:00)였으나 **전 구간 자정으로 통일**(발급·로그인검증·만료정리). 시작일 계산 기준 T00:00은 불변.

---

## 3. 구독 승인 운영 방식 (현재 채택)

- **자동발급 안 함.** 사용자 결정: "실제 후원 안 하고 신청만 하는 경우가 있어 자동승인 금지. 투네이션 미감지면 자동승인 안 함." → **모든 승인은 운영자가 텔레그램 [승인] 버튼으로 직접.**
- 흐름: 사용자가 사이트에서 고급 신청 → `subscriptionRequests` 생성 → `notifyNewSubscriptionRequest`가 폰으로 알림+버튼 → 운영자 [승인] 탭 → `telegramApprovalWebhook`가 경로 A+B 발급 + 신청 `fulfilled` + 메시지 "승인완료"로 수정.
- 텔레그램 전용 봇 `@skct_tool_bot`(agent-hub의 gemini_connect 봇과 **별개** — agent-hub 봇은 건드리지 말 것). webhook 설정됨.
- 투네이션 브리지(`scripts/donation_auto_issuer/toonation-bridge.js`)는 **검증된 실연결 코드로 존재하나 현재 미사용**. (실측: `wss://ws.toon.at/<payload>`, payload는 위젯 HTML `window.payload=JSON.parse(...)`의 `.payload`, 12초 `#ping` 필요.) 나중에 자동발급 부활 시 사용 가능.

---

## 4. 이번 세션(#2)에서 한 일 — 전부 배포·검증 완료

1. **텔레그램 버튼 승인** 구축·배포·**실버튼 테스트 통과**(승인 시 경로 A+B 발급, 서명검증, 위조콜백 403 차단).
2. **신규 신청 텔레그램 알림** 함수 배포(Eventarc 트리거).
3. **로그인 경로 B 버그 수정** + 자동발급 파이프라인에 경로 B 추가(테스트 포함).
4. **만료 시각 정오→자정 전면 변경**(코드·테스트·배포).
5. **개별 사용자 메시지 기능**: `advancedUserMessages/<loginIdKey>`(규칙 배포: 본인 read/관리자 write). main.js `maybeShowAdvancedUserMessage`(고급 로그인 시 모달 1회, localStorage로 중복방지). admin.html "📩 개별 사용자 메시지 보내기" UI.
6. **요금제 가격 실값 동기화**(7일 3900 / 14일 6900).
7. **승인된 고객 1명**(신청 `REQ-MQVYF5UR-29GU`): 14일+보상5일=만료 **2026-07-16 자정**, 보상 안내 메시지 저장됨. (이메일/비번은 `private` 키로 admin 복호화 가능 — 문서에 값 기재 안 함.)
8. **감사 시급/중간 수정**(배포 e28a2aa):
   - `main.js`: localStorage 손상 크래시 방지(`readJsonStorage` 래퍼 2곳: 레이아웃·타이머 설정), 계산기 keydown `activeElement` 널/요소 가드.
   - `community.js`: 쓰기 전반 try/catch, 좋아요 낙관적 UI 롤백, 댓글 10초 throttle+1000자 검증, 편집 길이검증.
   - `index.html`: presence/방문카운터 쓰기 `.catch`.
9. **네이버 기술 개선**: `robots.txt`에 Yeti 명시, `index.html` JSON-LD(WebApplication).
10. **콘텐츠 보강(d81db66)**: `guide/index.html`에 SKCT 인지영역별 연습법+시간배분 전략 원본 섹션 + SEO 메타/키워드 강화.

**확인된 기존 보유 기능(경쟁사 요청과 중복):** 계산기 히스토리(`calcState.history`), 영역명(언어이해/자료해석/창의수리/언어추리/수열추리, main.js `subjects`), 문항별 시간(`questionTimings`), 상세통계 다운로드(현재 **TXT**).

---

## 5. ★ 네이버 검색 미노출 — 원인 확정 & 해결책

- **확정 원인(서치어드바이저 스크린샷):** `agenticlab-sh.github.io` 사이트 체크 → **Status 404 접근 실패**. 네이버는 **호스트 루트** 기준 수집인데 앱이 **하위경로**(`/skct_practice_tool/`)라 호스트 루트가 빈 404. robots/sitemap도 호스트 루트엔 없음. → **주소 구조 문제(콘텐츠 아님).**
- 검증 메타(`naver-site-verification`)는 index.html에 이미 존재. robots는 `*`+Yeti 허용, sitemap 존재(단, 하위경로에만).
- **근본 해결 = 커스텀 도메인**(앱을 도메인 루트에). 그러면 robots/sitemap/콘텐츠가 루트 → 네이버 수집 가능.
- 경쟁사 `skct-assistant.pages.dev`는 **앱이 서브도메인 루트**라 색인됨. (pages.dev = Cloudflare Pages 무료 서브도메인.)

---

## 6. 남은 할 일 / 목표 (우선순위)

### 🔴 최우선 — 커스텀 도메인 (네이버+광고의 전제)
- 추천: **Cloudflare Registrar `.com` (~$10/년, 원가)**. 대안 가비아/Namecheap `.com`. (`.xyz` 등은 갱신비·신뢰도 주의.)
- 절차: repo 루트 `CNAME` 파일 + DNS(apex A레코드 4개 또는 www CNAME→`agenticlab-sh.github.io`) + Pages Settings 커스텀도메인+HTTPS.
- **URL 일괄 갱신 대상**(도메인 확정 후): `sitemap.xml`, `robots.txt`, `index.html`(canonical/og/JSON-LD), `bypass.html`, `faq/guide/pricing/privacy/terms/index.html`, `chrome-extension/manifest.json`+`popup.html`. (목록: `docs/DOMAIN_AND_ADS.md`)
- 도메인 연결 후: 네이버 서치어드바이저 사이트 등록 + sitemap 제출 + **수집요청**.

### 🟡 경쟁사 도입 — 실제 남은 것은 #1뿐
- **#1 통계 CSV/엑셀 내보내기 + 회차 누적**: 현재 상세통계가 **TXT** 다운로드(`downloadDetailedStatsText`, main.js ~4298 핸들러). 경쟁사처럼 **CSV(영역별 정답률+문항별 행) 구조화 + 재업로드 시 회차 누적**을 추가. 채점/통계 영역이라 **로컬 동작검증하며** 구현 권장.
- #3 계산기히스토리·#5 영역명: **이미 보유** → 추가 작업 불필요.
- #6 콘텐츠: 가이드 보강 완료. faq/기타도 추가 보강 여지. "가져온 티 안 나게, 내 스타일" 유지.

### 🟢 광고
- 도메인 연결 후 AdSense 신청 → 루트 `ads.txt` + `privacy/`에 광고·쿠키 문구 추가 → **비집중 영역(가이드/FAQ/대기/결과)에만** 광고. 집중화면(OMR/타이머/풀이) 광고 배제 유지.

### ⏸ 보류(위험·대형 — 검증환경에서 신중히)
- **타이머 백그라운드 드리프트**: `setInterval(1000)` → 백그라운드 탭 스로틀로 느려짐. wall-clock(`Date.now()` 경과) 보정 필요하나 **다중 페이즈·일시정지·비프가 한 틱에 얽혀** 블라인드 수정 시 타이머 붕괴 위험. (main.js `timerTick` ~3958, `setInterval` ~4152)
- **커뮤니티 RTDB 변조/삭제**: 익명 게시판이라 비번이 클라이언트 검증뿐 → **규칙만으론 정상 익명 수정/삭제와 공격 구분 불가**(평문 비번 검증 불가). 제대로 막으려면 Functions 비번검증 + 규칙강화 + 클라 이관(코디네이트 변경). 데이터 민감도 낮아 우선순위 중간.
- **학습 자료실 서버측 라이선스 강제**: 현재 클라 검증뿐(규칙은 auth.uid만). Functions/규칙으로 라이선스 결속 필요.
- **OMR 렌더 성능**: 마킹마다 100문항×5버튼 전체 재렌더 → 이벤트 위임/부분갱신.
- **presence stale 청소**: 비정상 종료 세션 노드 누적(표시엔 영향X). 스케줄 Function 권장.

---

## 7. 사용자 목표(맥락)
- **무인 + 모바일 운영** → 텔레그램 버튼 승인으로 달성(폰에서 탭 한 번).
- **네이버 검색 노출** → 커스텀 도메인 필요(현재 호스트루트 404).
- **광고 수익** → 도메인 + AdSense.
- **경쟁사 대비 더 높은 완성도, 내 스타일** → 베끼지 말고 내 도구에 맞게 최적화. (실측 결과 이미 경쟁사보다 기능이 많거나 동등.)

---

## 8. 자주 쓰는 명령 / 검증
```powershell
# 테스트(자동발급/암호화 공용 로직)
cd scripts\donation_auto_issuer; npm test   # 37 checks

# 함수 배포(승인 후)
firebase deploy --only functions --project skct-tool --force --non-interactive
# 규칙 배포
firebase deploy --only database --project skct-tool
# 텔레그램 함수+시크릿 배포 헬퍼
powershell -File private\deploy-telegram-function.ps1

# 배포 상태/라이브 확인
gh api "repos/AgenticLab-SH/skct_practice_tool/actions/runs?per_page=1" --jq ".workflow_runs[0]|{conclusion,sha:.head_sha[0:7]}"
curl.exe -s "https://agenticlab-sh.github.io/skct_practice_tool/main.js?cb=1" | Select-String "표식"
```

## 9. 함정(Gotchas)
- PowerShell에서 `git commit/push`·`firebase` 출력이 비어 보일 수 있음 → `git log --oneline -1` + `git rev-list --left-right --count origin/main...HEAD`로 확인.
- Pages 배포는 `_site` rsync로 `functions/scripts/docs/staging/artifacts/private/...` 제외. 공개에 필요한 자산이 제외 목록에 걸리지 않는지 주의.
- **agent-hub gemini_connect 텔레그램 봇과 SKCT 전용 봇(@skct_tool_bot)은 별개.** SKCT 작업으로 agent-hub 봇/webhook 건드리지 말 것.
- 발급 시 **경로 A·B 둘 다** 채울 것(이메일 loginId 'pending' 버그 재발 방지).
- 만료 앵커는 이제 `T23:59:59+09:00`. 새 코드도 이 기준 유지.
- 운영 DB 쓰기/main push는 사용자 승인 후.

## 10. 최근 커밋(이번 세션 주요)
- `e28a2aa` 감사 수정 + 네이버 기술개선(robots Yeti, JSON-LD)
- `d81db66` 가이드 SEO 콘텐츠 보강
- (이전) 텔레그램 승인 웹훅, 만료 자정 변경, 개별 메시지 기능, 경로 B 수정, 가격 동기화 등
