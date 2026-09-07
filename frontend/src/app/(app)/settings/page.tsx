import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
 return (
 <AppShell>
 <PageHeader title="Settings" subtitle="Manage your account, team, and integrations" />
 <Tabs defaultValue="profile">
 <TabsList>
 <TabsTrigger value="profile">Profile</TabsTrigger>
 <TabsTrigger value="team">Team</TabsTrigger>
 <TabsTrigger value="integrations">Integrations</TabsTrigger>
 <TabsTrigger value="white-label">White-label</TabsTrigger>
 <TabsTrigger value="api">API</TabsTrigger>
 <TabsTrigger value="notifications">Notifications</TabsTrigger>
 </TabsList>
 <TabsContent value="profile">
 <Card className="p-6 max-w-2xl space-y-4">
 <h3 className="text-lg font-semibold">Profile Settings</h3>
 <div><Label>Full Name</Label><Input defaultValue="Sarah Chen" /></div>
 <div><Label>Email</Label><Input defaultValue="sarah@agency.com" /></div>
 <div><Label>Agency Name</Label><Input defaultValue="Digital Marketing Pro" /></div>
 <div><Label>Timezone</Label>
 <select className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
 <option>UTC-8 (Pacific Time)</option>
 <option>UTC-5 (Eastern Time)</option>
 <option>UTC+0 (London)</option>
 </select>
 </div>
 <Button>Save Changes</Button>
 </Card>
 </TabsContent>
 <TabsContent value="team">
 <Card className="p-6 max-w-2xl">
 <h3 className="text-lg font-semibold mb-4">Team Settings</h3>
 <p className="text-sm text-zinc-500">Manage team preferences on the Team page.</p>
 </Card>
 </TabsContent>
 <TabsContent value="integrations">
 <Card className="p-6 max-w-2xl">
 <h3 className="text-lg font-semibold mb-4">Connected Services</h3>
 <p className="text-sm text-zinc-500">Manage integrations in the brand Integrations settings.</p>
 </Card>
 </TabsContent>
 <TabsContent value="white-label">
 <Card className="p-6 max-w-2xl space-y-4">
 <h3 className="text-lg font-semibold">White-label Settings</h3>
 <p className="text-sm text-zinc-500">Customize BrandLens to match your brand identity</p>
 <div><Label>Brand Name</Label><Input defaultValue="BrandLens" /></div>
 <div><Label>Logo URL</Label><Input placeholder="https://..." /></div>
 <div><Label>Primary Color</Label><Input type="color" defaultValue="#6366F1" /></div>
 <div className="flex items-center justify-between pt-2"><span className="text-sm">Custom Email Templates</span><Switch /></div>
 <div className="flex items-center justify-between"><span className="text-sm">Custom Domain</span><Switch /></div>
 </Card>
 </TabsContent>
 <TabsContent value="api">
 <Card className="p-6 max-w-2xl space-y-4">
 <h3 className="text-lg font-semibold">API Keys</h3>
 <div><Label>Public API Key</Label><div className="flex gap-2"><Input readOnly defaultValue="pk_live_xxxxxxxxxxxx" /><Button variant="outline" size="sm">Copy</Button></div></div>
 <div><Label>Secret API Key</Label><div className="flex gap-2"><Input type="password" readOnly defaultValue="sk_live_xxxxxxxxxxxx" /><Button variant="outline" size="sm">Reveal</Button></div></div>
 <Button>Generate New Key</Button>
 </Card>
 </TabsContent>
 <TabsContent value="notifications">
 <Card className="p-6 max-w-2xl space-y-4">
 <h3 className="text-lg font-semibold">Notification Preferences</h3>
 <div className="flex items-center justify-between"><span className="text-sm">Email Notifications</span><Switch defaultChecked /></div>
 <div className="flex items-center justify-between"><span className="text-sm">Slack Notifications</span><Switch defaultChecked /></div>
 <div className="flex items-center justify-between"><span className="text-sm">Visibility Drop Alerts</span><Switch defaultChecked /></div>
 <div className="flex items-center justify-between"><span className="text-sm">Mention Surge Alerts</span><Switch defaultChecked /></div>
 <div className="flex items-center justify-between"><span className="text-sm">Weekly Digest</span><Switch /></div>
 </Card>
 </TabsContent>
 </Tabs>
 </AppShell>
 );
}
