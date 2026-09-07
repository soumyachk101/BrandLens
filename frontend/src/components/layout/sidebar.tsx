"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
 LayoutDashboard,
 Tag,
 GitCompare,
 FileText,
 Users,
 Settings,
 CreditCard,
 TrendingUp,
 ChevronLeft,
 ChevronRight,
 } from "lucide-react";
import { useUIStore } from "@/store";

const navItems = [
 { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
 { label: "Brands", href: "/brands", icon: Tag },
 { label: "Competitors", href: "/competitors", icon: GitCompare },
 { label: "Reports", href: "/reports", icon: FileText },
 { label: "AI Queries", href: "/queries", icon: TrendingUp },
 { label: "Team", href: "/team", icon: Users },
 { label: "Settings", href: "/settings", icon: Settings },
 { label: "Billing", href: "/billing", icon: CreditCard },
];

export function Sidebar() {
 const collapsed = useUIStore((s) => !s.sidebarOpen);
 const toggle = useUIStore((s) => s.toggleSidebar);
 const pathname = usePathname();

 return (
 <aside className={cn("flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-200", collapsed ? "w-16" : "w-64")}>
 <div className="flex items-center justify-between p-4">
 {!collapsed && <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">B</div><span className="text-lg font-bold text-zinc-900 dark:text-white">BrandLens</span></div>}
 <button onClick={toggle} className="hidden md:flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
 {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
 </button>
 </div>
 <nav className="flex-1 px-2 py-4 space-y-1">
 {navItems.map((item) => {
 const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
 return (
 <a key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800", collapsed && "justify-center px-2")}>
 <item.icon className="h-5 w-5 shrink-0" />
 {!collapsed && <span>{item.label}</span>}
 </a>
 );
 })}
 </nav>
 {!collapsed && (
 <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
 <p className="text-xs text-zinc-400 dark:text-zinc-600">BrandLens v1.0</p>
 </div>
 )}
 </aside>
 );
}
