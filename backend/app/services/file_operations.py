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


def read_file(path):

    full_path = os.path.join(
        WORKSPACE,
        path
    )


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

    full_path = os.path.join(
        WORKSPACE,
        path
    )


    with open(
        full_path,
        "w",
        encoding="utf-8"
    ) as f:
        f.write(content)


    return f"Updated {path}"



def delete_file(path):

    full_path = os.path.join(
        WORKSPACE,
        path
    )


    if not os.path.exists(full_path):
        return f"{path} does not exist"


    os.remove(full_path)

    return f"Deleted {path}"
