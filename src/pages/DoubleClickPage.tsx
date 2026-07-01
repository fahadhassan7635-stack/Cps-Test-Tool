import { useState, useRef } from 'react';

export default function DoubleClickPage() {
  const [results, setResults] = useState<number[]>([]);
  const [lastInterval, setLastInterval] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const lastClick = useRef<number>(0);
  const THRESHOLD = 500; // ms for double click

  const handleClick = () => {
    const now = performance.now();
    const diff = now - lastClick.current;

    if (lastClick.current > 0 && diff < THRESHOLD) {
      setLastInterval(Math.round(diff));
      setResults(prev => [Math.round(diff), ...prev.slice(0, 19)]);
      setStatus(`✅ Double click! ${Math.round(diff)}ms interval`);
      lastClick.current = 0;
    } else {
      lastClick.current = now;
      setStatus('🖱️ Click again quickly!');
      setTimeout(() => {
        if (performance.now() - lastClick.current >= THRESHOLD) {
          setStatus('⏱️ Too slow — try again!');
          lastClick.current = 0;
        }
      }, THRESHOLD);
    }
  };

  const avg = results.length > 0 ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : null;
  const best = results.length > 0 ? Math.min(...results) : null;

  const getRating = (ms: number) => {
    if (ms < 80) return { label: '🔥 Lightning', color: 'var(--neon-red)' };
    if (ms < 150) return { label: '⚡ Fast', color: 'var(--neon-orange)' };
    if (ms < 250) return { label: '✅ Normal', color: 'var(--neon-green)' };
    return { label: '🐢 Slow', color: 'var(--text-secondary)' };
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Mouse Tool</div>
        <h1 className="tool-title">Double Click Test</h1>
        <p className="tool-subtitle">Test how fast you can double-click your mouse</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { value: lastInterval ? `${lastInterval}ms` : '—', label: 'Last Interval', color: 'var(--neon-cyan)' },
          { value: avg ? `${avg}ms` : '—', label: 'Average', color: 'var(--neon-green)' },
          { value: best ? `${best}ms` : '—', label: 'Best', color: 'var(--neon-orange)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Click zone */}
      <div
        onClick={handleClick}
        style={{
          width: '100%', minHeight: '250px',
          background: 'var(--bg-card)', border: '2px solid var(--border)',
          borderRadius: '16px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '1rem', userSelect: 'none', marginBottom: '1.5rem',
          transition: 'all 0.1s ease',
        }}
        onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'; }}
        onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        <span style={{ fontSize: '3rem' }}>🖱️</span>
        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>
          {status || 'Click twice quickly!'}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Double-click within {THRESHOLD}ms
        </span>
        {lastInterval && (
          <div style={{
            padding: '0.4rem 1rem', borderRadius: '50px',
            background: `${getRating(lastInterval).color}15`,
            border: `1px solid ${getRating(lastInterval).color}30`,
            color: getRating(lastInterval).color, fontWeight: '700',
          }}>{getRating(lastInterval).label}</div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.85rem', color: 'var(--neon-cyan)' }}>📊 Results ({results.length})</div>
          <div style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {results.map((r, i) => (
              <div key={i} style={{
                padding: '0.3rem 0.75rem', borderRadius: '6px',
                background: i === 0 ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${i === 0 ? 'var(--neon-cyan)' : 'var(--border)'}`,
                fontSize: '0.8rem', fontWeight: '700',
                color: getRating(r).color,
              }}>{r}ms</div>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-secondary" onClick={() => { setResults([]); setLastInterval(null); setStatus(''); lastClick.current = 0; }}>
        🔄 Reset
      </button>

      {/* ================= SEO ARTICLE SECTION START ================= */}
      <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '3rem 0' }} />
        <section style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.75' }}>
          <h2 style={{ fontWeight: '700', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '0' }}>
            What is a Double Click Test and Why is it Crucial?
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            A <strong>Double Click Test</strong> is a specialized speed and hardware benchmarking utility used to measure the precise millisecond (ms) response delay between two consecutive mouse presses. OS operating systems and video games rely on this preset threshold to register context menus or inventory selections. Testing your speed ensures your mouse switches operate at maximum efficiency.
          </p>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            How the Double Click Speed Ranking Scale Works
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Human reflex and hardware delay combine to form your final score. Understanding your speed metric allows you to optimize operating system options or gauge gaming reflexes:
          </p>

          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong style={{ color: 'var(--neon-red)' }}>⚡ Lightning (&lt; 80ms):</strong> Elite reflex speed. Often achieved by competitive gamers using high-performance optical switches with minimal de-bounce delay.
            </li>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong style={{ color: 'var(--neon-orange)' }}>🚀 Fast (80ms - 150ms):</strong> Excellent mechanical performance. Perfect for snappy productivity mapping and rapid execution queues.
            </li>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong style={{ color: 'var(--neon-green)' }}>✅ Normal (150ms - 250ms):</strong> The global human average benchmark. Ideal for everyday web browsing and standard application usage.
            </li>
            <li style={{ marginBottom: '0.6rem' }}>
              <strong style={{ color: 'var(--text-muted)' }}>🐢 Slow (&gt; 250ms):</strong> Leisurely clicking paste. Might cause software applications to misinterpret double-clicks as two separate individual actions.
            </li>
          </ul>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            Diagnosing Mouse Double-Clicking Hardware Issues
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Are you registering unexpected double clicks when pressing your mouse button only once? This web tester serves as an excellent diagnostic tool for mouse degradation. Over time, traditional copper mechanical leaf-spring switches (like Omron switches) oxidize or lose structural tension, causing a phenomenon called <em>switch chatter</em>. If you record abnormally low intervals like <strong>5ms to 30ms</strong> without meaning to click twice, your peripheral is likely experiencing hardware malfunction or requires an adjusted de-bounce filter.
          </p>

          {/* FAQ Section */}
          <div style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', marginTop: '0' }}>
              Frequently Asked Questions (FAQs)
            </h3>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                What is the typical default double click window in Windows/macOS?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Most mainstream platforms use a default threshold of <strong>500ms</strong>. If your interval exceeds this value, the operating system registers the input as two single clicks rather than a consolidated action.
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                How do optical mouse switches protect against accidental double-clicks?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Unlike traditional copper plates, optical mouse switches utilize a light beam to detect activation. This completely eliminates physical bounce issues, providing consistent, clean click speeds.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                How do I fix a mouse that double-clicks on its own?
              </h4>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                You can fix this by updating your mouse configuration drivers, increasing the "De-bounce time" in your proprietary peripheral software (such as Logitech G Hub or Razer Synapse), or using compressed air to clear trapped dust beneath the shell casing.
              </p>
            </div>
          </div>
        </section>
      {/* ================= SEO ARTICLE SECTION END ================= */}
    </div>
  );
}
