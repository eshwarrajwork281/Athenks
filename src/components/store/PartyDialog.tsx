import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { activeParty } from "@/services/api";
import { useApp } from "@/lib/use-app";
import { PartyForm } from "./PartyForm";
import { useStoreUI } from "./ui-context";

export function PartyDialog() {
  const app = useApp();
  const party = activeParty(app);
  const { partyOpen, closeParty, goToCollectionAfterParty, setFlash } = useStoreUI();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Dialog open={partyOpen} onOpenChange={(o) => !o && closeParty()}>
      <DialogContent className="w-[calc(100%-32px)] max-w-md gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-2 pr-12">
          <DialogTitle className="heading-4">Your party details</DialogTitle>
          <DialogDescription className="body-4 text-muted-foreground">
            No login needed. Your GST number shows the rates agreed with Athenks.
          </DialogDescription>
        </div>
        <PartyForm
          key={party?.gstin ?? "new"}
          initialName={party?.companyName ?? ""}
          onDone={({ party: p, isNew }) => {
            setFlash({
              message: isNew
                ? `Welcome, ${p.companyName}. You are seeing base rates until Athenks sets your party rate.`
                : `Welcome back, ${p.companyName}. Your party rates are showing.`,
              path: goToCollectionAfterParty ? "/collection" : pathname.replace(/\/$/, "") || "/",
            });
            closeParty();
            if (goToCollectionAfterParty) navigate({ to: "/collection" });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
