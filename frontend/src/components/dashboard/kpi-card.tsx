"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
 label: string;
 value: string | number;
 trend?: number;
 prefix?: string;
 suffix?: string;
 icon?: React.ReactNode;
 className?: string;
}

export function KPICard({ label, value, trend, prefix, suffix, icon, className }: KPICardProps) {
 const trendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
 const trendColor = trend === undefined ? "" : trend > 0 ? "text-green-600 dark:text-green-400" : trend < 0 ? "text-red-600 dark:text-red-400" : "text-zinc-500";

 return (
 <div className={cn("rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900", className)}>
 <div className="flex items-center justify-between">
 <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
 {icon && <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>}
 </div>
 <div className="mt-2 flex items-end justify-between">
 <p className="text-2xl font-bold text-zinc-900 dark:text-white">{prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}</p>
 {trend !== undefined && trendIcon && (
 <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
 {React.cloneElement(trendIcon, { className: "h-3 w-3" })}
 <span>{Math.abs(trend)}%</span>
 </div>
 )}
 </div>
 </div>
 );
}
