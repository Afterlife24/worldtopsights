import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Clock, Gem, Heart, Minus, Play, Plus, Star, Users } from 'lucide-react';
import { destinationCards, faqs, reasons, reviews, siteImages } from '@/data/landing';
import { byPopularity, euro, formatHours, hasRating, mainImage, topTours, tourPath, tours, usedCategories, type Tour } from '@/data/tours';
import { toursPath } from '@/data/destinations';
import { WordReveal } from './WordReveal';
import { A } from './Chrome';
import '@/landing.css';

/* ---------------- shared bits ---------------- */

function Rating({ tour }: { tour: Tour }) {
  return (
    <p className="pl-meta">
      {hasRating(tour) && <span><Star size={12} className="pl-star" fill="currentColor" strokeWidth={0} /> {tour.rating.toFixed(1)}{tour.reviews ? ` (${tour.reviews.toLocaleString('en')})` : ''}</span>}
      {tour.duration !== null && <span><Clock size={12} /> {formatHours(tour.duration)}</span>}
    </p>
  );
}

/** Real Paris tours only (no demo tours) for the home page lists. */
const parisTours = tours.filter((t) => t.destination === 'paris' && !t.demo);
const homeTop = topTours().filter((t) => !t.demo).slice(0, 4);
const homeMore = [...parisTours].filter((t) => !homeTop.includes(t)).sort(byPopularity).slice(0, 4);

function SectionTitle({ title, link }: { title: string; link?: { label: string; to: string } }) {
  return (
    <div className="pl-head">
      <h2><WordReveal text={title} /></h2>
      {link && <A to={link.to} className="pl-more">{link.label} <ArrowRight size={13} /></A>}
    </div>
  );
}

/* ---------------- hero ---------------- */

function Hero() {
  return (
    <section id="top" className="ph">
      <div className="ph-top">
      <img className="ph-img" src={siteImages.homeHero} alt="The Eiffel Tower and a bridge over the Seine" fetchPriority="high" />
      <div className="pl-wrap ph-inner">
        <p className="ph-eyebrow">Iconic places. Authentic experiences.</p>
        <h1><WordReveal lines={['Discover France,', 'Beyond the Ordinary']} play delay={0.1} /></h1>
        <p className="ph-lede">Curated tours and exclusive experiences in Paris, the South of France and Galeries Lafayette, designed for curious travellers.</p>
        <div className="ph-actions">
          <A to="/tours" className="pl-btn pl-btn-caps">Explore Tours <ArrowRight size={14} /></A>
          {/* Tripadvisor badge: public/site-images/tripadvisor-badge.png */}
          <img className="ph-badge" src="/site-images/tripadvisor-badge.png" alt="Tripadvisor 5 star reviews" width={92} height={91} />
        </div>
        <p className="ph-script" aria-hidden="true">“More than a trip,<br />a deeper connection<br />to France.”</p>
      </div>
      </div>
      <div className="pl-wrap ph-cards">
        {destinationCards.map((d) => (
          <article key={d.title} className="ph-card">
            <img src={d.image} alt={d.alt} loading="lazy" />
            <div>
              <h2><WordReveal text={d.title} /></h2>
              <p>{d.text}</p>
              <A to={d.to} className="ph-link">{d.cta} <ArrowRight size={14} /></A>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Go City partnership (same text and affiliate link as the old website) ---------------- */

const GO_CITY_URL = 'https://gocity.com/en/paris?utm_medium=affiliate&utm_source=partnerize&utm_campaign=gocity&utm_adcampaigngroup=gocity&utm_publisher=paristopsights&utm_referrer=https%3A%2F%2Fwww.paristopsightstours.com%2F&utm_content=Subaffiliate&utm_creative=0';

function GoCity() {
  return (
    <section className="pl-wrap pl-section pl-gocity" aria-labelledby="gocity-h">
      <A to={GO_CITY_URL} rel="sponsored noopener noreferrer" className="pl-gocity-img" aria-label="Go City Paris Pass: save up to 50% at 45+ attractions">
        <img src="/site-images/gocity-paris-pass.jpg" alt="Go City Paris Pass: save up to 50% at 45+ attractions, including the Big Bus, a Seine River cruise and an Eiffel Tower guided climb" width={600} height={400} loading="lazy" />
      </A>
      <div className="pl-gocity-text">
        <p className="ph-eyebrow">In partnership with Go City</p>
        <h2 id="gocity-h"><WordReveal text="Get the Go City Paris Pass" /></h2>
        <p>Discover Paris and save up to 50%* at over 45 attractions, tours and experiences with one single pass.</p>
        <p>Choose between the All-Inclusive or Explorer pass, enjoy great savings and get ready to explore Paris. Climb the Eiffel Tower, cruise the River Seine, discover the famous Mona Lisa and more at the Louvre Museum, enjoy a Parisian breakfast and wander the streets of Montmartre on a walking tour. The choice is yours!</p>
        <A to={GO_CITY_URL} rel="sponsored noopener noreferrer" className="pl-btn pl-btn-caps">Get the Paris Pass <ArrowRight size={14} /></A>
        <p className="pl-gocity-note">*Savings depend on the attractions you visit. Details on the Go City website.</p>
      </div>
    </section>
  );
}

/* ---------------- categories ---------------- */

function Categories() {
  return (
    <section id="categories" className="pl-wrap pl-section">
      <div className="pl-head">
        <h2><WordReveal text="Browse by Category" /></h2>
        <p className="pl-head-note">Find the perfect Paris experience for your interests.</p>
      </div>
      <div className={`pl-cats ${[4, 7, 8].includes(usedCategories('paris').length) ? 'is-seven' : ''}`}>
        {usedCategories('paris').map((cat) => (
          <A key={cat.slug} to={toursPath('paris', cat.slug)} className="pl-cat">
            <img src={cat.tile} alt="" loading="lazy" />
            <span>{cat.label} <ArrowRight size={15} /></span>
          </A>
        ))}
      </div>
    </section>
  );
}

/* ---------------- tour cards ---------------- */

function TopCard({ tour }: { tour: Tour }) {
  const to = tourPath(tour);
  return (
    <article className="pl-card">
      <A to={to} className="pl-card-img" tabIndex={-1} aria-hidden="true">
        <img src={mainImage(tour)} alt="" loading="lazy" />
        <span className="pl-badge">Top Tour</span>
      </A>
      <div className="pl-card-body">
        <h3><A to={to}>{tour.title}</A></h3>
        <Rating tour={tour} />
        <p className="pl-card-text">{tour.summary}</p>
        <div className="pl-card-foot">
          <p className="pl-price"><small>{tour.priceLabel ?? 'From'}</small> {euro(tour.price)}</p>
          <A to={to} className="pl-btn pl-btn-sm" aria-label={`View tour: ${tour.title}`}>View Tour <ArrowRight size={13} /></A>
        </div>
      </div>
    </article>
  );
}

function TopTours() {
  if (!homeTop.length) return null;
  return (
    <section id="top-tours" className="pl-wrap pl-section pl-featured">
      <SectionTitle title="Top Paris Tours" link={{ label: 'View All Paris Tours', to: toursPath('paris') }} />
      <div className="pl-grid4">
        {homeTop.map((tour) => <TopCard key={tour.slug} tour={tour} />)}
      </div>
    </section>
  );
}

function AllTours() {
  if (!parisTours.length) return null; // no Paris tours yet: hide the section
  return (
    <section id="tours" className="pl-wrap pl-section">
      <SectionTitle title={`All Paris Tours (${parisTours.length})`} link={{ label: `Browse All ${parisTours.length} Paris Tours`, to: toursPath('paris') }} />
      <div className="pl-grid4">
        {homeMore.map((tour) => (
          <A key={tour.slug} to={tourPath(tour)} className="pl-card pl-card-mini">
            <span className="pl-card-img"><img src={mainImage(tour)} alt="" loading="lazy" /></span>
            <span className="pl-card-body">
              <h3>{tour.title}</h3>
              <Rating tour={tour} />
              <span className="pl-card-foot">
                <span className="pl-price"><small>{tour.priceLabel ?? 'From'}</small> {euro(tour.price)}</span>
                <ArrowRight size={14} className="pl-card-arrow" />
              </span>
            </span>
          </A>
        ))}
      </div>
      {parisTours.length > homeTop.length + homeMore.length && (
        <div className="pl-more-band">
          <p>And {parisTours.length - homeTop.length - homeMore.length} more incredible tours waiting for you…</p>
          <A to={toursPath('paris')} className="pl-btn">Browse All Paris Tours <ArrowRight size={15} /></A>
        </div>
      )}
    </section>
  );
}

/* ---------------- why us ---------------- */

const reasonIcons = { gem: Gem, users: Users, star: Star, heart: Heart };

function WhyUs() {
  return (
    <section id="why" className="pl-wrap pl-section">
      <SectionTitle title="Why Choose Our Paris Tours" />
      <div className="pl-reasons">
        {reasons.map((item) => {
          const Icon = reasonIcons[item.icon];
          return (
            <div key={item.title} className="pl-reason">
              <Icon size={30} strokeWidth={1.1} />
              <h3>{item.title}</h3>
              <p>{item.text[0]}<br />{item.text[1]}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- reviews ---------------- */

type Story = (typeof reviews.stories)[number];

function StoryVideo({ story, playing, onPlay }: { story: Story; playing: boolean; onPlay: () => void }) {
  const label = `Play ${story.name}’s video`;
  if (playing && story.youtube) {
    return <iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(story.youtube)}?autoplay=1&rel=0`} title={`${story.name}’s video`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />;
  }
  if (playing && story.video) return <video src={story.video} poster={story.poster} controls autoPlay playsInline />;
  return (
    <>
      <img key={story.poster} src={story.poster} alt="" loading="lazy" />
      <button type="button" className="pl-rv-play" aria-label={label} onClick={onPlay}>
        <span className="pl-rv-play-tip">{playing ? 'Video coming soon' : 'Play video'}</span>
        <Play size={30} fill="currentColor" strokeWidth={0} />
      </button>
    </>
  );
}

function ReviewStories() {
  const list = reviews.stories;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const show = (i: number) => { setPlaying(false); setIndex((i + list.length) % list.length); };
  useEffect(() => {
    if (paused || playing || list.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % list.length), 7000);
    return () => window.clearInterval(id);
  }, [paused, playing, index, list.length]);
  const story = list[index];
  const hasVideo = Boolean(story.video || story.youtube);
  return (
    <div className="pl-rv-top" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className={`pl-rv-video ${playing && !hasVideo ? 'is-soon' : ''}`}>
        <StoryVideo key={index} story={story} playing={playing} onPlay={() => setPlaying(true)} />
        {list.length > 1 && (
          <>
            <button type="button" className="pl-rv-arrow pl-rv-arrow-l" aria-label="Previous video" onClick={() => show(index - 1)}><ChevronLeft size={18} /></button>
            <button type="button" className="pl-rv-arrow pl-rv-arrow-r" aria-label="Next video" onClick={() => show(index + 1)}><ChevronRight size={18} /></button>
          </>
        )}
      </div>
      <div className="pl-rv-card">
        <div key={index} className="pl-rv-card-body" aria-live="polite">
          <div className="pl-rv-avatar">
            <img src={story.photo || story.poster} alt="" loading="lazy" />
          </div>
          <h3>{story.name}</h3>
          <p className="pl-rv-from">{story.from}</p>
          <span className="pl-stars" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
          </span>
          <blockquote>“{story.quote}”</blockquote>
        </div>
        {list.length > 1 && (
          <div className="pl-rv-dots">
            {list.map((q, i) => (
              <button key={q.name} type="button" aria-label={`Show ${q.name}’s review`} aria-current={i === index} className={i === index ? 'is-on' : ''} onClick={() => show(i)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TravelerPhoto({ item }: { item: (typeof reviews.travelerPhotos)[number] }) {
  return (
    <figure className="pl-polaroid">
      <img src={item.photo} alt={item.caption} loading="lazy" />
      <figcaption>
        <strong>{item.names || item.caption}</strong>
        <span>{item.names ? `From ${item.from}` : item.from}</span>
        {item.names && <em>{item.caption}</em>}
      </figcaption>
    </figure>
  );
}

function Reviews() {
  const photos = reviews.travelerPhotos;
  return (
    <section id="reviews" className="pl-section pl-rv">
      <div className="pl-wrap">
        <SectionTitle title="What Our Guests Say" />
        <ReviewStories />
      </div>
      {photos.length > 0 && (
        <div className="pl-rv-photos">
          <div className="pl-wrap"><h3 className="pl-rv-sub"><WordReveal text="Our Travelers’ Photos" /></h3></div>
          <div className="pl-marquee">
            <div className="pl-marquee-track">
              <div className="pl-marquee-set">
                {photos.map((item) => <TravelerPhoto key={item.photo} item={item} />)}
              </div>
              <div className="pl-marquee-set" aria-hidden="true">
                {photos.map((item) => <TravelerPhoto key={item.photo} item={item} />)}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------- FAQ ---------------- */

function Faq() {
  const [open, setOpen] = useState<boolean[]>(() => faqs.map(() => false));
  const allOpen = open.every(Boolean);
  const toggle = (i: number) => setOpen((list) => list.map((v, j) => (j === i ? !v : v)));

  return (
    <section id="faq" className="pl-wrap pl-section pl-faq-section">
      <div className="pl-head">
        <h2><WordReveal text="Frequently Asked Questions" /></h2>
        <button type="button" className="pl-more" onClick={() => setOpen(faqs.map(() => !allOpen))}>
          {allOpen ? 'Collapse All' : 'Expand All'} {allOpen ? <Minus size={14} /> : <Plus size={14} />}
        </button>
      </div>
      <div className="pl-faq">
        {faqs.map((item, i) => (
          <div key={item.q} className={`pl-faq-item ${open[i] ? 'is-open' : ''}`}>
            <h3>
              <button type="button" aria-expanded={open[i]} aria-controls={`faq-${i}`} id={`faq-q-${i}`} onClick={() => toggle(i)}>
                {item.q} <ChevronDown size={15} />
              </button>
            </h3>
            <div id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="pl-faq-a" hidden={!open[i]}>
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- newsletter ---------------- */

function SketchLeft() {
  return (
    <svg className="pl-sketch pl-sketch-l" viewBox="0 0 220 120" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" aria-hidden="true">
      <path d="M0 118h220" />
      {/* Notre-Dame style towers */}
      <path d="M20 118V50h18v68M48 118V50h18v68M38 118V72h10v46M20 50l4-6h10l4 6M48 50l4-6h10l4 6M25 60h8M53 60h8M25 70h8M53 70h8M39 90a4 6 0 0 1 8 0v28" />
      <circle cx="43" cy="80" r="4" />
      {/* trees and lamp */}
      <path d="M90 118V95M84 98c-6-2-8-10-2-14 0-8 12-10 14-2 7 1 8 12 0 15-4 2-8 2-12 1zM120 118V78M116 78h8M118 74h4l-2-5-2 5zM150 118v-20M144 100c-6-3-6-12 1-13 2-7 12-6 12 1 6 2 5 11-2 12-3 1-7 1-11 0z" />
      <path d="M170 118V88h40v30M170 88l20-12 20 12M178 96h6v8h-6zM196 96h6v8h-6z" />
    </svg>
  );
}

function SketchRight() {
  return (
    <svg className="pl-sketch pl-sketch-r" viewBox="0 0 120 150" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M0 148h120M60 4v12M56 16h8M57 16l-6 40-22 92M63 16l6 40 22 92M49 56h22M41 92h38M44 148c3-20 9-30 16-30s13 10 16 30M51 56l9 36 9-36M45 92l15 18 15-18M54 34h12M55 26h10" />
      <path d="M8 148v-16M4 134c-4-2-4-9 1-10 1-5 8-5 9 0 4 1 4 8-1 10-3 1-6 1-9 0zM108 148v-20M103 130c-5-2-5-10 1-11 1-6 9-6 10 0 5 1 5 9-1 11-3 1-7 1-10 0z" />
    </svg>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState<'idle' | 'error' | 'done'>('idle');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    // TODO: connect to your email provider. For now the form only confirms on screen.
    setState(valid && agree ? 'done' : 'error');
  };

  return (
    <section className="pl-news">
      <SketchLeft />
      <div className="pl-wrap pl-news-inner">
        <div>
          <h2><WordReveal text="Be the First to Know" /></h2>
          <p>Get exclusive access to new tours, special offers and travel inspiration from Paris.</p>
        </div>
        {state === 'done' ? (
          <p className="pl-news-done" role="status">Merci! You’re on the list.</p>
        ) : (
          <form className="pl-news-form" onSubmit={submit} noValidate>
            <div className="pl-news-row">
              <label htmlFor="pl-email" className="sr-only">Email address</label>
              <input id="pl-email" type="email" autoComplete="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit" className="pl-btn">Subscribe <ArrowRight size={14} /></button>
            </div>
            <label className="pl-check">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              I agree to receive travel inspiration and special offers.
            </label>
            {state === 'error' && <p className="pl-news-error" role="alert">Please enter a valid email and tick the box to subscribe.</p>}
          </form>
        )}
      </div>
      <SketchRight />
    </section>
  );
}

/* ---------------- page ---------------- */

export function Landing() {
  return (
    <div className="pl">
      <Hero />
      <GoCity />
      <Categories />
      <TopTours />
      <AllTours />
      <WhyUs />
      <Reviews />
      <Faq />
      <Newsletter />
    </div>
  );
}
