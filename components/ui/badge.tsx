import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide", {
  variants: {
    variant: {
      neutral: "border-[color:var(--border)] bg-white/[0.03] text-[color:var(--muted)]",
      success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
      warning: "border-[color:var(--accent-amber)]/35 bg-[color:var(--accent-amber)]/10 text-[color:var(--accent-amber)]",
      danger: "border-[color:var(--accent-risk)]/45 bg-[color:var(--accent-risk)]/12 text-[color:var(--accent-risk)]",
      info: "border-[color:var(--accent-teal)]/35 bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
