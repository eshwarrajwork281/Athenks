import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Mode = "less" | "base" | "more";

/** Pick less / base / more and an amount in rupees per piece. Value is signed, e.g. -15. */
export function AdjustmentField({
  value,
  onChange,
  idPrefix,
}: {
  value: number;
  onChange: (next: number) => void;
  idPrefix: string;
}) {
  const mode: Mode = value < 0 ? "less" : value > 0 ? "more" : "base";
  const amount = Math.abs(value);
  const setMode = (m: Mode) => {
    const amt = amount || 10;
    onChange(m === "base" ? 0 : m === "less" ? -amt : amt);
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Rate rule">
        {(
          [
            ["less", "Less −₹"],
            ["base", "Base rate"],
            ["more", "More +₹"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={cn(
              "press h-12 rounded-md border button-sm",
              mode === m
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground hover:bg-accent",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {mode !== "base" && (
        <div className="flex items-center gap-3">
          <label htmlFor={`${idPrefix}-amt`} className="body-3 shrink-0">
            {mode === "less" ? "Less by ₹" : "More by ₹"}
          </label>
          <Input
            id={`${idPrefix}-amt`}
            type="number"
            inputMode="numeric"
            min={1}
            className="mono-num w-28"
            value={amount || ""}
            onChange={(e) => {
              const n = Math.max(0, Math.round(Number(e.target.value) || 0));
              onChange(mode === "less" ? -n : n);
            }}
          />
          <span className="body-4 text-muted-foreground">per piece</span>
        </div>
      )}
    </div>
  );
}
