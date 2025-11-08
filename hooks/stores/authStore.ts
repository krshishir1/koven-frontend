"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { fetchWithAuth } from "@/lib/api";

export interface UserAccount {
  sid?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  name: string;
  picture?: string;
  updated_at?: string;
  email: string;
  email_verified?: boolean;
  sub: string;
}

interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  checkAuth: () => Promise<boolean>;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const data = await fetchWithAuth("auth//api/user");
          if (data.authenticated && data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return false;
          }
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return false;
        }
      },

      login: () => {
        window.location.href = "http://localhost:8000/login";
      },

      logout: () => {
        window.location.href = "http://localhost:8000/logout";
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
