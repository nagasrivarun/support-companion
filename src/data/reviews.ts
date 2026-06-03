// Deterministic mock review data generator.
// Produces realistic, India-localized customer reviews seeded from the product
// handle so the same product always renders the same reviews (no flicker, SSR-safe).

export interface ReviewAspects {
  quality: number;
  value: number;
  delivery: number;
}

export interface MockReview {
  id: string;
  name: string;
  rating: number;
  date: string; // ISO date
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  photos: string[];
  aspects: ReviewAspects;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: { stars: number; count: number; percentage: number }[];
  aspects: ReviewAspects;
  withPhotos: number;
  verifiedPercentage: number;
}

// Small, fast deterministic PRNG (mulberry32) seeded from a string.
function hashString(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Sneha", "Arjun", "Kavya",
  "Karthik", "Meera", "Rahul", "Divya", "Aditya", "Pooja", "Siddharth", "Neha",
  "Manish", "Ishita", "Vivek", "Ritika", "Sandeep", "Anjali", "Harsh", "Tara",
  "Nikhil", "Shreya", "Gaurav", "Aishwarya", "Deepak", "Lakshmi",
];

const LAST_INITIALS = ["S.", "K.", "R.", "M.", "P.", "N.", "G.", "V.", "B.", "T.", "C.", "D."];

const TITLES_HIGH = [
  "Absolutely worth every rupee",
  "Exceeded my expectations",
  "Premium quality, highly recommend",
  "Best purchase this year",
  "Flawless experience",
  "Exactly as described",
  "Top-notch product",
  "Delighted with this buy",
];

const TITLES_MID = [
  "Good product, minor niggles",
  "Decent value for money",
  "Mostly happy with it",
  "Does the job well",
  "Solid choice overall",
  "Pretty good, could be better",
];

const TITLES_LOW = [
  "Not what I expected",
  "Disappointed with the quality",
  "Okay but overpriced",
  "Had some issues",
];

const BODIES_HIGH = [
  "Build quality feels premium and the finish is excellent. Delivery was quick and the packaging was secure. Would definitely buy again.",
  "Using it for a few weeks now and it has held up perfectly. Looks even better in person than in the photos. Five stars from me.",
  "Genuinely impressed. The product matches the listing exactly and performs flawlessly. Great value at this price point.",
  "Fast delivery to my pincode and the item was sealed properly. Quality is top-class and works as advertised. Highly satisfied.",
  "Outstanding product. Feels durable, looks elegant, and does everything I needed. Worth the money without a doubt.",
];

const BODIES_MID = [
  "Overall a good product. Works as expected though the packaging could have been better. Delivery was on time.",
  "Happy with the purchase for the price. There are a couple of small things I'd improve but nothing dealbreaking.",
  "Does what it claims. Quality is decent, not premium, but fair for the cost. Delivery took the expected time.",
  "Reasonably good. Met most of my expectations. A few minor flaws but I'd still recommend it to friends.",
];

const BODIES_LOW = [
  "The product is okay but I expected better quality for the price. Delivery was fine though.",
  "Not fully satisfied. It works but feels a bit underwhelming compared to the description. Could be better.",
  "Average experience. The item is functional but the finish wasn't up to the mark for me.",
];

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function clampRating(n: number) {
  return Math.max(1, Math.min(5, Math.round(n)));
}

/**
 * Generate deterministic mock reviews for a product.
 * @param handle product handle (seed)
 * @param baseRating the product's average rating (skews generated ratings)
 * @param totalCount the product's total review count (informs sample size)
 * @param imagePool candidate images used as "customer photos"
 */
export function generateReviews(
  handle: string,
  baseRating: number,
  totalCount: number,
  imagePool: string[] = []
): MockReview[] {
  const rng = mulberry32(hashString(handle));
  // Display a realistic sample (8-14) regardless of the large total count.
  const sample = 8 + Math.floor(rng() * 7);
  const reviews: MockReview[] = [];

  const now = Date.now();

  for (let i = 0; i < sample; i++) {
    // Skew rating toward the product's base rating.
    const noise = (rng() - 0.5) * 2.4;
    const rating = clampRating(baseRating + noise);

    const isHigh = rating >= 4;
    const isMid = rating === 3;
    const title = isHigh ? pick(rng, TITLES_HIGH) : isMid ? pick(rng, TITLES_MID) : pick(rng, TITLES_LOW);
    const content = isHigh ? pick(rng, BODIES_HIGH) : isMid ? pick(rng, BODIES_MID) : pick(rng, BODIES_LOW);

    const verified = rng() > 0.18;
    const helpful = Math.floor(rng() * 240);

    // ~45% of reviews carry photos when a pool is available.
    const photos =
      imagePool.length > 0 && rng() > 0.55
        ? Array.from({ length: 1 + Math.floor(rng() * Math.min(3, imagePool.length)) }, (_, k) =>
            imagePool[(i + k) % imagePool.length]
          )
        : [];

    const daysAgo = Math.floor(rng() * 420) + 1;
    const date = new Date(now - daysAgo * 86400000).toISOString();

    const name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_INITIALS)}`;

    const aspects: ReviewAspects = {
      quality: clampRating(rating + (rng() - 0.5)),
      value: clampRating(rating + (rng() - 0.6)),
      delivery: clampRating(4 + (rng() - 0.5)),
    };

    reviews.push({
      id: `${handle}-r${i}`,
      name,
      rating,
      date,
      title,
      content,
      verified,
      helpful,
      photos,
      aspects,
    });
  }

  return reviews;
}

export function computeReviewStats(reviews: MockReview[], fallbackTotal: number): ReviewStats {
  const total = reviews.length;
  const average =
    total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    return {
      stars,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    };
  });

  const avgAspect = (key: keyof ReviewAspects) =>
    total > 0 ? reviews.reduce((s, r) => s + r.aspects[key], 0) / total : 0;

  return {
    average,
    total: Math.max(fallbackTotal, total),
    distribution,
    aspects: {
      quality: avgAspect("quality"),
      value: avgAspect("value"),
      delivery: avgAspect("delivery"),
    },
    withPhotos: reviews.filter((r) => r.photos.length > 0).length,
    verifiedPercentage:
      total > 0 ? (reviews.filter((r) => r.verified).length / total) * 100 : 0,
  };
}
