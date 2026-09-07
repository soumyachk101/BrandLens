import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { ScoreCard } from "@/components/dashboard/score-card";
import { LineChart } from "@/components/charts/line-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { AreaChart } from "@/components/charts/area-chart";
import { MentionsFeed } from "@/components/dashboard/mentions-feed";
import { CompetitorTable } from "@/components/dashboard/competitor-table";
import { AlertCard } from "@/components/dashboard/alert-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardStats, useRecentMentions, useVisibilityTrends, useAgencyStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { MOCK_BRANDS, MOCK_MENTIONS, MOCK_VISIBILITY_TRENDS, MOCK_COMPETITORS, MOCK_MODEL_BREAKDOWN } from "@/lib/mock-data";
import { TrendingUp, MessageSquare, Eye, AlertTriangle, Download, MessageSquare as AskAI } from "lucide-react";
import { Link } from "next/link";

export default function DashboardPage() {
 const statsQuery = useQuery({ queryKey: ["dashboard-stats"], queryFn: async () => ({ totalBrands: 3, totalMentions: 1243, avgVisibilityScore: 62.1, avgSentimentScore: 73.9, activeAlerts: 2, reportsGenerated: 12 }) });
 const stats = statsQuery.data || { totalBrands: 3, totalMentions: 1243, avgVisibilityScore: 62.1, avgSentimentScore: 73.9, activeAlerts: 2, reportsGenerated: 12 };
 const alerts = useAgencyStore((s) => s.alerts);
 const visibilityData = MOCK_VISIBILITY_TRENDS.map((t) => ({ x: new Date(t.date).toLocaleDateString("en-US", { month: "short" }), y: t.score }));
 const modelData = MOCK_MODEL_BREAKDOWN.map((m) => ({ name: m.model, value: m.count, color: "#6366F1" }));
 const brand = MOCK_BRANDS[0];
 const mentions = MOCK_MENTIONS.slice(0, 3);
 const topKeywords = brand.keywords.map((k) => ({ keyword: k, volume: Math.floor(Math.random() * 500 + 100) }));
 const sentimentData = [
 { date: "Week 1", positive: 65, neutral: 25, negative: 10 },
 { date: "Week 2", positive: 68, neutral: 22, negative: 10 },
 { date: "Week 3", positive: 72, neutral: 20, negative: 8 },
 { date: "Week 4", positive: 70, neutral: 23, negative: 7 },
 { date: "Week 5", positive: 75, neutral: 18, negative: 7 },
 ];

 return (
 <AppShell>
 <PageHeader title="Dashboard" subtitle="Welcome back, Sarah" actions={<div className="flex gap-2"><Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button><Button size="sm" asChild><Link href="/queries"><AskAI className="h-4 w-4 mr-2" />Ask AI</Link></Button></div>} />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <KPICard label="Total Mentions" value={stats.totalMentions} trend={12.5} icon={<MessageSquare className="h-5 w-5" />} />
 <KPICard label="Avg Visibility" value={stats.avgVisibilityScore.toFixed(1)} trend={8.3} suffix="/100" icon={<Eye className="h-5 w-5" />} />
 <KPICard label="Avg Sentiment" value={stats.avgSentimentScore.toFixed(1)} trend={2.1} suffix="/100" icon={<TrendingUp className="h-5 w-5" />} />
 <KPICard label="Active Alerts" value={stats.activeAlerts} trend={-33.3} icon={<AlertTriangle className="h-5 w-5" />} />
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2">
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Visibility Trend</h3>
 <LineChart data={visibilityData} height={250} />
 </Card>
 <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Brand Scores</h3>
 <div className="flex justify-around">
 <ScoreCard label="Visibility" value={brand.visibilityScore} color="indigo" size="md" />
 <ScoreCard label="Sentiment" value={brand.sentimentScore} color="green" size="md" />
 </div>
 </Card>
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Sentiment Trend</h3>
 <AreaChart data={sentimentData.map((d) => ({ x: d.date, y: d.positive }))} color="#22c55e" height={120} />
 </Card>
 </div>
 </div>
 <div className="space-y-6">
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Model Breakdown</h3>
 <DonutChart data={modelData} height={200} innerRadius="50%" />
 </Card>
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Top Keywords</h3>
 <div className="space-y-3">{topKeywords.map((kw) => (
 <div key={kw.keyword}><div className="flex justify-between text-sm"><span className="text-zinc-700 dark:text-zinc-300">{kw.keyword}</span><span className="text-zinc-500">{kw.volume.toLocaleString()}</span></div></div>
 ))}</div>
 </Card>
 </div>
 </div>
 <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2">
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Recent Mentions</h3>
 <MentionsFeed mentions={mentions} />
 </Card>
 </div>
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Alerts</h3>
 <div className="space-y-3">{alerts.slice(0, 3).map((a) => <AlertCard key={a.id} alert={a} />)}</div>
 </Card>
 </div>
 </AppShell>
 );
}
