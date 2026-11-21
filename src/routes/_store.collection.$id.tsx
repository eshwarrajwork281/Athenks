import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/store/QuantityStepper";
import { StatusPill } from "@/components/store/StatusPill";
import { useStoreUI } from "@/components/store/ui-context";
import { activeParty, addToCart, FriendlyError } from "@/services/api";
import { useApp } from "@/lib/use-app";
import {
  formatRupees,
  isOutOfStock,
  maxQtyFor,
  PIECES_PER_CARTON,
  piecesFor,
  piecesInCart,
  rateFor,
  stockLabel,
  unitLabel,
  type Unit,
} from "@/lib/wholesale";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_store/collection/$id")({
  head: () => ({
    meta: [
      { title: "Shirt design · Athenks collection" },
      {
        name: "description",
        content: "See this Athenks shirt design, your party rate, live godown stock and order in sets or cartons.",
      },
      { property: "og:title", content: "Shirt design · Athenks collection" },
      { property: "og:description", content: "Athenks wholesale shirt design with party rate and live stock." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesignPage,
});

function DesignPage() {
  const { id } = Route.useParams();
  const app = useApp();
  const party = activeParty(app);
  const { setCartOpen, openParty } = useStoreUI();
  const [unit, setUnit] = useState<Unit>("set");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const design = app.designs.find((d) => d.id === id);

  if (!app.ready) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:px-8 lg:grid-cols-2" aria-hidden="true">
        <div className="aspect-[3/4] rounded-lg bg-skeleton" />
        <div className="flex flex-col gap-4">
          <div className="h-10 w-1/2 rounded-sm bg-skeleton" />
          <div className="h-6 w-3/4 rounded-sm bg-skeleton" />
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-start gap-6 px-4 py-24">
        <h1 className="heading-3">This design is no longer in the collection</h1>
        <Button asChild>
          <Link to="/collection">See collection</Link>
        </Button>
      </div>
    );
  }

  const rate = rateFor(design, party);
  const out = isOutOfStock(design.stockPieces);
  const availableForThis = design.stockPieces - piecesInCart(app.cart, design.id);
  const maxSets = maxQtyFor("set", availableForThis);
  const maxCartons = maxQtyFor("carton", availableForThis);
  const maxQty = unit === "set" ? maxSets : maxCartons;
  const safeQty = Math.max(1, Math.min(qty, Math.max(1, maxQty)));
  const pieces = piecesFor(unit, safeQty);
  const total = rate * pieces;
  const canAdd = !out && maxQty >= 1;

  const pickUnit = (u: Unit) => {
    setUnit(u);
    setQty(1);
    setError(null);
  };

  const onAdd = () => {
    setError(null);
    try {
      addToCart(design.id, unit, safeQty);
      setQty(1);
      setCartOpen(true);
    } catch (e) {
      setError(e instanceof FriendlyError ? e.message : "Could not add this design.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <Link
        to="/collection"
        className="press inline-flex h-12 items-center gap-2 rounded-md pr-4 button-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        Back to collection
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="relative overflow-hidden rounded-lg border border-border lg:sticky lg:top-28 lg:self-start">
          <img
            src={design.image}
            alt={`Athenks shirt, Design ${design.designNo}`}
            className="aspect-[3/4] h-full w-full object-cover"
          />
          {out && <StatusPill className="absolute left-4 top-4">Out of stock</StatusPill>}
        </div>

        <div className="flex flex-col">
          <h1 className="mono-num heading-2">Design {design.designNo}</h1>
          <p className="mt-2 body-2 text-muted-foreground">{design.fabric}</p>

          <div className="mt-8 flex flex-col gap-2 rounded-lg border border-border p-4">
            <p className="mono-num body-3">1 set = 9 pieces (sizes {design.sizeRange})</p>
            <p className="mono-num body-3">1 carton = 30 sets ({PIECES_PER_CARTON} pieces)</p>
          </div>

          <div className="mt-8 flex items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <p className="caption-1 text-subtle-foreground">
                {party ? `Rate for ${party.companyName}` : "Base rate"}
              </p>
              <p className="mono-num heading-3">
                {formatRupees(rate)} <span className="body-4 text-muted-foreground">/ pc</span>
              </p>
            </div>
            {!party && (
              <Button variant="link" className="h-12 px-0" onClick={() => openParty({ goToCollection: false })}>
                See my party rate
              </Button>
            )}
          </div>

          <p className={cn("mt-6 mono-num body-1", out && "text-muted-foreground")}>
            {stockLabel(design.stockPieces)}
          </p>

          <fieldset className="mt-8" disabled={out}>
            <legend className="title-3">Order in</legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(
                [
                  ["set", "Set (9 pcs)", maxSets],
                  ["carton", "Carton (30 sets)", maxCartons],
                ] as const
              ).map(([u, label, max]) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => pickUnit(u)}
                  disabled={max < 1}
                  aria-pressed={unit === u}
                  className={cn(
                    "press h-12 rounded-full border px-4 button-md disabled:opacity-40",
                    unit === u
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground hover:bg-accent",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <QuantityStepper
              label={unit === "set" ? "Number of sets" : "Number of cartons"}
              value={safeQty}
              max={Math.max(1, maxQty)}
              onChange={setQty}
            />
            <p className="mono-num body-3 text-muted-foreground">
              {canAdd ? `Up to ${maxQty} ${unit === "set" ? "sets" : "cartons"}` : "None left to add"}
            </p>
          </div>

          <dl className="mt-8 flex flex-col gap-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between gap-4 body-3">
              <dt>{unitLabel(unit, safeQty)}</dt>
              <dd className="mono-num">{pieces} pieces</dd>
            </div>
            <div className="flex justify-between gap-4 body-3 text-muted-foreground">
              <dt className="mono-num">
                {formatRupees(rate)} × {pieces}
              </dt>
              <dd className="mono-num body-1 text-foreground">{formatRupees(total)}</dd>
            </div>
          </dl>

          {error && (
            <p role="alert" className="mt-4 rounded-md border border-foreground px-4 py-3 body-3">
              {error}
            </p>
          )}

          <Button size="lg" className="mt-6 w-full" disabled={!canAdd} onClick={onAdd}>
            {out ? "Out of stock" : (
              <>
                Add to cart <span aria-hidden="true">|</span>
                <span className="mono-num">{formatRupees(total)}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
