"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { BrandInput } from "@/lib/validators";

const formSchema = z.object({
 name: z.string().min(1, "Brand name is required"),
 domain: z.string().url("Invalid domain URL"),
 keywords: z.string().transform((s) => s.split(",").map((k) => k.trim()).filter(Boolean)),
 competitors: z.string().transform((s) => s.split(",").map((c) => c.trim()).filter(Boolean)),
 scanFrequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).default("daily"),
 description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BrandFormProps {
 onSave?: (data: BrandInput) => void;
 defaultValues?: Partial<FormValues>;
}

export function BrandForm({ onSave, defaultValues }: BrandFormProps) {
 const [open, setOpen] = React.useState(false);
 const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
 resolver: zodResolver(formSchema),
 defaultValues: {
 name: defaultValues?.name || "",
 domain: defaultValues?.domain || "",
 keywords: defaultValues?.keywords?.join(", ") || "",
 competitors: defaultValues?.competitors?.join(", ") || "",
 scanFrequency: defaultValues?.scanFrequency || "daily",
 description: defaultValues?.description || "",
 },
 });

 const onSubmit = (data: FormValues) => {
 const payload: BrandInput = {
 name: data.name,
 domain: data.domain,
 keywords: data.keywords,
 competitors: data.competitors,
 scanFrequency: data.scanFrequency,
 description: data.description,
 };
 onSave?.(payload);
 setOpen(false);
 reset();
 };

 return (
 <Dialog open={open} onOpenChange={setOpen}>
 <DialogTrigger asChild><Button>+ New Brand</Button></DialogTrigger>
 <DialogContent>
 <DialogHeader><DialogTitle>Create New Brand</DialogTitle><DialogDescription>Set up tracking for your brand</DialogDescription></DialogHeader>
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
 <div><Label htmlFor="name">Brand Name</Label><Input id="name" {...register("name")} /><p className="text-xs text-red-500 mt-1">{errors.name?.message}</p></div>
 <div><Label htmlFor="domain">Domain</Label><Input id="domain" {...register("domain")} placeholder="example.com" /><p className="text-xs text-red-500 mt-1">{errors.domain?.message}</p></div>
 <div><Label htmlFor="keywords">Keywords (comma-separated)</Label><Textarea id="keywords" {...register("keywords")} placeholder="Brand name, product name..." /></div>
 <div><Label htmlFor="competitors">Competitors (comma-separated URLs)</Label><Input id="competitors" {...register("competitors")} placeholder="competitor1.com, competitor2.com" /></div>
 <div><Label htmlFor="scanFrequency">Scan Frequency</Label>
 <select id="scanFrequency" {...register("scanFrequency")} className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="biweekly">Bi-weekly</option><option value="monthly">Monthly</option></select>
 </div>
 <div><Label htmlFor="description">Description (optional)</Label><Textarea id="description" {...register("description")} /></div>
 <DialogFooter><Button type="submit">Create Brand</Button></DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 );
}
