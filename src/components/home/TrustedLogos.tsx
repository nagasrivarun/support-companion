const partners = [
  "Bluedart", "Delhivery", "DTDC", "India Post", "Ekart", "XpressBees", "Shadowfax", "Ecom Express",
];

export const TrustedLogos = () => (
  <section className="border-y border-border bg-card/30 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-8">
      <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground mb-5">
        Powered by India's leading logistics partners
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:gap-x-12">
        {partners.map(p => (
          <span
            key={p}
            className="text-base md:text-lg font-bold text-muted-foreground/70 hover:text-foreground transition-colors tracking-tight"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  </section>
);
