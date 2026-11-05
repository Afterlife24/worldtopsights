import tourData from '@/content/tours.json';
import categoryData from '@/content/categories.json';
import { tourHref } from '@/lib/slug';

/*
  All tours live in src/content/tours.json and all categories in
  src/content/categories.json. Edit those files, not this one.
  See HOW-TO-UPDATE.md.
*/

export type DestinationSlug = 'paris' | 'south-of-france' | 'galeries-lafayette';
const destinationSlugs: DestinationSlug[] = ['paris', 'south-of-france', 'galeries-lafayette'];

export type Category = {
  slug: string; // "paris-walking-tours"
  label: string; // "Paris Walking Tours"
  title: string; // page heading
  lede: string;
  script: [string, string];
  hero: string;
  heroAlt: string;
  tile: string; // small image used on category tiles
};

export type Tour = {
  slug: string; // web address: /tour/<slug>
  title: string;
  destination: DestinationSlug; // main destination (used in the breadcrumb)
  alsoIn?: DestinationSlug[]; // also listed on these destination pages
  demo: boolean; // sample tour, not a real listing yet
  categories: string[]; // category slugs from categories.json
  topTour: boolean; // shown under "Top Tours"
  price: number; // adult price in €
  priceNote: string | null; // e.g. "159 per person for groups of 8."
  childPrice: number | 'Free' | null;
  youthPrice?: number | null; // youth / teenager price in €
  duration: number | null; // hours; null = not shown
  startTimes?: string | null; // e.g. "09:30, 10:00, 11:00"
  rating: number | null; // null = stars hidden
  reviews: number | null;
  bookingUrl: string; // Rezdy booking page
  summary: string;
  highlights: string[];
  description: string; // simple HTML: <p>, <h3>, <h4>, <ul>, <li>, <strong>, <em>, <a>
  images: string[]; // first one is the main photo
  relatedTours: string[]; // slugs of other tours
};

/** The main photo of a tour. */
export const mainImage = (t: Tour) => t.images[0] ?? '';

/* ---------- checks: a clear message instead of a broken page when the JSON has a mistake ---------- */

function checkContent(tourList: Tour[], cats: Category[]) {
  const problems: string[] = [];
  const catSlugs = new Set(cats.map((c) => c.slug));
  const seen = new Set<string>();
  const slugs = new Set(tourList.map((t) => t.slug));
  tourList.forEach((t, i) => {
    const name = `tours.json, tour ${i + 1} ("${t.title ?? t.slug ?? '?'}")`;
    if (!t.slug || !/^[a-z0-9-]+$/.test(t.slug)) problems.push(`${name}: "slug" must use only a-z, 0-9 and "-"`);
    if (seen.has(t.slug)) problems.push(`${name}: another tour already uses the slug "${t.slug}"`);
    seen.add(t.slug);
    if (!t.title) problems.push(`${name}: "title" is empty`);
    if (!destinationSlugs.includes(t.destination)) problems.push(`${name}: "destination" must be one of ${destinationSlugs.join(', ')}`);
    (t.alsoIn ?? []).forEach((d) => !destinationSlugs.includes(d) && problems.push(`${name}: "alsoIn" has unknown destination "${d}"`));
    if (typeof t.price !== 'number') problems.push(`${name}: "price" must be a number, like 50`);
    if (t.duration !== null && typeof t.duration !== 'number') problems.push(`${name}: "duration" must be a number of hours, or null`);
    if (t.rating !== null && typeof t.rating !== 'number') problems.push(`${name}: "rating" must be a number like 4.8, or null`);
    if (!Array.isArray(t.images) || t.images.length === 0) problems.push(`${name}: "images" needs at least one photo`);
    (t.categories ?? []).forEach((c) => !catSlugs.has(c) && problems.push(`${name}: unknown category "${c}" (see categories.json)`));
    (t.relatedTours ?? []).forEach((r) => !slugs.has(r) && problems.push(`${name}: related tour "${r}" does not exist`));
  });
  if (problems.length) {
    const message = `Problems in src/content:\n- ${problems.join('\n- ')}`;
    if (import.meta.env.DEV) throw new Error(message);
    console.error(message);
  }
}

// JSON files are checked by checkContent below rather than by TypeScript.
export const categoryList = categoryData as unknown as Category[];
export const tours = tourData as unknown as Tour[];
checkContent(tours, categoryList);

export const categoryBySlug = (slug?: string) => categoryList.find((c) => c.slug === slug);
export const tourBySlug = (slug?: string) => tours.find((t) => t.slug === slug);
export const tourPath = (t: Tour) => tourHref(t.slug);

export const inDestination = (t: Tour, d?: DestinationSlug) => !d || t.destination === d || !!t.alsoIn?.includes(d);
export const toursIn = (category?: string) => (category ? tours.filter((t) => t.categories.includes(category)) : tours);

/**
/**
 * Categories that have at least one tour (in the destination, if given).
 */
export const usedCategories = (dest?: DestinationSlug) =>
  categoryList.filter((c) => tours.some((t) => t.categories.includes(c.slug) && inDestination(t, dest)));

/** Top tours first, then the most reviewed. */
const reviewCount = (t: Tour) => t.reviews ?? 0;
export const byPopularity = (a: Tour, b: Tour) => Number(b.topTour) - Number(a.topTour) || reviewCount(b) - reviewCount(a);
export const topTours = () => tours.filter((t) => t.topTour).sort((a, b) => reviewCount(b) - reviewCount(a));

/** True when the tour has a rating to show. */
export const hasRating = (t: Tour): t is Tour & { rating: number } => typeof t.rating === 'number';
export const euro = (n: number) => `€${Number.isInteger(n) ? n : n.toFixed(2)}`;

export const formatHours = (h: number) => `${h} hour${h === 1 ? '' : 's'}`;

/* ---------- filters ---------- */

export const durationFilters = [
  { id: 'd1', label: 'Up to 2 hours', test: (h: number) => h <= 2 },
  { id: 'd2', label: '2 - 4 hours', test: (h: number) => h > 2 && h <= 4 },
  { id: 'd3', label: '4 - 6 hours', test: (h: number) => h > 4 && h <= 6 },
  { id: 'd4', label: 'Full day', test: (h: number) => h > 6 },
];

export const priceFilters = [
  { id: 'p1', label: 'Under €50', test: (p: number) => p < 50 },
  { id: 'p2', label: '€50 - €100', test: (p: number) => p >= 50 && p <= 100 },
  { id: 'p3', label: '€100 - €200', test: (p: number) => p > 100 && p <= 200 },
  { id: 'p4', label: 'Over €200', test: (p: number) => p > 200 },
];

export const sortOptions = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Top rated' },
  { id: 'duration', label: 'Shortest first' },
] as const;
export type SortId = (typeof sortOptions)[number]['id'];
