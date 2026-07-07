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



def scan_project(path="workspace"):

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


                relative = os.path.relpath(
                    full,
                    path
                )


                files.append(
                    relative.replace("\\","/")
                )


    return files



def read_project_context(path="workspace"):

    context = ""


    files = scan_project(path)


    for file in files:

        full_path = os.path.join(
            path,
            file
        )


        try:

            with open(
                full_path,
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
