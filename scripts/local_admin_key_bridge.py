import glob
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


HOST = "127.0.0.1"
PORT = 47831
ALLOWED_HOSTS = {"127.0.0.1", "localhost"}


def newest_matching_path(pattern: str) -> str:
    matches = [path for path in glob.glob(pattern) if os.path.isfile(path)]
    if not matches:
        return ""
    matches.sort(key=lambda item: os.path.getmtime(item), reverse=True)
    return matches[0]


def first_existing_path(candidates):
    for candidate in candidates:
        if not candidate:
            continue
        expanded = os.path.expandvars(os.path.expanduser(candidate))
        if os.path.isfile(expanded):
            return expanded
    return ""


def resolve_key_paths():
    home = str(Path.home())
    request_path = first_existing_path([
        os.getenv("SKCT_ADMIN_REQUEST_PRIVATE_KEY_PATH", ""),
        os.path.join(home, ".codex", "private", "skct_tool", "manual_subscription_request_private.pem"),
        newest_matching_path(os.path.join(home, "Downloads", "skct-manual-subscription-private-key-*.pem")),
    ])
    license_path = first_existing_path([
        os.getenv("SKCT_ADMIN_LICENSE_PRIVATE_KEY_PATH", ""),
        os.path.join(home, ".codex", "private", "skct_tool", "manual_subscription_license_private.pem"),
        newest_matching_path(os.path.join(home, ".codex", "private", "skct_tool", "manual_subscription_license_private_*.pem")),
    ])
    return request_path, license_path


def read_text_if_exists(path: str) -> str:
    if not path or not os.path.isfile(path):
        return ""
    return Path(path).read_text(encoding="utf-8").strip()


class Handler(BaseHTTPRequestHandler):
    server_version = "SKCTLocalAdminKeyBridge/1.0"

    def _allowed_origin(self):
        origin = self.headers.get("Origin", "").strip()
        if not origin:
            return ""
        try:
            parsed = urlparse(origin)
        except Exception:
            return ""
        return origin if parsed.hostname in ALLOWED_HOSTS else ""

    def _write_headers(self, status_code=200, content_type="application/json; charset=utf-8"):
        self.send_response(status_code)
        self.send_header("Content-Type", content_type)
        allowed_origin = self._allowed_origin()
        if allowed_origin:
            self.send_header("Access-Control-Allow-Origin", allowed_origin)
            self.send_header("Access-Control-Allow-Private-Network", "true")
            self.send_header("Vary", "Origin")
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        allowed_origin = self._allowed_origin()
        if allowed_origin:
            self.send_header("Access-Control-Allow-Origin", allowed_origin)
            self.send_header("Access-Control-Allow-Private-Network", "true")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Vary", "Origin")
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self._write_headers()
            self.wfile.write(json.dumps({"ok": True, "service": "local-admin-key-bridge"}).encode("utf-8"))
            return

        if self.path != "/keys":
            self._write_headers(404)
            self.wfile.write(json.dumps({"error": "not_found"}).encode("utf-8"))
            return

        request_path, license_path = resolve_key_paths()
        payload = {
            "ok": True,
            "requestPrivateKeyPath": request_path,
            "licensePrivateKeyPath": license_path,
            "requestPrivateKeyPem": read_text_if_exists(request_path),
            "licensePrivateKeyPem": read_text_if_exists(license_path),
        }
        self._write_headers()
        self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))

    def log_message(self, fmt, *args):
        print(fmt % args)


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"local admin key bridge listening on http://{HOST}:{PORT}")
    server.serve_forever()
