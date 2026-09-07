"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const TooltipContext = React.createContext<{ content: string; visible: boolean }>({ content: "", visible: false });

export function TooltipProvider({ children }: { children: React.ReactNode }) {
 return <TooltipContext.Provider value={{ content: "", visible: false }}>{children}</TooltipContext.Provider>;
}

const Tooltip: React.FC<{ content: React.ReactNode; children: React.ReactNode; className?: string }> = ({ content, children, className }) => {
 const [show, setShow] = React.useState(false);
 return (
 <span className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
 {children}
 {show && <span className={cn("absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg dark:bg-zinc-800", className)}>{content}</span>}
 </span>
 );
};

export { Tooltip };
