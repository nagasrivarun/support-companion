import { Truck, MapPin, ShieldCheck } from "lucide-react";
import { deliveryEta, formatINR, FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";

interface DeliveryInfoProps {
  price: number;
}

export function DeliveryInfo({ price }: DeliveryInfoProps) {
  const eta = deliveryEta();
  const free = eta.isFree(price);

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 space-y-2.5 text-sm">
      <div className="flex items-start gap-2.5">
        <Truck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-medium text-foreground">
            {free ? "FREE delivery" : `Delivery ${formatINR(99)}`}
          </span>
          <span className="text-muted-foreground"> by {eta.label}</span>
          {!free && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Free above {formatINR(FREE_DELIVERY_THRESHOLD)}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-muted-foreground">Delivers across 28,000+ pincodes in India</span>
      </div>
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-muted-foreground">UPI, RuPay, COD available</span>
      </div>
    </div>
  );
}
