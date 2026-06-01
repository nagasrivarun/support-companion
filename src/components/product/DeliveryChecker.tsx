import { useState } from "react";
import { MapPin, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deliveryEta } from "@/lib/pricing";

/** Apple/Amazon-style pincode delivery checker (simulated ETA). */
export function DeliveryChecker() {
  const [pin, setPin] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "done">("idle");
  const eta = deliveryEta();

  const check = () => {
    if (!/^\d{6}$/.test(pin)) return;
    setState("checking");
    setTimeout(() => setState("done"), 700);
  };

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
        Check delivery availability
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={pin}
          inputMode="numeric"
          maxLength={6}
          aria-label="Enter 6-digit pincode"
          placeholder="Enter pincode"
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
            setState("idle");
          }}
          onKeyDown={(e) => e.key === "Enter" && check()}
          className="h-10 max-w-[180px] tabular-nums"
        />
        <Button
          variant="secondary"
          className="h-10"
          onClick={check}
          disabled={pin.length !== 6 || state === "checking"}
        >
          {state === "checking" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Check"}
        </Button>
      </div>
      {state === "done" && (
        <p className="text-sm text-success inline-flex items-center gap-1.5 animate-fade-in">
          <Check className="h-4 w-4" aria-hidden="true" />
          Delivers to {pin} by <span className="font-semibold">{eta.label}</span>
        </p>
      )}
    </div>
  );
}
