"use client";
import { useState } from "react";
import { Folder, File, Pencil, Trash2, Plus } from "lucide-react";
import type { FileNode as FileNodeType } from "@/hooks/stores";

interface Props {
  node: FileNodeType;
  depth?: number;
  onSelect?: (filePath: string) => void;
  onAction: (type: string, path: string) => void;
}

export default function FileNode({ node, depth = 0, onSelect, onAction }: Props) {
  const [open, setOpen] = useState(true);
  const isFolder = node.type === "folder";

  const handleClick = () => {
    if (isFolder) {
      setOpen(!open);
    } else if (onSelect && node.path) {
      onSelect(node.path);
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center justify-between group hover:bg-gray-100 rounded-md px-2 py-1 ${
          !isFolder ? "cursor-pointer" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <div
          onClick={handleClick}
          className="flex items-center gap-2 flex-1"
        >
          {isFolder ? (
            <Folder size={14} className="text-orange-500" />
          ) : (
            <File size={14} className="text-gray-600" />
          )}
          <span className="text-gray-800 text-sm">{node.name}</span>
        </div>

        <div className="hidden group-hover:flex gap-1 text-gray-500">
          {isFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction("new", node.path);
              }}
              className="hover:text-blue-500"
            >
              <Plus size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction("rename", node.path);
            }}
            className="hover:text-yellow-500"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction("delete", node.path);
            }}
            className="hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isFolder && open && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <FileNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
