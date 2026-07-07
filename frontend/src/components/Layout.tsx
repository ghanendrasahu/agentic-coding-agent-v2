import "./Layout.css";
import { Bot, FolderOpen, TerminalSquare } from "lucide-react";

interface LayoutProps {
  workspace: React.ReactNode;
  editor: React.ReactNode;
  chat: React.ReactNode;
  terminal: React.ReactNode;
}

export default function Layout({
  workspace,
  editor,
  chat,
  terminal,
}: LayoutProps) {
  return (
    <div className="app-shell">

      <header className="topbar">
        <div className="brand">
          <Bot size={22} />
          <span>Agentic Coding Agent</span>
        </div>

        <div className="status">
          <span className="dot"></span>
          Connected
        </div>
      </header>

      <main className="main-grid">

        <aside className="panel workspace-panel">
          <div className="panel-title">
            <FolderOpen size={18} />
            Workspace
          </div>

          {workspace}
        </aside>

        <section className="panel editor-panel">
          <div className="panel-title">
            Editor
          </div>

          {editor}
        </section>

        <aside className="panel chat-panel">
          <div className="panel-title">
            AI Chat
          </div>

          {chat}
        </aside>

      </main>

      <footer className="terminal-panel">

        <div className="panel-title">
          <TerminalSquare size={18} />
          Terminal
        </div>

        {terminal}

      </footer>

    </div>
  );
}
