"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandsApi } from "@/lib/api";
import { mockBrands } from "@/lib/mock-data";
import { Brand } from "@/types";

export function useBrands(params?: Record<string, string>) {
 return useQuery({
 queryKey: ["brands", params],
 queryFn: async () => {
 const res = await brandsApi.list(params);
 return res.data;
 },
 placeholderData: mockBrands as Brand[],
 });
}

export function useBrand(id: string) {
 return useQuery({
 queryKey: ["brands", id],
 queryFn: async () => {
 const res = await brandsApi.get(id);
 return res.data;
 },
 enabled: !!id,
 });
}

export function useCreateBrand() {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: (data: Record<string, unknown>) => brandsApi.create(data),
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: ["brands"] });
 },
 });
}

export function useUpdateBrand(id: string) {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: (data: Record<string, unknown>) => brandsApi.update(id, data),
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: ["brands"] });
 qc.invalidateQueries({ queryKey: ["brands", id] });
 },
 });
}

export function useDeleteBrand() {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: (id: string) => brandsApi.remove(id),
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: ["brands"] });
 },
 });
}

export function useScanBrand(id: string) {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: (data?: Record<string, unknown>) => brandsApi.scan(id, data),
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: ["brands"] });
 qc.invalidateQueries({ queryKey: ["brands", id] });
 },
 });
}

export function useBrandAnalytics(id: string, params?: Record<string, string>) {
 return useQuery({
 queryKey: ["brands", id, "analytics", params],
 queryFn: async () => {
 const res = await brandsApi.getAnalytics(id, params);
 return res.data;
 },
 enabled: !!id,
 });
}
