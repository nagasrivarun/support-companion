// Production-grade recommendation engine.
// Deterministic, SSR-safe (no randomness) selection for:
//  - Related Products (same category, similar price band, shared tags)
//  - Frequently Bought Together (complementary accessory bundles)
// Pricing always flows through normalizePricing so cards stay in sync with the PDP.

import { LOCAL_PRODUCTS, getProductsByCategory, type LocalProduct } from "@/data/products";
import { normalizePricing } from "@/lib/pricing";

/** Complementary categories used to build realistic bundles. */
const COMPLEMENTARY: Record<string, string[]> = {
  "Phones & Tablets": ["Phone Accessories", "Cables & Chargers", "Audio"],
  "Computers & Laptops": ["Computer Peripherals", "Cables & Chargers", "Bags"],
  "Computer Peripherals": ["Computer Peripherals", "Cables & Chargers", "Bags"],
  "Audio": ["Cables & Chargers", "Phone Accessories", "Bags"],
  "Wearable Tech": ["Cables & Chargers", "Phone Accessories"],
  "Phone Accessories": ["Cables & Chargers", "Phone Accessories", "Audio"],
  "Cables & Chargers": ["Phone Accessories", "Cables & Chargers", "Audio"],
  "Footwear": ["Clothing", "Bags", "Accessories"],
  "Clothing": ["Footwear", "Accessories", "Bags"],
  "Bags": ["Accessories", "Clothing"],
  "Accessories": ["Clothing", "Bags", "Footwear"],
  "Kitchen Appliances": ["Home Decor", "Kitchen Appliances"],
  "Home Decor": ["Kitchen Appliances", "Home Decor"],
  "Sports & Fitness": ["Clothing", "Footwear"],
  "Books": ["Books", "Toys & Games"],
  "Toys & Games": ["Toys & Games", "Books"],
  "Beauty & Personal Care": ["Beauty & Personal Care"],
};

/** Stable numeric hash from a string seed (for deterministic ordering). */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export interface RecPricing {
  price: number;
  originalPrice: number | null;
  discountPercent: number;
}

export function getRecPricing(p: LocalProduct): RecPricing {
  const n = normalizePricing(p);
  return { price: n.price, originalPrice: n.originalPrice, discountPercent: n.discountPercent };
}

/**
 * Related products: same category first, scored by shared tags and price
 * proximity, with top-rated cross-category fillers to always return 4-8.
 */
export function getRelatedProducts(product: LocalProduct, limit = 8): LocalProduct[] {
  const basePrice = normalizePricing(product).price;
  const baseTags = new Set(product.tags);

  const sameCategory = getProductsByCategory(product.productType).filter(
    (p) => p.id !== product.id
  );

  const scored = sameCategory
    .map((p) => {
      const price = normalizePricing(p).price;
      const sharedTags = p.tags.filter((t) => baseTags.has(t)).length;
      // Price proximity 0..1 (closer = higher)
      const priceProximity = 1 - Math.min(Math.abs(price - basePrice) / (basePrice || 1), 1);
      const score = sharedTags * 3 + priceProximity * 2 + p.rating * 0.3;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((s) => s.p);

  if (scored.length >= limit) return scored.slice(0, limit);

  // Fill with top-rated products from other categories within a sane price band.
  const fillers = LOCAL_PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      p.productType !== product.productType &&
      !scored.some((s) => s.id === p.id)
  )
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

  return [...scored, ...fillers].slice(0, Math.max(limit, 4));
}

export interface BundleItem {
  product: LocalProduct;
  pricing: RecPricing;
}

export interface FrequentlyBoughtTogether {
  main: BundleItem;
  addons: BundleItem[];
  /** main + addons */
  items: BundleItem[];
  totalPrice: number;
  totalOriginalPrice: number;
  totalDiscountPercent: number;
}

/**
 * Frequently Bought Together: the current product plus 2 deterministic
 * complementary accessories. Stable per product (seeded by product id).
 */
export function getFrequentlyBoughtTogether(
  product: LocalProduct,
  addonCount = 2
): FrequentlyBoughtTogether {
  const seed = hashSeed(product.id);
  const wantedTypes = COMPLEMENTARY[product.productType] ?? [
    product.productType,
    "Accessories",
  ];

  const picked: LocalProduct[] = [];
  const usedIds = new Set<string>([product.id]);

  for (const type of wantedTypes) {
    if (picked.length >= addonCount) break;
    const candidates = getProductsByCategory(type)
      .filter((p) => !usedIds.has(p.id))
      // Prefer affordable, well-rated add-ons.
      .sort((a, b) => {
        const ap = normalizePricing(a).price;
        const bp = normalizePricing(b).price;
        return b.rating - a.rating || ap - bp;
      });
    if (candidates.length === 0) continue;
    const pick = candidates[seed % candidates.length];
    if (pick) {
      picked.push(pick);
      usedIds.add(pick.id);
    }
  }

  // Fallback: cheapest accessories anywhere if categories were thin.
  if (picked.length < addonCount) {
    const extra = LOCAL_PRODUCTS.filter(
      (p) => !usedIds.has(p.id) && p.inStock
    )
      .sort((a, b) => normalizePricing(a).price - normalizePricing(b).price)
      .slice(0, addonCount - picked.length);
    extra.forEach((p) => {
      picked.push(p);
      usedIds.add(p.id);
    });
  }

  const toItem = (p: LocalProduct): BundleItem => ({ product: p, pricing: getRecPricing(p) });
  const main = toItem(product);
  const addons = picked.map(toItem);
  const items = [main, ...addons];

  const totalPrice = items.reduce((s, i) => s + i.pricing.price, 0);
  const totalOriginalPrice = items.reduce(
    (s, i) => s + (i.pricing.originalPrice ?? i.pricing.price),
    0
  );
  const totalDiscountPercent =
    totalOriginalPrice > totalPrice
      ? Math.round(((totalOriginalPrice - totalPrice) / totalOriginalPrice) * 100)
      : 0;

  return { main, addons, items, totalPrice, totalOriginalPrice, totalDiscountPercent };
}
