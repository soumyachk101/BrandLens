"use client";
import * as React from "react";
import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AreaChartProps {
 data: { x: string | number; y: number; [k: string]: any }[];
 xKey?: string;
 yKey?: string;
 color?: string;
 height?: number;
}

export function AreaChart({ data, xKey = "x", yKey = "y", color = "#6366F1", height = 300 }: AreaChartProps) {
 return (
 <ResponsiveContainer width="100%" height={height}>
 <RechartsArea data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
 <defs>
 <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor={color} stopOpacity={0.3} />
 <stop offset="95%" stopColor={color} stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" />
 <XAxis dataKey={xKey} stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
 <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
 <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", background: "white" }} />
 <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill={`url(#gradient-${color.replace("#", "")})`} dot={false} />
 </RechartsArea>
 </ResponsiveContainer>
 );
}
