import { Link } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingBag, Trash2, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

export default function Wishlist() {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <ShopHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to view your wishlist</h1>
            <p className="text-muted-foreground mb-6">
              Create an account or sign in to save products for later.
            </p>
            <Link to="/auth">
              <Button size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ShopHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
          {items.length > 0 && (
            <span className="text-muted-foreground">({items.length} items)</span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding products you love to save them for later.
            </p>
            <Link to="/shop">
              <Button>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden group">
                <Link to={`/product/${item.product_handle}`}>
                  <div className="aspect-square bg-muted overflow-hidden">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/product/${item.product_handle}`}>
                    <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                      {item.product_title}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold text-primary mt-2">
                    {item.currency_code} {Number(item.product_price).toFixed(2)}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Link to={`/product/${item.product_handle}`} className="flex-1">
                      <Button variant="default" className="w-full" size="sm">
                        View Product
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => removeFromWishlist(item.product_id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
