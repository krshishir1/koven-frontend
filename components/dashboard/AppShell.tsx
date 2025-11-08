"use client"

import type React from "react"

import { useState } from "react"
import AppNavbar from "./AppNavbar"
import AppSidebar from "./AppSidebar"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar hidden on mobile, visible from md+ */}
        <div className={`hidden md:flex transition-all duration-300 overflow-hidden ${sidebarOpen ? "w-16" : "w-64"} border-r border-border bg-background flex-col`}>
          <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Main content - flex-1 to take remaining space */}
        <div className="flex-1 overflow-hidden">{children}</div>

        {/* Mobile overlay drawer sidebar */}
        <div className={`md:hidden fixed inset-0 z-50 ${sidebarOpen ? "pointer-events-none" : "pointer-events-auto"}`}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity ${sidebarOpen ? "opacity-0" : "opacity-100"}`}
            onClick={() => setSidebarOpen(true)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div
            className={`absolute left-0 top-0 h-full w-[80%] max-w-xs bg-background border-r border-border shadow-xl transition-transform ${sidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
            role="dialog"
            aria-modal="true"
          >
            <AppSidebar sidebarOpen={false} setSidebarOpen={setSidebarOpen} />
          </div>
        </div>
      </div>
    </div>
  )
}
