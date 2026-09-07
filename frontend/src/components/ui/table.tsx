"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const tableVariants = cva("w-full caption-bottom text-sm", {
 variants: { variant: { default: "border-collapse" } },
 defaultVariants: { variant: "default" },
});

interface TableProps extends React.HTMLAttributes<HTMLTableElement>, VariantProps<typeof tableVariants> {}
const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, ...props }, ref) => (
 <div className="relative w-full overflow-auto">
 <table ref={ref} className={cn(tableVariants(), className)} {...props} />
 </div>
));
Table.displayName = "Table";

const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
 <thead className={cn("[&_tr]:border-b [&_tr]:border-zinc-200 dark:[&_tr]:border-zinc-800", className)} {...props} />
);
const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
 <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);
const TableFooter: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
 <tfoot className={cn("border-t border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50", className)} {...props} />
);
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
 <tr ref={ref} className={cn("border-b border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900", className)} {...props} />
));
const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
 <th className={cn("h-12 px-4 text-left align-middle font-medium text-zinc-500 dark:text-zinc-400", className)} {...props} />
);
const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
 <td className={cn("p-4 align-middle", className)} {...props} />
);

export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell };
