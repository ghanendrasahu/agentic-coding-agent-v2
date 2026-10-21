"""Runtime configuration, read from the environment at call time.

Values are accessed as module attributes (``config.EXEC_TIMEOUT_SECONDS``)
rather than imported names so tests can retune them via monkeypatch.
"""

from __future__ import annotations

import os

# Sandbox for /workspace/run (see services/executor.py).
EXEC_TIMEOUT_SECONDS = float(os.getenv("EXEC_TIMEOUT_SECONDS", "30"))
COMMA_DELIMITED_ENV_FILES = os.getenv(
    "DENIED_MODULES",
    "os,io,sys,subprocess,shutil,socket,ctypes,importlib,"
    "multiprocessing,threading,requests,urllib,urllib3,http,httpx,"
    "ftplib,telnetlib,smtplib,base64",
)


def denied_modules() -> frozenset[str]:
    """Denylist for sandboxed runs; ``DENIED_MODULES=""`` disables the scan."""
    return frozenset(item.strip() for item in COMMA_DELIMITED_ENV_FILES.split(",") if item.strip())


def child_env() -> dict[str, str]:
    """Environment for sandboxed scripts: PATH/encodings only, secrets dropped.

    Keys carrying credentials (OPENAI_*, *_API_KEY, *_TOKEN, *_SECRET,
    *_PASSWORD) never reach a process running agent-generated code.
    """
    kept: dict[str, str] = {}
    for key, value in os.environ.items():
        upper = key.upper()
        if upper.startswith("OPENAI") or any(
            marker in upper for marker in ("API_KEY", "TOKEN", "SECRET", "PASSWORD")
        ):
            continue
        if upper in {"PATH", "PATHEXT", "SYSTEMROOT", "HOMEDRIVE", "HOMEPATH", "TEMP", "TMP"}:
            kept[key] = value
    kept["PYTHONIOENCODING"] = "utf-8"
    kept["PYTHONDONTWRITEBYTECODE"] = "1"
    kept["PYTHONUNBUFFERED"] = "1"
    return kept
