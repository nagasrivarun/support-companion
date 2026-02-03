import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type WebhookType = 
  | 'order_notification' 
  | 'customer_support' 
  | 'abandoned_cart' 
  | 'product_recommendation' 
  | 'review_request';

interface AutomationPayload {
  [key: string]: unknown;
}

export function useAutomation() {
  const { toast } = useToast();

  const triggerAutomation = useCallback(async (
    type: WebhookType,
    payload: AutomationPayload
  ): Promise<boolean> => {
    try {
      console.log(`Triggering ${type} automation with payload:`, payload);
      
      const { data, error } = await supabase.functions.invoke('make-automation', {
        body: { type, payload },
      });

      if (error) {
        console.error('Automation error:', error);
        return false;
      }

      if (data?.success) {
        console.log('Automation triggered successfully:', data);
        return true;
      } else {
        console.log('Automation not configured or failed:', data?.message);
        return false;
      }
    } catch (error) {
      console.error('Failed to trigger automation:', error);
      return false;
    }
  }, []);

  const triggerOrderNotification = useCallback(async (order: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress?: string;
  }) => {
    return triggerAutomation('order_notification', {
      event: 'order_placed',
      order,
    });
  }, [triggerAutomation]);

  const triggerAbandonedCartRecovery = useCallback(async (cart: {
    customerEmail?: string;
    items: Array<{ 
      productId: string;
      title: string; 
      price: number; 
      quantity: number;
      image?: string;
    }>;
    totalAmount: number;
    cartUrl: string;
  }) => {
    return triggerAutomation('abandoned_cart', {
      event: 'cart_abandoned',
      cart,
    });
  }, [triggerAutomation]);

  const triggerProductRecommendation = useCallback(async (data: {
    customerEmail: string;
    recentPurchases?: Array<{ productId: string; title: string }>;
    viewedProducts?: Array<{ productId: string; title: string }>;
    preferences?: string[];
  }) => {
    return triggerAutomation('product_recommendation', {
      event: 'recommendation_request',
      customer: data,
    });
  }, [triggerAutomation]);

  const triggerReviewRequest = useCallback(async (data: {
    customerEmail: string;
    customerName: string;
    orderNumber: string;
    products: Array<{ productId: string; title: string; handle: string }>;
    orderDate: string;
  }) => {
    return triggerAutomation('review_request', {
      event: 'review_request',
      order: data,
    });
  }, [triggerAutomation]);

  const triggerCustomerSupport = useCallback(async (data: {
    customerEmail?: string;
    customerName?: string;
    message: string;
    conversationId?: string;
    orderNumber?: string;
    category?: string;
  }) => {
    return triggerAutomation('customer_support', {
      event: 'support_request',
      ticket: data,
    });
  }, [triggerAutomation]);

  return {
    triggerAutomation,
    triggerOrderNotification,
    triggerAbandonedCartRecovery,
    triggerProductRecommendation,
    triggerReviewRequest,
    triggerCustomerSupport,
  };
}
