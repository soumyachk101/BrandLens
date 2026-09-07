"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Competitor } from "@/lib/types";

interface CompetitorComparisonProps {
 competitors: Competitor[];
 }

export function CompetitorComparison({ competitors }: CompetitorComparisonProps) {
 const metrics = ["visibilityScore", "sentimentScore", "mentionCount", "keywordsOverlap"] as const;
 const labels = { visibilityScore: "Visibility", sentimentScore: "Sentiment", mentionCount: "Mentions", keywordsOverlap: "Keyword Overlap" };

 return (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Competitor Comparison</h3>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-zinc-200 dark:border-zinc-800">
 <th className="text-left py-2 text-sm font-medium text-zinc-500">Metric</th>
 {competitors.map((c) => <th key={c.id} className="text-right py-2 text-sm font-medium text-zinc-900 dark:text-white">{c.name}</th>)}
 </tr>
 </thead>
 <tbody>
 {metrics.map((m) => (
 <tr key={m} className="border-b border-zinc-100 dark:border-zinc-800">
 <td className="py-2 text-sm text-zinc-600 dark:text-zinc-400">{labels[m]}</td>
 {competitors.map((c) => (
 <td key={c.id} className="text-right py-2 text-sm font-medium text-zinc-900 dark:text-white">
 {m === "visibilityScore" || m === "sentimentScore" ? c[m].toFixed(1) : m === "keywordsOverlap" ? `${c[m]}%` : c[m].toLocaleString()}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 );
}
