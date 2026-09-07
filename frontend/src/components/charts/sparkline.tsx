"use client";
import * as React from "react";
import { LineChart as RechartsLine, Line, ResponsiveContainer } from "recharts";

interface SparklineProps {
 data: number[];
 color?: string;
 width?: number;
 height?: number;
}

export function Sparkline({ data, color = "#6366F1", width = 100, height = 40 }: SparklineProps) {
 const chartData = data.map((y, i) => ({ x: i, y }));
 return (
 <ResponsiveContainer width={width} height={height}>
 <RechartsLine data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
 <Line type="monotone" dataKey="y" stroke={color} strokeWidth={2} dot={false} />
 </RechartsLine>
 </ResponsiveContainer>
 );
}
