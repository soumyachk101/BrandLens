"use client";
import * as React from "react";

interface ErrorBoundaryProps { children: React.ReactNode; fallback?: React.ReactNode; }

interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
 state: ErrorBoundaryState = { hasError: false, error: null };

 static getDerivedStateFromError(error: Error) {
 return { hasError: true, error };
 }

 componentDidCatch(error: Error) { console.error("ErrorBoundary caught:", error); }

 render() {
 if (this.state.hasError) {
 return this.props.fallback || (
 <div className="flex flex-col items-center justify-center p-8 text-center">
 <p className="text-lg font-semibold text-zinc-900 dark:text-white">Something went wrong</p>
 <p className="mt-2 text-sm text-zinc-500">{this.state.error?.message}</p>
 <button onClick={() => this.setState({ hasError: false, error: null })} className="mt-4 text-sm text-indigo-600 hover:underline">Try again</button>
 </div>
 );
 }
 return this.props.children;
 }
}
