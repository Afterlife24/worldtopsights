import { landingImages as img } from './landing';
import { southImages, type DestinationSlug } from './tours';

/*
  One record per destination. To add a destination: add its slug to
  DestinationSlug in tours.ts, add a record here, and tag its tours.
  Draft copy: review the text, tips and FAQs before going live.
*/

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
    hero: img.hero,
    heroAlt: 'Paris rooftops and the Eiffel Tower',
    tile: img.destParis,
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
      { q: 'Which tour is best for a first visit?', a: 'The Paris Highlights Walking Tour or the Eiffel Tower Summit & Seine River Cruise give you the classic sights in one go.' },
      { q: 'Are the tours suitable for children?', a: 'Many are. Look for the Family Friendly filter on the tours page.' },
      { q: 'Can I book a private guide?', a: 'Yes. All Private Tours are just for your group, and we can plan a custom route with you.' },
    ],
  },
  {
    slug: 'south-of-france',
    name: 'South of France',
    eyebrow: 'Sun-drenched escapes. Mediterranean beauty.',
    title: 'South of France Tours',
    lede: 'Nice, Monaco, the hill villages of the Riviera and the lavender fields of Provence. Food and wine, day trips and private tours under the southern sun.',
    script: ['Bienvenue', 'dans le Sud'],
    hero: southImages.lavender,
    heroAlt: 'A lavender field in Provence at sunset',
    tile: img.destSouth,
    about: {
      title: 'Why discover the South of France with us',
      paragraphs: [
        'From the turquoise bays of the Riviera to the stone villages and vineyards of Provence, the South of France is made for slow travel. Our guides live here and know where to stop.',
        'Explore Nice’s old town and market, spend a day in Monaco and Èze, taste rosé at family estates or walk through the lavender fields in early summer.',
      ],
    },
    facts: [
      { label: 'Best time to visit', value: 'May to October. Lavender blooms from late June to early August.' },
      { label: 'Getting there', value: 'Fly to Nice Côte d’Azur, or take the TGV from Paris to Nice, Avignon or Aix-en-Provence.' },
      { label: 'Where we go', value: 'Nice, Villefranche, Èze, Monaco, Saint-Paul-de-Vence, Gordes, Roussillon and Valensole.' },
      { label: 'Tour languages', value: 'English and French. Other languages on request for private tours.' },
    ],
    faqs: [
      { q: 'Where do South of France tours start?', a: 'Riviera tours start in Nice. Provence tours start in Avignon or Aix-en-Provence. Each tour page shows the exact meeting point.' },
      { q: 'When can I see the lavender in bloom?', a: 'Usually from late June to early August. The Lavender Fields tour runs only in that season.' },
      { q: 'Can I visit Monaco and Provence on the same trip?', a: 'Yes, but they are about three hours apart. We suggest a few nights in Nice and a few in Avignon or Aix.' },
      { q: 'Do wine tours include transport?', a: 'Yes. All our wine tours include transport between estates, so nobody has to drive.' },
    ],
  },
  {
    slug: 'galeries-lafayette',
    name: 'Galeries Lafayette',
    parent: 'paris',
    eyebrow: 'A unique shopping experience in the heart of Paris.',
    title: 'Galeries Lafayette Experiences',
    lede: 'Personal shoppers, VIP salons, the art nouveau dome, the rooftop view and the gourmet food hall of Paris’s most famous department store.',
    script: ['Très', 'chic'],
    hero: img.destLafayette,
    heroAlt: 'The glass dome of Galeries Lafayette',
    tile: img.destLafayette,
    about: {
      title: 'Why discover Galeries Lafayette with us',
      paragraphs: [
        'Galeries Lafayette Haussmann has dressed Paris since 1893. Under its famous glass dome are more than 3,500 brands, a gourmet food hall and one of the best free views of the city.',
        'Shop with a personal stylist, book a private VIP salon, taste your way through the food hall or simply learn the story of the dome before heading up to the rooftop.',
      ],
    },
    facts: [
      { label: 'Address', value: '40 Boulevard Haussmann, 75009 Paris. Metro: Chaussée d’Antin – La Fayette.' },
      { label: 'Opening hours', value: 'Usually 10:00 to 20:30, Monday to Saturday, and 11:00 to 20:00 on Sunday.' },
      { label: 'Tax-free shopping', value: 'Visitors from outside the EU can claim VAT back on purchases over €100. Bring your passport.' },
      { label: 'Tour languages', value: 'English and French. Other languages on request.' },
    ],
    faqs: [
      { q: 'Is the rooftop free?', a: 'Yes. The rooftop terrace is free to visit. Our Dome & Rooftop tour adds the history and the best photo spots.' },
      { q: 'Do I have to buy anything on a personal shopping tour?', a: 'No. Your stylist helps you find pieces you love, but there is no minimum spend.' },
      { q: 'Can I combine shopping with a Paris tour?', a: 'Yes. Many guests pair it with the Golden Triangle Luxury Shopping Tour or a private Paris tour.' },
      { q: 'Is it busy?', a: 'Weekends and December are the busiest. Weekday mornings are the calmest time to visit.' },
    ],
  },
];

export const destinationBySlug = (slug?: string | null) => destinationList.find((d) => d.slug === slug);

export const destinationPath = (slug: DestinationSlug) => `/destinations/${slug}`;

/** Tours page filtered by destination and/or category. */
export const toursPath = (destination?: DestinationSlug, category?: string) =>
  `/tours${category ? `/${category}` : ''}${destination ? `?destination=${destination}` : ''}`;
