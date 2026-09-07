"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const PopoverContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });

const Popover: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [open, setOpen] = React.useState(false);
 return <PopoverContext.Provider value={{ open, setOpen }}><div className="relative">{children}</div></PopoverContext.Provider>;
};

const PopoverTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const { setOpen } = React.useContext(PopoverContext);
 return React.cloneElement(children as React.ReactElement, { onClick: () => setOpen(true) });
};

const PopoverContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
 const { open, setOpen } = React.useContext(PopoverContext);
 React.useEffect(() => {
 if (!open) return;
 const handler = (e: MouseEvent) => { const t = e.target as HTMLElement; if (!t.closest("[data-popover-root]")) setOpen(false); };
 document.addEventListener("click", handler);
 return () => document.removeEventListener("click", handler);
 }, [open, setOpen]);
 if (!open) return null;
 return (
 <div data-popover-root className={cn("absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-md border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900", className)} {...props}>{children}</div>
 );
};

export { Popover, PopoverTrigger, PopoverContent };
