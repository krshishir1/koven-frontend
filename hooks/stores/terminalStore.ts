import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface TerminalLog {
  id: string;
  message: string;
  timestamp: number;
  type?: "info" | "success" | "error" | "warning";
}

interface TerminalState {
  logs: TerminalLog[];
  addLog: (message: string, type?: TerminalLog["type"]) => void;
  clearLogs: () => void;
}

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set) => ({
      logs: [
        {
          id: "1",
          message: "Welcome to Kovin IDE ⚡",
          timestamp: Date.now(),
          type: "info",
        },
        {
          id: "2",
          message: "Run: compile or deploy your contract...",
          timestamp: Date.now(),
          type: "info",
        },
      ],
      addLog: (message, type = "info") => {
        const log: TerminalLog = {
          id: `log_${Date.now()}_${Math.random()}`,
          message,
          timestamp: Date.now(),
          type,
        };
        set((state) => ({
          logs: [...state.logs, log],
        }));
      },
      clearLogs: () => {
        set({ logs: [] });
      },
    }),
    {
      name: "terminal-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

