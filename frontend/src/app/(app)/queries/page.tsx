"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { QueryList } from "@/components/features/query-list";
import { MOCK_QUERIES } from "@/lib/mock-data";

export default function QueriesPage() {
 const [selected, setSelected] = React.useState<any>(null);

 if (selected) {
 return <QueryDetailPage query={selected} onBack={() => setSelected(null)} />;
 }

 return (
 <AppShell>
 <PageHeader title="AI Queries" subtitle="Browse and manage your AI queries" actions={<Button>+ New Query</Button>} />
 <QueryList queries={MOCK_QUERIES} onSelect={setSelected} />
 </AppShell>
 );
}

function QueryDetailPage({ query, onBack }: { query: any; onBack: () => void }) {
 return (
 <AppShell>
 <PageHeader title="Query Detail" breadcrumbs={[{ label: "Queries", href: "/queries" }]} actions={<Button variant="outline" onClick={onBack}>← Back</Button>} />
 <div className="max-w-3xl"><pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">{query.answer}</pre></div>
 </AppShell>
 );
}
