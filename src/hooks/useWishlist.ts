import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  useWishlistStore,
  wishlistKey,
  type WishlistEntry,
  type WishlistInput,
} from "@/stores/wishlistStore";

// Re-export for convenience / backward compatibility.
export type { WishlistEntry, WishlistInput };

/**
 * Wishlist hook backed by a localStorage-persisted Zustand store.
 *
 * - Works for guests (no auth required) and restores across refresh / restart.
 * - Optimistic by nature: store mutations are synchronous.
 * - Variant-aware via {@link WishlistInput.selectedOptions} / variantLabel.
 * - Future-ready: the store exposes setUserId / mergeEntries for remote sync.
 */
export function useWishlist() {
  const items = useWishlistStore((s) => s.items);
  const { toast } = useToast();

  const addToWishlist = useCallback(
    (input: WishlistInput) => {
      const added = useWishlistStore.getState().add(input);
      if (added) {
        toast({
          title: "Added to wishlist",
          description: `${input.title} has been saved to your wishlist.`,
        });
      } else {
        toast({
          title: "Already in wishlist",
          description: "This item is already saved.",
        });
      }
      return added;
    },
    [toast],
  );

  const removeFromWishlist = useCallback(
    (keyOrId: string) => {
      const state = useWishlistStore.getState();
      if (state.has(keyOrId)) {
        state.remove(keyOrId);
      } else {
        state.removeByProductId(keyOrId);
      }
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
      return true;
    },
    [toast],
  );

  const toggleWishlist = useCallback(
    (input: WishlistInput) => {
      const key = wishlistKey(input.id, input.selectedOptions, input.variantLabel);
      const willAdd = !useWishlistStore.getState().has(key);
      useWishlistStore.getState().toggle(input);
      toast({
        title: willAdd ? "Added to wishlist" : "Removed from wishlist",
        description: willAdd
          ? `${input.title} has been saved to your wishlist.`
          : "Item has been removed from your wishlist.",
      });
      return willAdd;
    },
    [toast],
  );

  /** Legacy check by product id (variant-agnostic). */
  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.id === productId),
    [items],
  );

  /** Variant-aware check by full input. */
  const isWishlisted = useCallback(
    (input: Pick<WishlistInput, "id" | "selectedOptions" | "variantLabel">) =>
      items.some(
        (i) => i.key === wishlistKey(input.id, input.selectedOptions, input.variantLabel),
      ),
    [items],
  );

  const clearWishlist = useCallback(() => {
    useWishlistStore.getState().clear();
    toast({ title: "Wishlist cleared" });
  }, [toast]);

  return {
    items,
    loading: false,
    count: items.length,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    isWishlisted,
    clearWishlist,
  };
}
