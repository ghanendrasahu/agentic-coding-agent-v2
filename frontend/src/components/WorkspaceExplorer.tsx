import { useEffect, useState } from "react";
import { FolderOpen, FileCode, FileText } from "lucide-react";
import {
    getWorkspaceFiles
} from "../api/workspace";

interface Props {
    onSelect: (path: string) => void;
}

export default function WorkspaceExplorer({
    onSelect
}: Props) {

    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadFiles() {

        try {

            const data = await getWorkspaceFiles();

            setFiles(data.files ?? []);

        } catch {

            setFiles([]);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {
        loadFiles();
    }, []);

    function icon(file: string) {

        if (
            file.endsWith(".py") ||
            file.endsWith(".ts") ||
            file.endsWith(".tsx") ||
            file.endsWith(".js") ||
            file.endsWith(".jsx")
        ) {

            return <FileCode size={18} />;

        }

        return <FileText size={18} />;

    }

    if (loading) {

        return (
            <div style={{ padding: 20 }}>
                Loading workspace...
            </div>
        );

    }

    return (

        <div
            style={{
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 6
            }}
        >

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                    color: "#94a3b8",
                    fontWeight: 600
                }}
            >
                <FolderOpen size={18} />
                Workspace
            </div>

            {

                files.map(file => (

                    <button

                        key={file}

                        onClick={() => onSelect(file)}

                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            background: "#1e293b",
                            color: "#f8fafc",
                            border: "1px solid #334155",
                            borderRadius: 8,
                            padding: "10px 12px",
                            cursor: "pointer",
                            textAlign: "left"
                        }}

                    >

                        {icon(file)}

                        <span
                            style={{
                                wordBreak: "break-all"
                            }}
                        >
                            {file}
                        </span>

                    </button>

                ))

            }

        </div>

    );

}
