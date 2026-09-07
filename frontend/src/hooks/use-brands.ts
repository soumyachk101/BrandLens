"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Brand, BrandInput } from "@/lib/types";

async function fetchBrands(): Promise<Brand[]> {
 const res = await fetch("/api/brands");
 if (!res.ok) throw new Error("Failed to fetch brands");
 return res.json();
}

async function fetchBrand(id: string): Promise<Brand> {
 const res = await fetch(`/api/brands/${id}`);
 if (!res.ok) throw new Error("Failed to fetch brand");
 return res.json();
}

async function createBrand(data: BrandInput): Promise<Brand> {
 const res = await fetch("/api/brands", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(data),
 });
 if (!res.ok) throw new Error("Failed to create brand");
 return res.json();
}

async function updateBrand(id: string, data: Partial<BrandInput>): Promise<Brand> {
 const res = await fetch(`/api/brands/${id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(data),
 });
 if (!res.ok) throw new Error("Failed to update brand");
 return res.json();
}

async function deleteBrand(id: string): Promise<void> {
 const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
 if (!res.ok) throw new Error("Failed to delete brand");
}

async function scanBrand(id: string): Promise<{ message: string }> {
 const res = await fetch(`/api/brands/${id}/scan`, { method: "POST" });
 if (!res.ok) throw new Error("Failed to trigger scan");
 return res.json();
}

export function useBrands() {
 return useQuery({
 queryKey: ["brands"],
 queryFn: fetchBrands,
 });
}

export function useBrand(id: string) {
 return useQuery({
 queryKey: ["brands", id],
 queryFn: () => fetchBrand(id),
 enabled: !!id,
 });
}

export function useAddBrand() {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: createBrand,
 onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
 });
}

export function useUpdateBrand() {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: ({ id, data }: { id: string; data: Partial<BrandInput> }) => updateBrand(id, data),
 onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
 });
}

export function useDeleteBrand() {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: deleteBrand,
 onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
 });
}

export function useScanBrand() {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: scanBrand,
 onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
 });
}
