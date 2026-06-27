# AWS 24/7 자동발급 구동 준비

작성일시: 2026-06-28 KST

투네이션 후원 → 자동 사용권 발급을 **로컬 PC가 꺼져도 24/7 동작**하게 하려면, 자동발급 서비스
(`run.js --webhook` + `toonation-bridge.js`)를 상시 켜진 작은 서버에서 돌려야 합니다.
이 문서는 그 준비물(스크립트/유닛/절차)과 **보안 트레이드오프**를 정리합니다.

> ⚠️ 실제 서버 프로비저닝과 개인키 이전은 보안 모델을 바꾸므로 **사용자 승인 후에만** 진행합니다. (아래 2번)

---

## 1. 무엇이 준비됐나 (이번 작업 산출물)

`scripts/donation_auto_issuer/deploy/`:
- `skct-auto-issuer.service` — 웹훅 수신기(run.js --webhook) systemd 유닛 (자동 재시작 + 하드닝)
- `skct-toonation-bridge.service` — 투네이션 브리지 systemd 유닛 (수신기에 의존)
- `ecosystem.config.js` — systemd 대신 pm2 를 쓸 때의 프로세스 정의
- `setup-aws.sh` — Ubuntu 서버에서 Node 22 설치 + 사용자/권한 + 유닛 설치까지 (키는 사람이 직접 채움)

이 산출물만으로 서버에서 `git clone → setup-aws.sh → 설정/키 채우기 → systemctl enable --now` 흐름이 됩니다.

---

## 2. ★ 보안 트레이드오프 (반드시 사용자 결정 필요)

현재 설계 철학: **개인키(RSA 신청복호화 / ECDSA 라이선스서명)는 운영자 PC 로컬에만 둔다.**

- **선택지 A — 서버에 키를 둔다(완전 24/7 자동):**
  - 투네이션 수신 + 발급(서명/복호화) 전부 서버에서. 로컬 PC 꺼져도 동작.
  - 단점: 개인키가 운영자 PC 밖(클라우드 서버)에 존재 → 서버가 뚫리면 위조 발급 가능.
  - 완화: 전용 최소권한 사용자, `chmod 600`, systemd 하드닝, 방화벽(8137 비공개), SSM/Secrets Manager,
    키 정기 회전, 서버 접근 최소화. 그래도 "로컬 전용" 철학과는 상충.
- **선택지 B — 서버는 수신/중계만, 발급은 로컬에서(키는 로컬 유지):**
  - 서버의 브리지가 후원을 받아 로컬 `run.js --webhook` 으로 (VPN/터널/인증된 채널) 전달.
  - 장점: 개인키는 계속 로컬. 단점: **로컬 PC 가 켜져 있어야** 실제 발급됨(완전 24/7 아님).
- **선택지 C — 현행 유지(로컬에서 브리지+발급 모두):**
  - 가장 안전하지만 PC 가 꺼지면 멈춤. 꺼진 동안 후원은 `no-request`/대기로 남고, 켜지면 처리(또는 관리자 수동).

> "반드시 24/7 자동" = 선택지 A 가 필요. 키가 서버로 나가는 것에 대한 **명시적 승인**을 받고 진행하세요.
> 승인 전에는 어떤 키도 서버로 옮기지 않습니다(이 작업에서도 키는 전혀 건드리지 않았습니다).

---

## 3. 서버 후보 / 비용

> **중요 — 자동발급 서버에는 도메인이 필요 없습니다.** 이 서버는 toon.at(소켓)와 Firebase 로 **나가는(outbound)**
> 연결만 합니다. 공개 IP·도메인·인바운드 포트 개방이 전혀 필요 없습니다(웹훅도 127.0.0.1 로컬 전용).
> 즉 "상시 켜진 작은 컴퓨터" 면 무엇이든 됩니다. AWS·도메인은 이 서버와 무관합니다(도메인은 5번 웹사이트/광고용).

무료/저가 후보 (위에서 아래로 추천):

| 옵션 | 무료 지속 | 장단점 |
|------|-----------|--------|
| **집에 있는 기기**(안 쓰는 노트북/미니PC/라즈베리파이/구형 안드로이드+Termux) | 영구(전기료만) | 가장 간단·완전 무료·키도 내 손안. PC가 켜져 있어야 함. **가장 추천.** |
| **Oracle Cloud Always Free** | 영구(무기한) | 진짜로 계속 무료(ARM VM). 가입 심사·간헐적 회수정책 주의. 클라우드 24/7 원할 때 1순위. |
| **Google Cloud e2-micro 무료** | 영구(특정 리전) | 사양 작지만 충분. 결제수단 등록 필요. |
| **AWS EC2 t3.micro/Lightsail 프리티어** | 12개월만 | 이후 과금. **CloudWatch 결제 알람** 필수. |
| Render/Fly 무료 등 | 부적합 | 유휴 시 **자동 종료(spin-down)** → 상시 소켓 연결이 끊김. 이 용도엔 비권장. |

- 상시 프로세스 2개(경량)라 RAM 512MB~1GB 면 충분.
- **로컬 PC(현행) 도 완전히 유효한 선택**입니다. PC 켜진 동안만 자동발급, 꺼진 동안 들어온 후원은 켜질 때/관리자 수동으로 처리.

## 4. 설치 절차 (Linux 서버에서 — 집 PC/클라우드 공통, Ubuntu 기준)

```bash
sudo git clone https://github.com/AgenticLab-SH/skct_practice_tool /opt/skct
sudo bash /opt/skct/scripts/donation_auto_issuer/deploy/setup-aws.sh
# 안내대로 private/donation-auto-issuer.config.json 과 private/keys/*.pem 채우기 (chmod 600)
sudo systemctl enable --now skct-auto-issuer skct-toonation-bridge
journalctl -u skct-toonation-bridge -f
```

pm2 를 선호하면:
```bash
npm i -g pm2
pm2 start /opt/skct/scripts/donation_auto_issuer/deploy/ecosystem.config.js
pm2 startup && pm2 save
```

## 5. 운영 점검

- 첫 실연결 시 `DONATION_BRIDGE_DEBUG=1` 로 실제 후원 1건 원문 확인 → 포맷 다르면 `parseToonationMessage()` 보정.
- 라이브 종단 테스트: 테스트 신청(REQ 발급) → 소액 실제 후원(메시지에 REQ 포함) → 자동발급 → 해당 ID/PW 로 고급 로그인 성공 확인.
- 운영자 알림: config 의 `notify`(telegram/webhookUrl) 설정 시 발급/실패를 즉시 통지.
- 만료 정리: `node expire-licenses.js`(점검) / `--apply`(반영) 를 cron 으로 주기 실행 가능.
