"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps { total: number; pageSize: number; currentPage: number; onPageChange: (p: number) => void; }

export function Pagination({ total, pageSize, currentPage, onPageChange }: PaginationProps) {
 const totalPages = Math.max(1, Math.ceil(total / pageSize));
 if (totalPages <= 1) return null;
 return (
 <div className="flex items-center justify-between">
 <span className="text-sm text-zinc-500 dark:text-zinc-400">Page {currentPage} of {totalPages}</span>
 <div className="flex gap-2">
 <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Previous</Button>
 <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</Button>
 </div>
 </div>
 );
}
