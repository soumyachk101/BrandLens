"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AIQuery, QueryInput } from "@/lib/types";

async function fetchQueries(brandId?: string): Promise<AIQuery[]> {
 const url = brandId ? `/api/queries?brandId=${brandId}` : "/api/queries";
 const res = await fetch(url);
 if (!res.ok) throw new Error("Failed to fetch queries");
 return res.json();
}

async function fetchQuery(id: string): Promise<AIQuery> {
 const res = await fetch(`/api/queries/${id}`);
 if (!res.ok) throw new Error("Failed to fetch query");
 return res.json();
}

async function createQuery(data: QueryInput): Promise<AIQuery> {
 const res = await fetch("/api/queries", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(data),
 });
 if (!res.ok) throw new Error("Failed to create query");
 return res.json();
}

async function fetchQueryMentions(queryId: string): Promise<any[]> {
 const res = await fetch(`/api/queries/${queryId}/mentions`);
 if (!res.ok) throw new Error("Failed to fetch query mentions");
 return res.json();
}

export function useQueries(brandId?: string) {
 return useQuery({
 queryKey: ["queries", brandId],
 queryFn: () => fetchQueries(brandId),
 });
}

export function useQuery(id: string) {
 return useQuery({
 queryKey: ["queries", id],
 queryFn: () => fetchQuery(id),
 enabled: !!id,
 });
}

export function useAddQuery() {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: createQuery,
 onSuccess: () => qc.invalidateQueries({ queryKey: ["queries"] }),
 });
}

export function useQueryMentions(queryId: string) {
 return useQuery({
 queryKey: ["queries", queryId, "mentions"],
 queryFn: () => fetchQueryMentions(queryId),
 enabled: !!queryId,
 });
}
