from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.executor import run_python
from app.services.paths import PathEscape, ensure_workspace, safe_join
from app.services.scanner import scan_project

router = APIRouter(
    prefix="/workspace",
    tags=["workspace"]
)


class FileRequest(BaseModel):
    path: str
    content: str


@router.get("/files")
def get_files():
    return {
        "files": scan_project(str(ensure_workspace()))
    }


@router.get("/file")
def get_file(path: str):
    try:
        full_path = safe_join(path)
    except PathEscape as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    if not full_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    with open(
        full_path,
        encoding="utf-8"
    ) as f:
        content = f.read()

    return {
        "path": path,
        "content": content
    }


@router.post("/file")
def save_file(data: FileRequest):
    try:
        full_path = safe_join(data.path)
    except PathEscape as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    full_path.parent.mkdir(parents=True, exist_ok=True)

    with open(
        full_path,
        "w",
        encoding="utf-8"
    ) as f:
        f.write(data.content)

    return {
        "success": True,
        "message": "File saved",
        "path": data.path
    }


@router.post("/run")
def run_file(data: FileRequest):
    if not data.path.endswith(".py"):
        raise HTTPException(
            status_code=400,
            detail="Only python files can run"
        )

    try:
        safe_join(data.path)
    except PathEscape as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    return run_python(data.path)
