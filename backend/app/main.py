from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import chat
from app.routers import workspace


app = FastAPI(
    title="Agentic Coding Agent API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
