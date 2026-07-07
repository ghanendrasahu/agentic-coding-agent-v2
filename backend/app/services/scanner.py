import os


IGNORE = {
    "node_modules",
    ".git",
    "venv",
    "__pycache__"
}


ALLOWED_EXTENSIONS = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".md",
    ".txt"
}


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


def scan_project(path=WORKSPACE):

    files = []


    for root, dirs, names in os.walk(path):

        dirs[:] = [
            d for d in dirs
            if d not in IGNORE
        ]


        for name in names:

            ext = os.path.splitext(name)[1]


            if ext in ALLOWED_EXTENSIONS:

                full = os.path.join(
                    root,
                    name
                )

                files.append(
                    full.replace("\\","/")
                )


    return files



def read_project_context(path=WORKSPACE):

    context = ""


    files = scan_project(path)


    for file in files:

        try:

            with open(
                file,
                "r",
                encoding="utf-8"
            ) as f:

                content = f.read()


            context += f"""

FILE:
{file}

CONTENT:
{content}

----------------

"""


        except Exception:
            pass


    return context
