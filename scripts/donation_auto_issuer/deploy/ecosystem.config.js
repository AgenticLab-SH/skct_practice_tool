// PM2 프로세스 정의 (systemd 대안).
//   설치:  npm i -g pm2
//   기동:  pm2 start ecosystem.config.js
//   부팅시 자동기동:  pm2 startup  &&  pm2 save
//
// 개인키/비밀은 코드에 두지 말고 SKCT_ISSUER_CONFIG 가 가리키는
// private/donation-auto-issuer.config.json(서버 로컬, 600 권한)에서만 읽는다.

const path = require("path");
const CWD = __dirname; // scripts/donation_auto_issuer/deploy 가 아니라 이 파일 위치 기준
const APP_DIR = path.resolve(CWD, ".."); // scripts/donation_auto_issuer
const CONFIG = process.env.SKCT_ISSUER_CONFIG
    || path.resolve(APP_DIR, "..", "..", "private", "donation-auto-issuer.config.json");

module.exports = {
    apps: [
        {
            name: "skct-auto-issuer",
            cwd: APP_DIR,
            script: "run.js",
            args: "--webhook",
            env: { NODE_ENV: "production", SKCT_ISSUER_CONFIG: CONFIG },
            autorestart: true,
            max_restarts: 50,
            restart_delay: 5000,
            time: true
        },
        {
            name: "skct-toonation-bridge",
            cwd: APP_DIR,
            script: "toonation-bridge.js",
            env: { NODE_ENV: "production", SKCT_ISSUER_CONFIG: CONFIG },
            autorestart: true,
            max_restarts: 50,
            restart_delay: 5000,
            time: true
        }
    ]
};
