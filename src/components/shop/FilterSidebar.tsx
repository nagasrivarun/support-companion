import { useState } from "react";
import { getCategories, getVendorsList } from "@/data/products";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Star, X, ChevronDown, ChevronUp } from "lucide-react";

interface FilterSidebarProps {
  category: string;
  setCategory: (v: string) => void;
  vendor: string;
  setVendor: (v: string) => void;
  selectedBrands: string[];
  setSelectedBrands: (v: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  onReset: () => void;
  activeCount: number;
}

export const FilterSidebar = ({
  category,
  setCategory,
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  inStockOnly,
  setInStockOnly,
  onReset,
  activeCount,
}: FilterSidebarProps) => {
  const categories = getCategories();
  const vendors = getVendorsList();

  const [showAllBrands, setShowAllBrands] = useState(false);
  const displayedBrands = showAllBrands ? vendors : vendors.slice(0, 8);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(
      selectedBrands.includes(brand)
        ? selectedBrands.filter((b) => b !== brand)
        : [...selectedBrands, brand]
    );
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-[8.5rem] rounded-xl border border-border bg-card p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase">
            Filters
          </h3>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" /> Clear all
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="space-y-6 pr-3">
            {/* Categories */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </Label>
              <div className="space-y-1">
                <button
                  onClick={() => setCategory("all")}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                    category === "all"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                      category === cat
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Price Range
              </Label>
              <Slider
                value={priceRange}
                min={0}
                max={150000}
                step={500}
                onValueChange={(v) => setPriceRange(v as [number, number])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
                <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Brand
              </Label>
              {selectedBrands.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {selectedBrands.map((b) => (
                    <Badge
                      key={b}
                      variant="secondary"
                      className="text-xs cursor-pointer gap-1 hover:bg-destructive/10"
                      onClick={() => toggleBrand(b)}
                    >
                      {b} <X className="h-2.5 w-2.5" />
                    </Badge>
                  ))}
                </div>
              )}
              <div className="space-y-1">
                {displayedBrands.map((v) => (
                  <label
                    key={v}
                    className="flex items-center gap-2 text-sm py-1 px-1 rounded hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedBrands.includes(v)}
                      onCheckedChange={() => toggleBrand(v)}
                    />
                    <span className="text-foreground truncate">{v}</span>
                  </label>
                ))}
                {vendors.length > 8 && (
                  <button
                    onClick={() => setShowAllBrands(!showAllBrands)}
                    className="text-xs text-primary hover:underline flex items-center gap-1 px-1 pt-1"
                  >
                    {showAllBrands ? (
                      <>Show less <ChevronUp className="h-3 w-3" /></>
                    ) : (
                      <>+{vendors.length - 8} more <ChevronDown className="h-3 w-3" /></>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Minimum Rating
              </Label>
              <div className="space-y-1">
                {[4, 3, 2, 1].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(minRating === r ? 0 : r)}
                    className={`w-full flex items-center gap-2 text-sm px-2 py-1.5 rounded-md transition-colors ${
                      minRating === r
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i <= r
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs">& up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Availability
              </Label>
              <label className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer">
                <span className="text-sm text-foreground">In Stock Only</span>
                <Switch checked={inStockOnly} onCheckedChange={setInStockOnly} />
              </label>
            </div>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
};
