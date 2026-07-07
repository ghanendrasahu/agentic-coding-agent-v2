import subprocess
import os


def run_python(path):

    try:

        result = subprocess.run(
            [
                "python",
                path
            ],
            capture_output=True,
            text=True,
            timeout=30
        )


        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr
        }


    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }