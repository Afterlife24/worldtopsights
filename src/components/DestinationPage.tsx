import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronRight, Heart, MapPin } from 'lucide-react';
import { byPopularity, inDestination, tours, usedCategories } from '@/data/tours';
import { destinationBySlug, destinationList, destinationPath, toursPath } from '@/data/destinations';
import { A } from './Chrome';
import { TourCard } from './TourCategory';
import '@/tours.css';
import '@/tour.css';
import '@/destinations.css';

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((v) => v !== id) : [...list, id]);

export function DestinationPage() {
  const { destination: slug } = useParams();
  const dest = destinationBySlug(slug);
  const [saved, setSaved] = useState<string[]>([]);

  const list = useMemo(() => tours.filter((t) => inDestination(t, dest?.slug)), [dest]);
  const featured = useMemo(() => [...list].sort(byPopularity).slice(0, 6), [list]);
  // Only categories that have tours here.
  const cats = useMemo(
    () => (dest ? usedCategories(dest.slug).map((c) => ({ ...c, count: list.filter((t) => t.categories.includes(c.slug)).length })) : []),
    [list, dest],
  );

  useEffect(() => {
    if (dest) document.title = `${dest.title} | Paris Top Sights Tours`;
  }, [dest]);

  if (!dest) return <Navigate to="/tours" replace />;
  const parent = destinationBySlug(dest.parent);
  const others = destinationList.filter((d) => d.slug !== dest.slug);
  const children = destinationList.filter((d) => d.parent === dest.slug);

  return (
    <div className="pl tp dp">
      <section className="tp-hero dp-hero">
        <img className="tp-hero-img" src={dest.hero} alt={dest.heroAlt} />
        <div className="pl-wrap tp-hero-inner">
          <nav className="pl-crumbs" aria-label="Breadcrumb">
            <A to="/">Home</A><ChevronRight size={11} />
            {parent && <><A to={destinationPath(parent.slug)}>{parent.name}</A><ChevronRight size={11} /></>}
            <span aria-current="page">{dest.name}</span>
          </nav>
          <p className="dp-eyebrow">{dest.eyebrow}</p>
          <h1>{dest.title}</h1>
          <p className="tp-lede">{dest.lede}</p>
          <A to={toursPath(dest.slug)} className="pl-btn pl-btn-caps dp-cta">View all {list.length} tours <ArrowRight size={14} /></A>
          <p className="tp-script" aria-hidden="true">{dest.script[0]}<br /><span>{dest.script[1]} <Heart size={20} strokeWidth={1.2} /></span></p>
        </div>
      </section>

      {cats.length > 0 && <section className="pl-wrap dp-section" aria-labelledby="dp-cats">
        <div className="tp-head">
          <div>
            <h2 id="dp-cats">Explore by Category</h2>
            <p>Every kind of {dest.name} experience, from walking tours to food and attraction tickets.</p>
          </div>
        </div>
        <div className="dp-cats">
          {cats.map((c) => (
            <A key={c.slug} to={toursPath(dest.slug, c.slug)} className="tp-tile dp-cat">
              <img src={c.tile} alt="" loading="lazy" />
              <span>{c.label} <small>({c.count})</small> <ArrowRight size={13} /></span>
            </A>
          ))}
        </div>
      </section>}

      {featured.length > 0 && <section className="pl-wrap dp-section" aria-labelledby="dp-feat">
        <div className="tp-head">
          <div>
            <h2 id="dp-feat">Popular {dest.name} Experiences</h2>
            <p>Chosen by travellers for their unforgettable moments.</p>
          </div>
          <A to={toursPath(dest.slug)} className="pl-more">View All {list.length} Tours <ArrowRight size={13} /></A>
        </div>
        <div className="tp-grid dp-grid">
          {featured.map((t) => <TourCard key={t.slug} tour={t} saved={saved.includes(t.slug)} onSave={() => setSaved((s) => toggle(s, t.slug))} />)}
        </div>
        <div className="dp-more">
          <A to={toursPath(dest.slug)} className="pl-btn">Browse All {dest.name} Tours <ArrowRight size={15} /></A>
        </div>
      </section>}

      {children.length > 0 && (
        <section className="pl-wrap dp-section" aria-labelledby="dp-inside">
          {children.map((c) => (
            <A key={c.slug} to={destinationPath(c.slug)} className="dp-feature">
              <img src={c.tile} alt="" loading="lazy" />
              <span className="dp-feature-body">
                <span className="dp-eyebrow">Also in {dest.name}</span>
                <h2 id="dp-inside">{c.name}</h2>
                <span>{c.lede}</span>
                <span className="pl-more">Explore {c.name} <ArrowRight size={13} /></span>
              </span>
            </A>
          ))}
        </section>
      )}

      <section className="pl-wrap dp-section dp-about" aria-labelledby="dp-about">
        <div>
          <h2 id="dp-about">{dest.about.title}</h2>
          {dest.about.paragraphs.map((p) => <p key={p}>{p}</p>)}
        </div>
        <dl className="dp-facts">
          {dest.facts.map((f) => (
            <div key={f.label}>
              <dt><MapPin size={15} /> {f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pl-wrap dp-section" aria-labelledby="dp-faq">
        <div className="tp-head">
          <h2 id="dp-faq">{dest.name} FAQs</h2>
          <A to="/#faq" className="pl-more">View All FAQs <ArrowRight size={13} /></A>
        </div>
        <div className="dp-faqs">
          {dest.faqs.map((f) => (
            <details key={f.q} className="td-faq">
              <summary>{f.q}<ChevronDown size={15} /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="pl-wrap dp-section dp-last" aria-labelledby="dp-other">
        <div className="tp-head">
          <h2 id="dp-other">Other Destinations</h2>
          <A to="/tours" className="pl-more">View All {tours.length} Tours <ArrowRight size={13} /></A>
        </div>
        <div className="dp-others">
          {others.map((d) => (
            <A key={d.slug} to={destinationPath(d.slug)} className="tp-tile dp-other">
              <img src={d.tile} alt="" loading="lazy" />
              <span>{d.name} <ArrowRight size={13} /></span>
            </A>
          ))}
        </div>
      </section>
    </div>
  );
}
