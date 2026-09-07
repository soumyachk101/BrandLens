"use client";
import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, MessageSquare, BarChart3, Shield, Zap, Globe, Star } from "lucide-react";

export default function LandingPage() {
 const features = [
 { icon: TrendingUp, title: "Visibility Tracking", description: "Monitor how often your brand appears across AI-generated responses" },
 { icon: MessageSquare, title: "AI Query Analysis", description: "Analyze and understand how AI models reference your brand" },
 { icon: BarChart3, title: "Competitor Intelligence", description: "Compare your visibility against competitors in AI responses" },
 { icon: Shield, title: "Sentiment Analysis", description: "Understand the sentiment context in which your brand is mentioned" },
 { icon: Zap, title: "Real-time Monitoring", description: "Get instant alerts when your brand visibility changes significantly" },
 { icon: Globe, title: "Multi-Model Coverage", description: "Track mentions across ChatGPT, Claude, Gemini, Perplexity and more" },
 ];

 const plans = [
 { name: "Starter", price: 29, features: ["3 Brands", "100 AI Queries/mo", "5 Reports/mo", "1 Team Member", "Email Support"], href: "/signup?plan=starter" },
 { name: "Pro", price: 79, features: ["10 Brands", "500 AI Queries/mo", "25 Reports/mo", "5 Team Members", "Priority Support", "White-label Reports"], href: "/signup?plan=pro", popular: true },
 { name: "Enterprise", price: 149, features: ["Unlimited Brands", "Unlimited Queries", "Unlimited Reports", "Unlimited Team Members", "Dedicated Support", "Custom Integrations", "SLA"], href: "/signup?plan=enterprise" },
 ];

 const caseStudies = [
 { quote: "BrandLens helped us increase our AI visibility by 340% in just 3 months.", author: "Marketing Director", company: "SaaS Company" },
 { quote: "The competitor analysis alone saved us hundreds of hours of manual research.", author: "SEO Lead", company: "E-commerce Platform" },
 { quote: "Finally, we can measure how AI models represent our brand in real-time.", author: "CMO", company: "Enterprise Tech" },
 ];

 return (
 <div className="min-h-screen bg-white dark:bg-zinc-950">
 <header className="border-b border-zinc-200 dark:border-zinc-800">
 <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
 <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">B</div><span className="text-xl font-bold text-zinc-900 dark:text-white">BrandLens</span></div>
 <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
 <a href="#features" className="hover:text-indigo-600">Features</a>
 <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
 <a href="#case-studies" className="hover:text-indigo-600">Case Studies</a>
 <a href="#pricing" className="hover:text-indigo-600">Get Started</a>
 </nav>
 <Button asChild><Link href="/dashboard">Start Free Trial</Link></Button>
 </div>
 </header>

 <section className="py-20 px-4 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-4xl text-center">
 <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight">Know what AI says about your brand</h1>
 <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">Monitor and optimize your brand visibility across all major AI models. Track mentions, analyze sentiment, and stay ahead of competitors.</p>
 <div className="mt-10 flex items-center justify-center gap-4"><Button size="lg" asChild><Link href="/dashboard">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link></Button><Button variant="outline" size="lg">Watch Demo</Button></div>
 </div>
 </section>

 <section id="features" className="py-20 bg-zinc-50 dark:bg-zinc-900">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-4">Everything you need to master AI visibility</h2>
 <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12">Powerful tools to track, analyze, and improve your brand's presence in AI-generated responses.</p>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {features.map((f, i) => (
 <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-lg transition-shadow">
 <f.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-4" />
 <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{f.title}</h3>
 <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{f.description}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 <section id="case-studies" className="py-20">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-12">Trusted by marketing teams worldwide</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {caseStudies.map((cs, i) => (
 <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
 <Star className="h-5 w-5 text-amber-400 mb-3" />
 <p className="text-zinc-700 dark:text-zinc-300 italic">"{cs.quote}"</p>
 <div className="mt-4"><p className="text-sm font-medium text-zinc-900 dark:text-white">{cs.author}</p><p className="text-xs text-zinc-500">{cs.company}</p></div>
 </div>
 ))}
 </div>
 </div>
 </section>

 <section id="pricing" className="py-20 bg-zinc-50 dark:bg-zinc-900">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-4">Simple, transparent pricing</h2>
 <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12">Start tracking your brand visibility today.</p>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
 {plans.map((plan, i) => (
 <div key={i} className={`rounded-xl border ${plan.popular ? "border-indigo-600 ring-2 ring-indigo-600" : "border-zinc-200 dark:border-zinc-800"} bg-white dark:bg-zinc-900 p-8`}>
 {plan.popular && <Badge className="mb-4">Most Popular</Badge>}
 <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{plan.name}</h3>
 <p className="mt-2 text-4xl font-bold text-zinc-900 dark:text-white">${plan.price}<span className="text-sm font-normal text-zinc-500">/mo</span></p>
 <ul className="mt-6 space-y-3">
 {plan.features.map((f, j) => <li key={j} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>)}
 </ul>
 <Button asChild className="w-full mt-8" variant={plan.popular ? "default" : "outline"}><Link href={plan.href}>Get Started</Link></Button>
 </div>
 ))}
 </div>
 </div>
 </section>

 <section className="py-20">
 <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
 <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Ready to master AI visibility?</h2>
 <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">Join hundreds of marketing teams using BrandLens to understand and improve their AI presence.</p>
 <Button size="lg" asChild><Link href="/dashboard">Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
 </div>
 </section>

 <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="flex flex-col md:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-2"><div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">B</div><span className="text-sm font-semibold text-zinc-900 dark:text-white">BrandLens</span></div>
 <p className="text-sm text-zinc-500"> BrandLens. All rights reserved.</p>
 </div>
 </div>
 </footer>
 </div>
 );
}
