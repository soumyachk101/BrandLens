"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
 variant?: "default" | "outline" | "success" | "warning" | "error" | "neutral";
}

const Badge: React.FC<BadgeProps> = ({ className, variant = "default", ...props }) => (
 <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
 {
 "border-transparent bg-indigo-600 text-white": variant === "default",
 "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300": variant === "outline",
 "border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300": variant === "success",
 "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300": variant === "warning",
 "border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300": variant === "error",
 "border-transparent bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300": variant === "neutral",
 }, className)} {...props} />
);

export { Badge };
