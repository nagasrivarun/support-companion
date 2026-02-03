import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/stores/cartStore';
import { useAutomation } from '@/hooks/useAutomation';

const SESSION_KEY = 'cart_session_id';
const ABANDONMENT_DELAY = 30 * 60 * 1000; // 30 minutes of inactivity

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function useAbandonedCart() {
  const { user } = useAuth();
  const { items, getTotalPrice } = useCartStore();
  const { triggerAbandonedCartRecovery } = useAutomation();
  const abandonmentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncRef = useRef<string>('');

  // Sync cart to database for abandoned cart tracking
  const syncCart = useCallback(async () => {
    if (items.length === 0) return;

    const sessionId = getOrCreateSessionId();
    const cartHash = JSON.stringify(items);
    
    // Avoid duplicate syncs
    if (cartHash === lastSyncRef.current) return;
    lastSyncRef.current = cartHash;

    const cartData = {
      session_id: sessionId,
      user_id: user?.id || null,
      customer_email: user?.email || null,
      cart_items: items.map(item => ({
        productId: item.variantId,
        title: item.product.node.title,
        price: parseFloat(item.price.amount),
        quantity: item.quantity,
        image: item.product.node.images.edges[0]?.node.url || null,
      })),
      total_amount: getTotalPrice(),
      currency_code: items[0]?.price.currencyCode || 'USD',
      abandoned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Upsert cart data
      const { error } = await supabase
        .from('abandoned_carts')
        .upsert(cartData, { 
          onConflict: 'session_id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error('Error syncing cart:', error);
      } else {
        console.log('Cart synced for abandonment tracking');
      }
    } catch (error) {
      console.error('Failed to sync cart:', error);
    }
  }, [items, user, getTotalPrice]);

  // Trigger abandonment automation after inactivity
  const scheduleAbandonmentCheck = useCallback(() => {
    if (abandonmentTimerRef.current) {
      clearTimeout(abandonmentTimerRef.current);
    }

    if (items.length === 0) return;

    abandonmentTimerRef.current = setTimeout(async () => {
      if (items.length > 0) {
        console.log('Cart abandoned - triggering automation');
        
        await triggerAbandonedCartRecovery({
          customerEmail: user?.email,
          items: items.map(item => ({
            productId: item.variantId,
            title: item.product.node.title,
            price: parseFloat(item.price.amount),
            quantity: item.quantity,
            image: item.product.node.images.edges[0]?.node.url,
          })),
          totalAmount: getTotalPrice(),
          cartUrl: window.location.origin + '/shop',
        });
      }
    }, ABANDONMENT_DELAY);
  }, [items, user, getTotalPrice, triggerAbandonedCartRecovery]);

  // Sync cart on changes
  useEffect(() => {
    if (items.length > 0) {
      syncCart();
      scheduleAbandonmentCheck();
    }

    return () => {
      if (abandonmentTimerRef.current) {
        clearTimeout(abandonmentTimerRef.current);
      }
    };
  }, [items, syncCart, scheduleAbandonmentCheck]);

  // Mark cart as recovered when checkout starts
  const markCartRecovered = useCallback(async () => {
    const sessionId = getOrCreateSessionId();
    
    try {
      await supabase
        .from('abandoned_carts')
        .update({ recovered: true, updated_at: new Date().toISOString() })
        .eq('session_id', sessionId);
      
      console.log('Cart marked as recovered');
    } catch (error) {
      console.error('Failed to mark cart as recovered:', error);
    }
  }, []);

  return {
    syncCart,
    markCartRecovered,
  };
}
