"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { Brand } from "@/lib/types";

interface ReportConfigFormProps {
 brands: Brand[];
 onSave?: (config: any) => void;
}

export function ReportConfigForm({ brands, onSave }: ReportConfigFormProps) {
 const [config, setConfig] = React.useState({ brandId: "", period: { start: "", end: "" }, sections: { visibility: true, sentiment: true, mentions: true, competitors: true, keywords: true }, recipients: [], includeExecutiveSummary: true, includeMethodology: false, format: "pdf" });

 const update = (field: string, value: any) => setConfig((c) => ({ ...c, [field]: value }));
 const updateSection = (k: string, v: boolean) => setConfig((c) => ({ ...c, sections: { ...c.sections, [k]: v } }));

 return (
 <Card className="p-6 max-w-2xl mx-auto space-y-6">
 <h2 className="text-lg font-semibold">Report Configuration</h2>
 <div><Label>Brand</Label>
 <select value={config.brandId} onChange={(e) => update("brandId", e.target.value)} className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
 <option value="">Select brand</option>
 {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
 </select>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div><Label>Start Date</Label><Input type="date" value={config.period.start} onChange={(e) => update("period", { ...config.period, start: e.target.value })} /></div>
 <div><Label>End Date</Label><Input type="date" value={config.period.end} onChange={(e) => update("period", { ...config.period, end: e.target.value })} /></div>
 </div>
 <div><Label className="mb-2">Sections</Label>
 <div className="space-y-2">
 {Object.entries(config.sections).map(([k, v]) => <div key={k} className="flex items-center justify-between"><span className="text-sm capitalize">{k}</span><Switch checked={v} onCheckedChange={(c) => updateSection(k, c)} /></div>)}
 </div>
 </div>
 <div><Label className="mb-2">Options</Label>
 <div className="space-y-2">
 <div className="flex items-center justify-between"><span className="text-sm">Executive Summary</span><Switch checked={config.includeExecutiveSummary} onCheckedChange={(c) => update("includeExecutiveSummary", c)} /></div>
 <div className="flex items-center justify-between"><span className="text-sm">Include Methodology</span><Switch checked={config.includeMethodology} onCheckedChange={(c) => update("includeMethodology", c)} /></div>
 <div><span className="text-sm">Format</span>
 <div className="mt-1 flex gap-2">
 <Button variant={config.format === "pdf" ? "default" : "outline"} size="sm" onClick={() => update("format", "pdf")}>PDF</Button>
 <Button variant={config.format === "html" ? "default" : "outline"} size="sm" onClick={() => update("format", "html")}>HTML</Button>
 </div>
 </div>
 </div>
 </div>
 <Button onClick={() => onSave?.(config)}>Save Configuration</Button>
 </Card>
 );
}
