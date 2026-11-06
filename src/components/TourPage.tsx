import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Clock, Gem, Heart, Images, MapPin, Star, Users, X } from 'lucide-react';
import { categoryBySlug, euro, formatHours, hasRating, mainImage, tourBySlug, tourPath, type Tour } from '@/data/tours';
import { relatedTours, tourReviews } from '@/data/tourDetails';
import { destinationBySlug, destinationPath, toursPath } from '@/data/destinations';
import { useLockBody } from '@/hooks/useLockBody';
import { A } from './Chrome';
import '@/tour.css';

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="td-stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={value >= n - 0.25 ? 'currentColor' : 'none'} strokeWidth={value >= n - 0.25 ? 0 : 1.5} />
      ))}
    </span>
  );
}

/** First two sentences, for the short intro under the title. */
const intro = (s: string) => {
  const parts = s.match(/[^.!?]+[.!?]+(\s|$)/g);
  return parts ? parts.slice(0, 2).join('').trim() : s;
};

/* ---------------- gallery ---------------- */

function Gallery({ tour }: { tour: Tour }) {
  const images = tour.images;
  const [open, setOpen] = useState<number | null>(null);
  useLockBody(open !== null);
  const go = (step: number) => setOpen((i) => (i === null ? i : (i + step + images.length) % images.length));

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="td-gallery">
      <button type="button" className="td-gallery-main" onClick={() => setOpen(0)} aria-label="Open photo 1">
        <img src={images[0]} alt={tour.title} />
      </button>
      {images.length > 1 && (
        <div className="td-thumbs">
          {images.slice(1, 4).map((src, i) => (
            <button key={src} type="button" onClick={() => setOpen(i + 1)} aria-label={`Open photo ${i + 2}`}>
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <button type="button" className="td-photos-btn" onClick={() => setOpen(0)}><Images size={15} /> View Photos ({images.length})</button>

      {open !== null && (
        <div className="td-lightbox" role="dialog" aria-modal="true" aria-label={`${tour.title} photos`} onClick={() => setOpen(null)}>
          <img src={images[open]} alt={`${tour.title}, photo ${open + 1} of ${images.length}`} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="td-lb-close" aria-label="Close photos" onClick={() => setOpen(null)}><X size={22} /></button>
          {images.length > 1 && <>
            <button type="button" className="td-lb-nav is-prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); go(-1); }}><ChevronLeft size={26} /></button>
            <button type="button" className="td-lb-nav is-next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); go(1); }}><ChevronRight size={26} /></button>
          </>}
          <p className="td-lb-count">{open + 1} / {images.length}</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- summary + booking ---------------- */

function Summary({ tour, label }: { tour: Tour; label: string }) {
  const dest = destinationBySlug(tour.destination);
  return (
    <div className="td-summary">
      <p className="td-eyebrow">{label}</p>
      <h1>{tour.title}</h1>
      <p className="td-lede">{intro(tour.summary)}</p>
      {hasRating(tour) && (
        <a href="#reviews" className="td-rating">
          <Stars value={tour.rating} />
          <strong>{tour.rating.toFixed(1)}</strong>
          {tour.reviews ? <span>{tour.reviews.toLocaleString('en')} reviews</span> : null}
        </a>
      )}
      <ul className="td-facts">
        {tour.duration !== null && <li><Clock size={16} /> {formatHours(tour.duration)}</li>}
        {dest && <li><MapPin size={16} /> {dest.name}</li>}
      </ul>
      <ul className="td-perks">
        <li><Gem size={20} strokeWidth={1.4} /><strong>Expert Local Guides</strong><span>Passionate and fun</span></li>
        <li><Users size={20} strokeWidth={1.4} /><strong>Small Groups</strong><span>A more personal experience</span></li>
        <li><Heart size={20} strokeWidth={1.4} /><strong>Unforgettable Memories</strong><span>Iconic sights, local stories</span></li>
      </ul>
    </div>
  );
}

function childPriceText(tour: Tour) {
  if (tour.childPrice == null) return null;
  return tour.childPrice === 'Free' ? 'Kids go free' : `Children from ${euro(tour.childPrice)}`;
}

function BookingCard({ tour }: { tour: Tour }) {
  const child = childPriceText(tour);
  return (
    <aside className="td-book" aria-label="Book this tour">
      <p className="td-from">{tour.priceLabel ?? 'From'} <strong>{euro(tour.price)}</strong></p>
      <p className="td-per">{tour.priceNote ?? 'per adult'}</p>
      {child && <p className="td-child"><Check size={14} /> {child}</p>}
      {tour.youthPrice != null && <p className="td-child"><Check size={14} /> Youth / teenager from {euro(tour.youthPrice)}</p>}
      {tour.startTimes && <p className="td-child td-times"><Clock size={14} /> Start times: {tour.startTimes}</p>}
      <A to={tour.bookingUrl} sameTab className="pl-btn td-book-btn">Book Now <ArrowRight size={16} /></A>
      <p className="td-book-note">Choose your date and number of guests on the next page.</p>
    </aside>
  );
}

/* ---------------- content blocks ---------------- */

function Ticks({ items }: { items: string[] }) {
  return (
    <ul className="td-ticks">
      {items.map((t) => <li key={t}><Check size={13} /><span>{t}</span></li>)}
    </ul>
  );
}

function Reviews({ tour }: { tour: Tour & { rating: number } }) {
  const [i, setI] = useState(0);
  const r = tourReviews[i];
  const go = (step: number) => setI((n) => (n + step + tourReviews.length) % tourReviews.length);
  return (
    <section id="reviews" className="td-reviews" aria-labelledby="td-rev-h">
      <div className="td-row-head">
        <h2 id="td-rev-h">Customer Reviews</h2>
        <A to="/#reviews" className="pl-more">Read All Reviews <ArrowRight size={13} /></A>
      </div>
      <div className="td-rev-body">
        <div className="td-score">
          <p><Star size={30} fill="currentColor" strokeWidth={0} className="td-star" /> <strong>{tour.rating.toFixed(1)}</strong></p>
          <span>{tour.reviews ? `Based on ${tour.reviews.toLocaleString("en")} reviews` : "Average rating"}</span>
        </div>
        <div className="td-quote">
          <button type="button" aria-label="Previous review" onClick={() => go(-1)}><ChevronLeft size={16} /></button>
          <blockquote aria-live="polite">
            <p>“{r.quote}”</p>
            <footer><span>{r.name}, {r.place}</span> <Stars value={5} size={12} /></footer>
          </blockquote>
          <button type="button" aria-label="Next review" onClick={() => go(1)}><ChevronRight size={16} /></button>
        </div>
      </div>
    </section>
  );
}

function Related({ tour }: { tour: Tour }) {
  const list = relatedTours(tour);
  if (!list.length) return null;
  const dest = destinationBySlug(tour.destination);
  const category = categoryBySlug(tour.categories[0]);
  return (
    <section id="related" className="pl-wrap td-related" aria-labelledby="td-rel-h">
      <div className="td-row-head">
        <h2 id="td-rel-h">Similar {dest?.name ?? ''} Tours</h2>
        <A to={toursPath(dest?.slug, category?.slug)} className="pl-more">View All {category?.label ?? `${dest?.name ?? ''} Tours`} <ArrowRight size={13} /></A>
      </div>
      <div className="td-rel-grid">
        {list.map((t) => (
          <article key={t.slug} className="td-rel">
            <A to={tourPath(t)} className="td-rel-img" tabIndex={-1} aria-hidden="true"><img src={mainImage(t)} alt="" loading="lazy" /></A>
            <div className="td-rel-body">
              <h3><A to={tourPath(t)}>{t.title}</A></h3>
              <p className="td-rel-meta">
                {t.duration !== null && <span><Clock size={12} /> {formatHours(t.duration)}</span>}
                {hasRating(t) && <span><Star size={12} fill="currentColor" strokeWidth={0} className="td-star" /> {t.rating.toFixed(1)}{t.reviews ? ` (${t.reviews.toLocaleString('en')})` : ''}</span>}
              </p>
              <div className="td-rel-foot">
                <p className="pl-price"><small>{t.priceLabel ?? 'From'}</small> {euro(t.price)}</p>
                <A to={tourPath(t)} className="pl-btn pl-btn-sm" aria-label={`View tour: ${t.title}`}>View Tour <ArrowRight size={13} /></A>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------- page ---------------- */

export function TourPage() {
  const { tour: slug } = useParams();
  const tour = tourBySlug(slug);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (tour) document.title = `${tour.title} | Paris Top Sights Tours`;
    setTab('overview');
  }, [tour]);

  if (!tour) return <Navigate to="/tours" replace />;
  const dest = destinationBySlug(tour.destination);
  const category = categoryBySlug(tour.categories[0]);
  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...(tour.highlights.length ? [{ id: 'highlights', label: 'Highlights' }] : []),
    { id: 'details', label: 'Tour Details' },
    ...(hasRating(tour) ? [{ id: "reviews", label: "Reviews" }] : []),
    { id: 'related', label: 'Similar Tours' },
  ];

  return (
    <div className="pl td">
      <div className="pl-wrap">
        <nav className="pl-crumbs td-crumbs" aria-label="Breadcrumb">
          <A to="/">Home</A><ChevronRight size={11} />
          {dest?.parent && <><A to={destinationPath(dest.parent)}>{destinationBySlug(dest.parent)?.name}</A><ChevronRight size={11} /></>}
          {dest && <><A to={destinationPath(dest.slug)}>{dest.name}</A><ChevronRight size={11} /></>}
          {category && <><A to={toursPath(dest?.slug, category.slug)}>{category.label}</A><ChevronRight size={11} /></>}
          <span aria-current="page">{tour.title}</span>
        </nav>

        <div className="td-top">
          <Gallery tour={tour} />
          <Summary tour={tour} label={category?.label ?? dest?.name ?? 'Tour'} />
          <BookingCard tour={tour} />
        </div>
      </div>

      <nav className="td-tabs" aria-label="Tour sections">
        <div className="pl-wrap">
          {tabs.map((t) => (
            <A key={t.id} to={`#${t.id}`} className={tab === t.id ? 'is-active' : ''} aria-current={tab === t.id ? 'true' : undefined} onClick={() => setTab(t.id)}>{t.label}</A>
          ))}
        </div>
      </nav>

      <div className="pl-wrap td-main">
        <div>
          <section id="overview" aria-labelledby="td-ov-h">
            <h2 id="td-ov-h">Tour Overview</h2>
            <p className="td-text">{tour.summary}</p>
          </section>
          <section id="details" className="td-details" aria-labelledby="td-det-h">
            <h2 id="td-det-h">Tour Details</h2>
            {/* Simple HTML from src/content/tours.json ("description"). */}
            <div className="td-prose" dangerouslySetInnerHTML={{ __html: tour.description }} />
          </section>
        </div>

        {tour.highlights.length > 0 && (
          <aside id="highlights" className="td-box td-hl" aria-labelledby="td-hl-h">
            <h2 id="td-hl-h">Tour Highlights</h2>
            <Ticks items={tour.highlights} />
            <A to={tour.bookingUrl} sameTab className="pl-btn pl-btn-sm td-hl-btn">Book Now <ArrowRight size={13} /></A>
          </aside>
        )}
      </div>

      {hasRating(tour) && (
        <div className="pl-wrap td-bottom td-bottom-single">
          <Reviews tour={tour} />
        </div>
      )}

      <Related tour={tour} />

      <div className="td-mbar">
        <p><small>{tour.priceLabel ?? 'From'}</small> <strong>{euro(tour.price)}</strong> <small>{tour.priceNote ? tour.priceNote.split(" · ")[0] : "per adult"}</small></p>
        <A to={tour.bookingUrl} sameTab className="pl-btn pl-btn-sm">Book Now <ArrowRight size={13} /></A>
      </div>
    </div>
  );
}
