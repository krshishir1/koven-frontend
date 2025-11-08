"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import TopUpModal from "./modals/TopupModal";
import PublishModal from "./modals/PublishModal";
import useAppStore from "@/hooks/use-app-store";

type PublishStatus = "draft" | "published" | "error" | "ready";

interface PublishButtonProps {
  publishStatus: PublishStatus;
  setPublishOpen: (open: boolean) => void;
}

interface PaymentMenuProps {
    project: any;
}

export default function PaymentMenu({project} : PaymentMenuProps) {
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const status: PublishStatus = (project?.status as PublishStatus) || "draft";

  const statusMap: Record<
    PublishStatus,
    { label: string; className: string; disabled?: boolean }
  > = {
    draft: {
      label: "Draft",
      className: "bg-muted hover:bg-muted/80 text-muted-foreground",
    },
    published: {
      label: "Published",
      className: "bg-secondary hover:bg-purple-700 text-white",
    },
    error: {
      label: "Failed",
      className: "bg-red-500 hover:bg-red-600 text-white",
    },
    ready: {
        label: "Ready",
        className: "bg-muted hover:bg-muted/80 text-muted-foreground",
    }
  };

  const pStatus = statusMap[status];
  console.log(status, pStatus)


  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTopUpOpen(true)}
          className="h-7 px-2 text-[11px] sm:h-8 sm:px-3 sm:text-xs"
        >
          Top Up
        </Button>
        <Button
          size="sm"
          className={`${pStatus.className} hover:cursor-pointer h-7 px-2 text-[11px] sm:h-8 sm:px-3 sm:text-xs`}
        //   onClick={() => setPublishOpen(true)}
          disabled={pStatus?.disabled ? pStatus.disabled : false}
        >
          {pStatus.label}
        </Button>
      </div>

      <TopUpModal open={topUpOpen} onOpenChange={setTopUpOpen} />
      {/* <PublishModal
        open={publishOpen}
        onOpenChange={setPublishOpen}
        status={status}
        onStatusChange={(s) => {
          if (project?.id) setProjectStatus(project.id, s === "published" ? "published" : "draft");
        }}
      /> */}
    </>
  );
}
