// Persists in-progress checkout details so customers don't lose data on
// refresh. Future-ready: a userId can be attached to sync server-side.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  CustomerInfo,
  ShippingAddress,
  DeliveryMethodId,
  PaymentMethodId,
} from "@/lib/checkout";

interface CheckoutState {
  customer: CustomerInfo;
  shipping: ShippingAddress;
  deliveryMethodId: DeliveryMethodId;
  paymentMethodId: PaymentMethodId;
  userId: string | null;

  setCustomer: (patch: Partial<CustomerInfo>) => void;
  setShipping: (patch: Partial<ShippingAddress>) => void;
  setDeliveryMethod: (id: DeliveryMethodId) => void;
  setPaymentMethod: (id: PaymentMethodId) => void;
  reset: () => void;
}

const emptyCustomer: CustomerInfo = { fullName: "", email: "", phone: "" };
const emptyShipping: ShippingAddress = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      customer: emptyCustomer,
      shipping: emptyShipping,
      deliveryMethodId: "standard",
      paymentMethodId: "upi",
      userId: null,

      setCustomer: (patch) => set((s) => ({ customer: { ...s.customer, ...patch } })),
      setShipping: (patch) => set((s) => ({ shipping: { ...s.shipping, ...patch } })),
      setDeliveryMethod: (deliveryMethodId) => set({ deliveryMethodId }),
      setPaymentMethod: (paymentMethodId) => set({ paymentMethodId }),
      reset: () =>
        set({
          customer: emptyCustomer,
          shipping: emptyShipping,
          deliveryMethodId: "standard",
          paymentMethodId: "upi",
        }),
    }),
    {
      name: "shop-india-checkout",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        customer: s.customer,
        shipping: s.shipping,
        deliveryMethodId: s.deliveryMethodId,
        paymentMethodId: s.paymentMethodId,
      }),
    }
  )
);
