import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
 if (!open) return null;
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center">
 <div
 className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
 onClick={() => onOpenChange(false)}
 />
 <div className="relative z-50 w-full max-w-lg mx-4 animate-fade-in">
 {children}
 </div>
 </div>
 );
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function DialogContent({ className, children, ...props }: DialogContentProps) {
 return (
 <div
 className={cn(
 "relative bg-white dark:bg-slate-900 rounded-lg border shadow-lg max-h-[90vh] overflow-y-auto",
 className
 )}
 {...props}
 >
 <button
 onClick={() => {}}
 className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
 >
 <X className="h-4 w-4" />
 <span className="sr-only">Close</span>
 </button>
 {children}
 </div>
 );
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function DialogHeader({ className, ...props }: DialogHeaderProps) {
 return (
 <div
 className={cn(
 "flex flex-col space-y-1.5 p-6 pb-4 border-b",
 className
 )}
 {...props}
 />
 );
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

function DialogTitle({ className, ...props }: DialogTitleProps) {
 return (
 <h2
 className={cn("text-lg font-semibold leading-none tracking-tight", className)}
 {...props}
 />
 );
}

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
 return (
 <p
 className={cn("text-sm text-muted-foreground", className)}
 {...props}
 />
 );
}

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

function DialogFooter({ className, ...props }: DialogFooterProps) {
 return (
 <div
 className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-6 pt-4 border-t", className)}
 {...props}
 />
 );
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
