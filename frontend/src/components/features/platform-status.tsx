"use client";

import * as React from "react";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Platform {
 name: string;
 status: "connected" | "error" | "warning";
 lastCheck: string;
 queriesToday: number;
 latency: number;
 icon: string;
}

interface PlatformStatusProps {
 platforms: Platform[];
 onRefresh?: () => void;
 className?: string;
}

const statusConfig = {
 connected: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", label: "Connected", badge: "success" as const },
 error: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Error", badge: "danger" as const },
 warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", label: "Warning", badge: "warning" as const },
};

export function PlatformStatus({ platforms, onRefresh, className }: PlatformStatusProps) {
 const connectedCount = platforms.filter((p) => p.status === "connected").length;

 return (
 <Card className={className}>
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="flex items-center gap-2">
 Platform Status
 <Badge variant="secondary" className="text-xs">
 {connectedCount}/{platforms.length} active
 </Badge>
 </CardTitle>
 {onRefresh && (
 <Button variant="ghost" size="icon-sm" onClick={onRefresh}>
 <RefreshCw className="h-4 w-4" />
 </Button>
 )}
 </div>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {platforms.map((platform) => {
 const cfg = statusConfig[platform.status];
 const StatusIcon = cfg.icon;
 return (
 <div key={platform.name} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
 <div className="h-9 w-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
 {platform.icon}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <span className="text-sm font-medium text-gray-900">{platform.name}</span>
 <StatusIcon className={cn("h-3.5 w-3.5", cfg.color)} />
 </div>
 <div className="flex items-center gap-3 mt-1">
 <span className="text-xs text-gray-500">{platform.queriesToday} queries today</span>
 <span className="text-xs text-gray-400">·</span>
 <span className="text-xs text-gray-500">{platform.latency}ms avg</span>
 </div>
 </div>
 <Badge variant={cfg.badge} className="text-xs">{cfg.label}</Badge>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 );
}
