import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type ProjectStatus = "draft" | "published" | "ready"
export type ActiveTab = "chat" | "search" | "compiler" | "deploy"

export interface Project {
  id: string
  idea: string
  title: string
  status: ProjectStatus
  createdAt: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
}

interface ProjectState {
  projects: Project[]
  chatsByProjectId: Record<string, ChatMessage[]>
  activeProjectId: string | null
  activeTab: ActiveTab

  // Actions
  addProject: (idea: string) => Project
  setProjectStatus: (projectId: string, status: ProjectStatus) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  deleteProject: (projectId: string) => void
  addChatMessage: (
    projectId: string,
    message: Omit<ChatMessage, "id" | "timestamp"> &
      Partial<Pick<ChatMessage, "id" | "timestamp">>
  ) => ChatMessage
  getProjectChats: (projectId: string) => ChatMessage[]
  setActiveProject: (projectId: string | null) => void
  setActiveTab: (tab: ActiveTab) => void
  clearChats: (projectId: string) => void
}

function generateId(): string {
  // short unique id: 6-8 chars base36
  return Math.random().toString(36).slice(2, 10)
}

const now = () => Date.now()

function generateTitleFromIdea(idea: string): string {
  const cleaned = (idea || "").trim()
  if (!cleaned) return "New Project"
  // Split on whitespace, filter out empty, take first 3 tokens
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 3)
  return words.join(" ")
}

function generateUntitledProjectName(projects: Project[]): string {
  // Find the highest number in existing "Untitled Project N" names
  const untitledPattern = /^Untitled Project (\d+)$/
  let maxNumber = 0

  projects.forEach((project) => {
    const match = project.title.match(untitledPattern)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNumber) {
        maxNumber = num
      }
    }
  })

  return `Untitled Project ${maxNumber + 1}`
}

// Initial seed data (runs only when no persisted state)
function getInitialState() {
  const p1: Project = {
    id: "100012",
    idea: "Create a launchpad for music artist tokens",
    title: generateTitleFromIdea("Create a launchpad for music artist tokens"),
    status: "ready",
    createdAt: now(),
  }
  const p2: Project = {
    id: generateId(),
    idea: "Build a betting game for community events",
    title: generateTitleFromIdea("Build a betting game for community events"),
    status: "published",
    createdAt: now(),
  }
  const p3: Project = {
    id: generateId(),
    idea: "Make a quiz miniapp for Farcaster memes",
    title: generateTitleFromIdea("Make a quiz miniapp for Farcaster memes"),
    status: "draft",
    createdAt: now(),
  }

  const initialChats: Record<string, ChatMessage[]> = {
    [p1.id]: [
      {
        id: generateId(),
        role: "user",
        content: p1.idea,
        timestamp: now() - 60000,
      },
      {
        id: generateId(),
        role: "assistant",
        content: "Project scaffold created.",
        timestamp: now() - 59000,
      },
    ],
    [p2.id]: [
      {
        id: generateId(),
        role: "user",
        content: p2.idea,
        timestamp: now() - 120000,
      },
      {
        id: generateId(),
        role: "assistant",
        content: "Deployed and published.",
        timestamp: now() - 110000,
      },
    ],
    [p3.id]: [
      {
        id: generateId(),
        role: "user",
        content: p3.idea,
        timestamp: now() - 30000,
      },
    ],
  }

  return {
    projects: [p1, p2, p3],
    chatsByProjectId: initialChats,
    activeProjectId: p1.id,
    activeTab: "chat" as ActiveTab,
  }
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => {
      const initialState = getInitialState()

      return {
        ...initialState,

        addProject: (idea: string) => {
          const state = get()
          const newProject: Project = {
            id: generateId(),
            idea,
            title: generateUntitledProjectName(state.projects),
            status: "draft",
            createdAt: now(),
          }
          set((currentState) => ({
            projects: [newProject, ...currentState.projects],
            activeProjectId: newProject.id,
            chatsByProjectId: {
              ...currentState.chatsByProjectId,
              [newProject.id]: [
                {
                  id: generateId(),
                  role: "user",
                  content: idea,
                  timestamp: now(),
                },
              ],
            },
          }))
          return newProject
        },

        setProjectStatus: (projectId, status) => {
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, status } : p
            ),
          }))
        },

        updateProject: (projectId, updates) => {
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, ...updates } : p
            ),
          }))
        },

        deleteProject: (projectId) => {
          set((state) => {
            const { [projectId]: _, ...remainingChats } = state.chatsByProjectId
            return {
              projects: state.projects.filter((p) => p.id !== projectId),
              chatsByProjectId: remainingChats,
              activeProjectId:
                state.activeProjectId === projectId
                  ? state.projects.find((p) => p.id !== projectId)?.id ?? null
                  : state.activeProjectId,
            }
          })
        },

        addChatMessage: (projectId, message) => {
          const msg: ChatMessage = {
            id: message.id ?? generateId(),
            timestamp: message.timestamp ?? now(),
            role: message.role,
            content: message.content,
          }
          set((state) => ({
            chatsByProjectId: {
              ...state.chatsByProjectId,
              [projectId]: [
                ...(state.chatsByProjectId[projectId] ?? []),
                msg,
              ],
            },
          }))
          return msg
        },

        getProjectChats: (projectId) => {
          return get().chatsByProjectId[projectId] ?? []
        },

        setActiveProject: (projectId) => {
          set({ activeProjectId: projectId })
        },

        setActiveTab: (tab) => {
          set({ activeTab: tab })
        },

        clearChats: (projectId) => {
          set((state) => ({
            chatsByProjectId: {
              ...state.chatsByProjectId,
              [projectId]: [],
            },
          }))
        },
      }
    },
    {
      name: "project-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        chatsByProjectId: state.chatsByProjectId,
        activeProjectId: state.activeProjectId,
        activeTab: state.activeTab,
      }),
    }
  )
)

