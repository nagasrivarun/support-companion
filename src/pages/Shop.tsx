import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { LOCAL_PRODUCTS, getCategories, getVendorsList, type LocalProduct } from "@/data/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, X, SlidersHorizontal, ExternalLink, Eye } from "lucide-react";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { CompareToggle } from "@/components/compare/CompareToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FilterSidebar } from "@/components/shop/FilterSidebar";

type SortOption = "relevance" | "price-low" | "price-high" | "rating" | "name-asc";

const StarRating = ({ rating, count }: { rating: number; count: number }) => (
  <div className="flex items-center gap-1">
    <div className="flex">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.floor(rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
      ))}
    </div>
    <span className="text-xs text-muted-foreground">{count.toLocaleString("en-IN")}</span>
  </div>
);

const ProductCard = ({ product, onQuickView }: { product: LocalProduct; onQuickView: (p: LocalProduct) => void }) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="group h-full overflow-hidden border-border hover:border-primary/40 transition-all hover:shadow-lg">
      <Link to={`/product/${product.handle}`}>
        <div className="aspect-square bg-muted overflow-hidden relative">
          <CompareToggle product={product} />
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
            <WishlistButton
              product={{
                id: product.id,
                handle: product.handle,
                title: product.title,
                image: product.image,
                price: product.price,
                currencyCode: product.currencyCode,
              }}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
            className="absolute bottom-2 right-2 z-10 bg-background/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            title="Quick View"
          >
            <Eye className="h-4 w-4 text-foreground" />
          </button>
          <img src={product.image} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold">
              {discount}% OFF
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="secondary" className="absolute top-10 right-2">Out of Stock</Badge>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem]">{product.title}</h3>
          <StarRating rating={product.rating} count={product.reviewCount} />
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.vendor}</p>
        </div>
      </Link>
      <div className="p-3 pt-0">
        <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
          <Button className="w-full gap-2 bg-warning text-warning-foreground hover:bg-warning/90" size="sm">
            <ExternalLink className="h-3.5 w-3.5" /> Buy on Amazon
          </Button>
        </a>
      </div>
    </Card>
  );
};

const Shop = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [vendor, setVendor] = useState("all");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150000]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<LocalProduct | null>(null);

  const categories = getCategories();
  const vendors = getVendorsList();

  const filtered = useMemo(() => {
    let result = [...LOCAL_PRODUCTS];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }
    if (category !== "all") result = result.filter(p => p.productType === category);
    if (vendor !== "all") result = result.filter(p => p.vendor === vendor);
    if (selectedBrands.length > 0) result = result.filter(p => selectedBrands.includes(p.vendor));
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) result = result.filter(p => p.rating >= minRating);
    if (inStockOnly) result = result.filter(p => p.inStock);

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "name-asc": result.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return result;
  }, [search, category, vendor, selectedBrands, sortBy, priceRange, minRating, inStockOnly]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setVendor("all");
    setSelectedBrands([]);
    setSortBy("relevance");
    setPriceRange([0, 150000]);
    setMinRating(0);
    setInStockOnly(false);
  };

  const activeCount = [search, category !== "all", vendor !== "all", selectedBrands.length > 0, priceRange[0] > 0 || priceRange[1] < 150000, minRating > 0].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />

      {/* Category Tabs */}
      <div className="border-b border-border bg-card sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            <Button
              variant={category === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCategory("all")}
              className="whitespace-nowrap"
            >
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "ghost"}
                size="sm"
                onClick={() => setCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
            category={category}
            setCategory={setCategory}
            vendor={vendor}
            setVendor={setVendor}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minRating={minRating}
            setMinRating={setMinRating}
            onReset={resetFilters}
            activeCount={activeCount}
          />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
              {/* Mobile filter trigger */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                    {activeCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {activeCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <Label>Brand</Label>
                      <Select value={vendor} onValueChange={setVendor}>
                        <SelectTrigger><SelectValue placeholder="All Brands" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Brands</SelectItem>
                          {vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label>Price Range</Label>
                      <Slider value={priceRange} min={0} max={150000} step={1000} onValueChange={v => setPriceRange(v as [number, number])} />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
                        <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <Button variant="outline" onClick={resetFilters} className="w-full">
                      <X className="h-4 w-4 mr-2" /> Reset Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results */}
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filtered.length} of {LOCAL_PRODUCTS.length} products
            </p>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No matching products</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters.</p>
                <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal product={quickViewProduct} open={!!quickViewProduct} onOpenChange={(o) => { if (!o) setQuickViewProduct(null); }} />
      <ChatWidget />
    </div>
  );
};

export default Shop;
