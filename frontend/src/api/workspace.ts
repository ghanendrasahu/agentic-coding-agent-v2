const API = "http://localhost:8000/api/workspace";

export async function getWorkspaceFiles() {
    const res = await fetch(API + "/files");
    return await res.json();
}

export async function getFile(path: string) {
    const res = await fetch(API + "/file?path=" + encodeURIComponent(path));
    return await res.json();
}

export async function saveFile(path: string, content: string) {
    const res = await fetch(API + "/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            path,
            content
        }),
    });

    return await res.json();
}

export async function runFile(path: string) {
    const res = await fetch(API + "/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            path,
            content: ""
        }),
    });

    return await res.json();
}

export async function createFile(path: string, content: string = "") {
    const res = await fetch(API + "/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            path,
            content
        }),
    });

    return await res.json();
}

export async function deleteFile(path: string) {
    const res = await fetch(
        API + "/file?path=" + encodeURIComponent(path),
        {
            method: "DELETE",
        }
    );

    return await res.json();
}