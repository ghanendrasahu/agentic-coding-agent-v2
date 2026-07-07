import { useState } from "react";

import Layout from "../components/Layout";
import WorkspaceExplorer from "../components/WorkspaceExplorer";
import FileViewer from "../components/FileViewer";
import ChatBox from "../components/chat/ChatBox";

export default function ChatPage() {

    const [selectedFile, setSelectedFile] = useState("");

    return (

        <Layout

            workspace={
                <WorkspaceExplorer
                    onSelect={setSelectedFile}
                />
            }

            editor={
                <FileViewer
                    path={selectedFile}
                />
            }

            chat={
                <ChatBox
                    onFileChange={setSelectedFile}
                />
            }

            terminal={

                <div
                    style={{
                        padding:20,
                        color:"#22c55e",
                        fontFamily:"Consolas, monospace",
                        fontSize:14
                    }}
                >
                    PS workspace&gt;

                    <br/>

                    Waiting for commands...
                </div>

            }

        />

    );

}
