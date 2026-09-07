"use client";
import * as React from "react";
import { QueryResult } from "@/components/features/query-result";
import { Card } from "@/components/ui/card";
import type { AIQuery } from "@/lib/types";

interface QueryDetailProps { query: AIQuery; }

export function QueryDetail({ query }: QueryDetailProps) {
 return (
 <div className="space-y-4">
 <Card className="p-6">
 <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Query Detail</h1>
 <p className="text-sm text-zinc-500 mt-1">ID: {query.id}</p>
 </Card>
 <QueryResult query={query} />
 </div>
 );
}
