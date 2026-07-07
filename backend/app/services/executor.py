import subprocess
import os


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)


WORKSPACE = os.path.join(
    os.path.dirname(BASE_DIR),
    "workspace"
)


def run_python(path):

    full_path = os.path.join(
        WORKSPACE,
        path
    )


    if not os.path.exists(full_path):

        return {
            "success":False,
            "error":f"{path} does not exist"
        }


    result = subprocess.run(
        [
            "python",
            full_path
        ],
        capture_output=True,
        text=True
    )


    return {
        "success": result.returncode == 0,
        "output": result.stdout,
        "error": result.stderr
    }
