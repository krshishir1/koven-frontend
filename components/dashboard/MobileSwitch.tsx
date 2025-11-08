"use client";

import { useProjectStore } from "@/hooks/stores";

interface MobileSwitchProps {
  projectId: string;
  view: "chat" | "preview";
  onChange: (view: "chat" | "preview") => void;
}

export default function MobileSwitch({ projectId, view, onChange }: MobileSwitchProps) {
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));

  return (
    <div className="md:hidden border-b border-border bg-white sticky z-40">
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="text-sm font-medium truncate">{project?.title ?? "Untitled"}</div>
        <div className="inline-flex rounded-md overflow-hidden border">
          <button
            className={`px-3 py-1.5 text-sm ${view === "chat" ? "bg-primary text-white" : "bg-white text-foreground"}`}
            onClick={() => onChange("chat")}
          >
            Chat
          </button>
          <button
            className={`px-3 py-1.5 text-sm border-l ${view === "preview" ? "bg-primary text-white" : "bg-white text-foreground"}`}
            onClick={() => onChange("preview")}
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}


