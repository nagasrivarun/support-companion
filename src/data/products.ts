import type { ShopifyProduct } from "@/lib/shopify";

// Import local product images
import tshirtImg from "@/assets/products/tshirt.jpg";
import jeansImg from "@/assets/products/jeans.jpg";
import hoodieImg from "@/assets/products/hoodie.jpg";
import sneakersImg from "@/assets/products/sneakers.jpg";
import runningImg from "@/assets/products/running-sneakers.jpg";
import canvasImg from "@/assets/products/canvas-sneakers.jpg";
import loafersImg from "@/assets/products/loafers.jpg";
import sunglassesImg from "@/assets/products/sunglasses.jpg";
import aviatorImg from "@/assets/products/aviator-sunglasses.jpg";
import watchImg from "@/assets/products/watch.jpg";
import analogImg from "@/assets/products/analog-watch.jpg";
import beltImg from "@/assets/products/leather-belt.jpg";
import backpackImg from "@/assets/products/backpack.jpg";
import crossbodyImg from "@/assets/products/crossbody-bag.jpg";
import cargoImg from "@/assets/products/cargo-shorts.jpg";
import earbudsImg from "@/assets/products/bluetooth-earbuds.jpg";
import speakerImg from "@/assets/products/bluetooth-speaker.jpg";
import trackerImg from "@/assets/products/fitness-tracker.jpg";
import powerbankImg from "@/assets/products/power-bank.jpg";
import smartphoneImg from "@/assets/products/smartphone.jpg";
import wiredEarphonesImg from "@/assets/products/wired-earphones.jpg";
import tabletImg from "@/assets/products/tablet.jpg";
import walletImg from "@/assets/products/wallet.jpg";
import headphonesImg from "@/assets/products/headphones.jpg";
import smartwatchImg from "@/assets/products/smartwatch.jpg";
import chargingCableImg from "@/assets/products/charging-cable.jpg";
import laptopSleeveImg from "@/assets/products/laptop-sleeve.jpg";
import capImg from "@/assets/products/cap.jpg";
import poloShirtImg from "@/assets/products/polo-shirt.jpg";
import phoneCaseImg from "@/assets/products/phone-case.jpg";
import trackPantsImg from "@/assets/products/track-pants.jpg";

export interface LocalProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType: string;
  vendor: string;
  tags: string[];
  price: number;
  originalPrice?: number;
  currencyCode: string;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  amazonUrl: string;
  inStock: boolean;
  sizes?: string[];
  colors?: string[];
  features?: string[];
}

// Helper to generate Amazon search URL
const amazonSearchUrl = (query: string) =>
  `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=yourtag-21`;

// Helper to generate Amazon product URL (affiliate)
const amazonProductUrl = (query: string) =>
  `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=yourtag-21`;

export const LOCAL_PRODUCTS: LocalProduct[] = [
  {
    id: "1",
    title: "Basic Cotton T-Shirt",
    description: "Premium quality 100% cotton t-shirt. Comfortable fit, breathable fabric perfect for everyday wear. Available in multiple colors.",
    handle: "basic-cotton-tshirt",
    productType: "T-Shirts",
    vendor: "StyleCraft",
    tags: ["cotton", "casual", "men", "women", "bestseller"],
    price: 499,
    originalPrice: 999,
    currencyCode: "INR",
    image: tshirtImg,
    images: [tshirtImg],
    rating: 4.3,
    reviewCount: 2847,
    amazonUrl: amazonProductUrl("basic cotton t-shirt men"),
    inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Black", "Navy", "Grey"],
    features: ["100% Cotton", "Pre-shrunk", "Machine washable", "Comfortable fit"],
  },
  {
    id: "2",
    title: "Slim Fit Denim Jeans",
    description: "Classic slim fit denim jeans with stretch comfort. Perfect for casual and semi-formal occasions.",
    handle: "slim-fit-denim-jeans",
    productType: "Jeans",
    vendor: "DenimCo",
    tags: ["denim", "slim-fit", "men", "casual"],
    price: 1299,
    originalPrice: 2499,
    currencyCode: "INR",
    image: jeansImg,
    images: [jeansImg],
    rating: 4.1,
    reviewCount: 1523,
    amazonUrl: amazonProductUrl("slim fit denim jeans men"),
    inStock: true,
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Blue", "Dark Blue", "Black"],
    features: ["Stretch denim", "Slim fit", "5-pocket style", "Zip fly"],
  },
  {
    id: "3",
    title: "Pullover Hoodie",
    description: "Warm fleece-lined pullover hoodie with kangaroo pocket. Great for layering in cool weather.",
    handle: "pullover-hoodie",
    productType: "Hoodies",
    vendor: "StyleCraft",
    tags: ["hoodie", "winter", "unisex", "casual"],
    price: 899,
    originalPrice: 1799,
    currencyCode: "INR",
    image: hoodieImg,
    images: [hoodieImg],
    rating: 4.4,
    reviewCount: 987,
    amazonUrl: amazonProductUrl("pullover hoodie unisex"),
    inStock: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Grey", "Navy", "Olive"],
    features: ["Fleece-lined", "Kangaroo pocket", "Drawstring hood", "Ribbed cuffs"],
  },
  {
    id: "4",
    title: "Classic Sneakers",
    description: "Versatile classic sneakers with cushioned insole. Perfect for daily wear with any outfit.",
    handle: "classic-sneakers",
    productType: "Footwear",
    vendor: "StepUp",
    tags: ["sneakers", "shoes", "casual", "unisex"],
    price: 1499,
    originalPrice: 2999,
    currencyCode: "INR",
    image: sneakersImg,
    images: [sneakersImg],
    rating: 4.2,
    reviewCount: 3210,
    amazonUrl: amazonProductUrl("classic white sneakers"),
    inStock: true,
    sizes: ["6", "7", "8", "9", "10", "11"],
    colors: ["White", "Black", "Grey"],
    features: ["Cushioned insole", "Lace-up", "Rubber sole", "Breathable"],
  },
  {
    id: "5",
    title: "Running Sneakers",
    description: "Lightweight running sneakers with mesh upper for maximum breathability and comfort.",
    handle: "running-sneakers",
    productType: "Footwear",
    vendor: "StepUp",
    tags: ["running", "sports", "shoes", "men"],
    price: 1999,
    originalPrice: 3499,
    currencyCode: "INR",
    image: runningImg,
    images: [runningImg],
    rating: 4.5,
    reviewCount: 1876,
    amazonUrl: amazonProductUrl("running shoes men"),
    inStock: true,
    sizes: ["7", "8", "9", "10", "11"],
    features: ["Mesh upper", "Lightweight", "EVA midsole", "Non-slip"],
  },
  {
    id: "6",
    title: "Canvas Sneakers",
    description: "Casual canvas sneakers with a timeless design. Comfortable and stylish for everyday use.",
    handle: "canvas-sneakers",
    productType: "Footwear",
    vendor: "StepUp",
    tags: ["canvas", "sneakers", "casual", "unisex"],
    price: 799,
    originalPrice: 1499,
    currencyCode: "INR",
    image: canvasImg,
    images: [canvasImg],
    rating: 4.0,
    reviewCount: 2134,
    amazonUrl: amazonProductUrl("canvas sneakers casual"),
    inStock: true,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["White", "Black", "Navy", "Red"],
    features: ["Canvas upper", "Rubber sole", "Lace-up", "Lightweight"],
  },
  {
    id: "7",
    title: "Classic Loafers",
    description: "Elegant leather loafers for a polished look. Perfect for office and casual occasions.",
    handle: "classic-loafers",
    productType: "Footwear",
    vendor: "StepUp",
    tags: ["loafers", "formal", "leather", "men"],
    price: 2499,
    originalPrice: 4999,
    currencyCode: "INR",
    image: loafersImg,
    images: [loafersImg],
    rating: 4.3,
    reviewCount: 654,
    amazonUrl: amazonProductUrl("leather loafers men"),
    inStock: true,
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["Brown", "Black", "Tan"],
    features: ["Genuine leather", "Slip-on", "Cushioned footbed", "Durable sole"],
  },
  {
    id: "8",
    title: "Polarized Sunglasses",
    description: "UV400 polarized sunglasses with lightweight frame. Protects your eyes in style.",
    handle: "polarized-sunglasses",
    productType: "Accessories",
    vendor: "VisionPro",
    tags: ["sunglasses", "polarized", "unisex", "summer"],
    price: 599,
    originalPrice: 1299,
    currencyCode: "INR",
    image: sunglassesImg,
    images: [sunglassesImg],
    rating: 4.1,
    reviewCount: 4521,
    amazonUrl: amazonProductUrl("polarized sunglasses uv400"),
    inStock: true,
    colors: ["Black", "Brown", "Blue"],
    features: ["UV400 protection", "Polarized lenses", "Lightweight", "Scratch-resistant"],
  },
  {
    id: "9",
    title: "Aviator Sunglasses",
    description: "Classic aviator sunglasses with metal frame. Timeless design with premium build quality.",
    handle: "aviator-sunglasses",
    productType: "Accessories",
    vendor: "VisionPro",
    tags: ["aviator", "sunglasses", "classic", "unisex"],
    price: 899,
    originalPrice: 1999,
    currencyCode: "INR",
    image: aviatorImg,
    images: [aviatorImg],
    rating: 4.4,
    reviewCount: 1987,
    amazonUrl: amazonProductUrl("aviator sunglasses metal frame"),
    inStock: true,
    colors: ["Gold/Green", "Silver/Blue", "Black/Grey"],
    features: ["Metal frame", "UV protection", "Spring hinges", "Includes case"],
  },
  {
    id: "10",
    title: "Digital Sports Watch",
    description: "Multi-functional digital watch with stopwatch, alarm, and backlight. Water-resistant for active lifestyles.",
    handle: "digital-sports-watch",
    productType: "Accessories",
    vendor: "TimeTech",
    tags: ["watch", "digital", "sports", "men"],
    price: 1299,
    originalPrice: 2999,
    currencyCode: "INR",
    image: watchImg,
    images: [watchImg],
    rating: 4.2,
    reviewCount: 3456,
    amazonUrl: amazonProductUrl("digital sports watch men"),
    inStock: true,
    features: ["Water-resistant", "Stopwatch", "Alarm", "LED backlight", "Date display"],
  },
  {
    id: "11",
    title: "Analog Dress Watch",
    description: "Elegant analog watch with leather strap. Minimalist design perfect for formal and casual wear.",
    handle: "analog-dress-watch",
    productType: "Accessories",
    vendor: "TimeTech",
    tags: ["watch", "analog", "formal", "men"],
    price: 1999,
    originalPrice: 3999,
    currencyCode: "INR",
    image: analogImg,
    images: [analogImg],
    rating: 4.5,
    reviewCount: 876,
    amazonUrl: amazonProductUrl("analog dress watch leather"),
    inStock: true,
    features: ["Leather strap", "Mineral glass", "Japanese movement", "Water-resistant"],
  },
  {
    id: "12",
    title: "Genuine Leather Belt",
    description: "Premium genuine leather belt with classic buckle. Durable and stylish for any outfit.",
    handle: "genuine-leather-belt",
    productType: "Accessories",
    vendor: "LeatherCraft",
    tags: ["belt", "leather", "men", "formal"],
    price: 699,
    originalPrice: 1499,
    currencyCode: "INR",
    image: beltImg,
    images: [beltImg],
    rating: 4.3,
    reviewCount: 2341,
    amazonUrl: amazonProductUrl("genuine leather belt men"),
    inStock: true,
    sizes: ["28-32", "32-36", "36-40"],
    colors: ["Brown", "Black", "Tan"],
    features: ["Genuine leather", "Classic buckle", "Adjustable", "Durable"],
  },
  {
    id: "13",
    title: "Travel Backpack",
    description: "Spacious travel backpack with laptop compartment. Multiple pockets for organized storage.",
    handle: "travel-backpack",
    productType: "Bags",
    vendor: "PackMate",
    tags: ["backpack", "travel", "laptop", "unisex"],
    price: 1499,
    originalPrice: 2999,
    currencyCode: "INR",
    image: backpackImg,
    images: [backpackImg],
    rating: 4.4,
    reviewCount: 5678,
    amazonUrl: amazonProductUrl("travel backpack laptop compartment"),
    inStock: true,
    colors: ["Black", "Grey", "Navy"],
    features: ["Laptop compartment", "Water-resistant", "Padded straps", "Multiple pockets"],
  },
  {
    id: "14",
    title: "Crossbody Sling Bag",
    description: "Compact crossbody sling bag for daily essentials. Lightweight and comfortable to carry.",
    handle: "crossbody-sling-bag",
    productType: "Bags",
    vendor: "PackMate",
    tags: ["sling-bag", "crossbody", "casual", "unisex"],
    price: 599,
    originalPrice: 1199,
    currencyCode: "INR",
    image: crossbodyImg,
    images: [crossbodyImg],
    rating: 4.1,
    reviewCount: 1234,
    amazonUrl: amazonProductUrl("crossbody sling bag"),
    inStock: true,
    colors: ["Black", "Brown", "Grey"],
    features: ["Adjustable strap", "Multiple compartments", "Lightweight", "Zip closure"],
  },
  {
    id: "15",
    title: "Cargo Shorts",
    description: "Comfortable cargo shorts with multiple pockets. Perfect for summer and outdoor activities.",
    handle: "cargo-shorts",
    productType: "Shorts",
    vendor: "StyleCraft",
    tags: ["shorts", "cargo", "summer", "men"],
    price: 799,
    originalPrice: 1499,
    currencyCode: "INR",
    image: cargoImg,
    images: [cargoImg],
    rating: 4.0,
    reviewCount: 987,
    amazonUrl: amazonProductUrl("cargo shorts men"),
    inStock: true,
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Khaki", "Olive", "Grey", "Navy"],
    features: ["Multiple pockets", "Cotton blend", "Comfortable fit", "Durable"],
  },
  {
    id: "16",
    title: "Wireless Bluetooth Earbuds",
    description: "True wireless earbuds with noise cancellation and 24h battery life. Crystal clear audio quality.",
    handle: "bluetooth-earbuds",
    productType: "Electronics",
    vendor: "SoundTech",
    tags: ["earbuds", "bluetooth", "wireless", "electronics"],
    price: 1299,
    originalPrice: 2999,
    currencyCode: "INR",
    image: earbudsImg,
    images: [earbudsImg],
    rating: 4.3,
    reviewCount: 8976,
    amazonUrl: amazonProductUrl("wireless bluetooth earbuds noise cancellation"),
    inStock: true,
    features: ["Noise cancellation", "24h battery", "IPX5 waterproof", "Touch controls"],
  },
  {
    id: "17",
    title: "Portable Bluetooth Speaker",
    description: "Compact bluetooth speaker with powerful bass. Perfect for outdoor parties and travel.",
    handle: "bluetooth-speaker",
    productType: "Electronics",
    vendor: "SoundTech",
    tags: ["speaker", "bluetooth", "portable", "electronics"],
    price: 1799,
    originalPrice: 3499,
    currencyCode: "INR",
    image: speakerImg,
    images: [speakerImg],
    rating: 4.2,
    reviewCount: 3456,
    amazonUrl: amazonProductUrl("portable bluetooth speaker bass"),
    inStock: true,
    colors: ["Black", "Blue", "Red"],
    features: ["360° sound", "12h battery", "IPX7 waterproof", "Built-in mic"],
  },
  {
    id: "18",
    title: "Fitness Tracker Band",
    description: "Smart fitness tracker with heart rate monitor, sleep tracking, and step counter.",
    handle: "fitness-tracker",
    productType: "Electronics",
    vendor: "FitGear",
    tags: ["fitness", "tracker", "smartwatch", "health"],
    price: 1499,
    originalPrice: 2999,
    currencyCode: "INR",
    image: trackerImg,
    images: [trackerImg],
    rating: 4.1,
    reviewCount: 6543,
    amazonUrl: amazonProductUrl("fitness tracker heart rate monitor"),
    inStock: true,
    features: ["Heart rate monitor", "Sleep tracking", "Step counter", "7-day battery", "Water-resistant"],
  },
  {
    id: "19",
    title: "Power Bank 20000mAh",
    description: "High-capacity power bank with fast charging. Charge multiple devices simultaneously.",
    handle: "power-bank",
    productType: "Electronics",
    vendor: "ChargeTech",
    tags: ["power-bank", "charger", "portable", "electronics"],
    price: 999,
    originalPrice: 1999,
    currencyCode: "INR",
    image: powerbankImg,
    images: [powerbankImg],
    rating: 4.4,
    reviewCount: 12345,
    amazonUrl: amazonProductUrl("power bank 20000mah fast charging"),
    inStock: true,
    features: ["20000mAh", "Fast charging", "Dual USB output", "LED indicator", "Compact"],
  },
];

// Helper functions
export function getProductByHandle(handle: string): LocalProduct | undefined {
  return LOCAL_PRODUCTS.find(p => p.handle === handle);
}

export function getProductsByCategory(category: string): LocalProduct[] {
  return LOCAL_PRODUCTS.filter(p => p.productType === category);
}

export function getCategories(): string[] {
  return [...new Set(LOCAL_PRODUCTS.map(p => p.productType))].sort();
}

export function getVendorsList(): string[] {
  return [...new Set(LOCAL_PRODUCTS.map(p => p.vendor))].sort();
}

export function searchLocalProducts(query: string): LocalProduct[] {
  const q = query.toLowerCase();
  return LOCAL_PRODUCTS.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q)) ||
    p.productType.toLowerCase().includes(q)
  );
}

// Convert LocalProduct to ShopifyProduct format for backward compatibility
export function toShopifyProduct(p: LocalProduct): ShopifyProduct {
  return {
    node: {
      id: p.id,
      title: p.title,
      description: p.description,
      handle: p.handle,
      productType: p.productType,
      vendor: p.vendor,
      tags: p.tags,
      priceRange: {
        minVariantPrice: { amount: p.price.toString(), currencyCode: p.currencyCode },
        maxVariantPrice: { amount: (p.originalPrice || p.price).toString(), currencyCode: p.currencyCode },
      },
      images: {
        edges: p.images.map(img => ({ node: { url: img, altText: p.title } })),
      },
      variants: {
        edges: [{
          node: {
            id: `variant-${p.id}`,
            title: "Default",
            price: { amount: p.price.toString(), currencyCode: p.currencyCode },
            availableForSale: p.inStock,
            selectedOptions: [],
          },
        }],
      },
      options: [],
    },
  };
}
