"use client";

import { useState } from "react";
import { Code2, Camera, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { useProjectStore } from "@/hooks/stores";

import PreviewUrlToolbar from "./PreviewUrlToolbar";
import PublishModal from "./modals/PublishModal";

interface PreviewToolbarProps {
  project: any;
  onToggleCode: () => void;
}

export default function PreviewToolbar({ onToggleCode, project }: PreviewToolbarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const { toast } = useToast();
  const setProjectStatus = useProjectStore((s) => s.setProjectStatus);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "k") {
        e.preventDefault();
        onToggleCode();
      } else if (e.key === "r") {
        e.preventDefault();
        handleRefresh();
      }
    }
  };

  const handleScreenshot = () => {
    // Create a mock image and trigger download
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 576;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // background
        ctx.fillStyle = "#2563eb"; // blue-600
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // title
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px system-ui, -apple-system, Segoe UI, Roboto";
        ctx.fillText("Miniapp Preview", 48, 96);
        ctx.font = "24px system-ui, -apple-system, Segoe UI, Roboto";
        const title = project?.title ?? "Untitled";
        ctx.fillText(title, 48, 140);
      }
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${(project?.title || "preview").replace(/\s+/g, "-")}.png`;
      link.click();
      toast({ title: "Screenshot captured", description: "Image downloaded." });
    } catch (e) {
      toast({ title: "Screenshot failed", description: "Try again.", variant: "destructive" as any });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
    toast({
      title: "Preview refreshed",
      description: "Miniapp preview has been reloaded",
    });
  };

  const handlePublish = () => {
    setPublishOpen(true);
  };

  return (
    <div className="py-2 px-2">
      <div className="bg-white border rounded-md shadow-xs px-3 py-2 flex flex-col gap-3 md:flex-row items-center justify-between gap-2">
        <div className="hidden md:block text-base font-medium text-foreground">{project?.title}</div>
        <div>
          <PreviewUrlToolbar />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCode}
            title="Toggle code view (Ctrl+K)"
            className="h-8 w-8 cursor-pointer"
            aria-label="Toggle code view"
          >
            <Code2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleScreenshot}
            title="Take screenshot"
            className="h-8 w-8"
            aria-label="Take screenshot"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh preview (Ctrl+R)"
            className="h-8 w-8"
            aria-label="Refresh preview"
          >
            <RotateCcw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            // size="icon"
            onClick={handlePublish}
            title="Publish miniapp"
            className="h-8 bg-orange-500 hover:bg-orange-600 text-white"
            aria-label="Publish miniapp"
          >
            <div className="flex items-center gap-2">
              <p>{project?.status == "published" ? "Update" : "Publish"}</p>
              <Upload className="h-4 w-4" />
            </div>
          </Button>
        </div>
      </div>
      <PublishModal
        open={publishOpen}
        onOpenChange={setPublishOpen}
        status={(project?.status as any) || "draft"}
        onStatusChange={(s) => {
          if (project?.id) setProjectStatus(project.id, s === "published" ? "published" : "draft");
        }}
      />
    </div>
  );
}
