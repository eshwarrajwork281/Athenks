import { Camera, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/store/StatusPill";
import {
  addDesign,
  changeStock,
  FriendlyError,
  loadSampleStock,
  removeDesign,
  updateDesign,
} from "@/services/api";
import { compressImage } from "@/lib/image";
import { useApp } from "@/lib/use-app";
import {
  formatRupees,
  isOutOfStock,
  PIECES_PER_CARTON,
  PIECES_PER_SET,
  type Design,
} from "@/lib/wholesale";

const packText = (pieces: number) => {
  const sets = Math.floor(pieces / PIECES_PER_SET);
  const cartons = Math.floor(pieces / PIECES_PER_CARTON);
  return `${sets} sets · ${cartons} ${cartons === 1 ? "carton" : "cartons"}`;
};

export function InventoryTab() {
  const app = useApp();
  const [adding, setAdding] = useState(false);
  const designs = [...app.designs].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h1 className="heading-2">Inventory</h1>
          <p className="mt-2 body-4 text-muted-foreground">
            Godown stock goes down by itself when a party orders. Under 9 pieces shows as out of stock.
          </p>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)}>
            <Plus />
            <span className="hidden sm:inline">Upload new design</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        )}
      </div>

      {adding && <UploadForm onClose={() => setAdding(false)} />}

      {designs.length === 0 ? (
        <div className="mt-8 flex flex-col items-start gap-4 rounded-lg border border-border p-6">
          <p className="body-2">No designs yet. Upload your first shirt photo, or load the sample stock.</p>
          <Button variant="outline" onClick={loadSampleStock}>
            Load sample Athenks stock
          </Button>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {designs.map((d) => (
            <InventoryRow key={d.id} design={d} />
          ))}
        </ul>
      )}
    </div>
  );
}

function UploadForm({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [designNo, setDesignNo] = useState("");
  const [fabric, setFabric] = useState("");
  const [sizeRange, setSizeRange] = useState("28 to 36");
  const [baseRate, setBaseRate] = useState("");
  const [stock, setStock] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setImage(await compressImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open this photo.");
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = Math.round(Number(baseRate));
    const pieces = Math.round(Number(stock));
    if (!image) return setError("Add a photo of the shirt.");
    if (!designNo.trim()) return setError("Enter the design number.");
    if (!(rate > 0)) return setError("Enter the base rate per piece.");
    if (!(pieces >= 0) || stock === "") return setError("Enter the godown stock in pieces.");
    try {
      addDesign({
        designNo,
        fabric: fabric.trim() || "Athenks shirt",
        sizeRange: sizeRange.trim() || "28 to 36",
        baseRate: rate,
        stockPieces: pieces,
        image,
      });
      onClose();
    } catch (err) {
      setError(err instanceof FriendlyError ? err.message : "Could not save this design.");
    }
  };

  const pieces = Math.max(0, Math.round(Number(stock) || 0));

  return (
    <form onSubmit={submit} className="rise-in mt-8 flex flex-col gap-6 rounded-lg border border-foreground p-4 md:p-6">
      <h2 className="title-1">New design</h2>
      <div className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
        <div className="flex flex-col gap-2">
          <span className="title-3">Shirt photo</span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="press relative grid aspect-[3/4] w-full max-w-60 place-items-center overflow-hidden rounded-lg border border-dashed border-foreground hover:bg-accent"
          >
            {image ? (
              <img src={image} alt="New design preview" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 px-4 text-center body-3">
                <Camera className="h-6 w-6" strokeWidth={1.5} />
                {busy ? "Preparing photo" : "Take or choose photo"}
              </span>
            )}
          </button>
          {image && (
            <Button type="button" variant="ghost" size="sm" className="h-12 self-start" onClick={() => fileRef.current?.click()}>
              Change photo
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>
        <div className="grid content-start gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nd-no">Design number</Label>
            <Input id="nd-no" value={designNo} onChange={(e) => setDesignNo(e.target.value)} className="mono-num" placeholder="346" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nd-size">Size range</Label>
            <Input id="nd-size" value={sizeRange} onChange={(e) => setSizeRange(e.target.value)} className="mono-num" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nd-rate">Base rate (₹ per piece)</Label>
            <Input id="nd-rate" type="number" inputMode="numeric" value={baseRate} onChange={(e) => setBaseRate(e.target.value)} className="mono-num" placeholder="420" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nd-stock">Godown stock (pieces)</Label>
            <Input id="nd-stock" type="number" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} className="mono-num" placeholder="540" />
            <p className="mono-num caption-2 text-subtle-foreground">{packText(pieces)}</p>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="nd-fabric">Fabric note (optional)</Label>
            <Input id="nd-fabric" value={fabric} onChange={(e) => setFabric(e.target.value)} placeholder="Cotton check, half sleeve, chest pocket" />
          </div>
        </div>
      </div>
      {error && (
        <p role="alert" className="rounded-md border border-foreground px-4 py-3 body-3">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={busy}>
          Add design
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function InventoryRow({ design }: { design: Design }) {
  const [editing, setEditing] = useState(false);
  const [rate, setRate] = useState(String(design.baseRate));
  const [stock, setStock] = useState(String(design.stockPieces));
  const [confirmRemove, setConfirmRemove] = useState(false);
  const out = isOutOfStock(design.stockPieces);

  const save = () => {
    const r = Math.round(Number(rate));
    const s = Math.round(Number(stock));
    updateDesign(design.id, {
      baseRate: r > 0 ? r : design.baseRate,
      stockPieces: s >= 0 ? s : design.stockPieces,
    });
    setEditing(false);
  };

  return (
    <li className="rounded-lg border border-border p-4 md:p-6">
      <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 md:grid-cols-[72px_minmax(0,1fr)_auto]">
        <img src={design.image} alt={`Design ${design.designNo}`} className="h-20 w-16 rounded-sm border border-border object-cover md:h-24 md:w-18" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mono-num title-1">Design {design.designNo}</p>
            {out && <StatusPill solid>Out of stock</StatusPill>}
          </div>
          <p className="mono-num body-3 text-muted-foreground">Base {formatRupees(design.baseRate)} / pc</p>
          <p className="mono-num body-1 mt-1">
            {design.stockPieces} pcs <span className="body-4 text-muted-foreground">· {packText(design.stockPieces)}</span>
          </p>
        </div>
        <div className="col-span-2 flex flex-wrap gap-2 md:col-span-1 md:flex-col md:items-end">
          <Button variant="quiet" size="sm" className="h-12" onClick={() => changeStock(design.id, PIECES_PER_SET)}>
            + 1 set
          </Button>
          <Button variant="quiet" size="sm" className="h-12" onClick={() => changeStock(design.id, PIECES_PER_CARTON)}>
            + 1 carton
          </Button>
          <Button variant="ghost" size="sm" className="h-12" onClick={() => setEditing((v) => !v)}>
            {editing ? "Close" : "Edit"}
          </Button>
        </div>
      </div>

      {editing && (
        <div className="rise-in mt-4 flex flex-col gap-4 border-t border-border pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`r-${design.id}`}>Base rate (₹ per piece)</Label>
              <Input id={`r-${design.id}`} type="number" inputMode="numeric" className="mono-num" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`s-${design.id}`}>Godown stock (pieces)</Label>
              <Input id={`s-${design.id}`} type="number" inputMode="numeric" className="mono-num" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={save}>Save</Button>
            {confirmRemove ? (
              <>
                <Button variant="outline" onClick={() => removeDesign(design.id)}>
                  Yes, remove design
                </Button>
                <Button variant="ghost" onClick={() => setConfirmRemove(false)}>
                  Keep it
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmRemove(true)}>
                Remove from collection
              </Button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
