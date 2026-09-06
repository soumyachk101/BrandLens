"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/features/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
 User,
 Shield,
 Key,
 Bell,
 Globe,
 Palette,
 Users,
 CreditCard,
 Save,
 Upload,
 Plus,
 Trash2,
 CheckCircle2,
 XCircle,
 AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
 const [saved, setSaved] = useState(false);
 const [formData, setFormData] = useState({
 agencyName: "Acme Digital Agency",
 email: "admin@acmeagency.com",
 timezone: "America/Los_Angeles",
 primaryColor: "#8B5CF6",
 brandName: "Acme Monitor",
 whiteLabelDomain: "",
 hidePoweredBy: true,
 emailAlerts: true,
 sentimentAlerts: true,
 competitorAlerts: false,
 weeklyDigest: true,
 });

 const handleSave = () => {
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 };

 return (
 <DashboardShell
 title="Settings"
 description="Manage your agency configuration"
 >
 <div className="max-w-4xl">
 <Tabs defaultValue="profile" className="space-y-6">
 <TabsList className="w-full justify-start">
 <TabsTrigger value="profile">Profile</TabsTrigger>
 <TabsTrigger value="white-label">White-label</TabsTrigger>
 <TabsTrigger value="notifications">Notifications</TabsTrigger>
 <TabsTrigger value="api">API & Webhooks</TabsTrigger>
 <TabsTrigger value="billing">Billing</TabsTrigger>
 </TabsList>

 <TabsContent value="profile" className="space-y-6">
 <Card>
 <div className="p-6">
 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
 <User className="h-5 w-5" />
 Agency Profile
 </h3>
 <div className="space-y-4 max-w-lg">
 <div>
 <label className="block text-sm font-medium mb-1">Agency Name</label>
 <Input
 value={formData.agencyName}
 onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Contact Email</label>
 <Input
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Timezone</label>
 <select
 className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
 value={formData.timezone}
 onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
 >
 <option value="America/Los_Angeles">Pacific Time (PT)</option>
 <option value="America/New_York">Eastern Time (ET)</option>
 <option value="Europe/London">London (GMT)</option>
 <option value="Europe/Berlin">Berlin (CET)</option>
 <option value="Asia/Tokyo">Tokyo (JST)</option>
 <option value="Asia/Kolkata">India (IST)</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Current Plan</label>
 <div className="flex items-center gap-3">
 <Badge variant="default">Growth</Badge>
 <span className="text-sm text-slate-500">$79/month · Renews Oct 6, 2026</span>
 <Button variant="outline" size="sm" className="ml-auto">Change Plan</Button>
 </div>
 </div>
 </div>
 <div className="flex justify-end mt-6">
 <Button onClick={handleSave}>
 <Save className="h-4 w-4 mr-1.5" />
 {saved ? "Saved!" : "Save Changes"}
 </Button>
 </div>
 </div>
 </Card>

 <Card>
 <div className="p-6">
 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
 <Users className="h-5 w-5" />
 Team Members
 </h3>
 <div className="space-y-3">
 {[
 { name: "John Doe", email: "john@acme.com", role: "Owner", avatar: "JD" },
 { name: "Jane Smith", email: "jane@acme.com", role: "Account Manager", avatar: "JS" },
 { name: "Bob Wilson", email: "bob@acme.com", role: "Analyst", avatar: "BW" },
 ].map((member, i) => (
 <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
 <div className="flex items-center gap-3">
 <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
 {member.avatar}
 </div>
 <div>
 <p className="text-sm font-medium">{member.name}</p>
 <p className="text-xs text-slate-500">{member.email}</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <Badge variant="outline">{member.role}</Badge>
 {member.role !== "Owner" && (
 <Button variant="ghost" size="sm" className="text-danger">
 <Trash2 className="h-3.5 w-3.5" />
 </Button>
 )}
 </div>
 </div>
 ))}
 </div>
 <Button variant="outline" size="sm" className="mt-4">
 <Plus className="h-3.5 w-3.5 mr-1.5" />
 Invite Team Member
 </Button>
 </div>
 </Card>
 </TabsContent>

 <TabsContent value="white-label" className="space-y-6">
 <Card>
 <div className="p-6">
 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
 <Palette className="h-5 w-5" />
 Branding
 </h3>
 <div className="space-y-4 max-w-lg">
 <div>
 <label className="block text-sm font-medium mb-1">Brand Name</label>
 <Input
 value={formData.brandName}
 onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
 placeholder="Your agency brand name"
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Primary Color</label>
 <div className="flex items-center gap-3">
 <input
 type="color"
 value={formData.primaryColor}
 onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
 className="h-10 w-14 rounded-md border cursor-pointer"
 />
 <span className="text-sm text-slate-500">{formData.primaryColor}</span>
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Logo</label>
 <div className="flex items-center gap-3">
 <div className="h-16 w-16 rounded-lg border border-dashed flex items-center justify-center">
 <Upload className="h-6 w-6 text-slate-400" />
 </div>
 <Button variant="outline" size="sm">Upload Logo</Button>
 </div>
 </div>
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium">Hide "Powered by BrandLens"</p>
 <p className="text-xs text-slate-500">Remove BrandLens branding from reports</p>
 </div>
 <Badge variant={formData.hidePoweredBy ? "success" : "secondary"}>
 {formData.hidePoweredBy ? "Enabled" : "Disabled"}
 </Badge>
 </div>
 </div>
 </div>
 </Card>
 </TabsContent>

 <TabsContent value="notifications" className="space-y-6">
 <Card>
 <div className="p-6">
 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
 <Bell className="h-5 w-5" />
 Notification Preferences
 </h3>
 <div className="space-y-4">
 {[
 { key: "emailAlerts", label: "Email Alerts", desc: "Receive email notifications for important events" },
 { key: "sentimentAlerts", label: "Sentiment Changes", desc: "Alert when brand sentiment changes significantly" },
 { key: "competitorAlerts", label: "Competitor Updates", desc: "Get notified when competitor visibility changes" },
 { key: "weeklyDigest", label: "Weekly Digest", desc: "Receive a weekly summary of all brand activity" },
 ].map((item) => (
 <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0">
 <div>
 <p className="text-sm font-medium">{item.label}</p>
 <p className="text-xs text-slate-500">{item.desc}</p>
 </div>
 <button
 onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key as keyof typeof formData] })}
 className={cn(
 "relative h-6 w-11 rounded-full transition-colors",
 formData[item.key as keyof typeof formData] ? "bg-primary" : "bg-slate-300"
 )}
 >
 <span className={cn(
 "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
 formData[item.key as keyof typeof formData] ? "translate-x-5.5" : "translate-x-0.5"
 )} />
 </button>
 </div>
 ))}
 </div>
 <div className="flex justify-end mt-6">
 <Button onClick={handleSave}>
 <Save className="h-4 w-4 mr-1.5" />
 {saved ? "Saved!" : "Save Changes"}
 </Button>
 </div>
 </div>
 </Card>
 </TabsContent>

 <TabsContent value="api" className="space-y-6">
 <Card>
 <div className="p-6">
 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
 <Key className="h-5 w-5" />
 API Keys
 </h3>
 <div className="space-y-3">
 <div>
 <label className="block text-sm font-medium mb-1">API Key</label>
 <div className="flex gap-2">
 <Input value="sk_live_abc123def456ghi789" readOnly className="font-mono text-sm" />
 <Button variant="outline" size="sm">Copy</Button>
 <Button variant="outline" size="sm">Regenerate</Button>
 </div>
 <p className="text-xs text-slate-500 mt-1">Use this key for API integrations. Keep it secret.</p>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Webhook Endpoint</label>
 <div className="flex gap-2">
 <Input placeholder="https://your-app.com/webhooks/brandlens" />
 <Button variant="outline" size="sm">Add</Button>
 </div>
 </div>
 </div>
 </div>
 </Card>
 </TabsContent>

 <TabsContent value="billing" className="space-y-6">
 <Card>
 <div className="p-6">
 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
 <CreditCard className="h-5 w-5" />
 Billing & Subscription
 </h3>
 <div className="space-y-4">
 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
 <div>
 <p className="font-medium">Growth Plan</p>
 <p className="text-sm text-slate-500">$79/month · Renews Oct 6, 2026</p>
 </div>
 <Badge variant="success">Active</Badge>
 </div>
 <div>
 <p className="text-sm font-medium mb-3">Usage This Period</p>
 <div className="space-y-3">
 <UsageBar label="Brands" current={6} max={10} />
 <UsageBar label="Reports" current={18} max={100} />
 <UsageBar label="API Calls" current={4200} max={10000} />
 </div>
 </div>
 <Separator />
 <div>
 <p className="text-sm font-medium mb-2">Payment Method</p>
 <p className="text-sm text-slate-500">Visa ending in 4242</p>
 <Button variant="outline" size="sm" className="mt-2">Update Payment</Button>
 </div>
 </div>
 </div>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 </DashboardShell>
 );
}

function UsageBar({ label, current, max }: { label: string; current: number; max: number }) {
 const pct = Math.min(100, (current / max) * 100);
 return (
 <div>
 <div className="flex justify-between text-sm mb-1">
 <span className="text-slate-600">{label}</span>
 <span className="font-medium tabular-nums">{current.toLocaleString()} / {max.toLocaleString()}</span>
 </div>
 <Progress value={pct} />
 </div>
 );
}

function cn(...classes: (string | boolean | undefined)[]) {
 return classes.filter(Boolean).join(" ");
}
