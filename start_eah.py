from __future__ import annotations

import os
import shutil
import signal
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WEB = ROOT / "08-web"
# Default opens homepage. Override via env: EAH_START_URL
# Examples: EAH_START_URL=http://localhost:3000/studio python start_eah.py
URL = os.environ.get("EAH_START_URL", "http://localhost:3000/")


def find(command: str) -> str | None:
    return shutil.which(command)


def ready(url: str) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=1) as response:
            return 200 <= response.status < 500
    except Exception:
        return False


def main() -> int:
    if not WEB.exists():
        print("EAH: مجلد 08-web مش موجود.")
        return 1

    npm = find("npm")
    if not npm:
        print("EAH: npm مش موجود في PATH. ثبّت Node.js 22+ ثم جرّب تاني.")
        return 1

    env = os.environ.copy()
    env.setdefault("NEXT_TELEMETRY_DISABLED", "1")

    print("EAH Development Server")
    print("Starting Next.js from 08-web ...")
    process = subprocess.Popen(
        [npm, "run", "dev"],
        cwd=WEB,
        env=env,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    def stop(*_: object) -> None:
        if process.poll() is None:
            process.terminate()

    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)

    opened = False
    deadline = time.time() + 45
    try:
        while time.time() < deadline:
            if process.poll() is not None:
                print("\nEAH: السيرفر وقف بشكل غير متوقع.")
                return process.returncode or 1
            if process.stdout:
                line = process.stdout.readline()
                if line:
                    print(line.rstrip())
            if not opened and ready(URL):
                webbrowser.open(URL)
                opened = True
                print(f"\nجاهز: {URL}")
                print("اقفل التيرمنال لإيقاف EAH.")
            if opened:
                time.sleep(0.4)
            else:
                time.sleep(0.2)
    except KeyboardInterrupt:
        pass
    finally:
        stop()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
