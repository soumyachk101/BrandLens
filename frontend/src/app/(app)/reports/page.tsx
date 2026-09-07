"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ReportCard } from "@/components/features/report-card";
import { ReportGenerator } from "@/components/features/report-generator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useReports } from "@/hooks/use-reports";
import { MOCK_REPORTS, MOCK_BRANDS } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";

export default function ReportsPage() {
 const { data: reports, isLoading } = useReports();
 const displayReports = reports || MOCK_REPORTS;

 return (
 <AppShell>
 <PageHeader title="Reports" subtitle="Generate and manage brand reports" actions={
 <Dialog>
 <DialogTrigger asChild><Button>+ Generate Report</Button></DialogTrigger>
 <DialogContent>
 <DialogHeader><DialogTitle>Generate Report</DialogTitle></DialogHeader>
 <ReportGenerator brands={MOCK_BRANDS} onGenerate={(data) => console.log(data)} />
 </DialogContent>
 </Dialog>
 } />
 <div className="space-y-4">
 {isLoading ? [1, 2, 3].map((i) => <div key={i} className="animate-pulse rounded-lg border border-zinc-200 dark:border-zinc-800 h-48" />) : displayReports.map((r) => <ReportCard key={r.id} report={r} onView={(id) => window.location.href = `/reports/${id}`} />)}
 </div>
 </AppShell>
 );
}
