import { useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useStoreUI } from "./ui-context";

/** Calm inline confirmation line shown under a page header. */
export function Flash() {
  const { flash, setFlash } = useStoreUI();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const here = pathname.replace(/\/$/, "") || "/";
  if (!flash || flash.path !== here) return null;
  return (
    <div
      role="status"
      className="rise-in flex items-center justify-between gap-4 rounded-md border border-foreground py-2 pl-4 pr-2 body-3"
    >
      <p>{flash.message}</p>
      <button
        type="button"
        onClick={() => setFlash(null)}
        className="press grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-accent"
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
