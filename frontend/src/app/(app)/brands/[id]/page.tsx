"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/features/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBrand, useQueries, useMentions, useSentimentTrends, useScanBrand } from "@/hooks/use-brands";
import { useBrandAnalytics } from "@/hooks/use-dashboard";
import { SentimentChart } from "@/components/features/sentiment-chart";
import { CompetitorComparison } from "@/components/features/competitor-comparison";
import { QueryResult, QueryResultSkeleton } from "@/components/features/query-result";
import { PlatformStatusIndicator } from "@/components/features/platform-status";
import {
 ArrowLeft,
 Play,
 RefreshCw,
 TrendingUp,
 Globe,
 Target,
 BarChart3,
 AlertTriangle,
 ExternalLink,
 Calendar,
 Filter,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BrandDetailPage() {
 const params = useParams();
 const brandId = params.id as string;
 const scanMutation = useScanBrand(brandId);

 const { data: brand, isLoading: brandLoading } = useBrand(brandId);
 const { data: queriesData, isLoading: queriesLoading } = useQueries(brandId);
 const { data: mentionsData, isLoading: mentionsLoading } = useMentions(brandId);
 const { data: sentimentData, isLoading: sentimentLoading } = useSentimentTrends(brandId, { from: "2026-08-01", to: "2026-09-06" });
 const { data: sentimentData, isLoading: sentimentLoading } = useSentimentTrends(brandId, { from: "2026-08-01", to: "2026-09-06" });

 return (
 <DashboardShell
 title={brand?.name || "Brand Details"}
 description={brand?.industry || ""}
 >
 {brandLoading ? (
 <div className="space-y-6">
 <Skeleton className="h-48 w-full rounded-lg" />
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
 </div>
 <Skeleton className="h-80 w-full rounded-lg" />
 </div>
 ) : !brand ? (
 <Card className="py-16">
 <div className="text-center">
 <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-3" />
 <h3 className="text-lg font-semibold mb-1">Brand Not Found</h3>
 <p className="text-sm text-slate-500 mb-4">The brand you're looking for doesn't exist or you don't have access.</p>
 <Link href="/(app)/brands">
 <Button variant="outline">Back to Brands</Button>
 </Link>
 </div>
 </Card>
 ) : (
 <div className="space-y-6">
 {/* Score Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <Card>
 <div className="p-4 text-center">
 <p className="text-xs text-slate-500 mb-1">Visibility Score</p>
 <p className="text-3xl font-bold tabular-nums text-primary">
 {brand.visibilityScore !== undefined ? `${(brand.visibilityScore * 100).toFixed(0)}` : "—"}
 </p>
 <p className="text-xs text-slate-400 mt-1">
 {brand.visibilityScore && brand.visibilityScore >= 0.7 ? "Grade A" : brand.visibilityScore && brand.visibilityScore >= 0.4 ? "Grade C" : "Grade F"}
 </p>
 </div>
 </Card>
 <Card>
 <div className="p-4 text-center">
 <p className="text-xs text-slate-500 mb-1">Total Mentions</p>
 <p className="text-3xl font-bold tabular-nums">{brand.totalMentions?.toLocaleString() || "0"}</p>
 <p className="text-xs text-success mt-1 flex items-center justify-center gap-1">
 <TrendingUp className="h-3 w-3" /> +12%
 </p>
 </div>
 </Card>
 <Card>
 <div className="p-4 text-center">
 <p className="text-xs text-slate-500 mb-1">Scan Frequency</p>
 <p className="text-3xl font-bold tabular-nums capitalize">{brand.scanFrequency}</p>
 <p className="text-xs text-slate-400 mt-1">Automated</p>
 </div>
 </Card>
 <Card>
 <div className="p-4 text-center">
 <p className="text-xs text-slate-500 mb-1">Status</p>
 <Badge variant={brand.isActive ? "success" : "secondary"} className="text-sm">
 {brand.isActive ? "Active" : "Inactive"}
 </Badge>
 <p className="text-xs text-slate-400 mt-1">
 {brand.lastScannedAt ? `Last scan: ${new Date(brand.lastScannedAt).toLocaleDateString()}` : "Never scanned"}
 </p>
 </div>
 </Card>
 </div>

 {/* Action bar */}
 <div className="flex items-center gap-3">
 <Button
 onClick={() => scanMutation.mutate()}
 disabled={scanMutation.isPending}
 size="sm"
 >
 <Play className="h-3.5 w-3.5 mr-1.5" />
 {scanMutation.isPending ? "Scanning..." : "Run Scan"}
 </Button>
 <Button variant="outline" size="sm">
 <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
 Refresh
 </Button>
 <Link href={`/(app)/reports?brand=${brandId}`}>
 <Button variant="outline" size="sm">
 <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
 View Reports
 </Button>
 </Link>
 </div>

 {/* Tabs */}
 <Tabs defaultValue="overview" className="space-y-4">
 <TabsList>
 <TabsTrigger value="overview">Overview</TabsTrigger>
 <TabsTrigger value="queries">AI Queries</TabsTrigger>
 <TabsTrigger value="mentions">Mentions</TabsTrigger>
 <TabsTrigger value="competitors">Competitors</TabsTrigger>
 <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="space-y-4">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card>
 <div className="p-5">
 <h3 className="text-lg font-semibold mb-1">Brand Information</h3>
 <div className="space-y-3 mt-4">
 <div className="flex justify-between">
 <span className="text-sm text-slate-500">Industry</span>
 <span className="text-sm font-medium">{brand.industry}</span>
 </div>
 {brand.websiteUrl && (
 <div className="flex justify-between">
 <span className="text-sm text-slate-500">Website</span>
 <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
 {brand.websiteUrl} <ExternalLink className="h-3 w-3" />
 </a>
 </div>
 )}
 <div className="flex justify-between">
 <span className="text-sm text-slate-500">Scan Frequency</span>
 <span className="text-sm font-medium capitalize">{brand.scanFrequency}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-sm text-slate-500">Keywords</span>
 <span className="text-sm font-medium">{brand.keywords.length} tracked</span>
 </div>
 <div className="flex justify-between">
 <span className="text-sm text-slate-500">Competitors</span>
 <span className="text-sm font-medium">{brand.competitors.length} tracked</span>
 </div>
 </div>
 </div>
 </Card>
 <PlatformStatusIndicator platforms={[]} loading={false} />
 </div>
 </TabsContent>

 <TabsContent value="queries" className="space-y-3">
 {queriesLoading ? (
 <div className="space-y-3">
 {[1, 2, 3].map((i) => <QueryResultSkeleton key={i} />)}
 </div>
 ) : queriesData?.data && queriesData.data.length > 0 ? (
 <div className="space-y-3">
 {queriesData.data.map((query) => (
 <QueryResult key={query.id} {...query} />
 ))}
 </div>
 ) : (
 <Card className="py-12 text-center">
 <p className="text-sm text-slate-500">No queries yet. Run a scan to generate AI queries.</p>
 </Card>
 )}
 </TabsContent>

 <TabsContent value="mentions" className="space-y-3">
 {mentionsLoading ? (
 <Skeleton className="h-64 w-full" />
 ) : mentionsData?.data && mentionsData.data.length > 0 ? (
 <div className="space-y-2">
 {mentionsData.data.map((mention) => (
 <Card key={mention.id} className="p-4">
 <div className="flex items-start gap-3">
 <Badge variant="outline" className="capitalize shrink-0">{mention.platform}</Badge>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <span className="text-sm font-medium">{mention.entityName}</span>
 <Badge variant={mention.sentiment === "positive" ? "success" : mention.sentiment === "negative" ? "destructive" : "secondary"} className="text-[10px]">
 {mention.sentiment}
 </Badge>
 <span className="text-xs text-slate-400 ml-auto">
 {new Date(mention.createdAt).toLocaleDateString()}
 </span>
 </div>
 <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">"{mention.context}"</p>
 </div>
 </div>
 </Card>
 ))}
 </div>
 ) : (
 <Card className="py-12 text-center">
 <p className="text-sm text-slate-500">No mentions yet. Run a scan to discover mentions.</p>
 </Card>
 )}
 </TabsContent>

 <TabsContent value="competitors">
 <CompetitorComparison
 brandName={brand.name}
 brandVisibility={brand.visibilityScore || 0}
 brandMentions={brand.totalMentions || 0}
 brandAvgSentiment={0.55}
 competitors={[]}
 />
 </TabsContent>

 <TabsContent value="sentiment">
 <SentimentChart
 data={sentimentData || []}
 loading={sentimentLoading}
 />
 </TabsContent>
 </Tabs>
 </div>
 )}
 </DashboardShell>
 );
}
