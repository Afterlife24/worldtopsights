import { landingImages as img } from './landing';
import { formatHours, southImages, tours, type CategorySlug, type Tour } from './tours';

/*
  Content for the tour detail pages (/tours/:category/:tour).
  Every tour gets sensible defaults from its category. To write a tour's own
  content, add an entry to `overrides` below, keyed by the tour id
  (e.g. "walking-tours-8"); any field you set replaces the default.
  Placeholder content: check every itinerary, meeting point and inclusion before going live.
*/

const card = (id: string) => `https://images.unsplash.com/photo-${id}?w=1000&q=75&auto=format&fit=crop`;

export type Stop = { title: string; text: string; minutes: number };
export type MeetingPoint = { name: string; address: string; lat: number; lon: number; note?: string };
export type Faq = { q: string; a: string };

export type TourDetail = {
  kind: string; // "Guided walking tour"
  groupLabel: string; // "Small group (max 12)"
  gallery: string[]; // first image is the large one
  overview: string;
  highlights: string[];
  itinerary: Stop[];
  included: string[];
  notIncluded: string[];
  meeting: MeetingPoint;
  info: string[];
  cancellation: string;
  faqs: Faq[];
};

/* ---------- category defaults ---------- */

type CategoryDefaults = Pick<TourDetail, 'kind' | 'highlights' | 'included' | 'notIncluded' | 'info'> & { pool: string[]; meeting: MeetingPoint };

const concorde: MeetingPoint = { name: 'Place de la Concorde (Obelisk)', address: 'Place de la Concorde, 75008 Paris', lat: 48.8656, lon: 2.3212 };

const defaults: Record<CategorySlug, CategoryDefaults> = {
  'walking-tours': {
    kind: 'Guided walking tour',
    highlights: ['See the city’s landmarks up close', 'Stories and history from an expert local guide', 'Discover hidden corners and local favourites', 'Small group for a more personal experience', 'Perfect for first-time visitors'],
    included: ['Expert local guide', 'Guided walking tour', 'Historical insights and local stories', 'Small group experience'],
    notIncluded: ['Hotel pick-up or drop-off', 'Food and drinks', 'Attraction entrance fees (unless stated)', 'Gratuities (optional)'],
    info: ['Wear comfortable walking shoes', 'Suitable for most fitness levels', 'Operates in all weather conditions', 'Please arrive 10 minutes early'],
    pool: [card('1471623432079-b009d30b6729'), card('1499856871958-5b9627545d1a'), img.walking, img.cobbles, card('1522093007474-d86e9bf7ba6f')],
    meeting: concorde,
  },
  'food-wine-tours': {
    kind: 'Guided food tour',
    highlights: ['Tastings at family-run shops and bistros', 'Meet the artisans behind the food', 'Learn the stories behind French classics', 'Enough food to count as a meal', 'Tips on where to eat during your stay'],
    included: ['Expert food guide', 'All tastings listed in the itinerary', 'Wine or soft drinks with tastings', 'Small group experience'],
    notIncluded: ['Hotel pick-up or drop-off', 'Extra food and drinks', 'Gratuities (optional)'],
    info: ['Tell us about allergies or diets when booking', 'Come hungry', 'Wine is served to guests aged 18+', 'Please arrive 10 minutes early'],
    pool: [img.food, img.dinner, card('1510812431401-41d2bd2722f3'), img.seineEvening],
    meeting: { name: 'Marché des Enfants Rouges', address: '39 Rue de Bretagne, 75003 Paris', lat: 48.8628, lon: 2.3618 },
  },
  'attractions-tickets': {
    kind: 'Skip-the-line entry',
    highlights: ['Skip-the-line entry', 'Expert guide or host', 'See the highlights without the stress', 'Time to explore on your own afterwards', 'Mobile tickets accepted'],
    included: ['Skip-the-line entry ticket', 'Guide or host at the meeting point', 'Headsets where needed', 'Mobile ticket'],
    notIncluded: ['Hotel pick-up or drop-off', 'Food and drinks', 'Gratuities (optional)'],
    info: ['Bring a valid photo ID', 'Security checks apply at the entrance', 'Large bags may not be allowed', 'Please arrive 15 minutes early'],
    pool: [img.eiffelSeine, card('1431274172761-fca41d930114'), img.attractions, card('1509439581779-6298f75bf6e5')],
    meeting: concorde,
  },
  'private-tours': {
    kind: 'Private guide',
    highlights: ['Just you and your group', 'Itinerary shaped around your interests', 'Go at your own pace', 'Hotel pick-up available', 'Flexible start time'],
    included: ['Private expert guide', 'Itinerary planned with you', 'Hotel pick-up in central Paris', 'Tips and recommendations for your stay'],
    notIncluded: ['Attraction entrance fees (unless stated)', 'Food and drinks', 'Gratuities (optional)'],
    info: ['Tell us your interests when booking', 'Price is per group', 'Suitable for all ages', 'Start time can be adjusted'],
    pool: [img.privateTours, card('1511739001486-6bfe10ce785f'), img.seineEvening, img.walking],
    meeting: { ...concorde, note: 'Hotel pick-up in central Paris, or meet your guide here.' },
  },
  'themed-tours': {
    kind: 'Guided themed tour',
    highlights: ['One story told across the city', 'A guide with deep knowledge of the subject', 'Visit the places linked to the people and events', 'Small group for a more personal experience', 'Great for repeat visitors'],
    included: ['Expert local guide', 'Guided themed tour', 'Historical insights and local stories', 'Small group experience'],
    notIncluded: ['Hotel pick-up or drop-off', 'Food and drinks', 'Attraction entrance fees (unless stated)', 'Gratuities (optional)'],
    info: ['Wear comfortable walking shoes', 'Suitable for most fitness levels', 'Operates in all weather conditions', 'Please arrive 10 minutes early'],
    pool: [img.themed, card('1520939817895-060bdaf4fe1b'), img.cobbles, card('1471623432079-b009d30b6729')],
    meeting: concorde,
  },
  'shopping-luxury': {
    kind: 'Guided shopping experience',
    highlights: ['Insider access to the best addresses', 'Personal advice from a style expert', 'Discover designers and boutiques', 'Exclusive offers where available', 'Tips on tax-free shopping'],
    included: ['Personal shopping guide', 'Itinerary planned around your style', 'Exclusive offers where available', 'Tax-free shopping advice'],
    notIncluded: ['Purchases', 'Hotel pick-up (unless stated)', 'Food and drinks (unless stated)', 'Gratuities (optional)'],
    info: ['Bring your passport for tax-free shopping', 'Tell us your style and budget when booking', 'Suitable for all ages', 'Please arrive 10 minutes early'],
    pool: [img.shopping, card('1509439581779-6298f75bf6e5'), img.privateTours, card('1550340499-a6c60fc8287c')],
    meeting: { name: 'Galeries Lafayette Haussmann', address: '40 Boulevard Haussmann, 75009 Paris', lat: 48.8738, lon: 2.332 },
  },
};

const niceMassena: MeetingPoint = { name: 'Place Masséna', address: 'Place Masséna, 06000 Nice', lat: 43.6975, lon: 7.2703 };
const avignon: MeetingPoint = { name: 'Avignon Tourist Office', address: '41 Cours Jean Jaurès, 84000 Avignon', lat: 43.9455, lon: 4.8055 };
const southPool = [southImages.riviera, southImages.niceBay, southImages.lavender, southImages.gordes, southImages.niceMassena, southImages.wine];

/* Meeting points chosen from the tour title, first match wins. */
const places: [RegExp, MeetingPoint][] = [
  [/nice food|cours saleya/i, { name: 'Cours Saleya Market', address: 'Cours Saleya, 06300 Nice', lat: 43.6956, lon: 7.2755 }],
  [/nice|matisse|riviera|monaco/i, niceMassena],
  [/saint-paul/i, { name: 'Saint-Paul-de-Vence Village Gate', address: 'Place du Général de Gaulle, 06570 Saint-Paul-de-Vence', lat: 43.6967, lon: 7.1222 }],
  [/provence|lavender|luberon|châteauneuf/i, avignon],
  [/cruise/i, { name: 'Port de la Bourdonnais', address: 'Port de la Bourdonnais, 75007 Paris', lat: 48.86, lon: 2.293 }],
  [/eiffel/i, { name: 'Eiffel Tower – Main Entrance', address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris', lat: 48.8584, lon: 2.2945 }],
  [/louvre|da vinci/i, { name: 'Louvre Pyramid', address: 'Rue de Rivoli, 75001 Paris', lat: 48.8611, lon: 2.3358 }],
  [/versailles/i, { name: 'Palace of Versailles – Place d’Armes', address: 'Place d’Armes, 78000 Versailles', lat: 48.8049, lon: 2.1204 }],
  [/montmartre/i, { name: 'Abbesses Metro Station', address: 'Place des Abbesses, 75018 Paris', lat: 48.8844, lon: 2.3386 }],
  [/notre-dame/i, { name: 'Notre-Dame Cathedral Forecourt', address: 'Parvis Notre-Dame, Place Jean-Paul II, 75004 Paris', lat: 48.853, lon: 2.3488 }],
  [/orsay/i, { name: 'Musée d’Orsay Entrance', address: 'Esplanade Valéry Giscard d’Estaing, 75007 Paris', lat: 48.86, lon: 2.3266 }],
  [/revolution/i, { name: 'Place de la Bastille', address: 'Place de la Bastille, 75011 Paris', lat: 48.8532, lon: 2.3692 }],
  [/arc de triomphe|golden triangle/i, { name: 'Arc de Triomphe', address: 'Place Charles de Gaulle, 75008 Paris', lat: 48.8738, lon: 2.295 }],
  [/marais/i, { name: 'Place des Vosges', address: 'Place des Vosges, 75004 Paris', lat: 48.8556, lon: 2.3655 }],
  [/latin quarter|literary/i, { name: 'Fontaine Saint-Michel', address: 'Place Saint-Michel, 75006 Paris', lat: 48.8532, lon: 2.344 }],
  [/passages/i, { name: 'Galerie Vivienne', address: '4 Rue des Petits Champs, 75002 Paris', lat: 48.8665, lon: 2.3399 }],
  [/lafayette/i, defaults['shopping-luxury'].meeting],
];

const CANCELLATION = 'Free cancellation up to 24 hours before the tour. Cancellations within 24 hours are non-refundable.';

/* ---------- tours with their own content ---------- */

const overrides: Record<string, Partial<TourDetail>> = {
  'walking-tours-8': {
    groupLabel: 'Small group (max 12)',
    gallery: [card('1511739001486-6bfe10ce785f'), card('1471623432079-b009d30b6729'), card('1522093007474-d86e9bf7ba6f'), card('1499856871958-5b9627545d1a')],
    overview: 'Join us for a captivating walking tour that takes you from the iconic Eiffel Tower to the picturesque Seine River. Along the way, discover hidden gems, hear fascinating stories about Paris’ history and culture, and enjoy stunning photo opportunities. This tour is the perfect introduction to the City of Light.',
    highlights: ['See the iconic Eiffel Tower up close', 'Stroll along the scenic Seine River', 'Discover hidden gems and local stories', 'Learn from an expert local guide', 'Perfect for first-time visitors'],
    itinerary: [
      { title: 'Eiffel Tower', text: 'Meet your guide and admire the iconic Eiffel Tower while learning about its fascinating history.', minutes: 30 },
      { title: 'Champ de Mars', text: 'Stroll through the beautiful gardens and enjoy panoramic views.', minutes: 30 },
      { title: 'Seine River Walk', text: 'Follow the river, discover charming streets and hear stories of Paris.', minutes: 60 },
      { title: 'Trocadéro Viewpoint', text: 'End the tour with breathtaking views of the Eiffel Tower and the city.', minutes: 30 },
    ],
    faqs: [
      { q: 'How long is the tour?', a: 'About 3 hours, including stops for photos.' },
      { q: 'Do we enter the Eiffel Tower?', a: 'No. This tour stays at ground level. Summit tickets can be added when you book.' },
      { q: 'Is this tour suitable for children?', a: 'Yes. Children of all ages are welcome, and the walking pace is relaxed.' },
      { q: 'What should I wear?', a: 'Comfortable walking shoes and clothes for the weather. The tour runs rain or shine.' },
    ],
  },
};

/* ---------- builder ---------- */

const rotate = <T,>(list: T[], n: number) => list.map((_, i) => list[(i + n) % list.length]);

export function tourDetail(tour: Tour): TourDetail {
  const d = defaults[tour.category];
  const index = Number(tour.id.split('-').pop()) || 0;
  const isPrivate = tour.types.includes('Private');
  const minutes = Math.round(tour.hours * 60);
  const south = tour.destination === 'south-of-france';
  const meeting = places.find(([re]) => re.test(tour.title))?.[1] ?? (south ? niceMassena : d.meeting);

  const base: TourDetail = {
    kind: d.kind,
    groupLabel: isPrivate ? 'Private (your group only)' : 'Small group (max 12)',
    gallery: [tour.image, ...rotate(south ? southPool : d.pool, index).filter((src) => src !== tour.image)].slice(0, 4),
    overview: `${tour.text} Over ${formatHours(tour.hours)}, your guide shares the stories behind every stop, answers your questions and leaves you with tips for the rest of your stay${south ? ' in the South of France' : ' in Paris'}.`,
    highlights: d.highlights,
    itinerary: [
      { title: `Meet at ${meeting.name}`, text: 'Meet your guide, get to know your group and hear an introduction to the experience.', minutes: 15 },
      { title: tour.title, text: tour.text, minutes: Math.max(minutes - 30, 30) },
      { title: 'Wrap-up and recommendations', text: 'Your guide shares favourite places to eat, shop and explore for the rest of your trip.', minutes: 15 },
    ],
    included: isPrivate && tour.category !== 'private-tours' ? ['Private guide', ...d.included.slice(1)] : d.included,
    notIncluded: d.notIncluded,
    meeting: isPrivate && !meeting.note ? { ...meeting, note: 'Hotel pick-up in central Paris can be arranged.' } : meeting,
    info: d.info,
    cancellation: CANCELLATION,
    faqs: [
      { q: 'How long is the tour?', a: `About ${formatHours(tour.hours)}.` },
      { q: 'Is this tour suitable for children?', a: tour.types.includes('Family Friendly') ? 'Yes. Children of all ages are welcome, and many families join this tour.' : 'This tour is best for adults and teenagers. Contact us if you are travelling with young children.' },
      { q: 'What should I wear?', a: 'Comfortable shoes and clothes for the weather. For churches, shoulders and knees should be covered.' },
      { q: 'Can I cancel my booking?', a: CANCELLATION },
    ],
  };
  return { ...base, ...overrides[tour.id] };
}

/** Up to 4 other tours, same category first. */
export function relatedTours(tour: Tour, count = 4) {
  const score = (t: Tour) => (t.destination === tour.destination ? 2 : 0) + (t.category === tour.category ? 1 : 0);
  const others = tours.filter((t) => t.id !== tour.id).sort((a, b) => score(b) - score(a) || b.reviews - a.reviews);
  return others.slice(0, count);
}

export const formatMinutes = (m: number) => (m < 60 ? `${m} minutes` : formatHours(m / 60));

// Placeholder reviews: replace with real guest reviews for each tour.
export const tourReviews = [
  { quote: 'An incredible experience! Our guide was knowledgeable, friendly and made the history of Paris come alive. Highly recommend!', name: 'Sarah M.', place: 'Toronto, Canada' },
  { quote: 'Perfectly paced, with great stories and the best photo spots. It was the highlight of our week in Paris.', name: 'Daniel K.', place: 'Sydney, Australia' },
  { quote: 'Small group, warm and funny guide, and plenty of tips for the rest of our stay. We would book again.', name: 'Laura B.', place: 'Dublin, Ireland' },
];
