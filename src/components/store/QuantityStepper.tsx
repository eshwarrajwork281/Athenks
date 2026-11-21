import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label,
  size = "lg",
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
  size?: "lg" | "md";
}) {
  const box = size === "lg" ? "h-14 w-14" : "h-12 w-12";
  return (
    <div
      className="inline-flex items-stretch overflow-hidden rounded-md border border-foreground"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={cn("press grid place-items-center hover:bg-accent active:bg-pressed disabled:opacity-30", box)}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease"
      >
        <Minus className="h-5 w-5" strokeWidth={1.5} />
      </button>
      <span
        className={cn(
          "mono-num grid min-w-14 place-items-center border-x border-foreground px-2",
          size === "lg" ? "title-1" : "title-2",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={cn("press grid place-items-center hover:bg-accent active:bg-pressed disabled:opacity-30", box)}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase"
      >
        <Plus className="h-5 w-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
