import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ViewedItem {
  handle: string;
  /** epoch ms of the most recent view */
  viewedAt: number;
}

interface BrowsingHistoryStore {
  /** Timestamped history — source of truth (most-recent first). */
  items: ViewedItem[];
  /** Backward-compatible list of handles (most-recent first). */
  viewedHandles: string[];
  addViewed: (handle: string) => void;
  clearHistory: () => void;
  /** Returns non-expired handles, most-recent first. */
  getRecentHandles: () => string[];
}

const MAX_HISTORY = 20;
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Drops items older than 30 days. */
const prune = (items: ViewedItem[]): ViewedItem[] => {
  const cutoff = Date.now() - EXPIRY_MS;
  return items.filter((i) => i.viewedAt >= cutoff);
};

export const useBrowsingHistory = create<BrowsingHistoryStore>()(
  persist(
    (set, get) => ({
      items: [],
      viewedHandles: [],

      addViewed: (handle: string) => {
        const existing = prune(get().items);
        // Move to front, deduplicate, cap at MAX_HISTORY
        const updated: ViewedItem[] = [
          { handle, viewedAt: Date.now() },
          ...existing.filter((i) => i.handle !== handle),
        ].slice(0, MAX_HISTORY);
        set({ items: updated, viewedHandles: updated.map((i) => i.handle) });
      },

      clearHistory: () => set({ items: [], viewedHandles: [] }),

      getRecentHandles: () => prune(get().items).map((i) => i.handle),
    }),
    {
      name: "browsing-history",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Migrate the legacy { viewedHandles: string[] } shape to timestamped items.
      migrate: (persisted: unknown): BrowsingHistoryStore => {
        const state = (persisted ?? {}) as Partial<BrowsingHistoryStore>;
        if (state.items && state.items.length) {
          const pruned = prune(state.items);
          return {
            items: pruned,
            viewedHandles: pruned.map((i) => i.handle),
          } as BrowsingHistoryStore;
        }
        const now = Date.now();
        const items: ViewedItem[] = (state.viewedHandles ?? []).map((handle, idx) => ({
          handle,
          // Stagger so original order is preserved, all within the expiry window.
          viewedAt: now - idx * 1000,
        }));
        return {
          items,
          viewedHandles: items.map((i) => i.handle),
        } as BrowsingHistoryStore;
      },
      // Prune expired entries on rehydrate.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const pruned = prune(state.items);
        state.items = pruned;
        state.viewedHandles = pruned.map((i) => i.handle);
      },
    }
  )
);
