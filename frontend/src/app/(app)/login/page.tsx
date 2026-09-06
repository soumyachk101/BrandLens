"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setTimeout(() => setLoading(false), 1500);
 };

 return (
 <div className="min-h-screen flex">
 {/* Left side - Branding */}
 <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 text-white p-12 flex-col justify-between">
 <div>
 <Link href="/" className="flex items-center gap-2 mb-8">
 <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
 <Sparkles className="h-6 w-6 text-white" />
 </div>
 <span className="text-2xl font-bold text-white">BrandLens</span>
 </Link>
 <h1 className="text-4xl font-bold mb-4 leading-tight">
 See what AI says<br />about your brand
 </h1>
 <p className="text-lg text-white/80 max-w-md">
 Track your brand visibility across ChatGPT, Perplexity, Claude, and more.
 </p>
 </div>
 <div className="space-y-2">
 <p className="text-white/60 text-sm">Trusted by 500+ agencies worldwide</p>
 <div className="flex gap-4 text-white/40 text-sm">
 <span>Acme Digital</span>
 <span>·</span>
 <span>MediaHub</span>
 <span>·</span>
 <span>GrowthLabs</span>
 </div>
 </div>
 </div>

 {/* Right side - Form */}
 <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
 <div className="w-full max-w-sm">
 <div className="lg:hidden flex items-center gap-2 mb-8">
 <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
 <Sparkles className="h-5 w-5 text-white" />
 </div>
 <span className="text-xl font-bold">BrandLens</span>
 </div>
 <Card className="p-6 shadow-lg border-0">
 <div className="mb-6">
 <h2 className="text-2xl font-bold">Welcome back</h2>
 <p className="text-sm text-slate-500 mt-1">Sign in to your agency account</p>
 </div>
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1.5">Email</label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
 <Input
 type="email"
 placeholder="admin@agency.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="pl-9"
 required
 />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1.5">Password</label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
 <Input
 type="password"
 placeholder="••••••••"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="pl-9"
 required
 />
 </div>
 </div>
 <div className="flex items-center justify-between text-sm">
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="checkbox" className="rounded border-slate-300" />
 <span>Remember me</span>
 </label>
 <a href="#" className="text-primary hover:underline">Forgot password?</a>
 </div>
 <Button type="submit" className="w-full" disabled={loading}>
 {loading ? "Signing in..." : "Sign In"}
 <ArrowRight className="ml-2 h-4 w-4" />
 </Button>
 </form>
 <div className="mt-6">
 <div className="relative">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-t" />
 </div>
 <div className="relative flex justify-center text-sm">
 <span className="px-2 bg-white text-slate-500">Or continue with</span>
 </div>
 </div>
 <div className="mt-4 grid grid-cols-2 gap-3">
 <Button variant="outline" type="button">Google</Button>
 <Button variant="outline" type="button">Microsoft</Button>
 </div>
 </div>
 <p className="text-center text-sm text-slate-500 mt-6">
 Don't have an account?{" "}
 <Link href="/" className="text-primary font-medium hover:underline">
 Start free trial
 </Link>
 </p>
 </Card>
 </div>
 </div>
 </div>
 );
}
