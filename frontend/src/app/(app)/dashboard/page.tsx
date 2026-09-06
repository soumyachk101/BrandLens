"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/features/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-dashboard";
import { useBrands } from "@/hooks/use-brands";
import { BrandCard } from "@/components/features/brand-card";
import { PlatformStatusIndicator } from "@/components/features/platform-status";
import { SentimentChart } from "@/components/features/sentiment-chart";
import {
 Globe,
 Target,
 BarChart3,
 Zap,
 ArrowUpRight,
 ArrowDownRight,
 Plus,
 TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
 const {
 platformStatus,
 visibility,
 sentimentTrends,
 platformStatusLoading,
 sentimentLoading,
 } = useDashboard();
 const { data: brands = [], isLoading: brandsLoading } = useBrands();

 const isLoading = platformStatusLoading || brandsLoading;

 const totalBrands = brands.length;
 const activeBrands = brands.filter((b: any) => b.isActive).length;
 const avgVisibility = brands.length
 ? brands.reduce((a, b) => a + (b.visibilityScore || 0), 0) / brands.length
 : 0;
 const totalMentions = brands.reduce((a, b) => a + (b.totalMentions || 0), 0);
 const topBrands = brands.slice(0, 3);

 return (
 <DashboardShell
 title="Dashboard"
 description="Overview of all brands and AI visibility metrics"
 >
 {isLoading ? (
 <div className="space-y-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {[1, 2, 3, 4].map((i) => (
 <Skeleton key={i} className="h-28 rounded-lg" />
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Skeleton className="h-80 rounded-lg" />
 <Skeleton className="h-80 rounded-lg" />
 </div>
 </div>
 ) : (
 <div className="space-y-6">
 {/* KPI Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <KpiCard
 label="Total Brands"
 value={String(totalBrands)}
 subtext={`${activeBrands} active`}
 icon={<Globe className="h-5 w-5" />}
 trend={{ value: "+2", positive: true }}
 />
 <KpiCard
 label="Avg Visibility"
 value={`${(avgVisibility * 100).toFixed(0)}%`}
 subtext="Across all brands"
 icon={<Target className="h-5 w-5" />}
 trend={{ value: "+4.2%", positive: true }}
 />
 <KpiCard
 label="Total Mentions"
 value={totalMentions.toLocaleString()}
 subtext="All time"
 icon={<BarChart3 className="h-5 w-5" />}
 trend={{ value: "+18%", positive: true }}
 />
 <KpiCard
 label="Platforms"
 value={String(dashboard.platformStatus.length)}
 subtext={`${dashboard.platformStatus.filter((p) => p.status === "operational").length} healthy`}
 icon={<Zap className="h-5 w-5" />}
 trend={{ value: "1 degraded", positive: false }}
 />
 </div>

 {/* Charts Row */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <SentimentChart data={dashboard.sentimentTrends} loading={dashboard.sentimentLoading} />
 <PlatformStatusIndicator platforms={dashboard.platformStatus} loading={dashboard.platformStatusLoading} />
 </div>

 {/* Top Brands */}
 <Card>
 <div className="p-5">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h3 className="text-lg font-semibold">Your Brands</h3>
 <p className="text-sm text-muted-foreground">Top performing brands this period</p>
 </div>
 <Link href="/(app)/brands">
 <Button size="sm" variant="outline">
 <Plus className="h-3.5 w-3.5 mr-1.5" />
 Add Brand
 </Button>
 </Link>
 </div>
 <div className="space-y-4">
 {topBrands.length === 0 ? (
 <div className="text-center py-8">
 <p className="text-sm text-muted-foreground">No brands yet. Add your first brand to get started.</p>
 <Link href="/(app)/brands">
 <Button className="mt-3" size="sm">Add Your First Brand</Button>
 </Link>
 </div>
 ) : (
 topBrands.map((brand) => (
 <div
 key={brand.id}
 className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 dark:bg-slate-800"
 >
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
 <Globe className="h-5 w-5 text-primary" />
 </div>
 <div>
 <p className="font-medium">{brand.name}</p>
 <p className="text-sm text-muted-foreground">{brand.industry}</p>
 </div>
 </div>
 <div className="flex items-center gap-6">
 <div className="text-right">
 <p className="text-sm font-medium tabular-nums">
 {(brand.visibilityScore || 0) > 0 ? `${(brand.visibilityScore! * 100).toFixed(0)}%` : "—"}
 </p>
 <p className="text-xs text-muted-foreground">Visibility</p>
 </div>
 <div className="text-right">
 <p className="text-sm font-medium tabular-nums">{brand.totalMentions?.toLocaleString() || "—"}</p>
 <p className="text-xs text-muted-foreground">Mentions</p>
 </div>
 <Badge variant={brand.isActive ? "success" : "secondary"}>
 {brand.isActive ? "Active" : "Inactive"}
 </Badge>
 <Link href={`/(app)/brands/${brand.id}`}>
 <Button size="sm" variant="ghost">View</Button>
 </Link>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </Card>

 {/* Competitor Comparison - for first brand */}
 {topBrands.length > 0 && (
 <CompetitorComparison
 brandName={topBrands[0].name}
 brandVisibility={topBrands[0].visibilityScore || 0}
 brandMentions={topBrands[0].totalMentions || 0}
 brandAvgSentiment={dashboard.visibility[0]?.avgBrandSentiment || 0}
 competitors={[]}
 />
 )}
 </div>
 )}
 </DashboardShell>
 );
}

function KpiCard({
 label,
 value,
 subtext,
 icon,
 trend,
}: {
 label: string;
 value: string;
 subtext: string;
 icon: React.ReactNode;
 trend: { value: string; positive: boolean };
}) {
 return (
 <Card>
 <div className="p-5">
 <div className="flex items-start justify-between mb-3">
 <p className="text-sm text-slate-500">{label}</p>
 <div className="text-slate-400">{icon}</div>
 </div>
 <p className="text-3xl font-bold tabular-nums">{value}</p>
 <div className="flex items-center gap-2 mt-1">
 <span className={cn("text-xs font-medium flex items-center gap-0.5", trend.positive ? "text-success" : "text-danger")}>
 {trend.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
 {trend.value}
 </span>
 <span className="text-xs text-slate-500">{subtext}</span>
 </div>
 </div>
 </Card>
 );
}
