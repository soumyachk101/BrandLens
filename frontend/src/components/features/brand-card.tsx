"use client";

import * as React from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface BrandCardProps {
 name: string;
 domain: string;
 mentions: number;
 sentiment: number; // 0-100
 change: number; // percentage change
 platforms: string[];
 id: string;
}

const sentimentColor = (score: number) => {
 if (score >= 70) return { bg: "bg-emerald-50", text: "text-emerald-700", label: "Positive" };
 if (score >= 40) return { bg: "bg-amber-50", text: "text-amber-700", label: "Neutral" };
 return { bg: "bg-red-50", text: "text-red-700", label: "Negative" };
};

const ChangeIcon = ({ change }: { change: number }) => {
 if (change > 0) return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
 if (change < 0) return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
 return <Minus className="h-3.5 w-3.5 text-gray-400" />;
};

export function BrandCard({ name, domain, mentions, sentiment, change, platforms, id }: BrandCardProps) {
 const sent = sentimentColor(sentiment);
 return (
 <Card className="group hover:shadow-md hover:border-brand-200 transition-all duration-200">
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500 font-bold text-lg">
 {name.charAt(0)}
 </div>
 <div>
 <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{name}</h3>
 <p className="text-xs text-gray-500">{domain}</p>
 </div>
 </div>
 <DropdownMenu
 trigger={
 <Button variant="ghost" size="icon-sm" className="h-8 w-8">
 <MoreVertical className="h-4 w-4" />
 </Button>
 }
 align="right"
 >
 <DropdownMenuItem icon={<ExternalLink className="h-3.5 w-3.5" />}>View Details</DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem destructive>Delete Brand</DropdownMenuItem>
 </DropdownMenu>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="flex items-end justify-between mb-4">
 <div>
 <p className="text-2xl font-bold text-gray-900">{mentions.toLocaleString()}</p>
 <p className="text-xs text-gray-500">mentions this week</p>
 </div>
 <div className={cn("flex items-center gap-1 text-xs font-medium", change >= 0 ? "text-emerald-600" : "text-red-600")}>
 <ChangeIcon change={change} />
 {Math.abs(change)}%
 </div>
 </div>
 <div className="flex items-center justify-between">
 <Badge variant="secondary" className={cn("text-xs", sent.bg, sent.text, "border-0")}>
 {sent.label} {sentiment}%
 </Badge>
 <div className="flex -space-x-1">
 {platforms.slice(0, 3).map((p) => (
 <span key={p} className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-600 ring-2 ring-white" title={p}>
 {p[0]}
 </span>
 ))}
 </div>
 </div>
 <Link href={`/brands/${id}`}>
 <Button variant="outline" className="w-full mt-4 text-xs" size="sm">
 View Details
 </Button>
 </Link>
 </CardContent>
 </Card>
 );
}
