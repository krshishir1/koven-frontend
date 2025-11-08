"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { fetchWithAuth } from "@/lib/api"; // Make sure this has 'credentials: "include"'

// 1. Updated User interface (matches new Mongoose/Passport model)
export interface UserAccount {
  _id: string; // MongoDB ID
  googleId: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  createdAt: string;
}

interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthChecked: boolean; // Flag to know we've checked the session at least once

  // 2. Renamed to 'checkSession' for clarity
  checkSession: () => Promise<void>; 
  
  // 3. Simplified login/logout
  login: () => void;
  logout: () => void;
}

// Ensure your fetchWithAuth wrapper includes credentials
// const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
//   options.credentials = "include"; // <-- THIS IS CRITICAL
//   const res = await fetch(process.env.NEXT_PUBLIC_API_URL + url, options);
//   // ... error handling
//   return res.json();
// };


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start as true until first check
      isAuthChecked: false,

      /**
       * 4. checkSession (replaces initAuth/checkAuth)
       * Calls the backend /auth/me route. The browser automatically sends
       * the HttpOnly cookie.
       */
      checkSession: async () => {
        if (get().isAuthChecked) return; // Already checked
        
        set({ isLoading: true });
        try {
          // 5. This MUST be your new Passport endpoint
          const data = await fetchWithAuth("/auth/me"); 

          if (data.ok && data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
            });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error("checkSession error:", error);
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false, isAuthChecked: true });
        }
      },

      /**
       * 6. Simplified Login
       * Just redirects to the backend. Passport handles the rest.
       * The prompt-saving logic will be in the component.
       */
      login: () => {
        // This is your backend Passport route
        window.location.href = "http://localhost:8000/auth/google";
      },

      /**
       * 7. Simplified Logout
       * Just redirects to the backend. Passport clears the session.
       */
      logout: () => {
        set({ user: null, isAuthenticated: false });
        // This is your backend Passport route
        window.location.href = "http://localhost:8000/auth/logout";
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      // 8. We only persist the user data, not auth status
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);