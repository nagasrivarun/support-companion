// Universal pricing utilities — single source of truth for all product pricing.
// Normalizes unrealistic discounts (Section 5) so cards and PDP stay consistent.

import type { LocalProduct } from "@/data/products";

export type PriceCategory = "luxury" | "electronics" | "fashion" | "accessories" | "home" | "default";

// Max believable discount % per category
const MAX_DISCOUNT: Record<PriceCategory, number> = {
  luxury: 12,
  electronics: 18,
  accessories: 45,
  fashion: 60,
  home: 40,
  default: 50,
};

const ELECTRONICS_TYPES = new Set([
  "Phones", "Smartphones", "Phone", "Laptops", "Laptop", "Tablets", "Tablet",
  "Computers", "Monitors", "Monitor", "Audio", "Headphones", "Smartwatches",
  "Wearables", "Cameras", "TV", "Gaming",
]);
const ACCESSORY_TYPES = new Set([
  "Accessories", "Mobile Accessories", "Computer Accessories", "Bags",
  "Wallets", "Sunglasses", "Watches", "Eyewear", "Jewelry",
]);
const FASHION_TYPES = new Set([
  "Clothing", "Footwear", "Shoes", "Apparel", "Fashion",
]);
const HOME_TYPES = new Set([
  "Home", "Home & Lifestyle", "Home Decor", "Kitchen", "Appliances",
  "Furniture", "Lighting", "Bedding",
]);

const LUXURY_VENDORS = new Set([
  "Apple", "Samsung Galaxy", "Sony", "Bose", "Dyson", "Bang & Olufsen",
]);

export function getCategory(p: Pick<LocalProduct, "productType" | "vendor" | "price">): PriceCategory {
  if (LUXURY_VENDORS.has(p.vendor) && p.price >= 40000) return "luxury";
  const t = p.productType || "";
  if (ELECTRONICS_TYPES.has(t)) return "electronics";
  if (FASHION_TYPES.has(t)) return "fashion";
  if (ACCESSORY_TYPES.has(t)) return "accessories";
  if (HOME_TYPES.has(t)) return "home";
  // Heuristic fallbacks
  if (/phone|laptop|tablet|monitor|tv|camera/i.test(t)) return "electronics";
  if (/cloth|shirt|jean|dress|hood|shoe|sneak|footwear/i.test(t)) return "fashion";
  if (/cable|charger|case|bag|wallet|sunglass|mouse|keyboard|stand/i.test(t)) return "accessories";
  if (/kitchen|home|lamp|cookware/i.test(t)) return "home";
  return "default";
}

export interface NormalizedPrice {
  price: number;
  originalPrice: number | null;
  discountPercent: number;
  category: PriceCategory;
}

/**
 * Returns the canonical price + a clamped originalPrice so the displayed
 * discount stays within a realistic range for the product's category.
 * Never inflates a real price; only lowers an unrealistic MRP.
 */
export function normalizePricing(
  p: Pick<LocalProduct, "price" | "originalPrice" | "productType" | "vendor">
): NormalizedPrice {
  const category = getCategory(p);
  const cap = MAX_DISCOUNT[category];
  const price = p.price;
  let originalPrice = p.originalPrice ?? null;

  if (originalPrice && originalPrice > price) {
    const rawDiscount = ((originalPrice - price) / originalPrice) * 100;
    if (rawDiscount > cap) {
      // Clamp MRP so discount matches the cap
      originalPrice = Math.round(price / (1 - cap / 100));
    }
  } else {
    originalPrice = null;
  }

  const discountPercent = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return { price, originalPrice, discountPercent, category };
}

export function formatINR(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

// EMI estimate — 12 month no-cost EMI style (price / 12), shown as "from"
export function estimateEmi(price: number, months = 12): number {
  return Math.round(price / months);
}

// Free delivery threshold (memory: ₹99 standard, free above ₹499)
export const FREE_DELIVERY_THRESHOLD = 499;

export function deliveryEta(): { label: string; isFree: (price: number) => boolean } {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  const label = d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
  return {
    label,
    isFree: (price: number) => price >= FREE_DELIVERY_THRESHOLD,
  };
}
