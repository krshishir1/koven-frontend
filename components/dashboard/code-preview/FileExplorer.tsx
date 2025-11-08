"use client";
import { Folder, FolderOpen, FileCode } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export type FileNode = {
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
};

interface FileExplorerProps {
  node: FileNode;
  onSelect: (file: FileNode) => void;
}

export default function FileExplorer({ node, onSelect }: FileExplorerProps) {
  const [openFolders, setOpenFolders] = useState<string[]>(["app"]);

  const toggleFolder = (name: string) => {
    setOpenFolders((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const renderTree = (node: FileNode, level = 0) => {
    const isOpen = openFolders.includes(node.name);

    if (node.type === "folder") {
      return (
        <div key={node.name}>
          <div
            onClick={() => toggleFolder(node.name)}
            className={clsx(
              "flex items-center gap-2 py-1 pl-3 pr-2 rounded-md cursor-pointer hover:bg-gray-100",
              level > 0 && "ml-3"
            )}
          >
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-primary" />
            ) : (
              <Folder className="w-4 h-4 text-primary" />
            )}
            <span className="text-sm font-medium text-muted-foreground">
              {node.name}
            </span>
          </div>

          {isOpen && (
            <div className="ml-4 border-l border-gray-200 pl-2">
              {node.children?.map((child) => renderTree(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.name}
        onClick={() => onSelect(node)}
        className="flex items-center gap-2 py-1 pl-5 pr-2 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700"
      >
        <FileCode className="w-4 h-4 text-gray-500" />
        <span className="text-sm">{node.name}</span>
      </div>
    );
  };

  return <div>{renderTree(node)}</div>;
}
