"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Brand } from "@/lib/types";

interface ReportGeneratorProps {
 brands: Brand[];
 onGenerate?: (data: { brandId: string; title: string; period: { start: string; end: string }; sections: any }) => void;
 }

export function ReportGenerator({ brands, onGenerate }: ReportGeneratorProps) {
 const [brandId, setBrandId] = React.useState("");
 const [title, setTitle] = React.useState("");
 const [period, setPeriod] = React.useState({ start: "", end: "" });
 const [sections, setSections] = React.useState({ visibility: true, sentiment: true, mentions: true, competitors: true, keywords: true });

 const toggle = (k: keyof typeof sections) => setSections((s) => ({ ...s, [k]: !s[k] }));

 const canSubmit = brandId && title && period.start && period.end;

 return (
 <Card className="p-6 max-w-xl mx-auto space-y-6">
 <h2 className="text-lg font-semibold">Generate Report</h2>
 <div><Label>Brand</Label><Select value={brandId} onValueChange={setBrandId}><SelectTrigger><span>{brandId ? brands.find((b) => b.id === brandId)?.name || "Select brand" : "Select brand"}</span></SelectTrigger><SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
 <div><Label>Report Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
 <div className="grid grid-cols-2 gap-4">
 <div><Label>Start Date</Label><Input type="date" value={period.start} onChange={(e) => setPeriod((p) => ({ ...p, start: e.target.value }))} /></div>
 <div><Label>End Date</Label><Input type="date" value={period.end} onChange={(e) => setPeriod((p) => ({ ...p, end: e.target.value }))} /></div>
 </div>
 <div><Label className="mb-2">Sections</Label>
 <div className="space-y-2">
 {Object.entries(sections).map(([k, v]) => (
 <div key={k} className="flex items-center justify-between"><span className="text-sm capitalize">{k}</span><Switch checked={v} onCheckedChange={() => toggle(k as keyof typeof sections)} /></div>
 ))}
 </div>
 </div>
 <Button disabled={!canSubmit} onClick={() => onGenerate?.({ brandId, title, period, sections })}>Generate Report</Button>
 </Card>
 );
}
