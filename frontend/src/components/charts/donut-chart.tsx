"use client";
import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DonutChartProps {
 data: { name: string; value: number; color?: string }[];
 height?: number;
 innerRadius?: number | string;
}

const COLORS = ["#6366F1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function DonutChart({ data, height = 300, innerRadius = "60%" }: DonutChartProps) {
 const chartData = data.map((d, i) => ({ ...d, color: d.color || COLORS[i % COLORS.length] }));
 return (
 <ResponsiveContainer width="100%" height={height}>
 <PieChart>
 <Pie data={chartData} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius="80%" paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
 {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
 </Pie>
 <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", background: "white" }} />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 );
}
