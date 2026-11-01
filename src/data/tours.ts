import { landingImages as img } from './landing';
import { slugify, tourHref } from '@/lib/slug';

/** Unsplash photo by id at hero size. */
const wide = (id: string) => `https://images.unsplash.com/photo-${id}?w=1800&q=75&auto=format&fit=crop`;
const card = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=75&auto=format&fit=crop`;

const extra = {
  seineBridge: card('1499856871958-5b9627545d1a'), // Pont Alexandre III at dusk
  wine: card('1510812431401-41d2bd2722f3'), // wine toast
  rooftops: card('1550340499-a6c60fc8287c'), // rooftops and the Eiffel Tower
  arc: card('1509439581779-6298f75bf6e5'), // Arc de Triomphe
  arcAerial: card('1520939817895-060bdaf4fe1b'), // aerial view of the Étoile
  eiffelBlue: card('1431274172761-fca41d930114'),
  eiffelTall: card('1511739001486-6bfe10ce785f'),
  montmartreStreet: card('1471623432079-b009d30b6729'),
};

const pexels = (id: number, w = 800) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
/** South of France photos (Unsplash and Pexels, free to use). */
export const southImages = {
  lavender: card('1499002238440-d264edd596ec'), // lavender field at sunset, Provence
  niceMassena: card('1491166617655-0723a0999cfc'), // Place Masséna, Nice
  niceBay: pexels(36403738), // Promenade des Anglais, Nice
  wine: card('1506377247377-2a5b3b417ebb'), // red wine above a vineyard
  vineyard: card('1560493676-04071c5f467b'), // rows of vines
  gordes: pexels(30037090), // Gordes, Luberon
  gordesHill: pexels(33706628), // Gordes on its hill
  riviera: pexels(105950), // Villefranche-sur-Mer
};
const s = southImages;

export type DestinationSlug = 'paris' | 'south-of-france' | 'galeries-lafayette';

export type CategorySlug = 'walking-tours' | 'food-wine-tours' | 'attractions-tickets' | 'private-tours' | 'themed-tours' | 'shopping-luxury';

export type Category = {
  slug: CategorySlug;
  label: string; // "Walking Tours"
  noun: string; // "walking tours" — used in search placeholder and counts
  title: string; // page heading
  lede: string;
  script: [string, string];
  hero: string;
  heroAlt: string;
  tile: string; // small image for "other categories"
};

export const categoryList: Category[] = [
  {
    slug: 'walking-tours', label: 'Walking Tours', noun: 'walking tours', title: 'Walking Tours',
    lede: 'Explore iconic landmarks, charming neighbourhoods and hidden gems on foot, with expert local guides who bring every street to life.',
    script: ['Explore', 'Paris on foot'], hero: wide('1471623432079-b009d30b6729'), heroAlt: 'A Paris street at dusk', tile: img.walking,
  },
  {
    slug: 'food-wine-tours', label: 'Food & Wine Tours', noun: 'food & wine tours', title: 'Food & Wine Tours',
    lede: 'Buttery croissants, fine cheeses, Provence rosé and bistro classics, with guides who know where the locals eat.',
    script: ['Bon', 'appétit'], hero: wide('1414235077428-338989a2e8c0'), heroAlt: 'A table set with French dishes and wine', tile: img.food,
  },
  {
    slug: 'attractions-tickets', label: 'Attractions & Tickets', noun: 'attractions & tickets', title: 'Attractions & Tickets',
    lede: 'Skip the queues at the Louvre, the Eiffel Tower, Versailles and Monaco. Timed tickets and guided visits to the sights everyone comes to France for.',
    script: ['Skip', 'the line'], hero: wide('1502602898657-3e91760cbb34'), heroAlt: 'The Eiffel Tower over the Seine', tile: img.attractions,
  },
  {
    slug: 'private-tours', label: 'Private Tours', noun: 'private tours', title: 'Private Tours',
    lede: 'Your guide, your pace. Private tours shaped around your interests, from first-timer highlights to hidden corners and day trips.',
    script: ['Just', 'for you'], hero: wide('1522093007474-d86e9bf7ba6f'), heroAlt: 'A Paris street leading to the Eiffel Tower', tile: img.privateTours,
  },
  {
    slug: 'themed-tours', label: 'Themed Tours', noun: 'themed tours', title: 'Themed Tours',
    lede: 'Art, history, nature and legends. Themed tours that follow one story, from Montmartre’s painters to the lavender of Provence.',
    script: ['Every street', 'tells a story'], hero: wide('1499856871958-5b9627545d1a'), heroAlt: 'Pont Alexandre III at dusk', tile: img.themed,
  },
  {
    slug: 'shopping-luxury', label: 'Shopping & Luxury', noun: 'shopping & luxury tours', title: 'Shopping & Luxury',
    lede: 'Galeries Lafayette, the Golden Triangle and the boutiques of Le Marais. Personal shoppers, VIP access and the finest addresses in France.',
    script: ['Très', 'chic'], hero: wide('1503917988258-f87a78e3c995'), heroAlt: 'Paris rooftops and the Seine', tile: img.shopping,
  },
];

export const categoryBySlug = (slug?: string) => categoryList.find((c) => c.slug === slug);

export const experienceTypes = ['Small Group', 'Private', 'Family Friendly', 'Couples', 'Luxury'] as const;
export type ExperienceType = (typeof experienceTypes)[number];

export type Tour = {
  id: string;
  slug: string; // URL part, from the title
  category: CategorySlug;
  destination: DestinationSlug;
  title: string;
  text: string;
  image: string;
  hours: number;
  price: number;
  rating: number;
  reviews: number;
  types: ExperienceType[];
  featured?: boolean;
};

type Row = [title: string, text: string, image: string, hours: number, price: number, rating: number, reviews: number, types: ExperienceType[], featured?: boolean, destination?: DestinationSlug];
const SF = 'south-of-france' as const;
const GL = 'galeries-lafayette' as const;

// Placeholder tours: replace prices, ratings and review counts with your real listings.
const rows: Record<CategorySlug, Row[]> = {
  'walking-tours': [
    ['Paris Highlights Walking Tour', 'See Notre-Dame, the Latin Quarter and the Louvre on one classic route.', extra.rooftops, 3, 49, 4.8, 512, ['Small Group', 'Family Friendly'], true],
    ['Montmartre Walking Tour & Local Life', 'Artists’ squares, vineyards and village lanes beneath Sacré-Cœur.', img.themed, 2.5, 39, 4.7, 388, ['Small Group', 'Couples'], true],
    ['Hidden Paris: Secret Passages Walking Tour', 'Covered arcades, quiet courtyards and stories most visitors miss.', extra.montmartreStreet, 3, 45, 4.6, 214, ['Small Group'], true],
    ['Notre-Dame Cathedral Guided Tour', 'The history, architecture and fascinating stories of this iconic landmark.', img.notreDame, 2, 65, 4.8, 412, ['Small Group', 'Family Friendly']],
    ['Paris Latin Quarter Walking Tour', 'Historic streets, lively squares and the city’s literary landmarks.', img.walking, 3, 39, 4.7, 276, ['Small Group']],
    ['Seine River Walking Tour', 'Stroll along the river and discover Paris’s most beautiful views and bridges.', extra.seineBridge, 2.5, 35, 4.6, 198, ['Couples', 'Family Friendly']],
    ['Le Marais Walking Tour', 'Trendy streets, historic mansions and a vibrant local atmosphere.', img.privateTours, 3, 42, 4.7, 241, ['Small Group']],
    ['Eiffel Tower & Seine River Walking Tour', 'The Eiffel Tower, the Seine and the best photo spots, with an expert local guide.', extra.eiffelTall, 3, 49, 4.8, 320, ['Small Group', 'Family Friendly']],
    ['Nice Old Town & Castle Hill Walking Tour', 'Baroque churches, the Cours Saleya and the view from Castle Hill.', s.niceMassena, 2.5, 39, 4.8, 286, ['Small Group', 'Family Friendly'], true, SF],
    ['Saint-Paul-de-Vence Village Walk', 'Ramparts, galleries and cobbled lanes in the Riviera’s most famous hill village.', s.gordesHill, 2, 35, 4.7, 164, ['Small Group', 'Couples'], false, SF],
  ],
  'food-wine-tours': [
    ['Paris Food Tour in Le Marais', 'Taste your way through one of Paris’s most charming neighbourhoods.', img.dinner, 3, 109, 4.9, 892, ['Small Group'], true],
    ['Grand Wine & Cheese Tasting', 'Five French wines paired with artisan cheeses, led by a sommelier.', extra.wine, 2.5, 79, 4.9, 389, ['Small Group', 'Couples'], true],
    ['Croissant & Pastry Morning Walk', 'Meet the bakers and taste the best croissants and pâtisserie in town.', img.food, 2, 59, 4.8, 302, ['Family Friendly'], true],
    ['Seine River Evening Dinner Cruise', 'A three-course dinner gliding past the illuminated monuments.', img.seineEvening, 2.5, 125, 4.9, 508, ['Couples', 'Luxury']],
    ['Montmartre Food & Wine Walk', 'Cheese, charcuterie and wine in the hilltop village of Montmartre.', img.themed, 3, 95, 4.8, 264, ['Small Group']],
    ['French Cooking Class & Market Visit', 'Shop at a local market, then cook a classic French lunch with a chef.', img.dinner, 4, 149, 4.9, 187, ['Small Group', 'Family Friendly']],
    ['Champagne & Macarons Tasting', 'Fine champagnes and macarons from the city’s top pâtissiers.', extra.wine, 1.5, 89, 4.7, 156, ['Couples', 'Luxury']],
    ['Nice Food Tour & Cours Saleya Market', 'Socca, pissaladière and local olive oil in the old town and its market.', s.niceBay, 3, 85, 4.9, 342, ['Small Group'], true, SF],
    ['Provence Rosé Wine Tasting', 'Visit two family estates and taste the rosés Provence is famous for.', s.wine, 4, 95, 4.8, 211, ['Small Group', 'Couples'], true, SF],
    ['Châteauneuf-du-Pape Wine Tour', 'Cellars, vineyards and tastings in the Rhône’s most famous appellation.', s.vineyard, 6, 145, 4.8, 129, ['Small Group', 'Luxury'], false, SF],
    ['Galeries Lafayette Gourmet Food Hall Tasting', 'Cheese, chocolate and pastries in the store’s gourmet food hall.', img.food, 1.5, 59, 4.7, 98, ['Small Group', 'Family Friendly'], false, GL],
  ],
  'attractions-tickets': [
    ['Eiffel Tower Summit & Seine River Cruise', 'Skip the lines and see Paris from iconic heights and the Seine.', img.eiffelSeine, 3.5, 89, 4.9, 1842, ['Small Group', 'Family Friendly'], true],
    ['Louvre Museum Highlights Tour', 'Masterpieces with an expert guide. Skip-the-line access included.', img.attractions, 3, 79, 4.8, 756, ['Small Group'], true],
    ['Palace of Versailles Day Trip', 'The Hall of Mirrors, royal apartments and gardens from Paris.', img.versailles, 7, 139, 4.8, 930, ['Small Group', 'Family Friendly'], true],
    ['Arc de Triomphe Rooftop Tickets', 'Climb to the terrace for a view down all twelve avenues.', extra.arc, 1.5, 25, 4.6, 344, ['Family Friendly']],
    ['Musée d’Orsay Impressionists Tour', 'Monet, Renoir and Van Gogh in a former railway station.', extra.rooftops, 2.5, 69, 4.8, 298, ['Small Group']],
    ['Eiffel Tower Second Floor Tickets', 'Timed entry with a host to help you skip the ticket queue.', extra.eiffelBlue, 2, 45, 4.7, 621, ['Family Friendly', 'Couples']],
    ['Seine Sightseeing Cruise Ticket', 'A one-hour cruise past Notre-Dame, the Louvre and the Eiffel Tower.', extra.seineBridge, 1, 19, 4.6, 812, ['Family Friendly']],
    ['Monaco, Monte-Carlo & Èze Day Trip', 'The Prince’s Palace, the Casino square and the medieval village of Èze.', s.riviera, 8, 99, 4.8, 467, ['Small Group'], true, SF],
  ],
  'private-tours': [
    ['Private Paris Highlights Tour', 'A custom route through the landmarks you most want to see.', img.privateTours, 4, 290, 4.9, 214, ['Private', 'Family Friendly'], true],
    ['Private Louvre Tour with an Art Historian', 'Skip the line and see the collection at your own pace.', img.attractions, 3, 340, 4.9, 167, ['Private', 'Luxury'], true],
    ['Private Versailles Day Trip by Car', 'Hotel pickup, skip-the-line entry and time in the gardens.', img.versailles, 8, 590, 4.9, 132, ['Private', 'Luxury'], true],
    ['Private Montmartre Photo Walk', 'A guide and photographer capture you in Paris’s prettiest village.', img.themed, 2, 220, 4.8, 98, ['Private', 'Couples']],
    ['Private Evening Paris by Car', 'See the city’s lights from a chauffeured vintage car.', img.seineEvening, 2, 260, 4.9, 121, ['Private', 'Couples', 'Luxury']],
    ['Private Family Tour of Paris', 'Games, treasure hunts and stories that keep children curious.', img.cobbles, 3, 240, 4.8, 87, ['Private', 'Family Friendly']],
    ['Private French Riviera Tour by Car', 'Nice, Villefranche, Èze and Monaco with a private driver-guide.', s.riviera, 8, 690, 4.9, 88, ['Private', 'Luxury'], false, SF],
    ['Private Provence Lavender & Villages Tour', 'Lavender fields, Gordes and Roussillon at your own pace.', s.lavender, 8, 620, 4.9, 61, ['Private', 'Couples'], false, SF],
    ['Private VIP Shopping at Galeries Lafayette', 'A private salon, a personal stylist and champagne while you shop.', img.shopping, 3, 290, 4.9, 47, ['Private', 'Luxury'], false, GL],
  ],
  'themed-tours': [
    ['Montmartre Artists & Sacré-Cœur Tour', 'Follow Picasso, Van Gogh and Toulouse-Lautrec through Montmartre.', img.themed, 2.5, 59, 4.9, 621, ['Small Group'], true],
    ['Da Vinci Code & Louvre Mysteries', 'Secrets, symbols and legends of the Louvre and its masterpieces.', img.attractions, 3, 69, 4.7, 243, ['Small Group'], true],
    ['Kings & Queens of Versailles', 'Scandal, power and fashion at the court of Louis XIV.', img.versailles, 6, 129, 4.8, 199, ['Small Group', 'Family Friendly'], true],
    ['Literary Paris: Hemingway’s Left Bank', 'Cafés and bookshops of the Lost Generation.', img.walking, 2.5, 45, 4.7, 154, ['Small Group', 'Couples']],
    ['Paris by Bike Small Group Tour', 'Ride past the great monuments with a guide and a story at every stop.', img.cobbles, 3, 69, 4.9, 321, ['Small Group', 'Family Friendly']],
    ['Revolution & Napoleon History Tour', 'From the Bastille to the Arc de Triomphe: the story of modern France.', extra.arcAerial, 3, 49, 4.6, 112, ['Small Group']],
    ['Matisse & Chagall Art Tour in Nice', 'The painters who fell for the Riviera light, in the museums of Cimiez.', s.niceMassena, 3, 55, 4.7, 103, ['Small Group'], false, SF],
    ['Provence Lavender Fields Tour', 'The Valensole plateau in bloom, with a lavender distillery visit (June to August).', s.lavender, 7, 89, 4.9, 538, ['Small Group', 'Couples'], true, SF],
    ['Luberon Hilltop Villages: Gordes & Roussillon', 'Stone villages, ochre cliffs and the abbey of Sénanque.', s.gordes, 7, 95, 4.8, 219, ['Small Group', 'Family Friendly'], false, SF],
  ],
  'shopping-luxury': [
    ['Galeries Lafayette Personal Shopper', 'A stylist who knows every floor, brand and hidden corner.', img.shopping, 2, 120, 4.9, 176, ['Private', 'Luxury'], true, GL],
    ['Golden Triangle Luxury Shopping Tour', 'Avenue Montaigne and the Champs-Élysées with a fashion insider.', extra.arc, 3, 190, 4.8, 94, ['Luxury', 'Small Group'], true],
    ['Le Marais Boutiques & Concept Stores', 'Independent designers, vintage finds and concept stores.', img.privateTours, 2.5, 65, 4.7, 128, ['Small Group'], true],
    ['Perfume Workshop: Create Your Own Scent', 'Blend a personal perfume with a master perfumer.', extra.rooftops, 2, 149, 4.9, 211, ['Couples', 'Luxury']],
    ['Galeries Lafayette Dome & Rooftop', 'The story of the art nouveau dome and the rooftop view.', img.shopping, 1.5, 35, 4.8, 302, ['Family Friendly'], false, GL],
    ['VIP Champagne & Shopping Day', 'Private car, personal shopper and a champagne lunch.', extra.eiffelTall, 6, 450, 4.9, 54, ['Private', 'Luxury']],
    ['Galeries Lafayette Fashion Show & Champagne', 'A seasonal runway show, then a glass of champagne on the terrace.', extra.wine, 1.5, 49, 4.7, 142, ['Couples', 'Luxury'], false, GL],
  ],
};

export const tours: Tour[] = (Object.keys(rows) as CategorySlug[]).flatMap((category) =>
  rows[category].map(([title, text, image, hours, price, rating, reviews, types, featured, destination = 'paris'], i) => ({
    id: `${category}-${i + 1}`, slug: slugify(title), category, destination, title, text, image, hours, price, rating, reviews, types, featured,
  })),
);

export const tourPath = (t: Tour) => tourHref(t.category, t.title);
export const tourBySlug = (category?: string, slug?: string) => tours.find((t) => t.category === category && t.slug === slug);

/** Paris includes Galeries Lafayette, which is in Paris. */
export const inDestination = (t: Tour, d?: DestinationSlug) => !d || t.destination === d || (d === 'paris' && t.destination === 'galeries-lafayette');

export const toursIn = (slug?: CategorySlug) => (slug ? tours.filter((t) => t.category === slug) : tours);

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
