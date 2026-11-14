import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, ChevronRight, Heart, Mail, Phone, Send } from 'lucide-react';
import { company, siteImages } from '@/data/landing';
import { toursPath } from '@/data/destinations';
import { WordReveal } from './WordReveal';
import { A } from './Chrome';
import '@/tours.css';
import '@/destinations.css';
import '@/info.css';

function PageHero({ title, lede, crumb }: { title: string; lede: string; crumb: string }) {
  return (
    <section className="tp-hero dp-hero">
      <img className="tp-hero-img" src={siteImages.destinations.paris.hero} alt="" />
      <div className="pl-wrap tp-hero-inner">
        <nav className="pl-crumbs" aria-label="Breadcrumb">
          <A to="/">Home</A><ChevronRight size={11} />
          <span aria-current="page">{crumb}</span>
        </nav>
        <h1><WordReveal key={title} text={title} play delay={0.1} /></h1>
        <p className="tp-lede">{lede}</p>
        <p className="tp-script" aria-hidden="true">More Than a Trip<br /><span>A Deeper Connection <Heart size={20} strokeWidth={1.2} /></span></p>
      </div>
    </section>
  );
}

function ContactDetails() {
  return (
    <ul className="in-details">
      <li><Mail size={16} /><a href={`mailto:${company.email}`}>{company.email}</a></li>
      <li><Phone size={16} /><a href={`tel:${company.phone}`}>{company.phoneDisplay}</a></li>
    </ul>
  );
}

/* ---------------- About Us ---------------- */

export function AboutPage() {
  useEffect(() => { document.title = `About Us | ${company.name}`; }, []);
  return (
    <div className="pl tp dp in">
      <PageHero title="Who We Are" lede={company.about.lede} crumb="About Us" />
      <section className="pl-wrap in-section">
        <h2 className="in-h2"><WordReveal text="Our History" /></h2>
        <div className="in-stories">
          {company.about.sections.map((s, i) => (
            <article key={s.title} className={`in-story ${i % 2 ? 'is-flip' : ''}`}>
              <img src={s.image} alt="" loading="lazy" />
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="pl-wrap in-section in-last">
        <div className="in-band">
          <div>
            <h2 className="in-h2"><WordReveal text="The Company" /></h2>
            <p>{company.name} is trading as {company.legalName}.</p>
            <ContactDetails />
          </div>
          <div className="in-band-actions">
            <A to={toursPath()} className="pl-btn pl-btn-caps">Explore Our Tours <ArrowRight size={14} /></A>
            <A to="/contact" className="pl-btn pl-btn-caps in-btn-line">Get in Touch</A>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Contact ---------------- */

type Status = 'idle' | 'sending' | 'done' | 'error';
const empty = { name: '', email: '', phone: '', message: '' };

export function ContactPage() {
  useEffect(() => { document.title = `Contact Us | ${company.name}`; }, []);
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState<Status>('idle');
  const [invalid, setInvalid] = useState(false);
  const set = (key: keyof typeof empty) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) && form.message.trim();
    setInvalid(!ok);
    if (!ok) return;
    setStatus('sending');
    // Netlify Forms: the hidden "contact" form in index.html registers these fields at deploy time.
    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('done');
      setForm(empty);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="pl tp dp in">
      <PageHero title="Get in Touch" lede={company.contactIntro} crumb="Contact" />
      <section className="pl-wrap in-section in-last">
        <div className="in-contact">
          <aside className="in-card">
            <h2 className="in-h2">Contact Us</h2>
            <p>Call or email us, or complete the form with your details and we’ll get back to you as soon as possible.</p>
            <ContactDetails />
            <p className="in-legal">{company.name}<br />{company.legalName}</p>
          </aside>
          {status === 'done' ? (
            <div className="in-form in-done" role="status">
              <Send size={28} />
              <h2 className="in-h2">Merci! Your message is on its way.</h2>
              <p>We’ll reply to you by email as soon as possible.</p>
            </div>
          ) : (
            <form className="in-form" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={submit} noValidate>
              <input type="hidden" name="form-name" value="contact" />
              <p className="sr-only"><label>Leave this empty: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
              <div className="in-row">
                <label>Your name *<input name="name" autoComplete="name" value={form.name} onChange={set('name')} required /></label>
                <label>Your email *<input name="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} required /></label>
              </div>
              <label>Telephone<input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} /></label>
              <label>Your message *<textarea name="message" rows={6} value={form.message} onChange={set('message')} required /></label>
              {invalid && <p className="pl-news-error" role="alert">Please fill in your name, a valid email and your message.</p>}
              {status === 'error' && <p className="pl-news-error" role="alert">Sorry, the message could not be sent. Please email us at <a href={`mailto:${company.email}`}>{company.email}</a>.</p>}
              <button type="submit" className="pl-btn pl-btn-caps" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send Message'} <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
