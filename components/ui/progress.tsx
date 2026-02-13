import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "teal",
}: {
  value: number;
  className?: string;
  tone?: "teal" | "amber" | "risk";
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  const toneClass =
    tone === "amber"
      ? "bg-[color:var(--accent-amber)]"
      : tone === "risk"
        ? "bg-[color:var(--accent-risk)]"
        : "bg-[color:var(--accent-teal)]";

  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full border border-[color:var(--border)] bg-white/[0.03]", className)}>
      <div className={cn("h-full rounded-full transition-all duration-500", toneClass)} style={{ width: `${safeValue}%` }} />
    </div>
  );
}
