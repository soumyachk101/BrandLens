"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const SheetContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });

const Sheet: React.FC<{ open?: boolean; onOpenChange?: (v: boolean) => void; children: React.ReactNode }> = ({ open: controlledOpen, onOpenChange, children }) => {
 const [internalOpen, setInternalOpen] = React.useState(false);
 const open = controlledOpen ?? internalOpen;
 const setOpen = onOpenChange ?? setInternalOpen;
 return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
};

const SheetTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const { setOpen } = React.useContext(SheetContext);
 return React.cloneElement(children as React.ReactElement, { onClick: () => setOpen(true) });
};

const SheetContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" | "top" | "bottom" }> = ({ className, children, side = "right", ...props }) => {
 const { open, setOpen } = React.useContext(SheetContext);
 if (!open) return null;
 const positions = { left: "left-0 top-0 h-full w-80", right: "right-0 top-0 h-full w-80", top: "top-0 left-0 w-full h-80", bottom: "bottom-0 left-0 w-full h-80" };
 return (
 <div className="fixed inset-0 z-50">
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
 <div className={cn("fixed z-50 bg-white p-6 shadow-lg dark:bg-zinc-900 transition-transform", positions[side], className)} {...props}>{children}</div>
 </div>
 );
};

const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => <div className={cn("flex flex-col space-y-1.5", className)} {...props} />;
const SheetTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => <h2 className={cn("text-lg font-semibold", className)} {...props} />;
const SheetDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => <p className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)} {...props} />;
const SheetFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)} {...props} />;

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter };
