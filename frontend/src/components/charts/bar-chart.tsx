"use client";
import * as React from "react";
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BarChartProps {
 data: any[];
 xKey?: string;
 yKey?: string;
 bars?: { dataKey: string; fill?: string; name?: string }[];
 height?: number;
 orientation?: "vertical" | "horizontal";
}

export function BarChart({ data, xKey = "x", yKey = "y", bars, height = 300 }: BarChartProps) {
 const defaultBars = [{ dataKey: yKey, fill: "#6366F1" }];
 const chartBars = bars || defaultBars;
 return (
 <ResponsiveContainer width="100%" height={height}>
 <RechartsBar data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" />
 <XAxis dataKey={xKey} stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
 <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
 <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", background: "white" }} />
 {chartBars.map((bar, i) => <Bar key={i} dataKey={bar.dataKey} fill={bar.fill || "#6366F1"} name={bar.name || bar.dataKey} radius={[4, 4, 0, 0]} />)}
 </RechartsBar>
 </ResponsiveContainer>
 );
}
