import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import chat, workspace

app = FastAPI(
    title="Agentic Coding Agent API"
)

# `allow_origins=["*"]` combined with credentials is invalid per the CORS
# spec, so origins are configured explicitly via BACKEND_ORIGINS (CSV).
_DEFAULT_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"


def _allowed_origins() -> list[str]:
    raw = os.getenv("BACKEND_ORIGINS", _DEFAULT_ORIGINS)
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    chat.router,
    prefix="/api"
)


app.include_router(
    workspace.router,
    prefix="/api"
)


@app.get("/")
def home():
    return {
        "status": "running",
        "message": "Agentic Coding Agent Backend"
    }
