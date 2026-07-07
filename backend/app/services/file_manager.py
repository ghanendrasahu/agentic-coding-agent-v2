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



def get_path(path):

    return os.path.join(
        WORKSPACE,
        path.replace("workspace/","")
    )



def write_file(path, content):

    full_path = get_path(path)

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


    return f"Created {path}"



def read_file(path):

    full_path = get_path(path)


    if not os.path.exists(full_path):
        return "File does not exist"


    with open(
        full_path,
        "r",
        encoding="utf-8"
    ) as f:
        return f.read()
