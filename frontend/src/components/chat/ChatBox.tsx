import { useEffect, useRef, useState } from "react";
import { api } from "../../api/client";
import ReactMarkdown from "react-markdown";
import { Copy, Loader2, Send, Bot, User } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface Props {
  onFileChange?: (path: string) => void;
}

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function ChatBox({ onFileChange }: Props) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  async function send() {
    if (!message.trim() || loading) return;

    const text = message;
    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessage("");
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    // Add streaming agent message
    const agentMessageId = Math.random().toString(36).substr(2, 9);
    const agentMessage: Message = {
      id: agentMessageId,
      role: "agent",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, agentMessage]);

    try {
      const res = await api("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      let reply = data.response;

      if (typeof reply === "object") {
        reply = JSON.stringify(reply, null, 2);
      }

      // Simulate streaming effect
      let displayedContent = "";
      const streamInterval = setInterval(() => {
        if (displayedContent.length < reply.length) {
          displayedContent = reply.slice(0, displayedContent.length + 3);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === agentMessageId ? { ...m, content: displayedContent } : m
            )
          );
        } else {
          clearInterval(streamInterval);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === agentMessageId ? { ...m, isStreaming: false } : m
            )
          );
        }
      }, 15);

      if (data.path && onFileChange) {
        onFileChange(data.path);
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === agentMessageId
            ? { ...m, content: "Error: Failed to get response from AI", isStreaming: false }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  const renderMarkdown = (content: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: ({ node, children }) => {
          const language = (node as any).data?.language || "plaintext";
          return (
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{
                borderRadius: "8px",
                fontSize: "13px",
                lineHeight: "1.5",
                padding: "12px",
                overflowX: "auto",
              }}
              showLineNumbers={language !== "plaintext"}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          );
        },
        pre: ({ children }) => (
          <div style={{ margin: "8px 0", borderRadius: "8px", overflow: "hidden" }}>
            {children}
          </div>
        ),
        p: ({ children }) => <p style={{ margin: "8px 0", lineHeight: "1.6" }}>{children}</p>,
        ul: ({ children }) => <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>{children}</ul>,
        ol: ({ children }) => <ol style={{ margin: "8px 0", paddingLeft: "20px" }}>{children}</ol>,
        li: ({ children }) => <li style={{ margin: "4px 0" }}>{children}</li>,
        strong: ({ children }) => <strong>{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote style={{ borderLeft: "3px solid #3b82f6", paddingLeft: "12px", margin: "8px 0", color: "#94a3b8", fontStyle: "italic" }}>
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="chat-box">
      <div className="chat-header">
        <div className="chat-title">
          <Bot size={18} />
          <span>AI Assistant</span>
        </div>
        <div className="chat-status">
          {loading && <Loader2 size={16} className="spinning" />}
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        className="chat-messages"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message message-${msg.role} ${msg.isStreaming ? "streaming" : ""}`}
          >
            <div className="message-avatar">
              {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-role">
                  {msg.role === "user" ? "You" : "Assistant"}
                </span>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {msg.role === "agent" && !msg.isStreaming && (
                  <button
                    className="icon-btn small copy-btn"
                    onClick={() => copyToClipboard(msg.content)}
                    title="Copy to clipboard"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
              <div className="message-body">
                {msg.role === "user" ? (
                  <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</pre>
                ) : (
                  renderMarkdown(msg.content)
                )}
                {msg.isStreaming && <span className="cursor">▋</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={3}
          placeholder="Ask the coding agent... (Shift+Enter for new line)"
          className="chat-input"
          disabled={loading}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!message.trim() || loading}
          aria-label="Send message"
        >
          {loading ? <Loader2 size={20} className="spinning" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
}

