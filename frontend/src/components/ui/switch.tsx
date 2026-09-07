"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({ checked, onCheckedChange, className, ...props }: { checked: boolean; onCheckedChange: (v: boolean) => void; className?: string; }) {
 return (
 <button role="switch" aria-checked={checked} onClick={() => onCheckedChange(!checked)} className={cn("relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", checked ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700", className)} {...props}>
 <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform", checked ? "translate-x-5" : "translate-x-0")} />
 </button>
 );
}
