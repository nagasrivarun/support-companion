import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/pricing";
import { getFrequentlyBoughtTogether, type BundleItem } from "@/data/recommendations";
import { toShopifyProduct, type LocalProduct } from "@/data/products";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { SITE_URL } from "@/components/SEO";
import { toast } from "sonner";

interface FrequentlyBoughtTogetherProps {
  product: LocalProduct;
}

const localToCartItem = (p: LocalProduct): CartItem => {
  const sp = toShopifyProduct(p);
  const variant = sp.node.variants.edges[0].node;
  return {
    product: sp,
    variantId: variant.id,
    variantTitle: variant.title,
    price: variant.price,
    quantity: 1,
    selectedOptions: [],
  };
};

const BundleThumb = ({ item }: { item: BundleItem }) => (
  <Link
    to={`/product/${item.product.handle}`}
    className="group flex flex-col items-center gap-1.5 w-[88px] sm:w-[104px] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    aria-label={item.product.title}
  >
    <div className="aspect-square w-full rounded-xl overflow-hidden bg-muted border border-border/60">
      <img
        src={item.product.image}
        alt={item.product.title}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <span className="text-[11px] text-muted-foreground text-center line-clamp-2 leading-tight group-hover:text-primary transition-colors">
      {item.product.title}
    </span>
    <span className="text-xs font-bold text-foreground">{formatINR(item.pricing.price)}</span>
  </Link>
);

/**
 * Frequently Bought Together — current product plus complementary add-ons,
 * with combined price and an "Add all to cart" action.
 */
export const FrequentlyBoughtTogether = ({ product }: FrequentlyBoughtTogetherProps) => {
  const bundle = useMemo(() => getFrequentlyBoughtTogether(product), [product]);
  const addItem = useCartStore((s) => s.addItem);

  if (bundle.addons.length === 0) return null;

  const inStockItems = bundle.items.filter((i) => i.product.inStock);

  const handleAddAll = () => {
    inStockItems.forEach((i) => addItem(localToCartItem(i.product)));
    toast.success(`${inStockItems.length} items added to cart`, { position: "top-center" });
  };

  const bundleJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Frequently bought with ${product.title}`,
    itemListElement: bundle.items.map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/product/${i.product.handle}`,
      name: i.product.title,
    })),
  };

  return (
    <section
      className="mt-16 border-t border-border pt-12"
      aria-labelledby="fbt-heading"
    >
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(bundleJsonLd)}</script>
      </Helmet>
      <h2 id="fbt-heading" className="text-xl md:text-2xl font-bold text-foreground mb-6">
        Frequently Bought Together
      </h2>

      <div className="rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Thumbnails with plus separators */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1">
            {bundle.items.map((item, idx) => (
              <div key={item.product.id} className="flex items-center gap-2 sm:gap-3">
                {idx > 0 && (
                  <Plus className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                )}
                <BundleThumb item={item} />
              </div>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="lg:ml-auto lg:border-l lg:border-border/60 lg:pl-6 w-full lg:w-auto">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm text-muted-foreground">Total price:</span>
              <span className="text-2xl font-bold text-foreground">
                {formatINR(bundle.totalPrice)}
              </span>
            </div>
            {bundle.totalDiscountPercent > 0 && (
              <p className="text-xs text-success font-medium mb-3">
                You save {formatINR(bundle.totalOriginalPrice - bundle.totalPrice)} (
                {bundle.totalDiscountPercent}%)
              </p>
            )}
            <Button
              onClick={handleAddAll}
              size="lg"
              className="w-full lg:w-auto gap-2"
              disabled={inStockItems.length === 0}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Add all {inStockItems.length} to cart
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
