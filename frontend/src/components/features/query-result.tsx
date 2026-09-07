"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AIQuery } from "@/lib/types";

interface QueryResultProps { query: AIQuery; }

export function QueryResult({ query }: QueryResultProps) {
 return (
 <Card className="p-6 space-y-4">
 <div>
 <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Question</h3>
 <p className="mt-1 text-lg font-medium text-zinc-900 dark:text-white">{query.question}</p>
 </div>
 <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
 <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{query.answer}</p>
 </div>
 <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
 <span>Model: {query.model} • {query.tokensUsed} tokens</span>
 <span>{new Date(query.createdAt).toLocaleString()}</span>
 </div>
 {query.mentions.length > 0 && (
 <div>
 <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Supporting Mentions</h4>
 <div className="space-y-2">{query.mentions.map((m) => (
 <div key={m.id} className="rounded border border-zinc-200 dark:border-zinc-700 p-3">
 <p className="text-sm text-zinc-900 dark:text-white line-clamp-2">{m.title}</p>
 <p className="text-xs text-zinc-500 mt-1">{m.source} • {new Date(m.publishedAt).toLocaleDateString()}</p>
 </div>
 ))}</div>
 </div>
 )}
 </Card>
 );
}
