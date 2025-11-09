"use client";

import { useEffect } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronsUpDown } from "lucide-react";
import { useAuthStore } from "@/hooks/stores";

export default function AccountMenu() {
  const { user, isAuthenticated, checkSession, logout, isLoading } = useAuthStore();

  useEffect(() => {
    checkSession(); // runs only once on mount
  }, [checkSession]);

  if (isLoading) {
    return (
      <Button variant="ghost" disabled>
        Loading...
      </Button>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Button
        variant="outline"
        onClick={() => (window.location.href = "http://localhost:8000/auth/google")}
      >
        Login with Google
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-md hover:bg-muted">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user.name}</span>
            <ChevronsUpDown className="w-4 h-4 opacity-60" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="md:w-64 w-56 py-2 border-secondary/30"
      >
        <DropdownMenuLabel className="flex flex-col gap-1">
          <div className="text-sm font-semibold">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>

          <div className="border border-secondary/50 rounded-md p-1 mt-2">
            <div className="flex justify-between items-center">
              <div className="pl-1">
                <h2 className="text-xs text-muted-foreground">0x1234...5678</h2>
                <p className="text-xs text-secondary">Base</p>
              </div>
              <Avatar className="w-6 h-6">
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-secondary/30" />

        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer rounded-md bg-card/30 backdrop-blur-md border-0 hover:bg-secondary/25 transition-colors hover:shadow-sm"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
