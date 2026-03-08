import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, Eye } from "lucide-react";
import type { LocalProduct } from "@/data/products";

interface QuickViewModalProps {
  product: LocalProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickViewModal = ({ product, open, onOpenChange }: QuickViewModalProps) => {
  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="aspect-square bg-muted overflow-hidden relative">
            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
            {discount > 0 && (
              <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground font-bold">
                {discount}% OFF
              </Badge>
            )}
          </div>
          <div className="p-6 flex flex-col">
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg leading-snug">{product.title}</DialogTitle>
            </DialogHeader>

            <p className="text-xs text-muted-foreground mt-1">{product.vendor}</p>

            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`h-4 w-4 ${i <= Math.floor(product.rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
              ))}
              <span className="text-xs text-muted-foreground ml-1">({product.reviewCount.toLocaleString("en-IN")})</span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{product.description}</p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              <Badge variant="outline">{product.productType}</Badge>
              {product.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>

            <Badge variant={product.inStock ? "default" : "secondary"} className="mt-3 w-fit">
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Badge>

            <div className="mt-auto pt-4 flex flex-col gap-2">
              <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2 bg-warning text-warning-foreground hover:bg-warning/90">
                  <ExternalLink className="h-4 w-4" /> Buy on Amazon
                </Button>
              </a>
              <Link to={`/product/${product.handle}`} onClick={() => onOpenChange(false)}>
                <Button variant="outline" className="w-full gap-2">
                  <Eye className="h-4 w-4" /> View Full Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
