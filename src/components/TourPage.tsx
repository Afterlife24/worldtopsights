import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  ArrowRight, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Gem, Heart, Images, Info,
  MapPin, ShieldCheck, Star, User, Users, X,
} from 'lucide-react';
import { BOOKING } from '@/data/landing';
import { categoryBySlug, formatHours, tourBySlug, tourPath, type Tour } from '@/data/tours';
import { formatMinutes, relatedTours, tourDetail, tourReviews, type TourDetail } from '@/data/tourDetails';
import { destinationBySlug, destinationPath, toursPath } from '@/data/destinations';
import { useLockBody } from '@/hooks/useLockBody';
import { A } from './Chrome';
import '@/tour.css';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'included', label: 'What’s Included' },
  { id: 'meeting', label: 'Meeting Point' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faqs', label: 'FAQs' },
];

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="td-stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={value >= n - 0.25 ? 'currentColor' : 'none'} strokeWidth={value >= n - 0.25 ? 0 : 1.5} />
      ))}
    </span>
  );
}

/* ---------------- gallery ---------------- */

function Gallery({ tour, images }: { tour: Tour; images: string[] }) {
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
      <div className="td-thumbs">
        {images.slice(1, 4).map((src, i) => (
          <button key={src} type="button" onClick={() => setOpen(i + 1)} aria-label={`Open photo ${i + 2}`}>
            <img src={src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      <button type="button" className="td-photos-btn" onClick={() => setOpen(0)}><Images size={15} /> View Photos ({images.length})</button>

      {open !== null && (
        <div className="td-lightbox" role="dialog" aria-modal="true" aria-label={`${tour.title} photos`} onClick={() => setOpen(null)}>
          <img src={images[open].replace('w=1000', 'w=1800')} alt={`${tour.title}, photo ${open + 1} of ${images.length}`} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="td-lb-close" aria-label="Close photos" onClick={() => setOpen(null)}><X size={22} /></button>
          <button type="button" className="td-lb-nav is-prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); go(-1); }}><ChevronLeft size={26} /></button>
          <button type="button" className="td-lb-nav is-next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); go(1); }}><ChevronRight size={26} /></button>
          <p className="td-lb-count">{open + 1} / {images.length}</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- summary + booking ---------------- */

function Summary({ tour, detail, label }: { tour: Tour; detail: TourDetail; label: string }) {
  const isPrivate = tour.types.includes('Private');
  return (
    <div className="td-summary">
      <p className="td-eyebrow">{label}</p>
      <h1>{tour.title}</h1>
      <p className="td-lede">{detail.overview.split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.')}</p>
      <a href="#reviews" className="td-rating">
        <Stars value={tour.rating} />
        <strong>{tour.rating.toFixed(1)}</strong>
        <span>{tour.reviews.toLocaleString('en')} reviews</span>
      </a>
      <ul className="td-facts">
        <li><Clock size={16} /> {formatHours(tour.hours)}</li>
        <li>{isPrivate ? <User size={16} /> : <Users size={16} />} {detail.groupLabel}</li>
        <li><MapPin size={16} /> {detail.kind}</li>
      </ul>
      <ul className="td-perks">
        <li><Gem size={20} strokeWidth={1.4} /><strong>Expert Local Guides</strong><span>Passionate and certified</span></li>
        <li>{isPrivate ? <User size={20} strokeWidth={1.4} /> : <Users size={20} strokeWidth={1.4} />}<strong>{isPrivate ? 'Private Experience' : 'Small Groups'}</strong><span>{isPrivate ? 'Just you and your group' : 'A more personal experience'}</span></li>
        <li><Heart size={20} strokeWidth={1.4} /><strong>Unforgettable Memories</strong><span>Iconic sights, local stories</span></li>
      </ul>
    </div>
  );
}

function BookingCard({ tour }: { tour: Tour }) {
  const [guests, setGuests] = useState(2);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <aside className="td-book" aria-label="Book this tour">
      <p className="td-from">From <strong>€{tour.price}</strong></p>
      <p className="td-per">per person</p>
      <form onSubmit={(e) => e.preventDefault()}>
        <label className="td-field">
          <span className="sr-only">Date</span>
          <CalendarDays size={16} aria-hidden="true" />
          <input type="date" min={today} aria-label="Select a date" />
        </label>
        <label className="td-label" htmlFor="td-guests">Number of guests</label>
        <span className="td-field">
          <Users size={16} aria-hidden="true" />
          <select id="td-guests" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? 'adult' : 'adults'}</option>)}
          </select>
          <ChevronDown size={15} className="td-caret" aria-hidden="true" />
        </span>
        <p className="td-total"><span>Total</span><strong>€{(tour.price * guests).toLocaleString('en')}</strong></p>
        <A to={BOOKING} className="pl-btn td-book-btn">Book Now <ArrowRight size={16} /></A>
      </form>
      <ul className="td-assure">
        <li><Check size={14} /> Free cancellation up to 24 hours</li>
        <li><Check size={14} /> Instant confirmation</li>
        <li><Check size={14} /> Secure payment</li>
      </ul>
    </aside>
  );
}

/* ---------------- content blocks ---------------- */

function Ticks({ items, no = false }: { items: string[]; no?: boolean }) {
  return (
    <ul className={`td-ticks ${no ? 'is-no' : ''}`}>
      {items.map((t) => <li key={t}>{no ? <X size={13} /> : <Check size={13} />}<span>{t}</span></li>)}
    </ul>
  );
}

function Meeting({ detail }: { detail: TourDetail }) {
  const { lat, lon, name, address, note } = detail.meeting;
  const bbox = [lon - 0.009, lat - 0.004, lon + 0.009, lat + 0.004].join(',');
  return (
    <section id="meeting" className="td-box td-meeting" aria-labelledby="td-meet-h">
      <h2 id="td-meet-h">Meeting Point</h2>
      <iframe
        title={`Map of ${name}`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
        loading="lazy"
      />
      <div className="td-meet-row">
        <MapPin size={18} className="td-gold" />
        <div>
          <strong>{name}</strong>
          <span>{address}</span>
          {note && <span className="td-note">{note}</span>}
        </div>
        <A to={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`} className="pl-more">Get Directions <ArrowRight size={13} /></A>
      </div>
    </section>
  );
}

function Reviews({ tour }: { tour: Tour }) {
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
          <span>Based on {tour.reviews.toLocaleString('en')} reviews</span>
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

function Faqs({ detail }: { detail: TourDetail }) {
  return (
    <section id="faqs" className="td-faqs" aria-labelledby="td-faq-h">
      <div className="td-row-head">
        <h2 id="td-faq-h">Frequently Asked Questions</h2>
        <A to="/#faq" className="pl-more">View All FAQs <ArrowRight size={13} /></A>
      </div>
      <div className="td-faq-grid">
        {detail.faqs.map((f) => (
          <details key={f.q} className="td-faq">
            <summary>{f.q}<ChevronDown size={15} /></summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Related({ tour }: { tour: Tour }) {
  const list = relatedTours(tour);
  const category = categoryBySlug(tour.category);
  return (
    <section className="pl-wrap td-related" aria-labelledby="td-rel-h">
      <div className="td-row-head">
        <h2 id="td-rel-h">Related {destinationBySlug(tour.destination)?.name ?? ''} Tours</h2>
        <A to={toursPath(destinationBySlug(tour.destination)?.slug, tour.category)} className="pl-more">View All {category?.label ?? 'Tours'} <ArrowRight size={13} /></A>
      </div>
      <div className="td-rel-grid">
        {list.map((t) => (
          <article key={t.id} className="td-rel">
            <A to={tourPath(t)} className="td-rel-img" tabIndex={-1} aria-hidden="true"><img src={t.image} alt="" loading="lazy" /></A>
            <div className="td-rel-body">
              <h3><A to={tourPath(t)}>{t.title}</A></h3>
              <p className="td-rel-meta">
                <span><Clock size={12} /> {formatHours(t.hours)}</span>
                <span><Star size={12} fill="currentColor" strokeWidth={0} className="td-star" /> {t.rating.toFixed(1)} ({t.reviews.toLocaleString('en')})</span>
              </p>
              <div className="td-rel-foot">
                <p className="pl-price"><small>From</small> €{t.price}</p>
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
  const { category: slug, tour: tourSlug } = useParams();
  const tour = tourBySlug(slug, tourSlug);
  const category = categoryBySlug(slug);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (tour) document.title = `${tour.title} | Paris Top Sights Tours`;
    setTab('overview');
  }, [tour]);

  if (!tour || !category) return <Navigate to={category ? `/tours/${category.slug}` : '/tours'} replace />;
  const detail = tourDetail(tour);
  const dest = destinationBySlug(tour.destination);

  return (
    <div className="pl td">
      <div className="pl-wrap">
        <nav className="pl-crumbs td-crumbs" aria-label="Breadcrumb">
          <A to="/">Home</A><ChevronRight size={11} />
          {dest?.parent && <><A to={destinationPath(dest.parent)}>{destinationBySlug(dest.parent)?.name}</A><ChevronRight size={11} /></>}
          {dest && <><A to={destinationPath(dest.slug)}>{dest.name}</A><ChevronRight size={11} /></>}
          <A to={toursPath(dest?.slug, category.slug)}>{category.label}</A><ChevronRight size={11} />
          <span aria-current="page">{tour.title}</span>
        </nav>

        <div className="td-top">
          <Gallery tour={tour} images={detail.gallery} />
          <Summary tour={tour} detail={detail} label={category.label} />
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

      <div className="pl-wrap td-content">
        <div className="td-col">
          <section id="overview" aria-labelledby="td-ov-h">
            <h2 id="td-ov-h">Tour Overview</h2>
            <p className="td-text">{detail.overview}</p>
          </section>
          <section id="itinerary" aria-labelledby="td-it-h">
            <h2 id="td-it-h">Itinerary</h2>
            <ol className="td-steps">
              {detail.itinerary.map((s, i) => (
                <li key={s.title}>
                  <span className="td-step-n">{i + 1}</span>
                  <div>
                    <p className="td-step-head"><strong>{s.title}</strong><span>{formatMinutes(s.minutes)}</span></p>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="td-col td-col-mid">
          <section aria-labelledby="td-hl-h">
            <h2 id="td-hl-h">Tour Highlights</h2>
            <Ticks items={detail.highlights} />
          </section>
          <section id="included" className="td-inc" aria-label="What’s included">
            <div>
              <h3>What’s Included</h3>
              <Ticks items={detail.included} />
            </div>
            <div>
              <h3>What’s Not Included</h3>
              <Ticks items={detail.notIncluded} no />
            </div>
          </section>
        </div>

        <div className="td-col td-col-side">
          <Meeting detail={detail} />
          <div className="td-box td-policies">
            <section aria-labelledby="td-info-h">
              <h3 id="td-info-h"><Info size={18} className="td-gold" /> Important Information</h3>
              <ul className="td-dots">{detail.info.map((t) => <li key={t}>{t}</li>)}</ul>
            </section>
            <section aria-labelledby="td-cancel-h">
              <h3 id="td-cancel-h"><ShieldCheck size={18} className="td-gold" /> Cancellation Policy</h3>
              <p>{detail.cancellation}</p>
              <A to={BOOKING} className="pl-more">Read Full Policy <ArrowRight size={13} /></A>
            </section>
          </div>
        </div>
      </div>

      <div className="pl-wrap td-bottom">
        <Reviews tour={tour} />
        <Faqs detail={detail} />
      </div>

      <Related tour={tour} />

      <div className="td-mbar">
        <p><small>From</small> <strong>€{tour.price}</strong> <small>per person</small></p>
        <A to={BOOKING} className="pl-btn pl-btn-sm">Book Now <ArrowRight size={13} /></A>
      </div>
    </div>
  );
}

