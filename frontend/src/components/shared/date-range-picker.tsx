"use client";
import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DateRangePickerProps { from?: Date; to?: Date; onRangeChange: (range: { from?: Date; to?: Date }) => void; }

export function DateRangePicker({ from, to, onRangeChange }: DateRangePickerProps) {
 const [open, setOpen] = React.useState(false);
 const [localFrom, setLocalFrom] = React.useState(from ? from.toISOString().split("T")[0] : "");
 const [localTo, setLocalTo] = React.useState(to ? to.toISOString().split("T")[0] : "");

 const apply = () => {
 onRangeChange({ from: localFrom ? new Date(localFrom) : undefined, to: localTo ? new Date(localTo) : undefined });
 setOpen(false);
 };

 return (
 <Popover>
 <PopoverTrigger asChild>
 <Button variant="outline" className="justify-start text-left">
 <CalendarIcon className="mr-2 h-4 w-4" />
 <span>{from && to ? `${formatDate(from)} - ${formatDate(to)}` : "Pick a date range"}</span>
 </Button>
 </PopoverTrigger>
 <PopoverContent align="end" className="w-auto p-3">
 <div className="grid gap-2">
 <div><label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">From</label><Input type="date" value={localFrom} onChange={(e) => setLocalFrom(e.target.value)} /></div>
 <div><label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">To</label><Input type="date" value={localTo} onChange={(e) => setLocalTo(e.target.value)} /></div>
 <Button size="sm" onClick={apply}>Apply</Button>
 </div>
 </PopoverContent>
 </Popover>
 );
}
