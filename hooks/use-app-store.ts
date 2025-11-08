/**
 * @deprecated This store is deprecated. Please use the new stores:
 * - `useAuthStore` from "@/hooks/stores" for authentication state
 * - `useProjectStore` from "@/hooks/stores" for project state
 * 
 * This file is kept for backward compatibility but will be removed in a future version.
 * All components have been migrated to use the new stores.
 */

// Re-export types for backward compatibility
export type { UserAccount } from "./stores/authStore"
export type { Project, ProjectStatus, ChatMessage } from "./stores/projectStore"

// Re-export the new stores for easy migration
export { useAuthStore, useProjectStore } from "./stores"

// Deprecated: This hook is no longer functional. Use useAuthStore and useProjectStore instead.
export const useAppStore = () => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "useAppStore is deprecated. Please use useAuthStore and useProjectStore from '@/hooks/stores' instead."
    )
  }
  throw new Error(
    "useAppStore is deprecated. Please use useAuthStore and useProjectStore from '@/hooks/stores' instead."
  )
}

export default useAppStore


