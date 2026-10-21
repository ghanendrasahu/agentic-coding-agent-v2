import os

from app.services.paths import PathEscape, safe_join


def read_file(path):

    try:
        full_path = safe_join(path)
    except PathEscape as exc:
        return {
            "success": False,
            "error": str(exc)
        }

    if not full_path.is_file():
        return {
            "success": False,
            "error": f"{path} does not exist"
        }

    with open(
        full_path,
        encoding="utf-8"
    ) as f:

        content = f.read()

    return {
        "success": True,
        "content": content
    }


def edit_file(path, content):

    try:
        full_path = safe_join(path)
    except PathEscape as exc:
        return {
            "success": False,
            "error": str(exc)
        }

    if not full_path.is_file():
        return {
            "success": False,
            "error": f"{path} does not exist"
        }

    with open(
        full_path,
        "w",
        encoding="utf-8"
    ) as f:

        f.write(content)

    return {
        "success": True,
        "message": f"Updated {path}"
    }


def delete_file(path):

    try:
        full_path = safe_join(path)
    except PathEscape as exc:
        return {
            "success": False,
            "error": str(exc)
        }

    if not full_path.is_file():
        return {
            "success": False,
            "error": f"{path} does not exist"
        }

    os.remove(full_path)

    return {
        "success": True,
        "message": f"Deleted {path}"
    }
