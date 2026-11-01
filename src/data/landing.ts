import heroEiffel from '@/images/hero-paris-eiffel.png';
import heroSeine from '@/images/image.png';
import { tourHref } from '@/lib/slug';

/** Unsplash photo by id, resized for the web. */
const u = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

/** Booking site: every tour and contact link goes here until those pages exist. */
export const BOOKING = 'https://www.paristopsightstours.com/';

/** 1280px Wikimedia Commons thumbnail from its "a/ab/File.jpg" path. */
const commons = (rel: string) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${rel}/1280px-${rel.split('/').pop()}`;

const images = {
  heroParisEiffel: heroEiffel,
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80',
  lafayette: 'https://images.pexels.com/photos/37392050/pexels-photo-37392050.jpeg?auto=compress&cs=tinysrgb&w=1600',
  montmartre: commons('c/c5/Le_sacre_coeur.jpg'),
  louvre: commons('6/66/Louvre_Museum_Wikimedia_Commons.jpg'),
  versailles: commons('9/95/Vue_a%C3%A9rienne_du_domaine_de_Versailles_par_ToucanWings_-_Creative_Commons_By_Sa_3.0_-_081_%28cropped%29.jpg'),
};

/** Attribution required by the CC BY-SA licences of the Wikimedia photos. */
export const photoCredits = [
  { subject: 'Sacré-Cœur', author: 'Tonchino', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', source: 'https://commons.wikimedia.org/wiki/File:Le_sacre_coeur.jpg' },
  { subject: 'Louvre', author: 'Benh LIEU SONG', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', source: 'https://commons.wikimedia.org/wiki/File:Louvre_Museum_Wikimedia_Commons.jpg' },
  { subject: 'Versailles', author: 'ToucanWings', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', source: 'https://commons.wikimedia.org/wiki/File:Vue_a%C3%A9rienne_du_domaine_de_Versailles_par_ToucanWings_-_Creative_Commons_By_Sa_3.0_-_081_(cropped).jpg' },
];

export const landingImages = {
  hero: u('1550340499-a6c60fc8287c', 2000), // Paris rooftops and the Eiffel Tower
  heroSeine, // your Seine sunset photo, kept for reuse
  destParis: u('1431274172761-fca41d930114', 700), // Eiffel Tower, blue sky
  destSouth: 'https://images.pexels.com/photos/105950/pexels-photo-105950.jpeg?auto=compress&cs=tinysrgb&w=900', // Villefranche-sur-Mer
  destLafayette: images.lafayette, // Galeries Lafayette dome
  walking: u('1503917988258-f87a78e3c995'), // Seine bridges with the Eiffel Tower
  food: u('1555507036-ab1f4038808a'), // croissants
  attractions: images.louvre,
  privateTours: u('1522093007474-d86e9bf7ba6f'), // Paris street, Eiffel Tower at the end
  themed: images.montmartre,
  shopping: images.lafayette,
  eiffelSeine: images.paris,
  dinner: u('1414235077428-338989a2e8c0'),
  notreDame: u('1478391679764-b2d8b3cd1e94'),
  seineEvening: u('1500313830540-7b6650a74fd0'),
  versailles: images.versailles,
  cobbles: u('1549144511-f099e773c147'),
  review1: u('1431274172761-fca41d930114', 1200),
  review2: u('1511739001486-6bfe10ce785f', 1200),
  review3: u('1550340499-a6c60fc8287c', 1200),
};

export type NavItem = { label: string; to: string } | { label: string; children: { label: string; to: string }[] };

export const landingNav: NavItem[] = [
  {
    label: 'Destinations',
    children: [
      { label: 'Paris', to: '/destinations/paris' },
      { label: 'South of France', to: '/destinations/south-of-france' },
      { label: 'Galeries Lafayette', to: '/destinations/galeries-lafayette' },
    ],
  },
  { label: 'Our Tours', to: '/tours' },
  { label: 'About Us', to: '/#why' },
  { label: 'Contact', to: BOOKING },
];

export const destinationCards = [
  { title: 'Paris', text: 'Timeless landmarks and extraordinary experiences.', cta: 'Explore Paris', to: '/destinations/paris', image: landingImages.destParis, alt: 'The Eiffel Tower under a blue sky' },
  { title: 'South of France', text: 'Sun-drenched escapes, charming villages and Mediterranean beauty.', cta: 'Explore the South', to: '/destinations/south-of-france', image: landingImages.destSouth, alt: 'Villefranche-sur-Mer on the Riviera' },
  { title: 'Galeries Lafayette', text: 'A unique shopping experience in the heart of Paris.', cta: 'Explore Experiences', to: '/destinations/galeries-lafayette', image: landingImages.destLafayette, alt: 'The glass dome of Galeries Lafayette' },
];

export const categories = [
  { label: 'Walking Tours', slug: 'walking-tours', image: landingImages.walking, to: '/tours/walking-tours' },
  { label: 'Food & Wine Tours', slug: 'food-wine-tours', image: landingImages.food, to: '/tours/food-wine-tours' },
  { label: 'Attractions & Tickets', slug: 'attractions-tickets', image: landingImages.attractions, to: '/tours/attractions-tickets' },
  { label: 'Private Tours', slug: 'private-tours', image: landingImages.privateTours, to: '/tours/private-tours' },
  { label: 'Themed Tours', slug: 'themed-tours', image: landingImages.themed, to: '/tours/themed-tours' },
  { label: 'Shopping & Luxury', slug: 'shopping-luxury', image: landingImages.shopping, to: '/tours/shopping-luxury' },
];

export type LandingTour = {
  title: [string, string];
  image: string;
  rating: string;
  reviews: string;
  duration: string;
  price: string;
  to: string;
  text?: string;
  badge?: string;
};

export const featured: LandingTour[] = [
  {
    title: ['Eiffel Tower Summit &', 'Seine River Cruise'], image: landingImages.eiffelSeine, rating: '4.9', reviews: '1,842', duration: '3.5 hours', price: '€89',
    text: 'Skip the lines and experience Paris from iconic heights and the beautiful Seine.', badge: 'Bestseller', to: tourHref('attractions-tickets', 'Eiffel Tower Summit & Seine River Cruise'),
  },
  {
    title: ['Paris Food Tour', 'in Le Marais'], image: landingImages.dinner, rating: '4.9', reviews: '892', duration: '3 hours', price: '€109',
    text: 'Taste your way through one of Paris’s most charming neighbourhoods.', to: tourHref('food-wine-tours', 'Paris Food Tour in Le Marais'),
  },
  {
    title: ['Louvre Museum', 'Highlights Tour'], image: landingImages.attractions, rating: '4.8', reviews: '756', duration: '3 hours', price: '€79',
    text: 'Discover masterpieces with an expert guide. Skip-the-line access included.', to: tourHref('attractions-tickets', 'Louvre Museum Highlights Tour'),
  },
  {
    title: ['Montmartre Walking Tour', '& Sacré-Cœur'], image: landingImages.themed, rating: '4.9', reviews: '621', duration: '2.5 hours', price: '€59',
    text: 'Explore bohemian streets, artists’ squares and breathtaking views.', to: tourHref('themed-tours', 'Montmartre Artists & Sacré-Cœur Tour'),
  },
];

export const allTours: LandingTour[] = [
  { title: ['Notre-Dame Cathedral', 'Guided Tour'], image: landingImages.notreDame, rating: '4.8', reviews: '412', duration: '2 hours', price: '€65', to: tourHref('walking-tours', 'Notre-Dame Cathedral Guided Tour') },
  { title: ['Seine River Evening', 'Dinner Cruise'], image: landingImages.seineEvening, rating: '4.9', reviews: '508', duration: '2.5 hours', price: '€125', to: tourHref('food-wine-tours', 'Seine River Evening Dinner Cruise') },
  { title: ['Palace of Versailles', 'Day Trip from Paris'], image: landingImages.versailles, rating: '4.8', reviews: '930', duration: '7 hours', price: '€139', to: tourHref('attractions-tickets', 'Palace of Versailles Day Trip') },
  { title: ['Paris by Bike', 'Small Group Tour'], image: landingImages.cobbles, rating: '4.9', reviews: '321', duration: '3 hours', price: '€69', to: tourHref('themed-tours', 'Paris by Bike Small Group Tour') },
];

export const reasons = [
  { icon: 'gem', title: 'Expert Local Guides', text: ['Passionate Parisians who', 'bring the city to life.'] },
  { icon: 'users', title: 'Small Groups', text: ['A more personal', 'and authentic experience.'] },
  { icon: 'star', title: 'Premium Access', text: ['Skip the lines and enjoy', 'exclusive access.'] },
  { icon: 'heart', title: 'Unforgettable Memories', text: ['Carefully curated experiences', 'you’ll treasure forever.'] },
] as const;

// Placeholder reviews: replace with real guest reviews before going live.
export const reviews = [
  {
    quote: 'Our guide made Paris come alive! The perfect blend of history, culture and local stories. This was the highlight of our trip.',
    name: 'Emily R.', place: 'New York, USA', image: landingImages.review1,
  },
  {
    quote: 'Skipping the queues at the Louvre was worth every euro, and our guide knew a story for every painting we stopped at.',
    name: 'James T.', place: 'London, UK', image: landingImages.review2,
  },
  {
    quote: 'Small group, warm guide and the best crêpes in Montmartre. We felt like locals for an afternoon.',
    name: 'Sofia M.', place: 'Madrid, Spain', image: landingImages.review3,
  },
];

export const faqs = [
  { q: 'Do I need to book my Paris tour in advance?', a: 'We recommend booking at least a few days ahead, especially from April to October, as small-group tours fill up quickly.' },
  { q: 'Do you offer private tours in Paris?', a: 'Yes. Most of our tours can be booked as a private experience, and we can also build a custom itinerary around your interests.' },
  { q: 'Are your tours suitable for children?', a: 'Many of our tours are family-friendly. Each tour page lists age suitability, and children often qualify for a reduced price.' },
  { q: 'What should I wear or bring on the tour?', a: 'Comfortable walking shoes, a bottle of water and weather-appropriate clothing. For churches, shoulders and knees should be covered.' },
  { q: 'What is your cancellation policy?', a: 'Most tours offer free cancellation up to 24 hours before the start time. The exact policy is shown on each tour page.' },
  { q: 'Where do the tours start?', a: 'Each tour has its own meeting point in central Paris. You’ll receive the exact location and a map in your booking confirmation.' },
];

export const footerCols = [
  { title: 'Destinations', links: [{ label: 'Paris', to: '/destinations/paris' }, { label: 'South of France', to: '/destinations/south-of-france' }, { label: 'Galeries Lafayette', to: '/destinations/galeries-lafayette' }] },
  { title: 'Our Tours', links: [{ label: 'All Tours', to: '/tours' }, { label: 'Private Tours', to: '/tours/private-tours' }, { label: 'Gift Vouchers', to: BOOKING }] },
  { title: 'About Us', links: [{ label: 'Our Story', to: BOOKING }, { label: 'Why Travel With Us', to: '/#why' }, { label: 'Reviews', to: '/#reviews' }] },
  { title: 'Help', links: [{ label: 'Contact Us', to: BOOKING }, { label: 'FAQs', to: '/#faq' }, { label: 'Booking Information', to: BOOKING }] },
];
