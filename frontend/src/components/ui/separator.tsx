"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const Separator: React.FC<React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }> = ({ className, orientation = "horizontal", ...props }) => (
 <div className={cn("shrink-0 bg-zinc-200 dark:bg-zinc-800", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)} {...props} />
);

export { Separator };
