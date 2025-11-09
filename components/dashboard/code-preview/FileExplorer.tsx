"use client";
import { useMemo } from "react";
import FileNodeComponent from "@/components/dashboard/code-preview/FileNode";
import { useFileStore, useProjectStore, type FileNode as FileNodeType } from "@/hooks/stores";
import { addFileToArtifact, getArtifact } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface FileExplorerProps {
  onSelect?: (filePath: string) => void;
}

export default function FileExplorer({ onSelect }: FileExplorerProps) {
  const { toast } = useToast();
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const getFileTree = useFileStore((s) => s.getFileTree);
  const getProjectFiles = useFileStore((s) => s.getProjectFiles);
  const getFileByPath = useFileStore((s) => s.getFileByPath);
  const setSelectedFile = useFileStore((s) => s.setSelectedFile);
  const updateFile = useFileStore((s) => s.updateFile);
  const addFile = useFileStore((s) => s.addFile);
  const deleteFile = useFileStore((s) => s.deleteFile);
  const artifactIdsByProjectId = useFileStore((s) => s.artifactIdsByProjectId);
  const setProjectFiles = useFileStore((s) => s.setProjectFiles);
  
  // Subscribe to filesByProjectId to trigger re-render when files change
  const filesByProjectId = useFileStore((s) => s.filesByProjectId);

  // Get file tree for active project - will recompute when filesByProjectId changes
  const fileTree = useMemo(() => {
    if (activeProjectId) {
      return getFileTree(activeProjectId);
    }
    return null;
  }, [activeProjectId, getFileTree, filesByProjectId]); // Add filesByProjectId as dependency to trigger re-computation

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
      
      // Get artifactId for the project
      const artifactId = artifactIdsByProjectId[activeProjectId];
      if (!artifactId) {
        toast({
          title: "Error",
          description: "Project artifact ID not found. Please regenerate the project.",
          variant: "destructive",
        });
        return;
      }

      const fileNameToCreate = isFolder ? `${newPath}/.gitkeep` : newPath;

      console.log("fileNameToCreate", fileNameToCreate, artifactId);

      try {
        // Call the API to create the file
        await addFileToArtifact({
          artifactId,
          fileName: fileNameToCreate,
          content: "// Add your code here",
        });

        // Refresh files from artifact
        const response = await getArtifact(artifactId);
        if (response.ok && response.artifact) {
          // Convert artifact files to BackendFile format
          const backendFiles = response.artifact.files.map((file) => ({
            path: file.path,
            content: file.content,
            sha256: file.sha256 || "",
          }));

          // Convert metadata
          const projectMetadata = {
            solidity_version: response.artifact.metadata?.solidity_version || "0.8.20",
            license: response.artifact.metadata?.license || "MIT",
            test_framework: response.artifact.metadata?.test_framework || "foundry",
            main_contracts: response.artifact.metadata?.main_contracts || [],
            vulnerabilities_to_check: response.artifact.metadata?.vulnerabilities_to_check || [],
            recommended_compile_cmds: response.artifact.metadata?.recommended_compile_cmds || [],
            dependencies: {
              solidity: response.artifact.metadata?.dependencies?.solidity || [],
              javascript: response.artifact.metadata?.dependencies?.javascript || [],
            },
            notes: response.artifact.metadata?.notes || "",
          };

          // Update fileStore with fetched files
          setProjectFiles(activeProjectId, {
            ok: true,
            artifactId: response.artifact._id,
            files: backendFiles,
            metadata: projectMetadata,
          });

          toast({
            title: "File created",
            description: `File "${fileNameToCreate}" has been created successfully.`,
          });
        }
      } catch (error: any) {
        console.error("Error creating file:", error);
        toast({
          title: "Error creating file",
          description: error.message || "Failed to create file",
          variant: "destructive",
        });
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
