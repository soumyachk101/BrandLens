"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Report, ReportInput } from "@/lib/types";

async function fetchReports(brandId?: string): Promise<Report[]> {
 const url = brandId ? `/api/reports?brandId=${brandId}` : "/api/reports";
 const res = await fetch(url);
 if (!res.ok) throw new Error("Failed to fetch reports");
 return res.json();
}

async function fetchReport(id: string): Promise<Report> {
 const res = await fetch(`/api/reports/${id}`);
 if (!res.ok) throw new Error("Failed to fetch report");
 return res.json();
}

async function generateReport(data: ReportInput): Promise<Report> {
 const res = await fetch("/api/reports/generate", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(data),
 });
 if (!res.ok) throw new Error("Failed to generate report");
 return res.json();
}

async function downloadReport(id: string): Promise<Blob> {
 const res = await fetch(`/api/reports/${id}/download`);
 if (!res.ok) throw new Error("Failed to download report");
 return res.blob();
}

export function useReports(brandId?: string) {
 return useQuery({
 queryKey: ["reports", brandId],
 queryFn: () => fetchReports(brandId),
 });
}

export function useReport(id: string) {
 return useQuery({
 queryKey: ["reports", id],
 queryFn: () => fetchReport(id),
 enabled: !!id,
 refetchInterval: (query) => {
 const data = query.state.data;
 if (data && (data.status === "pending" || data.status === "generating")) {
 return 2000;
 }
 return false;
 },
 });
}

export function useGenerateReport() {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: generateReport,
 onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
 });
}

export function useDownloadReport() {
 return useMutation({
 mutationFn: async (id: string) => {
 const blob = await downloadReport(id);
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = `report-${id}.pdf`;
 a.click();
 URL.revokeObjectURL(url);
 },
 });
}
