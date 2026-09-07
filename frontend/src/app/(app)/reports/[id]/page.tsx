"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ReportViewer } from "@/components/features/report-viewer";
import { MOCK_REPORTS } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";

export default function ReportViewerPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = React.use(params);
 const report = MOCK_REPORTS.find((r) => r.id === id) || MOCK_REPORTS[0];
 return (
 <AppShell>
 <ReportViewer reportId={report.id} title={report.title} sections={report.sections} status={report.status} />
 </AppShell>
 );
}
