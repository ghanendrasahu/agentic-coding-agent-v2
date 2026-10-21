import ast
import os
import subprocess
import sys

import app.config as config
from app.services.paths import PathEscape, safe_join

WORKSPACE = os.path.join(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )
    ),
    "workspace"
)


def _root_packages(source: str) -> set[str]:
    """Top-level imported package names found in ``source`` (AST-based)."""
    packages: set[str] = set()
    try:
        tree = ast.parse(source)
    except SyntaxError:
        # run_python still reports the syntax error from the interpreter;
        # nothing to scan in unparseable code.
        return packages
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            packages.update(alias.name.split(".")[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            packages.add(node.module.split(".")[0])
    return packages


def _child_env() -> dict[str, str]:
    return config.child_env()


def run_python(path: str):

    try:
        full_path = safe_join(path)
    except PathEscape as exc:
        return {
            "success": False,
            "output": "",
            "error": str(exc)
        }

    if not full_path.is_file():
        return {
            "success": False,
            "output": "",
            "error": f"{path} does not exist at {full_path}"
        }

    source = full_path.read_text(encoding="utf-8", errors="replace")
    denied = _root_packages(source) & config.denied_modules()
    if denied:
        return {
            "success": False,
            "output": "",
            "error": f"sandbox refuses {', '.join(sorted(denied))}: denied modules in a run sandbox",
        }

    try:
        result = subprocess.run(
            [
                sys.executable,
                "-I",  # isolated: no user site, no PYTHON* env influence
                os.fspath(full_path)
            ],
            cwd=WORKSPACE,
            env=_child_env(),
            capture_output=True,
            text=True,
            timeout=config.EXEC_TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": "",
            "error": f"timed out after {config.EXEC_TIMEOUT_SECONDS:g}s"
        }

    return {
        "success": result.returncode == 0,
        "output": result.stdout.strip(),
        "error": result.stderr.strip()
    }
