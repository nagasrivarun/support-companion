import { useCompareStore } from "@/stores/compareStore";
import { Button } from "@/components/ui/button";
import { BarChart3, Check } from "lucide-react";
import { toast } from "sonner";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { LocalProduct } from "@/data/products";

interface CompareToggleProps {
  product: LocalProduct;
  variant?: "icon" | "full";
}

const SpecsPreview = ({ product }: { product: LocalProduct }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold text-foreground line-clamp-1">{product.title}</p>
    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
      <span className="text-muted-foreground">Price</span>
      <span className="font-medium text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
      <span className="text-muted-foreground">Category</span>
      <span className="text-foreground">{product.productType}</span>
      <span className="text-muted-foreground">Brand</span>
      <span className="text-foreground">{product.vendor}</span>
      <span className="text-muted-foreground">Rating</span>
      <span className="text-foreground">{product.rating} ★ ({product.reviewCount.toLocaleString("en-IN")})</span>
      {product.features && product.features.length > 0 && (
        <>
          <span className="text-muted-foreground">Specs</span>
          <span className="text-foreground line-clamp-2">{product.features.slice(0, 2).join(", ")}</span>
        </>
      )}
    </div>
  </div>
);

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
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          onClick={toggle}
          className={`absolute top-2 left-2 z-10 p-1.5 rounded-full shadow-md transition-colors ${
            has ? "bg-primary text-primary-foreground" : "bg-card/80 text-muted-foreground hover:bg-card hover:text-foreground"
          }`}
          title={has ? "Remove from compare" : "Add to compare"}
        >
          {has ? <Check className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-52 p-3">
        <SpecsPreview product={product} />
      </HoverCardContent>
    </HoverCard>
  );
};
