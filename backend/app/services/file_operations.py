import os


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


os.makedirs(
    WORKSPACE,
    exist_ok=True
)


def get_full_path(path):

    path = path.replace("\\", "/")
    path = path.lstrip("/")

    return os.path.join(
        WORKSPACE,
        path
    )


def read_file(path):

    full_path = get_full_path(path)

    if not os.path.exists(full_path):

        return {
            "success": False,
            "error": f"{path} does not exist"
        }

    with open(
        full_path,
        "r",
        encoding="utf-8"
    ) as f:

        content = f.read()

    return {
        "success": True,
        "content": content
    }


def edit_file(path, content):

    full_path = get_full_path(path)

    if not os.path.exists(full_path):

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

    full_path = get_full_path(path)

    if not os.path.exists(full_path):

        return {
            "success": False,
            "error": f"{path} does not exist"
        }

    os.remove(full_path)

    return {
        "success": True,
        "message": f"Deleted {path}"
    }
