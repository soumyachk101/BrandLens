"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SentimentChartProps {
 data: { date: string; positive: number; neutral: number; negative: number }[];
 className?: string;
}

export function SentimentChart({ data, className }: SentimentChartProps) {
 const maxVal = Math.max(...data.map((d) => d.positive + d.neutral + d.negative));

 return (
 <div className={cn("w-full", className)}>
 <div className="flex items-center gap-6 mb-6">
 <div className="flex items-center gap-2">
 <div className="h-3 w-3 rounded-full bg-emerald-500" />
 <span className="text-sm text-gray-600">Positive</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="h-3 w-3 rounded-full bg-amber-400" />
 <span className="text-sm text-gray-600">Neutral</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="h-3 w-3 rounded-full bg-red-400" />
 <span className="text-sm text-gray-600">Negative</span>
 </div>
 </div>
 <div className="flex items-end gap-1.5 h-[200px]">
 {data.map((d, i) => {
 const total = d.positive + d.neutral + d.negative;
 const pH = (d.positive / maxVal) * 100;
 const nH = (d.neutral / maxVal) * 100;
 const negH = (d.negative / maxVal) * 100;
 return (
 <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
 <div className="w-full flex flex-col items-center gap-0.5" style={{ height: "170px", justifyContent: "flex-end" }}>
 <div
 className="w-full max-w-[40px] rounded-t bg-emerald-500 transition-all group-hover:opacity-80"
 style={{ height: `${pH}%`, minHeight: "2px" }}
 title={`Positive: ${d.positive}`}
 />
 <div
 className="w-full max-w-[40px] bg-amber-400 transition-all group-hover:opacity-80"
 style={{ height: `${nH}%`, minHeight: "2px" }}
 title={`Neutral: ${d.neutral}`}
 />
 <div
 className="w-full max-w-[40px] rounded-b bg-red-400 transition-all group-hover:opacity-80"
 style={{ height: `${negH}%`, minHeight: "2px" }}
 title={`Negative: ${d.negative}`}
 />
 </div>
 <span className="text-[10px] text-gray-400 mt-1">{d.date}</span>
 </div>
 );
 })}
 </div>
 </div>
 );
}
