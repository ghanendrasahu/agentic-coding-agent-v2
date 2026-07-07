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
    BASE_DIR,
    "workspace"
)



def run_python(path: str):

    full_path = os.path.join(
        WORKSPACE,
        path
    )


    if not os.path.exists(full_path):

        return {
            "success": False,
            "output": "",
            "error": f"{path} does not exist at {full_path}"
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
        "output": result.stdout.strip(),
        "error": result.stderr.strip()
    }