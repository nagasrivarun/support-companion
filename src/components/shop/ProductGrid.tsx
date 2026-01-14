import { useEffect, useState } from "react";
import { ShopifyProduct, fetchProducts, formatPrice, getProductTypes, getVendors, getPriceRange } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Package, Filter, X, Search, SlidersHorizontal } from "lucide-react";

type SortOption = "relevance" | "price-low" | "price-high" | "name-asc" | "name-desc";

interface Filters {
  search: string;
  productType: string;
  vendor: string;
  priceRange: [number, number];
  sortBy: SortOption;
}

export const ProductGrid = () => {
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<Filters>({
    search: "",
    productType: "all",
    vendor: "all",
    priceRange: [0, 10000],
    sortBy: "relevance",
  });
  
  // Available filter options
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [priceRangeLimits, setPriceRangeLimits] = useState({ min: 0, max: 10000 });

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedProducts = await fetchProducts(50);
        setAllProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
        
        // Extract filter options
        setProductTypes(getProductTypes(fetchedProducts));
        setVendors(getVendors(fetchedProducts));
        const range = getPriceRange(fetchedProducts);
        setPriceRangeLimits(range);
        setFilters(prev => ({ ...prev, priceRange: [range.min, range.max] }));
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...allProducts];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p => 
        p.node.title.toLowerCase().includes(searchLower) ||
        p.node.description?.toLowerCase().includes(searchLower) ||
        p.node.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Product type filter
    if (filters.productType && filters.productType !== "all") {
      result = result.filter(p => p.node.productType === filters.productType);
    }

    // Vendor filter
    if (filters.vendor && filters.vendor !== "all") {
      result = result.filter(p => p.node.vendor === filters.vendor);
    }

    // Price range filter
    result = result.filter(p => {
      const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Sort
    switch (filters.sortBy) {
      case "price-low":
        result.sort((a, b) => 
          parseFloat(a.node.priceRange.minVariantPrice.amount) - 
          parseFloat(b.node.priceRange.minVariantPrice.amount)
        );
        break;
      case "price-high":
        result.sort((a, b) => 
          parseFloat(b.node.priceRange.minVariantPrice.amount) - 
          parseFloat(a.node.priceRange.minVariantPrice.amount)
        );
        break;
      case "name-asc":
        result.sort((a, b) => a.node.title.localeCompare(b.node.title));
        break;
      case "name-desc":
        result.sort((a, b) => b.node.title.localeCompare(a.node.title));
        break;
    }

    setFilteredProducts(result);
  }, [filters, allProducts]);

  const resetFilters = () => {
    setFilters({
      search: "",
      productType: "all",
      vendor: "all",
      priceRange: [priceRangeLimits.min, priceRangeLimits.max],
      sortBy: "relevance",
    });
  };

  const activeFiltersCount = [
    filters.search,
    filters.productType !== "all",
    filters.vendor !== "all",
    filters.priceRange[0] > priceRangeLimits.min || filters.priceRange[1] < priceRangeLimits.max,
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (allProducts.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Products Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're still setting up our store. Check back soon or tell us what products you'd like to see!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>

        {/* Sort Dropdown */}
        <Select
          value={filters.sortBy}
          onValueChange={(value: SortOption) => setFilters(prev => ({ ...prev, sortBy: value }))}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Button */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Products
              </SheetTitle>
              <SheetDescription>
                Narrow down products by category, brand, or price.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Product Type */}
              {productTypes.length > 0 && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={filters.productType}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, productType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {productTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Vendor */}
              {vendors.length > 0 && (
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select
                    value={filters.vendor}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, vendor: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price Range */}
              <div className="space-y-4">
                <Label>Price Range</Label>
                <Slider
                  value={filters.priceRange}
                  min={priceRangeLimits.min}
                  max={priceRangeLimits.max}
                  step={1}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹{filters.priceRange[0].toLocaleString('en-IN')}</span>
                  <span>₹{filters.priceRange[1].toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Reset Button */}
              <Button variant="outline" onClick={resetFilters} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <button onClick={() => setFilters(prev => ({ ...prev, search: "" }))}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.productType !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.productType}
              <button onClick={() => setFilters(prev => ({ ...prev, productType: "all" }))}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.vendor !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.vendor}
              <button onClick={() => setFilters(prev => ({ ...prev, vendor: "all" }))}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {allProducts.length} products
      </p>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No matching products</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or search term.</p>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.node.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
