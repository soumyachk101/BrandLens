"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { QueryDetail } from "@/components/features/query-detail";
import { MOCK_QUERIES } from "@/lib/mock-data";

interface PageProps { params: { id: string } }

export default function QueryDetailPage({ params }: PageProps) {
 const query = MOCK_QUERIES.find((q) => q.id === params.id) || MOCK_QUERIES[0];
 return <AppShell><QueryDetail query={query} /></AppShell>;
}
