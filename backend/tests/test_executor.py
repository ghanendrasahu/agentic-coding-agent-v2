"""Sandbox tests for /workspace/run (executor.py)."""

from __future__ import annotations

import subprocess

import pytest

import app.config as config
from app.services import executor
from app.services.paths import WORKSPACE_ROOT


@pytest.fixture()
def script():
    def _write(name: str, body: str) -> str:
        target = WORKSPACE_ROOT / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(body, encoding="utf-8")
        return name
    return _write


@pytest.fixture(autouse=True)
def cleanup_scripts():
    yield
    for leftover in WORKSPACE_ROOT.glob("_sbx_*.py"):
        leftover.unlink()


@pytest.fixture()
def fast_timeout(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(config, "EXEC_TIMEOUT_SECONDS", 2.0)
    return config


def test_root_packages_finds_base_packages():
    source = "import os.path, json\nfrom subprocess import PIPE as run\nfrom a.b import c"
    assert executor._root_packages(source) == {"os", "json", "subprocess", "a"}


def test_root_packages_survives_syntax_error():
    assert executor._root_packages("def oops(:\n    pass") == set()


def test_professional_debug_script_runs(script):
    name = "_sbx_ok.py"
    script(name, "total = sum(range(10))\nprint(total)\n")
    result = executor.run_python(name)
    assert result["success"] is True
    assert result["output"] == "45"
    assert result["error"] == ""


def test_runtime_error_returns_stderr(script):
    name = "_sbx_err.py"
    script(name, "raise RuntimeError('sandbox unit')\n")
    result = executor.run_python(name)
    assert result["success"] is False
    assert "RuntimeError: sandbox unit" in result["error"]


def test_syntax_error_reported(script):
    name = "_sbx_bad.py"
    script(name, "def oops(: 1\n")
    result = executor.run_python(name)
    assert result["success"] is False
    assert "syntax" in result["error"].lower()


@pytest.mark.parametrize(
    "source",
    [
        "import subprocess\nprint('nope')",
        "from os import environ\nprint('nope')",
        "import socket\nprint('nope')",
        "from urllib.request import urlopen\nprint('nope')",
        "import ctypes, math\nprint('nope')",
        "from http.client import HTTPSConnection\nprint('nope')",
    ],
)
def test_denied_modules_refused(script, source):
    name = "_sbx_denied.py"
    script(name, source)
    result = executor.run_python(name)
    assert result["success"] is False
    assert "refuses" in result["error"]


def test_denied_modules_can_trimmed_disabled(script, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(config, "COMMA_DELIMITED_ENV_FILES", "")
    name = "_sbx_free.py"
    script(name, "import math\nprint(math.pi > 0)\n")
    result = executor.run_python(name)
    assert result["success"] is True


def test_timeout_kills_runaways(script, fast_timeout):
    name = "_sbx_loop.py"
    script(name, "while True:\n    pass\n")
    result = executor.run_python(name)
    assert result["success"] is False
    assert "timed out after 2" in result["error"]


def test_timeout_error_type(script, monkeypatch: pytest.MonkeyPatch, fast_timeout):
    monkeypatch.setattr(
        subprocess, "run",
        lambda *a, **k: (_ for _ in ()).throw(subprocess.TimeoutExpired(cmd="x", timeout=0.1)),
    )
    name = "_sbx_fake_timeout.py"
    script(name, "print('x')\n")
    result = executor.run_python(name)
    assert result["success"] is False
    assert "timed out" in result["error"]


def test_child_env_drops_secrets(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("OPENAI_API_KEY", "sk-secret")
    monkeypatch.setenv("MY_API_KEY", "also-secret")
    monkeypatch.setenv("GITHUB_TOKEN", "tkn")
    monkeypatch.setenv("DB_PASSWORD", "p4ss")
    monkeypatch.setenv("PATH", "/usr/bin")
    env = executor._child_env()
    assert env["PATH"] == "/usr/bin"
    assert "OPENAI_API_KEY" not in env
    assert "MY_API_KEY" not in env
    assert "GITHUB_TOKEN" not in env
    assert "DB_PASSWORD" not in env


def test_child_env_max_write_flags():
    env = executor._child_env()
    assert env["PYTHONDONTWRITEBYTECODE"] == "1"
    assert env["PYTHONIOENCODING"] == "utf-8"


def test_run_escape_returns_error_dict():
    result = executor.run_python("../forbidden_outside.py")
    assert result["success"] is False
    assert "escapes" in result["error"]


def test_run_unknown_file_error_dict():
    result = executor.run_python("_sbx_missing.py")
    assert result["success"] is False
    assert "does not exist" in result["error"]
