import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "neo-focus h-4 w-4 rounded border border-[color:var(--border)] bg-[color:var(--surface-0)] text-[color:var(--accent-teal)]",
        className,
      )}
      {...props}
    />
  );
}
