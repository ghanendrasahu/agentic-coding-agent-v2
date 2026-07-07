import { Menu, Sun, Moon, Save, Play, FileText, Terminal, Bot } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  onMenuClick: () => void;
  onSave: () => void;
  onRun: () => void;
  onNewFile: () => void;
  onToggleTerminal: () => void;
  onToggleChat: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isTerminalOpen: boolean;
  isChatOpen: boolean;
  activeFile: string;
  canSave: boolean;
  canRun: boolean;
}

export default function Header({
  onMenuClick,
  onSave,
  onRun,
  onNewFile,
  onToggleTerminal,
  onToggleChat,
  isDarkMode,
  onToggleTheme,
  isTerminalOpen,
  isChatOpen,
  activeFile,
  canSave,
  canRun,
}: HeaderProps) {
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-bar')) {
        setShowFileMenu(false);
        setShowEditMenu(false);
        setShowViewMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn" onClick={onMenuClick} aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>

        <div className="menu-bar">
          <div className="menu-item" onClick={(e) => { e.stopPropagation(); setShowFileMenu(!showFileMenu); }}>
            File
            {showFileMenu && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={onNewFile}>
                  <FileText size={14} /> New File
                </button>
                <button className="dropdown-item" onClick={onSave} disabled={!canSave}>
                  <Save size={14} /> Save
                </button>
                <button className="dropdown-item" onClick={onRun} disabled={!canRun}>
                  <Play size={14} /> Run
                </button>
                <hr className="dropdown-divider" />
                <button className="dropdown-item">
                  <span>Exit</span>
                </button>
              </div>
            )}
          </div>

          <div className="menu-item" onClick={(e) => { e.stopPropagation(); setShowEditMenu(!showEditMenu); }}>
            Edit
            {showEditMenu && (
              <div className="dropdown-menu">
                <button className="dropdown-item"><span>Undo</span> <kbd>Ctrl+Z</kbd></button>
                <button className="dropdown-item"><span>Redo</span> <kbd>Ctrl+Y</kbd></button>
                <hr className="dropdown-divider" />
                <button className="dropdown-item"><span>Cut</span> <kbd>Ctrl+X</kbd></button>
                <button className="dropdown-item"><span>Copy</span> <kbd>Ctrl+C</kbd></button>
                <button className="dropdown-item"><span>Paste</span> <kbd>Ctrl+V</kbd></button>
              </div>
            )}
          </div>

          <div className="menu-item" onClick={(e) => { e.stopPropagation(); setShowViewMenu(!showViewMenu); }}>
            View
            {showViewMenu && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={onToggleTheme}>
                  {isDarkMode ? <Sun size={14} /> : <Moon size={14} />} Toggle Theme
                </button>
                <hr className="dropdown-divider" />
                <button className="dropdown-item" onClick={onToggleTerminal}>
                  <Terminal size={14} /> {isTerminalOpen ? 'Hide' : 'Show'} Terminal
                </button>
                <button className="dropdown-item" onClick={onToggleChat}>
                  <Bot size={14} /> {isChatOpen ? 'Hide' : 'Show'} AI Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="topbar-center">
        <div className="active-file">
          <FileText size={16} className="file-icon" />
          <span className="file-name">{activeFile || 'No file selected'}</span>
          {activeFile && <span className="file-modified">●</span>}
        </div>
      </div>

      <div className="topbar-right">
        <div className="action-buttons">
          <button
            className="action-btn primary"
            onClick={onNewFile}
            title="New File (Ctrl+N)"
          >
            <FileText size={16} />
          </button>
          <button
            className="action-btn primary"
            onClick={onSave}
            disabled={!canSave}
            title="Save (Ctrl+S)"
          >
            <Save size={16} />
          </button>
          <button
            className="action-btn accent"
            onClick={onRun}
            disabled={!canRun}
            title="Run (F5)"
          >
            <Play size={16} />
          </button>
        </div>

        <div className="status-bar">
          <span className="status-item">
            <span className="status-dot connected"></span>
            Connected
          </span>
          <span className="status-item">
            <span className="status-dot"></span>
            localhost:8000
          </span>
        </div>

        <button
          className="icon-btn theme-toggle"
          onClick={onToggleTheme}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
