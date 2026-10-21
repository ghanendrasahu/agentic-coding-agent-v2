"""HTTP tests: the workspace endpoints refuse to touch files outside the root."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.paths import WORKSPACE_ROOT

client = TestClient(app)


@pytest.fixture()
def sample_file():
    target = WORKSPACE_ROOT / "sample_app.py"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text("print('sample')\n", encoding="utf-8")
    yield "sample_app.py"
    target.unlink(missing_ok=True)


def test_health_root_running():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_get_file_ok(sample_file: str):
    response = client.get(f"/api/workspace/file?path={sample_file}")
    assert response.status_code == 200
    assert "sample" in response.json()["content"]


def test_get_file_missing_404():
    response = client.get("/api/workspace/file?path=no_such_file.py")
    assert response.status_code == 404


def test_get_file_traversal_is_400_not_content():
    """CRITICAL regression: ../.env must not leak backend/.env."""
    response = client.get("/api/workspace/file?path=../.env")
    assert response.status_code == 400
    assert "escapes" in response.json()["detail"]


def test_get_file_absolute_drive_is_400():
    response = client.get(r"/api/workspace/file?path=C:\Windows\win.ini")
    assert response.status_code == 400


def test_save_file_ok(sample_file: str):
    response = client.post(
        "/api/workspace/file",
        json={"path": sample_file, "content": "print('updated')"},
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "updated" in (WORKSPACE_ROOT / sample_file).read_text(encoding="utf-8")


def test_save_file_traversal_is_400(tmp_path):
    """CRITICAL regression: absolute/traversal writes must not leave workspace."""
    outside = tmp_path / "evil.txt"
    response = client.post(
        "/api/workspace/file",
        json={"path": "../../evil_forbidden.txt", "content": "pwn"},
    )
    assert response.status_code == 400
    assert not outside.exists()
    # ...and nothing landed outside the workspace at all:
    assert not (WORKSPACE_ROOT.parent / "evil_forbidden.txt").exists()


def test_save_file_absolute_drive_is_400():
    response = client.post(
        "/api/workspace/file",
        json={"path": "C:/evil_forbidden.txt", "content": "pwn"},
    )
    assert response.status_code == 400
    # Nothing was written anywhere (the drive guard fired before open()).
    assert not (WORKSPACE_ROOT / "C:" / "evil_forbidden.txt").exists()


def test_run_non_python_file_is_400():
    response = client.post(
        "/api/workspace/run",
        json={"path": "notes.txt", "content": ""},
    )
    assert response.status_code == 400
    assert "python" in response.json()["detail"]


def test_run_traversal_is_400():
    response = client.post(
        "/api/workspace/run",
        json={"path": "../evil.py", "content": ""},
    )
    assert response.status_code == 400
    assert "escapes" in response.json()["detail"]


def test_files_listing_never_leaves_workspace():
    response = client.get("/api/workspace/files")
    assert response.status_code == 200
    body = response.json()["files"]
    assert isinstance(body, list)
