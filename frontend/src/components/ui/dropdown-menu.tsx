"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });

const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [open, setOpen] = React.useState(false);
 return (
 <DropdownContext.Provider value={{ open, setOpen }}>
 <div className="relative inline-block">{children}</div>
 </DropdownContext.Provider>
 );
};

const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({ asChild, children }) => {
 const { open, setOpen } = React.useContext(DropdownContext);
 return React.cloneElement(children as React.ReactElement, { onClick: () => setOpen(!open) });
};

const DropdownMenuContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
 const { open, setOpen } = React.useContext(DropdownContext);
 React.useEffect(() => {
 if (!open) return;
 const handler = (e: MouseEvent) => {
 const t = e.target as HTMLElement;
 if (!t.closest("[data-dropdown-root]")) setOpen(false);
 };
 document.addEventListener("click", handler);
 return () => document.removeEventListener("click", handler);
 }, [open, setOpen]);
 if (!open) return null;
 return (
 <div data-dropdown-root className={cn("absolute right-0 mt-2 min-w-[12rem] overflow-hidden rounded-md border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900", className)} {...props}>
 {children}
 </div>
 );
};

const DropdownMenuItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
 <div className={cn("relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800", className)} {...props} />
);
const DropdownMenuLabel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
 <div className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
);
const DropdownMenuSeparator: React.FC = () => <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />;

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator };
