import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, Heart, User, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/shop", icon: Search, label: "Shop" },
  { to: "/wishlist", icon: Heart, label: "Wishlist" },
  { to: "/account", icon: User, label: "Account" },
];

export const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const count = useCartStore(s => s.getTotalItems());

  // Hide on admin/dashboard routes
  if (/^\/(dashboard|orders|conversations|live-chat|analytics|automations)/.test(pathname)) return null;

  return (
    <>
      {/* Spacer */}
      <div className="h-16 md:hidden" aria-hidden />
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border">
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
            <NavItem key={i.to} {...i} />
          ))}
        </div>
      </nav>
    </>
  );
};

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) => (
  <NavLink
    to={to}
    end={to === "/"}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`
    }
  >
    <Icon className="h-5 w-5" />
    {label}
  </NavLink>
);
