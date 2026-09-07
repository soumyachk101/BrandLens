"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Mail } from "lucide-react";
import { MOCK_TEAM } from "@/lib/mock-data";

const roles = ["owner", "admin", "member", "viewer"];

export default function TeamPage() {
 const [members, setMembers] = React.useState(MOCK_TEAM);
 const [inviteEmail, setInviteEmail] = React.useState("");
 const [inviteRole, setInviteRole] = React.useState("member");

 const handleInvite = () => {
 if (!inviteEmail) return;
 setMembers((m) => [...m, { id: `t-${Date.now()}`, userId: `u-${Date.now()}`, name: inviteEmail.split("@")[0], email: inviteEmail, role: inviteRole as any, joinedAt: new Date().toISOString() }]);
 setInviteEmail("");
 };

 const updateRole = (id: string, role: string) => setMembers((m) => m.map((x) => x.id === id ? { ...x, role: role as any } : x));

 return (
 <AppShell>
 <PageHeader title="Team" subtitle="Manage your team members and permissions" actions={
 <div className="flex gap-2">
 <Input placeholder="Email to invite" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-64" />
 <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900">
 {roles.map((r) => <option key={r} value={r}>{r}</option>)}
 </select>
 <Button onClick={handleInvite}><Mail className="h-4 w-4 mr-2" />Invite</Button>
 </div>
 } />
 <Card>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-zinc-200 dark:border-zinc-800">
 <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Member</th>
 <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Role</th>
 <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Joined</th>
 <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Last Active</th>
 </tr>
 </thead>
 <tbody>
 {members.map((m) => (
 <tr key={m.id} className="border-b border-zinc-100 dark:border-zinc-800">
 <td className="py-3 px-4"><div className="flex items-center gap-3"><Avatar name={m.name} size="sm" /><div><p className="text-sm font-medium text-zinc-900 dark:text-white">{m.name}</p><p className="text-xs text-zinc-500">{m.email}</p></div></div></td>
 <td className="py-3 px-4">
 <select value={m.role} onChange={(e) => updateRole(m.id, e.target.value)} className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
 {roles.map((r) => <option key={r} value={r}>{r}</option>)}
 </select>
 </td>
 <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">{new Date(m.joinedAt).toLocaleDateString()}</td>
 <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">{m.lastActive ? new Date(m.lastActive).toLocaleDateString() : "Never"}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 </AppShell>
 );
}
