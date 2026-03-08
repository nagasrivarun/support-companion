import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface BrowsingHistoryStore {
  viewedHandles: string[];
  addViewed: (handle: string) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 20;

export const useBrowsingHistory = create<BrowsingHistoryStore>()(
  persist(
    (set, get) => ({
      viewedHandles: [],

      addViewed: (handle: string) => {
        const { viewedHandles } = get();
        // Move to front, deduplicate, cap at MAX_HISTORY
        const updated = [handle, ...viewedHandles.filter(h => h !== handle)].slice(0, MAX_HISTORY);
        set({ viewedHandles: updated });
      },

      clearHistory: () => set({ viewedHandles: [] }),
    }),
    {
      name: "browsing-history",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
