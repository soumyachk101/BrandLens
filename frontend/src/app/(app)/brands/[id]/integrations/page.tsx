import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Webhook, Bot, Bell, Slack, Database, Globe } from "lucide-react";

export default function IntegrationsPage({ params }: { params: { id: string } }) {
 const integrations = [
 { name: "Slack", description: "Send alerts to your Slack channels", icon: Slack, connected: true, color: "text-purple-600" },
 { name: "Webhooks", description: "Send notifications to custom endpoints", icon: Webhook, connected: true, color: "text-indigo-600" },
 { name: "MCP Server", description: "Connect AI models via Model Context Protocol", icon: Bot, connected: false, color: "text-green-600" },
 { name: "Push Notifications", description: "Browser push notifications", icon: Bell, connected: true, color: "text-amber-600" },
 { name: "Data Export (S3)", description: "Export data to S3 buckets", icon: Database, connected: false, color: "text-orange-600" },
 { name: "API Access", description: "REST API for custom integrations", icon: Globe, connected: true, color: "text-sky-600" },
 ];

 return (
 <AppShell>
 <PageHeader title="Integrations" subtitle="Connect BrandLens to your tools" breadcrumbs={[{ label: "Brands", href: "/brands" }, { label: params.id, href: `/brands/${params.id}` }, { label: "Integrations" }]} />
 <Card className="p-6 mb-6">
 <h3 className="font-medium mb-4">Webhook URL</h3>
 <div className="flex gap-2">
 <Input defaultValue={`https://api.brandlens.io/v1/brands/${params.id}/webhook`} readOnly className="font-mono text-xs" />
 <Button variant="outline" size="sm">Copy</Button>
 <Button variant="outline" size="sm">Regenerate</Button>
 </div>
 </Card>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {integrations.map((i) => {
 const Icon = i.icon;
 return (
 <Card key={i.name} className="p-5">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <Icon className={`h-8 w-8 ${i.color}`} />
 <div>
 <h3 className="font-semibold text-zinc-900 dark:text-white">{i.name}</h3>
 <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{i.description}</p>
 </div>
 </div>
 </div>
 <div className="mt-4 flex items-center justify-between">
 <Badge variant={i.connected ? "success" : "outline"}>{i.connected ? "Connected" : "Available"}</Badge>
 <Button size="sm" variant={i.connected ? "outline" : "default"}>{i.connected ? "Configure" : "Connect"}</Button>
 </div>
 </Card>
 );
 })}
 </div>
 </AppShell>
 );
}
