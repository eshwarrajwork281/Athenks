import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CartDrawer } from "@/components/store/CartDrawer";
import { PartyDialog } from "@/components/store/PartyDialog";
import { SiteFooter } from "@/components/store/SiteFooter";
import { SiteHeader } from "@/components/store/SiteHeader";
import { StoreUIProvider } from "@/components/store/ui-context";

export const Route = createFileRoute("/_store")({
  component: StoreLayout,
});

function StoreLayout() {
  return (
    <StoreUIProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <CartDrawer />
      <PartyDialog />
    </StoreUIProvider>
  );
}
