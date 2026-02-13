import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "neo-focus min-h-24 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-0)] px-3 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]/70",
        className,
      )}
      {...props}
    />
  );
}
