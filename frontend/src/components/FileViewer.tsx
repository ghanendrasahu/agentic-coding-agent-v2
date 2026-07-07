import { useEffect, useState } from "react";
import {
    getFile,
    saveFile,
    runFile
} from "../api/workspace";

interface Props {
    path: string;
}

export default function FileViewer({
    path
}: Props) {

    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    async function loadFile() {

        if (!path) {
            setContent("");
            return;
        }

        setLoading(true);

        try {

            const data = await getFile(path);

            setContent(data.content ?? "");

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {
        loadFile();
    }, [path]);

    async function save() {

        if (!path) return;

        await saveFile(path, content);

        alert("Saved");

    }

    async function run() {

        if (!path) return;

        const result = await runFile(path);

        alert(result.output ?? JSON.stringify(result));

    }

    return (

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%"
            }}
        >

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 16,
                    borderBottom: "1px solid #334155"
                }}
            >

                <strong>

                    {path || "Select a file"}

                </strong>

                <div
                    style={{
                        display: "flex",
                        gap: 10
                    }}
                >

                    <button
                        onClick={save}
                        disabled={!path}
                    >
                        ?? Save
                    </button>

                    <button
                        onClick={run}
                        disabled={!path}
                    >
                        ? Run
                    </button>

                </div>

            </div>

            <textarea

                value={content}

                onChange={(e) => setContent(e.target.value)}

                placeholder={
                    loading
                        ? "Loading..."
                        : "Select a file..."
                }

                style={{
                    flex: 1,
                    resize: "none",
                    border: "none",
                    outline: "none",
                    background: "#0f172a",
                    color: "#f8fafc",
                    fontFamily: "Consolas, monospace",
                    fontSize: 15,
                    padding: 20
                }}

            />

        </div>

    );

}
