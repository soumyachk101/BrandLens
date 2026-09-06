"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queriesApi, mentionsApi } from "@/lib/api";
import { mockQueries } from "@/lib/mock-data";
import { AIQuery, Mention, QueryMention } from "@/types";

export function useQueries(brandId: string, params?: Record<string, string>) {
 return useQuery({
 queryKey: ["queries", brandId, params],
 queryFn: async () => {
 const res = await queriesApi.list(brandId, params);
 return res.data;
 },
 placeholderData: { data: mockQueries as AIQuery[], meta: { page: 1, limit: 20, total: mockQueries.length, totalPages: 1 } },
 enabled: !!brandId,
 });
}

export function useQueryDetail(id: string) {
 return useQuery({
 queryKey: ["queries", "detail", id],
 queryFn: async () => {
 const res = await queriesApi.get(id);
 return res.data;
 },
 enabled: !!id,
 });
}

export function useQueryMentions(queryId: string) {
 return useQuery({
 queryKey: ["queries", queryId, "mentions"],
 queryFn: async () => {
 const res = await queriesApi.getMentions(queryId);
 return res.data;
 },
 enabled: !!queryId,
 });
}

export function useMentions(brandId: string, params?: Record<string, string>) {
 return useQuery({
 queryKey: ["mentions", brandId, params],
 queryFn: async () => {
 const res = await mentionsApi.list(brandId, params);
 return res.data;
 },
 enabled: !!brandId,
 });
}

export function useMentionsFeed(brandId: string, params?: Record<string, string>) {
 return useQuery({
 queryKey: ["mentions", brandId, "feed", params],
 queryFn: async () => {
 const res = await mentionsApi.getFeed(brandId, params);
 return res.data;
 },
 enabled: !!brandId,
 });
}

export function useSentimentTrends(brandId: string, params?: Record<string, string>) {
 return useQuery({
 queryKey: ["mentions", brandId, "sentiment-trends", params],
 queryFn: async () => {
 const res = await mentionsApi.getSentimentTrends(brandId, params);
 return res.data;
 },
 enabled: !!brandId,
 });
}
