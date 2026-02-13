import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "neo-focus h-9 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-0)] px-3 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]/70",
        className,
      )}
      {...props}
    />
  );
}
