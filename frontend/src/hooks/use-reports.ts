"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";
import { mockReports } from "@/lib/mock-data";
import { Report } from "@/types";

export function useReports(brandId: string, params?: Record<string, string>) {
 return useQuery({
 queryKey: ["reports", brandId, params],
 queryFn: async () => {
 const res = await reportsApi.list(brandId, params);
 return res.data;
 },
 placeholderData: { data: mockReports as Report[], meta: { page: 1, limit: 20, total: mockReports.length, totalPages: 1 } },
 enabled: !!brandId,
 });
}

export function useReport(id: string) {
 return useQuery({
 queryKey: ["reports", id],
 queryFn: async () => {
 const res = await reportsApi.get(id);
 return res.data;
 },
 enabled: !!id,
 });
}

export function useGenerateReport(brandId: string) {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: (data: Record<string, unknown>) => reportsApi.create(brandId, data),
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: ["reports", brandId] });
 },
 });
}

export function useDownloadReport() {
 return useMutation({
 mutationFn: async ({ reportId, format }: { reportId: string; format?: string }) => {
 const res = await reportsApi.download(reportId, format);
 return res.data;
 },
 });
}

export function useResendReport() {
 return useMutation({
 mutationFn: ({ reportId, data }: { reportId: string; data?: Record<string, string[]> }) =>
 reportsApi.resend(reportId, data),
 });
}
