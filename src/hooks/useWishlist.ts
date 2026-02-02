import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product_handle: string;
  product_title: string;
  product_image: string | null;
  product_price: number;
  currency_code: string;
  created_at: string;
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (product: {
    id: string;
    handle: string;
    title: string;
    image?: string;
    price: number;
    currencyCode: string;
  }) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist.",
      });
      return false;
    }

    try {
      const { error } = await supabase.from('wishlists').insert({
        user_id: user.id,
        product_id: product.id,
        product_handle: product.handle,
        product_title: product.title,
        product_image: product.image || null,
        product_price: product.price,
        currency_code: product.currencyCode,
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already in wishlist",
            description: "This item is already in your wishlist.",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Added to wishlist",
        description: `${product.title} has been added to your wishlist.`,
      });

      await fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to wishlist.",
      });
      return false;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });

      await fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item from wishlist.",
      });
      return false;
    }
  };

  const isInWishlist = useCallback(
    (productId: string) => items.some((item) => item.product_id === productId),
    [items]
  );

  return {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlist,
  };
}
