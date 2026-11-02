/** "Eiffel Tower & Seine River Walking Tour" -> "eiffel-tower-seine-river-walking-tour" */
export const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** URL of a tour detail page, same as on the old WordPress site: /tour/<slug> */
export const tourHref = (slug: string) => `/tour/${slug}`;
