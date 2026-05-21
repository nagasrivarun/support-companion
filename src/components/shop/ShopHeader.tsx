import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { Heart, LayoutDashboard, Truck, User, Search, X, Menu, Package, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Products" },
  { to: "/shipping", label: "Track" },
  { to: "/wishlist", label: "Wishlist" },
];

export const ShopHeader = () => {
  const { user, signOut } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const wishCount = wishlistItems.length;
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 glass-strong border-border/60">
              <div className="flex items-center gap-1 mb-8 mt-2">
                <span className="text-2xl font-extrabold tracking-tight text-gradient">SHOP</span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground ml-1 mt-1">India</span>
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map(l => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to={user ? "/account" : "/auth"}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {user ? "My Account" : "Sign In"}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 mr-2">
            <span className="text-2xl font-extrabold tracking-tight text-gradient">SHOP</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground ml-1 mt-1">India</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-primary/5 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" title="Search" onClick={() => setSearchOpen(!searchOpen)}>
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>
            <Link to="/wishlist" className="hidden sm:inline-flex">
              <Button variant="ghost" size="icon" title="Wishlist" className="relative">
                <Heart className="h-5 w-5" />
                {wishCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {wishCount > 99 ? "99+" : wishCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title={user ? "Account" : "Sign in"}>
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-strong border-border/60">
                {user ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="text-xs text-muted-foreground">Signed in as</div>
                      <div className="text-sm font-medium truncate">{user.email}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/account")}>
                      <Settings className="h-4 w-4 mr-2" /> My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                      <Heart className="h-4 w-4 mr-2" /> Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/shipping")}>
                      <Package className="h-4 w-4 mr-2" /> Track Order
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/auth")}>Sign In</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/auth")}>Create Account</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/shipping")}>
                      <Truck className="h-4 w-4 mr-2" /> Track Shipment
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/dashboard" className="hidden lg:inline-flex">
              <Button variant="ghost" size="icon" title="Dashboard"><LayoutDashboard className="h-5 w-5" /></Button>
            </Link>
            <CartDrawer />
          </div>
        </div>

        {searchOpen && <SearchAutocomplete onClose={() => setSearchOpen(false)} />}
      </div>
    </header>
  );
};
