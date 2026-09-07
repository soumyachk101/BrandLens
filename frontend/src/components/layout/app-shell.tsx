"use client";
import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useUIStore } from "@/store";

export function AppShell({ children }: { children: React.ReactNode }) {
 const sidebarOpen = useUIStore((s) => s.sidebarOpen);

 return (
 <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950">
 <Sidebar />
 <div className="flex flex-1 flex-col overflow-hidden">
 <TopBar />
 <main className="flex-1 overflow-y-auto">
 <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
 </main>
 </div>
 <MobileNav />
 </div>
 );
}
