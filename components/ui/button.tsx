import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "neo-focus inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[color:var(--accent-teal)] text-[#041118] shadow-[0_10px_28px_-14px_rgba(26,201,192,0.95)] hover:brightness-110",
        secondary:
          "border-[color:var(--border)] bg-[color:var(--surface-1)] text-[color:var(--foreground)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--elevated)]",
        ghost:
          "border-transparent bg-transparent text-[color:var(--muted)] hover:text-[color:var(--foreground)] hover:bg-white/[0.04]",
        outline:
          "border-[color:var(--border)] bg-transparent text-[color:var(--foreground)] hover:border-[color:var(--border-strong)] hover:bg-white/[0.04]",
        danger:
          "border-transparent bg-[color:var(--accent-risk)] text-white shadow-[0_10px_24px_-14px_rgba(239,95,111,0.85)] hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-5 text-[15px]",
      },
      density: {
        compact: "rounded-md",
        comfortable: "rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      density: "comfortable",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, density, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, density }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

