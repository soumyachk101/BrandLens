"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { BrandDetail } from "@/components/features/brand-detail";
import { MOCK_BRANDS, MOCK_MENTIONS, MOCK_COMPETITORS, MOCK_VISIBILITY_TRENDS, MOCK_MODEL_BREAKDOWN } from "@/lib/mock-data";

interface PageProps { params: { id: string }; }

export default function BrandDetailPage({ params }: PageProps) {
 const brand = MOCK_BRANDS.find((b) => b.id === params.id) || MOCK_BRANDS[0];
 const mentions = MOCK_MENTIONS;
 const topKeywords = brand.keywords.map((k) => ({ keyword: k, volume: Math.floor(Math.random() * 500 + 100) }));

 return (
 <AppShell>
 <BrandDetail brand={brand} mentions={mentions} competitors={MOCK_COMPETITORS} visibilityTrends={MOCK_VISIBILITY_TRENDS} modelBreakdown={MOCK_MODEL_BREAKDOWN} topKeywords={topKeywords} />
 </AppShell>
 );
}
