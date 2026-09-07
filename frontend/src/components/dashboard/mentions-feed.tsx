"use client";
import * as React from "react";
import { formatRelativeDate } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import type { Mention } from "@/lib/types";

const sourceColors: Record<string, string> = {
 reddit: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
 twitter: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
 news: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
 blog: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
 forum: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
 social: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
};

const sentimentColors: Record<string, string> = {
 positive: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
 neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
 negative: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function MentionsFeed({ mentions }: { mentions: Mention[] }) {
 return (
 <div className="space-y-3">
 {mentions.map((m) => (
 <div key={m.id} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2">
 <Badge className={sourceColors[m.source] || sourceColors.news}>{m.source}</Badge>
 <Badge variant={m.sentiment === "positive" ? "success" : m.sentiment === "negative" ? "error" : "neutral"}>{m.sentiment}</Badge>
 </div>
 <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatRelativeDate(new Date(m.publishedAt))}</span>
 </div>
 <h4 className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">{m.title}</h4>
 <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{m.snippet}</p>
 <a href={m.url} target="_blank" rel="noopener" className="mt-2 inline-block text-xs text-indigo-600 hover:underline dark:text-indigo-400">View source →</a>
 </div>
 ))}
 </div>
 );
}
