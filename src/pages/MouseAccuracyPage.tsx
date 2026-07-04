import { useState, useRef, useCallback, useEffect } from 'react';

type ButtonId = 'left' | 'right' | 'middle' | 'back' | 'forward' | 'dpi';
type ButtonStatus = 'idle' | 'down' | 'tested';
type ScrollDir = 'up' | 'down' | null;

interface LogEntry {
  id: number;
  label: string;
  time: string;
}

const BUTTON_LABELS: Record<ButtonId, string> = {
  left: 'Left Click',
  right: 'Right Click',
  middle: 'Middle Click',
  back: 'Back Button',
  forward: 'Forward Button',
  dpi: 'DPI / Sensitivity Button',
};

const initialCounts: Record<ButtonId, number> = { left: 0, right: 0, middle: 0, back: 0, forward: 0, dpi: 0 };
const initialStatus: Record<ButtonId, ButtonStatus> = { left: 'idle', right: 'idle', middle: 'idle', back: 'idle', forward: 'idle', dpi: 'idle' };

function nowStamp(): string {
  return new Date().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
    '.' + String(new Date().getMilliseconds()).padStart(3, '0');
}

function useSoundEngine(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, dur: number, gain: number) => {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = type;
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(gain, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.start(now); osc.stop(now + dur);
    } catch {}
  }, [enabled, getCtx]);

  const TONES: Record<ButtonId, number> = { left: 700, right: 500, middle: 600, back: 420, forward: 460, dpi: 900 };

  return {
    button: (id: ButtonId) => playTone(TONES[id], 'sine', 0.08, 0.22),
    scroll: (dir: ScrollDir) => playTone(dir === 'up' ? 820 : 380, 'square', 0.05, 0.12),
  };
}

function Breadcrumb() {
  const items: [string, string | null][] = [
    ['Home', '/'], ['Tools', '/tools'], ['Mouse Button Test', null],
  ];
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '1rem' }}>
      <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted,#888)' }}>
        {items.map(([label, href], i) => (
          <li key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {href
              ? <a href={href} style={{ color: 'var(--neon-cyan,#00f5ff)', textDecoration: 'none' }}>{label}</a>
              : <span aria-current="page" style={{ color: '#fff' }}>{label}</span>}
            {i < items.length - 1 && <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function SEOHead() {
  useEffect(() => {
    document.title = 'Mouse Button Test — Check Left, Right, Middle & Scroll Clicks Online';
    const setMeta = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };
    const desc = 'Test every button on your mouse — left click, right click, middle click, scroll wheel, and back/forward side buttons — instantly in your browser.';
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', 'Mouse Button Test');
    setMeta('meta[property="og:description"]', 'content', desc);
  }, []);
  return null;
}

export default function MouseButtonTestPage() {
  const [status, setStatus] = useState<Record<ButtonId, ButtonStatus>>(initialStatus);
  const [counts, setCounts] = useState<Record<ButtonId, number>>(initialCounts);
  const [scrollDir, setScrollDir] = useState<ScrollDir>(null);
  const [scrollCounts, setScrollCounts] = useState({ up: 0, down: 0 });
  const [dblClickGap, setDblClickGap] = useState<number | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sfx = useSoundEngine(soundEnabled);

  const logIdRef = useRef(0);
  const lastClickRef = useRef<number>(0);
  const scrollResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const padRef = useRef<HTMLDivElement>(null);

  const pushLog = useCallback((label: string) => {
    const id = ++logIdRef.current;
    setLog(prev => [{ id, label, time: nowStamp() }, ...prev].slice(0, 12));
  }, []);

  const markButton = useCallback((id: ButtonId, label: string) => {
    setStatus(prev => ({ ...prev, [id]: 'down' }));
    setCounts(prev => ({ ...prev, [id]: prev[id] + 1 }));
    pushLog(label);
    sfx.button(id);
    setTimeout(() => setStatus(prev => (prev[id] === 'down' ? { ...prev, [id]: 'tested' } : prev)), 260);
  }, [pushLog, sfx]);

  const onPadMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (e.button === 0) {
      const gap = now - lastClickRef.current;
      if (gap < 500 && lastClickRef.current !== 0) setDblClickGap(gap);
      lastClickRef.current = now;
      markButton('left', 'Left click');
    } else if (e.button === 1) {
      markButton('middle', 'Middle click');
    } else if (e.button === 2) {
      markButton('right', 'Right click');
    } else if (e.button === 3) {
      markButton('back', 'Back button');
    } else if (e.button === 4) {
      markButton('forward', 'Forward button');
    } else if (e.button >= 5) {
      // Extra hardware buttons (DPI/sensitivity switch on many gaming mice) sometimes
      // surface here depending on driver/OS. Best-effort detection.
      markButton('dpi', 'DPI / Sensitivity button');
    }
  }, [markButton]);

  const onPadContextMenu = useCallback((e: React.MouseEvent) => { e.preventDefault(); }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const dir: ScrollDir = e.deltaY > 0 ? 'down' : 'up';
    setScrollDir(dir);
    setScrollCounts(prev => ({ ...prev, [dir]: prev[dir] + 1 }));
    pushLog(`Scroll ${dir}`);
    sfx.scroll(dir);
    if (scrollResetRef.current) clearTimeout(scrollResetRef.current);
    scrollResetRef.current = setTimeout(() => setScrollDir(null), 350);
  }, [pushLog, sfx]);

  useEffect(() => {
    const el = padRef.current;
    if (!el) return;
    const preventNav = (e: MouseEvent) => { if (e.button === 3 || e.button === 4) e.preventDefault(); };
    // React's synthetic onWheel is attached as a passive listener, so preventDefault()
    // inside it is silently ignored and the page still scrolls underneath the pad.
    // A native listener with { passive: false } is required to actually lock scrolling.
    el.addEventListener('mouseup', preventNav);
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('mouseup', preventNav);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const reset = useCallback(() => {
    setStatus(initialStatus); setCounts(initialCounts);
    setScrollDir(null); setScrollCounts({ up: 0, down: 0 });
    setDblClickGap(null); setLog([]); lastClickRef.current = 0;
  }, []);

  const totalClicks = Object.values(counts).reduce((a, b) => a + b, 0);
  const buttonsTested = (Object.keys(status) as ButtonId[]).filter(k => status[k] !== 'idle').length;

  const dotColor = (id: ButtonId) => status[id] === 'down' ? '#fbbf24' : status[id] === 'tested' ? '#10b981' : 'rgba(255,255,255,0.12)';
  const glow = (id: ButtonId) => status[id] === 'down' ? '0 0 16px #fbbf24' : status[id] === 'tested' ? '0 0 12px #10b981' : 'none';

  // Fill/glow for the SVG mouse diagram regions — same idle/down/tested language as the dots above
  const regionFill = (id: ButtonId) =>
    status[id] === 'down' ? '#fbbf24' : status[id] === 'tested' ? '#10b981' : '#e5e7eb';
  const regionFilter = (id: ButtonId) =>
    status[id] === 'down' ? 'drop-shadow(0 0 10px #fbbf24)' : status[id] === 'tested' ? 'drop-shadow(0 0 8px #10b981)' : 'none';
  const wheelFill = scrollDir ? '#fbbf24' : status.middle !== 'idle' ? regionFill('middle') : '#3f3f46';
  const wheelFilter = scrollDir ? 'drop-shadow(0 0 10px #fbbf24)' : regionFilter('middle');

  return (
    <>
      <SEOHead />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Breadcrumb />

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="section-label">Mouse Tool</div>
          <h1 className="tool-title">Mouse Button Test</h1>
          <p className="tool-subtitle">Click inside the pad below with each button on your mouse, and scroll the wheel, to confirm they register correctly.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <button
            onClick={() => setSoundEnabled(v => !v)}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Disable click sounds' : 'Enable click sounds'}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.35rem 0.65rem', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            {soundEnabled ? '🔊' : '🔇'} {soundEnabled ? 'Sound On' : 'Sound Off'}
          </button>
        </div>

        {/* Live stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          {[
            { label: 'Buttons Tested', value: `${buttonsTested}/6`, color: 'var(--neon-cyan,#00f5ff)' },
            { label: 'Total Clicks', value: totalClicks, color: 'var(--neon-purple,#a855f7)' },
            { label: 'Scroll Events', value: scrollCounts.up + scrollCounts.down, color: '#f97316' },
            { label: 'Double-Click Gap', value: dblClickGap !== null ? `${dblClickGap}ms` : '—', color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.15rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {/* Test pad */}
          <div
            ref={padRef}
            onMouseDown={onPadMouseDown}
            onContextMenu={onPadContextMenu}
            role="application"
            aria-label="Mouse test pad. Click and scroll here to test your mouse buttons."
            style={{
              position: 'relative', height: '380px', borderRadius: '16px',
              background: 'var(--bg-card)', border: '2px dashed var(--border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.35rem', cursor: 'crosshair', userSelect: 'none', WebkitUserSelect: 'none', padding: '0.75rem',
              touchAction: 'none', overscrollBehavior: 'contain',
            }}
          >
            <div style={{ position: 'relative', width: '190px', height: '290px' }}>
              <svg
                width="190" height="290" viewBox="0 0 200 320"
                style={{ pointerEvents: 'none', overflow: 'visible', display: 'block' }}
                aria-hidden="true"
              >
              {/* Left click button */}
              <path
                d="M20,85 C20,42 55,14 96,12 L96,150 L20,150 Z"
                fill={regionFill('left')} stroke="#1f2937" strokeWidth="2"
                style={{ filter: regionFilter('left'), transition: 'fill 0.15s ease, filter 0.15s ease' }}
              />
              {/* Right click button */}
              <path
                d="M180,85 C180,42 145,14 104,12 L104,150 L180,150 Z"
                fill={regionFill('right')} stroke="#1f2937" strokeWidth="2"
                style={{ filter: regionFilter('right'), transition: 'fill 0.15s ease, filter 0.15s ease' }}
              />
              {/* Palm rest / body */}
              <path
                d="M20,150 L180,150 L180,255 C180,300 145,315 100,315 C55,315 20,300 20,255 Z"
                fill="#d4d4d8" stroke="#1f2937" strokeWidth="2"
              />
              {/* Back button (side) */}
              <rect
                x="4" y="165" width="20" height="34" rx="8"
                fill={regionFill('back')} stroke="#1f2937" strokeWidth="2"
                style={{ filter: regionFilter('back'), transition: 'fill 0.15s ease, filter 0.15s ease' }}
              />
              {/* Forward button (side) */}
              <rect
                x="4" y="207" width="20" height="34" rx="8"
                fill={regionFill('forward')} stroke="#1f2937" strokeWidth="2"
                style={{ filter: regionFilter('forward'), transition: 'fill 0.15s ease, filter 0.15s ease' }}
              />
              {/* Scroll wheel housing */}
              <rect x="86" y="18" width="28" height="100" rx="14" fill="#18181b" stroke="#1f2937" strokeWidth="2" />
              <rect
                x="90" y="26" width="20" height="84" rx="10"
                fill={wheelFill} style={{ filter: wheelFilter, transition: 'fill 0.15s ease, filter 0.15s ease' }}
              />
              {/* Scroll direction arrows */}
              <path d="M100,30 L94,40 L106,40 Z" fill={scrollDir === 'up' ? '#1f2937' : 'rgba(255,255,255,0.35)'} />
              <path d="M100,106 L94,96 L106,96 Z" fill={scrollDir === 'down' ? '#1f2937' : 'rgba(255,255,255,0.35)'} />
              {/* DPI / sensitivity button, sitting between the wheel and the palm rest.
                  Purely visual here — the actual click target is the HTML button overlaid on top,
                  which is far more reliable to hit than a pointer-events override on a nested SVG shape. */}
              <rect
                x="88" y="123" width="24" height="22" rx="6"
                fill={regionFill('dpi')} stroke="#1f2937" strokeWidth="2"
                style={{ filter: regionFilter('dpi'), transition: 'fill 0.15s ease, filter 0.15s ease' }}
              />
              </svg>
              {/* Real HTML button overlaid exactly on the DPI square above — reliable click/tap target */}
              <button
                onPointerDown={e => { e.stopPropagation(); e.preventDefault(); markButton('dpi', 'DPI / Sensitivity button'); }}
                onContextMenu={e => e.preventDefault()}
                aria-label="Test DPI or sensitivity button"
                title="Test DPI / sensitivity button"
                style={{
                  position: 'absolute',
                  left: `${(88 / 200) * 100}%`,
                  top: `${(123 / 320) * 100}%`,
                  width: `${(24 / 200) * 100}%`,
                  height: `${(22 / 320) * 100}%`,
                  background: 'transparent', border: 'none', padding: 0, margin: 0,
                  cursor: 'pointer', touchAction: 'none',
                }}
              />
            </div>
            <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem', marginTop: '0.25rem' }}>Click & Scroll Anywhere Here</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '260px' }}>
              The matching part lights up the moment you press it. Scrolling stays locked inside this box.
            </span>
          </div>

          {/* Button status diagram */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', justifyContent: 'center' }}>
            {(Object.keys(BUTTON_LABELS) as ButtonId[]).map(id => (
              <div key={id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span aria-hidden="true" style={{
                    width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                    background: dotColor(id), boxShadow: glow(id), transition: 'background 0.15s ease, box-shadow 0.15s ease',
                  }} />
                  <span style={{ flex: 1, fontSize: '0.85rem', color: '#fff' }}>{BUTTON_LABELS[id]}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {status[id] === 'idle' ? 'not tested' : `${counts[id]}×`}
                  </span>
                </div>
                {id === 'dpi' && (
                  <p style={{ margin: '0.2rem 0 0 1.65rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Some mice never send this as a normal click — press your DPI button anywhere in the pad, or tap the small square on the diagram directly to confirm it.
                  </p>
                )}
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.3rem', paddingTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span aria-hidden="true" style={{
                width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                background: scrollDir ? '#fbbf24' : 'rgba(255,255,255,0.12)',
                boxShadow: scrollDir ? '0 0 16px #fbbf24' : 'none', transition: 'all 0.15s ease',
              }} />
              <span style={{ flex: 1, fontSize: '0.85rem', color: '#fff' }}>Scroll Wheel</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ↑{scrollCounts.up} / ↓{scrollCounts.down}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={reset}>↺ Reset Test</button>
        </div>

        {/* Event log */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Log</h3>
          {log.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No events yet — click or scroll in the pad above.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '200px', overflowY: 'auto' }}>
              {log.map(entry => (
                <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#ddd', fontFamily: 'monospace' }}>
                  <span>{entry.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{entry.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO Article */}
        <div style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.8' }}>
          <article>
            <h2 style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--neon-cyan,#00f5ff)', marginTop: 0, marginBottom: '0.75rem' }}>What is a Mouse Button Test?</h2>
            <p style={{ marginBottom: '1.25rem' }}>A <strong>Mouse Button Test</strong> checks whether every physical control on your mouse — left click, right click, middle click, scroll wheel, side buttons, and DPI/sensitivity switch — actually reaches your browser and registers as the input it's supposed to. Instead of guessing whether a click "felt" right, this tool logs the exact event the moment it happens, so you can confirm hardware behavior instead of relying on impression.</p>
            <p style={{ marginBottom: '1.25rem' }}>This is especially useful after dropping a mouse, before selling or buying a used one, or when a button has started to feel inconsistent — tests like this catch problems days or weeks before they become obvious during normal use.</p>

            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>How the Test Works</h2>
            <p style={{ marginBottom: '1.25rem' }}>The pad listens directly for browser-level input events rather than simulating anything: <code>mousedown</code> for left, right, and middle clicks, the extended button codes for back and forward, and <code>wheel</code> events for scrolling. The moment an event fires, the matching part of the diagram lights up amber, then settles to green once confirmed — so a press that never arrives simply never lights up, which is itself useful information.</p>
            <p style={{ marginBottom: '1.25rem' }}>Right-click and middle-click are intercepted so the browser's own context menu or auto-scroll icon doesn't interrupt the test, and scrolling is locked to the pad itself so the page underneath doesn't move while you test the wheel.</p>

            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>Common Mouse Button Problems</h2>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
              {[
                ['Double-click chatter', 'A single physical press registers as two clicks. This is almost always worn microswitch contacts inside the button, not a software issue.'],
                ['Unresponsive or "dead" clicks', 'A press that sometimes does nothing at all — often intermittent, worse in cold weather or after long idle periods.'],
                ['Ghost scrolling', 'The wheel reports movement in one direction when scrolled the other way, or skips notches, usually from a worn encoder wheel.'],
                ['Side buttons not detected', 'Back/forward buttons are frequently intercepted by the operating system or browser for page navigation before a website ever sees them.'],
                ['DPI button silence', 'Many DPI/sensitivity buttons are handled entirely inside the mouse\'s own firmware or driver software and were never designed to send a browser-visible event.'],
              ].map(([t, d]) => (
                <li key={t as string} style={{ marginBottom: '0.6rem' }}><strong>{t}</strong> — {d}</li>
              ))}
            </ul>

            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>Fixing a Double-Clicking Mouse</h2>
            <p style={{ marginBottom: '1.25rem' }}>If the left-click counter in this test increases by two for a single press, the microswitch underneath that button has likely worn out — a common failure after a couple of years of regular use. Software debounce settings in some mouse utilities can mask it temporarily, but the permanent fix is replacing the switch or the mouse. Confirm the pattern is consistent (test it 15–20 times) before concluding it's hardware rather than a one-off.</p>

            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginTop: '2rem', marginBottom: '0.75rem' }}>Why Side Buttons Sometimes Don't Show Up</h2>
            <p style={{ marginBottom: 0 }}>Back and forward side buttons are historically mapped to browser navigation, so on some systems the browser consumes the event before a webpage can read it. If those buttons never light up here despite clearly working elsewhere (like navigating back in a browser tab), the hardware is fine — the event just isn't being exposed to the page.</p>
          </article>

          <section aria-label="Frequently Asked Questions" style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--neon-green,#10b981)', marginTop: 0, marginBottom: '1.25rem' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { q: 'Why does my left click count go up by two per press?', a: 'That\'s double-click chatter — a worn microswitch registering one physical press as two clicks. It\'s a hardware issue, not something a browser test can fix, but this tool confirms it\'s happening.' },
                { q: 'My side buttons work in other apps but don\'t light up here — why?', a: 'Browsers and operating systems often reserve back/forward mouse buttons for page navigation and never pass the raw event to the website. The buttons are working; the browser is just intercepting them first.' },
                { q: 'Why doesn\'t my DPI button do anything in the test?', a: 'Most DPI/sensitivity buttons are handled entirely by the mouse\'s own firmware or companion software, so no event ever reaches the browser. Tap the small square directly on the diagram to confirm the visual/sound feedback works, even if the hardware press itself isn\'t detectable.' },
                { q: 'Why did the page scroll before, even when scrolling inside the pad?', a: 'Wheel events are passive by default in most frameworks, so calling preventDefault() on them silently fails unless a non-passive listener is attached. This tool now locks scrolling to the pad specifically to avoid that.' },
                { q: 'Is my mouse broken if a button never lights up here?', a: 'Not necessarily — some buttons (like DPI switches) legitimately never reach the browser. But if left, right, middle, or scroll never register despite repeated tries, that\'s a strong signal of a hardware or driver problem.' },
                { q: 'Does this test store any of my data?', a: 'No — clicks and scroll counts exist only in memory while the page is open and reset the moment you refresh or click "Reset Test."' },
                { q: 'Can I use this on a touchpad or trackball?', a: 'Left, right, and middle click detection works the same way regardless of the pointing device. Scroll and side-button behavior varies more by device and driver.' },
                { q: 'Is this test free?', a: 'Yes — completely free, no account, no installation.' },
              ].map((item, i) => (
                <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.35rem' }}>{item.q}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
