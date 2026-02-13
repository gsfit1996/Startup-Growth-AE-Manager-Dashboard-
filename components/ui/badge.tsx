import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      neutral: "bg-slate-700/70 text-slate-100",
      success: "bg-emerald-600/20 text-emerald-300",
      warning: "bg-amber-600/20 text-amber-300",
      danger: "bg-red-600/20 text-red-300",
      info: "bg-sky-600/20 text-sky-300",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
