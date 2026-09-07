"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type ToastTone = "default" | "success" | "error" | "warning";

const ToastContext = React.createContext<{ add: (t: { id: string; title: string; description?: string; tone?: ToastTone }) => void }>({ add: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
 const [toasts, setToasts] = React.useState<{ id: string; title: string; description?: string; tone?: ToastTone }[]>([]);
 const add = (t: { id: string; title: string; description?: string; tone?: ToastTone }) => {
 setToasts((s) => [...s, t]);
 setTimeout(() => setToasts((s) => s.filter((x) => x.id !== t.id)), 4000);
 };
 return (
 <ToastContext.Provider value={{ add }}>
 {children}
 <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
 {toasts.map((t) => (
 <div key={t.id} className={cn("min-w-[360px] rounded-lg border p-4 shadow-lg dark:border-zinc-800", {
 "bg-white dark:bg-zinc-900": t.tone === "default" || !t.tone,
 "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900": t.tone === "success",
 "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900": t.tone === "error",
 "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900": t.tone === "warning",
 })}>
 <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{t.title}</div>
 {t.description && <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t.description}</div>}
 </div>
 ))}
 </div>
 </ToastContext.Provider>
 );
}

export function useToast() {
 return React.useContext(ToastContext);
}
