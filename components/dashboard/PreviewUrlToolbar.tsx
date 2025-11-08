"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Monitor,
  Tablet,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react";

type DeviceType = "Desktop" | "Tablet" | "Phone";

export default function PreviewUrlToolbar() {
  const [device, setDevice] = React.useState<DeviceType>("Desktop");

  const deviceOptions: { label: DeviceType; icon: React.ReactNode }[] = [
    { label: "Desktop", icon: <Monitor className="w-4 h-4 mr-2" /> },
    { label: "Tablet", icon: <Tablet className="w-4 h-4 mr-2" /> },
    { label: "Phone", icon: <Smartphone className="w-4 h-4 mr-2" /> },
  ];

  const project_url = "app.minidevfun.com/project-1"

  return (
    <div className="flex w-64 items-center gap-2 px-3 py-0.5 bg-muted border-b rounded-sm">
      {/* Device selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 h-8 rounded-md hover:bg-accent focus:outline-none focus:ring-0 text-sm px-2"
          >
            {device === "Desktop" && <Monitor className="w-4 h-4" strokeWidth={2} />}
            {device === "Tablet" && <Tablet className="w-4 h-4" strokeWidth={2} />}
            {device === "Phone" && <Smartphone className="w-4 h-4" strokeWidth={2} />}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-40 rounded-xl p-1">
          {deviceOptions.map((opt) => (
            <DropdownMenuItem
              key={opt.label}
              onClick={() => setDevice(opt.label)}
              className="flex items-center justify-between cursor-pointer px-2 py-1.5 rounded-lg"
            >
              <div className="flex items-center">
                {opt.icon}
                <span>{opt.label}</span>
              </div>
              {device === opt.label && (
                <Check className="w-4 h-4 text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* URL bar */}
      <div className="flex-1 flex items-center h-8 bg-background border rounded-sm px-3 text-sm text-muted-foreground opacity-80 truncate">
        {project_url}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button className="hover:text-primary">
          <ExternalLink className="w-3" strokeWidth={2.5} />
        </button>
        <button className="hover:text-primary">
          <Copy className="w-3" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
