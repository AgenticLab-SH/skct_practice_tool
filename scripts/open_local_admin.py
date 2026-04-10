#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
import webbrowser
from datetime import datetime
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOGS_DIR = PROJECT_ROOT / "logs"
TMP_DIR = PROJECT_ROOT / "tmp"
STATE_PATH = TMP_DIR / "local_admin_launcher_state.json"


def now_text() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def ensure_dirs() -> None:
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)


def load_state() -> dict[str, Any] | None:
    if not STATE_PATH.exists():
        return None
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return None


def save_state(state: dict[str, Any]) -> None:
    STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def is_process_alive(pid: int | None) -> bool:
    if not pid:
        return False
    try:
        if os.name == "nt":
            result = subprocess.run(
                ["tasklist", "/FI", f"PID eq {pid}"],
                capture_output=True,
                text=True,
                check=False,
            )
            return str(pid) in result.stdout
        os.kill(pid, 0)
        return True
    except Exception:
        return False


def test_local_url(url: str, timeout: float = 2.0) -> bool:
    for method in ("HEAD", "GET"):
        try:
            request = urllib.request.Request(url, method=method)
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return 200 <= response.status < 500
        except urllib.error.HTTPError as error:
            if 200 <= error.code < 500:
                return True
        except Exception:
            continue
    return False


def get_free_port(start_port: int, attempts: int = 25) -> int:
    for port in range(start_port, start_port + attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind(("127.0.0.1", port))
            except OSError:
                continue
            return port
    raise RuntimeError("사용 가능한 로컬 포트를 찾지 못했습니다.")


def start_background_process(args: list[str], cwd: Path, stdout_path: Path, stderr_path: Path) -> subprocess.Popen[str]:
    stdout_file = stdout_path.open("a", encoding="utf-8")
    stderr_file = stderr_path.open("a", encoding="utf-8")
    kwargs: dict[str, Any] = {
        "cwd": str(cwd),
        "stdin": subprocess.DEVNULL,
        "stdout": stdout_file,
        "stderr": stderr_file,
        "text": True,
    }
    if os.name == "nt":
        kwargs["creationflags"] = (
            getattr(subprocess, "DETACHED_PROCESS", 0)
            | getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
            | getattr(subprocess, "CREATE_NO_WINDOW", 0)
        )
    else:
        kwargs["start_new_session"] = True
    process = subprocess.Popen(args, **kwargs)
    stdout_file.close()
    stderr_file.close()
    return process


def wait_until_ready(url: str, timeout: float = 5.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if test_local_url(url):
            return True
        time.sleep(0.3)
    return False


def main() -> int:
    parser = argparse.ArgumentParser(description="로컬 관리자 페이지를 연다.")
    parser.add_argument("--no-browser", action="store_true", help="브라우저를 자동으로 열지 않습니다.")
    parser.add_argument("--start-port", type=int, default=8135, help="정적 서버 시작 포트")
    args = parser.parse_args()

    ensure_dirs()
    existing_state = load_state() or {}

    admin_url = None
    server_pid = None
    bridge_pid = None
    server_reused = False
    bridge_reused = False

    existing_url = str(existing_state.get("adminUrl") or "").strip()
    existing_server_pid = existing_state.get("serverPid")
    if existing_url and is_process_alive(int(existing_server_pid or 0)) and test_local_url(existing_url):
        admin_url = existing_url
        server_pid = int(existing_server_pid)
        server_reused = True

    python_exe = sys.executable or "python"

    if admin_url is None:
        port = get_free_port(args.start_port)
        server_out = LOGS_DIR / f"admin_http_{port}.log"
        server_err = LOGS_DIR / f"admin_http_{port}.err.log"
        server_proc = start_background_process(
            [python_exe, "-m", "http.server", str(port), "--bind", "127.0.0.1"],
            cwd=PROJECT_ROOT,
            stdout_path=server_out,
            stderr_path=server_err,
        )
        admin_url = f"http://127.0.0.1:{port}/admin.html"
        server_pid = server_proc.pid
        if not wait_until_ready(admin_url):
            raise RuntimeError(f"로컬 관리자 서버를 시작했지만 응답을 확인하지 못했습니다. 로그: {server_out}")

    existing_bridge_pid = existing_state.get("bridgePid")
    if is_process_alive(int(existing_bridge_pid or 0)):
        bridge_pid = int(existing_bridge_pid)
        bridge_reused = True

    if bridge_pid is None:
        bridge_out = LOGS_DIR / "local_admin_key_bridge.log"
        bridge_err = LOGS_DIR / "local_admin_key_bridge.err.log"
        bridge_proc = start_background_process(
            [python_exe, str(PROJECT_ROOT / "scripts" / "local_admin_key_bridge.py")],
            cwd=PROJECT_ROOT,
            stdout_path=bridge_out,
            stderr_path=bridge_err,
        )
        bridge_pid = bridge_proc.pid

    save_state(
        {
            "createdAt": now_text(),
            "adminUrl": admin_url,
            "serverPid": server_pid,
            "bridgePid": bridge_pid,
        }
    )

    if not args.no_browser:
        webbrowser.open(admin_url)

    print(f"관리자 페이지: {admin_url}")
    print(f"정적 서버 PID: {server_pid}{' (재사용)' if server_reused else ''}")
    print(f"키 브리지 PID: {bridge_pid}{' (재사용)' if bridge_reused else ''}")
    print(f"종료 명령: py {PROJECT_ROOT / 'scripts' / 'stop_local_admin.py'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
