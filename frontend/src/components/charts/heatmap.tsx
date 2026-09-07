"use client";
import * as React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";

interface HeatmapProps {
 data: { day: string; hour: number; value: number }[];
 hours?: string[];
 days?: string[];
 cellSize?: number;
 colorScale?: { low: string; mid: string; high: string };
}

export function Heatmap({ data, hours = Array.from({ length: 12 }, (_, i) => `${i * 2}:00`), days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], cellSize = 28, colorScale = { low: "#f3f4f6", mid: "#818cf8", high: "#4338ca" } }: HeatmapProps) {
 const max = Math.max(...data.map((d) => d.value));
 const getColor = (v: number) => {
 const t = v / max;
 if (t < 0.25) return colorScale.low;
 if (t < 0.5) return colorScale.mid;
 return colorScale.high;
 };
 return (
 <div className="overflow-x-auto">
 <div className="flex gap-1">
 <div className="flex flex-col gap-1">{hours.map((h) => <div key={h} className="flex h-7 items-center text-xs text-zinc-500 dark:text-zinc-400">{h}</div>)}</div>
 <div className="flex flex-col gap-1">
 {days.map((day) => (
 <div key={day} className="flex gap-1">
 {hours.map((h) => {
 const entry = data.find((d) => d.day === day && d.hour === parseInt(h));
 const val = entry?.value || 0;
 return <div key={h} title={`${day} ${h}: ${val}`} style={{ width: cellSize, height: 28, backgroundColor: getColor(val) }} className="rounded-sm" />;
 })}
 </div>
 ))}
 </div>
 </div>
 <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
 <span>Low</span>
 <div className="flex gap-0.5">
 <div style={{ width: cellSize, height: 14, backgroundColor: colorScale.low }} className="rounded-sm" />
 <div style={{ width: cellSize, height: 14, backgroundColor: colorScale.mid }} className="rounded-sm" />
 <div style={{ width: cellSize, height: 14, backgroundColor: colorScale.high }} className="rounded-sm" />
 </div>
 <span>High</span>
 </div>
 </div>
 );
}
