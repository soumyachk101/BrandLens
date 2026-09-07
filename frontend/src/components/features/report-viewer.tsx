"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ReportViewerProps { reportId: string; title: string; sections: { visibility: boolean; sentiment: boolean; mentions: boolean; competitors: boolean; keywords: boolean; }; status: string; }

export function ReportViewer({ reportId, title, sections, status }: ReportViewerProps) {
 const [loading, setLoading] = React.useState(status === "generating" || status === "pending");

 React.useEffect(() => {
 if (status === "completed") setLoading(false);
 const interval = setInterval(() => { if (status === "generating") setLoading(false); }, 3000);
 return () => clearInterval(interval);
 }, [status]);

 return (
 <div className="flex gap-6">
 <div className="hidden lg:block w-56 shrink-0">
 <Card className="p-4">
 <h4 className="text-sm font-medium text-zinc-500 mb-3">Table of Contents</h4>
 <div className="space-y-2">
 {sections.visibility && <a href="#visibility" className="block text-sm text-indigo-600 hover:underline">Visibility Overview</a>}
 {sections.sentiment && <a href="#sentiment" className="block text-sm text-indigo-600 hover:underline">Sentiment Analysis</a>}
 {sections.mentions && <a href="#mentions" className="block text-sm text-indigo-600 hover:underline">Mentions Feed</a>}
 {sections.competitors && <a href="#competitors" className="block text-sm text-indigo-600 hover:underline">Competitor Analysis</a>}
 {sections.keywords && <a href="#keywords" className="block text-sm text-indigo-600 hover:underline">Keyword Performance</a>}
 </div>
 </Card>
 </div>
 <div className="flex-1 min-w-0">
 <Card className="p-8">
 <div className="text-center">
 <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h1>
 <p className="text-sm text-zinc-500 mt-2">Report ID: {reportId}</p>
 </div>
 {loading && (
 <div className="mt-8 space-y-2">
 <p className="text-sm text-zinc-500">Generating report...</p>
 <Progress value={60} />
 </div>
 )}
 <div className="mt-8 space-y-8">
 {sections.visibility && (
 <section id="visibility" className="scroll-mt-8">
 <h2 className="text-lg font-semibold mb-3">Visibility Overview</h2>
 <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-zinc-500">Visibility charts and metrics would render here</div>
 </section>
 )}
 {sections.sentiment && (
 <section id="sentiment" className="scroll-mt-8">
 <h2 className="text-lg font-semibold mb-3">Sentiment Analysis</h2>
 <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-zinc-500">Sentiment analysis charts would render here</div>
 </section>
 )}
 {sections.mentions && (
 <section id="mentions" className="scroll-mt-8">
 <h2 className="text-lg font-semibold mb-3">Mentions Feed</h2>
 <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-zinc-500">Mentions summary would render here</div>
 </section>
 )}
 {sections.competitors && (
 <section id="competitors" className="scroll-mt-8">
 <h2 className="text-lg font-semibold mb-3">Competitor Analysis</h2>
 <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-zinc-500">Competitor comparison would render here</div>
 </section>
 )}
 {sections.keywords && (
 <section id="keywords" className="scroll-mt-8">
 <h2 className="text-lg font-semibold mb-3">Keyword Performance</h2>
 <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-zinc-500">Keyword analysis would render here</div>
 </section>
 )}
 </div>
 </Card>
 </div>
 </div>
 );
}
