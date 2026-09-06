'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: 'default' | 'secondary' | 'outline' | 'ghost';
 size?: 'default' | 'sm' | 'lg';
 isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant = 'default', size = 'default', isLoading, children, disabled, ...props }, ref) => {
 return (
 <button
 className={cn(
 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
 {
 'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
 'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
 'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
 'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
 },
 {
 'h-10 px-4 py-2': size === 'default',
 'h-9 rounded-md px-3': size === 'sm',
 'h-11 rounded-md px-8': size === 'lg',
 },
 className
 )}
 ref={ref}
 disabled={disabled || isLoading}
 {...props}
 >
 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 {children}
 </button>
 );
 }
);

Button.displayName = 'Button';

export { Button };
