import { Link } from "@tanstack/react-router";
import { formatRupees, isOutOfStock, rateFor, type Design, type Party } from "@/lib/wholesale";
import { StatusPill } from "./StatusPill";

export function ShirtCard({ design, party }: { design: Design; party: Party | null }) {
  const out = isOutOfStock(design.stockPieces);
  return (
    <Link
      to="/collection/$id"
      params={{ id: design.id }}
      className="group press flex flex-col gap-4 rounded-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border">
        <img
          src={design.image}
          alt={`Athenks shirt, Design ${design.designNo}`}
          loading="lazy"
          className="calm h-full w-full object-cover duration-300 group-hover:scale-[1.02]"
        />
        {out && <StatusPill className="absolute left-3 top-3">Out of stock</StatusPill>}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mono-num title-1 truncate">Design {design.designNo}</p>
          <p className="body-3 text-muted-foreground">
            {design.sizeRange} · 9 pcs per set
          </p>
        </div>
        <p className="mono-num title-1 shrink-0 text-right">
          {formatRupees(rateFor(design, party))}
          <span className="block caption-2 text-subtle-foreground">per pc</span>
        </p>
      </div>
    </Link>
  );
}

export function ShirtCardSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="aspect-[3/4] rounded-lg bg-skeleton" />
      <div className="h-6 w-2/3 rounded-sm bg-skeleton" />
      <div className="h-4 w-1/2 rounded-sm bg-skeleton" />
    </div>
  );
}
