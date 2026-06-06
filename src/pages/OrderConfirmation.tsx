import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Package,
  ShoppingBag,
  Home,
  Truck,
  MapPin,
  CreditCard,
} from "lucide-react";
import { getOrderById, getDeliveryMethod, getPaymentMethod } from "@/lib/checkout";
import { formatINR } from "@/lib/pricing";

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const order = useMemo(() => (orderId ? getOrderById(orderId) : null), [orderId]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Order Confirmed — SHOP India"
        description="Thanks for your order! Your purchase is confirmed and being prepared for shipment."
        path="/order-confirmation"
        noIndex
      />
      <ShopHeader />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
              <CheckCircle className="h-10 w-10 text-success" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
          </div>

          {/* Order summary card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5" aria-hidden="true" /> Order Details
                </span>
                <Badge variant="secondary" className="bg-warning/15 text-warning">
                  Processing
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Order number</span>
                <span className="font-mono text-sm font-semibold">{order?.orderId ?? orderId ?? "—"}</span>
              </div>
              {order && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground inline-flex items-center gap-1.5">
                    <Truck className="h-4 w-4" aria-hidden="true" /> Estimated delivery
                  </span>
                  <span className="text-sm font-medium text-foreground">{order.estimatedDelivery}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Confirmation email</span>
                <span className="text-sm text-foreground">
                  {order ? `Sent to ${order.customer.email}` : "Sent to your email"}
                </span>
              </div>
            </CardContent>
          </Card>

          {order && (
            <>
              {/* Ordered products */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Ordered products</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item, i) => (
                    <div key={`${item.handle}-${i}`} className="flex gap-3">
                      <Link
                        to={`/product/${item.handle}`}
                        className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.handle}`}
                          className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.title}
                        </Link>
                        {item.variantTitle && (
                          <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right font-semibold text-foreground tabular-nums">
                        {formatINR(item.lineTotal)}
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums">{formatINR(order.totals.subtotal)}</span>
                    </div>
                    {order.totals.discountTotal > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Discount</span>
                        <span className="tabular-nums">−{formatINR(order.totals.discountTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="tabular-nums">
                        {order.totals.shipping === 0 ? "FREE" : formatINR(order.totals.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (incl. GST)</span>
                      <span className="tabular-nums">{formatINR(order.totals.taxEstimate)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base font-semibold">
                      <span>Grand total</span>
                      <span className="text-primary tabular-nums">{formatINR(order.totals.grandTotal)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping + payment */}
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" aria-hidden="true" /> Shipping to
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-0.5">
                    <p className="font-medium text-foreground">{order.customer.fullName}</p>
                    <p>{order.shipping.line1}</p>
                    {order.shipping.line2 && <p>{order.shipping.line2}</p>}
                    <p>
                      {order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}
                    </p>
                    <p>{order.shipping.country}</p>
                    <p className="pt-1">{order.customer.phone}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-4 w-4" aria-hidden="true" /> Delivery & Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="text-foreground font-medium">
                        {getDeliveryMethod(order.deliveryMethodId).label}
                      </span>
                    </p>
                    <p>
                      Paid via{" "}
                      <span className="text-foreground font-medium">
                        {getPaymentMethod(order.paymentMethodId).label}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button variant="outline" className="w-full sm:w-auto">
                <ShoppingBag className="h-4 w-4 mr-2" aria-hidden="true" />
                Continue Shopping
              </Button>
            </Link>
            <Link to="/">
              <Button className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                Back to Home
              </Button>
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Have questions about your order?{" "}
            <Link to="/shipping" className="text-primary hover:underline">
              View shipping information
            </Link>{" "}
            or contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
