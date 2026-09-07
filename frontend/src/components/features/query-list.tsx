"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, Clock } from "lucide-react";
import type { AIQuery } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface QueryListProps { queries: AIQuery[]; isLoading?: boolean; onSelect?: (q: AIQuery) => void; }

export function QueryList({ queries, isLoading, onSelect }: QueryListProps) {
 const [search, setSearch] = React.useState("");
 const [filterBrand, setFilterBrand] = React.useState<string | null>(null);

 const filtered = queries.filter((q) => {
 const matchesSearch = !search || q.question.toLowerCase().includes(search.toLowerCase());
 const matchesBrand = !filterBrand || q.brandId === filterBrand;
 return matchesSearch && matchesBrand;
 });

 return (
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
 <Input placeholder="Search queries..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
 </div>
 </div>
 <div className="space-y-3">
 {isLoading ? [1, 2, 3].map((i) => <Card key={i} className="p-4 animate-pulse"><div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" /><div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" /></Card>) : filtered.map((q) => (
 <Card key={q.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect?.(q)}>
 <div className="flex items-start justify-between">
 <div>
 <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2">{q.question}</p>
 <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{q.answer.slice(0, 200)}...</p>
 </div>
 </div>
 <div className="mt-3 flex items-center gap-2">
 <Badge variant="outline" className="text-xs">{q.model}</Badge>
 <span className="flex items-center gap-1 text-xs text-zinc-500"><Clock className="h-3 w-3" />{formatDate(new Date(q.createdAt))}</span>
 </div>
 </Card>
 ))}
 </div>
 </div>
 );
}
