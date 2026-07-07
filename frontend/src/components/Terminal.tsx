import { useRef, useEffect, useState } from "react";
import { X, Maximize2, Minimize2, Trash2, Send, Loader2 } from "lucide-react";

interface TerminalProps {
  output: string[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isRunning: boolean;
  onToggle: () => void;
  onClear: () => void;
  isMaximized?: boolean;
  onMaximize?: () => void;
}

export default function Terminal({
  output,
  input,
  onInputChange,
  onSubmit,
  isRunning,
  onToggle,
  onClear,
  isMaximized = false,
  onMaximize,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMaximized]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
      if (input.trim()) {
        setHistory((prev) => [...prev, input]);
        setHistoryIndex(-1);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        onInputChange(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        onInputChange(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        onInputChange("");
      }
    }
  };

  return (
    <div className={`terminal ${isMaximized ? "maximized" : ""}`}>
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-icon">💻</span>
          <span>Terminal</span>
          {isRunning && <span className="running-badge">Running</span>}
        </div>
        <div className="terminal-actions">
          <button className="icon-btn small" onClick={onClear} title="Clear">
            <Trash2 size={14} />
          </button>
          {onMaximize && (
            <button className="icon-btn small" onClick={onMaximize} title={isMaximized ? "Minimize" : "Maximize"}>
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
          <button className="icon-btn small" onClick={onToggle} title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      <div ref={terminalRef} className="terminal-output" role="log" aria-live="polite">
        {output.map((line, index) => (
          <div key={index} className="terminal-line">
            <span className="terminal-prompt">PS workspace&gt;</span>
            <span className="terminal-text">{line}</span>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="terminal-input-area">
        <span className="terminal-prompt-input">PS workspace&gt;</span>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command... (ls, node file.js, python file.py, clear)"
          className="terminal-input"
          disabled={isRunning}
          rows={1}
          spellCheck={false}
        />
        <button
          type="submit"
          className="terminal-send-btn"
          disabled={!input.trim() || isRunning}
        >
          {isRunning ? <Loader2 size={16} className="spinning" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}

