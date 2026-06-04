import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { RecommendationCard } from "@/components/product/RecommendationCard";
import { getRelatedProducts } from "@/data/recommendations";
import { SITE_URL } from "@/components/SEO";
import type { LocalProduct } from "@/data/products";

interface RelatedProductsProps {
  product: LocalProduct;
  limit?: number;
}

/**
 * Related Products rail — same category, similar price band and shared tags.
 * Responsive grid (2 cols mobile → 4 desktop) with ItemList structured data.
 */
export const RelatedProducts = ({ product, limit = 8 }: RelatedProductsProps) => {
  const related = useMemo(() => getRelatedProducts(product, limit), [product, limit]);

  if (related.length === 0) return null;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Related to ${product.title}`,
    itemListElement: related.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/product/${p.handle}`,
      name: p.title,
    })),
  };

  return (
    <section className="mt-16 border-t border-border pt-12" aria-labelledby="related-products-heading">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
      </Helmet>
      <h2 id="related-products-heading" className="text-xl md:text-2xl font-bold text-foreground mb-6">
        Related Products
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {related.map((p) => (
          <RecommendationCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};
