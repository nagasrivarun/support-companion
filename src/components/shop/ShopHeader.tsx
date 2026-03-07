import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { Heart, LayoutDashboard, Truck, User, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export const ShopHeader = () => {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Scroll to product grid and trigger search via URL hash
      const searchInput = document.querySelector<HTMLInputElement>('[placeholder="Search products..."]');
      if (searchInput) {
        // Set value and dispatch input event to trigger React state update
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        nativeInputValueSetter?.call(searchInput, searchQuery);
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/shop" className="flex items-center gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-gradient">SHOP</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground ml-1 mt-1">India</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              className="text-sm font-medium text-foreground"
            >
              Products
            </Link>
            <Link 
              to="/shipping" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Shipping
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" title="Wishlist">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/shipping">
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex" title="Shipping Info">
                <Truck className="h-5 w-5" />
              </Button>
            </Link>
            <Link to={user ? "/account" : "/auth"}>
              <Button variant="ghost" size="icon" title={user ? "My Account" : "Sign In"}>
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex" title="Dashboard">
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            </Link>
            <CartDrawer />
          </div>
        </div>
      </div>
    </header>
  );
};
