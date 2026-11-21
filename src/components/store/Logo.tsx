import { Link } from "@tanstack/react-router";
import mark from "@/assets/logo-mark_color.png.asset.json";
import word from "@/assets/logo-word_color.png.asset.json";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return <img src={mark.url} alt="" aria-hidden="true" className={cn("h-8 w-auto", className)} />;
}

export function Logo({ className, withWord = true }: { className?: string; withWord?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="Athenks home"
      className={cn("press flex min-w-0 shrink-0 items-center gap-3 rounded-md py-2", className)}
    >
      <LogoMark className="h-8 sm:h-9" />
      {withWord && <img src={word.url} alt="Athenks" className="h-3 w-auto sm:h-4" />}
    </Link>
  );
}
