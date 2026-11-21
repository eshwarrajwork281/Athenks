import { formatRupees, unitLabel, type Order } from "@/lib/wholesale";
import { StatusPill } from "./StatusPill";

export const formatDateTime = (ts: number) =>
  new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function OrderCard({
  order,
  statusLabel,
  header,
  action,
}: {
  order: Order;
  statusLabel: string;
  header?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-border">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border p-4 md:p-6">
        <div className="min-w-0">
          {header}
          <p className="mono-num title-2">Order {order.id}</p>
          <p className="caption-2 text-subtle-foreground">{formatDateTime(order.createdAt)}</p>
        </div>
        <StatusPill solid={order.status === "billed"}>{statusLabel}</StatusPill>
      </header>
      <ul className="flex flex-col">
        {order.items.map((item) => (
          <li
            key={`${item.designId}-${item.unit}`}
            className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-4 py-4 md:px-6"
          >
            <img
              src={item.image}
              alt=""
              className="h-16 w-12 rounded-sm border border-border object-cover"
            />
            <div className="min-w-0">
              <p className="mono-num body-1 truncate">Design {item.designNo}</p>
              <p className="mono-num body-4 text-muted-foreground">
                {unitLabel(item.unit, item.qty)} · {item.pieces} pcs · {formatRupees(item.rate)} / pc
              </p>
            </div>
            <p className="mono-num body-1">{formatRupees(item.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <footer className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-6">
        <div>
          <p className="mono-num body-4 text-muted-foreground">{order.totalPieces} pieces in total</p>
          <p className="mono-num heading-4">{formatRupees(order.total)}</p>
        </div>
        {action}
      </footer>
    </article>
  );
}
