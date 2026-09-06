"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
 LayoutDashboard,
 Building2,
 Search,
 FileText,
 Settings,
 LogOut,
 ChevronLeft,
 ChevronRight,
 Sparkles,
 Bell,
 User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
 { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
 { href: "/brands", label: "Brands", icon: Building2 },
 { href: "/queries", label: "Queries", icon: Search },
 { href: "/reports", label: "Reports", icon: FileText },
 { href: "/settings", label: "Settings", icon: Settings },
];

interface DashboardShellProps {
 children: React.ReactNode;
 title?: string;
 description?: string;
}

export function DashboardShell({ children, title = "Dashboard", description }: DashboardShellProps) {
 const pathname = usePathname();
 const [collapsed, setCollapsed] = React.useState(false);

 return (
 <div className="flex h-screen bg-gray-50/50">
 {/* Sidebar */}
 <aside
 className={cn(
 "flex flex-col border-r border-gray-200 bg-white transition-all duration-300",
 collapsed ? "w-[72px]" : "w-[240px]"
 )}
 >
 {/* Logo */}
 <div className="flex h-16 items-center gap-2 px-4 border-b border-gray-100">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 flex-shrink-0">
 <Sparkles className="h-5 w-5 text-white" />
 </div>
 {!collapsed && <span className="font-bold text-gray-900">BrandLens</span>}
 </div>

 {/* Nav */}
 <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
 {navItems.map((item) => {
 const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
 return (
 <Link
 key={item.href}
 href={item.href}
 className={cn(
 "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
 isActive
 ? "bg-brand-50 text-brand-700"
 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
 )}
 >
 <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-brand-500")} />
 {!collapsed && <span>{item.label}</span>}
 </Link>
 );
 })}
 </nav>

 {/* Bottom */}
 <div className="border-t border-gray-100 p-3 space-y-1">
 <button
 onClick={() => setCollapsed(!collapsed)}
 className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 w-full"
 >
 {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
 </button>
 <Link
 href="#"
 className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
 >
 <LogOut className="h-4 w-4 flex-shrink-0" />
 {!collapsed && <span>Sign Out</span>}
 </Link>
 </div>
 </aside>

 {/* Main Content */}
 <div className="flex flex-1 flex-col min-w-0">
 {/* Top Bar */}
 <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
 <div>
 <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
 {description && <p className="text-sm text-gray-500">{description}</p>}
 </div>
 <div className="flex items-center gap-3">
 <button className="relative rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
 <Bell className="h-5 w-5" />
 <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500" />
 </button>
 <div className="flex items-center gap-3">
 <div className="text-right hidden sm:block">
 <p className="text-sm font-medium text-gray-900">Sarah Chen</p>
 <p className="text-xs text-gray-500">Pro Plan</p>
 </div>
 <Avatar className="h-9 w-9 border-2 border-brand-100">
 <AvatarFallback className="bg-brand-100 text-brand-700 text-sm font-medium">SC</AvatarFallback>
 </Avatar>
 </div>
 </div>
 </header>
 {/* Page Content */}
 <main className="flex-1 overflow-y-auto p-6">{children}</main>
 </div>
 </div>
 );
}
