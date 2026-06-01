import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check } from "lucide-react";
import type { LocalProduct } from "@/data/products";

interface ProductDetailsAccordionProps {
  product: LocalProduct;
  sku: string;
}

/** Premium collapsible sections: Highlights, Specifications, Shipping & Returns. */
export function ProductDetailsAccordion({ product, sku }: ProductDetailsAccordionProps) {
  const specs: [string, string][] = [
    ["Brand", product.vendor],
    ["Category", product.productType],
    ["Model / SKU", sku],
    product.colors?.length ? ["Available colors", product.colors.join(", ")] : null,
    product.sizes?.length ? ["Sizes", product.sizes.join(", ")] : null,
    product.storageOptions?.length ? ["Storage", product.storageOptions.join(", ")] : null,
    ["Rating", `${product.rating} / 5 (${product.reviewCount.toLocaleString("en-IN")} reviews)`],
  ].filter(Boolean) as [string, string][];

  return (
    <Accordion type="single" collapsible defaultValue="specs" className="border-t border-border">
      {product.features && product.features.length > 0 && (
        <AccordionItem value="highlights" className="border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Highlights
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}

      <AccordionItem value="specs" className="border-border">
        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
          Specifications
        </AccordionTrigger>
        <AccordionContent>
          <table className="w-full text-sm">
            <tbody>
              {specs.map(([k, v], i) => (
                <tr key={k} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                  <th scope="row" className="text-left font-medium text-muted-foreground py-2 px-3 w-2/5 align-top">
                    {k}
                  </th>
                  <td className="py-2 px-3 text-foreground">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="shipping" className="border-border">
        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
          Shipping &amp; Returns
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
              Free delivery across 28,000+ pincodes in India on eligible orders.
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
              7-day easy returns with multiple resolution options.
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
              Pay via UPI, RuPay, cards or Cash on Delivery.
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
