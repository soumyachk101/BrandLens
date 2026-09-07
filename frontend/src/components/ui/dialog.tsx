"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const DialogContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });

const Dialog: React.FC<{ open?: boolean; onOpenChange?: (v: boolean) => void; children: React.ReactNode }> = ({ open: controlledOpen, onOpenChange, children }) => {
 const [internalOpen, setInternalOpen] = React.useState(false);
 const open = controlledOpen ?? internalOpen;
 const setOpen = onOpenChange ?? setInternalOpen;
 return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
};

const DialogTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const { setOpen } = React.useContext(DialogContext);
 return React.cloneElement(children as React.ReactElement, { onClick: () => setOpen(true) });
};

const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { showClose?: boolean }> = ({ className, children, showClose = true, ...props }) => {
 const { open, setOpen } = React.useContext(DialogContext);
 if (!open) return null;
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center">
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
 <div className={cn("relative z-50 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900", className)} {...props}>
 {showClose && (<button onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"><span className="sr-only">Close</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>)}
 {children}
 </div>
 </div>
 );
};

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
 <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
 <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
);
const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
 <p className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)} {...props} />
);
const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
 <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
