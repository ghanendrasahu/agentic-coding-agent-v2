"""Workspace path containment.

Single source of truth for resolving user-supplied file paths. The agent
accepts paths from chat transcripts (LLM output) and HTTP clients, so every
read/write/run must resolve through :func:`safe_join`, which refuses absolute
paths (including Windows drives and UNC shares) and any traversal that would
escape ``backend/workspace``.
"""

from __future__ import annotations

import os
import re
from pathlib import Path, PurePath

BASE_DIR = Path(__file__).resolve().parents[2]  # backend/
WORKSPACE_ROOT = BASE_DIR / "workspace"

# Windows drive prefixes ("C:/...") are absolute on Windows but invisible to
# PurePosixPath on Linux CI, so the check is textual.
_DRIVE_PATTERN = re.compile(r"^[A-Za-z]:")


def ensure_workspace() -> Path:
    """Create the workspace root if missing and return it."""
    WORKSPACE_ROOT.mkdir(parents=True, exist_ok=True)
    return WORKSPACE_ROOT


class PathEscape(ValueError):
    """Raised when a supplied path would leave the workspace root."""


def safe_join(path: str) -> Path:
    """Resolve a workspace-relative path, refusing escapes.

    Raises:
        PathEscape: for empty input, absolute paths (drive/UNC/rooted),
            and traversal resolving outside the workspace.
    """
    if not path or not path.strip():
        raise PathEscape("Empty path")

    normalized = path.strip().replace("\\", "/")

    if normalized.startswith("/"):  # POSIX-rooted ("//share" included)
        raise PathEscape("Absolute paths are not allowed")

    if normalized.startswith("~"):  # never expand $HOME for remote input
        raise PathEscape("Home expansion (`~`) is not allowed")

    if _DRIVE_PATTERN.match(normalized):
        raise PathEscape("Absolute paths are not allowed")

    try:
        pure = PurePath(normalized)
    except (ValueError, OSError):  # malformed (e.g. NUL bytes on Windows)
        raise PathEscape("Malformed path") from None

    if pure.is_absolute() or pure.drive:
        raise PathEscape("Absolute paths are not allowed")

    # Reject any traversal component textually: Path.resolve() cannot
    # collapse ".." behind missing files on Windows (NTFS resolves only the
    # existing prefix), so resolution alone is not enough.
    if any(part == ".." for part in pure.parts):
        raise PathEscape("Path escapes the workspace")

    candidate = (WORKSPACE_ROOT / normalized).resolve()

    # resolve() follows symlinks, so a link pointing outside is rejected too.
    if candidate == WORKSPACE_ROOT or not candidate.is_relative_to(WORKSPACE_ROOT):
        raise PathEscape("Path escapes the workspace")

    return candidate


def within_workspace(path: str) -> bool:
    """True when ``path`` resolves inside the workspace."""
    try:
        safe_join(path)
    except PathEscape:
        return False
    return True


# Retained for compatibility with callers that still use the string constant.
def workspace_string() -> str:
    return os.fspath(ensure_workspace())
