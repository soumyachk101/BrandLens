"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useUIStore, useAgencyStore } from "@/store";

export function TopBar() {
 const toggleSidebar = useUIStore((s) => s.toggleSidebar);
 const alerts = useAgencyStore((s) => s.alerts);
 const unreadCount = alerts.filter((a) => !a.read).length;
 const pathname = usePathname();

 return (
 <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 md:px-6">
 <div className="flex items-center gap-4">
 <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}><Menu className="h-5 w-5" /></Button>
 <h1 className="hidden md:block text-lg font-semibold text-zinc-900 dark:text-white capitalize">{pathname?.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}</h1>
 </div>
 <div className="flex items-center gap-3">
 <div className="hidden lg:block">
 <Input placeholder="Search..." className="h-9 w-64" />
 </div>
 <Button variant="ghost" size="icon" className="relative">
 <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
 {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">{unreadCount}</span>}
 </Button>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" className="relative h-9 gap-2">
 <Avatar name="Sarah Chen" size="sm" />
 <span className="hidden lg:block text-sm font-medium text-zinc-700 dark:text-zinc-300">Sarah Chen</span>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuLabel>My Account</DropdownMenuLabel>
 <DropdownMenuSeparator />
 <DropdownMenuItem>Profile</DropdownMenuItem>
 <DropdownMenuItem>Settings</DropdownMenuItem>
 <DropdownMenuItem>Billing</DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem>Log out</DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </header>
 );
}
