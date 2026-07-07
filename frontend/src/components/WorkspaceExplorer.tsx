import { useEffect, useState, useRef } from "react";
import {
  FolderOpen,

  FileCode,
  FileText,
  File,
  RefreshCw,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
} from "lucide-react";
import {
  getWorkspaceFiles,
  createFile,
  deleteFile,
} from "../api/workspace";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  expanded?: boolean;
}

interface Props {
  onSelect: (path: string) => void;
  onRefresh?: () => void;
}

function buildFileTree(files: string[]): FileNode[] {
  const root: Record<string, FileNode> = {};

  // Sort files to ensure consistent tree building
  const sortedFiles = [...files].sort();

  for (const filePath of sortedFiles) {
    const parts = filePath.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      if (!current[part]) {
        current[part] = {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
          expanded: false,
        };
      }

      if (!isFile && current[part].children) {
        current = current[part].children as unknown as unknown as Record<string, FileNode>;
      }
    }
  }

  function convertToArray(obj: Record<string, FileNode>): FileNode[] {
    return Object.values(obj).map((node) => ({
      ...node,
      children: node.children ? convertToArray(node.children as unknown as unknown as Record<string, FileNode>) : undefined,
    }));
  }

  return convertToArray(root);
}

function FileTreeNode({
  node,
  onSelect,
  onCreateFile,
  onDeleteFile,
  level = 0,
}: {
  node: FileNode;
  onSelect: (path: string) => void;
  onCreateFile: (parentPath: string) => void;
  onDeleteFile: (path: string) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(node.expanded || false);
  const [showActions, setShowActions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (newName.trim() && newName !== node.name) {
        // In a real app, this would call a rename API
        console.log("Rename:", node.path, "->", newName);
      }
      setIsRenaming(false);
    } else if (e.key === "Escape") {
      setNewName(node.name);
      setIsRenaming(false);
    }
  };

  const handleCreateFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateFile(node.path);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete ${node.name}?`)) {
      onDeleteFile(node.path);
    }
  };

  const Indent = <span style={{ width: level * 16 }} />;

  if (node.type === "folder") {
    return (
      <div className="file-tree-node folder-node">
        <div
          className="file-tree-item"
          style={{ paddingLeft: level * 16 }}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {Indent}
          <button
            className="expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <FolderOpen size={16} className={expanded ? "open" : ""} />
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setIsRenaming(false)}
              className="rename-input"
            />
          ) : (
            <span
              className="node-name"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              onDoubleClick={() => setIsRenaming(true)}
            >
              {node.name}
            </span>
          )}
          {showActions && (
            <div className="node-actions">
              <button
                className="icon-btn small"
                onClick={handleCreateFile}
                title="New File"
              >
                <Plus size={12} />
              </button>
              <button
                className="icon-btn small danger"
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
        {expanded && node.children && (
          <div className="file-tree-children">
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                onSelect={onSelect}
                onCreateFile={onCreateFile}
                onDeleteFile={onDeleteFile}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="file-tree-node file-node">
      <div
        className="file-tree-item"
        style={{ paddingLeft: (level + 1) * 16 }}
        onClick={() => onSelect(node.path)}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {Indent}
        <span className="expand-placeholder" />
        {node.name.endsWith(".py") || node.name.endsWith(".ts") ||
         node.name.endsWith(".tsx") || node.name.endsWith(".js") ||
         node.name.endsWith(".jsx") ? (
          <FileCode size={16} />
        ) : (
          <FileText size={16} />
        )}
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsRenaming(false)}
            className="rename-input"
          />
        ) : (
          <span
            className="node-name"
            onDoubleClick={() => setIsRenaming(true)}
          >
            {node.name}
          </span>
        )}
        {showActions && (
          <div className="node-actions">
            <button
              className="icon-btn small danger"
              onClick={handleDelete}
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkspaceExplorer({ onSelect }: Props) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingInFolder, setCreatingInFolder] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");

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

  const handleCreateFile = async (parentPath: string) => {
    setCreatingInFolder(parentPath);
    setNewFileName("");
  };

  const confirmCreateFile = async () => {
    if (!creatingInFolder || !newFileName.trim()) return;

    try {
      await createFile(`${creatingInFolder}/${newFileName.trim()}`, "");
      loadFiles();
    } catch (error) {
      alert(`Failed to create file: ${error}`);
    } finally {
      setCreatingInFolder(null);
      setNewFileName("");
    }
  };

  const handleDeleteFile = async (path: string) => {
    try {
      await deleteFile(path);
      loadFiles();
    } catch (error) {
      alert(`Failed to delete file: ${error}`);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fileTree = buildFileTree(files);

  if (loading) {
    return (
      <div className="workspace-explorer loading">
        <div className="workspace-header">
          <div className="workspace-title">
            <FolderOpen size={18} />
            <span>Workspace</span>
          </div>
          <button className="icon-btn small" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="workspace-content">
          <div className="loading-spinner">Loading workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-explorer">
      <div className="workspace-header">
        <div className="workspace-title">
          <FolderOpen size={18} />
          <span>Workspace</span>
        </div>
        <div className="workspace-actions">
          <button className="icon-btn small" onClick={loadFiles} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button className="icon-btn small" onClick={() => handleCreateFile("")} title="New File">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="workspace-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="workspace-content">
        {creatingInFolder !== null && (
          <div className="create-file-inline">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmCreateFile();
                if (e.key === "Escape") {
                  setCreatingInFolder(null);
                  setNewFileName("");
                }
              }}
              placeholder="Enter file name..."
              autoFocus
            />
            <div className="create-file-actions">
              <button className="btn small" onClick={confirmCreateFile}>Create</button>
              <button className="btn small secondary" onClick={() => { setCreatingInFolder(null); setNewFileName(""); }}>Cancel</button>
            </div>
          </div>
        )}

        {searchQuery ? (
          <div className="file-list">
            {filteredFiles.length === 0 ? (
              <div className="empty-state">No files found</div>
            ) : (
              filteredFiles.map((file) => (
                <button
                  key={file}
                  className="file-list-item"
                  onClick={() => onSelect(file)}
                >
                  {file.endsWith(".py") || file.endsWith(".ts") ||
                   file.endsWith(".tsx") || file.endsWith(".js") ||
                   file.endsWith(".jsx") ? (
                    <FileCode size={16} />
                  ) : (
                    <FileText size={16} />
                  )}
                  <span>{file}</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="file-tree">
            {fileTree.length === 0 ? (
              <div className="empty-state">
                <File size={32} />
                <p>No files in workspace</p>
                <button className="btn primary" onClick={() => handleCreateFile("")}>
                  <Plus size={14} /> Create First File
                </button>
              </div>
            ) : (
              fileTree.map((node) => (
                <FileTreeNode
                  key={node.path}
                  node={node}
                  onSelect={onSelect}
                  onCreateFile={handleCreateFile}
                  onDeleteFile={handleDeleteFile}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}





