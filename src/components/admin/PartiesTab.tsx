import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { addParty, FriendlyError, updateParty } from "@/services/api";
import { useApp } from "@/lib/use-app";
import {
  formatAdjustment,
  formatRupees,
  isValidGstin,
  normalizeGstin,
  rateFor,
  type Party,
} from "@/lib/wholesale";
import { AdjustmentField } from "./AdjustmentField";

export function PartiesTab() {
  const app = useApp();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const parties = [...app.parties].sort((a, b) => a.companyName.localeCompare(b.companyName));
  const editingParty = parties.find((p) => p.gstin === editing) ?? null;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h1 className="heading-2">Parties List</h1>
          <p className="mt-2 body-4 text-muted-foreground">
            Each party sees only their own rate, linked to their GST number. Tap a party to change it.
          </p>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)}>
            <Plus />
            <span className="hidden sm:inline">Add new party</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>

      {adding && <AddPartyForm onClose={() => setAdding(false)} />}

      <ul className="mt-8 flex flex-col gap-3">
        {parties.map((p) => {
          const custom = Object.keys(p.overrides).length;
          return (
            <li key={p.gstin}>
              <button
                type="button"
                onClick={() => setEditing(p.gstin)}
                className="press grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-border p-4 text-left hover:border-foreground hover:bg-accent md:p-6"
              >
                <div className="min-w-0">
                  <p className="truncate title-2">{p.companyName}</p>
                  <p className="mono-num body-4 text-muted-foreground">{p.gstin}</p>
                  <p className="mt-2 mono-num body-3">
                    {formatAdjustment(p.adjustment)}
                    {custom > 0 && ` · ${custom} custom design ${custom === 1 ? "rate" : "rates"}`}
                  </p>
                </div>
                <span className="flex items-center gap-1 button-sm text-muted-foreground">
                  Edit rates
                  <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Sheet open={!!editingParty} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
          {editingParty && (
            <PartyEditor key={editingParty.gstin} party={editingParty} onClose={() => setEditing(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AddPartyForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [gstin, setGstin] = useState("");
  const [adjustment, setAdjustment] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Enter the company name.");
    if (!isValidGstin(gstin)) return setError("Enter a valid 15 digit GST number.");
    try {
      addParty({ companyName: name, gstin, adjustment });
      onClose();
    } catch (err) {
      setError(err instanceof FriendlyError ? err.message : "Could not add this party.");
    }
  };

  return (
    <form onSubmit={submit} className="rise-in mt-8 flex flex-col gap-6 rounded-lg border border-foreground p-4 md:p-6">
      <h2 className="title-1">New party</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="np-name">Company name</Label>
          <Input id="np-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="np-gst">GST number</Label>
          <Input
            id="np-gst"
            value={gstin}
            onChange={(e) => setGstin(normalizeGstin(e.target.value))}
            className="mono-num uppercase"
            maxLength={15}
            autoCapitalize="characters"
            spellCheck={false}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="title-3">Party rate</span>
        <AdjustmentField idPrefix="np" value={adjustment} onChange={setAdjustment} />
      </div>
      {error && (
        <p role="alert" className="rounded-md border border-foreground px-4 py-3 body-3">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit">Save party</Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function PartyEditor({ party, onClose }: { party: Party; onClose: () => void }) {
  const app = useApp();
  const [name, setName] = useState(party.companyName);
  const [adjustment, setAdjustment] = useState(party.adjustment);
  const [overrides, setOverrides] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(party.overrides).map(([k, v]) => [k, String(v)])),
  );
  const [saved, setSaved] = useState(false);

  const draft: Party = {
    ...party,
    adjustment,
    overrides: Object.fromEntries(
      Object.entries(overrides)
        .map(([k, v]) => [k, Math.round(Number(v))] as const)
        .filter(([, v]) => Number.isFinite(v) && v > 0),
    ),
  };

  const save = () => {
    updateParty(party.gstin, {
      companyName: name.trim() || party.companyName,
      adjustment: draft.adjustment,
      overrides: draft.overrides,
    });
    setSaved(true);
  };

  return (
    <>
      <div className="border-b border-border px-6 py-6 pr-16">
        <SheetTitle className="heading-4 truncate">{party.companyName}</SheetTitle>
        <SheetDescription className="mono-num body-4 text-muted-foreground">{party.gstin}</SheetDescription>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pe-name">Company name</Label>
          <Input
            id="pe-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <span className="title-3">Rate on every design</span>
          <AdjustmentField
            idPrefix="pe"
            value={adjustment}
            onChange={(v) => {
              setAdjustment(v);
              setSaved(false);
            }}
          />
        </div>

        <div className="mt-8">
          <p className="title-3">Exact rate for a design</p>
          <p className="mt-1 body-4 text-muted-foreground">
            Leave empty to use the rate above. A number here wins for this party only.
          </p>
          <ul className="mt-4 flex flex-col">
            {app.designs.map((d) => (
              <li
                key={d.id}
                className="grid grid-cols-[40px_minmax(0,1fr)_112px] items-center gap-3 border-t border-border py-3"
              >
                <img src={d.image} alt="" className="h-12 w-10 rounded-sm border border-border object-cover" />
                <div className="min-w-0">
                  <p className="mono-num body-1 truncate">{d.designNo}</p>
                  <p className="mono-num caption-2 text-subtle-foreground">
                    Base {formatRupees(d.baseRate)} · Now {formatRupees(rateFor(d, draft))}
                  </p>
                </div>
                <Input
                  type="number"
                  inputMode="numeric"
                  aria-label={`Exact rate for design ${d.designNo}`}
                  placeholder="₹ / pc"
                  className="mono-num px-3"
                  value={overrides[d.id] ?? ""}
                  onChange={(e) => {
                    setOverrides((o) => ({ ...o, [d.id]: e.target.value }));
                    setSaved(false);
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-border px-6 py-6">
        {saved && (
          <p role="status" className="body-3">
            Saved. {party.companyName} now sees these rates.
          </p>
        )}
        <div className="flex gap-3">
          <Button className="flex-1" onClick={save}>
            Save changes
          </Button>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}
