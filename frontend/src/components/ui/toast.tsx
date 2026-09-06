import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const toastVariants = cva(
 "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
 {
 variants: {
 variant: {
 default: "border bg-white text-slate-950",
 destructive:
 "destructive group border-destructive bg-destructive text-destructive-foreground",
 success:
 "border-success bg-white text-slate-950",
 warning:
 "border-warning bg-white text-slate-950",
 },
 },
 defaultVariants: {
 variant: "default",
 },
 }
);

interface ToastProps {
 id?: string;
 title?: string;
 description?: string;
 variant?: VariantProps<typeof toastVariants>["variant"];
 open?: boolean;
 onOpenChange?: (open: boolean) => void;
 action?: React.ReactNode;
}

const Toast = ({ title, description, variant, open, onOpenChange }: ToastProps) => {
 React.useEffect(() => {
 if (open && onOpenChange) {
 const timer = setTimeout(() => onOpenChange(false), 5000);
 return () => clearTimeout(timer);
 }
 }, [open, onOpenChange]);

 if (!open) return null;

 return (
 <div
 className={cn(
 "fixed top-4 right-4 z-[100] w-full max-w-sm animate-fade-in",
 )}
 >
 <div className={cn(toastVariants({ variant }))}>
 <div className="grid gap-1">
 {title && <div className="text-sm font-semibold">{title}</div>}
 {description && (
 <div className="text-sm opacity-90">{description}</div>
 )}
 </div>
 <button
 onClick={() => onOpenChange?.(false)}
 className="absolute right-2 top-2 rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
 >
 <X className="h-4 w-4" />
 <span className="sr-only">Close</span>
 </button>
 </div>
 </div>
 );
};

// Simple toast store
const toastListeners = new Set<(toast: Omit<ToastProps, "id"> & { id: string }) => void>();
let toastId = 0;

export function toast(options: Omit<ToastProps, "id"> & { id?: string }) {
 const id = options.id || `toast-${++toastId}`;
 const toastData = { ...options, id };
 toastListeners.forEach((listener) => listener(toastData));
 return { id };
}

export function useToast() {
 const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([]);

 React.useEffect(() => {
 const listener = (data: Omit<ToastProps, "id"> & { id: string }) => {
 setToasts((prev) => [...prev, data as ToastProps & { id: string }]);
 };
 toastListeners.add(listener);
 return () => { toastListeners.delete(listener); };
 }, []);

 const dismiss = React.useCallback((id: string) => {
 setToasts((prev) => prev.filter((t) => t.id !== id));
 }, []);

 return { toasts, dismiss };
}

export { Toast };
