/** Athenks wholesale rules: units, pricing and stock. Pure functions, no storage. */

export const PIECES_PER_SET = 9;
export const SETS_PER_CARTON = 30;
export const PIECES_PER_CARTON = PIECES_PER_SET * SETS_PER_CARTON; // 270

export type Unit = "set" | "carton";

export interface Design {
  id: string;
  designNo: string;
  fabric: string;
  sizeRange: string;
  baseRate: number;
  stockPieces: number;
  image: string;
  createdAt: number;
}

export interface Party {
  gstin: string;
  companyName: string;
  /** Flat per piece change applied to every base rate, e.g. -15 or +20 */
  adjustment: number;
  /** Exact per piece rate for a design id, wins over the adjustment */
  overrides: Record<string, number>;
  createdAt: number;
}

export interface CartItem {
  designId: string;
  unit: Unit;
  qty: number;
}

export interface OrderItem {
  designId: string;
  designNo: string;
  image: string;
  unit: Unit;
  qty: number;
  pieces: number;
  rate: number;
  lineTotal: number;
}

export type OrderStatus = "received" | "billed";

export interface Order {
  id: string;
  gstin: string;
  companyName: string;
  createdAt: number;
  items: OrderItem[];
  totalPieces: number;
  total: number;
  status: OrderStatus;
}

export const piecesPerUnit = (unit: Unit): number =>
  unit === "carton" ? PIECES_PER_CARTON : PIECES_PER_SET;

export const piecesFor = (unit: Unit, qty: number): number => piecesPerUnit(unit) * qty;

export const isOutOfStock = (stockPieces: number): boolean => stockPieces < PIECES_PER_SET;

/** Most units of this kind that fit in the pieces still available. */
export const maxQtyFor = (unit: Unit, availablePieces: number): number =>
  Math.max(0, Math.floor(availablePieces / piecesPerUnit(unit)));

/** The per piece rate a party pays for a design. Null party means base rate. */
export const rateFor = (design: Pick<Design, "id" | "baseRate">, party: Party | null): number => {
  if (!party) return design.baseRate;
  const override = party.overrides[design.id];
  if (typeof override === "number" && override > 0) return override;
  return Math.max(0, design.baseRate + party.adjustment);
};

/** Pieces of a design already sitting in the cart, optionally skipping one line. */
export const piecesInCart = (cart: CartItem[], designId: string, skipIndex = -1): number =>
  cart.reduce(
    (sum, item, i) =>
      i !== skipIndex && item.designId === designId ? sum + piecesFor(item.unit, item.qty) : sum,
    0,
  );

export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const normalizeGstin = (value: string): string =>
  value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15);

export const isValidGstin = (value: string): boolean => GSTIN_PATTERN.test(normalizeGstin(value));

export const formatRupees = (amount: number): string =>
  `₹${Math.round(amount).toLocaleString("en-IN")}`;

export const formatAdjustment = (adjustment: number): string =>
  adjustment === 0
    ? "Base rate"
    : adjustment < 0
      ? `Base −₹${Math.abs(adjustment)} / pc`
      : `Base +₹${adjustment} / pc`;

export const unitLabel = (unit: Unit, qty: number): string =>
  unit === "carton" ? `${qty} ${qty === 1 ? "carton" : "cartons"}` : `${qty} ${qty === 1 ? "set" : "sets"}`;

export const stockLabel = (stockPieces: number): string =>
  isOutOfStock(stockPieces)
    ? "Out of stock"
    : `${stockPieces.toLocaleString("en-IN")} pieces available (${Math.floor(stockPieces / PIECES_PER_SET)} sets)`;
