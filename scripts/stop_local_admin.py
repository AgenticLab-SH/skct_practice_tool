#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parent.parent
STATE_PATH = PROJECT_ROOT / "tmp" / "local_admin_launcher_state.json"


def load_state() -> dict[str, Any] | None:
    if not STATE_PATH.exists():
        return None
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return None


def stop_if_alive(pid: int | None) -> bool:
    if not pid:
        return False
    try:
        if os.name == "nt":
            result = subprocess.run(
                ["taskkill", "/PID", str(pid), "/F", "/T"],
                capture_output=True,
                text=True,
                encoding="mbcs",
                errors="ignore",
                check=False,
            )
            return result.returncode == 0
        os.kill(pid, signal.SIGTERM)
        return True
    except Exception:
        return False


def main() -> int:
    state = load_state()
    if not state:
        print("실행 중인 로컬 관리자 상태 파일이 없습니다.")
        return 0

    server_stopped = stop_if_alive(int(state.get("serverPid") or 0))
    bridge_stopped = stop_if_alive(int(state.get("bridgePid") or 0))
    STATE_PATH.unlink(missing_ok=True)

    print(f"정적 서버 중지: {'완료' if server_stopped else '실행 중 프로세스 없음'}")
    print(f"키 브리지 중지: {'완료' if bridge_stopped else '실행 중 프로세스 없음'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
