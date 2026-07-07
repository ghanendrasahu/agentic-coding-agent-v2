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


def write_file(path, content):

    path = path.replace("\\", "/")
    path = path.lstrip("/")

    full_path = os.path.join(
        WORKSPACE,
        path
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

        f.write(content)

    return {
        "success": True,
        "message": f"Created {path}"
    }
