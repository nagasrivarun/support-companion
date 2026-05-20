import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { CompareToggle } from "@/components/compare/CompareToggle";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductGallery } from "@/components/product/ProductGallery";
import { VariantSelector } from "@/components/product/VariantSelector";
import { PriceBlock } from "@/components/product/PriceBlock";
import { DeliveryInfo } from "@/components/product/DeliveryInfo";
import { StockBadge } from "@/components/product/StockBadge";
import { RatingBlock } from "@/components/product/RatingBlock";
import { WishlistButton } from "@/components/shop/WishlistButton";
import {
  getProductByHandle,
  getProductsByCategory,
  LOCAL_PRODUCTS,
  type LocalProduct,
} from "@/data/products";
import { useBrowsingHistory } from "@/stores/browsingHistory";
import { normalizePricing } from "@/lib/pricing";
import {
  ArrowLeft,
  Star,
  ExternalLink,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const product = handle ? getProductByHandle(handle) : undefined;
  const addViewed = useBrowsingHistory((s) => s.addViewed);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);

  useEffect(() => {
    if (handle && product) {
      addViewed(handle);
      setSelectedColor(product.colors?.[0] ?? null);
      setSelectedSize(product.sizes?.[0] ?? null);
      setSelectedStorage(product.storageOptions?.[0] ?? null);
    }
  }, [handle, product, addViewed]);

  // Resolve the active variant — image, price, stock, sku all come from here.
  // Falls back gracefully when no per-variant overrides exist.
  const resolved = useMemo(() => {
    if (!product) return null;
    const colorVariant = selectedColor ? product.variants?.colors?.[selectedColor] : undefined;
    const storageVariant = selectedStorage ? product.variants?.storage?.[selectedStorage] : undefined;

    const baseNormalized = normalizePricing(product);
    const variantPrice = colorVariant?.price ?? baseNormalized.price;
    const variantOriginal = colorVariant?.originalPrice ?? baseNormalized.originalPrice ?? undefined;
    const finalNormalized = normalizePricing({
      price: variantPrice + (storageVariant?.priceDelta ?? 0),
      originalPrice: variantOriginal
        ? variantOriginal + (storageVariant?.priceDelta ?? 0)
        : undefined,
      productType: product.productType,
      vendor: product.vendor,
    });

    const image = colorVariant?.image ?? product.image;
    const stock =
      colorVariant?.stock ?? storageVariant?.stock ?? (product.inStock ? 24 : 0);
    const sku =
      colorVariant?.sku ??
      product.sku ??
      `SKU-${product.id}${selectedColor ? "-" + selectedColor.replace(/\s+/g, "").slice(0, 4).toUpperCase() : ""}${selectedStorage ? "-" + selectedStorage : ""}`;

    return { ...finalNormalized, image, stock, sku };
  }, [product, selectedColor, selectedStorage]);

  if (!product || !resolved) {
    return (
      <div className="min-h-screen bg-background">
        <ShopHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist.
          </p>
          <Link to="/shop">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${product.title} — Shop India`}
        description={
          product.description?.slice(0, 155) ||
          `Buy ${product.title} by ${product.vendor} on Shop India.`
        }
        path={`/product/${product.handle}`}
        type="product"
        image={product.image}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          image: [resolved.image],
          description: product.description,
          brand: { "@type": "Brand", name: product.vendor },
          sku: resolved.sku,
          aggregateRating:
            product.reviewCount > 0
              ? {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  reviewCount: product.reviewCount,
                }
              : undefined,
          offers: {
            "@type": "Offer",
            url: `/product/${product.handle}`,
            priceCurrency: "INR",
            price: resolved.price,
            availability:
              resolved.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        }}
      />
      <ShopHeader />

      <div className="container mx-auto px-4 py-8">
        <Link
          to="/shop"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery — real image switching, no tinting */}
          <ProductGallery
            activeImage={resolved.image}
            thumbnails={product.images}
            variantImages={
              product.variants?.colors
                ? Object.values(product.variants.colors)
                    .map((v) => v.image)
                    .filter((s): s is string => !!s)
                : []
            }
            alt={product.title}
            discountPercent={resolved.discountPercent}
          />

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-primary font-medium mb-1">{product.vendor}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {product.title}
              </h1>
              <p className="text-xs text-muted-foreground mt-2">SKU: {resolved.sku}</p>
            </div>

            {/* Rating */}
            <RatingBlock rating={product.rating} reviewCount={product.reviewCount} size="md" />


            {/* Price */}
            <div className="border-b border-border pb-5">
              <PriceBlock
                price={resolved.price}
                originalPrice={resolved.originalPrice}
                discountPercent={resolved.discountPercent}
              />
              <div className="mt-3">
                <StockBadge stock={resolved.stock} inStock={product.inStock} />
              </div>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <CompareToggle product={product} variant="full" />

            {/* Variant selectors */}
            <VariantSelector
              colors={product.colors}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              storageOptions={product.storageOptions}
              selectedStorage={selectedStorage}
              onStorageChange={setSelectedStorage}
              storagePriceDelta={(s) =>
                product.variants?.storage?.[s]?.priceDelta ?? 0
              }
              basePrice={resolved.price}
            />

            {/* Delivery */}
            <DeliveryInfo price={resolved.price} />

            {/* Buy Button */}
            <div className="flex gap-3">
              <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button
                  size="lg"
                  className="w-full gap-2 bg-warning text-warning-foreground hover:bg-warning/90 text-lg py-6 shadow-lg"
                  disabled={resolved.stock <= 0}
                >
                  <ExternalLink className="h-5 w-5" /> Buy Now on Amazon
                </Button>
              </a>
              <WishlistButton
                variant="icon"
                className="h-[60px] w-[60px] rounded-xl border border-border"
                product={{
                  id: product.id,
                  handle: product.handle,
                  title: product.title,
                  image: resolved.image,
                  price: resolved.price,
                  currencyCode: product.currencyCode,
                }}
              />
            </div>

            {/* Features */}
            {product.features && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Key Features</h3>
                <ul className="space-y-1">
                  {product.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <CustomersAlsoBought product={product} />

        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-foreground mb-8">Customer Reviews</h2>
          <ProductReviews productHandle={handle || ""} productTitle={product.title} />
        </div>
      </div>

      <ChatWidget />
    </div>
  );
};

const CustomersAlsoBought = ({ product }: { product: LocalProduct }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left:
        dir === "left"
          ? -scrollRef.current.clientWidth * 0.8
          : scrollRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  const sameCategory = getProductsByCategory(product.productType).filter(
    (p) => p.id !== product.id
  );
  const otherProducts = LOCAL_PRODUCTS.filter(
    (p) => p.id !== product.id && p.productType !== product.productType
  ).sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  const related = [...sameCategory, ...otherProducts].slice(0, 12);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 border-t border-border pt-12">
      <h2 className="text-xl font-bold text-foreground mb-6">
        Customers who bought this also bought
      </h2>
      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-r-md p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {related.map((p) => {
            const np = normalizePricing(p);
            return (
              <Link
                key={p.id}
                to={`/product/${p.handle}`}
                className="flex-shrink-0 w-[180px] group/card"
              >
                <div className="w-[180px] h-[180px] bg-muted rounded overflow-hidden mb-2">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover/card:scale-105 transition-transform"
                  />
                </div>
                <p className="text-sm text-primary hover:text-primary/80 line-clamp-2 mb-1">
                  {p.title}
                </p>
                <div className="mb-1">
                  <RatingBlock rating={p.rating} reviewCount={p.reviewCount} size="xs" showValue={false} />
                </div>
                <div className="flex items-baseline gap-1">
                  {np.discountPercent > 0 && (
                    <span className="text-xs text-destructive font-medium">
                      -{np.discountPercent}%
                    </span>
                  )}
                  <span className="text-base font-bold text-foreground">
                    ₹{np.price.toLocaleString("en-IN")}
                  </span>
                  {np.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{np.originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-l-md p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
