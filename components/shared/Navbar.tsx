'use client'

import { LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "../ui/button"
import { useAuthStore } from "@/hooks/stores";

export default function Navbar() {
  const { logout } = useAuthStore();
  return (
    <nav className="border-b border-border bg-white/30 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-foreground">
          <div className="flex items-center gap-1 sm:gap-2">
            <img src="/minidevfun-tsp.png" alt="Minidev" className="w-9 sm:w-12" />
            <span className="hidden sm:inline text-xl font-bold text-foreground">Minidev</span>
          </div>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="https://x.com/minidevfun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            X
          </Link>
          <Link
            href="https://farcaster.xyz/minidev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Farcaster
          </Link>
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
      </div>
    </nav>
  )
}