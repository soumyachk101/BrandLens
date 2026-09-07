"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
 Home,
 Tag,
 GitCompare,
 FileText,
 Users,
 Settings,
 CreditCard,
 Menu,
 X,
 TrendingUp,
} from "lucide-react";
import { useUIStore } from "@/store";
import { cn } from "@/lib/utils";

const navItems = [
 { label: "Dashboard", href: "/dashboard", icon: Home },
 { label: "Brands", href: "/brands", icon: Tag },
 { label: "Competitors", href: "/competitors", icon: GitCompare },
 { label: "Reports", href: "/reports", icon: FileText },
 { label: "AI Queries", href: "/queries", icon: TrendingUp },
 { label: "Team", href: "/team", icon: Users },
 { label: "Settings", href: "/settings", icon: Settings },
 { label: "Billing", href: "/billing", icon: CreditCard },
];

export function MobileNav() {
 const [open, setOpen] = React.useState(false);
 const pathname = usePathname();
 const close = () => setOpen(false);

 return (
 <>
 <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></Button>
 {open && (
 <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-900 md:hidden">
 <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
 <span className="text-lg font-bold text-zinc-900 dark:text-white">BrandLens</span>
 <Button variant="ghost" size="icon" onClick={close}><X className="h-5 w-5" /></Button>
 </div>
 <nav className="p-4 space-y-1">
 {navItems.map((item) => {
 const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
 return (
 <a key={item.href} href={item.href} onClick={close} className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium", isActive ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800")}>
 <item.icon className="h-5 w-5" />
 {item.label}
 </a>
 );
 })}
 </nav>
 </div>
 )}
 </>
 );
}
