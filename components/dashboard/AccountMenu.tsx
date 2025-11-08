"use client";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AccountAvatar, ProfileAvatar } from "../ui/avatar-gen";
import { ChevronsUpDown } from "lucide-react";

export default function AccountMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-md hover:bg-muted"
        >
          <div className="flex items-center gap-2">
            <ProfileAvatar seed="Shishir" />
            <ChevronsUpDown className="w-8" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="md:w-64 w-56 py-2 border-secondary/30"
      >
        <DropdownMenuLabel className="flex flex-col gap-1">
          <div className="text-sm font-semibold">@minidev_user</div>
          <div className="border border-secondary/50 rounded-md p-1 mt-1">
            <div className="flex justify-between items-center">
              <div className="pl-1">
                <h2 className="text-xs text-muted-foreground">0x1234...5678</h2>
                <p className="text-xs text-secondary">Base</p>
              </div>
              <AccountAvatar seed="Shishir" />
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-secondary/30" />
        <DropdownMenuItem className="cursor-pointer rounded-md bg-card/30 backdrop-blur-md border-0 hover:bg-secondary/25 transition-colors hover:shadow-sm">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
