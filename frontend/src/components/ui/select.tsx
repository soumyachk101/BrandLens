"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const SelectContext = React.createContext<{ value: string; onChange: (v: string) => void }>({ value: "", onChange: () => {} });

const Select: React.FC<{ value: string; onValueChange: (v: string) => void; children: React.ReactNode; className?: string }> = ({ value, onValueChange, children, className }) => (
 <SelectContext.Provider value={{ value, onChange: onValueChange }}>
 <div className={cn("relative", className)}>{children}</div>
 </SelectContext.Provider>
);

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => {
 const { value, onChange } = React.useContext(SelectContext);
 const [open, setOpen] = React.useState(false);
 React.useEffect(() => { const h = () => setOpen(false); document.addEventListener("click", h); return () => document.removeEventListener("click", h); }, []);
 return (
 <button ref={ref} className={cn("flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900", className)} onClick={(e) => { e.stopPropagation(); setOpen(!open); }} {...props}>
 <span>{value || "Select..."}</span>
 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-2"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
 {open && (<div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-200 bg-white py-1 dark:border-zinc-800 dark:bg-zinc-900 shadow-lg" onClick={(e) => e.stopPropagation()}>
 <SelectContent />
 </div>)}
 </button>
 );
});

const SelectContent: React.FC = () => {
 const { value, onChange } = React.useContext(SelectContext);
 return React.Children.map(SelectContentChildren, (child) => {
 if (React.isValidElement(child) && child.type === SelectItem) {
 return React.cloneElement(child as React.ReactElement<any>, {
 onClick: () => { onChange((child.props as any).value); },
 selected: (child.props as any).value === value,
 });
 }
 return null;
 });
};

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> { value: string; children: React.ReactNode; }
const SelectItem: React.FC<SelectItemProps> = ({ value, children, selected, className, ...props }) => (
 <div className={cn("relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800", selected && "bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100", className)} {...props}>{children}</div>
);

const SelectValue: React.FC<{ placeholder?: string }> = () => null;

const SelectContentChildren: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
