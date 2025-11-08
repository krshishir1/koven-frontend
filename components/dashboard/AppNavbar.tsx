"use client";

import { Menu, LogOut} from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountMenu from "./AccountMenu";
import PaymentMenu from "./PaymentMenu";
import Link from "next/link";
import { useAuthStore } from "@/hooks/stores";

import { useProjectStore } from "@/hooks/stores";

interface AppNavbarProps {
  onToggleSidebar: () => void;
}

export default function AppNavbar({ onToggleSidebar }: AppNavbarProps) {

    const projects = useProjectStore((s) => s.projects);
    const activeProjectId = useProjectStore((s) => s.activeProjectId);
    const activeProject = projects.find((el) => el.id === activeProjectId);
    const { logout } = useAuthStore();

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

        <Button
          size="icon"
          onClick={logout}
          aria-label="Log out"
          title="Log out"
          className="bg-red-500 text-white"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}
