import siteImages from '@/content/site-images.json';

/*
  Home page text, menus and footer. Tours come from src/content/tours.json,
  categories from src/content/categories.json, photos from src/content/site-images.json.
*/

/** Main website: contact and policy links go here until those pages exist. */
export const BOOKING = 'https://www.paristopsightstours.com/';

export { siteImages };

/** Attribution required by the CC BY-SA licences of the Wikimedia photos used on category tiles. */
export const photoCredits = [
  { subject: 'Sacré-Cœur', author: 'Tonchino', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', source: 'https://commons.wikimedia.org/wiki/File:Le_sacre_coeur.jpg' },
  { subject: 'Louvre', author: 'Benh LIEU SONG', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', source: 'https://commons.wikimedia.org/wiki/File:Louvre_Museum_Wikimedia_Commons.jpg' },
];

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

const d = siteImages.destinations;
export const destinationCards = [
  { title: 'Paris', text: 'Timeless landmarks and extraordinary experiences.', cta: 'Explore Paris', to: '/destinations/paris', image: d.paris.tile, alt: 'The Eiffel Tower under a blue sky' },
  { title: 'South of France', text: 'Sun-drenched escapes, charming villages and Mediterranean beauty.', cta: 'Explore the South', to: '/destinations/south-of-france', image: d['south-of-france'].tile, alt: 'Villefranche-sur-Mer on the Riviera' },
  { title: 'Galeries Lafayette', text: 'A unique shopping experience in the heart of Paris.', cta: 'Explore Experiences', to: '/destinations/galeries-lafayette', image: d['galeries-lafayette'].tile, alt: 'The glass dome of Galeries Lafayette' },
];

export const reasons = [
  { icon: 'gem', title: 'Expert Local Guides', text: ['Passionate Parisians who', 'bring the city to life.'] },
  { icon: 'users', title: 'Small Groups', text: ['A more personal', 'and authentic experience.'] },
  { icon: 'star', title: 'Premium Access', text: ['Skip the lines and enjoy', 'exclusive access.'] },
  { icon: 'heart', title: 'Unforgettable Memories', text: ['Carefully curated experiences', 'you’ll treasure forever.'] },
] as const;

// Placeholder reviews: replace with real guest reviews before going live.
const r = siteImages.homeReviews;
export const reviews = [
  {
    quote: 'Our guide made Paris come alive! The perfect blend of history, culture and local stories. This was the highlight of our trip.',
    name: 'Emily R.', place: 'New York, USA', image: r[0],
  },
  {
    quote: 'Skipping the queues at the Louvre was worth every euro, and our guide knew a story for every painting we stopped at.',
    name: 'James T.', place: 'London, UK', image: r[1],
  },
  {
    quote: 'Small group, warm guide and the best crêpes in Montmartre. We felt like locals for an afternoon.',
    name: 'Sofia M.', place: 'Madrid, Spain', image: r[2],
  },
];

export const faqs = [
  { q: 'Do I need to book my Paris tour in advance?', a: 'We recommend booking at least a few days ahead, especially from April to October, as small-group tours fill up quickly.' },
  { q: 'Do you offer private tours in Paris?', a: 'Yes. Contact us and we can build a private tour around your interests, from photography and fashion to literature and history.' },
  { q: 'Are your tours suitable for children?', a: 'Many of our tours are family-friendly, and on several of them kids go free. Each tour page shows the child price where there is one.' },
  { q: 'What should I wear or bring on the tour?', a: 'Comfortable walking shoes, a bottle of water and weather-appropriate clothing. For churches, shoulders and knees should be covered.' },
  { q: 'What is your cancellation policy?', a: 'The cancellation terms for each tour are shown on the booking page before you pay.' },
  { q: 'Where do the tours start?', a: 'Each tour has its own meeting point in central Paris. You’ll receive the exact location in your booking confirmation.' },
];

export const footerCols = [
  { title: 'Destinations', links: [{ label: 'Paris', to: '/destinations/paris' }, { label: 'South of France', to: '/destinations/south-of-france' }, { label: 'Galeries Lafayette', to: '/destinations/galeries-lafayette' }] },
  { title: 'Our Tours', links: [{ label: 'All Tours', to: '/tours' }, { label: 'Top Tours', to: '/#top-tours' }, { label: 'Gift Vouchers', to: BOOKING }] },
  { title: 'About Us', links: [{ label: 'Our Story', to: BOOKING }, { label: 'Why Travel With Us', to: '/#why' }, { label: 'Reviews', to: '/#reviews' }] },
  { title: 'Help', links: [{ label: 'Contact Us', to: BOOKING }, { label: 'FAQs', to: '/#faq' }, { label: 'Booking Information', to: BOOKING }] },
];
