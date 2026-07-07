import { useState } from "react";
import { api } from "../../api/client";

export default function ChatBox(){

 const [message,setMessage]=useState("");
 const [messages,setMessages]=useState<
 {role:string,text:string}[]
 >([]);

 async function send(){

  if(!message.trim()) return;

  const userMessage={
   role:"user",
   text:message
  };

  setMessages(prev=>[...prev,userMessage]);

  const current=message;
  setMessage("");

  try{

   const response=await api("/api/chat",{
    method:"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify({
     message:current
    })
   });

   const data=await response.json();

   setMessages(prev=>[
    ...prev,
    {
     role:"agent",
     text:data.response || JSON.stringify(data)
    }
   ]);

  }catch(error){

   setMessages(prev=>[
    ...prev,
    {
     role:"agent",
     text:"Backend connection failed"
    }
   ]);

  }
 }


 return(
  <div className="chat">

   <div className="messages">

    {messages.map((m,index)=>(
     <div key={index}>
      <b>{m.role}:</b> {m.text}
     </div>
    ))}

   </div>


   <div className="input">

    <input
     value={message}
     onChange={(e)=>setMessage(e.target.value)}
     placeholder="Ask your coding agent..."
    />

    <button onClick={send}>
     Send
    </button>

   </div>

  </div>
 )
}
