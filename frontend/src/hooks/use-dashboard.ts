"use client";
import { useQuery } from "@tanstack/react-query";
import { useAgencyStore } from "@/store";

async function fetchDashboardStats() {
 const res = await fetch("/api/dashboard/stats");
 if (!res.ok) throw new Error("Failed to fetch dashboard stats");
 return res.json();
}

async function fetchRecentMentions(limit = 10) {
 const res = await fetch(`/api/dashboard/mentions?limit=${limit}`);
 if (!res.ok) throw new Error("Failed to fetch mentions");
 return res.json();
}

async function fetchVisibilityTrends(brandId?: string) {
 const url = brandId ? `/api/dashboard/trends?brandId=${brandId}` : "/api/dashboard/trends";
 const res = await fetch(url);
 if (!res.ok) throw new Error("Failed to fetch trends");
 return res.json();
}

export function useDashboardStats() {
 return useQuery({
 queryKey: ["dashboard", "stats"],
 queryFn: fetchDashboardStats,
 staleTime: 5 * 60 * 1000,
 });
}

export function useRecentMentions(limit = 10) {
 return useQuery({
 queryKey: ["dashboard", "mentions", limit],
 queryFn: () => fetchRecentMentions(limit),
 staleTime: 2 * 60 * 1000,
 });
}

export function useVisibilityTrends(brandId?: string) {
 return useQuery({
 queryKey: ["dashboard", "trends", brandId],
 queryFn: () => fetchVisibilityTrends(brandId),
 staleTime: 5 * 60 * 1000,
 });
}
