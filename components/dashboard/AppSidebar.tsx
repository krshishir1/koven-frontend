"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectAvatar } from "@/components/ui/avatar-gen";
import { useProjectStore } from "@/hooks/stores";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Files,
  Search,
  BookCheck,
  Anchor,
  MessageCircleMore,
  Bug,
  CheckCheck,
  GitBranch,
  ScanBarcode
} from "lucide-react";

// Data is loaded from zustand store

interface AppSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export default function AppSidebar({
  sidebarOpen,
  setSidebarOpen,
}: AppSidebarProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProjectGlobal = useProjectStore((s) => s.setActiveProject);
  const activeTab = useProjectStore((s) => s.activeTab);
  const setActiveTabGlobal = useProjectStore((s) => s.setActiveTab);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ensure local state mirrors store for keyboard focus logic
  const activeId = activeProjectId ?? projects[0]?.id ?? null;

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(Math.min(index + 1, projects.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(Math.max(index - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (projects[index]) setActiveProjectGlobal(projects[index].id);
    }
  };

  return (
    <div className={`flex flex-col h-full p-2 gap-2`}>
      <div className="flex items-center justify-between">
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg"
            aria-label="Create new project"
            title="Create new project"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}

        {!sidebarOpen && (
          <div className="text-sm font-semibold text-foreground">Projects</div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg"
          aria-label={sidebarOpen ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarOpen ? "Expand" : "Collapse"}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Projects list */}
      <div
        className="flex-1 flex flex-col gap-1 overflow-auto"
        role="listbox"
        aria-label="Projects list"
      >
        {/* {projects.map((project, index) => {
          const isActive = activeId === project.id;
          const isFocused = focusedIndex === index;
          return (
            <button
              key={project.id}
              onClick={() => {
                setActiveProjectGlobal(project.id);
                const params = new URLSearchParams(searchParams?.toString());
                params.set("idea", project.id);
                router.replace(`${pathname}?${params.toString()}`);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
              role="option"
              aria-selected={isActive}
              title={project.title}
              className={`h-10 ${
                sidebarOpen ? "w-10" : "w-full"
              } rounded-lg flex items-center gap-3 px-2 transition-colors outline-none ${
                isActive
                  ? `${!sidebarOpen ? "bg-secondary" : "bg-muted"} text-white`
                  : isFocused
                  ? "bg-muted/60 text-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="inline-flex items-center justify-center">
                <ProjectAvatar seed={project.title} />
              </span>
              {!sidebarOpen && (
                <span className="truncate text-sm font-medium">
                  {project.title}
                </span>
              )}
            </button>
          );
        })} */}

        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTabGlobal("chat")}
            className={`h-10 ${
              sidebarOpen ? "w-10 justify-center" : "w-full justify-start px-2"
            } rounded-lg hover:bg-secondary hover:text-white gap-3`}
            title="Chat"
          >
            <MessageCircleMore className="h-6 w-6" />
            {!sidebarOpen && <span className="text-sm">Chat bot</span>}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTabGlobal("search")}
            className={`h-10 ${
              sidebarOpen ? "w-10 justify-center" : "w-full justify-start px-2"
            } rounded-lg hover:bg-secondary hover:text-white gap-3`}
            title="Search"
          >
            <Search className="h-6 w-6" />
            {!sidebarOpen && <span className="text-sm">Search in Files</span>}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTabGlobal("compiler")}
            className={`h-10 ${
              sidebarOpen ? "w-10 justify-center" : "w-full justify-start px-2"
            } rounded-lg hover:bg-secondary hover:text-white gap-3`}
            title="Compile"
          >
            <BookCheck className="h-6 w-6" />
            {!sidebarOpen && <span className="text-sm">Compiler</span>}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTabGlobal("deploy")}
            className={`h-10 ${
              sidebarOpen ? "w-10 justify-center" : "w-full justify-start px-2"
            } rounded-lg hover:bg-secondary hover:text-white gap-3`}
            title="Deploy"
          >
            <Anchor className="h-6 w-6" />
            {!sidebarOpen && (
              <span className="text-sm">Deploy Smart Contracts</span>
            )}
          </Button>
        </>
      </div>

      {/* Settings button at bottom */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-10 ${
          sidebarOpen ? "w-10 justify-center" : "w-full justify-start px-2"
        } rounded-lg gap-3`}
        aria-label="Settings"
        title="Auditor"
      >
        <ScanBarcode className="h-5 w-5" />
        {!sidebarOpen && <span className="text-sm">Connect With Auditors</span>}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-10 ${
          sidebarOpen ? "w-10 justify-center" : "w-full justify-start px-2"
        } rounded-lg gap-3`}
        aria-label="Settings"
        title="Settings"
      >
        <Settings className="h-5 w-5" />
        {!sidebarOpen && <span className="text-sm">Settings</span>}
      </Button>
    </div>
  );
}
