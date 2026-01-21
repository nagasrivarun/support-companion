import { Link } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { Store, MessageCircle, LayoutDashboard, Truck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const ShopHeader = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/shop" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-foreground">Shop</span>
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
