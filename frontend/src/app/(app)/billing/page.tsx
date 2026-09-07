"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PLANS, MOCK_SUBSCRIPTION } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Check } from "lucide-react";

export default function BillingPage() {
 const currentPlan = MOCK_PLANS.find((p) => p.id === MOCK_SUBSCRIPTION.planId);
 const [billingPeriod, setBillingPeriod] = React.useState<"month" | "year">("month");

 return (
 <AppShell>
 <PageHeader title="Billing & Subscription" subtitle="Manage your plan and billing" />
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <Card className="p-6">
 <h3 className="text-lg font-semibold">Current Plan</h3>
 <div className="mt-4">
 <Badge variant="success" className="text-sm">{currentPlan?.name}</Badge>
 <p className="mt-4 text-3xl font-bold text-zinc-900 dark:text-white">{formatCurrency(currentPlan?.price || 0)}<span className="text-sm font-normal text-zinc-500">/month</span></p>
 <p className="mt-1 text-xs text-zinc-500">Renews {new Date(MOCK_SUBSCRIPTION.currentPeriodEnd).toLocaleDateString()}</p>
 </div>
 <div className="mt-6 space-y-2">
 <div className="flex justify-between text-sm"><span className="text-zinc-600 dark:text-zinc-400">Status</span><span className="font-medium capitalize">{MOCK_SUBSCRIPTION.status}</span></div>
 <div className="flex justify-between text-sm"><span className="text-zinc-600 dark:text-zinc-400">Brands</span><span className="font-medium">{currentPlan?.limits.brands === -1 ? "Unlimited" : `${currentPlan?.limits.brands} max`}</span></div>
 <div className="flex justify-between text-sm"><span className="text-zinc-600 dark:text-zinc-400">Queries</span><span className="font-medium">{currentPlan?.limits.queries === -1 ? "Unlimited" : `${currentPlan?.limits.queries}/mo`}</span></div>
 </div>
 <Button variant="outline" className="w-full mt-6">Cancel Plan</Button>
 </Card>
 <div className="lg:col-span-2">
 <Card className="p-6">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-semibold">Available Plans</h3>
 <div className="flex rounded-md border border-zinc-200 dark:border-zinc-800">
 <button onClick={() => setBillingPeriod("month")} className={`px-3 py-1.5 text-sm ${billingPeriod === "month" ? "bg-indigo-600 text-white" : "text-zinc-600 dark:text-zinc-400"}`}>Monthly</button>
 <button onClick={() => setBillingPeriod("year")} className={`px-3 py-1.5 text-sm ${billingPeriod === "year" ? "bg-indigo-600 text-white" : "text-zinc-600 dark:text-zinc-400"}`}>Yearly</button>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {MOCK_PLANS.map((plan) => (
 <div key={plan.id} className={`rounded-lg border p-4 ${MOCK_SUBSCRIPTION.planId === plan.id ? "border-indigo-600 ring-2 ring-indigo-600" : "border-zinc-200 dark:border-zinc-800"}`}>
 <h4 className="font-semibold">{plan.name}</h4>
 <p className="text-2xl font-bold mt-2">{formatCurrency(billingPeriod === "year" ? plan.price * 10 : plan.price)}<span className="text-sm font-normal text-zinc-500">/{billingPeriod}</span></p>
 <ul className="mt-4 space-y-2">
 {plan.features.map((f, i) => <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />{f}</li>)}
 </ul>
 {MOCK_SUBSCRIPTION.planId === plan.id ? <Button disabled className="w-full mt-4">Current Plan</Button> : <Button variant="outline" className="w-full mt-4">Switch Plan</Button>}
 </div>
 ))}
 </div>
 </Card>
 </div>
 </div>
 </AppShell>
 );
}
