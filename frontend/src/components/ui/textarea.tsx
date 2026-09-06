import * as React from "react";

import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
 label?: string;
 error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({ className, label, error, id, ...props }, ref) => {
 const textareaId = id || React.useId();

 return (
 <div className="w-full">
 {label && (
 <label
 htmlFor={textareaId}
 className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
 >
 {label}
 </label>
 )}
 <textarea
 id={textareaId}
 className={cn(
 "flex min-h-[80px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y",
 error && "border-danger focus:ring-danger",
 className
 )}
 ref={ref}
 {...props}
 />
 {error && (
 <p className="mt-1.5 text-sm text-danger" role="alert">
 {error}
 </p>
 )}
 </div>
 );
 }
);
Textarea.displayName = "Textarea";

export { Textarea };
