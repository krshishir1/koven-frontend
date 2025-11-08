import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface UserAccount {
  id: string
  name: string
  email?: string
  avatarUrl: string
  credits: number
}

interface AuthState {
  user: UserAccount | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: UserAccount) => void
  updateUser: (updates: Partial<UserAccount>) => void
  updateCredits: (credits: number) => void
  login: () => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

// Auth0 login handler - opens Auth0 popup
const handleAuth0Login = async (): Promise<UserAccount> => {
  // This will be called when user needs to authenticate
  // In a real implementation, this would open Auth0 popup
  // For now, we'll use a mock implementation that can be replaced
  
  return new Promise((resolve) => {
    // Simulate Auth0 popup opening
    // In production, replace this with actual Auth0 SDK call:
    // import { useUser } from '@auth0/nextjs-auth0/client';
    // const { user, error, isLoading } = useUser();
    
    // Mock implementation - replace with actual Auth0
    setTimeout(() => {
      resolve({
        id: `user_${Date.now()}`,
        name: "Authenticated User",
        email: "user@example.com",
        avatarUrl: "/minidevfun.png",
        credits: 100,
      })
    }, 500)
  })
}

// Auth0 logout handler
const handleAuth0Logout = async (): Promise<void> => {
  // In production, replace with actual Auth0 logout:
  // await fetch('/api/auth/logout', { method: 'POST' });
  return Promise.resolve()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => {
        set({ user, isAuthenticated: true, isLoading: false })
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
      },

      updateCredits: (credits) => {
        set((state) => ({
          user: state.user ? { ...state.user, credits } : null,
        }))
      },

      login: async () => {
        set({ isLoading: true })
        try {
          const user = await handleAuth0Login()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          console.error("Login failed:", error)
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await handleAuth0Logout()
          set({ user: null, isAuthenticated: false, isLoading: false })
        } catch (error) {
          console.error("Logout failed:", error)
          set({ isLoading: false })
          throw error
        }
      },

      checkAuth: async () => {
        const state = get()
        if (state.isAuthenticated && state.user) {
          return true
        }
        // If not authenticated, try to login
        try {
          await get().login()
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: "auth-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

