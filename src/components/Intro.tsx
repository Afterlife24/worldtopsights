import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinationList, destinationPath } from '@/data/destinations';
import type { DestinationSlug } from '@/data/tours';
import { useLockBody } from '@/hooks/useLockBody';
import { WordReveal } from './WordReveal';
import '@/intro.css';

/*
  Intro shown on every load of the home page:
  1. headline (1.2 s)  2. three destination cards (2.0 s, paused while a card is hovered)
  3. a grid of squares flips away (2.0 s) - 5.2 s in total, on phones and computers.
  Grid: true squares sized from the screen so there are always 600+ of them, flipping away in random order. and reveals the page underneath.
  Skip button / Esc end it at once. Timings and colours are set here.
*/
const HEADLINE_MS = 1200;
const CARDS_MS = 2000;
const RESUME_MS = 500; // after the pointer leaves a card
const FLIP_MS = 2000;
const MIN_SQUARES = 620;

const cards: { slug: DestinationSlug; color: string; rotate: number }[] = [
  { slug: 'paris', color: '#3B4C66', rotate: -9 }, // blue-grey
  { slug: 'south-of-france', color: '#2F7FA8', rotate: 0 }, // sea blue
  { slug: 'galeries-lafayette', color: '#B8893B', rotate: 9 }, // gold
];

type Phase = 'headline' | 'cards' | 'flip' | 'done';

export function Intro() {
  const navigate = useNavigate();
  // Development only: ?intro=headline or ?intro=cards freezes that step, to check the design.
  const freeze = import.meta.env.DEV ? (new URLSearchParams(window.location.search).get('intro') as Phase | null) : null;
  const [phase, setPhase] = useState<Phase>(freeze ?? 'headline');
  const [active, setActive] = useState<DestinationSlug | null>(null);
  const firstWait = useRef(true);
  const pointer = useRef<string>('mouse');
  useLockBody(phase !== 'done');

  // 1 -> 2
  useEffect(() => {
    if (freeze) return;
    const t = window.setTimeout(() => setPhase((p) => (p === 'headline' ? 'cards' : p)), HEADLINE_MS);
    return () => window.clearTimeout(t);
  }, [freeze]);

  // 2 -> 3, waiting while a card is hovered or tapped
  useEffect(() => {
    if (freeze || phase !== 'cards' || active) return;
    const t = window.setTimeout(() => setPhase('flip'), firstWait.current ? CARDS_MS : RESUME_MS);
    firstWait.current = false;
    return () => window.clearTimeout(t);
  }, [phase, active, freeze]);

  // 3 -> done
  useEffect(() => {
    if (phase !== 'flip') return;
    const t = window.setTimeout(() => setPhase('done'), FLIP_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  // Esc skips
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPhase((p) => (p === 'done' ? p : 'flip'));
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // random flip order: each square gets its own start time, fixed for this visit
  const delays = useMemo(() => Array.from({ length: 4000 }, () => Math.random() * 1.2), []);

  if (phase === 'done') return null;

  const color = cards.find((c) => c.slug === active)?.color ?? '#000';
  // square size from the screen area, so the grid has at least MIN_SQUARES true squares
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const side = Math.floor(Math.sqrt((vw * vh) / MIN_SQUARES));
  const cols = Math.ceil(vw / side);
  const rows = Math.ceil(vh / side);
  const open = (slug: DestinationSlug) => {
    navigate(destinationPath(slug));
    setPhase('flip');
  };

  return (
    <div
      className={`intro is-${phase}`}
      style={{ backgroundColor: phase === 'flip' ? 'transparent' : color }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a destination"
    >
      <button type="button" className="intro-skip" onClick={() => setPhase('flip')}>Skip</button>

      <h2 className="intro-headline" aria-hidden={phase !== 'headline'} aria-label="Where will your French story begin?">
        <WordReveal lines={['Where will your', 'French story begin?']} play delay={0.1} />
      </h2>

      <div className="intro-cards">
        {cards.map((c, i) => {
          const d = destinationList.find((x) => x.slug === c.slug);
          if (!d) return null;
          const style = { '--r': `${c.rotate}deg`, '--i': i, '--c': c.color } as CSSProperties;
          return (
            <button
              key={c.slug}
              type="button"
              className={`intro-card ${active === c.slug ? 'is-active' : ''}`}
              style={style}
              tabIndex={phase === 'cards' ? 0 : -1}
              onPointerDown={(e: PointerEvent) => { pointer.current = e.pointerType; }}
              onPointerEnter={(e: PointerEvent) => e.pointerType === 'mouse' && setActive(c.slug)}
              onPointerLeave={(e: PointerEvent) => e.pointerType === 'mouse' && setActive(null)}
              onFocus={() => setActive(c.slug)}
              onBlur={() => setActive(null)}
              onClick={() => {
                // touch: first tap shows the colour, second tap opens
                if (pointer.current !== 'mouse' && active !== c.slug) setActive(c.slug);
                else open(c.slug);
              }}
              aria-label={`Explore ${d.name}`}
            >
              <img src={d.tile} alt="" />
              <span className="intro-card-name"><span><WordReveal text={d.name} play={phase !== 'headline'} delay={0.3 + i * 0.12} /></span></span>
              <span className="intro-card-cta">Explore</span>
            </button>
          );
        })}
      </div>

      {phase === 'flip' && (
        <div className="intro-tiles" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${cols}, ${side}px)`, gridTemplateRows: `repeat(${rows}, ${side}px)` }}>
          {Array.from({ length: cols * rows }, (_, n) => {
            return <span key={n} style={{ backgroundColor: color, animationDelay: `${delays[n] ?? 0}s` }} />;
          })}
        </div>
      )}
    </div>
  );
}
