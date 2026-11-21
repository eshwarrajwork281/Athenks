import { cn } from "@/lib/utils";

/** Monochrome status tag: solid for finished states, outline for open ones. */
export function StatusPill({
  children,
  solid = false,
  className,
}: {
  children: React.ReactNode;
  solid?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full border px-3 caption-1",
        solid
          ? "border-foreground bg-foreground text-background"
          : "border-foreground bg-background text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
