import { useEffect, useRef, useState } from "react";
import { api } from "../../api/client";

interface Props {
    onFileChange?: (path: string) => void;
}

interface Message {
    role: "user" | "agent";
    content: string;
}

export default function ChatBox({
    onFileChange
}: Props) {

    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState<Message[]>([]);

    const [loading, setLoading] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);



    async function send() {

        if (!message.trim() || loading)
            return;

        const text = message;

        setMessage("");

        setMessages(prev => [

            ...prev,

            {
                role: "user",
                content: text
            }

        ]);

        setLoading(true);

        try {

            const res = await api(

                "/api/chat",

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify({

                        message: text

                    })

                }

            );

            const data = await res.json();

            let reply = data.response;

            if (typeof reply === "object") {

                reply = JSON.stringify(
                    reply,
                    null,
                    2
                );

            }

            setMessages(prev => [

                ...prev,

                {

                    role: "agent",

                    content: reply

                }

            ]);

            if (
                data.path &&
                onFileChange
            ) {

                onFileChange(
                    data.path
                );

            }

        }

        finally {

            setLoading(false);

        }

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

                    flex: 1,

                    overflowY: "auto",

                    padding: 16,

                    display: "flex",

                    flexDirection: "column",

                    gap: 12

                }}

            >

                {

                    messages.map((m, i) => (

                        <div

                            key={i}

                            style={{

                                alignSelf:

                                    m.role === "user"

                                        ? "flex-end"

                                        : "flex-start",

                                background:

                                    m.role === "user"

                                        ? "#2563eb"

                                        : "#1e293b",

                                color: "white",

                                borderRadius: 14,

                                padding: 12,

                                maxWidth: "90%",

                                whiteSpace: "pre-wrap",

                                fontSize: 14

                            }}

                        >

                            {m.content}

                        </div>

                    ))

                }

                {

                    loading &&

                    <div

                        style={{

                            color: "#94a3b8"

                        }}

                    >

                        Thinking...

                    </div>

                }

                <div ref={bottomRef}/>

            </div>



            <div

                style={{

                    display: "flex",

                    gap: 10,

                    padding: 16,

                    borderTop: "1px solid #334155"

                }}

            >

                <textarea

                    value={message}

                    onChange={

                        e => setMessage(

                            e.target.value

                        )

                    }

                    onKeyDown={e => {

                        if (

                            e.key === "Enter" &&

                            !e.shiftKey

                        ) {

                            e.preventDefault();

                            send();

                        }

                    }}

                    rows={3}

                    placeholder="Ask the coding agent..."

                    style={{

                        flex: 1,

                        resize: "none"

                    }}

                />

                <button

                    onClick={send}

                    disabled={loading}

                >

                    Send

                </button>

            </div>

        </div>

    );

}
