import { useState, useEffect, useCallback } from "react";
import "./Layout.css";
import { Bot, FolderOpen, ChevronRight } from "lucide-react";
import Header from "./Header";
import WorkspaceExplorer from "./WorkspaceExplorer";
import FileViewer from "./FileViewer";
import ChatBox from "./chat/ChatBox";
import Terminal from "./Terminal";
import { ToastProvider } from "../hooks/useToast";

interface LayoutProps {
  children?: React.ReactNode;
  workspace?: React.ReactNode;
  editor?: React.ReactNode;
  chat?: React.ReactNode;
  terminal?: React.ReactNode;
}

export default function Layout({
  children,
  workspace,
  editor,
  chat,
  terminal,
}: LayoutProps) {
  void children;
  void workspace;
  void editor;
  void chat;
  void terminal;

  const [selectedFile, setSelectedFile] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(["Ready"]);
  const [terminalInput, setTerminalInput] = useState("");
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );

    localStorage.setItem(
      "theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  const handleSave = useCallback(async () => {}, []);

  const handleRun = useCallback(async () => {}, []);

  const handleNewFile = useCallback(async () => {
    const fileName = prompt(
      "Enter new file name (with path):",
      "new-file.txt"
    );

    if (!fileName) return;

    try {
      const res = await fetch(
        "http://localhost:8000/api/workspace/file",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: fileName,
            content: "",
          }),
        }
      );

      if (res.ok) {
        window.dispatchEvent(
          new CustomEvent("refresh-workspace")
        );

        setSelectedFile(fileName);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleTerminalCommand = async (command: string) => {
    setTerminalOutput((prev) => [
      ...prev,
      `PS workspace> ${command}`,
    ]);

    setIsTerminalRunning(true);

    try {
      if (
        command.startsWith("node") ||
        command.startsWith("python")
      ) {
        setTerminalOutput((prev) => [
          ...prev,
          `[Process started: ${command}]`,
        ]);
      } else if (command === "clear") {
        setTerminalOutput(["Ready"]);
      } else if (
        command === "ls" ||
        command === "dir"
      ) {
        const res = await fetch(
          "http://localhost:8000/api/workspace/files"
        );

        const data = await res.json();

        if (data.files?.length) {
          setTerminalOutput((prev) => [
            ...prev,
            ...data.files.map(
              (f: string) => `  ${f}`
            ),
          ]);
        }
      } else if (command.startsWith("cat ")) {
        const filePath = command.slice(4).trim();

        const res = await fetch(
          `http://localhost:8000/api/workspace/file?path=${encodeURIComponent(
            filePath
          )}`
        );

        const data = await res.json();

        if (data.content !== undefined) {
          setTerminalOutput((prev) => [
            ...prev,
            ...data.content
              .split("\n")
              .map(
                (line: string) =>
                  `  ${line}`
              ),
          ]);
        }
      } else {
        setTerminalOutput((prev) => [
          ...prev,
          `  Command not recognized: ${command}`,
        ]);
      }
    } catch (error) {
      setTerminalOutput((prev) => [
        ...prev,
        `Error: ${error}`,
      ]);
    } finally {
      setIsTerminalRunning(false);
    }
  };

  const handleTerminalSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (terminalInput.trim()) {
      handleTerminalCommand(
        terminalInput.trim()
      );

      setTerminalInput("");
    }
  };

  return (
    <ToastProvider>
      <div className="app-shell">

        <Header
          onMenuClick={() =>
            setIsSidebarOpen(!isSidebarOpen)
          }
          onSave={handleSave}
          onRun={handleRun}
          onNewFile={handleNewFile}
          onToggleTerminal={() =>
            setIsTerminalOpen(!isTerminalOpen)
          }
          onToggleChat={() =>
            setIsChatOpen(!isChatOpen)
          }
          isDarkMode={isDarkMode}
          onToggleTheme={() =>
            setIsDarkMode(!isDarkMode)
          }
          isTerminalOpen={isTerminalOpen}
          isChatOpen={isChatOpen}
          activeFile={selectedFile}
          canSave={!!selectedFile}
          canRun={!!selectedFile}
        />


        <main className="main-grid">

          <aside className="panel workspace-panel">

            {isSidebarOpen && (
              <>
                <div className="panel-title">
                  <FolderOpen size={18}/>
                  Workspace
                </div>

                <WorkspaceExplorer
                  onSelect={setSelectedFile}
                />
              </>
            )}

            {!isSidebarOpen && (
              <button
                className="sidebar-toggle"
                onClick={() =>
                  setIsSidebarOpen(true)
                }
              >
                <ChevronRight size={20}/>
              </button>
            )}

          </aside>


          <section className="panel editor-panel">

            <div className="panel-title">
              Editor
            </div>

            <FileViewer
              path={selectedFile}
            />

          </section>


          <aside className="panel chat-panel">

            {isChatOpen && (
              <>
                <div className="panel-title">
                  AI Chat
                </div>

                <ChatBox
                  onFileChange={setSelectedFile}
                />
              </>
            )}

            {!isChatOpen && (
              <button
                className="sidebar-toggle"
                onClick={() =>
                  setIsChatOpen(true)
                }
              >
                <Bot size={20}/>
              </button>
            )}

          </aside>

        </main>


        {isTerminalOpen && (
          <footer className="terminal-panel">

            <Terminal
              output={terminalOutput}
              input={terminalInput}
              onInputChange={setTerminalInput}
              onSubmit={handleTerminalSubmit}
              isRunning={isTerminalRunning}
              onToggle={() =>
                setIsTerminalOpen(false)
              }
              onClear={() =>
                setTerminalOutput(["Ready"])
              }
              isMaximized={isTerminalMaximized}
              onMaximize={() =>
                setIsTerminalMaximized(
                  !isTerminalMaximized
                )
              }
            />

          </footer>
        )}

      </div>
    </ToastProvider>
  );
}