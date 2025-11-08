"use client";
import { useMemo } from "react";
import FileNodeComponent from "@/components/dashboard/code-preview/FileNode";
import { useFileStore, useProjectStore, type FileNode as FileNodeType } from "@/hooks/stores";

interface FileExplorerProps {
  onSelect?: (filePath: string) => void;
}

export default function FileExplorer({ onSelect }: FileExplorerProps) {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const getFileTree = useFileStore((s) => s.getFileTree);
  const getSampleFileTree = useFileStore((s) => s.getSampleFileTree);
  const getFileByPath = useFileStore((s) => s.getFileByPath);
  const getSampleFileByPath = useFileStore((s) => s.getSampleFileByPath);
  const setSelectedFile = useFileStore((s) => s.setSelectedFile);
  const updateFile = useFileStore((s) => s.updateFile);
  const addFile = useFileStore((s) => s.addFile);
  const deleteFile = useFileStore((s) => s.deleteFile);

  // Get file tree for active project, or use sample data if no project
  const fileTree = useMemo(() => {
    if (activeProjectId) {
      return getFileTree(activeProjectId);
    }
    // Use sample data when no projectId is present (for testing)
    return getSampleFileTree();
  }, [activeProjectId, getFileTree, getSampleFileTree]);

  // Convert single root node to array format
  const tree: FileNodeType[] = useMemo(() => {
    if (!fileTree) return [];
    // If root has children, return them as array, otherwise return root as single item
    return fileTree.children || [fileTree];
  }, [fileTree]);

  const refresh = async () => {
    // Refresh is handled by the store - files are already loaded
    // This can be used to trigger a re-fetch if needed
    if (activeProjectId) {
      // Could trigger a re-fetch here if needed
      console.log("Refreshing file tree for project:", activeProjectId);
    }
  };

  const handleFileSelect = (filePath: string) => {
    if (onSelect) {
      if (activeProjectId) {
        setSelectedFile(activeProjectId, filePath);
      } else {
        // For sample data, just set the file path without projectId
        setSelectedFile(null, filePath);
      }
      onSelect(filePath);
    }
  };

  async function handleAction(type: string, filePath: string) {
    // For sample data (no projectId), actions are read-only
    if (!activeProjectId) {
      alert("Sample files are read-only. Create a project to edit files.");
      return;
    }

    if (type === "new") {
      const name = prompt("Enter name for new file or folder:");
      if (!name) return;
      const isFolder = name.endsWith("/");
      const newPath = filePath ? `${filePath}/${name.replace("/", "")}` : name.replace("/", "");
      
      if (isFolder) {
        // For folders, we create an empty file as placeholder
        addFile(activeProjectId, `${newPath}/.gitkeep`, "");
      } else {
        addFile(activeProjectId, newPath, "");
      }
    } else if (type === "rename") {
      const newName = prompt("New name:");
      if (!newName) return;
      const pathParts = filePath.split("/");
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join("/");
      
      // Get current file content
      const file = getFileByPath(activeProjectId, filePath);
      if (file) {
        addFile(activeProjectId, newPath, file.content);
        deleteFile(activeProjectId, filePath);
      } else {
        // Try sample file if not found in project
        const sampleFile = getSampleFileByPath(filePath);
        if (sampleFile) {
          addFile(activeProjectId, newPath, sampleFile.content);
          deleteFile(activeProjectId, filePath);
        }
      }
    } else if (type === "delete") {
      if (confirm("Delete this item?")) {
        deleteFile(activeProjectId, filePath);
      }
    }
  }

  console.log(activeProjectId, fileTree, tree);

  if (!fileTree) {
    return (
      <div className="bg-white border-r w-64 h-full text-gray-800 p-2 flex items-center justify-center">
        <p className="text-sm text-gray-500">No files available</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-r w-64 h-full text-gray-800 p-2">
      <h2 className="font-semibold text-sm mb-2 text-gray-600">Files</h2>
      <div className="overflow-y-auto h-[calc(100%-2rem)]">
        {tree.length === 0 ? (
          <p className="text-sm text-gray-500 p-2">No files</p>
        ) : (
          tree.map((node) => (
            <FileNodeComponent
              key={node.path}
              node={node}
              onSelect={handleFileSelect}
              onAction={handleAction}
            />
          ))
        )}
      </div>
    </div>
  );
}
