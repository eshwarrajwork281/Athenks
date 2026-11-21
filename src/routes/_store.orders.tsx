import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flash } from "@/components/store/Flash";
import { OrderCard } from "@/components/store/OrderCard";
import { useStoreUI } from "@/components/store/ui-context";
import { phoneHref } from "@/data/siteConfig";
import { activeParty } from "@/services/api";
import { useApp } from "@/lib/use-app";

export const Route = createFileRoute("/_store/orders")({
  head: () => ({
    meta: [
      { title: "My orders · Athenks" },
      { name: "description", content: "Orders your company has placed with Athenks, with sets, cartons, pieces and totals." },
      { property: "og:title", content: "My orders · Athenks" },
      { property: "og:description", content: "Your Athenks wholesale orders in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Orders,
});

function Orders() {
  const app = useApp();
  const party = activeParty(app);
  const { openParty } = useStoreUI();
  const orders = party
    ? app.orders.filter((o) => o.gstin === party.gstin).sort((a, b) => b.createdAt - a.createdAt)
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      <h1 className="heading-1">Orders</h1>
      {party && (
        <p className="mt-2 body-3 text-muted-foreground">
          {party.companyName} · <span className="mono-num">{party.gstin}</span>
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <Flash />
        <a
          href={phoneHref()}
          className="press flex items-center gap-3 rounded-md border border-border px-4 py-3 body-3 hover:border-foreground"
        >
          <Phone className="h-5 w-5 shrink-0" strokeWidth={1.5} />
          Need changes to an order? Call Athenks staff directly.
        </a>
      </div>

      <div className="mt-12 flex flex-col gap-6">
        {!app.ready ? (
          <div className="h-48 rounded-lg bg-skeleton" aria-hidden="true" />
        ) : !party ? (
          <div className="flex flex-col items-start gap-4 rounded-lg border border-border p-6">
            <p className="body-2">Enter your GST number to see the orders your company has placed.</p>
            <Button onClick={() => openParty({ goToCollection: false })}>Enter GST number</Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-lg border border-border p-6">
            <p className="body-2">No orders placed yet.</p>
            <Button asChild>
              <Link to="/collection">See collection</Link>
            </Button>
          </div>
        ) : (
          orders.map((o) => (
            <OrderCard key={o.id} order={o} statusLabel={o.status === "billed" ? "Billed" : "Received"} />
          ))
        )}
      </div>
    </div>
  );
}
