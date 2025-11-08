"use client";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { FileNode } from "./FileExplorer";

interface CodeViewerProps {
  file: FileNode | null;
}

export default function CodeViewer({ file }: CodeViewerProps) {
  if (!file) {
    return (
      <div className="text-gray-400 flex items-center justify-center h-full">
        Select a file to preview code
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <div className="border-b pb-2 mb-3 text-xs text-gray-500">
        {file.name}
      </div>
      <SyntaxHighlighter
        language="tsx"
        style={oneLight}
        customStyle={{
          background: "transparent",
          padding: "1rem",
          fontSize: "0.85rem",
          borderRadius: "0.5rem",
        }}
        showLineNumbers
      >
        {file.content || ""}
      </SyntaxHighlighter>
    </div>
  );
}
