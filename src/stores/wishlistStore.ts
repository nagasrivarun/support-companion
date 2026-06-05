import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * A single wishlist entry. Variant-aware: the same product saved with
 * different selected options produces distinct keys so they don't collide.
 */
export interface WishlistEntry {
  /** Product id (stable across variants). */
  id: string;
  /** Variant-aware dedup key — see {@link wishlistKey}. */
  key: string;
  handle: string;
  title: string;
  image?: string;
  price: number;
  currencyCode: string;
  /** Human label for the chosen variant, e.g. "256GB · Blue". */
  variantLabel?: string;
  /** Raw selected options used to build the key (storage/color/size). */
  selectedOptions?: Record<string, string>;
  /** Epoch ms when added — newest first ordering. */
  addedAt: number;
}

export type WishlistInput = Omit<WishlistEntry, "key" | "addedAt">;

/**
 * Builds a variant-aware, deterministic key for an entry. Products with no
 * selected options collapse to their plain id so cards stay in sync with the
 * detail page's default state.
 */
export function wishlistKey(
  id: string,
  selectedOptions?: Record<string, string>,
  variantLabel?: string,
): string {
  if (selectedOptions && Object.keys(selectedOptions).length > 0) {
    const parts = Object.keys(selectedOptions)
      .sort()
      .map((k) => `${k}:${selectedOptions[k]}`);
    return `${id}::${parts.join("|")}`;
  }
  if (variantLabel) return `${id}::${variantLabel}`;
  return id;
}

interface WishlistState {
  items: WishlistEntry[];
  /**
   * Future-ready for authenticated users. When a user signs in we set their id
   * here and can merge/sync the local guest wishlist with a remote copy.
   */
  userId: string | null;

  add: (input: WishlistInput) => boolean;
  remove: (key: string) => void;
  removeByProductId: (id: string) => void;
  toggle: (input: WishlistInput) => boolean;
  clear: () => void;
  has: (key: string) => boolean;
  hasProduct: (id: string) => boolean;
  getCount: () => number;

  // --- auth-ready helpers (no-ops until a backend sync is wired up) ---
  setUserId: (userId: string | null) => void;
  mergeEntries: (entries: WishlistEntry[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,

      add: (input) => {
        const key = wishlistKey(input.id, input.selectedOptions, input.variantLabel);
        if (get().items.some((i) => i.key === key)) return false; // prevent duplicates
        const entry: WishlistEntry = { ...input, key, addedAt: Date.now() };
        set({ items: [entry, ...get().items] });
        return true;
      },

      remove: (key) => {
        set({ items: get().items.filter((i) => i.key !== key) });
      },

      removeByProductId: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      toggle: (input) => {
        const key = wishlistKey(input.id, input.selectedOptions, input.variantLabel);
        if (get().items.some((i) => i.key === key)) {
          get().remove(key);
          return false;
        }
        return get().add(input);
      },

      clear: () => set({ items: [] }),

      has: (key) => get().items.some((i) => i.key === key),
      hasProduct: (id) => get().items.some((i) => i.id === id),
      getCount: () => get().items.length,

      setUserId: (userId) => set({ userId }),
      mergeEntries: (entries) => {
        const existing = new Map(get().items.map((i) => [i.key, i]));
        for (const e of entries) if (!existing.has(e.key)) existing.set(e.key, e);
        set({
          items: [...existing.values()].sort((a, b) => b.addedAt - a.addedAt),
        });
      },
    }),
    {
      name: "wishlist",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Persist only data, not action functions.
      partialize: (state) => ({ items: state.items, userId: state.userId }),
    },
  ),
);
