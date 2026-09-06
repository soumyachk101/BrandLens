import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
 defaultValue: string;
 value?: string;
 onValueChange?: (value: string) => void;
 children: React.ReactNode;
 className?: string;
}

function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
 const [internalValue, setInternalValue] = React.useState(defaultValue);
 const active = value ?? internalValue;

 const handleChange = (newValue: string) => {
 if (value === undefined) setInternalValue(newValue);
 onValueChange?.(newValue);
 };

 return (
 <div className={cn("w-full", className)} data-value={active}>
 {React.Children.map(children, (child) => {
 if (React.isValidElement(child) && child.type === TabsList) {
 return React.cloneElement(child as React.ReactElement<TabsListProps>, {
 active,
 onValueChange: handleChange,
 });
 }
 if (React.isValidElement(child) && child.type === TabsContent) {
 return React.cloneElement(child as React.ReactElement<TabsContentProps>, {
 value: active,
 });
 }
 return child;
 })}
 </div>
 );
}

interface TabsListProps {
 active?: string;
 onValueChange?: (value: string) => void;
 children: React.ReactNode;
 className?: string;
}

function TabsList({ active, onValueChange, children, className }: TabsListProps) {
 return (
 <div
 className={cn(
 "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
 className
 )}
 role="tablist"
 >
 {React.Children.map(children, (child) => {
 if (React.isValidElement(child) && child.type === TabsTrigger) {
 const childValue = child.props.value;
 return React.cloneElement(child as React.ReactElement<{ active?: boolean; onClick?: () => void }>, {
 active: childValue === active,
 onClick: () => onValueChange?.(childValue),
 });
 }
 return child;
 })}
 </div>
 );
}

interface TabsTriggerProps {
 value: string;
 active?: boolean;
 onClick?: () => void;
 children: React.ReactNode;
 className?: string;
}

function TabsTrigger({ value, active, onClick, children, className }: TabsTriggerProps) {
 return (
 <button
 role="tab"
 aria-selected={active}
 className={cn(
 "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
 active && "bg-background text-foreground shadow-sm",
 !active && "text-muted-foreground hover:text-foreground",
 className
 )}
 onClick={onClick}
 >
 {children}
 </button>
 );
}

interface TabsContentProps {
 value: string;
 children: React.ReactNode;
 className?: string;
}

function TabsContent({ value, children, className }: TabsContentProps) {
 return (
 <div
 role="tabpanel"
 className={cn(
 "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
 className
 )}
 >
 {children}
 </div>
 );
}

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export { Tabs, TabsList, TabsTrigger, TabsContent };
