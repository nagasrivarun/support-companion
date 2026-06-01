import { Check, AlertCircle, XCircle } from "lucide-react";

interface StockBadgeProps {
  stock: number;
  inStock: boolean;
}

export function StockBadge({ stock, inStock }: StockBadgeProps) {
  if (!inStock || stock <= 0) {
    return (
      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive" role="status">
        <XCircle className="h-4 w-4" aria-hidden="true" /> Out of stock
      </div>
    );
  }
  if (stock <= 5) {
    return (
      <div
        className="inline-flex items-center gap-1.5 text-sm font-medium text-warning"
        role="status"
        aria-live="polite"
      >
        <AlertCircle className="h-4 w-4 animate-urgency" aria-hidden="true" /> Only {stock} left in stock
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 text-sm font-medium text-success" role="status">
      <Check className="h-4 w-4" aria-hidden="true" /> In stock
    </div>
  );
}
