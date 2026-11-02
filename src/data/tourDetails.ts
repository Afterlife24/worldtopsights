import { byPopularity, tourBySlug, tours, type Tour } from './tours';

/** Up to 4 related tours: the ones listed in the tour's "relatedTours", then similar tours if fewer are listed. */
export function relatedTours(tour: Tour, count = 4) {
  const listed = tour.relatedTours.map((slug) => tourBySlug(slug)).filter((t): t is Tour => !!t && t.slug !== tour.slug);
  if (listed.length >= count) return listed.slice(0, count);
  const extra = tours
    .filter((t) => t.slug !== tour.slug && t.destination === tour.destination && !listed.includes(t))
    .sort(byPopularity);
  return [...listed, ...extra].slice(0, count);
}

// Placeholder reviews: replace with real guest reviews for each tour.
export const tourReviews = [
  { quote: 'An incredible experience! Our guide was knowledgeable, friendly and made the history of Paris come alive. Highly recommend!', name: 'Sarah M.', place: 'Toronto, Canada' },
  { quote: 'Perfectly paced, with great stories and the best photo spots. It was the highlight of our week in Paris.', name: 'Daniel K.', place: 'Sydney, Australia' },
  { quote: 'Small group, warm and funny guide, and plenty of tips for the rest of our stay. We would book again.', name: 'Laura B.', place: 'Dublin, Ireland' },
];
