'use client';

import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
 label?: string;
 error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
 ({ className, label, error, ...props }, ref) => {
 return (
 <div className="space-y-1">
 {label && (
 <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
 {label}
 </label>
 )}
 <input
 className={cn(
 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
 error && 'border-destructive',
 className
 )}
 ref={ref}
 {...props}
 />
 {error && <p className="text-sm text-destructive">{error}</p>}
 </div>
 );
 }
);

Input.displayName = 'Input';

export { Input };
