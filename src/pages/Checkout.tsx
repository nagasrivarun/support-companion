import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ShoppingBag,
  User,
  MapPin,
  Truck,
  CreditCard,
  Check,
  ChevronLeft,
  Loader2,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { calculateCart } from "@/lib/cart";
import { formatINR } from "@/lib/pricing";
import {
  DELIVERY_METHODS,
  PAYMENT_METHODS,
  getDeliveryMethod,
  buildOrder,
  processPayment,
  saveOrder,
} from "@/lib/checkout";
import { cn } from "@/lib/utils";

/* ----------------------------- validation ----------------------------- */

const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});

const shippingSchema = z.object({
  line1: z.string().trim().min(3, "Address is required").max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required").max(60),
  state: z.string().trim().min(2, "State is required").max(60),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  country: z.string().trim().min(2).max(60),
});

type StepErrors = Record<string, string>;

const STEPS = [
  { id: 1, label: "Information", icon: User },
  { id: 2, label: "Address", icon: MapPin },
  { id: 3, label: "Delivery", icon: Truck },
  { id: 4, label: "Payment", icon: CreditCard },
] as const;

/* ----------------------------- field ----------------------------- */

const Field = ({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
  optional,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  optional?: boolean;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>
      {label}
      {optional && <span className="text-muted-foreground font-normal"> (optional)</span>}
    </Label>
    <Input
      id={id}
      type={type}
      inputMode={inputMode}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={!!error}
      className={cn(error && "border-destructive focus-visible:ring-destructive")}
    />
    {error && <p className="text-xs font-medium text-destructive">{error}</p>}
  </div>
);

/* ----------------------------- page ----------------------------- */

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const {
    customer,
    shipping,
    deliveryMethodId,
    paymentMethodId,
    setCustomer,
    setShipping,
    setDeliveryMethod,
    setPaymentMethod,
    reset,
  } = useCheckoutStore();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<StepErrors>({});
  const [placing, setPlacing] = useState(false);

  const totals = useMemo(() => calculateCart(items), [items]);
  const delivery = getDeliveryMethod(deliveryMethodId);
  const shippingFee =
    totals.qualifiesFreeShipping && delivery.id === "standard" ? 0 : delivery.price;
  const grandTotal = totals.subtotal + shippingFee;

  if (items.length === 0 && !placing) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Checkout | SHOP India" description="Complete your purchase." path="/checkout" noIndex />
        <ShopHeader />
        <main className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add items to your cart before checking out.</p>
          <Link to="/shop">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </main>
      </div>
    );
  }

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      const r = customerSchema.safeParse(customer);
      if (!r.success) {
        setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
        return false;
      }
    }
    if (s === 2) {
      const r = shippingSchema.safeParse(shipping);
      if (!r.success) {
        setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
        return false;
      }
    }
    setErrors({});
    return true;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setStep(1);
      return;
    }
    setPlacing(true);
    const order = buildOrder({
      items,
      customer,
      shipping,
      deliveryMethodId,
      paymentMethodId,
    });
    try {
      await processPayment(order);
      saveOrder(order);
      clearCart();
      reset();
      toast({ title: "Order placed!", description: `Order ${order.orderId} confirmed.` });
      navigate(`/order-confirmation?order_id=${encodeURIComponent(order.orderId)}`);
    } catch {
      setPlacing(false);
      toast({
        title: "Payment failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Secure Checkout | SHOP India"
        description="Complete your order with secure multi-step checkout — customer details, shipping, delivery and payment."
        path="/checkout"
        noIndex
      />
      <ShopHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Checkout</h1>
          <Link to="/cart">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to cart
            </Button>
          </Link>
        </div>

        {/* Stepper */}
        <ol className="flex items-center justify-between mb-8 max-w-2xl">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <li key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center border transition-colors",
                      done && "bg-primary border-primary text-primary-foreground",
                      active && "border-primary text-primary",
                      !done && !active && "border-border text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] sm:text-xs font-medium",
                      active || done ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 rounded-full",
                      step > s.id ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form steps */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card/50 p-5 sm:p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Customer Information</h2>
                  <Field
                    id="fullName"
                    label="Full name"
                    value={customer.fullName}
                    onChange={(v) => setCustomer({ fullName: v })}
                    error={errors.fullName}
                    placeholder="Aarav Sharma"
                  />
                  <Field
                    id="email"
                    label="Email"
                    type="email"
                    inputMode="email"
                    value={customer.email}
                    onChange={(v) => setCustomer({ email: v })}
                    error={errors.email}
                    placeholder="you@example.com"
                  />
                  <Field
                    id="phone"
                    label="Phone number"
                    type="tel"
                    inputMode="tel"
                    value={customer.phone}
                    onChange={(v) => setCustomer({ phone: v.replace(/\D/g, "").slice(0, 10) })}
                    error={errors.phone}
                    placeholder="9876543210"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Shipping Address</h2>
                  <Field
                    id="line1"
                    label="Address line 1"
                    value={shipping.line1}
                    onChange={(v) => setShipping({ line1: v })}
                    error={errors.line1}
                    placeholder="Flat / House no, Building, Street"
                  />
                  <Field
                    id="line2"
                    label="Address line 2"
                    optional
                    value={shipping.line2}
                    onChange={(v) => setShipping({ line2: v })}
                    error={errors.line2}
                    placeholder="Area, Landmark"
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                      id="city"
                      label="City"
                      value={shipping.city}
                      onChange={(v) => setShipping({ city: v })}
                      error={errors.city}
                      placeholder="Mumbai"
                    />
                    <Field
                      id="state"
                      label="State"
                      value={shipping.state}
                      onChange={(v) => setShipping({ state: v })}
                      error={errors.state}
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                      id="postalCode"
                      label="PIN code"
                      inputMode="numeric"
                      value={shipping.postalCode}
                      onChange={(v) => setShipping({ postalCode: v.replace(/\D/g, "").slice(0, 6) })}
                      error={errors.postalCode}
                      placeholder="400001"
                    />
                    <Field
                      id="country"
                      label="Country"
                      value={shipping.country}
                      onChange={(v) => setShipping({ country: v })}
                      error={errors.country}
                      placeholder="India"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Delivery Method</h2>
                  <RadioGroup
                    value={deliveryMethodId}
                    onValueChange={(v) => setDeliveryMethod(v as typeof deliveryMethodId)}
                    className="space-y-3"
                  >
                    {DELIVERY_METHODS.map((m) => {
                      const free = totals.qualifiesFreeShipping && m.id === "standard";
                      return (
                        <Label
                          key={m.id}
                          htmlFor={`d-${m.id}`}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors",
                            deliveryMethodId === m.id ? "border-primary bg-primary/5" : "border-border"
                          )}
                        >
                          <RadioGroupItem value={m.id} id={`d-${m.id}`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground">{m.label}</div>
                            <div className="text-sm text-muted-foreground">{m.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">
                              {free || m.price === 0 ? (
                                <span className="text-success">FREE</span>
                              ) : (
                                formatINR(m.price)
                              )}
                            </div>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
                  <RadioGroup
                    value={paymentMethodId}
                    onValueChange={(v) => setPaymentMethod(v as typeof paymentMethodId)}
                    className="space-y-3"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <Label
                        key={m.id}
                        htmlFor={`p-${m.id}`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors",
                          paymentMethodId === m.id ? "border-primary bg-primary/5" : "border-border"
                        )}
                      >
                        <RadioGroupItem value={m.id} id={`p-${m.id}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground">{m.label}</div>
                          <div className="text-sm text-muted-foreground">{m.description}</div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    This is a demo checkout — no real payment is processed.
                  </p>
                </div>
              )}

              {/* Nav buttons */}
              <div className="flex items-center justify-between gap-3 mt-6">
                {step > 1 ? (
                  <Button variant="outline" onClick={back} disabled={placing}>
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                {step < 4 ? (
                  <Button onClick={next}>Continue</Button>
                ) : (
                  <Button onClick={placeOrder} disabled={placing} className="gap-2">
                    {placing && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    {placing ? "Placing order…" : `Place order · ${formatINR(grandTotal)}`}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card/50 p-5 sm:p-6 lg:sticky lg:top-24 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {totals.lines.map((line) => {
                  const img = line.item.product.node.images?.edges?.[0]?.node?.url;
                  return (
                    <div key={line.item.variantId} className="flex gap-3">
                      <div className="relative w-14 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {img && (
                          <img
                            src={img}
                            alt={line.item.product.node.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {line.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {line.item.product.node.title}
                        </p>
                        <p className="text-sm text-muted-foreground tabular-nums">
                          {formatINR(line.lineTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">{formatINR(totals.subtotal)}</span>
                </div>
                {totals.discountTotal > 0 && (
                  <div className="flex justify-between text-success">
                    <span className="inline-flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" aria-hidden="true" /> Discount
                    </span>
                    <span className="font-medium tabular-nums">−{formatINR(totals.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery ({delivery.label})</span>
                  <span className={cn("font-medium tabular-nums", shippingFee === 0 && "text-success")}>
                    {shippingFee === 0 ? "FREE" : formatINR(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (incl. GST)</span>
                  <span className="font-medium tabular-nums">{formatINR(totals.taxEstimate)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-base font-semibold">Grand total</span>
                <span
                  key={grandTotal}
                  className="text-xl font-bold text-primary tabular-nums animate-value-bump"
                >
                  {formatINR(grandTotal)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground text-center inline-flex items-center justify-center gap-1.5 w-full">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> 100% secure & encrypted
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
