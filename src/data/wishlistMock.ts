import { LOCAL_PRODUCTS } from "@/data/products";
import { normalizePricing } from "@/lib/pricing";
import { wishlistKey, type WishlistEntry } from "@/stores/wishlistStore";

/**
 * Deterministic mock wishlist support.
 *
 * Used for previews, demos and tests where a populated wishlist is needed
 * without any user interaction. The selection is stable (same handles, same
 * order, fixed timestamps) so snapshots and visual checks never drift.
 */
const MOCK_HANDLES = [
  "iphone-15-pro",
  "samsung-galaxy-s24",
  "apple-ipad-10th-gen",
  "sony-wh-1000xm5",
  "macbook-air-m3",
] as const;

/** A fixed base timestamp so mock ordering is reproducible. */
const MOCK_BASE_TS = Date.UTC(2025, 0, 1, 12, 0, 0);

export function getMockWishlistEntries(): WishlistEntry[] {
  const entries: WishlistEntry[] = [];
  MOCK_HANDLES.forEach((handle, idx) => {
    const p =
      LOCAL_PRODUCTS.find((x) => x.handle === handle) ?? LOCAL_PRODUCTS[idx];
    if (!p) return;
    const { price } = normalizePricing(p);
    entries.push({
      id: p.id,
      key: wishlistKey(p.id),
      handle: p.handle,
      title: p.title,
      image: p.image,
      price,
      currencyCode: p.currencyCode,
      // Stagger so the first handle is the most recent.
      addedAt: MOCK_BASE_TS - idx * 60_000,
    });
  });
  return entries;
}
