"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Download, MoreVertical, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ExternalLink } from "@/components/ui/external-link";

interface ReportCardProps {
 id: string;
 title: string;
 brand: string;
 type: "weekly" | "monthly" | "custom";
 status: "ready" | "generating" | "failed";
 date: string;
 pages: number;
}

const typeConfig = {
 weekly: { label: "Weekly", color: "bg-blue-50 text-blue-700 border-blue-200" },
 monthly: { label: "Monthly", color: "bg-purple-50 text-purple-700 border-purple-200" },
 custom: { label: "Custom", color: "bg-gray-50 text-gray-700 border-gray-200" },
};

const statusConfig = {
 ready: { label: "Ready", variant: "success" as const },
 generating: { label: "Generating...", variant: "warning" as const },
 failed: { label: "Failed", variant: "danger" as const },
};

export function ReportCard({ id, title, brand, type, status, date, pages }: ReportCardProps) {
 const typeInfo = typeConfig[type];
 const statusInfo = statusConfig[status];

 return (
 <Card className="hover:shadow-md hover:border-brand-200 transition-all group">
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
 <FileText className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{title}</h3>
 <p className="text-xs text-gray-500">{brand}</p>
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
 <DropdownMenuItem icon={<Download className="h-3.5 w-3.5" />}>Download PDF</DropdownMenuItem>
 <DropdownMenuItem>
 <ExternalLink href="#">View Online</ExternalLink>
 </DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem destructive>Delete</DropdownMenuItem>
 </DropdownMenu>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="flex items-center gap-2 mb-3">
 <Badge variant="secondary" className={cn("text-xs border-0", typeInfo.color)}>{typeInfo.label}</Badge>
 <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
 </div>
 <div className="flex items-center justify-between text-xs text-gray-500">
 <div className="flex items-center gap-1">
 <Calendar className="h-3.5 w-3.5" />
 {date}
 </div>
 <div className="flex items-center gap-1">
 <Clock className="h-3.5 w-3.5" />
 {pages} pages
 </div>
 </div>
 {status === "ready" && (
 <Link href={`/reports/${id}`}>
 <Button className="w-full mt-4" size="sm">View Report</Button>
 </Link>
 )}
 </CardContent>
 </Card>
 );
}
