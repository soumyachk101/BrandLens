"use client";
import * as React from "react";
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LineChartProps {
 data: { x: string | number; y: number; [k: string]: any }[];
 xKey?: string;
 yKey?: string;
 lines?: { dataKey: string; stroke?: string; name?: string }[];
 height?: number;
}

export function LineChart({ data, xKey = "x", yKey = "y", lines, height = 300 }: LineChartProps) {
 const defaultLines = [{ dataKey: yKey, stroke: "#6366F1" }];
 const chartLines = lines || defaultLines.map((l) => ({ ...l, dataKey: l.dataKey || yKey }));
 return (
 <ResponsiveContainer width="100%" height={height}>
 <RechartsLine data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" />
 <XAxis dataKey={xKey} stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
 <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
 <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", background: "white" }} />
 {chartLines.map((line, i) => <Line key={i} type="monotone" dataKey={line.dataKey} stroke={line.stroke || "#6366F1"} strokeWidth={2} dot={false} name={line.name || line.dataKey} />)}
 </RechartsLine>
 </ResponsiveContainer>
 );
}
