// Checkout domain logic — deterministic order generation and mock fulfillment.
// Architecture is gateway-agnostic: payment is a pluggable "processor" so a real
// gateway (Razorpay/Stripe/UPI) can replace the mock without touching the UI.

import type { CartItem } from "@/stores/cartStore";
import { calculateCart, type CartTotals } from "@/lib/cart";
import { formatINR } from "@/lib/pricing";

/* ------------------------------------------------------------------ */
/* Delivery methods                                                    */
/* ------------------------------------------------------------------ */

export type DeliveryMethodId = "standard" | "express" | "same_day";

export interface DeliveryMethod {
  id: DeliveryMethodId;
  label: string;
  description: string;
  price: number;
  /** business days until delivery (min,max) — same-day uses 0 */
  etaDays: [number, number];
}

export const DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: "standard",
    label: "Standard Delivery",
    description: "Reliable delivery across India",
    price: 0,
    etaDays: [4, 7],
  },
  {
    id: "express",
    label: "Express Delivery",
    description: "Priority handling & faster transit",
    price: 99,
    etaDays: [2, 3],
  },
  {
    id: "same_day",
    label: "Same-Day Delivery",
    description: "Order before 12 PM in select metros",
    price: 199,
    etaDays: [0, 0],
  },
];

export function getDeliveryMethod(id: DeliveryMethodId): DeliveryMethod {
  return DELIVERY_METHODS.find((m) => m.id === id) ?? DELIVERY_METHODS[0];
}

/** Human-readable estimated delivery window from today. */
export function estimateDeliveryDate(method: DeliveryMethod): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const today = new Date();
  if (method.etaDays[0] === 0 && method.etaDays[1] === 0) {
    return `Today, ${fmt(today)}`;
  }
  const from = new Date(today);
  from.setDate(from.getDate() + method.etaDays[0]);
  const to = new Date(today);
  to.setDate(to.getDate() + method.etaDays[1]);
  return `${fmt(from)} – ${fmt(to)}`;
}

/* ------------------------------------------------------------------ */
/* Payment methods                                                     */
/* ------------------------------------------------------------------ */

export type PaymentMethodId = "upi" | "credit_card" | "debit_card" | "net_banking" | "cod";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "upi", label: "UPI", description: "GPay, PhonePe, Paytm & more" },
  { id: "credit_card", label: "Credit Card", description: "Visa, Mastercard, RuPay, Amex" },
  { id: "debit_card", label: "Debit Card", description: "All major Indian banks" },
  { id: "net_banking", label: "Net Banking", description: "50+ banks supported" },
  { id: "cod", label: "Cash on Delivery", description: "Pay in cash when it arrives" },
];

export function getPaymentMethod(id: PaymentMethodId): PaymentMethod {
  return PAYMENT_METHODS.find((m) => m.id === id) ?? PAYMENT_METHODS[0];
}

/* ------------------------------------------------------------------ */
/* Customer + shipping types                                           */
/* ------------------------------------------------------------------ */

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/* ------------------------------------------------------------------ */
/* Order record                                                        */
/* ------------------------------------------------------------------ */

export interface OrderLineItem {
  handle: string;
  title: string;
  image?: string;
  variantTitle?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  customer: CustomerInfo;
  shipping: ShippingAddress;
  deliveryMethodId: DeliveryMethodId;
  paymentMethodId: PaymentMethodId;
  items: OrderLineItem[];
  totals: {
    subtotal: number;
    discountTotal: number;
    shipping: number;
    taxEstimate: number;
    grandTotal: number;
    currency: string;
  };
  estimatedDelivery: string;
  status: "processing";
}

const ORDERS_KEY = "shop-india-orders";

/** Deterministic order ID derived from cart content + timestamp (stable hash). */
export function generateOrderId(items: CartItem[], seed = Date.now()): string {
  const basis =
    items
      .map((i) => `${i.variantId}x${i.quantity}`)
      .sort()
      .join("|") + `@${seed}`;
  let hash = 0;
  for (let i = 0; i < basis.length; i++) {
    hash = (hash * 31 + basis.charCodeAt(i)) >>> 0;
  }
  const code = hash.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  const d = new Date(seed);
  const datePart = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  return `ORD-${datePart}-${code}`;
}

/** Build a deterministic order record from current cart state + selections. */
export function buildOrder(params: {
  items: CartItem[];
  customer: CustomerInfo;
  shipping: ShippingAddress;
  deliveryMethodId: DeliveryMethodId;
  paymentMethodId: PaymentMethodId;
  seed?: number;
}): OrderRecord {
  const { items, customer, shipping, deliveryMethodId, paymentMethodId } = params;
  const seed = params.seed ?? Date.now();
  const delivery = getDeliveryMethod(deliveryMethodId);
  const cart: CartTotals = calculateCart(items);

  const lineItems: OrderLineItem[] = cart.lines.map((line) => ({
    handle: line.item.product.node.handle,
    title: line.item.product.node.title,
    image: line.item.product.node.images?.edges?.[0]?.node?.url,
    variantTitle: line.item.selectedOptions
      ?.filter((o) => o.value && o.value !== "Default Title")
      .map((o) => o.value)
      .join(" · "),
    unitPrice: line.unitPrice,
    quantity: line.quantity,
    lineTotal: line.lineTotal,
  }));

  // Delivery fee replaces the cart's generic shipping estimate.
  const shippingFee = cart.qualifiesFreeShipping && delivery.id === "standard" ? 0 : delivery.price;
  const grandTotal = cart.subtotal + shippingFee;

  return {
    orderId: generateOrderId(items, seed),
    createdAt: new Date(seed).toISOString(),
    customer,
    shipping,
    deliveryMethodId,
    paymentMethodId,
    items: lineItems,
    totals: {
      subtotal: cart.subtotal,
      discountTotal: cart.discountTotal,
      shipping: shippingFee,
      taxEstimate: cart.taxEstimate,
      grandTotal,
      currency: cart.currency,
    },
    estimatedDelivery: estimateDeliveryDate(delivery),
    status: "processing",
  };
}

/** Pluggable mock payment processor — swap with a real gateway later. */
export async function processPayment(
  order: OrderRecord
): Promise<{ success: true; reference: string }> {
  // Simulate async gateway round-trip (kept short for snappy optimistic UI).
  await new Promise((r) => setTimeout(r, 900));
  return { success: true, reference: `PAY-${order.orderId.slice(4)}` };
}

/** Persist a mock order so the confirmation page can read it back. */
export function saveOrder(order: OrderRecord): void {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const all: OrderRecord[] = raw ? JSON.parse(raw) : [];
    all.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(all.slice(0, 50)));
  } catch {
    /* storage unavailable — non-fatal for mock flow */
  }
}

export function getOrderById(orderId: string): OrderRecord | null {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return null;
    const all: OrderRecord[] = JSON.parse(raw);
    return all.find((o) => o.orderId === orderId) ?? null;
  } catch {
    return null;
  }
}

export { formatINR };
