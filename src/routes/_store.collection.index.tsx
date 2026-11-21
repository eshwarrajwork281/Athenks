import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Flash } from "@/components/store/Flash";
import { ShirtCard, ShirtCardSkeleton } from "@/components/store/ShirtCard";
import { useStoreUI } from "@/components/store/ui-context";
import { activeParty } from "@/services/api";
import { useApp } from "@/lib/use-app";

export const Route = createFileRoute("/_store/collection/")({
  head: () => ({
    meta: [
      { title: "Collection · Athenks wholesale shirts" },
      {
        name: "description",
        content: "All current Athenks shirt designs with your party rate per piece. Sizes 28 to 36, 9 pieces per set.",
      },
      { property: "og:title", content: "Collection · Athenks wholesale shirts" },
      { property: "og:description", content: "Current Athenks designs with private party rates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Collection,
});

function Collection() {
  const app = useApp();
  const party = activeParty(app);
  const { openParty } = useStoreUI();
  const designs = [...app.designs].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="flex flex-col gap-6">
        <h1 className="heading-1">Collection</h1>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-border px-4 py-3 md:px-6">
          {app.ready && party ? (
            <p className="min-w-0 body-3">
              Showing rates for <span className="body-1">{party.companyName}</span>
              <span className="mono-num block text-muted-foreground sm:inline">
                <span className="hidden sm:inline"> · </span>
                {party.gstin}
              </span>
            </p>
          ) : (
            <p className="min-w-0 body-3 text-muted-foreground">
              You are seeing base rates. Enter your GST number to see your party rate.
            </p>
          )}
          <Button
            variant={party ? "quiet" : "default"}
            size="sm"
            className="h-12"
            onClick={() => openParty({ goToCollection: false })}
          >
            {party ? "Change" : "Enter GST number"}
          </Button>
        </div>

        <Flash />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {!app.ready
          ? Array.from({ length: 3 }, (_, i) => <ShirtCardSkeleton key={i} />)
          : designs.map((d) => <ShirtCard key={d.id} design={d} party={party} />)}
      </div>

      {app.ready && designs.length === 0 && (
        <p className="py-16 text-center body-2 text-muted-foreground">
          New designs are on the way. Please check again soon.
        </p>
      )}
    </div>
  );
}
