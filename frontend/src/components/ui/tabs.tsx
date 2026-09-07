"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{ value: string; onChange: (v: string) => void }>({ value: "", onChange: () => {} });

const Tabs: React.FC<{ value: string; onValueChange: (v: string) => void; children: React.ReactNode; className?: string }> = ({ value, onValueChange, children, className }) => (
 <TabsContext.Provider value={{ value, onChange: onValueChange }}>
 <div className={cn("w-full", className)}>{children}</div>
 </TabsContext.Provider>
);

const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
 const { value, onChange } = React.useContext(TabsContext);
 return (
 <div role="tablist" className={cn("inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 p-1 dark:bg-zinc-800", className)} onClick={(e) => {
 const t = e.target as HTMLElement;
 if (t.dataset.tab) onChange(t.dataset.tab);
 }} {...props} />
 );
};

interface TabsTriggerProps extends React.HTMLAttributes<HTMLButtonElement> { value: string; }
const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, className, ...props }) => {
 const { value: active, onChange } = React.useContext(TabsContext);
 return (
 <button data-tab={value} onClick={() => onChange(value)} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all hover:text-zinc-900 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 dark:hover:text-zinc-100", active === value ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400", className)} {...props} />
 );
};

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> { value: string; }
const TabsContent: React.FC<TabsContentProps> = ({ value, className, ...props }) => {
 const { value: active } = React.useContext(TabsContext);
 if (value !== active) return null;
 return <div className={cn("mt-2 ring-offset-background focus-visible:outline-none", className)} {...props} />;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
