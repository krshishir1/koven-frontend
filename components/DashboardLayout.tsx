"use client";

import { useState, useEffect, use } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ChatPanel from "@/components/dashboard/ChatPanel";
import PreviewPanel from "@/components/dashboard/PreviewPanel";
import ProjectHeader from "@/components/dashboard/ProjectHeader";
import useAppStore from "@/hooks/use-app-store";
import MobileSwitch from "@/components/dashboard/MobileSwitch";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function DashboardLayout({
  searchParams: params,
}: {
  searchParams: Promise<{ idea?: string }>;
}) {
  const ideaParam = params?.idea
//   const ideaParam = searchParams.get("idea");
  const router = useRouter();
  const pathname = usePathname();
  const [projectId, setProjectId] = useState("");
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const projects = useAppStore((s) => s.projects);
  const setActiveProject = useAppStore((s) => s.setActiveProject);
  const [mobileView, setMobileView] = useState<"chat" | "preview">("chat");

  // On mount or when projects change, default to first project if none selected
  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0].id);
      setActiveProject(projects[0].id);
    }
  }, [projects, projectId, setActiveProject]);

  // If idea param exists, treat it as a project id if it matches; else as initial message
  useEffect(() => {
    let match;
    if (!ideaParam) match = projects[0];
    else match = projects.find((p) => p.id === ideaParam);
    if (match) {
      setProjectId(match.id);
      setActiveProject(match.id);
      setInitialMessage(match.idea);
    } else {
      router.replace("/");
    }
  }, [ideaParam, projects, setActiveProject, router, pathname]);

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
            <ChatPanel initialMessage={initialMessage} projectId={projectId} />
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
          <ChatPanel initialMessage={initialMessage} projectId={projectId} />
        ) : (
          <PreviewPanel projectId={projectId} />
        )}
      </div>
      {/* <div >
        </div> */}
    </div>
  );
}
