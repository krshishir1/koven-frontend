"use client";

import { useState, useEffect } from "react";
import ChatPanel from "@/components/dashboard/side-panels/chatbox/ChatPanel";
import SearchPanel from "@/components/dashboard/side-panels/SearchPanel";
import CompilerPanel from "@/components/dashboard/side-panels/CompilerPanel";
import DeployPanel from "@/components/dashboard/side-panels/DeployPanel";
import PreviewPanel from "@/components/dashboard/PreviewPanel";
import ProjectHeader from "@/components/dashboard/ProjectHeader";
import { useProjectStore } from "@/hooks/stores";
import MobileSwitch from "@/components/dashboard/MobileSwitch";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function DashboardLayout() {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const activeTab = useProjectStore((s) => s.activeTab);
  const [mobileView, setMobileView] = useState<"chat" | "preview">("chat");

  // Get the active project
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const projectId = activeProject?.id || "";
  const initialMessage = activeProject?.idea || null;

  // Set active project to first project if none is selected
  useEffect(() => {
    if (!activeProjectId && projects.length > 0) {
      setActiveProject(projects[0].id);
    }
  }, [activeProjectId, projects, setActiveProject]);

  // Render the active panel based on activeTab
  const renderActivePanel = () => {
    switch (activeTab) {
      case "chat":
        return <ChatPanel initialMessage={initialMessage} projectId={projectId} />;
      case "search":
        return <SearchPanel />;
      case "compiler":
        return <CompilerPanel />;
      case "deploy":
        return <DeployPanel />;
      default:
        return <ChatPanel initialMessage={initialMessage} projectId={projectId} />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile switcher */}
      <MobileSwitch
        projectId={projectId}
        view={mobileView}
        onChange={setMobileView}
      />

      {/* Desktop layout */}
      <div className="hidden md:block h-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 flex overflow-hidden gap-0 h-full"
        >
          <ResizablePanel minSize={25} defaultSize={25} maxSize={40}>
            {renderActivePanel()}
          </ResizablePanel>
          <ResizableHandle
            className="bg-transparent"
            withHandle
          ></ResizableHandle>
          <ResizablePanel defaultSize={75}>
            <PreviewPanel projectId={projectId} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex-1 overflow-hidden">
        {mobileView === "chat" ? (
          renderActivePanel()
        ) : (
          <PreviewPanel projectId={projectId} />
        )}
      </div>
      {/* <div >
        </div> */}
    </div>
  );
}
