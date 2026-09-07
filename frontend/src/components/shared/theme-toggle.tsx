"use client";
import * as React from "react";

export function ThemeToggle() {
 const [theme, setTheme] = React.useState<"light" | "dark" | "system">("system");

 React.useEffect(() => {
 const root = document.documentElement;
 const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
 if (isDark) root.classList.add("dark"); else root.classList.remove("dark");
 }, [theme]);

 return (
 <select value={theme} onChange={(e) => setTheme(e.target.value as any)} className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
 <option value="light">Light</option>
 <option value="dark">Dark</option>
 <option value="system">System</option>
 </select>
 );
}
