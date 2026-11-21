import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md cursor-pointer select-none disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary",
        outline:
          "border border-foreground bg-transparent text-foreground hover:bg-accent active:bg-pressed",
        quiet: "border border-border bg-transparent text-foreground hover:border-foreground hover:bg-accent active:bg-pressed",
        ghost: "text-foreground hover:bg-accent active:bg-pressed",
        link: "text-foreground underline underline-offset-4 decoration-1 hover:decoration-2",
        inverse: "bg-primary-foreground text-primary hover:bg-primary-foreground/90",
        "inverse-outline":
          "border border-primary-foreground/50 text-primary-foreground hover:border-primary-foreground hover:bg-primary-foreground/10",
        destructive: "border border-foreground bg-transparent text-foreground hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-pressed",
      },
      size: {
        default: "h-12 px-5 button-md",
        lg: "h-14 px-6 button-lg",
        sm: "h-10 px-3 button-sm",
        pill: "h-10 rounded-full px-4 button-sm",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
