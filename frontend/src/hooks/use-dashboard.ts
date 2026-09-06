"use client";

import { useQuery } from "@tanstack/react-query";
import { statusApi } from "@/lib/api";
import { mockPlatformStatus, mockVisibilityData, mockSentimentTrends } from "@/lib/mock-data";
import { VisibilitySummary, PlatformStatus as PlatformStatusType } from "@/types";

export function useDashboard() {
 const platformStatusQuery = useQuery({
 queryKey: ["dashboard", "platform-status"],
 queryFn: async () => {
 const res = await statusApi.getPlatforms();
 return res.data;
 },
 placeholderData: mockPlatformStatus,
 });

 const visibilityQuery = useQuery({
 queryKey: ["dashboard", "visibility"],
 queryFn: async () => {
 return mockVisibilityData;
 },
 placeholderData: mockVisibilityData,
 });

 const sentimentQuery = useQuery({
 queryKey: ["dashboard", "sentiment-trends"],
 queryFn: async () => {
 return mockSentimentTrends;
 },
 placeholderData: mockSentimentTrends,
 });

 const healthQuery = useQuery({
 queryKey: ["dashboard", "health"],
 queryFn: async () => {
 const res = await statusApi.getHealth();
 return res;
 },
 placeholderData: {
 status: "healthy",
 version: "1.2.0",
 timestamp: new Date().toISOString(),
 services: { database: "healthy", queue: "healthy", ai_platforms: { chatgpt: "healthy", perplexity: "healthy", claude: "healthy", gemini: "degraded", copilot: "healthy" } },
 },
 });

 return {
 platformStatus: platformStatusQuery.data ?? [],
 platformStatusLoading: platformStatusQuery.isLoading,
 visibility: visibilityQuery.data ?? [],
 visibilityLoading: visibilityQuery.isLoading,
 sentimentTrends: sentimentQuery.data ?? [],
 sentimentLoading: sentimentQuery.isLoading,
 health: healthQuery.data ?? null,
 healthLoading: healthQuery.isLoading,
 };
}

export function usePlatformStatus() {
 return useQuery({
 queryKey: ["platform-status"],
 queryFn: async () => {
 const res = await statusApi.getPlatforms();
 return res.data;
 },
 placeholderData: mockPlatformStatus,
 });
}
