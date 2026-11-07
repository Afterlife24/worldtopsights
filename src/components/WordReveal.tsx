import { useEffect, useRef, useState, type CSSProperties } from 'react';
import '@/reveal.css';

/**
 * Text whose words appear one after another (fade up out of a soft blur).
 * By default it plays when it scrolls into view, once. Pass `play` to control it yourself (e.g. the intro).
 * Use `lines` for text on several lines.
 */
export function WordReveal({ text, lines, play, delay = 0 }: { text?: string; lines?: string[]; play?: boolean; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (play !== undefined || seen) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setSeen(true);
        io.disconnect();
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [play, seen]);

  const on = play ?? seen;
  const all = lines ?? [text ?? ''];
  let n = 0;
  return (
    <span ref={ref} className={`wr ${on ? 'is-in' : ''}`} style={{ '--wr-delay': `${delay}s` } as CSSProperties}>
      {all.map((line, li) => (
        <span key={li} className={lines ? 'wr-line' : undefined}>
          {line.split(' ').filter(Boolean).map((word, wi) => {
            const i = n++;
            return (
              <span key={i}>
                {wi > 0 && ' '}
                <span className="wr-word" style={{ '--w': i } as CSSProperties}>{word}</span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
