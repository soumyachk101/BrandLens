"use client";
import * as React from "react";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Competitor } from "@/lib/types";

export function CompetitorTable({ competitors }: { competitors: Competitor[] }) {
 return (
 <Table>
 <TableHeader>
 <tr>
 <TableHead>Competitor</TableHead>
 <TableHead className="text-right">Visibility</TableHead>
 <TableHead className="text-right">Sentiment</TableHead>
 <TableHead className="text-right">Mentions</TableHead>
 <TableHead className="text-right">Overlap</TableHead>
 <TableHead className="text-right">Trend</TableHead>
 </tr>
 </TableHeader>
 <TableBody>
 {competitors.map((c) => (
 <tr key={c.id}>
 <TableCell className="font-medium">{c.name}</TableCell>
 <TableCell className="text-right">{c.visibilityScore}</TableCell>
 <TableCell className="text-right">{c.sentimentScore}</TableCell>
 <TableCell className="text-right">{c.mentionCount.toLocaleString()}</TableCell>
 <TableCell className="text-right">{c.keywordsOverlap}%</TableCell>
 <TableCell className="text-right">
 <span className={c.trend > 0 ? "text-green-600 dark:text-green-400" : c.trend < 0 ? "text-red-600 dark:text-red-400" : "text-zinc-500"}>
 {c.trend > 0 ? "+" : ""}{c.trend}
 </span>
 </TableCell>
 </tr>
 ))}
 </TableBody>
 </Table>
 );
}
