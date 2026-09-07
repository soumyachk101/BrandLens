"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, className }: { value: number[]; onValueChange: (v: number[]) => void; min?: number; max?: number; step?: number; className?: string; }) {
 const trackRef = React.useRef<HTMLDivElement>(null);
 const handleTrack = (e: React.MouseEvent) => {
 if (!trackRef.current) return;
 const rect = trackRef.current.getBoundingClientRect();
 const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
 const percent = x / rect.width;
 const newValue = min + percent * (max - min);
 const stepped = Math.round(newValue / step) * step;
 onValueChange([stepped]);
 };
 const percent = ((value[0] - min) / (max - min)) * 100;
 return (
 <div ref={trackRef} onClick={handleTrack} onMouseDown={(e) => handleTrack(e)} className={cn("relative h-4 w-full cursor-pointer", className)}>
 <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
 <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500" style={{ width: `${percent}%` }} />
 <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${percent}%` }}>
 <div className="h-5 w-5 rounded-full border-2 border-indigo-600 bg-white shadow dark:bg-zinc-900" />
 </div>
 </div>
 );
}
