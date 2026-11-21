/**
 * Athenks data layer. Every read and write for designs, parties, orders, the active party
 * and the cart goes through this file. It is backed by localStorage today; swap the
 * persist/load helpers for real API calls to move to a server later.
 */
import skyImg from "@/assets/shirt-sky.jpg.asset.json";
import lilacImg from "@/assets/shirt-lilac.jpg.asset.json";
import greyImg from "@/assets/shirt-grey.jpg.asset.json";
import sageImg from "@/assets/shirt-sage.jpg.asset.json";
import { siteConfig } from "@/data/siteConfig";
import {
  isOutOfStock,
  normalizeGstin,
  piecesFor,
  piecesInCart,
  rateFor,
  type CartItem,
  type Design,
  type Order,
  type OrderStatus,
  type Party,
  type Unit,
  maxQtyFor,
} from "@/lib/wholesale";

const KEYS = {
  seeded: "athenks.seeded.v1",
  designs: "athenks.designs.v1",
  parties: "athenks.parties.v1",
  orders: "athenks.orders.v1",
  session: "athenks.session.v1",
  cart: "athenks.cart.v1",
  admin: "athenks.admin.v1",
} as const;

export interface AppState {
  ready: boolean;
  designs: Design[];
  parties: Party[];
  orders: Order[];
  activeGstin: string | null;
  cart: CartItem[];
  adminAuthed: boolean;
}

export class FriendlyError extends Error {}

const DAY = 24 * 60 * 60 * 1000;
const SEED_TIME = Date.UTC(2026, 10, 14, 6, 30);

export const SEED_DESIGNS: Design[] = [
  {
    id: "d344sky",
    designNo: "344 Sky",
    fabric: "Cotton slub with a big window check in sky blue. Half sleeve, chest pocket.",
    sizeRange: "28 to 36",
    baseRate: 385,
    stockPieces: 540,
    image: skyImg.url,
    createdAt: SEED_TIME,
  },
  {
    id: "d344lilac",
    designNo: "344 Lilac",
    fabric: "Cotton slub with a big window check in soft lilac. Half sleeve, chest pocket.",
    sizeRange: "28 to 36",
    baseRate: 410,
    stockPieces: 270,
    image: lilacImg.url,
    createdAt: SEED_TIME + 1,
  },
  {
    id: "d345grey",
    designNo: "345 Grey",
    fabric: "Yarn dyed cotton in a grey tartan check. Roll up sleeve, chest pocket.",
    sizeRange: "28 to 36",
    baseRate: 445,
    stockPieces: 180,
    image: greyImg.url,
    createdAt: SEED_TIME + 2,
  },
  {
    id: "d345sage",
    designNo: "345 Sage",
    fabric: "Yarn dyed cotton in a sage tartan check. Roll up sleeve, chest pocket.",
    sizeRange: "28 to 36",
    baseRate: 460,
    stockPieces: 18,
    image: sageImg.url,
    createdAt: SEED_TIME + 3,
  },
];

const SEED_PARTIES: Party[] = [
  {
    gstin: "19AABCS1429B1Z5",
    companyName: "Shree Balaji Garments",
    adjustment: -15,
    overrides: {},
    createdAt: SEED_TIME - 40 * DAY,
  },
  {
    gstin: "27AAFCK8210L1Z2",
    companyName: "Kalbadevi Fashion House",
    adjustment: 20,
    overrides: { d345grey: 455 },
    createdAt: SEED_TIME - 30 * DAY,
  },
  {
    gstin: "07BBDPJ4419M1Z8",
    companyName: "Jain Cloth Emporium",
    adjustment: 0,
    overrides: {},
    createdAt: SEED_TIME - 20 * DAY,
  },
];

const SEED_ORDERS: Order[] = [
  {
    id: "ATH1001",
    gstin: "19AABCS1429B1Z5",
    companyName: "Shree Balaji Garments",
    createdAt: SEED_TIME - 3 * DAY,
    items: [
      {
        designId: "d344sky",
        designNo: "344 Sky",
        image: skyImg.url,
        unit: "carton",
        qty: 1,
        pieces: 270,
        rate: 370,
        lineTotal: 99900,
      },
      {
        designId: "d345grey",
        designNo: "345 Grey",
        image: greyImg.url,
        unit: "set",
        qty: 3,
        pieces: 27,
        rate: 430,
        lineTotal: 11610,
      },
    ],
    totalPieces: 297,
    total: 111510,
    status: "billed",
  },
];

const EMPTY: AppState = {
  ready: false,
  designs: [],
  parties: [],
  orders: [],
  activeGstin: null,
  cart: [],
  adminAuthed: false,
};

let state: AppState = EMPTY;
const listeners = new Set<() => void>();

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function read<T>(key: string, fallback: T, store: Storage = window.localStorage): T {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown, store: Storage = window.localStorage) {
  try {
    if (value === null) store.removeItem(key);
    else store.setItem(key, JSON.stringify(value));
  } catch {
    throw new FriendlyError(
      "This phone has run out of space for photos. Remove an old design or use a smaller photo.",
    );
  }
}

function load() {
  if (!isBrowser()) return;
  if (!window.localStorage.getItem(KEYS.seeded)) {
    write(KEYS.designs, SEED_DESIGNS);
    write(KEYS.parties, SEED_PARTIES);
    write(KEYS.orders, SEED_ORDERS);
    write(KEYS.seeded, true);
  }
  state = {
    ready: true,
    designs: read<Design[]>(KEYS.designs, []),
    parties: read<Party[]>(KEYS.parties, []),
    orders: read<Order[]>(KEYS.orders, []),
    activeGstin: read<string | null>(KEYS.session, null),
    cart: read<CartItem[]>(KEYS.cart, []),
    adminAuthed: read<boolean>(KEYS.admin, false, window.sessionStorage),
  };
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: Partial<AppState>) {
  if (next.designs) write(KEYS.designs, next.designs);
  if (next.parties) write(KEYS.parties, next.parties);
  if (next.orders) write(KEYS.orders, next.orders);
  if (next.cart) write(KEYS.cart, next.cart);
  if ("activeGstin" in next) write(KEYS.session, next.activeGstin ?? null);
  if ("adminAuthed" in next)
    write(KEYS.admin, next.adminAuthed ? true : null, window.sessionStorage);
  state = { ...state, ...next };
  emit();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key && e.key.startsWith("athenks.")) {
      load();
      emit();
    }
  };
  if (isBrowser()) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (isBrowser()) window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): AppState {
  if (!state.ready) load();
  return state;
}

export const getServerSnapshot = (): AppState => EMPTY;

/** Test helper: forget the in memory copy so the next read loads from storage again. */
export function __resetForTests() {
  state = EMPTY;
}

const current = () => getSnapshot();

// ---------- Lookups ----------

export const findParty = (gstin: string | null, s: AppState = current()): Party | null =>
  gstin ? (s.parties.find((p) => p.gstin === normalizeGstin(gstin)) ?? null) : null;

export const activeParty = (s: AppState = current()): Party | null => findParty(s.activeGstin, s);

export const findDesign = (id: string, s: AppState = current()): Design | null =>
  s.designs.find((d) => d.id === id) ?? null;

// ---------- Party session ----------

export function identifyParty(companyName: string, gstinInput: string) {
  const gstin = normalizeGstin(gstinInput);
  const existing = findParty(gstin);
  if (existing) {
    commit({ activeGstin: gstin });
    return { party: existing, isNew: false };
  }
  const party: Party = {
    gstin,
    companyName: companyName.trim(),
    adjustment: 0,
    overrides: {},
    createdAt: Date.now(),
  };
  commit({ parties: [...current().parties, party], activeGstin: gstin });
  return { party, isNew: true };
}

export function clearActiveParty() {
  commit({ activeGstin: null });
}

// ---------- Cart ----------

export function addToCart(designId: string, unit: Unit, qty: number) {
  const s = current();
  const design = findDesign(designId, s);
  if (!design) throw new FriendlyError("This design is no longer in the collection.");
  const cart = [...s.cart];
  const index = cart.findIndex((c) => c.designId === designId && c.unit === unit);
  const existingQty = index >= 0 ? (cart[index]?.qty ?? 0) : 0;
  const available = design.stockPieces - piecesInCart(cart, designId, index);
  const cap = maxQtyFor(unit, available);
  const nextQty = Math.min(existingQty + qty, cap);
  if (nextQty <= existingQty) throw new FriendlyError("No more stock left for this design.");
  if (index >= 0) cart[index] = { designId, unit, qty: nextQty };
  else cart.push({ designId, unit, qty: nextQty });
  commit({ cart });
  return nextQty;
}

export function setCartQty(index: number, qty: number) {
  const s = current();
  const line = s.cart[index];
  if (!line) return;
  const design = findDesign(line.designId, s);
  if (!design) return;
  const cap = maxQtyFor(line.unit, design.stockPieces - piecesInCart(s.cart, line.designId, index));
  const next = Math.max(1, Math.min(qty, cap));
  const cart = s.cart.map((c, i) => (i === index ? { ...c, qty: next } : c));
  commit({ cart });
}

export function removeCartLine(index: number) {
  commit({ cart: current().cart.filter((_, i) => i !== index) });
}

export function clearCart() {
  commit({ cart: [] });
}

// ---------- Orders ----------

export function placeOrder(): Order {
  const s = current();
  const party = activeParty(s);
  if (!party) throw new FriendlyError("Enter your company name and GST number first.");
  const lines = s.cart.filter((c) => findDesign(c.designId, s));
  if (lines.length === 0) throw new FriendlyError("Your cart is empty.");

  const designs = s.designs.map((d) => ({ ...d }));
  const items = lines.map((line) => {
    const design = designs.find((d) => d.id === line.designId);
    if (!design) throw new FriendlyError("A design in your cart is no longer available.");
    const pieces = piecesFor(line.unit, line.qty);
    if (pieces > design.stockPieces || isOutOfStock(design.stockPieces)) {
      throw new FriendlyError(
        `Only ${design.stockPieces} pieces of Design ${design.designNo} are left. Lower the quantity and try again.`,
      );
    }
    design.stockPieces -= pieces;
    const rate = rateFor(design, party);
    return {
      designId: design.id,
      designNo: design.designNo,
      image: design.image,
      unit: line.unit,
      qty: line.qty,
      pieces,
      rate,
      lineTotal: rate * pieces,
    };
  });

  const order: Order = {
    id: `ATH${1001 + s.orders.length}`,
    gstin: party.gstin,
    companyName: party.companyName,
    createdAt: Date.now(),
    items,
    totalPieces: items.reduce((n, i) => n + i.pieces, 0),
    total: items.reduce((n, i) => n + i.lineTotal, 0),
    status: "received",
  };
  commit({ designs, orders: [order, ...s.orders], cart: [] });
  return order;
}

export function setOrderStatus(id: string, status: OrderStatus) {
  commit({ orders: current().orders.map((o) => (o.id === id ? { ...o, status } : o)) });
}

// ---------- Admin ----------

export function adminLogin(username: string, password: string): boolean {
  const ok =
    username.trim() === siteConfig.admin.username && password === siteConfig.admin.password;
  if (ok) commit({ adminAuthed: true });
  return ok;
}

export function adminLogout() {
  commit({ adminAuthed: false });
}

export function addParty(input: { companyName: string; gstin: string; adjustment: number }) {
  const gstin = normalizeGstin(input.gstin);
  if (findParty(gstin)) throw new FriendlyError("A party with this GST number already exists.");
  const party: Party = {
    gstin,
    companyName: input.companyName.trim(),
    adjustment: Math.round(input.adjustment),
    overrides: {},
    createdAt: Date.now(),
  };
  commit({ parties: [...current().parties, party] });
  return party;
}

export function updateParty(gstin: string, patch: Partial<Omit<Party, "gstin" | "createdAt">>) {
  commit({
    parties: current().parties.map((p) => (p.gstin === gstin ? { ...p, ...patch } : p)),
  });
}

export function addDesign(input: Omit<Design, "id" | "createdAt">) {
  const designNo = input.designNo.trim();
  if (current().designs.some((d) => d.designNo.toLowerCase() === designNo.toLowerCase())) {
    throw new FriendlyError(`Design ${designNo} is already in the inventory.`);
  }
  const design: Design = {
    ...input,
    designNo,
    id: `d${Date.now().toString(36)}`,
    createdAt: Date.now(),
  };
  commit({ designs: [design, ...current().designs] });
  return design;
}

export function updateDesign(id: string, patch: Partial<Omit<Design, "id" | "createdAt">>) {
  commit({
    designs: current().designs.map((d) =>
      d.id === id
        ? { ...d, ...patch, stockPieces: Math.max(0, Math.round(patch.stockPieces ?? d.stockPieces)) }
        : d,
    ),
  });
}

export function changeStock(id: string, deltaPieces: number) {
  const d = findDesign(id);
  if (d) updateDesign(id, { stockPieces: d.stockPieces + deltaPieces });
}

export function removeDesign(id: string) {
  const s = current();
  commit({
    designs: s.designs.filter((d) => d.id !== id),
    cart: s.cart.filter((c) => c.designId !== id),
  });
}

export function loadSampleStock() {
  const s = current();
  const missing = SEED_DESIGNS.filter((d) => !s.designs.some((x) => x.id === d.id));
  commit({ designs: [...s.designs, ...missing] });
}
