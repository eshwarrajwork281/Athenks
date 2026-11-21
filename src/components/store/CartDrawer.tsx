import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  activeParty,
  FriendlyError,
  placeOrder,
  removeCartLine,
  setCartQty,
} from "@/services/api";
import { useApp } from "@/lib/use-app";
import {
  formatRupees,
  maxQtyFor,
  piecesFor,
  piecesInCart,
  rateFor,
  unitLabel,
} from "@/lib/wholesale";
import { PartyForm } from "./PartyForm";
import { QuantityStepper } from "./QuantityStepper";
import { useStoreUI } from "./ui-context";

export function CartDrawer() {
  const app = useApp();
  const party = activeParty(app);
  const { cartOpen, setCartOpen, openParty, setFlash } = useStoreUI();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const lines = app.cart
    .map((line, index) => {
      const design = app.designs.find((d) => d.id === line.designId);
      if (!design) return null;
      const rate = rateFor(design, party);
      const pieces = piecesFor(line.unit, line.qty);
      const cap = maxQtyFor(
        line.unit,
        design.stockPieces - piecesInCart(app.cart, line.designId, index),
      );
      return { line, index, design, rate, pieces, total: rate * pieces, cap };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const totalPieces = lines.reduce((n, l) => n + l.pieces, 0);
  const total = lines.reduce((n, l) => n + l.total, 0);

  const onPlace = () => {
    setError(null);
    setPlacing(true);
    try {
      const order = placeOrder();
      setFlash({
        message: `Order received by Athenks staff. Your order number is ${order.id}.`,
        path: "/orders",
      });
      setCartOpen(false);
      navigate({ to: "/orders" });
    } catch (e) {
      setError(e instanceof FriendlyError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <div className="border-b border-border px-6 py-6 pr-16">
          <SheetTitle className="heading-4">Cart</SheetTitle>
          <SheetDescription className="body-4 text-muted-foreground">
            {lines.length === 0
              ? "Nothing added yet."
              : `${lines.length} ${lines.length === 1 ? "design" : "designs"} · ${totalPieces} pieces`}
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto">
          <section className="border-b border-border px-6 py-6" aria-label="Ordering as">
            {party ? (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="caption-1 text-subtle-foreground">Ordering as</p>
                  <p className="truncate body-1">{party.companyName}</p>
                  <p className="mono-num body-4 text-muted-foreground">{party.gstin}</p>
                </div>
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={() => {
                    setCartOpen(false);
                    openParty({ goToCollection: false });
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="body-3">Enter your party details to see your rate and place the order.</p>
                <PartyForm submitLabel="Save party details" onDone={() => undefined} />
              </div>
            )}
          </section>

          {lines.length === 0 ? (
            <div className="flex flex-col items-start gap-4 px-6 py-12">
              <p className="body-2 text-muted-foreground">Add designs from the collection to start an order.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setCartOpen(false);
                  navigate({ to: "/collection" });
                }}
              >
                See collection
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col">
              {lines.map(({ line, index, design, rate, pieces, total: lt, cap }) => (
                <li key={`${line.designId}-${line.unit}`} className="border-b border-border px-6 py-6">
                  <div className="flex gap-4">
                    <img
                      src={design.image}
                      alt={`Design ${design.designNo}`}
                      className="h-24 w-20 shrink-0 rounded-sm border border-border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="mono-num title-2">Design {design.designNo}</p>
                      <p className="mono-num body-4 text-muted-foreground">
                        {unitLabel(line.unit, line.qty)} · {pieces} pcs
                      </p>
                      <p className="mono-num body-4 text-muted-foreground">
                        {formatRupees(rate)} / pc
                      </p>
                      <p className="mono-num body-1 mt-1">{formatRupees(lt)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <QuantityStepper
                      size="md"
                      label={`Quantity of ${line.unit === "set" ? "sets" : "cartons"}`}
                      value={line.qty}
                      max={Math.max(line.qty, cap)}
                      onChange={(q) => setCartQty(index, q)}
                    />
                    <Button variant="ghost" size="sm" className="h-12" onClick={() => removeCartLine(index)}>
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-border px-6 py-6">
            <dl className="flex flex-col gap-2">
              <div className="flex justify-between body-4 text-muted-foreground">
                <dt>Total pieces</dt>
                <dd className="mono-num">{totalPieces}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="title-2">Order total</dt>
                <dd className="mono-num heading-4">{formatRupees(total)}</dd>
              </div>
            </dl>
            <p className="mt-2 caption-2 text-subtle-foreground">
              No payment here. Athenks staff will prepare your bill.
            </p>
            {error && (
              <p role="alert" className="mt-4 rounded-md border border-foreground px-4 py-3 body-3">
                {error}
              </p>
            )}
            <Button
              size="lg"
              className="mt-4 w-full"
              onClick={onPlace}
              disabled={!party || placing}
            >
              Place order
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
