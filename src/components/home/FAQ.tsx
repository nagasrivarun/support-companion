import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Package, CreditCard, Truck, RotateCcw, Globe } from "lucide-react";

const faqItems = [
  {
    question: "What payment methods are supported?",
    answer: "We support UPI, RuPay, all major credit/debit cards (Visa, Mastercard), net banking, popular wallets, and Cash on Delivery (COD) across most pincodes in India.",
    icon: CreditCard,
  },
  {
    question: "What is the return & refund policy?",
    answer: "We offer a 7-day return window on eligible items. Products must be unused with original packaging. Refunds are credited within 3-5 business days to your original payment method or as instant UPI credit.",
    icon: RotateCcw,
  },
  {
    question: "How fast is delivery in India?",
    answer: "Metro cities receive deliveries in 1-2 days, tier-2 cities in 2-4 days, and remote pincodes in 5-7 days. Same-day delivery is available in select Mumbai, Delhi, Bengaluru, Hyderabad and Pune areas.",
    icon: Truck,
  },
  {
    question: "Do you deliver to my pincode?",
    answer: "We ship to over 28,000+ pincodes across India through Bluedart, Delhivery, DTDC, Ekart and India Post. Enter your pincode on the product page to confirm serviceability and ETA.",
    icon: Globe,
  },
  {
    question: "How do I track my shipment?",
    answer: "Every order gets a tracking ID (format: ORD-YYYYMMDD-XXXX) sent via SMS, WhatsApp and email. Visit the Track page or your account to see a live timeline with the delivery partner's updates.",
    icon: Package,
  },
  {
    question: "Are there discount codes for new buyers?",
    answer: "Yes — use WELCOME10 for 10% off your first order. Subscribe to our newsletter for exclusive festive offers, lightning deals and early access to sales.",
    icon: HelpCircle,
  },
];

export const FAQ = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about orders, shipping, returns, and more.
            Can't find what you're looking for? Use our chat support!
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-medium text-foreground">{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 pl-8">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
