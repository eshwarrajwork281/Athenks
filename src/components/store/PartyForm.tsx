import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { identifyParty } from "@/services/api";
import { isValidGstin, normalizeGstin, type Party } from "@/lib/wholesale";

export function PartyForm({
  onDone,
  submitLabel = "View my rates",
  initialName = "",
  initialGstin = "",
}: {
  onDone: (result: { party: Party; isNew: boolean }) => void;
  submitLabel?: string;
  initialName?: string;
  initialGstin?: string;
}) {
  const [name, setName] = useState(initialName);
  const [gstin, setGstin] = useState(initialGstin);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Enter your company name.");
    if (!isValidGstin(gstin)) return setError("Enter a valid 15 digit GST number.");
    setError(null);
    onDone(identifyParty(name, gstin));
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="party-name">Company name</Label>
        <Input
          id="party-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="organization"
          placeholder="Shree Balaji Garments"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="party-gst">GST number (15 digit GSTIN)</Label>
        <Input
          id="party-gst"
          value={gstin}
          onChange={(e) => setGstin(normalizeGstin(e.target.value))}
          className="mono-num uppercase tracking-wider"
          placeholder="19AABCS1429B1Z5"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          maxLength={15}
          required
        />
        <p className="caption-2 text-subtle-foreground">
          <span className="mono-num">{gstin.length}</span> of 15 characters
        </p>
      </div>
      {error && (
        <p role="alert" className="rounded-md border border-foreground px-4 py-3 body-3">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
