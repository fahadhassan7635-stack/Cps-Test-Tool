/**
 * DoubleClickPage.tsx
 * - Pro SEO: semantic HTML, JSON-LD (WebApplication + FAQPage schema)
 * - Security: bounded state, no dangerouslySetInnerHTML, safe event handling,
 *   DOS protection via rate-limiting clicks, no user data leakage
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const THRESHOLD_MS   = 500;   // double-click window
const MAX_RESULTS    = 20;    // cap stored results (memory safety)
const MIN_INTERVAL   = 10;    // ignore suspiciously fast clicks (bot/chatter guard)
const RATE_LIMIT_MS  = 50;    // minimum ms between any two handleClick calls

// ─── Types ────────────────────────────────────────────────────────────────────
type Rating = { label: string; color: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getRating = (ms: number): Rating => {
  if (ms < 80)  return { label: '🔥 Lightning', color: 'var(--neon-red)'      };
  if (ms < 150) return { label: '⚡ Fast',      color: 'var(--neon-orange)'   };
  if (ms < 250) return { label: '✅ Normal',    color: 'var(--neon-green)'    };
  return              { label: '🐢 Slow',       color: 'var(--text-secondary)' };
};

// ─── JSON-LD structured data ──────────────────────────────────────────────────
const JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Double Click Test — Mouse Speed & Hardware Diagnostic',
  description:
    'Free online double-click speed tester. Measure the millisecond interval between two clicks, check your mouse hardware health, and benchmark your reflexes.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
});

// Safe JSON-LD injector — never passes user data through dangerouslySetInnerHTML
function JsonLd({ data }: { data: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = data; // textContent is XSS-safe
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [data]);
  return null;
}

// ─── FAQ data (static, never from user input) ─────────────────────────────────
const FAQS = [
  {
    q: 'What is the typical default double-click window in Windows / macOS?',
    a: `Most mainstream platforms use a default threshold of ${THRESHOLD_MS}ms. If your interval exceeds this value, the operating system registers the input as two single clicks rather than a consolidated action.`,
  },
  {
    q: 'How do optical mouse switches protect against accidental double-clicks?',
    a: 'Unlike traditional copper plates, optical mouse switches use a light beam to detect activation. This eliminates physical bounce issues entirely, providing consistent, clean click registration every time.',
  },
  {
    q: 'How do I fix a mouse that double-clicks on its own?',
    a: 'Update your mouse firmware/drivers, increase the de-bounce time in peripheral software (Logitech G Hub, Razer Synapse, etc.), or use compressed air to clear dust from beneath the shell casing.',
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function DoubleClickPage() {
  const [results,      setResults]      = useState<number[]>([]);
  const [lastInterval, setLastInterval] = useState<number | null>(null);
  const [status,       setStatus]       = useState('');

  // Refs — never trigger re-renders, safe for high-frequency access
  const lastClickRef   = useRef<number>(0);
  const lastHandleRef  = useRef<number>(0); // rate-limit guard
  const timeoutRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const handleClick = useCallback(() => {
    const now = performance.now();

    // ── Security: rate-limit — ignore calls faster than RATE_LIMIT_MS ──
    if (now - lastHandleRef.current < RATE_LIMIT_MS) return;
    lastHandleRef.current = now;

    const diff = now - lastClickRef.current;

    if (lastClickRef.current > 0 && diff < THRESHOLD_MS) {
      const interval = Math.round(diff);

      // ── Security: discard suspiciously fast intervals (switch chatter / automation) ──
      if (interval < MIN_INTERVAL) {
        lastClickRef.current = 0;
        setStatus('⚠️ Interval too fast — possible switch chatter detected.');
        return;
      }

      lastClickRef.current = 0;
      setLastInterval(interval);
      // ── Security: cap array length to prevent memory exhaustion ──
      setResults(prev => [interval, ...prev.slice(0, MAX_RESULTS - 1)]);
      setStatus(`✅ Double click! ${interval}ms interval`);
    } else {
      lastClickRef.current = now;
      setStatus('🖱️ Click again quickly!');

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        // Only reset if no second click arrived
        if (performance.now() - lastClickRef.current >= THRESHOLD_MS) {
          setStatus('⏱️ Too slow — try again!');
          lastClickRef.current = 0;
        }
      }, THRESHOLD_MS);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    lastClickRef.current  = 0;
    lastHandleRef.current = 0;
    setResults([]);
    setLastInterval(null);
    setStatus('');
  }, []);

  // Derived — computed safely from bounded numeric arrays
  const avg  = results.length > 0
    ? Math.round(results.reduce((a, b) => a + b, 0) / results.length)
    : null;
  const best = results.length > 0 ? Math.min(...results) : null;
  const lastRating = lastInterval !== null ? getRating(lastInterval) : null;

  return (
    <>
      <JsonLd data={JSON_LD} />

      <main
        style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}
        role="main"
        aria-label="Double Click Speed Test"
      >
        {/* ── Header ── */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-label">Mouse Tool</div>
          <h1 className="tool-title">Double Click Test</h1>
          <p className="tool-subtitle">Test how fast you can double-click your mouse</p>
        </header>

        {/* ── Stats Cards ── */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`Last: ${lastInterval ? lastInterval + 'ms' : 'none'}, Average: ${avg ? avg + 'ms' : 'none'}, Best: ${best ? best + 'ms' : 'none'}`}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}
        >
          {[
            { value: lastInterval ? `${lastInterval}ms` : '—', label: 'Last Interval', color: 'var(--neon-cyan)'   },
            { value: avg          ? `${avg}ms`          : '—', label: 'Average',       color: 'var(--neon-green)'  },
            { value: best         ? `${best}ms`         : '—', label: 'Best',          color: 'var(--neon-orange)' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '1.25rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Click Zone ── */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Double-click zone — click twice quickly to measure your speed"
          onClick={handleClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
          onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'; }}
          onMouseUp  ={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)';   }}
          style={{
            width: '100%', minHeight: '250px',
            background: 'var(--bg-card)', border: '2px solid var(--border)',
            borderRadius: '16px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '1rem', userSelect: 'none', marginBottom: '1.5rem',
            transition: 'all 0.1s ease',
          }}
        >
          <span style={{ fontSize: '3rem' }} aria-hidden="true">🖱️</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>
            {status || 'Click twice quickly!'}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Double-click within {THRESHOLD_MS}ms
          </span>
          {lastRating && lastInterval !== null && (
            <div style={{
              padding: '0.4rem 1rem', borderRadius: '50px',
              background: `${lastRating.color}15`,
              border: `1px solid ${lastRating.color}30`,
              color: lastRating.color, fontWeight: '700',
            }}>
              {lastRating.label}
            </div>
          )}
        </div>

        {/* ── Results ── */}
        {results.length > 0 && (
          <section
            aria-label="Click interval history"
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem',
            }}
          >
            <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.85rem', color: 'var(--neon-cyan)' }}>
              📊 Results ({results.length})
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {results.map((r, i) => (
                <div
                  key={i}
                  aria-label={`${getRating(r).label.replace(/[^\w\s]/g, '')} — ${r}ms`}
                  style={{
                    padding: '0.3rem 0.75rem', borderRadius: '6px',
                    background: i === 0 ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${i === 0 ? 'var(--neon-cyan)' : 'var(--border)'}`,
                    fontSize: '0.8rem', fontWeight: '700',
                    color: getRating(r).color,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {r}ms
                </div>
              ))}
            </div>
          </section>
        )}

        <button
          className="btn btn-secondary"
          onClick={handleReset}
          aria-label="Reset all results"
        >
          🔄 Reset
        </button>

        {/* ── SEO Article ── */}
        <article style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '2rem', marginTop: '2.5rem',
        }}>
          <section style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.75' }}>

            <h2 style={{ fontWeight: '700', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '0' }}>
              What is a Double Click Test and Why Does It Matter?
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              A <strong>Double Click Test</strong> is a specialized speed and hardware benchmarking utility that measures the precise millisecond (ms) delay between two consecutive mouse presses. Operating systems and video games rely on this threshold to register context menus or inventory selections. Testing your speed ensures your mouse switches operate at maximum efficiency.
            </p>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
              How the Double Click Speed Rating Scale Works
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              Human reflex and hardware delay combine to form your final score. Understanding your speed metric allows you to optimize OS settings or gauge gaming reflexes:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '0.6rem' }}>
                <strong style={{ color: 'var(--neon-red)' }}>🔥 Lightning (&lt;80ms):</strong> Elite reflex speed. Often achieved by competitive gamers using high-performance optical switches with minimal de-bounce delay.
              </li>
              <li style={{ marginBottom: '0.6rem' }}>
                <strong style={{ color: 'var(--neon-orange)' }}>⚡ Fast (80–150ms):</strong> Excellent mechanical performance. Perfect for snappy productivity workflows and rapid execution queues.
              </li>
              <li style={{ marginBottom: '0.6rem' }}>
                <strong style={{ color: 'var(--neon-green)' }}>✅ Normal (150–250ms):</strong> The global human average benchmark. Ideal for everyday web browsing and standard application usage.
              </li>
              <li style={{ marginBottom: '0.6rem' }}>
                <strong style={{ color: 'var(--text-muted)' }}>🐢 Slow (&gt;250ms):</strong> May cause software applications to misinterpret double-clicks as two separate individual actions.
              </li>
            </ul>

            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
              Diagnosing Mouse Double-Clicking Hardware Issues
            </h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Registering unexpected double-clicks when pressing only once? This tester also serves as a hardware diagnostic. Over time, copper mechanical leaf-spring switches (like Omron) oxidize or lose tension, causing <em>switch chatter</em>. Intervals of <strong>5–30ms</strong> without intentional double-clicking typically indicate switch degradation or a de-bounce filter that needs adjustment.
            </p>

            {/* FAQ — Schema.org FAQPage markup */}
            <div
              itemScope
              itemType="https://schema.org/FAQPage"
              style={{
                marginTop: '2.5rem', background: 'rgba(0,0,0,0.2)',
                borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)',
              }}
            >
              <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', marginTop: '0' }}>
                Frequently Asked Questions (FAQs)
              </h3>

              {FAQS.map(({ q, a }, i) => (
                <div
                  key={i}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                  style={{ marginBottom: i < FAQS.length - 1 ? '1.25rem' : 0 }}
                >
                  <h4 itemProp="name" style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                    {q}
                  </h4>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text" style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {a}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </section>
        </article>
      </main>
    </>
  );
}
