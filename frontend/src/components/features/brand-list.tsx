"use client";
import * as React from "react";
import { BrandCard } from "@/components/dashboard/brand-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Grid3X3, List } from "lucide-react";
import type { Brand } from "@/lib/types";

interface BrandListProps { brands: Brand[]; isLoading?: boolean; }

export function BrandList({ brands, isLoading }: BrandListProps) {
 const [view, setView] = React.useState<"grid" | "list">("grid");
 const [search, setSearch] = React.useState("");

 const filtered = brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()) || b.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase())));

 return (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <Input placeholder="Search brands..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
 <div className="flex items-center gap-2">
 <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setView("grid")}><Grid3X3 className="h-4 w-4" /></Button>
 <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
 </div>
 </div>
 {isLoading ? <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>{[1, 2, 3].map((i) => <div key={i} className="animate-pulse rounded-lg border border-zinc-200 dark:border-zinc-800 h-48" />)}</div> : (
 view === "grid" ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map((b) => <BrandCard key={b.id} brand={b} />)}</div> : <div className="space-y-3">{filtered.map((b) => <BrandCard key={b.id} brand={b} />)}</div>
 )}
 </div>
 );
}
