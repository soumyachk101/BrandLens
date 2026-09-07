"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreVertical, Download, Eye, Trash2, Copy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Report } from "@/lib/types";

interface ReportCardProps { report: Report; onView?: (id: string) => void; onDownload?: (id: string) => void; onDelete?: (id: string) => void; }

export function ReportCard({ report, onView, onDownload, onDelete }: ReportCardProps) {
 const statusColors = { pending: "neutral", generating: "warning", completed: "success", failed: "error" } as const;

 return (
 <Card className="p-5 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div>
 <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{report.title}</h3>
 <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{formatDate(new Date(report.createdAt))}</p>
 <div className="mt-2 flex gap-1.5">
 {Object.entries(report.sections).filter(([, v]) => v).map(([k]) => <Badge key={k} variant="outline" className="text-xs">{k}</Badge>)}
 </div>
 </div>
 <Badge variant={statusColors[report.status]}>
 {report.status}
 </Badge>
 </div>
 <div className="mt-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3">
 <span className="text-xs text-zinc-500">{report.recipients.length} recipients</span>
 <div className="flex gap-1">
 {report.status === "completed" && (
 <>
 <Button variant="ghost" size="sm" onClick={() => onView?.(report.id)}><Eye className="h-4 w-4" /></Button>
 <Button variant="ghost" size="sm" onClick={() => onDownload?.(report.id)}><Download className="h-4 w-4" /></Button>
 </>
 )}
 <DropdownMenu>
 <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => navigator.clipboard.writeText(report.id)}><Copy className="h-4 w-4 mr-2" />Copy ID</DropdownMenuItem>
 <DropdownMenuItem onClick={() => onDelete?.(report.id)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>
 </Card>
 );
}
