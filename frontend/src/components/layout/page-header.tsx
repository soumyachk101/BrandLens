"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
 title: string;
 subtitle?: string;
 actions?: React.ReactNode;
 breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
 return (
 <div className="space-y-1">
 {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h1>
 {subtitle && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
 </div>
 {actions && <div className="flex items-center gap-2">{actions}</div>}
 </div>
 </div>
 );
}

interface BreadcrumbsProps { items: { label: string; href?: string }[] }
export function Breadcrumbs({ items }: BreadcrumbsProps) {
 return (
 <nav className="flex items-center gap-2 text-sm">
 {items.map((item, i) => (
 <React.Fragment key={i}>
 {i > 0 && <span className="text-zinc-400">/</span>}
 {item.href ? <a href={item.href} className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">{item.label}</a> : <span className="text-zinc-900 dark:text-white">{item.label}</span>}
 </React.Fragment>
 ))}
 </nav>
 );
}
