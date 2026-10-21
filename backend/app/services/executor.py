import os
import subprocess

from app.services.paths import PathEscape, safe_join

WORKSPACE = os.path.join(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )
    ),
    "workspace"
)


def run_python(path: str):

    try:
        full_path = safe_join(path)
    except PathEscape as exc:
        return {
            "success": False,
            "output": "",
            "error": str(exc)
        }

    if not full_path.is_file():
        return {
            "success": False,
            "output": "",
            "error": f"{path} does not exist at {full_path}"
        }

    result = subprocess.run(
        [
            "python",
            os.fspath(full_path)
        ],
        capture_output=True,
        text=True
    )

    return {
        "success": result.returncode == 0,
        "output": result.stdout.strip(),
        "error": result.stderr.strip()
    }