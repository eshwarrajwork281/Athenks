import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ClipboardList, LogOut, Package, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryTab } from "@/components/admin/InventoryTab";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { PartiesTab } from "@/components/admin/PartiesTab";
import { LogoMark } from "@/components/store/Logo";
import { siteConfig } from "@/data/siteConfig";
import { adminLogin, adminLogout } from "@/services/api";
import { useApp } from "@/lib/use-app";
import { cn } from "@/lib/utils";

type Tab = "parties" | "inventory" | "orders";
const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "parties", label: "Parties List", icon: Users },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "orders", label: "Orders", icon: ClipboardList },
];

export const Route = createFileRoute("/admin")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } => {
    const tab = s["tab"];
    return tab === "parties" || tab === "inventory" || tab === "orders" ? { tab } : {};
  },
  head: () => ({
    meta: [
      { title: "Staff panel · Athenks" },
      { name: "description", content: "Private Athenks staff panel for parties, inventory and orders." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Staff panel · Athenks" },
      { property: "og:description", content: "Private Athenks staff panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const app = useApp();
  if (!app.ready) return <div className="min-h-screen" />;
  return app.adminAuthed ? <AdminShell /> : <LoginCard />;
}

function LoginCard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminLogin(username, password)) setError("Username or password is not right.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <LogoMark className="h-12" />
          <h1 className="heading-3">Athenks staff</h1>
          <p className="body-4 text-muted-foreground">Parties, rates, stock and orders. Staff only.</p>
        </div>
        <form onSubmit={submit} className="mt-8 flex flex-col gap-6 rounded-lg border border-border p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-user">Username</Label>
            <Input
              id="admin-user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-pass">Password</Label>
            <Input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-md border border-foreground px-4 py-3 body-3">
              {error}
            </p>
          )}
          <Button type="submit" size="lg">
            Log in
          </Button>
        </form>
        <div className="mt-4 flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-12"
            onClick={() => {
              setUsername(siteConfig.admin.username);
              setPassword(siteConfig.admin.password);
              setError(null);
            }}
          >
            Fill demo admin (<span className="mono-num">{siteConfig.admin.username} / {siteConfig.admin.password}</span>)
          </Button>
          <Link to="/" className="inline-flex h-12 items-center body-3 text-muted-foreground hover:text-foreground">
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminShell() {
  const { tab = "parties" } = Route.useSearch();
  const navigate = useNavigate({ from: "/admin" });
  const go = (t: Tab) => navigate({ search: { tab: t } });

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-30 border-b border-border bg-background md:h-screen md:border-b-0 md:border-r">
        <div className="flex h-16 items-center justify-between gap-2 px-4 md:h-20 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark className="h-8" />
            <span className="truncate title-3">Staff panel</span>
          </div>
          <div className="flex items-center md:hidden">
            <Button asChild variant="ghost" size="sm" className="h-12">
              <Link to="/">Store</Link>
            </Button>
            <Button variant="ghost" size="sm" className="h-12" onClick={adminLogout}>
              Log out
            </Button>
          </div>
        </div>
        <nav
          aria-label="Staff sections"
          className="grid grid-cols-3 gap-2 px-4 pb-3 md:flex md:flex-col md:gap-1 md:px-3 md:pb-0"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={cn(
                "press flex h-12 items-center justify-center gap-3 rounded-md px-2 button-sm md:justify-start md:px-4 md:button-md",
                tab === t.id
                  ? "bg-foreground text-background"
                  : "border border-border text-foreground hover:bg-accent md:border-transparent",
              )}
            >
              <t.icon className="hidden h-5 w-5 md:block" strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 hidden flex-col gap-1 border-t border-border p-3 md:flex">
          <Link
            to="/"
            className="press flex h-12 items-center gap-3 rounded-md px-4 button-md hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
            Back to store
          </Link>
          <button
            type="button"
            onClick={adminLogout}
            className="press flex h-12 items-center gap-3 rounded-md px-4 button-md hover:bg-accent"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.5} />
            Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-8 md:px-12 md:py-12">
        {tab === "parties" && <PartiesTab />}
        {tab === "inventory" && <InventoryTab />}
        {tab === "orders" && <OrdersTab />}
      </main>
    </div>
  );
}
