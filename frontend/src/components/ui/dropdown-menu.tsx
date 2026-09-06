import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
 trigger: React.ReactNode;
 children: React.ReactNode;
 align?: "start" | "end" | "center";
}

function DropdownMenu({ trigger, children, align = "end" }: DropdownMenuProps) {
 const [open, setOpen] = React.useState(false);
 const ref = React.useRef<HTMLDivElement>(null);

 React.useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (ref.current && !ref.current.contains(event.target as Node)) {
 setOpen(false);
 }
 };
 const handleEscape = (event: KeyboardEvent) => {
 if (event.key === "Escape") setOpen(false);
 };
 document.addEventListener("mousedown", handleClickOutside);
 document.addEventListener("keydown", handleEscape);
 return () => {
 document.removeEventListener("mousedown", handleClickOutside);
 document.removeEventListener("keydown", handleEscape);
 };
 }, []);

 return (
 <div className="relative" ref={ref}>
 <div onClick={() => setOpen(!open)}>{trigger}</div>
 {open && (
 <div
 className={cn(
 "absolute z-50 min-w-[8rem] rounded-md border bg-white dark:bg-slate-900 shadow-lg animate-fade-in",
 align === "end" && "right-0",
 align === "start" && "left-0",
 "mt-1"
 )}
 role="menu"
 >
 <div className="py-1">{children}</div>
 </div>
 )}
 </div>
 );
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
 onSelect?: () => void;
}

function DropdownMenuItem({ className, onSelect, children, ...props }: DropdownMenuItemProps) {
 return (
 <div
 className={cn(
 "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
 className
 )}
 onClick={() => { onSelect?.(); setOpen(false); }}
 {...props}
 >
 {children}
 </div>
 );
}

interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
 return <div className={cn("h-px bg-border my-1", className)} {...props} />;
}

export { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator };
