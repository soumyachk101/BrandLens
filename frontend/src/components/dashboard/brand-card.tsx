"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import type { Brand } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function BrandCard({ brand }: { brand: Brand }) {
 return (
 <Card className="p-5 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div>
 <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{brand.name}</h3>
 <p className="text-xs text-zinc-500 dark:text-zinc-400">{brand.domain}</p>
 </div>
 <Badge variant={brand.scanFrequency === "daily" ? "success" : brand.scanFrequency === "weekly" ? "warning" : "outline"}>{brand.scanFrequency}</Badge>
 </div>
 <div className="mt-4 grid grid-cols-3 gap-2">
 <div>
 <p className="text-xs text-zinc-500 dark:text-zinc-400">Visibility</p>
 <p className="text-lg font-semibold text-zinc-900 dark:text-white">{brand.visibilityScore}</p>
 </div>
 <div>
 <p className="text-xs text-zinc-500 dark:text-zinc-400">Sentiment</p>
 <p className="text-lg font-semibold text-zinc-900 dark:text-white">{brand.sentimentScore}</p>
 </div>
 <div>
 <p className="text-xs text-zinc-500 dark:text-zinc-400">Mentions</p>
 <p className="text-lg font-semibold text-zinc-900 dark:text-white">{formatNumber(brand.mentionCount)}</p>
 </div>
 </div>
 <div className="mt-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3">
 <span className="text-xs text-zinc-500 dark:text-zinc-400">Last scan: 2h ago</span>
 <a href={`/brands/${brand.id}`} className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">View details →</a>
 </div>
 </Card>
 );
}
