// EditorLayout.tsx
"use client";
import { useState, useEffect } from "react";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeViewer";
import Terminal from "./Terminal";
import { useFileStore, useProjectStore, type BackendFile } from "@/hooks/stores";

export default function EditorLayout() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const selectedFilePath = useFileStore((s) => s.selectedFilePath);
  const selectedProjectId = useFileStore((s) => s.selectedProjectId);
  const getFileByPath = useFileStore((s) => s.getFileByPath);
  const getSampleFileByPath = useFileStore((s) => s.getSampleFileByPath);
  const updateFile = useFileStore((s) => s.updateFile);

  const [code, setCode] = useState<string>("");

  // Update code when file selection changes
  useEffect(() => {
    if (selectedFilePath) {
      let file: BackendFile | null = null;
      
      // If we have an active project and the selected file belongs to it
      if (activeProjectId && selectedProjectId === activeProjectId) {
        // Get file from project
        file = getFileByPath(activeProjectId, selectedFilePath);
      } else if (!selectedProjectId || selectedProjectId === null) {
        // If no projectId, try sample data (for testing when no projectId)
        file = getSampleFileByPath(selectedFilePath);
      }
      
      if (file) {
        setCode(file.content || "");
      } else {
        setCode("");
      }
    } else {
      setCode("");
    }
  }, [activeProjectId, selectedProjectId, selectedFilePath, getFileByPath, getSampleFileByPath]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Update file in store when code changes (only if project exists)
    if (activeProjectId && selectedFilePath) {
      updateFile(activeProjectId, selectedFilePath, newCode);
    }
    // Note: Sample files are read-only, so changes won't be saved
  };

  const handleFileSelect = (filePath: string) => {
    // File selection is handled by FileExplorer via fileStore
  };

  // Determine language based on file extension
  const getLanguage = (filePath: string | null): string => {
    if (!filePath) return "solidity";
    const ext = filePath.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "sol":
        return "solidity";
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "json":
        return "json";
      default:
        return "solidity";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800">
      <div className="flex flex-1 overflow-hidden">
        <FileExplorer onSelect={handleFileSelect} />
        <CodeEditor
          code={code}
          onChange={handleCodeChange}
          language={getLanguage(selectedFilePath || null)}
        />
      </div>
      <Terminal />
    </div>
  );
}
