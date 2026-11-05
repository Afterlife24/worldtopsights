import siteImages from '@/content/site-images.json';
import type { DestinationSlug } from './tours';

/*
  One record per destination. Photos come from src/content/site-images.json.
  To add a destination: add its slug to DestinationSlug in tours.ts, add a
  record here and in site-images.json, and set "destination" on its tours.
  Draft copy: review the text, tips and FAQs before going live.
*/

const img = siteImages.destinations;

export type Destination = {
  slug: DestinationSlug;
  name: string;
  parent?: DestinationSlug; // Galeries Lafayette sits inside Paris
  eyebrow: string;
  title: string;
  lede: string;
  script: [string, string];
  hero: string;
  heroAlt: string;
  tile: string; // card image used in "Other destinations"
  about: { title: string; paragraphs: string[] };
  facts: { label: string; value: string }[];
  faqs: { q: string; a: string }[];
};

export const destinationList: Destination[] = [
  {
    slug: 'paris',
    name: 'Paris',
    eyebrow: 'Timeless landmarks. Extraordinary experiences.',
    title: 'Paris Tours & Experiences',
    lede: 'The Eiffel Tower, the Louvre, Montmartre and the Seine. Walking tours, food and wine, skip-the-line tickets and private guides across the City of Light.',
    script: ['Toujours', 'Paris'],
    hero: img.paris.hero,
    heroAlt: 'Paris rooftops and the Eiffel Tower',
    tile: img.paris.tile,
    about: {
      title: 'Why discover Paris with us',
      paragraphs: [
        'Paris rewards curiosity. Behind every famous landmark there is a quieter square, a family bakery or a story most visitors never hear. Our local guides show you both.',
        'Choose a classic first-timer walk, skip the queues at the Louvre and the Eiffel Tower, eat your way through Le Marais or plan a private day around your interests.',
      ],
    },
    facts: [
      { label: 'Best time to visit', value: 'April to June and September to October, for mild weather and fewer crowds.' },
      { label: 'Getting around', value: 'Most tours start next to a metro station. A Navigo Easy card covers metro, bus and RER.' },
      { label: 'Where we go', value: 'Eiffel Tower, Louvre, Notre-Dame, Montmartre, Le Marais, Latin Quarter and Versailles.' },
      { label: 'Tour languages', value: 'English and French. Other languages on request for private tours.' },
    ],
    faqs: [
      { q: 'Do I need to book Paris tours in advance?', a: 'Yes, especially from April to October. Small-group tours and skip-the-line tickets often sell out a few days ahead.' },
      { q: 'Which tour is best for a first visit?', a: 'A walking tour of the classic sights is the best introduction to the city. Contact us if you would like a recommendation.' },
      { q: 'Are the tours suitable for children?', a: 'Many are. Each tour page shows the child price where there is one.' },
      { q: 'Can I book a private guide?', a: 'Yes. Contact us and we can plan a private tour around your interests.' },
    ],
  },
  {
    slug: 'south-of-france',
    name: 'South of France',
    eyebrow: 'Sun-drenched escapes. Mediterranean beauty.',
    title: 'South of France Tours',
    lede: 'Nice, Cannes, Antibes, Monaco, Èze and Grasse. Walking tours, food and wine, perfume, yoga, island escapes and day trips along the French Riviera.',
    script: ['Bienvenue', 'dans le Sud'],
    hero: img['south-of-france'].hero,
    heroAlt: 'The French Riviera coast',
    tile: img['south-of-france'].tile,
    about: {
      title: 'Why discover the South of France with us',
      paragraphs: [
        'From the turquoise bays of the Côte d’Azur to its hilltop villages and perfume workshops, the French Riviera is made for slow travel. Our guides live here and know where to stop.',
        'Explore Nice’s old town, spend a day in Monaco and Èze, create your own perfume in Grasse, taste local wine, or escape to the Lérins Islands off Cannes.',
      ],
    },
    facts: [
      { label: 'Best time to visit', value: 'April to October for beaches and islands. Walking, food and village tours run all year.' },
      { label: 'Getting there', value: 'Fly to Nice Côte d’Azur, or take the TGV from Paris to Nice or Cannes.' },
      { label: 'Where we go', value: 'Nice, Cannes, Antibes, Monaco, Èze, Grasse, Saint-Paul-de-Vence, the Lérins Islands, Saint-Tropez and the Italian Riviera.' },
      { label: 'Tour languages', value: 'English and French. Other languages on request for private tours.' },
    ],
    faqs: [
      { q: 'Where do South of France tours start?', a: 'Most tours start in Nice, Cannes, Antibes or Monaco. Your booking confirmation shows the exact meeting point.' },
      { q: 'Why do some tours show a price for a group?', a: 'Some private and small-group tours are priced by group size. The more people in your group, the lower the price per person. The booking page shows the exact price for your group.' },
      { q: 'Can I visit several Riviera towns in one day?', a: 'Yes. Our day trips combine 3 to 5 towns, such as Nice, Èze, Monaco, Cannes and Saint-Paul-de-Vence.' },
    ],
  },
  {
    slug: 'galeries-lafayette',
    name: 'Galeries Lafayette',
    parent: 'paris',
    eyebrow: 'A unique shopping experience in the heart of Paris.',
    title: 'Galeries Lafayette Experiences',
    lede: 'Fashion shows, perfume workshops, chocolate, macarons, wine and Christmas lights at Paris’s most famous department store.',
    script: ['Très', 'chic'],
    hero: img['galeries-lafayette'].hero,
    heroAlt: 'The glass dome of Galeries Lafayette',
    tile: img['galeries-lafayette'].tile,
    about: {
      title: 'Why discover Galeries Lafayette with us',
      paragraphs: [
        'Galeries Lafayette Haussmann has dressed Paris since 1893. Under its famous glass dome are more than 3,500 brands, a gourmet food hall and one of the best free views of the city.',
        'Watch a fashion show, create your own perfume, join a macaron class, taste wine and cheese, or see the famous Christmas tree under the dome.',
      ],
    },
    facts: [
      { label: 'Address', value: '40 Boulevard Haussmann, 75009 Paris. Metro: Chaussée d’Antin – La Fayette.' },
      { label: 'Opening hours', value: 'Usually 10:00 to 20:30, Monday to Saturday, and 11:00 to 20:00 on Sunday.' },
      { label: 'Tax-free shopping', value: 'Visitors from outside the EU can claim VAT back on purchases over €100. Bring your passport.' },
      { label: 'Tour languages', value: 'English and French. Other languages on request.' },
    ],
    faqs: [
      { q: 'Is the rooftop free?', a: 'Yes. The rooftop terrace is free to visit and has one of the best views of Paris.' },
      { q: 'Do I have to buy anything?', a: 'No. Shopping is optional on all our Galeries Lafayette experiences.' },
      { q: 'Can I combine shopping with a Paris tour?', a: 'Yes. Galeries Lafayette is in central Paris, so it is easy to add to a day of sightseeing.' },
      { q: 'Is it busy?', a: 'Weekends and December are the busiest. Weekday mornings are the calmest time to visit.' },
    ],
  },
];

export const destinationBySlug = (slug?: string | null) => destinationList.find((d) => d.slug === slug);

export const destinationPath = (slug: DestinationSlug) => `/destinations/${slug}`;

/** Tours page filtered by destination and/or category. */
export const toursPath = (destination?: DestinationSlug, category?: string) =>
  `/tours${category ? `/${category}` : ''}${destination ? `?destination=${destination}` : ''}`;
