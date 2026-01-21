import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingCart, 
  Check, 
  ArrowLeft, 
  ImageOff,
  Minus,
  Plus,
  Truck,
  Shield,
  CreditCard
} from "lucide-react";
import { ShopifyProduct, fetchProductByHandle, formatPrice } from "@/lib/shopify";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { toast } from "sonner";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ProductReviews } from "@/components/product/ProductReviews";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      
      setIsLoading(true);
      try {
        const fetchedProduct = await fetchProductByHandle(handle);
        setProduct(fetchedProduct);
        if (fetchedProduct?.variants.edges[0]) {
          setSelectedVariant(fetchedProduct.variants.edges[0].node.id);
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [handle]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const variant = product.variants.edges.find(v => v.node.id === selectedVariant)?.node;
    if (!variant) return;

    const cartItem: CartItem = {
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions || [],
    };

    addItem(cartItem);
    setIsAdding(true);
    
    toast.success(`${product.title} added to cart`, {
      position: "top-center",
    });

    setTimeout(() => setIsAdding(false), 1500);
  };

  const currentVariant = product?.variants.edges.find(v => v.node.id === selectedVariant)?.node;
  const isAvailable = currentVariant?.availableForSale ?? true;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ShopHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <ShopHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Link to="/shop">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images.edges;

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link 
          to="/shop" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              {images[selectedImage]?.node ? (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <ImageOff className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img.node.url}
                      alt={img.node.altText || `${product.title} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.title}</h1>
              {!isAvailable && (
                <Badge variant="secondary" className="mb-2">Out of Stock</Badge>
              )}
              <p className="text-2xl font-bold text-primary">
                {currentVariant && formatPrice(currentVariant.price.amount, currentVariant.price.currencyCode)}
              </p>
            </div>

            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            {/* Variant Selection */}
            {product.options.length > 0 && product.options[0].name !== 'Title' && (
              <div className="space-y-4">
                {product.options.map((option) => (
                  <div key={option.name}>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {option.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const variant = product.variants.edges.find(v => 
                          v.node.selectedOptions.some(o => o.name === option.name && o.value === value)
                        );
                        const isSelected = variant?.node.id === selectedVariant;
                        
                        return (
                          <Button
                            key={value}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => variant && setSelectedVariant(variant.node.id)}
                            disabled={!variant?.node.availableForSale}
                          >
                            {value}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Quantity</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleAddToCart}
              disabled={!isAvailable || isAdding}
            >
              {isAdding ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>

            {/* Features */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>Secure checkout with Shopify Payments & PayPal</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="h-5 w-5 text-primary" />
                <span>Worldwide shipping to 8+ countries</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="h-5 w-5 text-primary" />
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-foreground mb-8">Customer Reviews</h2>
          <ProductReviews productHandle={handle || ""} productTitle={product.title} />
        </div>
      </div>

      <ChatWidget />
    </div>
  );
};

export default ProductDetail;
