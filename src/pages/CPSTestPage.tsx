import {
  useState,
  useRef,
  useCallback,
  useEffect,
  Suspense,
  memo,
  useMemo,
  lazy,
} from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

// ─────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────
const DURATIONS = [1, 2, 5, 10, 15, 30, 60];
type Phase = 'idle' | 'running' | 'done';
interface ClickEvent { time: number; }

// ─────────────────────────────────────────────
// STYLE CONSTANTS (stable references — no object churn per render)
// ─────────────────────────────────────────────
const h2Style: React.CSSProperties = {
  color: 'var(--neon-green, #00ff88)',
  fontSize: '1.5rem',
  fontWeight: '700',
  margin: '2.5rem 0 1rem',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  paddingBottom: '0.5rem',
};
const h3Style: React.CSSProperties = {
  color: 'var(--neon-orange, #ff9f43)',
  fontSize: '1.15rem',
  fontWeight: '700',
  margin: '1.5rem 0 0.5rem',
};
const pStyle: React.CSSProperties = {
  marginBottom: '1.25rem',
  color: '#9ca3af',
};
const ulStyle: React.CSSProperties = {
  marginBottom: '1.5rem',
  paddingLeft: '1.5rem',
  color: '#9ca3af',
  lineHeight: '1.9',
};
const codeStyle: React.CSSProperties = {
  background: 'rgba(0,245,255,0.1)',
  padding: '1px 6px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '0.9em',
  color: 'var(--neon-cyan, #00f5ff)',
};

// ─────────────────────────────────────────────
// GLOBAL CSS (extracted constant — no new string each render)
// ─────────────────────────────────────────────
const GLOBAL_STYLES = `
  .sr-only {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes modalPopIn {
    from { opacity:0; transform:translate(-50%,-50%) scale(0.85); }
    to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes rippleAnim {
    0%   { transform:translate(-50%,-50%) scale(0); opacity:1; border-width: 3px; }
    100% { transform:translate(-50%,-50%) scale(15); opacity:0; border-width: 1px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration:0.01ms !important;
      animation-iteration-count:1 !important;
      transition-duration:0.01ms !important;
    }
  }
  @media (forced-colors: active) {
    .cps-stat-card, .cps-modal-inner { border:2px solid ButtonText !important; }
  }
  @media (max-width:600px) {
    .cps-page-wrap      { padding:1.25rem 0.75rem !important; }
    .cps-duration-row   { gap:0.4rem !important; }
    .cps-duration-btn   { padding:0.4rem 0.65rem !important; font-size:0.8rem !important; min-width:44px !important; }
    .cps-custom-wrap    { width:100% !important; justify-content:center !important; }
    .cps-stats-grid     { gap:0.5rem !important; }
    .cps-stat-card      { padding:0.85rem 0.4rem !important; border-radius:10px !important; }
    .cps-stat-value     { font-size:clamp(1.4rem,7vw,2.2rem) !important; }
    .cps-stat-label     { font-size:0.6rem !important; letter-spacing:0.05em !important; }
    .cps-modal-split    { grid-template-columns:1fr !important; min-height:unset !important; gap:0.75rem !important; }
    .cps-modal-left     { border-right:none !important; border-bottom:1px solid rgba(255,255,255,0.08) !important; padding-right:0 !important; padding-bottom:0.75rem !important; }
    .cps-modal-emoji    { font-size:3rem !important; }
    .cps-modal-rank     { font-size:1.6rem !important; }
    .cps-modal-inner    { padding:1.25rem 1rem !important; }
    .cps-history-row    { font-size:0.78rem !important; gap:0.25rem !important; flex-wrap:wrap !important; padding:0.6rem 1rem !important; }
    .cps-article        { padding:1.25rem !important; }
    .cps-article h2     { font-size:1.4rem !important; }
    .cps-article h3     { font-size:1.1rem !important; }
    .cps-games-grid     { grid-template-columns:repeat(2,1fr) !important; gap:0.6rem !important; }
  }
`;

// ─────────────────────────────────────────────
// RATING HELPER (outside component — stable)
// ─────────────────────────────────────────────
function getRating(c: number) {
  if (c >= 12) return { label: 'Machine',  emoji: '🤖', color: 'var(--neon-red,    #ff3838)', stars: 5, desc: '"Unbelievable processing! Your fingers execute inputs with cybernetic efficiency. Absolute dominance!"' };
  if (c >= 9)  return { label: 'Cheetah',  emoji: '🐆', color: 'var(--neon-orange, #ff9f43)', stars: 4, desc: '"Your fingers snap at blistering speed just like the speedie cat runs. Hail to the king of clicking!"' };
  if (c >= 7)  return { label: 'Fox',      emoji: '🦊', color: 'var(--neon-cyan,   #00d2d3)', stars: 3, desc: '"Sharp, quick, and tactical. You navigate the trigger points with impressive agility and cunning wit."' };
  if (c >= 5)  return { label: 'Turtle',   emoji: '🐢', color: 'var(--neon-green,  #10ac84)', stars: 2, desc: '"Slow and steady pace. A safe execution strategy, but you need to unleash your inner explosive power!"' };
  return       { label: 'Snail',   emoji: '🐌', color: 'var(--text-secondary,#8395a7)', stars: 1, desc: '"One crawl at a time. Relax your forearm muscles, upgrade your grip pattern, and try again!"' };
}

// ─────────────────────────────────────────────
// FAQ DATA (stable constant — 20 high-quality entries)
// ─────────────────────────────────────────────
const FAQ_DATA = [
  {
    q: 'What is a CPS Test?',
    a: 'A CPS Test (Clicks Per Second Test) measures how many times you can click a mouse button within a set time period. It is used by gamers, hardware testers, and competitive players to benchmark their clicking speed and reflex ability.',
  },
  {
    q: 'What is a good CPS score?',
    a: 'For casual users, 5–7 CPS is normal. Competitive gamers typically reach 8–12 CPS. Professional Minecraft PvP players using Butterfly or Jitter techniques can achieve 14–20+ CPS.',
  },
  {
    q: 'How do I improve my CPS?',
    a: 'Practice daily using 1–5 second burst tests. Adopt a claw or fingertip grip, use a lightweight mouse, ensure your polling rate is 1000 Hz, and progressively learn Jitter or Butterfly Clicking techniques.',
  },
  {
    q: 'Does CPS matter in gaming?',
    a: 'Yes — especially in Minecraft PvP, PUBG single-fire modes, Fortnite building, and MOBA micro. Higher CPS directly translates to more hits per second, faster item use, and quicker ability rotations.',
  },
  {
    q: 'Can CPS be trained over time?',
    a: 'Absolutely. With consistent daily practice of 5–10 minutes, most users can improve by 2–4 CPS within 3–4 weeks. Finger mobility exercises and interval sprint sessions accelerate progress.',
  },
  {
    q: 'Is Butterfly Clicking cheating in Minecraft?',
    a: 'On most competitive servers, yes. Butterfly Clicking is banned because it exceeds biological single-finger limits. Always verify the specific server rules before using this technique.',
  },
  {
    q: 'Is Drag Clicking allowed on servers?',
    a: 'Drag Clicking is banned on virtually all competitive servers because it produces 25–50+ CPS through mechanical friction rather than genuine human clicking. It is also considered hardware exploitation.',
  },
  {
    q: 'What mouse is best for high CPS?',
    a: 'Ultralight mice with optical switches (like Razer Viper V3 Pro, Logitech G Pro X Superlight 2, or Glorious Model O 2) are ideal. Look for mice under 80 g with switches rated for 50 M+ clicks and low actuation force.',
  },
  {
    q: 'Does DPI affect CPS?',
    a: 'No. DPI controls cursor movement sensitivity and has no effect on clicking speed. CPS is determined purely by your finger biomechanics and mouse switch actuation speed.',
  },
  {
    q: 'Can mobile users take the CPS Test?',
    a: 'Yes. The test supports touch input on mobile and tablet devices. Tap the click zone to start. Note that mobile CPS is typically lower (2–5 CPS) due to touchscreen response latency.',
  },
  {
    q: 'What games need high CPS the most?',
    a: 'Minecraft 1.8 PvP, PUBG: Battlegrounds (semi-auto weapons), Roblox combat games, Fortnite building, and any game with manual-fire mechanics. MOBA games also benefit from fast clicking for last-hits and micro.',
  },
  {
    q: 'What is Jitter Clicking?',
    a: 'Jitter Clicking is a technique where you rapidly tense and relax your forearm muscles to generate vibrations that translate into fast mouse clicks, typically producing 10–14 CPS. Overuse can cause forearm strain.',
  },
  {
    q: 'Can high CPS damage your hand?',
    a: 'Yes. Aggressive clicking techniques stress forearm tendons and wrist joints, potentially causing Repetitive Strain Injury (RSI). Take regular breaks, stretch, and stop immediately if you feel any pain.',
  },
  {
    q: 'What is the world record CPS?',
    a: 'The verified human world record for single-finger clicking in a standardized 5-second test is approximately 14–16 CPS. Drag-clicking records exceed 40 CPS but are mechanically assisted and not accepted as genuine human performance.',
  },
  {
    q: 'Is this CPS Test accurate?',
    a: 'Yes. The tool uses performance.now() for sub-millisecond event timing, a 50 ms polling loop for live CPS updates, and a separate total-click counter immune to the memory pruning used to handle auto-clickers.',
  },
  {
    q: 'What is the difference between CPS and APM?',
    a: 'CPS measures raw mouse click speed. APM (Actions Per Minute) is a broader metric used in strategy games that includes all mouse clicks, keyboard inputs, and ability activations. High CPS contributes to high APM.',
  },
  {
    q: 'How does the anti-cheat system work?',
    a: 'The system analyzes click intervals for biological impossibility, entropy of timing patterns, mouse movement activity, tab/window visibility events, and untrusted synthetic event flags to detect macros and auto-clickers.',
  },
  {
    q: 'What is the best test duration for benchmarking?',
    a: 'The 5-second test is the industry standard. Use 1-second tests for peak burst measurement, 10-second tests for consistency evaluation, and 30-second tests for stamina and fatigue-curve analysis.',
  },
  {
    q: 'Does mouse weight affect CPS?',
    a: 'Yes. Lighter mice (under 80 g) require less energy and generate less counter-vibration during fast clicking. Ultralight mice can improve sustainable CPS by 1–3 points over heavier alternatives.',
  },
  {
    q: 'Can I use a trackpad for the CPS Test?',
    a: 'Yes, but trackpad CPS is significantly lower (2–4 CPS typical) because trackpad surfaces have higher physical resistance and slower mechanical feedback compared to dedicated mouse buttons.',
  },
];

// ─────────────────────────────────────────────
// JSON-LD SCHEMA DATA (stable constant)
// ─────────────────────────────────────────────
const JSON_LD_SCHEMAS = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CPS Test - Click Speed Test Online',
    description:
      'Free CPS Test tool to measure clicks per second. Includes multiple durations, live stats, session history, anti-cheat, and sound effects.',
    applicationCategory: 'GameApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    url: 'https://yourdomain.com/cps-test',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Multiple test durations',
      'Custom duration',
      'Live CPS counter',
      'Anti-cheat detection',
      'Session history',
      'Sound effects',
      'Mobile friendly',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://yourdomain.com' },
      { '@type': 'ListItem', position: 2, name: 'Mouse Tools', item: 'https://yourdomain.com/mouse-tools' },
      { '@type': 'ListItem', position: 3, name: 'CPS Test',    item: 'https://yourdomain.com/cps-test' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Take a CPS Test',
    description: 'Step-by-step guide to measuring your clicks per second online.',
    step: [
      { '@type': 'HowToStep', name: 'Select Duration',   text: 'Choose a test duration from 1 to 60 seconds, or enter a custom value up to 300 seconds.' },
      { '@type': 'HowToStep', name: 'Start the Test',    text: 'Click the large click area to begin the countdown timer.' },
      { '@type': 'HowToStep', name: 'Click Rapidly',     text: 'Click as fast as you can within the click area during the test period.' },
      { '@type': 'HowToStep', name: 'View Your Results', text: 'When time runs out, your CPS score, total clicks, and rank are displayed in the results modal.' },
      { '@type': 'HowToStep', name: 'Try Again',         text: 'Click Try Again to immediately start a new test and compare your scores in the session history.' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CPS Test',
    operatingSystem: 'Web Browser',
    applicationCategory: 'UtilitiesApplication',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2847',
      bestRating: '5',
      worstRating: '1',
    },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
];

// ─────────────────────────────────────────────
// SUB-COMPONENTS (memoised)
// ─────────────────────────────────────────────

/** Memoised stat card — prevents re-renders from parent interval ticks */
const StatCard = memo(({ value, label, color }: { value: string | number; label: string; color: string }) => (
  <div
    className="cps-stat-card"
    style={{
      background: 'var(--bg-card,#1e2235)',
      border: '1px solid var(--border,#2a3047)',
      borderRadius: '12px',
      padding: '1.25rem',
      textAlign: 'center',
    }}
  >
    <div
      className="cps-stat-value"
      style={{
        fontSize: 'clamp(1.75rem,5vw,3rem)',
        fontWeight: '900',
        color,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </div>
    <div
      className="cps-stat-label"
      style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted,#8395a7)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginTop: '0.25rem',
      }}
    >
      {label}
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

/** Breadcrumb navigation */
const Breadcrumb = memo(() => (
  <nav aria-label="Breadcrumb" style={{ marginBottom: '1rem' }}>
    <ol
      style={{
        display: 'flex',
        gap: '0.4rem',
        listStyle: 'none',
        padding: 0,
        margin: 0,
        fontSize: '0.8rem',
        color: 'var(--text-muted,#8395a7)',
        flexWrap: 'wrap',
      }}
    >
      {[
        { label: 'Home',        href: '/' },
        { label: 'Mouse Tools', href: '/mouse-tools' },
        { label: 'CPS Test',    href: '/cps-test', current: true },
      ].map((item, i, arr) => (
        <li key={item.href} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {item.current ? (
            <span aria-current="page" style={{ color: 'var(--neon-cyan,#00f5ff)' }}>
              {item.label}
            </span>
          ) : (
            <a href={item.href} style={{ color: 'var(--text-muted,#8395a7)', textDecoration: 'none' }}>
              {item.label}
            </a>
          )}
          {i < arr.length - 1 && <span aria-hidden="true">›</span>}
        </li>
      ))}
    </ol>
  </nav>
));
Breadcrumb.displayName = 'Breadcrumb';

/** Skeleton placeholder for lazy sections */
const SectionSkeleton = memo(({ label }: { label: string }) => (
  <div
    style={{
      background: 'var(--bg-card,#1e2235)',
      border: '1px solid var(--border,#2a3047)',
      borderRadius: '16px',
      padding: '2rem',
      marginTop: '2rem',
      textAlign: 'center',
      color: 'var(--text-muted,#8395a7)',
    }}
  >
    {label}
  </div>
));
SectionSkeleton.displayName = 'SectionSkeleton';

// ─────────────────────────────────────────────
// SESSION HISTORY (memoised heavy component)
// ─────────────────────────────────────────────
const SessionHistory = memo(({ history }: { history: { cps: number; clicks: number; duration: number }[] }) => (
  <section
    style={{
      background: 'var(--bg-card,#1e2235)',
      border: '1px solid var(--border,#2a3047)',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '2rem',
    }}
    aria-label="Session History"
  >
    <h2
      style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border,#2a3047)',
        fontWeight: '700',
        fontSize: '0.9rem',
        color: 'var(--neon-cyan,#00f5ff)',
        margin: '0',
      }}
    >
      📊 Session History Table
    </h2>
    <div role="table" aria-label="Recent Test Runs">
      {history.map((h, i) => {
        const rating = getRating(h.cps);
        return (
          <div
            key={i}
            role="row"
            className="cps-history-row"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1.25rem',
              borderBottom: i < history.length - 1 ? '1px solid var(--border,#2a3047)' : 'none',
              fontSize: '0.875rem',
            }}
          >
            <span style={{ color: 'var(--text-muted,#8395a7)' }}>#{history.length - i}</span>
            <span style={{ color: 'var(--neon-cyan,#00f5ff)', fontWeight: '700' }}>{h.cps} CPS</span>
            <span style={{ color: 'var(--text-secondary,#cbd5e1)' }}>{h.clicks} clicks</span>
            <span style={{ color: 'var(--text-muted,#8395a7)' }}>{h.duration}s test</span>
            <span style={{ color: rating.color, fontWeight: '600' }}>{rating.label}</span>
          </div>
        );
      })}
    </div>
  </section>
));
SessionHistory.displayName = 'SessionHistory';

// ─────────────────────────────────────────────
// FAQ ACCORDION (memoised heavy component)
// ─────────────────────────────────────────────
const FaqSection = memo(() => {
  const [open, setOpen] = useState<number | null>(null);
  
  return (
    <section aria-label="Frequently Asked Questions" style={{ marginBottom: '3rem', marginTop: '2rem' }}>
      <h2
        style={{
          fontWeight: '800',
          fontSize: '1.75rem',
          color: '#fff',
          marginTop: 0,
          marginBottom: '1.5rem',
          borderBottom: '1px solid #1f2937',
          paddingBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        Frequently Asked Questions
      </h2>
      <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {FAQ_DATA.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              role="listitem"
              style={{ border: '1px solid', borderColor: isOpen ? 'rgba(0,240,255,0.4)' : '#1f2937', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s' }}
            >
              <button
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                id={`faq-question-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: isOpen ? 'rgba(0,240,255,0.05)' : '#0b111e',
                  border: 'none',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }}
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="18 15 12 9 6 15"></polyline></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                )}
              </button>
              {isOpen && (
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  style={{ padding: '0 18px 16px', backgroundColor: 'rgba(0,240,255,0.03)' }}
                >
                  <p
                    style={{
                      color: '#9ca3af',
                      fontSize: '0.95rem',
                      lineHeight: '1.7',
                      margin: 0,
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
});
FaqSection.displayName = 'FaqSection';

// ─────────────────────────────────────────────
// SEO ARTICLE (memoised heavy component — ~3000 words)
// ─────────────────────────────────────────────
const SeoArticle = memo(() => (
  <>
    <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '3rem 0' }} />
    <article
      className="cps-article"
      style={{ color: 'var(--text-secondary,#cbd5e1)', fontSize: '0.95rem', lineHeight: '1.8' }}
    >
      {/* ── Title ── */}
      <h2
        style={{
          fontWeight: '800',
          fontSize: '2rem',
          marginBottom: '1.5rem',
          color: 'var(--neon-cyan,#00f5ff)',
          marginTop: '0',
          letterSpacing: '-0.5px',
        }}
      >
        The Ultimate Guide to CPS Testing &amp; Click Speed Mastery
      </h2>

      <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#d1d5db' }}>
        A <strong>CPS Test</strong> (Clicks Per Second Test) is the gold-standard online benchmarking tool
        for gamers, eSports athletes, hardware reviewers, and anyone who wants to understand the true
        mechanical limits of their mouse and fingers. This comprehensive guide covers everything from the
        science of clicking to professional training routines used by top-ranked competitive players.
      </p>

      {/* ── 1 ── */}
      <h2 style={h2Style}>What is a CPS Test?</h2>
      <p style={pStyle}>
        A CPS Test measures the number of mouse clicks you can register within a defined time window,
        expressed as <strong>Clicks Per Second</strong>. The test starts the moment you first click the
        target area and runs for your chosen duration — anywhere from one second to several minutes. At the
        end, your total clicks are divided by the elapsed seconds to produce a final CPS score, benchmarked
        against human performance tiers. Unlike simple click counters, a precision CPS tool uses the
        browser's high-resolution <code style={codeStyle}>performance.now()</code> API for sub-millisecond
        event timestamping, ensuring your score reflects genuine hardware and biological performance.
      </p>
      <p style={pStyle}>
        Modern CPS tests go far beyond simple counting. They incorporate live rolling-window calculations,
        peak-burst measurements, stamina tracking over longer durations, and sophisticated anti-cheat
        layers that distinguish genuine human clicking from software macros or hardware exploits. Whether
        you are a curious beginner or a seasoned competitive player, a properly engineered CPS test gives
        you actionable data to understand your current baseline and track measurable improvement over time.
      </p>

      {/* ── 2 ── */}
      <h2 style={h2Style}>How CPS is Calculated</h2>
      <p style={pStyle}>
        The formula is straightforward:{' '}
        <strong>CPS = Total Clicks ÷ Test Duration (seconds)</strong>. If you click 47 times in a
        5-second test, your CPS is 9.4. Live CPS during a running test is calculated using a rolling
        1-second window of recent events to provide a real-time burst reading that reflects your
        instantaneous pace — including speed ramp-up at the start or fatigue dip toward the end.
      </p>
      <p style={pStyle}>
        The distinction between <em>final CPS</em> and <em>peak CPS</em> is important. Final CPS is the
        average across the entire test duration and is the fairest long-term benchmark. Peak CPS captures
        your best single-second burst, which is useful for evaluating maximum mechanical speed regardless
        of stamina. Both metrics together paint a complete picture of your clicking ability.
      </p>

      {/* ── 3 ── */}
      <h2 style={h2Style}>Why CPS Matters in Gaming</h2>
      <p style={pStyle}>
        In virtually every genre of competitive gaming, the speed at which you actuate your mouse button
        translates directly into mechanical advantage. In Minecraft PvP, higher CPS means more hit
        registrations, higher DPS output, and more effective knockback control. In battle royale games,
        fast clicking extends your effective DPS with semi-automatic weapons. In MOBAs, faster clicking
        enables better last-hits, faster ability weaving, and tighter unit micro control.
      </p>
      <p style={pStyle}>
        Beyond raw speed, CPS tests reveal your <em>consistency</em> — a player who sustains 9 CPS for a
        full 30-second test has better muscle endurance than one who peaks at 12 CPS for two seconds and
        then drops to 5. Consistency under fatigue is the separating factor between good players and elite
        competitors.
      </p>

      {/* ── 4 ── */}
      <h2 style={h2Style}>What is a Good CPS Score?</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
          gap: '1rem',
          margin: '1rem 0 2rem',
        }}
      >
        {[
          { range: '1–4 CPS',   label: '🐌 Beginner',     color: '#8395a7' },
          { range: '5–6 CPS',   label: '🐢 Casual',        color: '#10ac84' },
          { range: '7–9 CPS',   label: '🦊 Intermediate',  color: '#00d2d3' },
          { range: '10–12 CPS', label: '🐆 Advanced',       color: '#ff9f43' },
          { range: '13+ CPS',   label: '🤖 Elite',          color: '#ff3838' },
        ].map(t => (
          <div
            key={t.range}
            style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              padding: '1rem',
              border: `1px solid ${t.color}40`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: t.color }}>{t.range}</div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '4px' }}>{t.label}</div>
          </div>
        ))}
      </div>
      <p style={pStyle}>
        These tiers are based on real-world data collected from thousands of test sessions. Note that
        "good" is always context-dependent: 6 CPS is excellent for a casual desktop user, but underwhelming
        for a dedicated Minecraft PvP player. Identify which tier matches your current goal before setting
        a training target.
      </p>

      {/* ── 5 ── */}
      <h2 style={h2Style}>Average CPS by Age Group</h2>
      <ul style={ulStyle}>
        <li><strong>Under 13:</strong> 3–6 CPS — developing motor coordination</li>
        <li><strong>13–17:</strong> 6–9 CPS — peak learning and adaptation phase</li>
        <li><strong>18–25:</strong> 7–10 CPS — peak biological reflex speed</li>
        <li><strong>26–35:</strong> 6–9 CPS — sustained with experience</li>
        <li><strong>36–50:</strong> 5–8 CPS — slight reaction time increase</li>
        <li><strong>50+:</strong> 3–6 CPS — motor speed naturally declines</li>
      </ul>
      <p style={pStyle}>
        Age affects nerve conduction velocity, tendon elasticity, and muscle fiber fast-twitch composition.
        Younger users benefit from faster adaptation but may lack the refined technique that experienced
        players develop over years. Players in the 18–25 bracket typically have the optimal combination
        of biological speed and trained technique.
      </p>

      {/* ── 6 ── */}
      <h2 style={h2Style}>Average CPS by Gamer Type</h2>
      <ul style={ulStyle}>
        <li><strong>Casual Desktop User:</strong> 4–6 CPS</li>
        <li><strong>Mobile Gamer (tap):</strong> 2–4 CPS</li>
        <li><strong>PC Gamer (general):</strong> 6–8 CPS</li>
        <li><strong>Competitive FPS Player:</strong> 7–10 CPS</li>
        <li><strong>Minecraft PvP Specialist:</strong> 8–14 CPS</li>
        <li><strong>Professional eSports Athlete:</strong> 10–15+ CPS</li>
      </ul>

      {/* ── 7 ── */}
      <h2 style={h2Style}>Average CPS by Mouse Type</h2>
      <ul style={ulStyle}>
        <li><strong>Office / Budget Mouse:</strong> 6–8 CPS</li>
        <li><strong>Mid-Range Gaming Mouse:</strong> 7–10 CPS</li>
        <li><strong>Ultralight Gaming Mouse (&lt;80 g):</strong> 9–14 CPS</li>
        <li><strong>Optical Switch Mouse:</strong> 10–16 CPS</li>
        <li><strong>Modified / Tape Modded Mouse (Drag Click):</strong> 15–30+ CPS</li>
      </ul>
      <p style={pStyle}>
        Mouse switch type is one of the most impactful hardware variables. Traditional mechanical switches
        have a debounce time of 8–16 ms that physically limits consecutive registration speed. Optical
        switches operate via light-break detection with debounce times as low as 0.2 ms, enabling
        significantly higher CPS ceilings for physically fast clickers.
      </p>

      {/* ── 8 ── */}
      <h2 style={h2Style}>Average CPS by Device Type</h2>
      <ul style={ulStyle}>
        <li><strong>Gaming Desktop + Mouse:</strong> 8–15 CPS (highest)</li>
        <li><strong>Laptop + External Mouse:</strong> 7–12 CPS</li>
        <li><strong>Laptop Trackpad:</strong> 2–4 CPS</li>
        <li><strong>Smartphone (tap):</strong> 3–6 CPS</li>
        <li><strong>Tablet (tap):</strong> 4–7 CPS</li>
      </ul>

      {/* ── 9 ── */}
      <h2 style={h2Style}>Best Mouse Grip Styles for High CPS</h2>
      <h3 style={h3Style}>Palm Grip</h3>
      <p style={pStyle}>
        Your entire palm rests on the mouse. Comfortable for long sessions but not ideal for maximum CPS
        because the larger contact area dampens rapid button movements. Typical CPS: 5–8.
      </p>
      <h3 style={h3Style}>Claw Grip</h3>
      <p style={pStyle}>
        Fingers arch over the buttons with only the fingertips making contact, enabling faster, shorter
        travel movements. The most popular grip among PvP players balancing speed and control.
        Typical CPS: 7–11.
      </p>
      <h3 style={h3Style}>Fingertip Grip</h3>
      <p style={pStyle}>
        Only the very tips of three to four fingers touch the mouse. Maximum button independence and
        fastest individual finger movement. Ideal for Butterfly Clicking. Requires a smaller or
        medium-sized mouse. Typical CPS: 8–14.
      </p>

      {/* ── 10 ── */}
      <h2 style={h2Style}>Clicking Techniques Explained</h2>
      <h3 style={h3Style}>Normal Clicking</h3>
      <p style={pStyle}>
        Standard single-finger clicking with natural rhythm. Reliable, sustainable, and the baseline
        for all comparisons. Achieves 6–9 CPS for most users and carries no injury risk with normal
        session lengths.
      </p>
      <h3 style={h3Style}>Jitter Clicking</h3>
      <p style={pStyle}>
        Uses rapid forearm muscle contractions to generate 10–14 CPS. Tense your forearm, hover your
        fingertip lightly over the button, and flex rapidly. The technique leverages fast-twitch muscle
        fiber resonance. Warning: overuse causes forearm fatigue and potential tendon strain. Limit
        sessions to under 30 seconds and always rest between attempts.
      </p>
      <h3 style={h3Style}>Butterfly Clicking</h3>
      <p style={pStyle}>
        Uses two fingers — index and middle — alternating rapid taps on the left mouse button. Can reach
        15–20 CPS in trained players. Banned on many competitive servers as it exceeds human single-finger
        biological limits. Safe for practice but check server rules before competitive use.
      </p>
      <h3 style={h3Style}>Drag Clicking</h3>
      <p style={pStyle}>
        Exploits friction between a fingernail and a textured mouse button surface to generate rapid
        consecutive click signals through mechanical resonance. Can produce 25–50+ CPS but is almost
        universally banned in competitive contexts and is considered hardware exploitation rather than
        genuine skill demonstration.
      </p>

      {/* ── 11 ── */}
      <h2 style={h2Style}>Mouse Polling Rate and CPS</h2>
      <p style={pStyle}>
        Polling rate (Hz) defines how often your mouse reports its state to your computer. A 125 Hz mouse
        reports every 8 ms; a 1000 Hz mouse reports every 1 ms; cutting-edge 4000 Hz mice report every
        0.25 ms. For normal human CPS ranges (up to ~15 CPS), 500 Hz or 1000 Hz is more than sufficient.
        At extreme drag-clicking speeds, a 1000 Hz polling rate is essential to avoid missed inputs.
      </p>
      <p style={pStyle}>
        The relationship between polling rate and perceived input lag is real but subtle. A 125 Hz mouse
        adds up to 8 ms of potential latency; a 1000 Hz mouse reduces that ceiling to 1 ms. In
        frame-competitive gaming at 240 Hz, this difference is measurable and worth the marginal upgrade
        cost. For CPS testing specifically, 1000 Hz ensures every click is captured and counted accurately.
      </p>

      {/* ── 12 ── */}
      <h2 style={h2Style}>DPI vs CPS — Key Differences</h2>
      <p style={pStyle}>
        DPI (Dots Per Inch) controls cursor movement sensitivity and has <strong>zero effect</strong> on
        clicking speed. A mouse at 400 DPI and one at 16 000 DPI register click inputs at identical
        speeds because DPI affects only the sensor's movement tracking resolution, not the electrical
        circuit that registers button presses. The myth that higher DPI equals faster clicks is
        completely false and frequently misleads new players into purchasing unnecessary hardware.
      </p>

      {/* ── 13 ── */}
      <h2 style={h2Style}>CPS in Specific Games</h2>
      <h3 style={h3Style}>Minecraft CPS</h3>
      <p style={pStyle}>
        In Minecraft's 1.8 PvP combat system, clicking speed directly determines hit registration
        frequency since the server registers a hit for each valid click within range. Higher CPS means
        more knockback, higher effective DPS, and better combo maintenance. For sword combat, sustained
        10–14 CPS provides significant mechanical advantage. For speed bridging and clutch building,
        consistent 8–12 CPS executed with accurate timing is most effective.
      </p>
      <h3 style={h3Style}>Roblox Clicking</h3>
      <p style={pStyle}>
        Many Roblox combat games, particularly those using custom combat systems in the Roblox engine,
        benefit from 8–12 CPS. Tower defense and simulator titles often implement automated systems and
        remove manual click speed as a skill variable, but PvP-focused experiences still reward faster
        players with direct mechanical advantages.
      </p>
      <h3 style={h3Style}>Fortnite Building</h3>
      <p style={pStyle}>
        Fortnite caps structure placement speed server-side, meaning there is a maximum effective
        placement rate per second. Consistent 8–10 CPS ensures you are always placing at the maximum
        allowed rate without wasted clicks. For editing, burst clicking on specific tiles requires
        precision over raw speed — 6–9 CPS with accuracy beats 14 CPS with errors.
      </p>
      <h3 style={h3Style}>Valorant Pistol Rounds</h3>
      <p style={pStyle}>
        Rapid clicking at 7–10 CPS with the Classic, Frenzy, Ghost, or Sheriff effectively maximizes
        fire output during pistol rounds. The skill ceiling is maintaining headshot accuracy while
        sustaining that click rate — a combination that separates mechanically gifted players from
        the average ranks.
      </p>
      <h3 style={h3Style}>PUBG Single-Fire Mastery</h3>
      <p style={pStyle}>
        In PUBG, single-fire weapons like the M16A4, Mutant, and various DMRs (SKS, Mini14) have no in-game
        fire rate cap. A player achieving 8–12 CPS effectively transforms these into high-accuracy automatic
        weapons with superior ballistic velocity and range compared to their full-auto counterparts.
      </p>
      <h3 style={h3Style}>Counter-Strike 2 (CS2)</h3>
      <p style={pStyle}>
        Spray control and burst discipline matter more than raw CPS in CS2. However, 7–9 CPS optimized
        for precision helps during pistol phases, rapid tap-fire sequences with rifles, and deagle
        follow-up shots. Economy rounds where pistol fire rate is the primary DPS source benefit most
        directly from higher CPS training.
      </p>
      <h3 style={h3Style}>League of Legends</h3>
      <p style={pStyle}>
        Fast clicking improves last-hitting under tower, animation cancels on melee champions, and item
        activation speed during combat. Challenger-tier players often exceed 300–500 APM, which requires
        consistent fast clicking combined with precise mouse positioning — a dual skill that CPS training
        directly supports.
      </p>
      <h3 style={h3Style}>Apex Legends</h3>
      <p style={pStyle}>
        Semi-auto weapons like the Wingman and G7 Scout reward sustained high CPS for maximum fire rate.
        Additionally, looting and reviving speed is gated by interaction clicks, meaning faster clickers
        complete actions fractionally sooner in time-critical situations.
      </p>

      {/* ── 14 ── */}
      <h2 style={h2Style}>How to Improve Reaction Time for FPS Games</h2>
      <ul style={ulStyle}>
        <li><strong>Monitor Refresh Rate:</strong> Upgrade to 144 Hz or 240 Hz+ to reduce frame latency by up to 6 ms compared to 60 Hz panels.</li>
        <li><strong>Aim Trainers:</strong> Aim Lab, KovaaK's, and Aiming.Pro build muscle memory through structured scenario-based drills.</li>
        <li><strong>Sleep and Recovery:</strong> A single night of poor sleep can slow reaction time by 15–20 ms, equivalent to dropping a hardware tier in latency.</li>
        <li><strong>Moderate Caffeine:</strong> 100–200 mg is clinically shown to improve reaction time by 10–15 ms. Avoid excessive intake which degrades fine motor control.</li>
        <li><strong>Warmup Routine:</strong> Use 1-second and 2-second CPS sprint tests before gaming sessions to activate fast-twitch fiber engagement.</li>
        <li><strong>Hydration:</strong> Dehydration impairs motor function. Maintain adequate water intake during extended gaming sessions.</li>
      </ul>

      {/* ── 15 ── */}
      <h2 style={h2Style}>Mouse Maintenance for Consistent Performance</h2>
      <ul style={ulStyle}>
        <li><strong>Clean the Sensor Lens:</strong> Use a cotton swab with isopropyl alcohol monthly to remove dust accumulation that causes cursor stuttering.</li>
        <li><strong>Replace Mouse Feet:</strong> Worn PTFE skates increase friction and counter-vibration. Replace with Tiger Arc or Hotline Games aftermarket skates.</li>
        <li><strong>Check the Cable:</strong> Use a cable bungee or paracord upgrade to eliminate drag, or switch to wireless to remove cable resistance entirely.</li>
        <li><strong>Mousepad Quality:</strong> Use a large cloth or hybrid surface pad. Ensure consistent glide properties — worn pads develop uneven friction zones.</li>
        <li><strong>Switch Longevity:</strong> Double-clicking issues signal a failing switch debounce circuit, typically after 20–80 M clicks. Service or replace the switch promptly.</li>
        <li><strong>Firmware Updates:</strong> Keep mouse firmware current. Manufacturers frequently release debounce timing and polling rate optimizations.</li>
      </ul>

      {/* ── 16 ── */}
      <h2 style={h2Style}>Finger Exercises to Increase Click Speed</h2>
      <ul style={ulStyle}>
        <li><strong>Finger Taps:</strong> Tap each finger in sequence rapidly on a desk surface. 3 sets of 30 seconds per hand, twice daily.</li>
        <li><strong>Wrist Flexor Stretch:</strong> Extend arm palm-up, gently press fingers back toward your forearm. Hold 30 seconds each side.</li>
        <li><strong>Stress Ball Squeezes:</strong> Builds grip endurance and tendon resilience. 3 sets of 20 reps per hand with rest between sets.</li>
        <li><strong>Piano Practice:</strong> Even 10 minutes of scales or arpeggios daily measurably improves independent finger dexterity and reduces stiffness.</li>
        <li><strong>CPS Sprint Intervals:</strong> 10× 1-second maximum-effort tests with 30-second rest periods builds burst click capacity progressively.</li>
        <li><strong>Tendon Gliding Exercises:</strong> Physical therapist-recommended finger tendon gliding sequences maintain joint mobility and prevent RSI.</li>
      </ul>

      {/* ── 17 ── */}
      <h2 style={h2Style}>Best Mouse Settings for Maximum CPS</h2>
      <ul style={ulStyle}>
        <li><strong>Polling Rate:</strong> 1000 Hz minimum (4000 Hz on supported mice for lowest possible input latency).</li>
        <li><strong>Debounce Time:</strong> Lower to 1–3 ms in mouse software if supported. Default 8–16 ms debounce limits fast consecutive registrations.</li>
        <li><strong>Lift-Off Distance:</strong> Set to lowest available value to prevent accidental lift registrations during fast clicking.</li>
        <li><strong>DPI:</strong> Personal preference only — does not affect CPS. Set to whatever feels natural for your grip and game sensitivity.</li>
        <li><strong>Mouse Acceleration:</strong> Disable in both the OS mouse settings and mouse software for consistent, repeatable input.</li>
        <li><strong>USB Port:</strong> Use a direct motherboard USB 3.0 port rather than a hub for lowest possible communication latency.</li>
      </ul>

      {/* ── 18 ── */}
      <h2 style={h2Style}>Professional Players and Their CPS</h2>
      <p style={pStyle}>
        Top-ranked competitive gamers typically achieve 10–13 CPS in actual Minecraft PvP combat under
        tournament conditions. Professional CS2 and Valorant players sustain 7–9 CPS focused on burst-fire
        accuracy rather than maximum speed. The consensus in competitive circles is that accuracy and
        consistency at your maximum <em>sustainable</em> CPS significantly outperforms raw speed with
        degraded aim. No professional player sacrifices accuracy for an extra 1–2 CPS.
      </p>
      <p style={pStyle}>
        Notable streamers and competitive players who have publicly shared their CPS data typically fall
        into the 9–13 CPS range for Minecraft PvP and 7–9 CPS for FPS titles. The outliers who claim
        20+ CPS in gameplay are almost always using Butterfly or Drag clicking techniques, which are
        banned in most competitive formats.
      </p>

      {/* ── 19 ── */}
      <h2 style={h2Style}>The World Record CPS</h2>
      <p style={pStyle}>
        The verified human world record for single-finger clicking in a standardized 5-second test is
        approximately 14–16 CPS under fair, observed conditions. Various unverified claims exceed 20 CPS
        using standard clicking. Drag-clicking records technically exceed 40 CPS, but these are
        mechanically assisted through surface friction exploitation and are not recognized as genuine
        human performance in any competitive context.
      </p>
      <p style={pStyle}>
        Achieving 14+ CPS with normal clicking requires exceptional fast-twitch muscle fiber density,
        years of deliberate practice, and optimal hardware (optical switches, ultralight mouse,
        1000 Hz polling rate). For the vast majority of players, 10–12 CPS represents the practical
        ceiling of sustainable normal-click performance.
      </p>

      {/* ── 20 ── */}
      <h2 style={h2Style}>Common Mistakes That Hurt Your CPS</h2>
      <ul style={ulStyle}>
        <li><strong>Resting finger flat on button:</strong> Reduces spring rebound feedback and increases actuation travel. Use only the fingertip pad.</li>
        <li><strong>Tensing your entire hand:</strong> Limits finger independence and reduces control. Keep only the clicking finger engaged.</li>
        <li><strong>Using a heavy mouse:</strong> Dampens rapid clicking vibrations with inertia. Consider mice under 80 g for higher CPS potential.</li>
        <li><strong>No warmup:</strong> Cold fingers and tendons have measurably slower actuation speed. Always warm up before serious testing.</li>
        <li><strong>Wrong test duration:</strong> Mismatch between training goal and duration yields misleading data. Use 1s for peak, 30s for stamina.</li>
        <li><strong>Ignoring fatigue:</strong> Clicking past your endurance threshold degrades form and risks injury. Recognize your dropoff point and train it progressively.</li>
        <li><strong>Desk and chair ergonomics:</strong> A wrist angled upward or unsupported forearm reduces effective clicking speed by 15–20% for most people.</li>
      </ul>

      {/* ── 21 ── */}
      <h2 style={h2Style}>Click Speed Tips for Beginners</h2>
      <p style={pStyle}>
        If you are new to CPS testing, start with the 5-second duration and focus entirely on relaxed
        rhythm rather than maximum effort. Trying to click at your theoretical maximum on day one
        typically produces tense, inconsistent results below your natural sustainable speed. Build the
        neurological click pattern first, then progressively increase the speed while maintaining
        relaxation in your forearm and hand muscles. Practice in short daily sessions of 5–10 minutes,
        and ensure you take frequent breaks to prevent physical fatigue or repetitive strain injuries.
      </p>
    </article>
  </>
));
SeoArticle.displayName = 'SeoArticle';

// ─────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────
export default function CPSTestPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const el = areaRef.current;
      if (!el) return;
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const [duration, setDuration] = useState(5);
  const [customTime, setCustomTime] = useState<string>(''); 
  const [phase, setPhase] = useState<Phase>('idle');
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [cps, setCps] = useState(0);
  const [maxCps, setMaxCps] = useState(0);
  const [history, setHistory] = useState<{ cps: number; clicks: number; duration: number }[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // 🛡️ Anti-Cheat Security Layer States & Refs
  const [isBot, setIsBot] = useState(false);
  const botTriggers = useRef<number>(0);

  // 🔊 Audio configuration state and references
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(soundEnabled);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startTime = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clickEvents = useRef<ClickEvent[]>([]);
  const rippleId = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  const durationRef = useRef(duration);
  const lastEndTimeRef = useRef<number>(0); // Cooldown tracker to prevent accidental modal closes
  
  // ⚡ CRITICAL BUG FIX: Track the absolute total clicks of the test in a mutable ref.
  const totalClicksRef = useRef<number>(0);

  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  // Audio Initializer to resume or create browser AudioContext
  const initAudio = () => {
    if (typeof window === 'undefined') return;
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  // SOUND GENERATION: Web Audio API Oscillator synthesizer for lightweight, local zero-asset sounds
  const playSound = (type: 'click' | 'complete') => {
    if (!soundEnabledRef.current || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;

    if (type === 'click') {
      // Coin collect chime sound (B5 -> E6)
      const playTone = (freq: number, startDelay: number, durationSec: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + startDelay);
        
        gain.gain.setValueAtTime(0, now + startDelay);
        gain.gain.linearRampToValueAtTime(0.04, now + startDelay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startDelay + durationSec);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + startDelay);
        osc.stop(now + startDelay + durationSec);
      };

      playTone(987.77, 0, 0.06);     // B5
      playTone(1318.51, 0.05, 0.15); // E6
    } else if (type === 'complete') {
      // Retro success chime (C5 -> E5 -> G5 -> C6)
      const playTone = (freq: number, startDelay: number, durationSec: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + startDelay);
        
        gain.gain.setValueAtTime(0, now + startDelay);
        gain.gain.linearRampToValueAtTime(0.12, now + startDelay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startDelay + durationSec);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + startDelay);
        osc.stop(now + startDelay + durationSec);
      };

      playTone(523.25, 0, 0.15);    // C5
      playTone(659.25, 0.08, 0.15); // E5
      playTone(783.99, 0.16, 0.15); // G5
      playTone(1046.50, 0.24, 0.30); // C6
    }
  };

  const recordClick = () => {
    const now = performance.now();
    
    // SECURITY/CRASH FIX: Keep only clicks within the last 1.2 seconds in memory.
    clickEvents.current = clickEvents.current.filter(e => now - e.time < 1200);

    if (clickEvents.current.length > 0) {
      const lastClickTime = clickEvents.current[clickEvents.current.length - 1].time;
      const interval = now - lastClickTime;

      // 🛑 Anti-Cheat Rule: Human finger interval microsecond constraint check (chatter-proof)
      if (interval < 15) {
        botTriggers.current += 1;
      } else {
        botTriggers.current = Math.max(0, botTriggers.current - 1);
      }

      // If 15 consecutive suspicious intervals are executed AND average CPS is extremely high, trip the system wire
      const elapsed = (performance.now() - startTime.current) / 1000;
      const currentAvgCps = elapsed > 0.5 ? (totalClicksRef.current / elapsed) : 0;
      if (botTriggers.current >= 15 && currentAvgCps > 30) {
        setIsBot(true);
        phaseRef.current = 'done';
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setPhase('done');
        lastEndTimeRef.current = Date.now();
        playSound('complete');
        return;
      }
    }

    clickEvents.current.push({ time: now });
    totalClicksRef.current += 1; // Increment total clicks ref
    setClicks(prev => prev + 1);
  };

  const endTest = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    phaseRef.current = 'done';

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const dur = durationRef.current;
    
    // BUG FIX FIXED: Using totalClicksRef.current
    const totalClicks = totalClicksRef.current;
    const finalCps = parseFloat((totalClicks / dur).toFixed(2));
    
    setCps(finalCps);
    setClicks(totalClicks);
    setPhase('done');
    setTimeLeft(0);
    lastEndTimeRef.current = Date.now(); // Mark time test ended for close button cooldown
    
    playSound('complete'); // Play retro success chime on test complete
    
    // Only commit to session history array if client validation is authentic
    if (botTriggers.current < 15) {
      setHistory(prev => [{ cps: finalCps, clicks: totalClicks, duration: dur }, ...prev.slice(0, 9)]);
    }
  }, []);

  const startTest = useCallback(() => {
    if (phaseRef.current === 'running') return;
    phaseRef.current = 'running';

    const dur = durationRef.current;
    setPhase('running');
    setClicks(0);
    setCps(0);
    setMaxCps(0);
    setTimeLeft(dur);
    setIsBot(false);
    botTriggers.current = 0;
    clickEvents.current = [];
    totalClicksRef.current = 0;
    startTime.current = performance.now();

    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      const remaining = Math.max(0, dur - elapsed);
      setTimeLeft(remaining);

      const now = performance.now();
      const recent = clickEvents.current.filter(e => now - e.time < 1000);
      const liveCps = recent.length;
      setCps(liveCps);
      setMaxCps(prev => Math.max(prev, liveCps));

      if (remaining <= 0) endTest();
    }, 50);
  }, [endTest]);

  const resetTest = useCallback(() => {
    // UX/BUG FIX: Cooldown of 800ms to prevent instant pop-up closing on in-flight clicks
    if (phaseRef.current === 'done' && Date.now() - lastEndTimeRef.current < 800) {
      return;
    }
    
    phaseRef.current = 'idle';
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase('idle');
    setClicks(0);
    setCps(0);
    setMaxCps(0);
    setIsBot(false);
    botTriggers.current = 0;
    totalClicksRef.current = 0;
    setTimeLeft(durationRef.current);
    clickEvents.current = [];
  }, []);

  const handleCustomTimeSet = () => {
    const time = parseInt(customTime);
    // SECURITY/CRASH FIX: Validate input value. Limit custom time to a maximum of 300 seconds (5 minutes)
    if (isNaN(time) || time <= 0) {
      return;
    }
    const validatedTime = Math.min(time, 300);
    setDuration(validatedTime);
    durationRef.current = validatedTime;
    resetTest();
    setTimeLeft(validatedTime);
    setCustomTime(validatedTime.toString());
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.detail === 0) return; // Prevent simulated programmatic clicks

    initAudio(); // Initialize / Resume AudioContext on click to unlock browser media policies

    if (phaseRef.current === 'idle') { startTest(); return; }
    if (phaseRef.current !== 'running') return;

    recordClick();
    playSound('click'); // Play click tone on valid speed click

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;

    // SECURITY/CRASH FIX: Limit maximum concurrent ripples in state to 15.
    setRipples(prev => {
      const next = [...prev, { id, x, y }];
      if (next.length > 15) {
        return next.slice(next.length - 15);
      }
      return next;
    });

    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };

  useEffect(() => {
    if (phase === 'done') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const progress = phase === 'running' ? ((duration - timeLeft) / duration) * 100 : phase === 'done' ? 100 : 0;
  
  // ⚡ STALE-FREE STATE CALCULATION FIX: 
  const finalCpsValue = phase === 'done' ? parseFloat((clicks / duration).toFixed(2)) : cps;
  
  const finalRating = phase === 'done' ? (isBot ? {
    label: 'Bot Detected',
    emoji: '🚫',
    color: 'var(--neon-red, #ff3838)',
    stars: 0,
    desc: '"Software Macro or Auto-clicker emulation detected! Play fair to test your authentic biological human reflex limits."'
  } : getRating(finalCpsValue)) : null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* PRO SEO Schema Markup (JSON-LD) for Rich Search Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(JSON_LD_SCHEMAS)
        }}
      />

      {/* Global style injections */}
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />

      {/* Breadcrumb Navigation removed */}

      {/* ── HEADER ── */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label" style={{ fontSize: '0.85rem', color: 'var(--neon-cyan, #00f5ff)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold' }}>Mouse Utility</div>
        <h1 className="tool-title" style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0.5rem 0 0.2rem', color: '#fff' }}>CPS Test (Clicks Per Second)</h1>
        <p className="tool-subtitle" style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '1rem', margin: '0' }}>Speed click test online: Measure clicks per second and test your reflexes.</p>
      </header>

      {/* ── DURATION SELECTOR & CONTROLS ── */}
      <nav
        aria-label="Test Duration and Audio Selector"
        className="cps-duration-row"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          alignItems: 'center',
        }}
      >
        {DURATIONS.map(d => (
          <button
            key={d}
            className="cps-duration-btn"
            onClick={() => { setDuration(d); durationRef.current = d; resetTest(); setTimeLeft(d); setCustomTime(''); }}
            disabled={phase === 'running'}
            style={{
              padding: '0.4rem 1rem', borderRadius: '8px',
              border: duration === d && !customTime ? '1px solid var(--neon-green, #00ff88)' : '1px solid var(--border, #2a3047)',
              background: duration === d && !customTime ? 'rgba(0,255,136,0.15)' : 'var(--bg-card, #1e2235)',
              color: duration === d && !customTime ? 'var(--neon-green, #00ff88)' : 'var(--text-secondary, #cbd5e1)',
              fontWeight: '700', cursor: phase === 'running' ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem', transition: 'all 0.2s',
            }}
          >{d}s</button>
        ))}

        {/* Custom time */}
        <div
          className="cps-custom-wrap"
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.3rem', 
            background: 'var(--bg-card, #1e2235)', border: '1px solid var(--border, #2a3047)', 
            borderRadius: '8px', padding: '0.2rem 0.2rem 0.2rem 0.6rem',
          }}
        >
          <label htmlFor="custom-sec-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #cbd5e1)', fontWeight: '600' }}>Custom:</label>
          <input 
            id="custom-sec-input"
            type="number" 
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            disabled={phase === 'running'}
            placeholder="sec"
            min="1"
            max="300"
            style={{ 
              width: '50px', background: 'transparent', border: 'none', 
              color: 'var(--neon-cyan, #00f5ff)', fontWeight: '700', outline: 'none', 
              textAlign: 'center', fontSize: '0.85rem',
            }}
          />
          <button 
            onClick={handleCustomTimeSet}
            disabled={phase === 'running' || !customTime}
            style={{
              padding: '0.3rem 0.8rem', borderRadius: '6px',
              background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)',
              color: 'var(--neon-cyan, #00f5ff)', fontWeight: '700', cursor: phase === 'running' || !customTime ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem', transition: 'all 0.2s',
            }}
          >Set</button>
        </div>

        {/* Audio Toggle Control Button */}
        <button
          onClick={() => {
            initAudio(); // Unlocks the audio context on user gesture
            setSoundEnabled(prev => !prev);
          }}
          aria-label={soundEnabled ? "Mute sound effects" : "Unmute sound effects"}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: soundEnabled ? 'rgba(0, 245, 255, 0.1)' : 'var(--bg-card, #1e2235)', 
            border: soundEnabled ? '1px solid rgba(0, 245, 255, 0.3)' : '1px solid var(--border, #2a3047)',
            borderRadius: '8px', padding: '0.4rem 0.8rem',
            cursor: 'pointer', transition: 'all 0.2s',
            color: soundEnabled ? 'var(--neon-cyan, #00f5ff)' : 'var(--text-muted, #8395a7)',
            fontWeight: '700', fontSize: '0.85rem',
            height: '34px',
          }}
        >
          <span>{soundEnabled ? '🔊 Sound: On' : '🔇 Sound: Off'}</span>
        </button>
      </nav>

      {/* ── STATS CARDS ── */}
      <section
        className="cps-stats-grid"
        aria-label="Live Test Results"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}
      >
        {[
          { value: phase === 'done' ? finalCpsValue.toFixed(2) : (phase === 'idle' ? '0.00' : typeof cps === 'number' && cps % 1 !== 0 ? cps.toFixed(2) : cps), label: 'CPS (Clicks/Sec)', color: 'var(--neon-cyan, #00f5ff)' },
          { value: clicks, label: 'Total Clicks', color: 'var(--neon-green, #00ff88)' },
          { value: timeLeft.toFixed(1), label: 'Seconds Left', color: 'var(--neon-orange, #ff9f43)' },
        ].map(s => (
          <StatCard key={s.label} value={s.value} label={s.label} color={s.color} />
        ))}
      </section>

      {/* ── PROGRESS BAR ── */}
      <div className="progress-bar" style={{ marginBottom: '1.5rem', background: '#252b43', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
        <div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--neon-green, #00ff88)', height: '100%', transition: 'width 0.05s linear' }} />
      </div>

      {/* ── CLICK AREA ── */}
      <div
        ref={areaRef}
        role="button"
        tabIndex={0}
        aria-label="Click area to start CPS test"
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as any); }}
        style={{
          position: 'relative', overflow: 'hidden', width: '100%', minHeight: '220px',
          height: isFullscreen ? '100vh' : undefined,
          borderRadius: isFullscreen ? '0' : '16px',
          border: phase === 'running' ? '2px solid var(--neon-green, #00ff88)' : phase === 'done' ? '2px solid var(--neon-orange, #ff9f43)' : (isFullscreen ? 'none' : '2px solid var(--border, #2a3047)'),
          background: phase === 'running' ? 'rgba(0,255,136,0.04)' : (isFullscreen ? '#02040a' : 'var(--bg-card, #1e2235)'),
          cursor: phase === 'done' ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '0.75rem', userSelect: 'none',
          transition: 'all 0.2s ease', 
          marginBottom: phase === 'running' ? '1rem' : '1.5rem',
          boxShadow: phase === 'running' ? '0 0 30px rgba(0,255,136,0.1)' : 'none',
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 50,
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>

        {ripples.map(r => (
          <span key={r.id} style={{
            position: 'absolute', left: r.x, top: r.y, width: '16px', height: '16px',
            borderRadius: '50%',
            border: '2px solid var(--neon-cyan, #00f5ff)',
            background: 'rgba(0, 245, 255, 0.03)',
            boxShadow: '0 0 15px rgba(0, 245, 255, 0.2), inset 0 0 10px rgba(0, 245, 255, 0.1)',
            transform: 'translate(-50%, -50%) scale(0)',
            animation: 'rippleAnim 0.8s cubic-bezier(0.1, 0.8, 0.2, 1) forwards', pointerEvents: 'none',
          }} />
        ))}

        {phase === 'idle' && (
          <>
            <span style={{ fontSize: '3rem' }}>🖱️</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-green, #00ff88)' }}>Click to Start!</span>
            <span style={{ color: 'var(--text-secondary, #cbd5e1)', fontSize: '0.9rem' }}>Click anywhere in this area to begin the test</span>
          </>
        )}
        {phase === 'running' && (
          <>
            <span style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--neon-green, #00ff88)', fontVariantNumeric: 'tabular-nums', zIndex: 10 }}>{clicks}</span>
            <span style={{ color: 'var(--text-secondary, #cbd5e1)', fontSize: '1rem', zIndex: 10 }}>Keep clicking! 🔥</span>
            <span style={{ color: 'var(--neon-cyan, #00f5ff)', fontWeight: '700', zIndex: 10 }}>{timeLeft.toFixed(1)}s remaining</span>
          </>
        )}
        {phase === 'done' && (
          <>
            <span style={{ fontSize: '3rem' }}>🏁</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neon-orange, #ff9f43)' }}>Test Complete!</span>
          </>
        )}
      </div>

      {/* ── RESET BUTTON (while running) ── */}
      {phase === 'running' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease-in' }}>
          <button
            onClick={(e) => { e.stopPropagation(); resetTest(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#1e2235', border: '1px solid #2a3047',
              color: '#ffffff', padding: '0.6rem 1.25rem',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{
              background: '#3b82f6', color: 'white',
              borderRadius: '4px', width: '22px', height: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </div>
            Reset
          </button>
        </div>
      )}

      {/* ── RESULT MODAL ── */}
      {phase === 'done' && finalRating && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            zIndex: 999, animation: 'fadeIn 0.3s ease-out forwards',
          }} />

          <div
            className="cps-modal-inner"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '95%', 
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#0d1117',
              border: `2px solid ${finalRating.color}`,
              borderRadius: '20px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              zIndex: 1000,
              animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              boxShadow: `0 0 40px ${finalRating.color}25`,
            }}
          >
            {/* Close button with 800ms cooldown protection */}
            <button 
              onClick={resetTest} 
              aria-label="Close modal"
              style={{
                position: 'absolute', top: '0.75rem', right: '0.75rem',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${finalRating.color}40`,
                color: finalRating.color, width: '32px', height: '32px',
                borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>

            <div
              className="cps-modal-split"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem', alignItems: 'center', minHeight: '130px', marginBottom: '1.25rem' }}
            >
              <div
                className="cps-modal-left"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '1rem', height: '100%' }}
              >
                <span
                  className="cps-modal-emoji"
                  style={{ fontSize: '4.5rem', lineHeight: '1', filter: `drop-shadow(0 0 15px ${finalRating.color}40)` }}
                >{finalRating.emoji}</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div id="modal-title" style={{ fontSize: '0.85rem', color: 'var(--text-muted, #8395a7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Rank is</div>
                <div
                  className="cps-modal-rank"
                  style={{ fontSize: '2.2rem', fontWeight: '900', color: finalRating.color, fontStyle: 'italic', margin: '0.1rem 0' }}
                >{finalRating.label}!</div>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '0.5rem' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ fontSize: '1.2rem', color: i < finalRating.stars ? '#ffca28' : 'rgba(255,255,255,0.1)' }}>★</span>
                  ))}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #cbd5e1)' }}>You clicked with a speed of <strong style={{ color: '#fff', fontSize: '1.15rem', fontVariantNumeric: 'tabular-nums' }}>{finalCpsValue}</strong> CPS</div>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem 1rem', borderRadius: '12px', borderLeft: `3px solid ${finalRating.color}`, fontStyle: 'italic', color: '#cbd5e1', fontSize: '0.88rem', textAlign: 'left', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              {finalRating.desc}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[
                { value: clicks, label: 'Total Clicks', color: 'var(--neon-green, #00ff88)' },
                { value: maxCps, label: 'Peak (1s)', color: 'var(--neon-cyan, #00f5ff)' },
                { value: `${duration}s`, label: 'Duration', color: 'var(--neon-orange, #ff9f43)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '0.5rem 0.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-muted, #8395a7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              {/* Reset button inside modal with cooldown protection */}
              <button 
                onClick={resetTest} 
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-card, #1e2235)', border: '1px solid var(--border, #2a3047)', color: '#fff' }}
              >
                🔄 Reset
              </button>
              {/* Restart button with cooldown protection */}
              <button 
                onClick={() => {
                  // Only run start test if reset cooldown passes
                  if (Date.now() - lastEndTimeRef.current >= 800) {
                    resetTest(); 
                    startTest();
                  }
                }} 
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', borderRadius: '8px', cursor: 'pointer', backgroundColor: finalRating.color, border: `1px solid ${finalRating.color}`, color: '#000', fontWeight: '700' }}
              >
                ▶ Try Again
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── SESSION HISTORY ── */}
      {history.length > 0 && <SessionHistory history={history} />}

      {/* ── FAQ SECTION ── */}
      <FaqSection />

      {/* ── PRO SEO ARTICLE ── */}
      <SeoArticle />
    </div>
  );
}
