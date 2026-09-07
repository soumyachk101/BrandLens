export function formatNumber(value: number, decimals = 0): string {
 return new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(value);
}

export function formatPercentage(value: number, decimals = 1): string {
 return `${value.toFixed(decimals)}%`;
}

export function formatRelativeDate(date: Date | string | number): string {
 const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
 const now = new Date();
 const diff = now.getTime() - d.getTime();
 const seconds = Math.floor(diff / 1000);
 const minutes = Math.floor(seconds / 60);
 const hours = Math.floor(minutes / 60);
 const days = Math.floor(hours / 24);

 if (seconds < 60) return "just now";
 if (minutes < 60) return `${minutes}m ago`;
 if (hours < 24) return `${hours}h ago`;
 if (days < 7) return `${days}d ago`;
 return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatCompact(value: number): string {
 return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function getTrendDirection(trend: number): "up" | "down" | "neutral" {
 if (trend > 0) return "up";
 if (trend < 0) return "down";
 return "neutral";
}
