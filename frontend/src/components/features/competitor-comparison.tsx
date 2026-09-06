"use client";

import * as React from "react";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CompetitorData {
 name: string;
 mentions: number;
 sentiment: number;
 visibility: number;
 trend: "up" | "down" | "stable";
}

interface CompetitorComparisonProps {
 competitors: CompetitorData[];
 yourBrand: string;
 className?: string;
}

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
 if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
 if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
 return <Minus className="h-3.5 w-3.5 text-gray-400" />;
};

export function CompetitorComparison({ competitors, yourBrand, className }: CompetitorComparisonProps) {
 const sorted = [...competitors].sort((a, b) => b.mentions - a.mentions);
 const maxMentions = sorted[0]?.mentions || 1;

 return (
 <Card className={className}>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Trophy className="h-5 w-5 text-brand-500" />
 Competitor Comparison
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {sorted.map((comp, i) => {
 const isYours = comp.name === yourBrand;
 const pct = (comp.mentions / maxMentions) * 100;
 return (
 <div
 key={comp.name}
 className={cn(
 "flex items-center gap-4 p-3 rounded-lg transition-colors",
 isYours ? "bg-brand-50 border border-brand-200" : "bg-gray-50 border border-transparent"
 )}
 >
 <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white border border-gray-200 text-sm font-bold text-gray-600 flex-shrink-0">
 {i + 1}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <span className={cn("text-sm font-medium truncate", isYours && "text-brand-700")}>{comp.name}</span>
 {isYours && <Badge variant="default" className="text-[10px] h-4 px-1.5">You</Badge>}
 <TrendIcon trend={comp.trend} />
 </div>
 <div className="mt-1.5 flex items-center gap-3">
 <div className="flex-1">
 <div className="flex items-center justify-between mb-1">
 <span className="text-[11px] text-gray-400">Visibility</span>
 <span className="text-[11px] font-medium text-gray-600">{comp.visibility}%</span>
 </div>
 <Progress value={comp.visibility} indicatorClassName={isYours ? "bg-brand-500" : "bg-gray-400"} />
 </div>
 </div>
 </div>
 <div className="text-right flex-shrink-0">
 <p className="text-sm font-bold text-gray-900">{comp.mentions.toLocaleString()}</p>
 <p className="text-[11px] text-gray-500">mentions</p>
 </div>
 <Badge variant={comp.sentiment >= 70 ? "success" : comp.sentiment >= 40 ? "warning" : "danger"} className="text-[10px] flex-shrink-0">
 {comp.sentiment}%
 </Badge>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 );
}
