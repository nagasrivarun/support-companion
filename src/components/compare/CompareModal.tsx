import { useCompareStore } from "@/stores/compareStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export const CompareModal = () => {
  const items = useCompareStore(s => s.items);
  const isOpen = useCompareStore(s => s.isOpen);
  const setOpen = useCompareStore(s => s.setOpen);
  const removeItem = useCompareStore(s => s.removeItem);

  if (items.length < 2) return null;

  const allFeatures = [...new Set(items.flatMap(p => p.features || []))];
  const allSizes = items.some(p => p.sizes);
  const allColors = items.some(p => p.colors);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Compare Products ({items.length})</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-4 bg-muted/50 font-medium text-muted-foreground w-[140px] sticky left-0 bg-card z-10" />
                {items.map(p => (
                  <th key={p.id} className="p-4 min-w-[180px] align-top">
                    <div className="relative">
                      <button
                        onClick={() => removeItem(p.id)}
                        className="absolute -top-1 -right-1 bg-muted rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <Link to={`/product/${p.handle}`} onClick={() => setOpen(false)}>
                        <div className="w-28 h-28 mx-auto bg-muted rounded overflow-hidden mb-2">
                          <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                        </div>
                        <p className="text-foreground font-semibold text-sm line-clamp-2 hover:text-primary">{p.title}</p>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price */}
              <Row label="Price">
                {items.map(p => (
                  <td key={p.id} className="p-4">
                    <span className="text-lg font-bold text-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                    {p.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through ml-2">₹{p.originalPrice.toLocaleString("en-IN")}</span>
                    )}
                    {p.originalPrice && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% off
                      </Badge>
                    )}
                  </td>
                ))}
              </Row>

              {/* Rating */}
              <Row label="Rating" highlight>
                {items.map(p => (
                  <td key={p.id} className="p-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.floor(p.rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="text-sm font-medium ml-1">{p.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.reviewCount.toLocaleString("en-IN")} ratings</p>
                  </td>
                ))}
              </Row>

              {/* Brand */}
              <Row label="Brand">
                {items.map(p => <td key={p.id} className="p-4 text-foreground">{p.vendor}</td>)}
              </Row>

              {/* Category */}
              <Row label="Category" highlight>
                {items.map(p => <td key={p.id} className="p-4 text-foreground">{p.productType}</td>)}
              </Row>

              {/* Sizes */}
              {allSizes && (
                <Row label="Sizes">
                  {items.map(p => (
                    <td key={p.id} className="p-4">
                      {p.sizes ? (
                        <div className="flex flex-wrap gap-1">
                          {p.sizes.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                        </div>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                  ))}
                </Row>
              )}

              {/* Colors */}
              {allColors && (
                <Row label="Colors" highlight>
                  {items.map(p => (
                    <td key={p.id} className="p-4">
                      {p.colors ? p.colors.join(", ") : <span className="text-muted-foreground">—</span>}
                    </td>
                  ))}
                </Row>
              )}

              {/* Features */}
              {allFeatures.map((feature, idx) => (
                <Row key={feature} label={idx === 0 ? "Features" : ""} highlight={idx % 2 === 0}>
                  {items.map(p => (
                    <td key={p.id} className="p-4">
                      {p.features?.includes(feature) ? (
                        <span className="text-primary font-medium">✓ {feature}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </Row>
              ))}

              {/* Buy */}
              <Row label="">
                {items.map(p => (
                  <td key={p.id} className="p-4">
                    <a href={p.amazonUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="w-full gap-1 bg-warning text-warning-foreground hover:bg-warning/90">
                        <ExternalLink className="h-3.5 w-3.5" /> Buy on Amazon
                      </Button>
                    </a>
                  </td>
                ))}
              </Row>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Row = ({ label, highlight, children }: { label: string; highlight?: boolean; children: React.ReactNode }) => (
  <tr className={highlight ? "bg-muted/30" : ""}>
    <td className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider sticky left-0 bg-card z-10 border-r border-border">
      {label}
    </td>
    {children}
  </tr>
);
