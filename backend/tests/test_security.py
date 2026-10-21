"""CORS tests: explicit, env-configured origins instead of the wildcard combo."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app import main as app_module
from app.main import app


@pytest.fixture()
def no_origins(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("BACKEND_ORIGINS", raising=False)
    return app_module


def test_allowed_origin_gets_preflight_headers(no_origins):
    client = TestClient(app)
    response = client.options(
        "/api/chat",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_disallowed_origin_never_gets_headers(no_origins):
    client = TestClient(app)
    response = client.post(
        "/api/chat",
        json={"message": "hi"},
        headers={"Origin": "https://attacker.example"},
    )
    assert "access-control-allow-origin" not in response.headers


def test_no_wildcard_with_credentials(no_origins):
    """Regression: ["*"] with credentials is the spec-invalid antipattern."""
    client = TestClient(app)
    response = client.options(
        "/api/chat",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.headers.get("access-control-allow-origin") != "*"


def test_origins_env_override(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("BACKEND_ORIGINS", "https://app.example.com, https://dev.example.com")
    origins = app_module._allowed_origins()
    assert origins == ["https://app.example.com", "https://dev.example.com"]


def test_default_origins_vite_dev_urls(no_origins):
    origins = app_module._allowed_origins()
    assert "http://localhost:5173" in origins
    assert "http://127.0.0.1:5173" in origins
