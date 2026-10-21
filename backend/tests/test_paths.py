"""Unit tests for workspace path containment (app.services.paths)."""

from __future__ import annotations

import os
from pathlib import Path

import pytest

from app.services.paths import WORKSPACE_ROOT, PathEscape, safe_join, within_workspace


def test_simple_relative_path_resolves_inside_workspace():
    resolved = safe_join("hello.py")
    assert resolved == WORKSPACE_ROOT / "hello.py"


def test_subdirectory_path_resolves():
    resolved = safe_join("projects/calculator/calculator.py")
    assert resolved == WORKSPACE_ROOT / "projects" / "calculator" / "calculator.py"


@pytest.mark.parametrize(
    "evil",
    [
        "../.env",                       # parent traversal to backend/.env
        "../requirements.txt",
        "../../README.md",               # two levels up
        "a/../../workspace/../backend/.env",
        "..",                            # workspace root itself
        "hello.py/..",                   # resolves to workspace root
    ],
)
def test_traversal_outside_workspaces_rejected(evil):
    with pytest.raises(PathEscape):
        safe_join(evil)


@pytest.mark.parametrize(
    "evil",
    [
        "~/notes",                       # expansion must not escape
        "  /evil/absolute  ",            # whitespace-padded absolute
    ],
)
def test_other_anchors_rejected(evil):
    with pytest.raises(PathEscape):
        safe_join(evil)


def test_empty_path_rejected():
    with pytest.raises(PathEscape):
        safe_join("")
    with pytest.raises(PathEscape):
        safe_join("   ")


def test_absolute_windows_drive_rejected_everywhere():
    """Drive prefixes are absolute on Windows and textual on Linux CI."""
    with pytest.raises(PathEscape):
        safe_join("C:/Users/ghane/.env")
    with pytest.raises(PathEscape):
        safe_join("c:/evil.py")


def test_unc_share_rejected():
    with pytest.raises(PathEscape):
        safe_join("//server/share/secret.env")


def test_backslash_traversal_rejected():
    """Windows-style separators become traversal after normalization."""
    with pytest.raises(PathEscape):
        safe_join("..\\.env")
    with pytest.raises(PathEscape):
        safe_join("a\\..\\..\\b")


def test_within_workspace_helper():
    assert within_workspace("hello.py") is True
    assert within_workspace("../.env") is False
    assert within_workspace("") is False


@pytest.mark.skipif(os.name != "posix", reason="symlink creation needs privileges on Windows")
def test_symlink_escape_rejected(tmp_path: Path):
    """resolve() follows links, so an escaped link must land outside containment."""
    target = tmp_path / "outside.txt"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text("secret")
    reached = WORKSPACE_ROOT / "link_out"
    reached.unlink(missing_ok=True)
    os.symlink(target, reached)
    try:
        with pytest.raises(PathEscape):
            safe_join("link_out")
    finally:
        reached.unlink(missing_ok=True)


def test_workspace_root_exists():
    """Wiring that changed from string constants still points to backend/workspace."""
    assert WORKSPACE_ROOT.is_dir()
    assert WORKSPACE_ROOT.name == "workspace"
