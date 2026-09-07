"use client";
import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface DataTableProps<T> {
 data: T[];
 columns: { key: string; header: string; render?: (item: T) => React.ReactNode }[];
 keyExtractor: (item: T) => string;
 emptyMessage?: string;
}

export function DataTable<T>({ data, columns, keyExtractor, emptyMessage = "No data" }: DataTableProps<T>) {
 return (
 <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
 <div className="overflow-x-auto">
 <Table>
 <TableHeader>
 <tr>{columns.map((c) => <TableHead key={c.key}>{c.header}</TableHead>)}</tr>
 </TableHeader>
 <TableBody>
 {data.length === 0 ? <tr><TableCell colSpan={columns.length} className="text-center py-8 text-zinc-500">{emptyMessage}</TableCell></tr> : data.map((item) => (
 <TableRow key={keyExtractor(item)}>
 {columns.map((c) => <TableCell key={c.key}>{c.render ? c.render(item) : (item as any)[c.key]}</TableCell>)}
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 </div>
 );
}
