/** "Eiffel Tower & Seine River Walking Tour" -> "eiffel-tower-seine-river-walking-tour" */
export const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** URL of a tour detail page. */
export const tourHref = (category: string, title: string) => `/tours/${category}/${slugify(title)}`;
