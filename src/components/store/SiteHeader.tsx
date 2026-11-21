import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { activeParty } from "@/services/api";
import { useApp } from "@/lib/use-app";
import { Logo } from "./Logo";
import { useStoreUI } from "./ui-context";

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/collection", label: "Collection" },
  { to: "/orders", label: "Orders" },
  { to: "/about", label: "About Us" },
] as const;

export function SiteHeader() {
  const app = useApp();
  const party = activeParty(app);
  const { setCartOpen, openParty } = useStoreUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = app.cart.length;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 md:h-20 md:grid-cols-[auto_1fr_auto] md:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center justify-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="press rounded-md px-4 py-3 title-3 text-muted-foreground hover:bg-accent hover:text-foreground data-[status=active]:text-foreground data-[status=active]:underline data-[status=active]:underline-offset-8"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {party && (
            <button
              type="button"
              onClick={() => openParty({ goToCollection: false })}
              className="press hidden h-10 max-w-48 items-center truncate rounded-full border border-border px-4 button-sm hover:border-foreground lg:inline-flex"
              title="Change party"
            >
              <span className="truncate">{party.companyName}</span>
            </button>
          )}
          <Button variant="outline" size="sm" className="h-12 px-4" onClick={() => setCartOpen(true)}>
            <ShoppingBag />
            <span>
              Cart (<span className="mono-num">{count}</span>)
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-12 px-3 md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
            <span className="sr-only sm:not-sr-only">Menu</span>
          </Button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-full">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-16 items-center border-b border-border px-4">
            <Logo />
          </div>
          <nav aria-label="Mobile" className="flex flex-col px-4 py-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                onClick={() => setMenuOpen(false)}
                className="press flex h-16 items-center border-b border-border heading-4 text-muted-foreground data-[status=active]:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3 border-t border-border p-4">
            {party ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate body-1">{party.companyName}</p>
                  <p className="mono-num caption-2 text-subtle-foreground">{party.gstin}</p>
                </div>
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={() => {
                    setMenuOpen(false);
                    openParty({ goToCollection: false });
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setMenuOpen(false);
                  openParty();
                }}
              >
                Enter GST number
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
