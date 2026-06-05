// Cart calculation utilities — single source of truth for cart totals.
// Pure, deterministic functions so calculations can be memoized safely.

import type { CartItem } from "@/stores/cartStore";
import { getProductByHandle } from "@/data/products";
import { normalizePricing, FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";

export const STANDARD_SHIPPING = 99;
// GST is included in displayed MRP for the India market (18% effective blended rate).
export const GST_RATE = 0.18;

export interface CartLine {
  item: CartItem;
  unitPrice: number;
  originalUnitPrice: number | null;
  lineTotal: number;
  lineSavings: number;
  quantity: number;
}

export interface CartTotals {
  lines: CartLine[];
  totalItems: number;
  subtotal: number;
  discountTotal: number;
  shipping: number;
  qualifiesFreeShipping: boolean;
  remainingForFreeShipping: number;
  taxEstimate: number; // GST component already included in subtotal
  grandTotal: number;
  currency: string;
}

/**
 * Resolve the selling + original price for a cart item using the canonical
 * pricing rules. Falls back to the stored cart price when no local product
 * match exists (deterministic mock-data support).
 */
function resolveLinePricing(item: CartItem): {
  unitPrice: number;
  originalUnitPrice: number | null;
} {
  const stored = parseFloat(item.price.amount) || 0;
  const local = getProductByHandle(item.product.node.handle);

  if (local) {
    const normalized = normalizePricing(local);
    // Prefer the stored variant price (variants may differ), keep original MRP ratio.
    const unitPrice = stored > 0 ? stored : normalized.price;
    let originalUnitPrice = normalized.originalPrice;
    if (originalUnitPrice && originalUnitPrice <= unitPrice) originalUnitPrice = null;
    return { unitPrice, originalUnitPrice };
  }

  return { unitPrice: stored, originalUnitPrice: null };
}

export function calculateCart(items: CartItem[]): CartTotals {
  const currency = items[0]?.price.currencyCode || "INR";

  const lines: CartLine[] = items.map((item) => {
    const quantity = Math.max(0, Math.floor(item.quantity));
    const { unitPrice, originalUnitPrice } = resolveLinePricing(item);
    const lineTotal = unitPrice * quantity;
    const lineSavings = originalUnitPrice
      ? (originalUnitPrice - unitPrice) * quantity
      : 0;
    return { item, unitPrice, originalUnitPrice, lineTotal, lineSavings, quantity };
  });

  const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const discountTotal = lines.reduce((sum, l) => sum + l.lineSavings, 0);

  const qualifiesFreeShipping = subtotal >= FREE_DELIVERY_THRESHOLD;
  const shipping = subtotal === 0 || qualifiesFreeShipping ? 0 : STANDARD_SHIPPING;
  const remainingForFreeShipping = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  // GST already embedded in subtotal — compute the included component for transparency.
  const taxEstimate = subtotal - subtotal / (1 + GST_RATE);

  const grandTotal = subtotal + shipping;

  return {
    lines,
    totalItems,
    subtotal,
    discountTotal,
    shipping,
    qualifiesFreeShipping,
    remainingForFreeShipping,
    taxEstimate,
    grandTotal,
    currency,
  };
}
