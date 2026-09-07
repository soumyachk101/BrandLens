"use client";
import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Brand } from "@/lib/types";

interface FilterDrawerProps { open: boolean; onOpenChange: (v: boolean) => void; brands: Brand[]; onFilter: (filters: any) => void; activeFilters: any; }

export function FilterDrawer({ open, onOpenChange, brands, onFilter, activeFilters }: FilterDrawerProps) {
 return (
 <Sheet open={open} onOpenChange={onOpenChange}>
 <SheetContent side="right">
 <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
 <div className="mt-6 space-y-4">
 <div><Label>Brand</Label>
 <select className="mt-1 flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
 <option value="">All brands</option>
 {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
 </select>
 </div>
 <div><Label>Sentiment</Label>
 <div className="mt-2 flex gap-2">
 <Button variant="outline" size="sm">Positive</Button>
 <Button variant="outline" size="sm">Neutral</Button>
 <Button variant="outline" size="sm">Negative</Button>
 </div>
 </div>
 <div><Label>Source</Label>
 <div className="mt-2 flex flex-wrap gap-2">
 {["reddit", "twitter", "news", "blog", "forum"].map((s) => (
 <Badge key={s} variant="outline" className="cursor-pointer">{s}</Badge>
 ))}
 </div>
 </div>
 <div className="pt-4 flex gap-2">
 <Button onClick={() => onFilter({ ...activeFilters })}>Apply</Button>
 <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
 </div>
 </div>
 </SheetContent>
 </Sheet>
 );
}
