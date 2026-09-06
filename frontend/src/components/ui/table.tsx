import * as React from "react";
import { cn } from "@/lib/utils";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

function Table({ className, ...props }: TableProps) {
 return (
 <div className="relative w-full overflow-auto">
 <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
 </div>
 );
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

function TableHeader({ className, ...props }: TableHeaderProps) {
 return (
 <thead className={cn("[&_tr]:border-b", className)} {...props} />
 );
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

function TableBody({ className, ...props }: TableBodyProps) {
 return (
 <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
 );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

function TableRow({ className, ...props }: TableRowProps) {
 return (
 <tr
 className={cn(
 "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
 className
 )}
 {...props}
 />
 );
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

function TableHead({ className, ...props }: TableHeadProps) {
 return (
 <th
 className={cn(
 "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
 className
 )}
 {...props}
 />
 );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

function TableCell({ className, ...props }: TableCellProps) {
 return (
 <td
 className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
 {...props}
 />
 );
}

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell };
