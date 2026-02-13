import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn("h-4 w-4 rounded border border-slate-600 bg-slate-900 text-teal-500", className)}
      {...props}
    />
  );
}
