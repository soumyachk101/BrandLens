"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/features/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useBrands, useCreateBrand } from "@/hooks/use-brands";
import { BrandCard, BrandCardSkeleton } from "@/components/features/brand-card";
import {
 Plus,
 Search,
 SlidersHorizontal,
 Globe,
 Trash2,
 RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function BrandsPage() {
 const [search, setSearch] = useState("");
 const [showCreate, setShowCreate] = useState(false);
 const [newBrand, setNewBrand] = useState({ name: "", industry: "", description: "", websiteUrl: "", keywords: "", competitors: "", scanFrequency: "daily" as const });
 const { data: brands, isLoading } = useBrands();
 const createMutation = useCreateBrand();

 const filtered = brands?.filter((b) =>
 b.name.toLowerCase().includes(search.toLowerCase()) ||
 b.industry.toLowerCase().includes(search.toLowerCase())
 ) || [];

 const handleCreate = () => {
 if (!newBrand.name) return;
 createMutation.mutate({
 name: newBrand.name,
 industry: newBrand.industry || "General",
 description: newBrand.description,
 websiteUrl: newBrand.websiteUrl,
 keywords: newBrand.keywords
 ? newBrand.keywords.split(",").map((k) => ({ term: k.trim(), type: "brand", weight: 1.0 }))
 : [],
 competitors: newBrand.competitors
 ? newBrand.competitors.split(",").map((c) => ({ name: c.trim(), keywords: [c.trim()] }))
 : [],
 scanFrequency: newBrand.scanFrequency,
 });
 setShowCreate(false);
 setNewBrand({ name: "", industry: "", description: "", websiteUrl: "", keywords: "", competitors: "", scanFrequency: "daily" });
 };

 return (
 <DashboardShell
 title="Brands"
 description="Manage and monitor your tracked brands"
 >
 <div className="space-y-6">
 {/* Actions */}
 <div className="flex flex-col sm:flex-row gap-3">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
 <Input
 placeholder="Search brands..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9"
 />
 </div>
 <div className="flex gap-2">
 <Button variant="outline" size="sm">
 <SlidersHorizontal className="h-4 w-4 mr-1.5" />
 Filters
 </Button>
 <Button size="sm" onClick={() => setShowCreate(true)}>
 <Plus className="h-4 w-4 mr-1.5" />
 Add Brand
 </Button>
 </div>
 </div>

 {/* Brand Grid */}
 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {[1, 2, 3].map((i) => (
 <BrandCardSkeleton key={i} />
 ))}
 </div>
 ) : filtered.length === 0 ? (
 <Card className="py-16">
 <div className="flex flex-col items-center justify-center text-center">
 <Globe className="h-12 w-12 text-slate-300 mb-3" />
 <h3 className="text-lg font-semibold mb-1">No brands found</h3>
 <p className="text-sm text-slate-500 max-w-sm mb-4">
 {search ? "Try adjusting your search terms." : "Get started by adding your first brand to track."}
 </p>
 {!search && (
 <Button onClick={() => setShowCreate(true)}>
 <Plus className="h-4 w-4 mr-1.5" />
 Add Your First Brand
 </Button>
 )}
 </div>
 </Card>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {filtered.map((brand) => (
 <BrandCard
 key={brand.id}
 {...brand}
 onView={(id) => {
 window.location.href = `/(app)/brands/${id}`;
 }}
 onScan={(id) => {
 console.log("Scan brand:", id);
 }}
 onDelete={(id) => {
 if (confirm("Are you sure you want to delete this brand? This action cannot be undone.")) {
 console.log("Delete brand:", id);
 }
 }}
 />
 ))}
 </div>
 )}

 {/* Create Brand Dialog */}
 <Dialog open={showCreate} onOpenChange={setShowCreate}>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Add New Brand</DialogTitle>
 <DialogDescription>
 Create a new brand profile to track across AI platforms. Fill in the details below.
 </DialogDescription>
 </DialogHeader>
 <div className="space-y-4 py-4">
 <div>
 <label className="block text-sm font-medium mb-1">Brand Name *</label>
 <Input
 placeholder="e.g., Acme Corp"
 value={newBrand.name}
 onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Industry</label>
 <Input
 placeholder="e.g., SaaS / Technology"
 value={newBrand.industry}
 onChange={(e) => setNewBrand({ ...newBrand, industry: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Description</label>
 <textarea
 className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
 placeholder="Brief description of your brand..."
 value={newBrand.description}
 onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Website URL</label>
 <Input
 placeholder="https://yourbrand.com"
 value={newBrand.websiteUrl}
 onChange={(e) => setNewBrand({ ...newBrand, websiteUrl: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
 <Input
 placeholder="Brand name, product, category..."
 value={newBrand.keywords}
 onChange={(e) => setNewBrand({ ...newBrand, keywords: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Competitors (comma-separated)</label>
 <Input
 placeholder="Competitor A, Competitor B"
 value={newBrand.competitors}
 onChange={(e) => setNewBrand({ ...newBrand, competitors: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Scan Frequency</label>
 <select
 className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
 value={newBrand.scanFrequency}
 onChange={(e) => setNewBrand({ ...newBrand, scanFrequency: e.target.value as any })}
 >
 <option value="daily">Daily</option>
 <option value="weekly">Weekly</option>
 <option value="hourly">Hourly</option>
 <option value="manual">Manual</option>
 </select>
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
 <Button onClick={handleCreate} disabled={!newBrand.name || createMutation.isPending}>
 {createMutation.isPending ? "Creating..." : "Create Brand"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 </DashboardShell>
 );
}
