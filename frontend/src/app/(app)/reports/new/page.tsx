"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ReportGenerator } from "@/components/features/report-generator";
import { useRouter } from "next/navigation";
import { MOCK_BRANDS } from "@/lib/mock-data";

export default function NewReportPage() {
 const router = useRouter();
 return (
 <AppShell>
 <PageHeader title="Generate New Report" subtitle="Create a custom report for your brands" breadcrumbs={[{ label: "Reports", href: "/reports" }, { label: "New" }]} />
 <ReportGenerator brands={MOCK_BRANDS} onGenerate={async (data) => { console.log("Generate report:", data); router.push("/reports"); }} />
 </AppShell>
 );
}
