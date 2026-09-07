"use client";
import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setTimeout(() => { setLoading(false); window.location.href = "/dashboard"; }, 1500);
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
 <Card className="w-full max-w-md p-8">
 <div className="text-center mb-8">
 <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg mx-auto">B</div>
 <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">Welcome back</h1>
 <p className="text-sm text-zinc-500">Sign in to your BrandLens account</p>
 </div>
 <form onSubmit={handleSubmit} className="space-y-4">
 <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
 <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
 <div className="flex items-center justify-between"><label className="flex items-center gap-2"><input type="checkbox" className="rounded border-zinc-300" /><span className="text-sm text-zinc-600 dark:text-zinc-400">Remember me</span></label><a href="#" className="text-sm text-indigo-600 hover:underline">Forgot password?</a></div>
 <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
 </form>
 <p className="mt-6 text-center text-sm text-zinc-500">Don't have an account? <Link href="/signup" className="text-indigo-600 hover:underline">Sign up</Link></p>
 </Card>
 </div>
 );
}
