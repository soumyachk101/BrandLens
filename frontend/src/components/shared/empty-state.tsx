"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode; }) {
 return (
 <div className="flex flex-col items-center justify-center py-16 text-center">
 {icon && <div className="mb-4 text-zinc-400">{icon}</div>}
 <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
 {description && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-md">{description}</p>}
 {action && <div className="mt-4">{action}</div>}
 </div>
 );
}
