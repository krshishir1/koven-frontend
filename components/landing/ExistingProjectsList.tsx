"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Clock } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

type FetchedProject = {
  _id: string;
  title: string;
  prompt: string;
  createdAt: string;
  updatedAt: string;
};

interface ExistingProjectsListProps {
  projects: FetchedProject[];
  onProjectClick: (project: FetchedProject) => void;
  isLoading: boolean;
  isDisabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function showTimestamp(timestamp: string) {
  const str = formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true });
  return str.replace("about ", "");
}

export default function ExistingProjectsList({
  projects,
  onProjectClick,
  isLoading,
  isDisabled,
  open,
  onOpenChange,
}: ExistingProjectsListProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl bg-white backdrop-blur border border-gray-200/60 shadow-xl rounded-2xl p-0">
        {/* ---------- Header ---------- */}
        <DialogHeader className="border-b border-gray-200 px-6 py-4">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <FileText className="h-5 w-5 text-primary" />
            Your Existing Projects
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Select a project to continue working on it.
          </DialogDescription>
        </DialogHeader>

        {/* ---------- Main Content ---------- */}
        <div className="px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-gray-500 py-10 text-sm">
              No projects found. Start by creating one!
            </div>
          ) : (
            <ScrollArea
              className="max-h-[320px] overflow-y-auto rounded-md border border-gray-100/80"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#d4d4d8 transparent",
              }}
            >
              <div className="divide-y divide-gray-100/80">
                {projects.map((project) => (
                  <button
                    key={project._id}
                    onClick={() => {
                      onProjectClick(project);
                      onOpenChange(false);
                    }}
                    disabled={isDisabled}
                    className="w-full text-left flex items-start gap-3 px-2 py-2 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4 text-gray-500 mt-[2px]" />
                    <div className="flex flex-col overflow-hidden">
                      <div className="font-medium text-sm md:text-base truncate text-gray-800">
                        {project.title || "Untitled Project"}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Clock className="h-3 w-3" />
                        Updated {showTimestamp(project.updatedAt)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* ---------- Footer ---------- */}
        <DialogFooter className="border-t border-gray-200 px-6 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
