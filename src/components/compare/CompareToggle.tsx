import { useCompareStore } from "@/stores/compareStore";
import { Button } from "@/components/ui/button";
import { BarChart3, Check } from "lucide-react";
import { toast } from "sonner";
import type { LocalProduct } from "@/data/products";

interface CompareToggleProps {
  product: LocalProduct;
  variant?: "icon" | "full";
}

export const CompareToggle = ({ product, variant = "icon" }: CompareToggleProps) => {
  const addItem = useCompareStore(s => s.addItem);
  const removeItem = useCompareStore(s => s.removeItem);
  const has = useCompareStore(s => s.has(product.id));

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (has) {
      removeItem(product.id);
    } else {
      const added = addItem(product);
      if (!added) toast.error("You can compare up to 4 products");
    }
  };

  if (variant === "full") {
    return (
      <Button variant={has ? "secondary" : "outline"} size="sm" onClick={toggle} className="gap-1.5">
        {has ? <Check className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
        {has ? "Added to Compare" : "Compare"}
      </Button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={`absolute top-2 left-2 z-10 p-1.5 rounded-full shadow-md transition-colors ${
        has ? "bg-primary text-primary-foreground" : "bg-card/80 text-muted-foreground hover:bg-card hover:text-foreground"
      }`}
      title={has ? "Remove from compare" : "Add to compare"}
    >
      {has ? <Check className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
    </button>
  );
};
