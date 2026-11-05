import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, ChevronDown, ChevronRight, Clock, Compass, Footprints, Globe, Heart, MapPin, Search, SlidersHorizontal, Star, Ticket, User, Wine, X } from 'lucide-react';
import {
  byPopularity, categoryBySlug, categoryList, durationFilters, euro, formatHours, hasRating, inDestination, mainImage, priceFilters, sortOptions, tourPath, tours, toursIn,
  usedCategories, type Category, type SortId, type Tour,
} from '@/data/tours';
import { destinationBySlug, destinationList, destinationPath, toursPath, type Destination } from '@/data/destinations';
import { BOOKING } from '@/data/landing';
import { A } from './Chrome';
import '@/tours.css';

type PageInfo = Pick<Category, 'label' | 'title' | 'lede' | 'script' | 'hero' | 'heroAlt'> & { noun: string };

/** Hero used for /tours (no category picked). */
const allCategory: PageInfo = {
  label: 'All Tours', noun: 'tours', title: 'All Tours',
  lede: 'Walking tours, food and wine, attraction tickets and themed tours in Paris, plus experiences in the South of France and Galeries Lafayette. Every experience we offer, in one place.',
  script: ['Toujours', 'Paris'], hero: categoryList[0].hero, heroAlt: categoryList[0].heroAlt,
};

/** Icon per category. Categories not listed here use the compass. */
const categoryIcons: Record<string, typeof Compass> = {
  'paris-walking-tours': Footprints, 'paris-food-tours': Wine, 'paris-attraction-tickets': Ticket,
  'private-paris-tours': User, 'paris-themed-tours': BookOpen, 'paris-tour-packages-with-attraction-tickets': Ticket, 'beyond-paris': Globe,
};

type Filters = { q: string; duration: string[]; price: string[] };
const emptyFilters: Filters = { q: '', duration: [], price: [] };

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

/** Lowercase words without accents or punctuation: "Opéra Garnier &" -> ["opera", "garnier"]. */
const words = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z0-9+]+/).filter(Boolean);

/** A tour matches when every word typed appears in its title or summary. */
function matches(t: Tour, query: string[]) {
  const text = words(`${t.title} ${t.summary}`).join(' ');
  return query.every((w) => text.includes(w));
}

function applyFilters(list: Tour[], f: Filters, sort: SortId) {
  const q = words(f.q);
  const durations = durationFilters.filter((d) => f.duration.includes(d.id));
  const prices = priceFilters.filter((p) => f.price.includes(p.id));
  const out = list.filter((t) =>
    (!q.length || matches(t, q))
    && (!durations.length || (t.duration !== null && durations.some((d) => d.test(t.duration as number))))
    && (!prices.length || prices.some((p) => p.test(t.price))));
  const by: Record<SortId, (a: Tour, b: Tour) => number> = {
    recommended: byPopularity,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0),
    duration: (a, b) => (a.duration ?? Infinity) - (b.duration ?? Infinity), // tours with no time last
  };
  return [...out].sort(by[sort]);
}

function Meta({ tour }: { tour: Tour }) {
  return (
    <p className="tp-meta">
      {tour.duration !== null && <span><Clock size={13} className="tp-ic" /> {formatHours(tour.duration)}</span>}
      {hasRating(tour) && <span><Star size={13} className="tp-ic" fill="currentColor" strokeWidth={0} /> {tour.rating.toFixed(1)}{tour.reviews ? ` (${tour.reviews.toLocaleString('en')})` : ''}</span>}
    </p>
  );
}

/* ---------------- sidebar ---------------- */

function CheckGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="tp-group">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="tp-check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function Sidebar({ category, dest, filters, setFilters, open, onClose, searchRef }: {
  category?: Category; dest?: Destination; filters: Filters; setFilters: (f: Filters) => void; open: boolean; onClose: () => void; searchRef: React.RefObject<HTMLInputElement>;
}) {
  const navigate = useNavigate();
  const noun = category ? category.label.toLowerCase() : dest ? `${dest.name} tours` : 'tours';
  // Each dropdown counts tours within the other dropdown's current choice.
  const inDest = tours.filter((t) => inDestination(t, dest?.slug));
  const inCat = toursIn(category?.slug);
  const catCount = (slug: string) => inDest.filter((t) => t.categories.includes(slug)).length;
  const destCount = (d: Destination) => inCat.filter((t) => inDestination(t, d.slug)).length;

  return (
    <aside className={`tp-side ${open ? 'is-open' : ''}`} aria-label="Refine your search">
      <div className="tp-side-head">
        <h2>Refine Your Search</h2>
        <button type="button" className="tp-clear" onClick={() => setFilters(emptyFilters)}>Clear All</button>
        <button type="button" className="tp-side-close" aria-label="Close filters" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="tp-group">
        <label className="tp-label" htmlFor="search">Search Tours</label>
        <div className="tp-search">
          <input
            ref={searchRef}
            id="search"
            type="search"
            placeholder={`Search ${noun}…`}
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
          <Search size={15} aria-hidden="true" />
        </div>
      </div>

      <div className="tp-group">
        <label className="tp-label" htmlFor="tp-dest">Destination</label>
        <div className="tp-select">
          <select id="tp-dest" value={dest?.slug ?? ''} onChange={(e) => navigate(toursPath(destinationBySlug(e.target.value)?.slug, category?.slug))}>
            <option value="">All destinations ({inCat.length})</option>
            {destinationList.map((d) => <option key={d.slug} value={d.slug}>{d.parent ? '— ' : ''}{d.name} ({destCount(d)})</option>)}
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </div>
      </div>

      <div className="tp-group">
        <label className="tp-label" htmlFor="tp-cat">Category</label>
        <div className="tp-select">
          <select id="tp-cat" value={category?.slug ?? ''} onChange={(e) => navigate(toursPath(dest?.slug, e.target.value || undefined))}>
            <option value="">All categories ({inDest.length})</option>
            {usedCategories().map((c) => <option key={c.slug} value={c.slug}>{c.label} ({catCount(c.slug)})</option>)}
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </div>
      </div>

      <CheckGroup title="Duration">
        {durationFilters.map((d) => (
          <Check key={d.id} label={d.label} checked={filters.duration.includes(d.id)} onChange={() => setFilters({ ...filters, duration: toggle(filters.duration, d.id) })} />
        ))}
      </CheckGroup>
      <CheckGroup title="Price">
        {priceFilters.map((p) => (
          <Check key={p.id} label={p.label} checked={filters.price.includes(p.id)} onChange={() => setFilters({ ...filters, price: toggle(filters.price, p.id) })} />
        ))}
      </CheckGroup>

      <button type="button" className="pl-btn tp-side-done" onClick={onClose}>Show results</button>
    </aside>
  );
}

/* ---------------- cards ---------------- */

function TopCard({ tour }: { tour: Tour }) {
  return (
    <article className="tp-fcard">
      <img src={mainImage(tour)} alt="" loading="lazy" />
      <div className="tp-fcard-body">
        <div>
          <h3><A to={tourPath(tour)}>{tour.title}</A></h3>
          <Meta tour={tour} />
        </div>
        <A to={tourPath(tour)} className="tp-go" aria-label={`View tour: ${tour.title}`}><ArrowRight size={16} /></A>
      </div>
    </article>
  );
}

export function TourCard({ tour }: { tour: Tour }) {
  return (
    <article className="tp-card">
      <div className="tp-card-img">
        <img src={mainImage(tour)} alt="" loading="lazy" />
      </div>
      <div className="tp-card-body">
        <h3><A to={tourPath(tour)}>{tour.title}</A></h3>
        <p className="tp-card-text">{tour.summary}</p>
        {tour.childPrice != null && <p className="tp-kids">{tour.childPrice === 'Free' ? 'Kids go free' : `Kids from ${euro(tour.childPrice)}`}</p>}
        <Meta tour={tour} />
        <div className="tp-card-foot">
          <p className="pl-price"><small>From</small> {euro(tour.price)}</p>
          <A to={tourPath(tour)} className="pl-btn pl-btn-sm" aria-label={`View tour: ${tour.title}`}>View Tour <ArrowRight size={13} /></A>
        </div>
      </div>
    </article>
  );
}

/* ---------------- page ---------------- */

export function TourCategory() {
  const { category: slug } = useParams();
  const { hash } = useLocation();
  const category = categoryBySlug(slug);
  const [params] = useSearchParams();
  const dest = destinationBySlug(params.get('destination'));
  const info: PageInfo = {
    ...(category ? { ...category, noun: category.label.toLowerCase() } : allCategory),
    ...(dest && !category ? { title: dest.title, lede: dest.lede, hero: dest.hero, heroAlt: dest.heroAlt, script: dest.script, noun: `${dest.name} tours` } : {}),
    ...(dest && category ? { title: `${dest.name}: ${category.label}` } : {}),
  };

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<SortId>('recommended');
  const [panelOpen, setPanelOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const list = useMemo(() => toursIn(category?.slug).filter((t) => inDestination(t, dest?.slug)), [category, dest]);
  const visible = useMemo(() => applyFilters(list, filters, sort), [list, filters, sort]);
  const top = useMemo(() => list.filter((t) => t.topTour).sort(byPopularity).slice(0, 3), [list]);
  const others = usedCategories(dest?.slug).filter((c) => c.slug !== category?.slug);
  const activeCount = filters.duration.length + filters.price.length + (filters.q.trim() ? 1 : 0);

  useEffect(() => {
    document.title = `${info.title} | Paris Top Sights Tours`;
  }, [info.title]);

  // The header search icon links to "#search": focus the box.
  useEffect(() => {
    if (hash === '#search') searchRef.current?.focus({ preventScroll: true });
  }, [hash]);

  if (slug && !category) return <Navigate to="/tours" replace />;

  const short = category ? category.label : dest ? `${dest.name} Tours` : 'Tours';
  const Icon = category ? categoryIcons[category.slug] ?? Compass : dest ? MapPin : Compass;
  const parent = destinationBySlug(dest?.parent);

  return (
    <div className="pl tp">
      <section className="tp-hero">
        <img className="tp-hero-img" src={info.hero} alt={info.heroAlt} />
        <div className="pl-wrap tp-hero-inner">
          <nav className="pl-crumbs" aria-label="Breadcrumb">
            <A to="/">Home</A><ChevronRight size={11} />
            {parent && <><A to={destinationPath(parent.slug)}>{parent.name}</A><ChevronRight size={11} /></>}
            {dest && <><A to={destinationPath(dest.slug)}>{dest.name}</A><ChevronRight size={11} /></>}
            {!dest && category && <><A to="/tours">Tours</A><ChevronRight size={11} /></>}
            <span aria-current="page">{category ? category.label : 'All Tours'}</span>
          </nav>
          <h1>{info.title}</h1>
          <p className="tp-lede">{info.lede}</p>
          <p className="tp-count">
            <Icon size={18} className="tp-ic" />
            <strong>{list.length} {short}</strong>
            {(category || dest) && <><span className="tp-sep" aria-hidden="true" /><span>Part of our <A to="/tours">{tours.length} tours</A></span></>}
          </p>
          <p className="tp-script" aria-hidden="true">{info.script[0]}<br /><span>{info.script[1]} <Heart size={20} strokeWidth={1.2} /></span></p>
        </div>
      </section>

      <div className="pl-wrap tp-layout">
        <Sidebar category={category} dest={dest} filters={filters} setFilters={setFilters} open={panelOpen} onClose={() => setPanelOpen(false)} searchRef={searchRef} />
        {panelOpen && <button type="button" className="tp-scrim" aria-label="Close filters" onClick={() => setPanelOpen(false)} />}

        <div className="tp-main">
          {top.length > 0 && (
            <section className="tp-featured" aria-labelledby="tp-top">
              <div className="tp-head">
                <div>
                  <h2 id="tp-top">Top {category || dest ? info.title : 'Tours'}</h2>
                  <p>Our most popular {info.noun}, chosen by travellers for their unforgettable experiences.</p>
                </div>
                <a href="#all" className="pl-more">View All {short} <ArrowRight size={13} /></a>
              </div>
              <div className="tp-fgrid">
                {top.map((t) => <TopCard key={t.slug} tour={t} />)}
              </div>
            </section>
          )}

          <section id="all" className="tp-all" aria-labelledby="tp-all-h">
            <div className="tp-head tp-head-all">
              <h2 id="tp-all-h">All {category || dest ? info.title : 'Tours'} ({visible.length})</h2>
              <div className="tp-tools">
                <button type="button" className="tp-filter-btn" onClick={() => setPanelOpen(true)}>
                  <SlidersHorizontal size={15} /> Filters{activeCount ? ` (${activeCount})` : ''}
                </button>
                <label className="tp-sort">
                  <span>Sort by</span>
                  <span className="tp-select">
                    <select value={sort} onChange={(e) => setSort(e.target.value as SortId)}>
                      {sortOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={14} aria-hidden="true" />
                  </span>
                </label>
              </div>
            </div>

            <p className="sr-only" aria-live="polite">{visible.length} tours match your filters.</p>
            {visible.length ? (
              <div className="tp-grid">
                {visible.map((t) => (
                  <TourCard key={t.slug} tour={t} />
                ))}
              </div>
            ) : (
              list.length === 0 && category ? (
                // A category with no tours yet, e.g. Private Paris Tours: tours are planned on request.
                <div className="tp-empty">
                  <p>{category.lede}</p>
                  <A to={BOOKING} className="pl-btn pl-btn-sm">Contact Us <ArrowRight size={13} /></A>
                </div>
              ) : (
                <div className="tp-empty">
                  <p>No {info.noun} match these filters.</p>
                  <button type="button" className="pl-btn pl-btn-sm" onClick={() => setFilters(emptyFilters)}>Clear all filters</button>
                </div>
              )
            )}
          </section>
        </div>
      </div>

      {others.length > 0 && (
        <section className="pl-wrap tp-others" aria-labelledby="tp-others-h">
          <div className="tp-head">
            <h2 id="tp-others-h">{category ? 'Explore Other Categories' : 'Browse by Category'}{dest ? ` in ${dest.name}` : ''}</h2>
            {(category || dest) && <A to="/tours" className="pl-more">View All {tours.length} Tours <ArrowRight size={13} /></A>}
          </div>
          <div className={`tp-tiles ${others.length === 6 ? 'is-six' : ''}`}>
            {others.map((c) => (
              <A key={c.slug} to={toursPath(dest?.slug, c.slug)} className="tp-tile">
                <img src={c.tile} alt="" loading="lazy" />
                <span>{c.label} <ArrowRight size={13} /></span>
              </A>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
