"use client";
import * as React from "react";
import { AreaChart } from "@/components/charts/area-chart";
import type { VisibilityTrend } from "@/lib/types";

interface SentimentChartProps { data: { date: string; positive: number; neutral: number; negative: number }[]; height?: number; }

export function SentimentChart({ data, height = 300 }: SentimentChartProps) {
 return (
 <div className="space-y-2">
 <div className="flex items-center justify-center gap-4 text-xs">
 <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-green-500" />Positive</span>
 <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-zinc-400" />Neutral</span>
 <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-500" />Negative</span>
 </div>
 <AreaChart data={data.map((d) => ({ x: d.date, y: d.positive }))} color="#22c55e" height={height} />
 <AreaChart data={data.map((d) => ({ x: d.date, y: d.neutral }))} color="#a1a1aa" height={height} />
 <AreaChart data={data.map((d) => ({ x: d.date, y: d.negative }))} color="#ef4444" height={height} />
 </div>
 );
}
