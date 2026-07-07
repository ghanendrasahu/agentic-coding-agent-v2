from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

from app.services.scanner import scan_project
from app.services.executor import run_python


router = APIRouter(
    prefix="/workspace",
    tags=["workspace"]
)


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)


WORKSPACE = os.path.join(
    BASE_DIR,
    "workspace"
)


class FileRequest(BaseModel):
    path: str
    content: str



@router.get("/files")
def get_files():

    return {
        "files": scan_project(WORKSPACE)
    }



@router.get("/file")
def get_file(path: str):

    full_path = os.path.join(
        WORKSPACE,
        path
    )

    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )


    with open(
        full_path,
        "r",
        encoding="utf-8"
    ) as f:
        content = f.read()


    return {
        "path": path,
        "content": content
    }



@router.post("/file")
def save_file(data: FileRequest):

    full_path = os.path.join(
        WORKSPACE,
        data.path
    )

    os.makedirs(
        os.path.dirname(full_path),
        exist_ok=True
    )


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


    return run_python(
        data.path
    )
