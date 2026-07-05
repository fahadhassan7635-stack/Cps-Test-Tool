import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface DifficultyConfig {
  label: string;
  threshold: number;
  color: string;
}

const DIFFICULTIES: Record<string, DifficultyConfig> = {
  easy:   { label: 'Easy',   threshold: 600, color: 'var(--neon-green)'  },
  normal: { label: 'Normal', threshold: 500, color: 'var(--neon-cyan)'   },
  hard:   { label: 'Hard',   threshold: 350, color: 'var(--neon-orange)' },
  pro:    { label: 'Pro',    threshold: 250, color: 'var(--neon-red)'    },
};

const getRating = (ms: number) => {
  if (ms < 80)  return { label: '🔥 Lightning', color: 'var(--neon-red)'       };
  if (ms < 150) return { label: '⚡ Fast',      color: 'var(--neon-orange)'    };
  if (ms < 250) return { label: '✅ Normal',    color: 'var(--neon-green)'     };
  return              { label: '🐢 Slow',       color: 'var(--text-secondary)' };
};

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
  return Math.round(Math.sqrt(variance));
}

// ─── Sound engine (Web Audio API — no external files needed) ────────────────
function useClickSounds(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return null;
    if (!ctxRef.current) ctxRef.current = new AudioCtxClass();
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const tone = useCallback((freqStart: number, freqEnd: number, duration: number, volume: number, type: OscillatorType = 'sine') => {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
      if (freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), ctx.currentTime + duration * 0.7);
      }
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio blocked or unsupported — fail silently, never break the UI
    }
  }, [enabled, getCtx]);

  const playArm    = useCallback(() => tone(520, 520, 0.06, 0.08, 'square'),  [tone]);
  const playSuccess = useCallback(() => tone(880, 1320, 0.16, 0.16, 'sine'),  [tone]);
  const playFail    = useCallback(() => tone(180, 90,  0.22, 0.12, 'sawtooth'), [tone]);

  return { playArm, playSuccess, playFail };
}

// ─── JSON-LD schemas ──────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: 'What is a Double Click Test?',                              a: 'A Double Click Test measures the millisecond interval between two consecutive mouse clicks to verify your hardware and reflexes can produce a valid double-click within the OS threshold.' },
  { q: 'What is the default double-click speed in Windows?',        a: 'Windows defaults to a 500 ms threshold. You can adjust it in Control Panel → Mouse → Buttons → Double-click speed.' },
  { q: 'What is the default double-click speed on macOS?',          a: 'macOS uses a similar ~500 ms default. Change it in System Preferences → Accessibility → Pointer Control → Double-click speed.' },
  { q: 'How do I change double-click speed on Linux?',              a: 'On GNOME, use: gsettings set org.gnome.desktop.peripherals.mouse double-click <ms>. KDE users can adjust it in System Settings → Input Devices → Mouse.' },
  { q: 'What interval is considered a fast double click?',          a: 'Intervals below 150 ms are considered fast. Elite competitive gamers often achieve under 80 ms with optical-switch mice.' },
  { q: 'Can I use this tool on mobile?',                            a: 'Yes. The tap zone works on touchscreen devices. Results may differ slightly from desktop mouse clicks due to touch debounce in mobile browsers.' },
  { q: 'What browsers are supported?',                              a: 'All modern browsers supporting performance.now() are supported: Chrome, Firefox, Safari, Edge, and Opera.' },
  { q: 'Does this test collect my data?',                           a: 'No. All calculations run entirely in your browser. No click data is transmitted to any server.' },
  { q: 'What is switch chatter?',                                   a: 'Switch chatter is a hardware defect where a worn mechanical switch bounces and registers multiple electrical contacts from a single physical press, causing unwanted double-clicks.' },
  { q: 'How do optical switches prevent double-clicking bugs?',     a: 'Optical switches use a light beam rather than physical metal contact, eliminating bounce entirely and providing consistent actuation every time.' },
  { q: 'What is CPS and how does it differ from double-click speed?', a: 'CPS (Clicks Per Second) measures raw click frequency over a time period. Double-click speed measures the precise interval between exactly two consecutive clicks.' },
  { q: 'What is drag clicking?',                                    a: 'Drag clicking is a technique where you drag your finger across the mouse button to generate friction, registering multiple clicks per press. It produces very high CPS but is banned on many Minecraft servers.' },
  { q: 'What is jitter clicking?',                                  a: 'Jitter clicking involves tensing your arm muscles rapidly to vibrate the finger on the button. It differs from a measured double-click which requires exactly two intentional presses.' },
  { q: 'What is the best double-click speed for gaming?',           a: 'For most games, 80–150 ms is ideal. It is fast enough to execute rapid actions without risking misregistration from the operating system.' },
  { q: 'How do I fix a mouse that double-clicks on its own?',       a: 'Try increasing the debounce time in your mouse software, cleaning the switch with contact cleaner, or replacing the switch. A firmware update may also resolve the issue.' },
  { q: 'Does a higher polling rate improve double-click accuracy?', a: 'A higher polling rate (e.g., 1000 Hz vs 125 Hz) reduces input latency, which can result in more accurate interval measurements but does not directly change your physical reflex speed.' },
  { q: 'Is double-click testing accurate in a browser?',            a: 'Browser accuracy is within 1–4 ms due to the performance.now() API. System load and browser background tasks can introduce minor variance.' },
  { q: 'Can accessibility settings affect double-click speed?',     a: 'Yes. Many accessibility tools modify double-click thresholds to assist users with motor impairments. Check your OS accessibility panel if results seem inconsistent.' },
  { q: 'What is the average human double-click interval?',          a: 'The average person double-clicks within 200–300 ms. Trained gamers typically achieve 80–150 ms, while elite players can reach under 80 ms.' },
  { q: 'What mouse switches last the longest?',                     a: 'Optical switches have no mechanical wear and are rated for 100 million+ clicks. Traditional Omron mechanical switches are rated for 20–50 million clicks before chatter risk increases.' },
  { q: 'Why does this test play a sound when I click?',             a: 'A short tone plays on the first click, a rising chime confirms a successful double-click, and a low buzz plays on a failed attempt — giving you audio feedback without needing to watch the screen.' },
  { q: 'Can I turn off the click sounds?',                          a: 'Yes. Use the sound toggle above the test zone to mute or unmute the audio feedback at any time; your preference is remembered for the rest of the session.' },
  { q: 'Does a trackpad give different results than a mouse?',      a: 'Yes. Trackpads use capacitive touch sensing and firmware-level tap debouncing, which typically produces slightly slower and less consistent double-click intervals compared to a dedicated mouse switch.' },
  { q: 'Is there a world record for double-click speed?',           a: 'There is no single certified world record, but community leaderboards on gaming forums have documented verified double-clicks in the 20–40 ms range using optical switches and high-speed capture equipment.' },
  { q: 'Why do my results vary so much between attempts?',          a: 'Human reflex timing naturally fluctuates due to fatigue, focus, and micro-variations in muscle activation. A high standard deviation in your results panel indicates inconsistent timing between attempts.' },
  { q: 'Does double-click speed decline with age?',                 a: 'Reaction time and fine motor precision generally slow gradually after the mid-20s, so average double-click intervals tend to increase slightly with age, though practice and hardware can offset much of this.' },
  { q: 'Can I use this test to benchmark a new mouse before buying?', a: 'Many retailers offer return windows, so testing a new mouse here immediately after unboxing is a quick way to confirm the switches are not chattering before the return period expires.' },
];

const buildSchemas = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Double Click Test',
    url: 'https://www.clickspeedtest.io/double-click-test',
    description: 'Test how fast you can double-click your mouse. Measure your double-click interval in milliseconds and diagnose mouse hardware issues.',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Click Speed Test',
    url: 'https://www.clickspeedtest.io',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.clickspeedtest.io/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',              item: 'https://www.clickspeedtest.io' },
      { '@type': 'ListItem', position: 2, name: 'Double Click Test', item: 'https://www.clickspeedtest.io/double-click-test' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
];

// ─── SEO head injection (no next/head needed) ─────────────────────────────────
function useSEOHead() {
  useEffect(() => {
    // Title
    document.title = 'Double Click Test — Measure Your Double-Click Speed in ms';

    const setMeta = (sel: string, attr: string, val: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(sel);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
    };

    setMeta('meta[name="description"]',         'name',     'description',         'Free online Double Click Test. Measure the millisecond interval between two mouse clicks, diagnose double-click hardware issues, and compare your speed with global averages.');
    setMeta('meta[name="robots"]',              'name',     'robots',              'index, follow');
    setMeta('meta[name="theme-color"]',         'name',     'theme-color',         '#00f5ff');
    setMeta('meta[property="og:title"]',        'property', 'og:title',            'Double Click Test — Measure Your Double-Click Speed in ms');
    setMeta('meta[property="og:description"]',  'property', 'og:description',      'Test your double-click interval in milliseconds. Diagnose mouse hardware problems, compare difficulty levels, and track your stats.');
    setMeta('meta[property="og:image"]',        'property', 'og:image',            'https://www.clickspeedtest.io/og-double-click.png');
    setMeta('meta[property="og:url"]',          'property', 'og:url',              'https://www.clickspeedtest.io/double-click-test');
    setMeta('meta[property="og:type"]',         'property', 'og:type',             'website');
    setMeta('meta[name="twitter:card"]',        'name',     'twitter:card',        'summary_large_image');
    setMeta('meta[name="twitter:title"]',       'name',     'twitter:title',       'Double Click Test — Measure Your Double-Click Speed in ms');
    setMeta('meta[name="twitter:description"]', 'name',     'twitter:description', 'Free browser tool to measure your double-click speed. No download required.');
    setMeta('meta[name="twitter:image"]',       'name',     'twitter:image',       'https://www.clickspeedtest.io/og-double-click.png');

    setLink('canonical',      'https://www.clickspeedtest.io/double-click-test');
    setLink('icon',           '/favicon.ico');
    setLink('apple-touch-icon', '/apple-touch-icon.png');

    // JSON-LD schemas
    const schemaId = 'double-click-schemas';
    let schemaEl = document.getElementById(schemaId);
    if (!schemaEl) {
      schemaEl = document.createElement('script');
      schemaEl.id = schemaId;
      schemaEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaEl);
    }
    schemaEl.textContent = JSON.stringify(buildSchemas());
  }, []);
}

// ─── Ripple Component ─────────────────────────────────────────────────────────
interface Ripple { id: number; x: number; y: number }

function RippleEffect({ ripples }: { ripples: Ripple[] }) {
  return (
    <>
      {ripples.map(r => (
        <span
          key={r.id}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--neon-cyan)',
            transform: 'translate(-50%, -50%) scale(0)',
            animation: 'rippleExpand 0.6s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DoubleClickPage() {
  useSEOHead();

  const [results, setResults]           = useState<number[]>([]);
  const [lastInterval, setLastInterval] = useState<number | null>(null);
  const [status, setStatus]             = useState('');
  const [difficulty, setDifficulty]     = useState<string>('normal');
  const [successAnim, setSuccessAnim]   = useState(false);
  const [ripples, setRipples]           = useState<Ripple[]>([]);
  const [soundOn, setSoundOn]           = useState(true);
  const [openFaq, setOpenFaq]           = useState<number | null>(null);
  const [stats, setStats]               = useState({
    totalAttempts: 0,
    successes:     0,
    failures:      0,
    currentStreak: 0,
    bestStreak:    0,
  });

  const { playArm, playSuccess, playFail } = useClickSounds(soundOn);

  const lastClick = useRef<number>(0);
  const rippleId  = useRef(0);
  const zoneRef   = useRef<HTMLDivElement>(null);

  const THRESHOLD = DIFFICULTIES[difficulty].threshold;

  // Inject animation keyframes once
  useEffect(() => {
    const id = 'double-click-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes rippleExpand {
        0%   { transform: translate(-50%,-50%) scale(0);  opacity: 0.8; }
        100% { transform: translate(-50%,-50%) scale(18); opacity: 0;   }
      }
      @keyframes successPulse {
        0%   { box-shadow: 0 0 0px  0px rgba(0,245,255,0);    transform: scale(1);     }
        30%  { box-shadow: 0 0 32px 12px rgba(0,245,255,0.35); transform: scale(1.025); }
        60%  { box-shadow: 0 0 18px 6px  rgba(0,245,255,0.18); transform: scale(1.01);  }
        100% { box-shadow: 0 0 0px  0px rgba(0,245,255,0);    transform: scale(1);     }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const triggerSuccess = useCallback((clientX: number, clientY: number) => {
    setSuccessAnim(true);
    setTimeout(() => setSuccessAnim(false), 700);

    if (zoneRef.current) {
      const rect = zoneRef.current.getBoundingClientRect();
      const id   = ++rippleId.current;
      setRipples(prev => [...prev, { id, x: clientX - rect.left, y: clientY - rect.top }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 650);
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const now  = performance.now();
    const diff = now - lastClick.current;

    if (lastClick.current > 0 && diff < THRESHOLD) {
      const ms = Math.round(diff);
      setLastInterval(ms);
      setResults(prev => [ms, ...prev.slice(0, 19)]);
      setStatus(`✅ Double click! ${ms}ms interval`);
      lastClick.current = 0;
      triggerSuccess(e.clientX, e.clientY);
      playSuccess();
      setStats(prev => {
        const newStreak = prev.currentStreak + 1;
        return {
          ...prev,
          totalAttempts: prev.totalAttempts + 1,
          successes:     prev.successes + 1,
          currentStreak: newStreak,
          bestStreak:    Math.max(prev.bestStreak, newStreak),
        };
      });
    } else {
      if (lastClick.current > 0) {
        setStats(prev => ({
          ...prev,
          totalAttempts: prev.totalAttempts + 1,
          failures:      prev.failures + 1,
          currentStreak: 0,
        }));
      }
      lastClick.current = now;
      setStatus('🖱️ Click again quickly!');
      playArm();
      setTimeout(() => {
        if (performance.now() - lastClick.current >= THRESHOLD) {
          setStatus('⏱️ Too slow — try again!');
          lastClick.current = 0;
          playFail();
        }
      }, THRESHOLD);
    }
  }, [THRESHOLD, triggerSuccess, playArm, playSuccess, playFail]);

  const handleReset = () => {
    setResults([]);
    setLastInterval(null);
    setStatus('');
    lastClick.current = 0;
    setStats({ totalAttempts: 0, successes: 0, failures: 0, currentStreak: 0, bestStreak: 0 });
  };

  // Derived stats
  const avg         = results.length > 0 ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : null;
  const best        = results.length > 0 ? Math.min(...results) : null;
  const successRate = stats.totalAttempts > 0 ? Math.round((stats.successes / stats.totalAttempts) * 100) : 0;
  const medianVal   = results.length > 0 ? median(results) : null;
  const slowest     = results.length > 0 ? Math.max(...results) : null;
  const stdDevVal   = results.length > 0 ? stdDev(results) : null;

  const diffConfig = DIFFICULTIES[difficulty];

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Mouse Tool</div>
        <h1 className="tool-title">Double Click Test</h1>
        <p className="tool-subtitle">Test how fast you can double-click your mouse</p>
      </div>

      {/* ─── Difficulty Selector ─────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
            Difficulty — Current threshold:{' '}
            <span style={{ color: diffConfig.color }}>{THRESHOLD}ms</span>
          </div>
          <button
            onClick={() => setSoundOn(s => !s)}
            aria-label={soundOn ? 'Mute click sounds' : 'Unmute click sounds'}
            style={{
              padding:      '0.3rem 0.7rem',
              borderRadius: '8px',
              border:       `1.5px solid ${soundOn ? 'var(--neon-cyan)' : 'var(--border)'}`,
              background:   soundOn ? 'rgba(0,245,255,0.1)' : 'var(--bg-card)',
              color:        soundOn ? 'var(--neon-cyan)' : 'var(--text-muted)',
              fontWeight:   '700',
              fontSize:     '0.78rem',
              cursor:       'pointer',
            }}
          >
            {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.entries(DIFFICULTIES).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setDifficulty(key)}
              style={{
                padding:    '0.45rem 1.1rem',
                borderRadius: '8px',
                border:     `1.5px solid ${difficulty === key ? cfg.color : 'var(--border)'}`,
                background: difficulty === key ? `${cfg.color}18` : 'var(--bg-card)',
                color:      difficulty === key ? cfg.color : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize:   '0.82rem',
                cursor:     'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Top Stats ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { value: lastInterval ? `${lastInterval}ms` : '—', label: 'Last Interval', color: 'var(--neon-cyan)'   },
          { value: avg          ? `${avg}ms`          : '—', label: 'Average',       color: 'var(--neon-green)'  },
          { value: best         ? `${best}ms`         : '—', label: 'Best',          color: 'var(--neon-orange)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Click Zone ──────────────────────────────────────────────── */}
      <div
        ref={zoneRef}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Double click test zone"
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as unknown as React.MouseEvent<HTMLDivElement>); }}
        style={{
          position:      'relative',
          overflow:      'hidden',
          width:         '100%',
          minHeight:     '250px',
          background:    'var(--bg-card)',
          border:        `2px solid ${successAnim ? 'var(--neon-cyan)' : 'var(--border)'}`,
          borderRadius:  '16px',
          cursor:        'pointer',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          justifyContent:'center',
          gap:           '1rem',
          userSelect:    'none',
          marginBottom:  '1.5rem',
          animation:     successAnim ? 'successPulse 0.7s ease-out' : 'none',
          transition:    'border-color 0.2s ease',
        }}
        onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'; }}
        onMouseUp={e =>   { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        <RippleEffect ripples={ripples} />
        <span style={{ fontSize: '3rem', position: 'relative', zIndex: 1 }}>🖱️</span>
        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-cyan)', position: 'relative', zIndex: 1 }}>
          {status || 'Click twice quickly!'}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', position: 'relative', zIndex: 1 }}>
          Double-click within {THRESHOLD}ms
        </span>
        {lastInterval && (
          <div style={{
            padding:    '0.4rem 1rem',
            borderRadius: '50px',
            background: `${getRating(lastInterval).color}15`,
            border:     `1px solid ${getRating(lastInterval).color}30`,
            color:      getRating(lastInterval).color,
            fontWeight: '700',
            position:   'relative',
            zIndex:     1,
          }}>
            {getRating(lastInterval).label}
          </div>
        )}
      </div>

      {/* ─── Results ─────────────────────────────────────────────────── */}
      {results.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.85rem', color: 'var(--neon-cyan)' }}>
            📊 Results ({results.length})
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {results.map((r, i) => (
              <div key={i} style={{
                padding:    '0.3rem 0.75rem',
                borderRadius: '6px',
                background: i === 0 ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)',
                border:     `1px solid ${i === 0 ? 'var(--neon-cyan)' : 'var(--border)'}`,
                fontSize:   '0.8rem',
                fontWeight: '700',
                color:      getRating(r).color,
              }}>
                {r}ms
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Statistics Panel ────────────────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.85rem', color: 'var(--neon-cyan)' }}>
          📈 Statistics
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Total Attempts',  value: stats.totalAttempts,                                              color: 'var(--neon-cyan)'    },
            { label: 'Successes',       value: stats.successes,                                                  color: 'var(--neon-green)'   },
            { label: 'Failures',        value: stats.failures,                                                   color: 'var(--neon-red)'     },
            { label: 'Success Rate',    value: stats.totalAttempts ? `${successRate}%` : '—',                    color: 'var(--neon-orange)'  },
            { label: 'Median',          value: medianVal  != null ? `${medianVal}ms`  : '—',                     color: 'var(--neon-cyan)'    },
            { label: 'Slowest',         value: slowest    != null ? `${slowest}ms`    : '—',                     color: 'var(--text-muted)'   },
            { label: 'Std Deviation',   value: stdDevVal  != null && results.length ? `${stdDevVal}ms` : '—',    color: '#a78bfa'             },
            { label: 'Current Streak',  value: stats.currentStreak,                                              color: 'var(--neon-green)'   },
            { label: 'Best Streak',     value: stats.bestStreak,                                                 color: 'var(--neon-orange)'  },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding:      '0.9rem 1rem',
              textAlign:    'center',
              borderBottom: i < 6 ? '1px solid var(--border)' : undefined,
              borderRight:  (i + 1) % 3 !== 0 ? '1px solid var(--border)' : undefined,
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.15rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Reset ───────────────────────────────────────────────────── */}
      <button className="btn btn-secondary" onClick={handleReset}>
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
          <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--neon-red)' }}>⚡ Lightning (&lt; 80ms):</strong> Elite reflex speed. Often achieved by competitive gamers using high-performance optical switches with minimal de-bounce delay.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--neon-orange)' }}>🚀 Fast (80ms - 150ms):</strong> Excellent mechanical performance. Perfect for snappy productivity mapping and rapid execution queues.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--neon-green)' }}>✅ Normal (150ms - 250ms):</strong> The global human average benchmark. Ideal for everyday web browsing and standard application usage.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--text-muted)' }}>🐢 Slow (&gt; 250ms):</strong> Might cause software applications to misinterpret double-clicks as two separate individual actions.</li>
        </ul>

        <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
          Diagnosing Mouse Double-Clicking Hardware Issues
        </h3>
        <p style={{ marginBottom: '1.5rem' }}>
          Are you registering unexpected double clicks when pressing your mouse button only once? This web tester serves as an excellent diagnostic tool for mouse degradation. Over time, traditional copper mechanical leaf-spring switches (like Omron switches) oxidize or lose structural tension, causing a phenomenon called <em>switch chatter</em>. If you record abnormally low intervals like <strong>5ms to 30ms</strong> without meaning to click twice, your peripheral is likely experiencing hardware malfunction or requires an adjusted de-bounce filter.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          How to Use the Double Click Test
        </h2>
        <ol style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Select your preferred <strong>difficulty level</strong> (Easy, Normal, Hard, or Pro) to set the click threshold.</li>
          <li style={{ marginBottom: '0.5rem' }}>Click the large zone once — the status changes to prompt a second click, and a short arming tone confirms the first press was registered.</li>
          <li style={{ marginBottom: '0.5rem' }}>Click again as quickly as possible within the threshold window.</li>
          <li style={{ marginBottom: '0.5rem' }}>Your millisecond interval is recorded and added to the results panel, accompanied by a rising success chime.</li>
          <li style={{ marginBottom: '0.5rem' }}>Repeat to build statistics and track your average, median, and standard deviation.</li>
          <li style={{ marginBottom: '0.5rem' }}>Press <strong>Reset</strong> to clear all data and start a fresh session.</li>
        </ol>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Audio Feedback: How the Sound Cues Work
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          This tool now includes built-in audio feedback generated live in your browser using the Web Audio API — no sound files are downloaded, so there is zero added page weight. A short, low <strong>arming tick</strong> plays the instant your first click registers, letting you know the timer has started without needing to glance at the status text. If your second click lands inside the threshold, a bright <strong>rising chime</strong> confirms a successful double-click. If you miss the window, a low descending <strong>buzz</strong> tells you the attempt failed. All three cues are generated with oscillators rather than audio files, so they load instantly and work offline. A dedicated <strong>Sound On / Sound Off</strong> toggle sits above the difficulty selector if you would rather test in silence — useful in shared offices, libraries, or late-night sessions.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Why Audio Feedback Improves Double-Click Testing
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Relying purely on vision to judge timing introduces a small perceptual delay, since your brain has to process the on-screen text change before you react. Sound is processed by the auditory cortex slightly faster than visual text is parsed for meaning, which means audio cues can make the rhythm of clicking feel tighter and more responsive. Many rhythm-based games and typing trainers use the same principle: pairing an action with an immediate, distinct tone reinforces muscle memory faster than silent visual feedback alone. For double-click training specifically, hearing the arming tick helps you internalize the exact moment the timer starts, which over repeated sessions can shave a few milliseconds off your average interval simply through better timing awareness.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Why Double Click Speed Matters
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Your double-click speed affects far more than just opening folders. In competitive gaming, a fast and reliable double-click can trigger combo attacks, inventory swaps, or ability activations ahead of opponents. In productivity workflows, quick double-clicking accelerates text selection, file launching, and spreadsheet navigation. Understanding your baseline speed lets you tune OS settings, compare hardware, and identify degradation before it impacts performance.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Best Double Click Speed for Gaming
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Competitive gamers — especially those playing Minecraft PvP, shooters, or real-time strategy games — aim for double-click intervals of <strong>80–150 ms</strong>. This range is fast enough to outmaneuver opponents while remaining reliable and unlikely to be misinterpreted as a single click. Elite players using optical-switch gaming mice routinely achieve sub-80 ms intervals. If you are a casual gamer, 150–250 ms is perfectly adequate for most titles.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Double Click Test vs CPS Test
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          A <strong>CPS (Clicks Per Second) Test</strong> measures the total number of individual clicks you can produce within a set time window, typically 5 or 10 seconds. A <strong>Double Click Test</strong> measures only the precise gap between two consecutive intentional clicks. CPS is a stamina and rhythm metric; double-click speed is a reflex and hardware precision metric. Both are valuable, but they test different skills. High CPS does not guarantee a fast double-click, and a fast double-click does not guarantee high CPS.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Double Click Test vs Drag Click Test
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          <strong>Drag clicking</strong> is a technique where a user drags their finger across the mouse button surface, using friction to generate rapid electrical signals and artificially inflate CPS scores — sometimes exceeding 30–50 CPS. The <strong>Double Click Test</strong>, by contrast, requires intentional, discrete presses and accurately reflects real-world click behavior. Drag clicking can damage mouse switches faster and is prohibited on many gaming servers for fairness reasons.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Common Mouse Double Click Problems
        </h2>
        <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
          <li style={{ marginBottom: '0.6rem' }}><strong>Phantom double-clicks:</strong> Mouse registers two clicks when only one press is made. Caused by switch chatter.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Missed double-clicks:</strong> Two quick presses register as single clicks. Usually due to OS threshold set too low or switch being too stiff.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Inconsistent results:</strong> Wide variance in recorded intervals. May indicate dirty switch contacts or USB polling issues.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Delayed registration:</strong> Noticeable lag between click and response. Suggests a driver issue or high system CPU load.</li>
        </ul>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          How to Fix a Mouse That Double Clicks
        </h2>
        <ol style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>Increase OS debounce threshold</strong> — raise the double-click speed slider to a slower setting so the OS ignores rapid re-activations.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Use peripheral software</strong> — tools like Logitech G Hub or Razer Synapse offer a debounce filter setting in milliseconds.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Clean the switch</strong> — apply isopropyl alcohol (90%+) to the switch and click rapidly to flush debris.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Replace the switch</strong> — Omron D2FC-F-7N switches cost under $2 and are solderable by anyone with basic skills.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Update firmware/drivers</strong> — manufacturers occasionally patch switch chatter bugs via driver updates.</li>
        </ol>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Windows Double Click Speed Settings
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          On Windows 10 and 11, navigate to <strong>Control Panel → Hardware and Sound → Mouse → Buttons tab</strong>. The <em>Double-click speed</em> slider adjusts the time window from approximately 200 ms (Fast) to 900 ms (Slow). Moving the slider left increases the threshold, making it easier to register double-clicks. For gaming, a medium-to-fast setting (~400–500 ms) provides the best balance of responsiveness and accuracy.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          macOS Double Click Speed Settings
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          On macOS Ventura and later, go to <strong>System Settings → Accessibility → Pointer Control</strong>. The <em>Double-click speed</em> slider lets you increase or decrease the recognition window. Earlier macOS versions use <strong>System Preferences → Accessibility → Mouse &amp; Trackpad → Double-click speed</strong>. The default value is approximately 500 ms.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Linux Double Click Settings
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Linux users can configure double-click speed via the desktop environment or terminal. On <strong>GNOME</strong>, run: <code>gsettings set org.gnome.desktop.peripherals.mouse double-click 400</code> (value in ms). On <strong>KDE Plasma</strong>, go to System Settings → Input Devices → Mouse → Advanced. For <strong>X11</strong>, use <code>xset m</code> or edit <code>/etc/X11/xorg.conf</code>.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Mechanical vs Optical Mouse Switches
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { title: '⚙️ Mechanical Switches', points: ['Physical metal contacts', 'Susceptible to oxidation and chatter', 'Rated 20–50M clicks (Omron)', 'Lower cost', 'Tactile feedback'] },
            { title: '💡 Optical Switches',    points: ['Light-beam actuation', 'Zero bounce — no chatter', 'Rated 100M+ clicks', 'Higher upfront cost', 'Consistent every time'] },
          ].map(col => (
            <div key={col.title} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{col.title}</div>
              <ul style={{ paddingLeft: '1rem', margin: 0, listStyleType: 'disc' }}>
                {col.points.map(p => <li key={p} style={{ marginBottom: '0.3rem', fontSize: '0.85rem' }}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Gaming Mouse Recommendations
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          For the fastest and most consistent double-click performance, look for mice featuring optical switches such as the <strong>Razer HyperSpeed Optical</strong>, <strong>SteelSeries OmniPoint</strong>, or <strong>Logitech HERO</strong> sensor models. Popular competitive choices include the Logitech G Pro X Superlight 2, Razer DeathAdder V3, and Zowie EC series. Ensure your mouse has a polling rate of at least 500 Hz (1000 Hz preferred) and a configurable debounce time below 4 ms.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Tips to Improve Double Click Speed
        </h2>
        <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
          <li style={{ marginBottom: '0.6rem' }}><strong>Practice daily:</strong> Use this tool for 5-minute sessions to build muscle memory for quick repeated presses.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Relax your hand:</strong> Tension slows you down. Keep your wrist loose and let your fingertip do the work.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Use your fingertip, not the pad:</strong> The tip of your index finger has faster nerve response than the flat pad.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Upgrade your switch:</strong> Optical switches eliminate bounce delay, shaving off 5–15 ms of effective debounce time.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Adjust difficulty progressively:</strong> Start on Easy (600 ms), then move to Normal, Hard, and finally Pro (250 ms) as you improve.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Train with sound on:</strong> Let the arming tick anchor your sense of rhythm before you rely purely on visual feedback.</li>
        </ul>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Double-Click Speed by Age Group
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Reaction speed and fine motor coordination generally peak in the late teens to mid-20s and decline gradually afterward. Studies on general reflex timing suggest younger adults average tighter double-click intervals, often in the 180–240 ms range, while adults over 50 commonly average 250–320 ms. This is a broad trend, not a rule — regular practice, ergonomic mouse grip, and quality hardware can offset much of the age-related slowdown, and many older users who click frequently for work stay well within the Normal range. If you are teaching a parent or grandparent to use a computer, using the Easy difficulty setting (600 ms) first can build confidence before increasing the challenge, and gradually stepping up to Normal once several sessions in a row feel comfortable.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Double-Click Test for Accessibility Needs
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          For users with motor impairments, tremors, or arthritis, double-clicking can be one of the more physically demanding interface actions. Most operating systems allow the double-click threshold to be extended well beyond the 500 ms default specifically to accommodate this. Using this tool on the Easy setting (600 ms) can help verify whether an extended OS threshold is actually being applied correctly, and can serve as a simple diagnostic before adjusting system-wide accessibility settings. Sound cues are especially useful here, since they confirm a click registered without requiring the user to track fast-changing on-screen text.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Double-Click Speed: Mouse vs Trackpad vs Touchscreen
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Input method has a measurable effect on double-click consistency. A dedicated mouse with a mechanical or optical switch typically produces the tightest, most repeatable intervals because the electrical signal path is short and direct. Laptop trackpads rely on capacitive touch sensing and firmware-level tap debouncing, which tends to add a small amount of latency and variance. Touchscreens on phones and tablets apply their own gesture-recognition layers — often around 300 ms — specifically to distinguish a double-tap from two accidental single taps, which can make raw touchscreen results appear slower even when the user's reflexes are fast.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Using This Tool to Benchmark New Hardware
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Before a retail return window closes, it is worth stress-testing a newly purchased mouse. Run several dozen double-clicks across all four difficulty levels and watch the Standard Deviation stat in the Statistics panel — a healthy, well-manufactured switch should produce a fairly tight spread of results. A wide standard deviation, or occasional suspiciously low intervals under 20 ms that you did not intend, can indicate a manufacturing defect or an early sign of switch chatter, both of which are valid reasons to request an exchange.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Esports and Competitive Benchmarking Standards
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          While there is no single official governing body certifying double-click speed the way there is for typing tests, many esports organizations and hardware manufacturers publish informal benchmarks for their sponsored athletes. Competitive click-intensive titles have driven demand for input devices with sub-1ms polling response and near-zero debounce delay, which is why optical switches have become the de facto standard in high-end gaming mice over the past several years. Community leaderboards on gaming forums have documented verified double-clicks as fast as 20–40 ms using specialized capture equipment, though such results sit well outside what casual play requires.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Quick Troubleshooting Reference
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Use this quick-reference table to match a symptom you notice while testing to the most likely underlying cause and fix:
        </p>
        <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0,245,255,0.08)' }}>
                <th style={{ padding: '0.6rem', textAlign: 'left', border: '1px solid var(--border)', color: '#fff' }}>Symptom</th>
                <th style={{ padding: '0.6rem', textAlign: 'left', border: '1px solid var(--border)', color: '#fff' }}>Likely Cause</th>
                <th style={{ padding: '0.6rem', textAlign: 'left', border: '1px solid var(--border)', color: '#fff' }}>Recommended Fix</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Intervals under 20ms you did not intend', 'Switch chatter', 'Clean or replace the switch'],
                ['Consistent results but all above 300ms', 'OS threshold set too fast', 'Increase double-click speed setting'],
                ['High standard deviation across attempts', 'Fatigue or inconsistent grip', 'Rest hand, retest in shorter sessions'],
                ['Sound not playing on click', 'Browser audio permissions or tab muted', 'Check Sound toggle and browser tab audio settings'],
                ['Results feel delayed vs actual click', 'High system load or low polling rate', 'Close background apps, raise polling rate'],
              ].map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '0.6rem', border: '1px solid var(--border)' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          History of the Double Click
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          The double-click was introduced by <strong>Larry Tesler</strong> and colleagues at Xerox PARC in the late 1970s as part of the graphical user interface paradigm. When Apple's Lisa and Macintosh computers popularized the GUI in the early 1980s, double-clicking became the standard method for opening files and launching applications. Microsoft adopted the convention in Windows 1.0 (1985). Today, despite touchscreens reducing its prevalence, the double-click remains a fundamental desktop interaction pattern used by billions daily.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Browser Compatibility
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          This Double Click Test uses the <code>performance.now()</code> Web API for high-resolution timing and the <code>Web Audio API</code> for sound feedback, both supported in all modern browsers: <strong>Chrome 24+, Firefox 15+, Safari 8+, Edge 12+, and Opera 15+</strong>. No plugins or downloads are required. JavaScript must be enabled. If your browser blocks audio autoplay, the very first click on the page unlocks the audio context, after which all subsequent tones play normally.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Mobile Device Support
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          The test zone responds to touch events on iOS and Android devices. Be aware that mobile OS frameworks apply their own touch debounce and gesture recognition layers (typically 300 ms for distinguishing single from double taps), which may alter raw measurements. Sound cues work the same way on mobile as on desktop once the page has registered an initial tap. For the most accurate results, use a physical mouse on a desktop or laptop computer.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Privacy Statement
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          This tool operates entirely within your browser using client-side JavaScript, including all sound generation. <strong>No click data, timing results, audio settings, or personal information is collected, stored, or transmitted to any server.</strong> All statistics exist only in your browser memory and are cleared when you reset the tool or close the tab. We do not use cookies for this tool.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Accuracy Disclaimer
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          While <code>performance.now()</code> provides sub-millisecond resolution, real-world accuracy is influenced by browser event loop scheduling (typically ±1–4 ms), system CPU load, background processes, and browser throttling in inactive tabs. Audio playback timing is independent of the recorded interval and does not affect measurement accuracy. Results are highly accurate under normal conditions but should not be used for scientific or medical purposes.
        </p>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Glossary of Double-Click Terminology
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          The following terms come up frequently when discussing click testing, mouse hardware, and input latency. Use this glossary as a quick reference while reading the rest of this guide or comparing peripherals:
        </p>
        <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
          <li style={{ marginBottom: '0.6rem' }}><strong>Debounce:</strong> A software or firmware delay inserted after a click to prevent a single physical press from being read as multiple electrical signals.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Polling rate:</strong> How often a mouse reports its state to the computer, measured in Hz. Higher polling rates reduce the delay between a physical click and the signal reaching your PC.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Actuation force:</strong> The amount of physical pressure required to trigger a switch. Lighter actuation generally allows for faster repeated clicking.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Latency:</strong> The total delay between a physical action and its effect appearing on screen, combining hardware, USB transmission, and software processing time.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Threshold:</strong> The maximum interval, in milliseconds, that the operating system or this test will accept between two clicks for them to count as a double-click.</li>
          <li style={{ marginBottom: '0.6rem' }}><strong>Standard deviation:</strong> A statistical measure of how spread out your recorded intervals are; a lower value means more consistent timing between attempts.</li>
        </ul>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
          Final Thoughts: Making the Most of Your Double-Click Test Results
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          A single double-click score is only a snapshot. The real value of this tool comes from testing repeatedly over time — before and after cleaning a switch, before and after upgrading to an optical-switch mouse, or simply across a few days to see how consistent your natural reflex timing really is. Pay closer attention to your standard deviation and success rate than to any single best result: a low best time paired with a high failure rate usually means you got lucky once rather than developed genuine consistency. Combine the sound feedback with the visual stats, work your way up through the difficulty levels gradually, and use the troubleshooting table above the moment you notice anything unusual in your numbers. Whether you are diagnosing a flaky switch, tuning your operating system's threshold, or simply curious how your reflexes compare to the global average, this tool gives you a fast, private, and completely free way to find out. Bookmark this page and revisit it every few weeks — small, gradual improvements in your average interval are far more meaningful than chasing a single lucky lightning-fast click, and tracking that trend over time is the best way to know whether your hardware, technique, or both are actually getting better.
        </p>

        {/* ── Expanded FAQ ─────────────────────────────────────────────── */}
        <div style={{ marginTop: '2.5rem', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', marginTop: '0' }}>
            Frequently Asked Questions (FAQs)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQ_ITEMS.map(({ q, a }, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  style={{
                    background:   'var(--bg-card)',
                    border:       `1px solid ${isOpen ? 'var(--neon-cyan)' : 'var(--border)'}`,
                    borderRadius: '10px',
                    overflow:     'hidden',
                    transition:   'border-color 0.15s ease',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width:          '100%',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'space-between',
                      gap:            '1rem',
                      padding:        '1rem 1.25rem',
                      background:     'transparent',
                      border:         'none',
                      cursor:         'pointer',
                      textAlign:      'left',
                      color:          '#fff',
                      fontSize:       '0.95rem',
                      fontWeight:     '600',
                    }}
                  >
                    <span>{q}</span>
                    <span
                      style={{
                        flexShrink: 0,
                        display:    'inline-flex',
                        transform:  isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        color:      isOpen ? 'var(--neon-cyan)' : 'var(--text-muted)',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.25rem 1.1rem 1.25rem' }}>
                      <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>{a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Internal Links ────────────────────────────────────────────── */}
        <div style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', marginTop: '0' }}>
            🔗 Related Mouse Speed Tools
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {[
              { href: '/cps-test',          label: 'CPS Test — Clicks Per Second' },
              { href: '/mouse-test',         label: 'Mouse Button Test'            },
              { href: '/click-speed-test',   label: 'Click Speed Test'             },
              { href: '/jitter-click-test',  label: 'Jitter Click Test'            },
              { href: '/drag-click-test',    label: 'Drag Click Test'              },
              { href: '/spacebar-test',      label: 'Spacebar Speed Test'          },
              { href: '/reaction-time-test', label: 'Reaction Time Test'           },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  padding:    '0.4rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(0,245,255,0.07)',
                  border:     '1px solid rgba(0,245,255,0.2)',
                  color:      'var(--neon-cyan)',
                  fontSize:   '0.82rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                }}
                onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,245,255,0.14)'; }}
                onMouseOut={e =>  { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,245,255,0.07)'; }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
      {/* ================= SEO ARTICLE SECTION END ================= */}
    </div>
  );
}
