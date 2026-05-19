import { Check, AlertCircle, XCircle } from "lucide-react";

interface StockBadgeProps {
  stock: number;
  inStock: boolean;
}

export function StockBadge({ stock, inStock }: StockBadgeProps) {
  if (!inStock || stock <= 0) {
    return (
      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
        <XCircle className="h-4 w-4" /> Out of stock
      </div>
    );
  }
  if (stock <= 5) {
    return (
      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-warning">
        <AlertCircle className="h-4 w-4" /> Only {stock} left in stock
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
      <Check className="h-4 w-4" /> In stock
    </div>
  );
}
