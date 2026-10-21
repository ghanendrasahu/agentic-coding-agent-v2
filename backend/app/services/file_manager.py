
from app.services.paths import safe_join


def write_file(path, content):

    full_path = safe_join(path)

    full_path.parent.mkdir(
        parents=True,
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
