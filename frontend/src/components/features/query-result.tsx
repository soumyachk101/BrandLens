"use client";

import * as React from "react";
import { ExternalLink, Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";

interface QueryResultProps {
 query: string;
 platform: string;
 result: string;
 sentiment: "positive" | "neutral" | "negative";
 sentimentScore: number;
 brandMentioned: boolean;
 timestamp: string;
}

const sentimentConfig = {
 positive: { variant: "success" as const, label: "Positive" },
 neutral: { variant: "warning" as const, label: "Neutral" },
 negative: { variant: "danger" as const, label: "Negative" },
};

export function QueryResult({ query, platform, result, sentiment, sentimentScore, brandMentioned, timestamp }: QueryResultProps) {
 const { addToast } = useToast();
 const [copied, setCopied] = React.useState(false);

 const handleCopy = async () => {
 await navigator.clipboard.writeText(result);
 setCopied(true);
 addToast({ type: "success", title: "Copied to clipboard" });
 setTimeout(() => setCopied(false), 2000);
 };

 return (
 <Card className="hover:shadow-md transition-shadow">
 <CardHeader className="pb-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="text-xs font-mono">{platform}</Badge>
 <Badge variant={sentimentConfig[sentiment].variant}>{sentimentConfig[sentiment].label}</Badge>
 {brandMentioned && <Badge variant="default" className="text-xs">Mentioned</Badge>}
 </div>
 <span className="text-xs text-gray-400">{timestamp}</span>
 </div>
 <p className="text-sm font-medium text-gray-900 mt-2">&ldquo;{query}&rdquo;</p>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
 {result}
 </div>
 <div className="mt-4 flex items-center justify-between">
 <div className="flex items-center gap-3 flex-1">
 <span className="text-xs text-gray-500">Sentiment</span>
 <Progress value={sentimentScore} className="flex-1 max-w-[200px]" />
 <span className="text-xs font-medium text-gray-700">{sentimentScore}%</span>
 </div>
 <div className="flex items-center gap-1 ml-3">
 <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
 {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
 </Button>
 <Button variant="ghost" size="icon-sm">
 <RefreshCw className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 );
}
