"use client";

import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface TrendChartProps {
 data: Array<{ date: string; value: number }>;
 color?: string;
 className?: string;
 showArea?: boolean;
}

export function TrendChart({ data, color = "#4F46E5", className, showArea = true }: TrendChartProps) {
 return (
 <div className={cn("w-full", className)}>
 <ResponsiveContainer width="100%" height={200}>
 <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
 <defs>
 <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor={color} stopOpacity={0.2} />
 <stop offset="95%" stopColor={color} stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-slate-700" />
 <XAxis
 dataKey="date"
 stroke="#94A3B8"
 fontSize={11}
 tickLine={false}
 axisLine={false}
 />
 <YAxis
 stroke="#94A3B8"
 fontSize={11}
 tickLine={false}
 axisLine={false}
 domain={[0, 100]}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: "white",
 border: "1px solid #E2E8F0",
 borderRadius: "8px",
 boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
 }}
 />
 {showArea && (
 <Line
 type="monotone"
 dataKey="value"
 stroke={color}
 strokeWidth={2}
 dot={false}
 animationDuration={800}
 fill={`url(#gradient-${color.replace('#', '')})`}
 />
 )}
 {!showArea && (
 <Line
 type="monotone"
 dataKey="value"
 stroke={color}
 strokeWidth={2}
 dot={false}
 animationDuration={800}
 />
 )}
 </LineChart>
 </ResponsiveContainer>
 </div>
 );
}
