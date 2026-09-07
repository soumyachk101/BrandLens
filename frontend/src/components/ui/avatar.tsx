"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
 name?: string;
 src?: string;
 initials?: string;
 size?: "sm" | "md" | "lg";
}

const Avatar: React.FC<AvatarProps> = ({ name, src, initials, size = "md", className, ...props }) => {
 const initialsText = initials || name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
 const sizeClasses = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-lg" };
 return (
 <div className={cn("relative flex shrink-0 overflow-hidden rounded-full bg-indigo-600 text-white", sizeClasses[size], className)} {...props}>
 {src ? <img src={src} alt={name || ""} className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center font-medium">{initialsText}</span>}
 </div>
 );
};

export { Avatar };
