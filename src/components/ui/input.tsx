import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "calm flex h-12 w-full rounded-md border border-input bg-transparent px-4 body-2 text-foreground placeholder:text-subtle-foreground hover:border-ink-50 focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:body-3",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
