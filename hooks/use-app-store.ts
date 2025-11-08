import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type ProjectStatus = "draft" | "published"

export interface UserAccount {
  id: string
  name: string
  avatarUrl: string
  credits: number
}

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

interface AppState {
  user: UserAccount
  projects: Project[]
  chatsByProjectId: Record<string, ChatMessage[]>
  activeProjectId: string | null

  addProject: (idea: string) => Project
  setProjectStatus: (projectId: string, status: ProjectStatus) => void
  addChatMessage: (projectId: string, message: Omit<ChatMessage, "id" | "timestamp"> & Partial<Pick<ChatMessage, "id" | "timestamp">>) => ChatMessage
  getProjectChats: (projectId: string) => ChatMessage[]
  setActiveProject: (projectId: string) => void
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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      // initial seed (runs only when no persisted state)
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
          { id: generateId(), role: "user", content: p1.idea, timestamp: now() - 60000 },
          { id: generateId(), role: "assistant", content: "Project scaffold created.", timestamp: now() - 59000 },
        ],
        [p2.id]: [
          { id: generateId(), role: "user", content: p2.idea, timestamp: now() - 120000 },
          { id: generateId(), role: "assistant", content: "Deployed and published.", timestamp: now() - 110000 },
        ],
        [p3.id]: [
          { id: generateId(), role: "user", content: p3.idea, timestamp: now() - 30000 },
        ],
      }

      const initialState: AppState = {
        user: {
          id: "user_demo",
          name: "Demo User",
          avatarUrl: "/minidevfun.png",
          credits: 42,
        },
        projects: [p1, p2, p3],
        chatsByProjectId: initialChats,
        activeProjectId: p1.id,

        addProject: (idea: string) => {
          const newProject: Project = {
            id: generateId(),
            idea,
            title: generateTitleFromIdea(idea),
            status: "draft",
            createdAt: now(),
          }
          set((state) => ({
            projects: [newProject, ...state.projects],
            chatsByProjectId: {
              ...state.chatsByProjectId,
              [newProject.id]: [
                { id: generateId(), role: "user", content: idea, timestamp: now() },
              ],
            },
          }))
          return newProject
        },

        setProjectStatus: (projectId, status) => {
          set((state) => ({
            projects: state.projects.map((p) => (p.id === projectId ? { ...p, status } : p)),
          }))
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
              [projectId]: [...(state.chatsByProjectId[projectId] ?? []), msg],
            },
          }))
          return msg
        },

        getProjectChats: (projectId) => get().chatsByProjectId[projectId] ?? [],

        setActiveProject: (projectId) => {
          set(() => ({ activeProjectId: projectId }))
        },
      }

      return initialState
    },
    {
      name: "minidevfun-app-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => state, // persist all
    }
  )
)

export default useAppStore


