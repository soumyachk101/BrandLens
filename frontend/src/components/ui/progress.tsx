import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
 value?: number;
 indicatorClassName?: string;
}

function Progress({ value = 0, indicatorClassName, className, ...props }: ProgressProps) {
 const clamped = Math.min(100, Math.max(0, value));
 return (
 <div
 role="progressbar"
 aria-valuenow={clamped}
 aria-valuemin={0}
 aria-valuemax={100}
 className={cn(
 "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
 className
 )}
 {...props}
 >
 <div
 className={cn(
 "h-full w-full flex-1 bg-primary transition-all duration-500 ease-out",
 indicatorClassName
 )}
 style={{ transform: `translateX(-${100 - clamped}%)` }}
 />
 </div>
 );
}

export { Progress };
