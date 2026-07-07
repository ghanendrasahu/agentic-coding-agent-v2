import { useState } from "react";
import { api } from "../../api/client";


export default function ChatBox() {

    const [message, setMessage] = useState("");
    const [chat, setChat] = useState<any[]>([]);


    async function sendMessage() {

        if (!message.trim()) return;


        const userMessage = message;


        setChat(prev => [
            ...prev,
            {
                role: "user",
                content: userMessage
            }
        ]);


        setMessage("");


        const res = await api(
            "/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: userMessage
                })
            }
        );


        const data = await res.json();


        let answer = data.response ?? data;


        if(typeof answer === "object"){
            answer = JSON.stringify(
                answer,
                null,
                2
            );
        }


        setChat(prev => [
            ...prev,
            {
                role:"agent",
                content:answer
            }
        ]);
    }


    return (
        <div>

            {
                chat.map(
                    (item,index)=>(
                        <pre key={index}>
                            {item.role}: {item.content}
                        </pre>
                    )
                )
            }


            <input
                value={message}
                onChange={
                    e=>setMessage(e.target.value)
                }
                onKeyDown={
                    e=>{
                        if(e.key==="Enter"){
                            sendMessage();
                        }
                    }
                }
            />


            <button onClick={sendMessage}>
                Send
            </button>

        </div>
    );
}
