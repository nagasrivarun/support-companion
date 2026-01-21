import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Package, CreditCard, Truck, RotateCcw, Globe } from "lucide-react";

const faqItems = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards (Visa, Mastercard, American Express), PayPal, and various local payment methods depending on your region. All transactions are secured with industry-standard encryption.",
    icon: CreditCard,
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy on all items. Products must be unused, unworn, and in their original packaging with tags attached. Refunds are processed within 5-7 business days after we receive your return. Note: Sale items and personalized products are final sale.",
    icon: RotateCcw,
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 5-7 business days, while Express shipping delivers in 2-3 business days. International shipping typically takes 7-14 business days depending on your location. Free shipping is available on orders over $50.",
    icon: Truck,
  },
  {
    question: "Which countries do you ship to?",
    answer: "We currently ship to India, United States, United Kingdom, Canada, Australia, Germany, France, and UAE. We're actively expanding to more regions - stay tuned for updates!",
    icon: Globe,
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive an email with your tracking number. You can also use our support chat and provide your order number (format: ORD-YYYYMMDD-XXXX) to get real-time updates on your delivery.",
    icon: Package,
  },
  {
    question: "Do you offer discount codes?",
    answer: "Yes! We regularly offer promotional discount codes. New customers can use code WELCOME10 for 10% off their first order. Subscribe to our newsletter or follow us on social media for exclusive deals.",
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
