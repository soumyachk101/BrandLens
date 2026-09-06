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
import { cn, formatNumber } from "@/lib/utils";

interface VisibilityChartProps {
 data: Array<{ date: string; [key: string]: number | string }>;
 brands: Array<{ name: string; color: string }>;
 className?: string;
}

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"];

export function VisibilityChart({ data, brands, className }: VisibilityChartProps) {
 return (
 <div className={cn("w-full", className)}>
 <ResponsiveContainer width="100%" height={300}>
 <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-slate-700" />
 <XAxis
 dataKey="date"
 stroke="#94A3B8"
 fontSize={12}
 tickLine={false}
 axisLine={false}
 />
 <YAxis
 stroke="#94A3B8"
 fontSize={12}
 tickLine={false}
 axisLine={false}
 domain={[0, 100]}
 tickFormatter={(value) => `${value}`}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: "white",
 border: "1px solid #E2E8F0",
 borderRadius: "8px",
 boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
 }}
 formatter={(value: number, name: string) => [`${value}`, name]}
 />
 {brands.map((brand, index) => (
 <Line
 key={brand.name}
 type="monotone"
 dataKey={brand.name}
 stroke={brand.color || COLORS[index % COLORS.length]}
 strokeWidth={2}
 dot={false}
 animationDuration={800}
 />
 ))}
 </LineChart>
 </ResponsiveContainer>
 <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
 {brands.map((brand, index) => (
 <div key={brand.name} className="flex items-center gap-2">
 <div
 className="w-3 h-3 rounded-full"
 style={{ backgroundColor: brand.color || COLORS[index % COLORS.length] }}
 />
 <span className="text-xs text-slate-600 dark:text-slate-400">{brand.name}</span>
 </div>
 ))}
 </div>
 </div>
 );
}
