"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
 label: string;
 value: number;
 max?: number;
 color?: "indigo" | "green" | "amber" | "red";
 size?: "sm" | "md" | "lg";
}

export function ScoreCard({ label, value, max = 100, color = "indigo", size = "md" }: ScoreCardProps) {
 const sizeClasses = { sm: "h-16 w-16", md: "h-24 w-24", lg: "h-32 w-32" };
 const fontSize = { sm: "text-xs", md: "text-sm", lg: "text-base" };
 const strokeWidth = { sm: 4, md: 6, lg: 8 };
 const radius = { sm: 24, md: 40, lg: 52 };
 const circumference = 2 * Math.PI * radius[size];
 const percent = Math.min(value / max, 1);
 const offset = circumference - percent * circumference;

 const colors = {
 indigo: { track: "text-zinc-200 dark:text-zinc-700", fill: "text-indigo-600 dark:text-indigo-500" },
 green: { track: "text-zinc-200 dark:text-zinc-700", fill: "text-green-600 dark:text-green-500" },
 amber: { track: "text-zinc-200 dark:text-zinc-700", fill: "text-amber-600 dark:text-amber-500" },
 red: { track: "text-zinc-200 dark:text-zinc-700", fill: "text-red-600 dark:text-red-500" },
 };

 return (
 <div className="flex flex-col items-center gap-2">
 <div className={cn("relative", sizeClasses[size])}>
 <svg className={cn("h-full w-full -rotate-90", colors[color].track)}>
 <circle cx="50%" cy="50%" r={radius[size]} fill="none" stroke="currentColor" strokeWidth={strokeWidth[size]} />
 </svg>
 <svg className={cn("absolute inset-0 h-full w-full -rotate-90", colors[color].fill)} style={{ overflow: "visible" }}>
 <circle cx="50%" cy="50%" r={radius[size]} fill="none" stroke="currentColor" strokeWidth={strokeWidth[size]} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
 </svg>
 <div className={cn("absolute inset-0 flex flex-col items-center justify-center text-zinc-900 dark:text-white", fontSize[size])}>
 <span className="font-bold">{value.toFixed(1)}</span>
 </div>
 </div>
 <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
 </div>
 );
}
