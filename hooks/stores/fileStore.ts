import { fetchWithAuth } from "@/lib/api"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// Backend response structure
export interface BackendFile {
  path: string
  content: string
  sha256: string
}

export interface ProjectMetadata {
  solidity_version: string
  license: string
  test_framework: string
  main_contracts: string[]
  vulnerabilities_to_check: string[]
  recommended_compile_cmds: string[]
  dependencies: {
    solidity: string[]
    javascript: string[]
  }
  notes: string
}

export interface BackendResponse {
  ok: boolean
  artifactId: string
  files: BackendFile[]
  metadata: ProjectMetadata
}

// File tree structure for UI
export interface FileNode {
  name: string
  type: "file" | "folder"
  path: string
  content?: string
  sha256?: string
  children?: FileNode[]
}

interface FileState {
  // Store files by project ID
  filesByProjectId: Record<string, BackendFile[]>
  metadataByProjectId: Record<string, ProjectMetadata>
  artifactIdsByProjectId: Record<string, string>
  
  // Selected file for viewing
  selectedFilePath: string | null
  selectedProjectId: string | null

  // Actions
  setProjectFiles: (projectId: string, response: BackendResponse) => void
  fetchProjectFiles: (projectId: string, idea: string) => Promise<void>
  updateFile: (projectId: string, filePath: string, content: string) => void
  addFile: (projectId: string, filePath: string, content: string) => void
  deleteFile: (projectId: string, filePath: string) => void
  getProjectFiles: (projectId: string) => BackendFile[]
  getProjectMetadata: (projectId: string) => ProjectMetadata | null
  getFileTree: (projectId: string) => FileNode | null
  getFileByPath: (projectId: string, filePath: string) => BackendFile | null
  setSelectedFile: (projectId: string | null, filePath: string | null) => void
  clearProjectFiles: (projectId: string) => void
}

// Helper function to convert flat file array to tree structure
function buildFileTree(files: BackendFile[]): FileNode | null {
  if (files.length === 0) return null

  const root: FileNode = {
    name: "root",
    type: "folder",
    path: "",
    children: [],
  }

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean)
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const currentPath = parts.slice(0, i + 1).join("/")

      if (isLast) {
        // It's a file
        const fileNode: FileNode = {
          name: part,
          type: "file",
          path: file.path,
          content: file.content,
          sha256: file.sha256,
        }
        if (!current.children) {
          current.children = []
        }
        current.children.push(fileNode)
      } else {
        // It's a folder
        let folder = current.children?.find(
          (child) => child.name === part && child.type === "folder"
        )

        if (!folder) {
          folder = {
            name: part,
            type: "folder",
            path: currentPath,
            children: [],
          }
          if (!current.children) {
            current.children = []
          }
          current.children.push(folder)
        }

        current = folder
      }
    }
  }

  // If root has only one child and it's a folder, return that instead
  if (root.children?.length === 1 && root.children[0].type === "folder") {
    return root.children[0]
  }

  return root
}

interface FileState {
  // Store files by project ID
  filesByProjectId: Record<string, BackendFile[]>;
  metadataByProjectId: Record<string, ProjectMetadata>;
  artifactIdsByProjectId: Record<string, string>;

  // Selected file for viewing
  selectedFilePath: string | null;
  selectedProjectId: string | null;

  // 2. Add loading and error states for UI feedback
  isLoading: boolean;
  error: string | null;

  // Actions
  setProjectFiles: (projectId: string, response: BackendResponse) => void;
  fetchProjectFiles: (projectId: string, idea: string) => Promise<void>;
  
  // 3. Add the new modify function
  modifyProjectFiles: (
    projectId: string,
    prompt: string,
    selectedFile?: string
  ) => Promise<void>;

  updateFile: (projectId: string, filePath: string, content: string) => void;
  addFile: (projectId: string, filePath: string, content: string) => void;
  deleteFile: (projectId: string, filePath: string) => void;
  getProjectFiles: (projectId: string) => BackendFile[];
  getProjectMetadata: (projectId: string) => ProjectMetadata | null;
  getFileTree: (projectId: string) => FileNode | null;
  getFileByPath: (projectId: string, filePath: string) => BackendFile | null;
  setSelectedFile: (projectId: string | null, filePath: string | null) => void;
  clearProjectFiles: (projectId: string) => void;
}

export const useFileStore = create<FileState>()(
  persist(
    (set, get) => ({
      filesByProjectId: {},
      metadataByProjectId: {},
      artifactIdsByProjectId: {},
      selectedFilePath: null,
      selectedProjectId: null,
      isLoading: false, // 4. Set initial state
      error: null, // 4. Set initial state

      setProjectFiles: (projectId, response) => {
        if (!response.ok || !response.files) {
          console.error("Invalid backend response:", response);
          return;
        }

        set((state) => ({
          filesByProjectId: {
            ...state.filesByProjectId,
            [projectId]: response.files,
          },
          metadataByProjectId: {
            ...state.metadataByProjectId,
            [projectId]: response.metadata,
          },
          artifactIdsByProjectId: {
            ...state.artifactIdsByProjectId,
            [projectId]: response.artifactId,
          },
        }));
      },

      /**
       * 5. This function calls /api/ai/generate
       */
      fetchProjectFiles: async (projectId, idea) => {
        set({ isLoading: true, error: null });
        try {
          // The 'idea' from the project store is the 'prompt' for the backend
          const body = { prompt: idea };

          const data: BackendResponse = await fetchWithAuth(
            "/api/ai/generate",
            {
              method: "POST",
              body: JSON.stringify(body),
            }
          );

          if (!data.ok) {
            throw new Error(
              (data as any).error || "Failed to generate project"
            );
          }

          get().setProjectFiles(projectId, data);
        } catch (error: any) {
          console.error("Error fetching project files:", error);
          set({ error: error.message });
          // You can decide if you want to set sample data on error
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 6. This new function calls /api/ai/modify
       */
      modifyProjectFiles: async (projectId, prompt, selectedFile) => {
        set({ isLoading: true, error: null });
        try {
          const artifactId = get().artifactIdsByProjectId[projectId];
          if (!artifactId) {
            throw new Error("No artifact ID found for this project.");
          }

          const body = {
            artifactId,
            prompt,
            selectedFile, // This will be undefined if not passed, which is correct
          };

          // The response is { ok: true, artifact: { ... } }
          const data = await fetchWithAuth("/api/ai/modify", {
            method: "POST",
            body: JSON.stringify(body),
          });

          if (!data.ok || !data.artifact) {
            throw new Error(data.error || "Failed to modify project");
          }

          const { artifact } = data;

          // Update the store with the new files and metadata
          set((state) => ({
            filesByProjectId: {
              ...state.filesByProjectId,
              [projectId]: artifact.files, // Overwrite with new files
            },
            metadataByProjectId: {
              ...state.metadataByProjectId,
              [projectId]: artifact.metadata, // Overwrite with new metadata
            },
          }));
        } catch (error: any) {
          console.error("Error modifying project:", error);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      // ... (all other functions: updateFile, addFile, deleteFile, etc. remain the same) ...
   updateFile: (projectId, filePath, content) => {
    set((state) => {
     const files = state.filesByProjectId[projectId] || []
     const updatedFiles = files.map((file) =>
      file.path === filePath
       ? { ...file, content, sha256: "" } 
       : file
     )

     return {
      filesByProjectId: {
       ...state.filesByProjectId,
       [projectId]: updatedFiles,
      },
     }
    })
   },

   addFile: (projectId, filePath, content) => {
    set((state) => {
     const files = state.filesByProjectId[projectId] || []
     const newFile: BackendFile = {
      path: filePath,
      content,
      sha256: "",
     }
     if (files.some((f) => f.path === filePath)) {
      return state 
     }

     return {
      filesByProjectId: {
       ...state.filesByProjectId,
       [projectId]: [...files, newFile],
      },
     }
    })
   },

   deleteFile: (projectId, filePath) => {
    set((state) => {
     const files = state.filesByProjectId[projectId] || []
     const filteredFiles = files.filter((file) => file.path !== filePath)
     const newSelectedPath =
      state.selectedFilePath === filePath ? null : state.selectedFilePath

     return {
      filesByProjectId: {
       ...state.filesByProjectId,
       [projectId]: filteredFiles,
      },
      selectedFilePath: newSelectedPath,
    }
    })
   },

   getProjectFiles: (projectId) => {
    return get().filesByProjectId[projectId] || []
   },

   getProjectMetadata: (projectId) => {
    return get().metadataByProjectId[projectId] || null
   },

   getFileTree: (projectId) => {
    const files = get().filesByProjectId[projectId] || []
    return buildFileTree(files)
   },

   getFileByPath: (projectId, filePath) => {
    const files = get().filesByProjectId[projectId] || []
    return files.find((file) => file.path === filePath) || null
   },

   setSelectedFile: (projectId: string | null, filePath: string | null) => {
    set({
     selectedProjectId: projectId,
     selectedFilePath: filePath,
    })
   },
   clearProjectFiles: (projectId) => {
    set((state) => {
     const {
      [projectId]: removedFiles,
      ...remainingFiles
     } = state.filesByProjectId
     const {
      [projectId]: removedMetadata,
      ...remainingMetadata
     } = state.metadataByProjectId
     const {
      [projectId]: removedArtifactId,
      ...remainingArtifactIds
     } = state.artifactIdsByProjectId

     return {
      filesByProjectId: remainingFiles,
      metadataByProjectId: remainingMetadata,
      artifactIdsByProjectId: remainingArtifactIds,
      selectedFilePath:
       state.selectedProjectId === projectId
        ? null
        : state.selectedFilePath,
      selectedProjectId:
       state.selectedProjectId === projectId
        ? null
        : state.selectedProjectId,
    }
    })
   },
    }),
    {
      name: "file-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filesByProjectId: state.filesByProjectId,
        metadataByProjectId: state.metadataByProjectId,
        artifactIdsByProjectId: state.artifactIdsByProjectId,
        selectedFilePath: state.selectedFilePath,
        selectedProjectId: state.selectedProjectId,
        // Don't persist isLoading or error
      }),
    }
  )
);

