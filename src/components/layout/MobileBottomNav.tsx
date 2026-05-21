import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, Heart, User, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/shop", icon: Search, label: "Shop" },
  { to: "/wishlist", icon: Heart, label: "Wishlist" },
  { to: "/account", icon: User, label: "Account" },
];

export const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const count = useCartStore(s => s.getTotalItems());
  const { items: wishItems } = useWishlist();
  const wishCount = wishItems.length;

  if (/^\/(dashboard|orders|conversations|live-chat|analytics|automations)/.test(pathname)) return null;

  return (
    <>
      {/* Spacer */}
      <div className="h-20 md:hidden" aria-hidden />
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {items.slice(0, 2).map(i => (
            <NavItem key={i.to} {...i} />
          ))}

          {/* Floating cart */}
          <div className="relative flex items-center justify-center">
            <NavLink
              to="/shop"
              className="absolute -top-5 w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center glow text-white"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </NavLink>
          </div>

          {items.slice(2).map(i => (
            <NavItem key={i.to} {...i} badge={i.to === "/wishlist" ? wishCount : 0} />
          ))}
        </div>
      </nav>
    </>
  );
};

const NavItem = ({ to, icon: Icon, label, badge = 0 }: { to: string; icon: typeof Home; label: string; badge?: number }) => (
  <NavLink
    to={to}
    end={to === "/"}
    className={({ isActive }) =>
      `relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors min-h-[44px] ${
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`
    }
  >
    <span className="relative">
      <Icon className="h-5 w-5" />
      {badge > 0 && (
        <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </span>
    {label}
  </NavLink>
);
