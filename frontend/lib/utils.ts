import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
 return new Intl.DateTimeFormat('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 }).format(new Date(date));
}

export function formatNumber(num: number) {
 return new Intl.NumberFormat('en-US').format(num);
}
