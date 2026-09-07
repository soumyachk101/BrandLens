"use client";
import * as React from "react";
import { formatRelativeDate } from "@/lib/formatters";
import { AlertCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alert } from "@/lib/types";
import { useAgencyStore } from "@/store";

const severityIcons: Record<string, React.ReactNode> = { low: Info, medium: AlertTriangle, high: AlertCircle, critical: XCircle };
const severityColors: Record<string, string> = {
 low: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950",
 medium: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950",
 high: "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950",
 critical: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950",
};

export function AlertCard({ alert }: { alert: Alert }) {
 const markRead = useAgencyStore((s) => s.markAlertRead);
 const Icon = severityIcons[alert.severity] || Info;

 return (
 <div onClick={() => markRead(alert.id)} className={cn("cursor-pointer rounded-lg border p-4 transition-colors hover:shadow-sm", !alert.read && "border-l-4", severityColors[alert.severity])}>
 <div className="flex items-start gap-3">
 <Icon className="mt-0.5 h-5 w-5 shrink-0 text-zinc-600 dark:text-zinc-400" />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <span className="text-sm font-medium text-zinc-900 dark:text-white">{alert.brandName}</span>
 <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatRelativeDate(new Date(alert.createdAt))}</span>
 {!alert.read && <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
 </div>
 <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{alert.message}</p>
 </div>
 </div>
 </div>
 );
}
