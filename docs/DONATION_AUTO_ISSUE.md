# 후원 자동 검증 → 사용권 자동 발급

작성일시: 2026-06-28 KST

이 문서는 투네이션 후원이 들어오면 **자동으로 검증한 뒤 고급 사용권(고급 계정 라이선스)을 발급**하는 로컬 서비스의 설치/운영 방법입니다.

위치: `scripts/donation_auto_issuer/`

## 1. 핵심 설계 (왜 이렇게 했나)

- **투네이션은 공식 웹훅 API가 없습니다.** 후원 알림은 "알림창(AlertBox) 위젯 키" 기반의 실시간 소켓으로만 제공됩니다. 따라서 무상태 웹훅 수신만으로는 투네이션과 직접 연결되지 않고, 상시 연결 리스너(또는 중계기)가 필요합니다.
- 기존 보안 모델(개인키를 서버에 두지 않고 **로컬**에서 서명/복호화)을 유지하기 위해, 자동 발급은 **운영자 PC의 로컬 서비스**로 동작합니다. 관리자 페이지 키와 동일한 위치의 개인키를 로컬 파일로만 읽습니다.
- 발급 레코드는 관리자 페이지(admin.html)가 만드는 것과 **바이트 단위로 동일**합니다. 동일한 `subscription-crypto.js`를 그대로 재사용하므로, 자동 발급된 라이선스도 브라우저 고급 로그인에서 그대로 검증됩니다(테스트로 증명됨).

## 2. 자동 발급 흐름

1. 사용자가 가격/신청 페이지에서 **고급 신청**을 제출 → 암호화된 `subscriptionRequests/REQ-XXXX` 생성(희망 ID·비밀번호·플랜 포함).
2. 사용자가 투네이션으로 후원하며 **후원 메시지에 신청ID(`REQ-XXXX`)를 적습니다.**
3. 후원 이벤트가 자동발급 서비스로 들어옵니다(아래 소스 중 하나).
4. 서비스가:
   - 메시지에서 신청ID 추출 → 해당 신청 조회
   - 후원 금액이 요금제 가격 이상인지 검증
   - 관리자 RSA 개인키로 신청 본문 복호화(희망 ID·비밀번호 확보)
   - 플랜 일수로 만료일 계산
   - ECDSA 개인키로 라이선스 서명 → 사용자 비밀번호로 암호화
   - `advancedAccountLicenses/$loginIdKey` 기록 + 신청을 `fulfilled` 로 표시
5. 사용자는 희망 ID + 비밀번호로 고급 모드 로그인 → 즉시 사용.

## 3. 후원 이벤트 소스

- `--once '<json>'` : 단일 후원 이벤트 즉시 처리(수동/검증용)
- `--file <경로>` : JSON 배열 일괄 처리
- `--webhook` : 로컬 HTTP 수신기(HMAC-SHA256 서명 필수). 투네이션 중계기/커뮤니티 리스너가 POST.

정규화된 후원 이벤트 형식:

```json
{ "id": "고유ID", "donorName": "후원자명", "amount": 10000, "message": "후원합니다 REQ-AB12CD34" }
```

### 투네이션 연결 방법

투네이션 알림창 소켓을 직접 수신하려면 `toonation-bridge.example.js` 템플릿을 사용하세요.
알림창 위젯 KEY 와 현재 메시지 포맷 확인이 필요합니다(파일 상단 주석의 커뮤니티 리퍼런스 참고).
확인 후 `parseToonationMessage()` 만 맞추면 나머지는 그대로 동작합니다.

## 4. 설치/설정

1. `config.example.json` 을 복사 → `private/donation-auto-issuer.config.json` (이 경로는 `.gitignore` 로 보호됨).
2. 값 채우기:
   - `apiKey`, `databaseURL` : Firebase 웹 설정값
   - `email`, `password` : 관리자 Firebase 로그인(=admin.html 로그인과 동일)
   - `adminPrivateKeyPath` : 관리자 RSA 개인키 PEM (예: `private/keys/skct-manual-subscription-private-key.pem`)
   - `signingPrivateKeyPath` : 라이선스 서명 ECDSA 개인키 PEM
   - `webhookSecret` : 웹훅 HMAC 비밀(충분히 긴 임의 문자열)
   - `planMap` : 요금제 코드→{label, days, price}
3. 의존성 없음(표준 라이브러리만 사용). Node 18+ 필요(Node 20+ 권장).

## 5. 실행

```bash
# 단일 후원 즉시 처리(검증)
node scripts/donation_auto_issuer/run.js --once "{\"id\":\"t1\",\"donorName\":\"홍길동\",\"amount\":10000,\"message\":\"REQ-AB12CD34\"}"

# 파일 일괄
node scripts/donation_auto_issuer/run.js --file donations.json

# 웹훅 수신기(상시) — 더블클릭 실행: start_auto_issuer.cmd
node scripts/donation_auto_issuer/run.js --webhook
```

## 6. 테스트

```bash
cd scripts/donation_auto_issuer
npm test
```

- `test/interop.test.js` : 발급 레코드가 브라우저 복호화/ECDSA 검증을 통과함(위조·오비밀번호 거부 포함)
- `test/pipeline.test.js` : 실제 암호화 신청 → 후원 → 자동발급 종단 검증(금액부족/신청ID없음/멱등 포함)
- `test/webhook.smoke.js` : 웹훅 HMAC 서명 검증/멱등 배선 확인

## 7. 보안 주의

- 개인키(관리자 RSA, 라이선스 ECDSA)와 `private/donation-auto-issuer.config.json` 은 **로컬에만** 두고 절대 커밋하지 않습니다(`private/` 는 gitignore).
- 후원 금액 검증은 요금제 가격 이상일 때만 발급합니다. 신청ID 미포함/금액 부족은 발급하지 않고 수동 확인 대상으로 남깁니다.
- 웹훅은 127.0.0.1 바인딩 + HMAC-SHA256 서명 검증으로 외부 위조를 막습니다.
- 처리한 후원 id 는 `tmp/donation_auto_issuer_state.json` 에 기록해 중복 발급을 방지합니다.
- 자동 발급은 운영자 PC에서 서비스가 켜져 있을 때만 동작합니다. 꺼져 있으면 기존처럼 관리자 페이지에서 수동 승인하면 됩니다(동일 결과).
