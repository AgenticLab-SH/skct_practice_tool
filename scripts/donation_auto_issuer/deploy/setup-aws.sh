#!/usr/bin/env bash
# =============================================================================
# SKCT 자동발급 서비스 - AWS(EC2/Lightsail, Ubuntu 22.04+) 셋업 헬퍼
# =============================================================================
# 이 스크립트는 "서버에서" 실행한다. 개인키/비밀은 절대 포함하지 않으며,
# 코드만 배치하고 Node/서비스만 준비한다. 키와 설정은 마지막에 사람이 직접 채운다.
#
# 사용:
#   1) 코드 가져오기:  git clone https://github.com/AgenticLab-SH/skct_practice_tool /opt/skct
#   2) 이 스크립트 실행:  sudo bash /opt/skct/scripts/donation_auto_issuer/deploy/setup-aws.sh
#   3) 설정 채우기(아래 안내):  /opt/skct/private/donation-auto-issuer.config.json + private/keys/*.pem
#   4) 서비스 시작:  sudo systemctl enable --now skct-auto-issuer skct-toonation-bridge
# =============================================================================
set -euo pipefail

APP_ROOT="/opt/skct"
SVC_DIR="${APP_ROOT}/scripts/donation_auto_issuer"
DEPLOY_DIR="${SVC_DIR}/deploy"
RUN_USER="skct"

echo "==> 1. Node.js 22 LTS 설치 (없을 때만)"
if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi
node --version

echo "==> 2. 전용 사용자(${RUN_USER}) 생성 (없을 때만)"
if ! id "${RUN_USER}" >/dev/null 2>&1; then
    useradd --system --home "${APP_ROOT}" --shell /usr/sbin/nologin "${RUN_USER}"
fi

echo "==> 3. 디렉터리/권한 준비"
mkdir -p "${APP_ROOT}/private/keys" "${APP_ROOT}/tmp"
chown -R "${RUN_USER}:${RUN_USER}" "${APP_ROOT}"
chmod 700 "${APP_ROOT}/private" "${APP_ROOT}/private/keys"

echo "==> 4. systemd 유닛 설치"
cp "${DEPLOY_DIR}/skct-auto-issuer.service" /etc/systemd/system/
cp "${DEPLOY_DIR}/skct-toonation-bridge.service" /etc/systemd/system/
systemctl daemon-reload

cat <<'NEXT'

==> 셋업 완료. 다음을 사람이 직접 수행하세요(키/비밀은 자동화하지 않음):

  1) 설정 파일 작성:
       cp /opt/skct/scripts/donation_auto_issuer/config.example.json \
          /opt/skct/private/donation-auto-issuer.config.json
       # apiKey, databaseURL, email, password, webhookSecret, toonationAlertboxKey 채우기
       chmod 600 /opt/skct/private/donation-auto-issuer.config.json

  2) 개인키 2개를 안전 채널(scp 등)로 업로드:
       /opt/skct/private/keys/skct-manual-subscription-private-key.pem   (RSA, 신청 복호화)
       /opt/skct/private/keys/skct-manual-license-signing-private-key.pem (ECDSA, 라이선스 서명)
       chmod 600 /opt/skct/private/keys/*.pem
       chown skct:skct /opt/skct/private/keys/*.pem /opt/skct/private/donation-auto-issuer.config.json

  3) (권장) AWS SSM Parameter Store/Secrets Manager 로 비밀 관리 시 부팅 훅에서 주입.

  4) 동작 확인:
       sudo -u skct SKCT_ISSUER_CONFIG=/opt/skct/private/donation-auto-issuer.config.json \
            node /opt/skct/scripts/donation_auto_issuer/run.js --once '{"id":"t1","donorName":"테스트","amount":4900,"message":"REQ-XXXX"}'

  5) 서비스 시작:
       sudo systemctl enable --now skct-auto-issuer skct-toonation-bridge
       sudo systemctl status skct-auto-issuer skct-toonation-bridge
       journalctl -u skct-toonation-bridge -f

NEXT
