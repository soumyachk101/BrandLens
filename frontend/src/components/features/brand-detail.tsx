"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScoreCard } from "@/components/dashboard/score-card";
import { LineChart } from "@/components/charts/line-chart";
import { AreaChart } from "@/components/charts/area-chart";
import { MentionsFeed } from "@/components/dashboard/mentions-feed";
import { CompetitorTable } from "@/components/dashboard/competitor-table";
import { TrendingUp, TrendingDown, Globe, MessageSquare, Zap, RefreshCw } from "lucide-react";
import type { Brand, Mention, Competitor, VisibilityTrend } from "@/lib/types";

interface BrandDetailProps {
 brand: Brand;
 mentions: Mention[];
 competitors: Competitor[];
 visibilityTrends: VisibilityTrend[];
 modelBreakdown: { model: string; count: number; percentage: number }[];
 topKeywords: { keyword: string; volume: number }[];
}

export function BrandDetail({ brand, mentions, competitors, visibilityTrends, modelBreakdown, topKeywords }: BrandDetailProps) {
 return (
 <div className="space-y-6">
 <div className="flex items-start justify-between">
 <div>
 <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{brand.name}</h1>
 <p className="text-sm text-zinc-500 dark:text-zinc-400">{brand.domain} • {brand.description}</p>
 </div>
 <div className="flex gap-2">
 <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Scan Now</Button>
 <Button><MessageSquare className="h-4 w-4 mr-2" />Ask AI</Button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <ScoreCard label="Visibility" value={brand.visibilityScore} color="indigo" size="lg" />
 <ScoreCard label="Sentiment" value={brand.sentimentScore} color="green" size="lg" />
 <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
 <MessageSquare className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
 <p className="text-3xl font-bold text-zinc-900 dark:text-white">{brand.mentionCount.toLocaleString()}</p>
 <p className="text-sm text-zinc-500">Total Mentions</p>
 </div>
 <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
 <Zap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
 <p className="text-3xl font-bold text-zinc-900 dark:text-white">{brand.scanFrequency}</p>
 <p className="text-sm text-zinc-500">Scan Frequency</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2">
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Visibility Trend</h3>
 <LineChart data={visibilityTrends.map((t) => ({ x: t.date, y: t.score }))} height={250} />
 </Card>
 </div>
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Top Keywords</h3>
 <div className="space-y-3">{topKeywords.map((kw) => (
 <div key={kw.keyword} className="flex items-center justify-between">
 <span className="text-sm text-zinc-700 dark:text-zinc-300">{kw.keyword}</span>
 <span className="text-sm font-medium text-zinc-500">{kw.volume.toLocaleString()}</span>
 </div>
 ))}</div>
 </Card>
 </div>

 <Tabs defaultValue="mentions">
 <TabsList>
 <TabsTrigger value="mentions">Mentions</TabsTrigger>
 <TabsTrigger value="competitors">Competitors</TabsTrigger>
 <TabsTrigger value="models">Models</TabsTrigger>
 </TabsList>
 <TabsContent value="mentions" className="mt-4"><MentionsFeed mentions={mentions} /></TabsContent>
 <TabsContent value="competitors" className="mt-4"><Card className="p-6"><h3 className="text-lg font-semibold mb-4">Competitor Comparison</h3><CompetitorTable competitors={competitors} /></Card></TabsContent>
 <TabsContent value="models" className="mt-4">
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Model Breakdown</h3>
 <div className="space-y-3">{modelBreakdown.map((m) => (
 <div key={m.model} className="flex items-center justify-between"><span className="text-sm text-zinc-700 dark:text-zinc-300">{m.model}</span><span className="text-sm font-medium text-zinc-500">{m.count} ({m.percentage}%)</span></div>
 ))}</div>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 );
}
