import { create } from "zustand";
import type { LocalProduct } from "@/data/products";

const MAX_COMPARE = 4;

interface CompareStore {
  items: LocalProduct[];
  isOpen: boolean;
  addItem: (product: LocalProduct) => boolean;
  removeItem: (id: string) => void;
  clearAll: () => void;
  has: (id: string) => boolean;
  setOpen: (open: boolean) => void;
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product) => {
    const { items } = get();
    if (items.length >= MAX_COMPARE) return false;
    if (items.some(i => i.id === product.id)) return false;
    set({ items: [...items, product] });
    return true;
  },

  removeItem: (id) => {
    set(s => {
      const items = s.items.filter(i => i.id !== id);
      return { items, isOpen: items.length === 0 ? false : s.isOpen };
    });
  },

  clearAll: () => set({ items: [], isOpen: false }),

  has: (id) => get().items.some(i => i.id === id),

  setOpen: (open) => set({ isOpen: open }),
}));
