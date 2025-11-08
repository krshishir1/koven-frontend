"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountMenu from "./AccountMenu";
import PaymentMenu from "./PaymentMenu";
import Link from "next/link";

import useAppStore from "@/hooks/use-app-store";

interface AppNavbarProps {
  onToggleSidebar: () => void;
}

export default function AppNavbar({ onToggleSidebar }: AppNavbarProps) {

    const {projects, activeProjectId} = useAppStore()
    const activeProject = projects.find((el) => el.id === activeProjectId);

  return (
    <nav
      className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 h-12 flex items-center justify-between px-4"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {/* <div className="text-xl font-bold text-foreground">Minidev</div> */}
        <div className="flex items-center gap-1">
          <Link href={"/"} className="flex items-center gap-1 cursor-pointer">
            <img src="/minidevfun.png" alt="Minidev" className="w-12" />

        
            {/* <span className="text-xl font-bold text-foreground">Minidev</span> */}
          </Link>
          <p className="text-base font-normal text-neutral-200">/</p>
          <AccountMenu />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <PaymentMenu project={activeProject} />
      </div>
    </nav>
  );
}
