import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/store/OrderCard";
import { setOrderStatus } from "@/services/api";
import { useApp } from "@/lib/use-app";
import { cn } from "@/lib/utils";

type Filter = "all" | "received" | "billed";

export function OrdersTab() {
  const app = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const all = [...app.orders].sort((a, b) => b.createdAt - a.createdAt);
  const orders = filter === "all" ? all : all.filter((o) => o.status === filter);
  const newCount = all.filter((o) => o.status === "received").length;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="heading-2">Orders</h1>
      <p className="mt-2 body-4 text-muted-foreground">
        Every order from every party. Make the bill in your usual way, then mark it billed.
      </p>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Show orders">
        {(
          [
            ["all", `All (${all.length})`],
            ["received", `New (${newCount})`],
            ["billed", `Billed (${all.length - newCount})`],
          ] as const
        ).map(([f, label]) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              "press mono-num h-12 rounded-full border px-5 button-sm",
              filter === f
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground hover:bg-accent",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {orders.length === 0 ? (
          <p className="rounded-lg border border-border p-6 body-2 text-muted-foreground">
            No orders here yet. New orders from parties will show up here.
          </p>
        ) : (
          orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              statusLabel={o.status === "billed" ? "Billed / Done" : "New"}
              header={
                <div className="mb-2">
                  <p className="truncate title-1">{o.companyName}</p>
                  <p className="mono-num body-4 text-muted-foreground">GST {o.gstin}</p>
                </div>
              }
              action={
                o.status === "received" ? (
                  <Button onClick={() => setOrderStatus(o.id, "billed")}>Mark as billed</Button>
                ) : (
                  <Button variant="quiet" onClick={() => setOrderStatus(o.id, "received")}>
                    Move back to new
                  </Button>
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
