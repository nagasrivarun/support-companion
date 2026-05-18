import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, CheckCircle, Loader2, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().trim().email().max(255);

const payments = ["UPI", "RuPay", "VISA", "Mastercard", "PayTM", "COD"];
const partners = ["Bluedart", "Delhivery", "DTDC", "Ekart", "XpressBees"];

export const PremiumFooter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = emailSchema.safeParse(email);
    if (!v.success) return toast.error("Enter a valid email");
    setLoading(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: v.data });
      if (error && error.code !== "23505") throw error;
      setDone(true);
      toast.success("Subscribed!");
    } catch {
      toast.error("Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative border-t border-border bg-card/30 mt-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Newsletter band */}
      <div className="container mx-auto px-4 py-12 md:py-14">
        <div className="glass-strong rounded-2xl p-6 md:p-10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold mb-2">
              <Mail className="h-4 w-4" /> NEWSLETTER
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Get <span className="text-gradient">10% off</span> your first order
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Exclusive deals, festive offers and early access — straight to your inbox.
            </p>
          </div>
          <div>
            {done ? (
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">You're subscribed!</span>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 h-11 bg-background/60"
                  required
                  disabled={loading}
                />
                <Button type="submit" size="lg" disabled={loading} className="bg-gradient-primary text-white border-0 hover-glow">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main link columns */}
      <div className="container mx-auto px-4 pb-10 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-2">
          <Link to="/" className="inline-flex items-center gap-1 mb-3">
            <span className="text-2xl font-extrabold tracking-tight text-gradient">SHOP</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground ml-1 mt-1">India</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            India's premium shopping marketplace with verified sellers, real-time tracking and trusted delivery to 28,000+ pincodes.
          </p>
          <div className="flex gap-2 mt-5">
            {[
              { Icon: Facebook, href: "https://facebook.com" },
              { Icon: Twitter, href: "https://twitter.com" },
              { Icon: Instagram, href: "https://instagram.com" },
              { Icon: Youtube, href: "https://youtube.com" },
            ].map(({ Icon, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 hover:text-primary text-muted-foreground transition-colors"
                aria-label={href}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
            <li><Link to="/shop?category=Clothing" className="text-muted-foreground hover:text-primary transition-colors">Clothing</Link></li>
            <li><Link to="/shop?category=Audio" className="text-muted-foreground hover:text-primary transition-colors">Audio</Link></li>
            <li><Link to="/shop?category=Footwear" className="text-muted-foreground hover:text-primary transition-colors">Footwear</Link></li>
            <li><Link to="/wishlist" className="text-muted-foreground hover:text-primary transition-colors">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors">Track Order</Link></li>
            <li><Link to="/returns" className="text-muted-foreground hover:text-primary transition-colors">Returns</Link></li>
            <li><Link to="/account" className="text-muted-foreground hover:text-primary transition-colors">My Account</Link></li>
            <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
            <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
            <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link></li>
            <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link></li>
          </ul>
        </div>
      </div>

      {/* Payments + Partners */}
      <div className="border-t border-border/60">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-2">We accept</span>
            {payments.map(p => (
              <span key={p} className="px-2.5 py-1 rounded-md glass text-[11px] font-bold text-foreground">{p}</span>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Shipping</span>
            {partners.map(p => (
              <span key={p} className="text-xs font-semibold text-muted-foreground/80">{p}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 py-5">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SHOP India · Crafted in India 🇮🇳
        </div>
      </div>
    </footer>
  );
};
