"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
 icon?: boolean;
}

const ExternalLinkComponent = React.forwardRef<HTMLAnchorElement, ExternalLinkProps>(
 ({ className, icon = true, children, ...props }, ref) => (
 <a ref={ref} className={cn("inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 transition-colors", className)} {...props}>
 {icon && <ExternalLink className="h-3.5 w-3.5" />}
 {children}
 </a>
 )
);
ExternalLinkComponent.displayName = "ExternalLink";
export { ExternalLinkComponent as ExternalLink };
