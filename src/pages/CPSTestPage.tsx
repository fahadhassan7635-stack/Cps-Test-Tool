import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  memo,
} from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Maximize2, Minimize2, ExternalLink } from 'lucide-react';

// ─────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────
type Phase = 'idle' | 'running' | 'done';
type ClickMode = 'left' | 'right';
interface ClickEvent { time: number; }
interface RippleItem { id: number; x: number; y: number; color: string; }
interface HistoryItem { cps: number; clicks: number; duration: number; }
interface GraphPoint { t: number; cps: number; }
interface TooltipData { x: number; y: number; t: number; rtCps: number; avgCps: number; }
interface RatingResult { label: string; emoji: string; color: string; stars: number; desc: string; }

const DURATIONS: number[] = [1, 2, 5, 10, 15, 30, 60];

// ─────────────────────────────────────────────
// STYLE CONSTANTS (stable references — no object churn per render)
// ─────────────────────────────────────────────
const h2Style: CSSProperties = {
  color: 'var(--neon-green, #00ff88)',
  fontSize: '1.5rem',
  fontWeight: '700',
  margin: '2.5rem 0 1rem',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  paddingBottom: '0.5rem',
};
const h3Style: CSSProperties = {
  color: 'var(--neon-orange, #ff9f43)',
  fontSize: '1.15rem',
  fontWeight: '700',
  margin: '1.5rem 0 0.5rem',
};
const pStyle: CSSProperties = {
  marginBottom: '1.25rem',
  color: '#9ca3af',
};
const ulStyle: CSSProperties = {
  marginBottom: '1.5rem',
  paddingLeft: '1.5rem',
  color: '#9ca3af',
  lineHeight: '1.9',
};
const codeStyle: CSSProperties = {
  background: 'rgba(0,245,255,0.1)',
  padding: '1px 6px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '0.9em',
  color: 'var(--neon-cyan, #00f5ff)',
};

// ─────────────────────────────────────────────
// ARTICLE RESEARCH LINK (external reference citation used inside SeoArticle)
// ─────────────────────────────────────────────
const ArticleLink = memo(({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer nofollow"
    style={{
      color: 'var(--neon-cyan, #00f5ff)',
      textDecoration: 'none',
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '3px',
      borderBottom: '1px dashed rgba(0,245,255,0.4)',
    }}
  >
    {children}
    <ExternalLink size={13} style={{ position: 'relative', top: '1px', flexShrink: 0 }} />
  </a>
));
ArticleLink.displayName = 'ArticleLink';

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
    0%   { transform:translate(-50%,-50%) scale(0);    opacity:0.45; }
    50%  { transform:translate(-50%,-50%) scale(0.8);  opacity:0.22; }
    100% { transform:translate(-50%,-50%) scale(1.2);  opacity:0;    }
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
function getRating(c: number): RatingResult {
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
    q: "What is the best free CPS Test online?",
    a: "FixedAim's CPS Test at fixedaim.com/cps-test is a free, no-download click speed test that supports left click and right click modes, custom durations from 1 to 300 seconds, a live real-time CPS graph, session history, and anti-cheat detection. It works on PC, Mac, mobile, and tablet.",
  },
  {
    q: "How do I test my click speed online?",
    a: "Visit fixedaim.com/cps-test, select a test duration (default is 5 seconds), then click the large click area to start. Click as fast as possible until the timer runs out. Your CPS score, total clicks, peak CPS, and performance rank are shown instantly when the test ends.",
  },
  {
    q: "What is CPS in gaming?",
    a: "CPS stands for Clicks Per Second — the number of times you can click your mouse button in one second. In gaming, especially Minecraft PvP, higher CPS gives more hit registrations and better combat performance. Most gamers aim for 6–12 CPS depending on their game and playstyle.",
  },
  {
    q: "Is this CPS Test accurate?",
    a: "Yes. The tool uses the browser's performance.now() API for sub-millisecond click timestamping, a 50ms polling interval for live updates, and a dedicated click counter that is separate from the rolling-window memory used for live CPS display — making it immune to auto-clicker pruning. Every registered click is counted in the final score.",
  },
  {
    q: "What is a CPS Test?",
    a: "A CPS Test (Clicks Per Second Test) measures how many times you can click a mouse button within a set time period. It is used by gamers, hardware testers, and competitive players to benchmark their clicking speed and reflex ability.",
  },
  {
    q: "What is a good CPS score?",
    a: "For casual users, 5–7 CPS is normal. Competitive gamers typically reach 8–12 CPS. Professional Minecraft PvP players using Butterfly or Jitter techniques can achieve 14–20+ CPS.",
  },
  {
    q: "How do I improve my CPS?",
    a: "Practice daily using 1–5 second burst tests. Adopt a claw or fingertip grip, use a lightweight mouse, ensure your polling rate is 1000 Hz, and progressively learn Jitter or Butterfly Clicking techniques.",
  },
  {
    q: "Does CPS matter in gaming?",
    a: "Yes — especially in Minecraft PvP, PUBG single-fire modes, Fortnite building, and MOBA micro. Higher CPS directly translates to more hits per second, faster item use, and quicker ability rotations.",
  },
  {
    q: "Can CPS be trained over time?",
    a: "Absolutely. With consistent daily practice of 5–10 minutes, many users report noticeable improvement in CPS within a few weeks. Finger mobility exercises and interval sprint sessions accelerate progress.",
  },
  {
    q: "Is Butterfly Clicking cheating in Minecraft?",
    a: "Some competitive servers restrict or ban Butterfly Clicking because it can exceed typical single-finger click rates. Always check the specific server rules before using this technique.",
  },
  {
    q: "Is Drag Clicking allowed on servers?",
    a: "Drag Clicking is banned on virtually all competitive servers because it produces 25–50+ CPS through mechanical friction rather than genuine human clicking. It is also considered hardware exploitation.",
  },
  {
    q: "What mouse is best for high CPS?",
    a: "Ultralight mice with optical switches (like Razer Viper V3 Pro, Logitech G Pro X Superlight 2, or Glorious Model O 2) are ideal. Look for mice under 80 g with switches rated for 50 M+ clicks and low actuation force.",
  },
  {
    q: "Does DPI affect CPS?",
    a: "No. DPI controls cursor movement sensitivity and has no effect on clicking speed. CPS is determined purely by your finger biomechanics and mouse switch actuation speed.",
  },
  {
    q: "Can mobile users take the CPS Test?",
    a: "Yes. The test supports touch input on mobile and tablet devices. Tap the click zone to start. Note that mobile CPS is typically lower (2–5 CPS) due to touchscreen response latency.",
  },
  {
    q: "What games need high CPS the most?",
    a: "Minecraft 1.8 PvP, PUBG: Battlegrounds (semi-auto weapons), Roblox combat games, Fortnite building, and any game with manual-fire mechanics. MOBA games also benefit from fast clicking for last-hits and micro.",
  },
  {
    q: "What is Jitter Clicking?",
    a: "Jitter Clicking is a technique where you rapidly tense and relax your forearm muscles to generate vibrations that translate into fast mouse clicks, typically producing 10–14 CPS. Overuse can cause forearm strain.",
  },
  {
    q: "Can high CPS damage your hand?",
    a: "Yes. Aggressive clicking techniques stress forearm tendons and wrist joints, potentially causing Repetitive Strain Injury (RSI). Take regular breaks, stretch, and stop immediately if you feel any pain.",
  },
  {
    q: "What is the world record CPS?",
    a: "Unofficial community records suggest top single-finger clicking speeds of around 14–16 CPS in 5-second tests. Drag-clicking figures exceed 40 CPS but are mechanically assisted and not widely recognized as standard human performance.",
  },

  {
    q: "What is the difference between CPS and APM?",
    a: "CPS measures raw mouse click speed. APM (Actions Per Minute) is a broader metric used in strategy games that includes all mouse clicks, keyboard inputs, and ability activations. High CPS contributes to high APM.",
  },
  {
    q: "How does the anti-cheat system work?",
    a: "The system analyzes click intervals for biological impossibility, entropy of timing patterns, mouse movement activity, tab/window visibility events, and untrusted synthetic event flags to detect macros and auto-clickers.",
  },
  {
    q: "What is the best test duration for benchmarking?",
    a: "The 5-second test is the industry standard. Use 1-second tests for peak burst measurement, 10-second tests for consistency evaluation, and 30-second tests for stamina and fatigue-curve analysis.",
  },
  {
    q: "Does mouse weight affect CPS?",
    a: "Yes. Lighter mice (under 80 g) require less energy and generate less counter-vibration during fast clicking. Ultralight mice can improve sustainable CPS by 1–3 points over heavier alternatives.",
  },
  {
    q: "Can I use a trackpad for the CPS Test?",
    a: "Yes, but trackpad CPS is significantly lower (2–4 CPS typical) because trackpad surfaces have higher physical resistance and slower mechanical feedback compared to dedicated mouse buttons.",
  },
  {
    q: "What is a Right Click CPS Test?",
    a: "A Right Click CPS Test measures how many times you can right-click your mouse button within a set time period. It uses the same precision timing as the left-click test but registers only right mouse button inputs, making it ideal for benchmarking your ring or middle finger speed independently.",
  },
  {
    q: "Is right click CPS faster or slower than left click CPS?",
    a: "For most users, right click CPS is 1–3 points lower than left click CPS. The right mouse button is typically operated by the ring or middle finger, which has less fast-twitch muscle fiber density and weaker independent motor control compared to the index finger used for left clicking.",
  },
  {
    q: "Why does right click speed matter in gaming?",
    a: "Right click speed is critical in games where the right button controls abilities, ADS (Aim Down Sights), block actions, or context menus. In Minecraft, right-clicking places blocks and uses items — faster right-click CPS means faster bridging, item use, and ability cycling. In many RPGs and MOBAs, right click governs movement commands and attack targeting.",
  },
  {
    q: "Does right clicking carry any injury risk?",
    a: "Yes. Rapid right clicking engages the ring finger extensor tendons which are generally weaker and less conditioned than the index finger. Prolonged high-speed right clicking can cause lateral forearm strain. Limit right click sprint sessions to under 30 seconds and stretch between attempts.",
  },
  {
    q: "How do I switch between Left Click and Right Click test modes?",
    a: "Use the Left / Right mode toggle in the control bar above the click area. Switching modes resets the current test. In Right Click mode, the browser context menu is disabled inside the click area so your right clicks are counted accurately without interruption.",
  },
  {
    q: "What is a good right click CPS score?",
    a: "A score of 4–6 right CPS is average for casual users. Competitive players typically achieve 6–9 right CPS. Scores above 10 right CPS are considered elite and require deliberate daily practice targeting ring finger independence and speed.",
  },
  {
    q: "Can I train my right click speed separately?",
    a: "Yes. Use the Right Click mode in short daily sessions — 5 to 10 repeats of 5-second tests with 30-second rest periods. This builds independent ring finger fast-twitch endurance without cross-contaminating your left click muscle memory.",
  },
];

// ─────────────────────────────────────────────
// JSON-LD SCHEMA DATA (stable constant)
// ─────────────────────────────────────────────
const JSON_LD_SCHEMAS: object[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CPS Test — Free Click Speed Test, CPS Counter & Kohi Click Test | FixedAim',
    alternateName: ['Click Speed Test', 'Clicks Per Second Test', 'CPS Counter', 'CPS Tester', 'Click Test', 'Kohi Click Test', 'Mouse Click Test', 'Right Click Test', 'Jitter Click Test', 'Butterfly Click Test', 'Click Speed Checker', 'CPS Test Unblocked'],
    description:
      'Free CPS Test & Click Speed Test — measure clicks per second (CPS) with left click, right click, jitter click, and butterfly click modes. Kohi click test inspired. Live CPS graph, session history, anti-cheat. Works on PC, mobile & tablet. No download.',
    applicationCategory: 'GameApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    url: 'https://fixedaim.com/cps-test',
    sameAs: ['https://fixedaim.com/cps-test'],
    inLanguage: 'en',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    featureList: [
      'Left Click CPS Test',
      'Right Click CPS Test',
      'Real-time CPS Graph',
      'Multiple test durations (1s to 300s)',
      'Custom duration input',
      'Live CPS counter',
      'Anti-cheat detection',
      'Session history table',
      'Sound effects toggle',
      'Mobile and tablet friendly',
      'No download or registration required',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://fixedaim.com/cps-test',
    name: 'CPS Test — Free Click Speed Test, CPS Counter & Kohi Click Test Online',
    description: 'Free CPS Test & click speed test — measure clicks per second (CPS), test jitter click, right click, butterfly click speed. Kohi click test style. Live graph, anti-cheat, session history. Works on PC, mobile & tablet.',
    url: 'https://fixedaim.com/cps-test',
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: 'FixedAim', url: 'https://fixedaim.com' },
    about: { '@type': 'Thing', name: 'CPS Test', description: 'A tool that measures mouse clicks per second (CPS) for gaming performance benchmarking.' },
    keywords: 'CPS test, click speed test, clicks per second, CPS counter, click test, kohi click test, jitter click test, butterfly click test, drag click test, right click test, mouse click test, CPS checker, click counter, click speed checker, how fast can i click, clicks per second test, cps tester, gaming mouse test, minecraft pvp cps, cps test unblocked',
    mainEntity: { '@type': 'SoftwareApplication', name: 'CPS Test', url: 'https://fixedaim.com/cps-test' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://fixedaim.com' },
      { '@type': 'ListItem', position: 2, name: 'Mouse Tools', item: 'https://fixedaim.com/mouse-tools' },
      { '@type': 'ListItem', position: 3, name: 'CPS Test',    item: 'https://fixedaim.com/cps-test' },
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
    name: 'How to Do a CPS Test — Measure Clicks Per Second Online',
    description: 'Step-by-step guide to measuring your left and right click speed in clicks per second (CPS) online for free.',
    step: [
      { '@type': 'HowToStep', name: 'Select Duration',   text: 'Choose a test duration from 1 to 60 seconds, or enter a custom value up to 300 seconds.' },
      { '@type': 'HowToStep', name: 'Start the Test',    text: 'Click the large click area to begin the countdown timer.' },
      { '@type': 'HowToStep', name: 'Click Rapidly',     text: 'Click as fast as you can within the click area during the test period.' },
      { '@type': 'HowToStep', name: 'View Your Results', text: 'When time runs out, your CPS score, total clicks, and rank are displayed in the results modal.' },
      { '@type': 'HowToStep', name: 'Try Again',         text: 'Click Try Again to immediately start a new test and compare your scores in the session history.' },
    ],
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
const SessionHistory = memo(({ history }: { history: HistoryItem[] }) => (
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
  const [showAll, setShowAll] = useState<boolean>(false);
  const visibleFaqs = showAll ? FAQ_DATA : FAQ_DATA.slice(0, 8);

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
        {visibleFaqs.map((faq, i) => {
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
      {!showAll && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={() => setShowAll(true)}
            style={{
              background: 'rgba(0,245,255,0.08)',
              border: '1px solid rgba(0,245,255,0.25)',
              color: 'var(--neon-cyan, #00f5ff)',
              padding: '0.6rem 1.8rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem',
              transition: 'all 0.2s',
            }}
          >
            Show all {FAQ_DATA.length} FAQs ↓
          </button>
        </div>
      )}
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
        CPS Test — The Complete Guide to Click Speed Testing
      </h2>

      <p style={{ marginBottom: '1.25rem', fontSize: '1rem', color: '#d1d5db' }}>
        A <strong>CPS Test</strong> measures how many times you can click your mouse per second. It is
        one of the most widely used tools for benchmarking mouse performance and training click speed
        for competitive gaming — especially Minecraft PvP, where clicking faster means landing more hits.
      </p>
      <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#d1d5db' }}>
        Whether you are an FPS player looking to improve reaction speed, a Minecraft player working on
        jitter or butterfly technique, or just curious how fast you can click — this free tool gives you
        precise, real-time results with no download or account required. This guide covers how CPS is
        calculated, what scores mean across different games, and how to improve your click speed over time.
      </p>

      {/* ── 1 ── */}
      <h2 style={h2Style}>What is a CPS Test?</h2>
      <p style={pStyle}>
        A <strong>CPS Test</strong> measures how many mouse clicks you can register within a defined time
        window, expressed as Clicks Per Second (CPS). Our tool is modeled after the original Kohi Click Test
        format — the community standard for Minecraft PvP benchmarking — and adds right click mode, a live
        real-time graph, session history, and anti-cheat detection. The test starts the moment you first click the
        target area and runs for your chosen duration — anywhere from one second to several minutes. At the
        end, your total clicks are divided by the elapsed seconds to produce a final CPS score, benchmarked
        against human performance tiers. Unlike simple click counters, a precision CPS tool uses the
        browser's high-resolution <code style={codeStyle}>performance.now()</code> API for sub-millisecond
        event timestamping, ensuring your score reflects genuine hardware and biological performance.
      </p>
      <p style={pStyle}>
        Modern tools go beyond simple counting. They incorporate live rolling-window calculations,
        peak-burst measurements, stamina tracking, and anti-cheat detection to distinguish genuine
        clicking from macros or hardware exploits. Originally popularized by the Kohi Click Test on
        Minecraft's competitive servers, the CPS test has since become a standard benchmark across
        all genres of competitive gaming — from Minecraft PvP to FPS and MOBA titles.
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
      <h3 style={h3Style}>Approximate CPS Ranges by Age Group</h3>
      <p style={{...pStyle, fontSize: '0.82rem', color: '#6b7280', fontStyle: 'italic', marginBottom: '0.5rem'}}>Approximate community benchmarks — individual results vary significantly by technique, hardware, and practice.</p>
      <ul style={ulStyle}>
        <li><strong>Under 13:</strong> 3–6 CPS — developing motor coordination</li>
        <li><strong>13–17:</strong> 6–9 CPS — peak learning and adaptation phase</li>
        <li><strong>18–25:</strong> 7–10 CPS — peak biological reflex speed</li>
        <li><strong>26–35:</strong> 6–9 CPS — sustained with experience</li>
        <li><strong>36–50:</strong> 5–8 CPS — slight reaction time increase</li>
        <li><strong>50+:</strong> 3–6 CPS — motor speed naturally declines</li>
      </ul>
      <p style={pStyle}>
        These are approximate community-observed ranges based on self-reported CPS test results — not
        clinical measurements. Individual scores vary widely based on mouse hardware, technique, and
        practice level. Age-related patterns reflect general motor development trends rather than
        fixed biological limits. Players in the 18–25 range often show a useful combination of
        motor speed and developed technique, though consistent practice matters more than age alone.
      </p>

      {/* ── 6 ── */}
      <h3 style={h3Style}>Typical CPS Ranges by Gamer Type</h3>
      <ul style={ulStyle}>
        <li><strong>Casual Desktop User:</strong> 4–6 CPS</li>
        <li><strong>Mobile Gamer (tap):</strong> 2–4 CPS</li>
        <li><strong>PC Gamer (general):</strong> 6–8 CPS</li>
        <li><strong>Competitive FPS Player:</strong> 7–10 CPS</li>
        <li><strong>Minecraft PvP Specialist:</strong> 8–14 CPS</li>
        <li><strong>Professional eSports Athlete:</strong> 10–15+ CPS</li>
      </ul>

      {/* ── 7 ── */}
      <h3 style={h3Style}>Typical CPS Ranges by Mouse Type</h3>
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
      <h3 style={h3Style}>Typical CPS Ranges by Device Type</h3>
      <ul style={ulStyle}>
        <li><strong>Gaming Desktop + Mouse:</strong> 8–15 CPS (highest)</li>
        <li><strong>Laptop + External Mouse:</strong> 7–12 CPS</li>
        <li><strong>Laptop Trackpad:</strong> 2–4 CPS</li>
        <li><strong>Smartphone (tap):</strong> 3–6 CPS</li>
        <li><strong>Tablet (tap):</strong> 4–7 CPS</li>
      </ul>

      {/* ── 9 ── */}
      <h3 style={h3Style}>Best Mouse Grip Styles for High CPS</h3>
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
      <h2 style={h2Style}>Clicking Techniques Explained — Jitter Click, Butterfly Click, Drag Click &amp; More</h2>
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
        fiber resonance. Warning: overuse causes forearm fatigue and potential tendon strain — see the{' '}
        <ArticleLink href="https://my.clevelandclinic.org/health/diseases/17424-repetitive-strain-injury">
          Cleveland Clinic's overview of repetitive strain injury
        </ArticleLink>{' '}
        for prevention and symptom guidance. Limit sessions to under 30 seconds and always rest between attempts.
      </p>
      <h3 style={h3Style}>Butterfly Clicking</h3>
      <p style={pStyle}>
        Uses two fingers — index and middle — alternating rapid taps on the left mouse button. Can reach
        15–20 CPS in trained players. Some competitive servers restrict or ban Butterfly Clicking due to its
        high click rate. Safe for personal practice but always verify server rules before competitive use.
      </p>
      <h3 style={h3Style}>Drag Clicking</h3>
      <p style={pStyle}>
        Exploits friction between a fingernail and a textured mouse button surface to generate rapid
        consecutive click signals through mechanical resonance. Can produce 25–50+ CPS but is almost
        universally banned in competitive contexts and is considered hardware exploitation rather than
        genuine skill demonstration.
      </p>

      {/* ── 11 ── */}
      <h3 style={h3Style}>Mouse Polling Rate and CPS</h3>
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
      <h3 style={h3Style}>DPI vs CPS — Key Differences</h3>
      <p style={pStyle}>
        DPI (Dots Per Inch) controls cursor movement sensitivity and has <strong>zero effect</strong> on
        clicking speed. A mouse at 400 DPI and one at 16 000 DPI register click inputs at identical
        speeds because DPI affects only the sensor's movement tracking resolution, not the electrical
        circuit that registers button presses. The myth that higher DPI equals faster clicks is
        completely false and frequently misleads new players into purchasing unnecessary hardware.
      </p>

      {/* ── 13 ── */}
      <h2 style={h2Style}>CPS in Specific Games</h2>
      <p style={pStyle}>
        Click speed training pairs directly with other mouse skill tools. After benchmarking your CPS
        here, consider also testing your{' '}
        <a href="/reaction-time" style={{color:'var(--neon-cyan,#00f5ff)',textDecoration:'none',fontWeight:700,borderBottom:'1px dashed rgba(0,245,255,0.4)'}}>Reaction Time</a>,{' '}
        <a href="/aim-trainer" style={{color:'var(--neon-cyan,#00f5ff)',textDecoration:'none',fontWeight:700,borderBottom:'1px dashed rgba(0,245,255,0.4)'}}>Aim Accuracy</a>,{' '}
        <a href="/double-click" style={{color:'var(--neon-cyan,#00f5ff)',textDecoration:'none',fontWeight:700,borderBottom:'1px dashed rgba(0,245,255,0.4)'}}>Double Click Speed</a>,{' '}
        <a href="/mouse-accuracy" style={{color:'var(--neon-cyan,#00f5ff)',textDecoration:'none',fontWeight:700,borderBottom:'1px dashed rgba(0,245,255,0.4)'}}>Mouse Accuracy</a>, or{' '}
        <a href="/scroll-test" style={{color:'var(--neon-cyan,#00f5ff)',textDecoration:'none',fontWeight:700,borderBottom:'1px dashed rgba(0,245,255,0.4)'}}>Scroll Speed</a>{' '}
        — all available free on FixedAim.
      </p>
      <h3 style={h3Style}>Minecraft CPS</h3>
      <p style={pStyle}>
        In Minecraft's 1.8 PvP combat system, clicking speed directly determines hit registration
        frequency since the server registers a hit for each valid click within range. Higher CPS means
        more knockback, higher effective DPS, and better combo maintenance. For sword combat, sustained
        10–14 CPS provides significant mechanical advantage. For speed bridging and clutch building,
        consistent 8–12 CPS executed with accurate timing is most effective. The{' '}
        <ArticleLink href="https://www.mcrpg.com/kohi-click-test/">Kohi Click Test</ArticleLink>{' '}
        — originally featured on the Kohi Minecraft server — became the gold standard benchmark for PvP
        clicking speed and directly inspired modern CPS testing tools. For the full technical
        breakdown of how the attack cooldown meter and hit timing actually work in Java Edition, see the{' '}
        <ArticleLink href="https://minecraft.wiki/w/Melee_attack">Minecraft Wiki's melee attack page</ArticleLink>.
        Spend 10 minutes daily in this CPS test to build the speed and rhythm that carries over to real
        PvP sessions on servers like <ArticleLink href="https://hypixel.net/">Hypixel</ArticleLink>{' '}
        or practice on{' '}
        <ArticleLink href="https://www.lunarclient.com/tools/kohi-click-test">Lunar Client's Kohi test</ArticleLink>.
      </p>
      <h3 style={h3Style}>Popular Minecraft PvP Servers to Practice CPS</h3>
      <p style={pStyle}>
        Once you have benchmarked your CPS, these competitive Minecraft PvP servers provide real in-game
        environments where your click speed translates directly into performance outcomes:
      </p>
      <ul style={ulStyle}>
        <li>
          <strong><ArticleLink href="https://donutsmp.net/">DonutSMP</ArticleLink></strong>{' '}
          (IP: donutsmp.net) — Dr Donut's hardcore survival PvP server. Economy-driven combat where
          sustained high CPS determines who survives fights over loot and territory.
        </li>
        <li>
          <strong><ArticleLink href="https://mcpvp.com/">McPvP / McTiers</ArticleLink></strong>{' '}
          — Dream and DrDonut's competitive MCPVP platform with ranked matches across 30+ countries.
          The closest Minecraft has come to a structured esports infrastructure.
        </li>
        <li>
          <strong><ArticleLink href="https://minemen.club/">Minemen Club</ArticleLink></strong>{' '}
          (IP: minemen.club) — The gold standard for PvP practice. Nodebuff, Boxing, Sumo, and
          Bridging modes with leaderboards make it the most used server for CPS training in real combat.
        </li>
        <li>
          <strong><ArticleLink href="https://na.badlion.net/">Badlion Network</ArticleLink></strong>{' '}
          (IP: na.badlion.net) — ArenaPvP, UHC, and Survival Games with strict anti-cheat.
          A trusted competitive environment where genuine click speed matters.
        </li>
        <li>
          <strong><ArticleLink href="https://www.pika-network.net/">PikaNetwork</ArticleLink></strong>{' '}
          (IP: play.pika-network.net) — Java and Bedrock compatible, with KitPvP and Practice PvP
          modes offering sharp hit detection across all skill levels.
        </li>
      </ul>

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
        the average ranks. Full agent kits, weapon stats, and patch notes live on the{' '}
        <ArticleLink href="https://playvalorant.com/en-us/">official VALORANT site</ArticleLink>.
      </p>
      <h3 style={h3Style}>PUBG Single-Fire Mastery</h3>
      <p style={pStyle}>
        In PUBG, single-fire weapons like the M16A4, Mutant, and various DMRs (SKS, Mini14) have no in-game
        fire rate cap. A player achieving 8–12 CPS effectively transforms these into high-accuracy automatic
        weapons with superior ballistic velocity and range compared to their full-auto counterparts. Current
        weapon balance patches and ballistics data are tracked on the{' '}
        <ArticleLink href="https://pubg.com/en">official PUBG: BATTLEGROUNDS site</ArticleLink>.
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
      <h2 style={h2Style}>How to Improve Reaction Time &amp; Click Speed for FPS &amp; Minecraft PvP</h2>
      <ul style={ulStyle}>
        <li><strong>Monitor Refresh Rate:</strong> Upgrade to 144 Hz or 240 Hz+ to reduce frame latency by up to 6 ms compared to 60 Hz panels.</li>
        <li><strong>Aim Trainers:</strong> Dedicated aim training software builds mouse muscle memory through structured scenario-based drills, improving the accuracy and reaction speed that complements high CPS in competitive play.</li>
        <li><strong>Sleep and Recovery:</strong> A single night of poor sleep can slow reaction time by 15–20 ms, equivalent to dropping a hardware tier in latency.</li>
        <li><strong>Moderate Caffeine:</strong> 100–200 mg is clinically shown to improve reaction time by 10–15 ms. Avoid excessive intake which degrades fine motor control.</li>
        <li><strong>Warmup Routine:</strong> Use 1-second and 2-second CPS sprint tests before gaming sessions to activate fast-twitch fiber engagement.</li>
        <li><strong>Hydration:</strong> Dehydration impairs motor function. Maintain adequate water intake during extended gaming sessions.</li>
      </ul>

      {/* ── 15 ── */}
      <h3 style={h3Style}>Mouse Maintenance for Consistent Performance</h3>
      <ul style={ulStyle}>
        <li><strong>Clean the Sensor Lens:</strong> Use a cotton swab with isopropyl alcohol monthly to remove dust accumulation that causes cursor stuttering.</li>
        <li><strong>Replace Mouse Feet:</strong> Worn PTFE skates increase friction and counter-vibration. Replace with Tiger Arc or Hotline Games aftermarket skates.</li>
        <li><strong>Check the Cable:</strong> Use a cable bungee or paracord upgrade to eliminate drag, or switch to wireless to remove cable resistance entirely.</li>
        <li><strong>Mousepad Quality:</strong> Use a large cloth or hybrid surface pad. Ensure consistent glide properties — worn pads develop uneven friction zones.</li>
        <li><strong>Switch Longevity:</strong> Double-clicking issues signal a failing switch debounce circuit, typically after 20–80 M clicks. Service or replace the switch promptly.</li>
        <li><strong>Firmware Updates:</strong> Keep mouse firmware current. Manufacturers frequently release debounce timing and polling rate optimizations.</li>
      </ul>

      {/* ── 16 ── */}
      <h3 style={h3Style}>Finger Exercises to Increase Click Speed</h3>
      <ul style={ulStyle}>
        <li><strong>Finger Taps:</strong> Tap each finger in sequence rapidly on a desk surface. 3 sets of 30 seconds per hand, twice daily.</li>
        <li><strong>Wrist Flexor Stretch:</strong> Extend arm palm-up, gently press fingers back toward your forearm. Hold 30 seconds each side.</li>
        <li><strong>Stress Ball Squeezes:</strong> Builds grip endurance and tendon resilience. 3 sets of 20 reps per hand with rest between sets.</li>
        <li><strong>Piano Practice:</strong> Even 10 minutes of scales or arpeggios daily measurably improves independent finger dexterity and reduces stiffness.</li>
        <li><strong>CPS Sprint Intervals:</strong> 10× 1-second maximum-effort tests with 30-second rest periods builds burst click capacity progressively.</li>
        <li><strong>Tendon Gliding Exercises:</strong> Physical therapist-recommended finger tendon gliding sequences maintain joint mobility and prevent RSI.</li>
      </ul>

      {/* ── 17 ── */}
      <h3 style={h3Style}>Best Mouse Settings for Maximum CPS</h3>
      <ul style={ulStyle}>
        <li><strong>Polling Rate:</strong> 1000 Hz minimum (4000 Hz on supported mice for lowest possible input latency).</li>
        <li><strong>Debounce Time:</strong> Lower to 1–3 ms in mouse software if supported. Default 8–16 ms debounce limits fast consecutive registrations.</li>
        <li><strong>Lift-Off Distance:</strong> Set to lowest available value to prevent accidental lift registrations during fast clicking.</li>
        <li><strong>DPI:</strong> Personal preference only — does not affect CPS. Set to whatever feels natural for your grip and game sensitivity.</li>
        <li><strong>Mouse Acceleration:</strong> Disable in both the OS mouse settings and mouse software for consistent, repeatable input.</li>
        <li><strong>USB Port:</strong> Use a direct motherboard USB 3.0 port rather than a hub for lowest possible communication latency.</li>
      </ul>

      {/* ── 18 ── */}
      <h3 style={h3Style}>Many Competitive Players and Their Reported CPS</h3>
      <p style={pStyle}>
        Many competitive players report achieving 10–13 CPS in Minecraft PvP combat. Experienced CS2 and
        Valorant players often sustain 7–9 CPS with a focus on burst-fire accuracy rather than maximum speed. The consensus in competitive circles is that accuracy and
        consistency at your maximum <em>sustainable</em> CPS significantly outperforms raw speed with
        degraded aim. No professional player sacrifices accuracy for an extra 1–2 CPS.
      </p>
      <p style={pStyle}>
        Some streamers and competitive players who have shared their CPS publicly report figures in the
        9–13 CPS range for Minecraft PvP and 7–9 CPS for FPS titles. Players reporting 20+ CPS in
        gameplay are often using Butterfly or Drag clicking techniques, which many competitive formats restrict.
      </p>

      {/* ── 19 ── */}
      <h2 style={h2Style}>CPS World Record — Fastest Clicks Per Second Ever Recorded</h2>
      <p style={pStyle}>
        Community-reported records suggest top single-finger clicking speeds of around 14–16 CPS in
        5-second tests, though these figures are self-reported and not formally verified. Some players
        report exceeding 20 CPS with standard clicking. Drag-clicking figures can technically exceed
        40 CPS, but these are mechanically assisted through surface friction and are generally not
        recognized as standard human-speed performance in competitive contexts.
      </p>
      <p style={pStyle}>
        Achieving 14+ CPS with normal clicking likely requires significant practice, strong finger
        dexterity, and optimal hardware (optical switches, lightweight mouse, 1000 Hz polling rate).
        For most players, 8–12 CPS appears to be a practical ceiling for sustained normal-click
        performance based on community data.
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

      {/* ── RELATED TOOLS & RESEARCH LINKS ── */}
      <h2 style={h2Style}>Related CPS Tools &amp; Authoritative Resources</h2>
      <p style={pStyle}>
        The following tools and references are widely used by the competitive gaming community to train,
        benchmark, and study mouse click speed and gaming performance.
      </p>
      <ul style={ulStyle}>
        <li>
          <strong><ArticleLink href="https://www.mcrpg.com/kohi-click-test/">Kohi Click Test (MCRPG)</ArticleLink></strong>{' '}
          — The original Minecraft PvP click speed benchmark, named after the legendary Kohi server.
          Widely considered the community standard for Minecraft CPS testing.
        </li>
        <li>
          <strong><ArticleLink href="https://www.lunarclient.com/tools/kohi-click-test">Lunar Client Kohi Test</ArticleLink></strong>{' '}
          — Lunar Client's official recreation of the Kohi Click Test, maintained by one of the largest
          Minecraft client platforms with millions of active users.
        </li>

        <li>
          <strong><ArticleLink href="https://hypixel.net/">Hypixel</ArticleLink></strong>{' '}
          — The world's largest Minecraft server network where CPS directly impacts PvP performance.
          Sky Wars, Bed Wars, and UHC modes all benefit from optimized click speed.
        </li>
        <li>
          <strong><ArticleLink href="https://donutsmp.net/">DonutSMP</ArticleLink></strong>{' '}
          — Dr Donut's official hardcore survival PvP server (IP: donutsmp.net). One of the most
          popular competitive Minecraft servers in 2025 with up to 35,000 player slots, known for
          intense economy-driven PvP where click speed is a genuine survival advantage.
        </li>
        <li>
          <strong><ArticleLink href="https://mcpvp.com/">McPvP / McTiers</ArticleLink></strong>{' '}
          — The competitive MCPVP platform co-acquired by Dream and DrDonut in 2025 to build
          structured Minecraft PvP esports. Features ranked matches and server listings across
          30+ countries.
        </li>
        <li>
          <strong><ArticleLink href="https://minemen.club/">Minemen Club</ArticleLink></strong>{' '}
          — One of the most popular practice PvP servers, offering Nodebuff, Boxing, Sumo, UHC,
          Skywars, and Bridging modes with active leaderboards. Widely used by players specifically
          training their CPS and combo mechanics.
        </li>
        <li>
          <strong><ArticleLink href="https://na.badlion.net/">Badlion Network</ArticleLink></strong>{' '}
          — A dedicated competitive PvP network featuring ArenaPvP, UHC, and Survival Games.
          Known for its GCheat anti-cheat system and hosting some of the largest UHC matches
          (up to 750 players) in Minecraft history.
        </li>
        <li>
          <strong><ArticleLink href="https://www.pika-network.net/">PikaNetwork</ArticleLink></strong>{' '}
          — One of the fastest-growing Minecraft networks of 2025 supporting both Java and Bedrock
          editions. Features KitPvP, Practice PvP, and OP Factions with sharp hit detection —
          an ideal environment for testing real-world CPS performance.
        </li>
        <li>
          <strong><ArticleLink href="https://minecraft.wiki/w/Melee_attack">Minecraft Wiki — Melee Attack</ArticleLink></strong>{' '}
          — Official documentation on Minecraft's attack cooldown system, hit registration, and
          the mechanics that determine how CPS translates to in-game combat advantage.
        </li>
        <li>
          <strong><ArticleLink href="https://my.clevelandclinic.org/health/diseases/17424-repetitive-strain-injury">Cleveland Clinic — Repetitive Strain Injury</ArticleLink></strong>{' '}
          — Clinical overview of RSI causes, symptoms, and prevention. Essential reading for any
          player practicing high-intensity clicking techniques like Jitter or Butterfly clicking.
        </li>
        <li>
          <strong><ArticleLink href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3289511/">NIH — Repetitive Hand Motion Research</ArticleLink></strong>{' '}
          — Peer-reviewed research on repetitive hand and finger motion, tendon health, and injury
          prevention relevant to sustained high-speed mouse clicking.
        </li>
        <li>
          <strong><ArticleLink href="https://playvalorant.com/en-us/">Valorant (Official)</ArticleLink></strong>{' '}
          — Official site for weapon stats, agent kits, and patch notes. Click speed directly
          impacts pistol round DPS and tap-fire rifle accuracy in competitive Valorant.
        </li>
        <li>
          <strong><ArticleLink href="https://pubg.com/en">PUBG: Battlegrounds (Official)</ArticleLink></strong>{' '}
          — Official source for weapon ballistics and patch notes. Single-fire weapons in PUBG
          have no server-side fire rate cap, making CPS a direct performance multiplier.
        </li>
      </ul>

      {/* ── RIGHT CLICK SECTION ── */}
      <hr style={{ border: 0, borderTop: '1px solid rgba(255,159,67,0.2)', margin: '3rem 0' }} />

      <h2 style={{ ...h2Style, color: 'var(--neon-orange, #ff9f43)', fontSize: '2rem', letterSpacing: '-0.5px' }}>
        Right Click CPS Test — Complete Guide
      </h2>
      <p style={{ ...pStyle, fontSize: '1rem', color: '#d1d5db' }}>
        The <strong>Right Click CPS Test</strong> is a specialized benchmark that measures how many times
        you can actuate your mouse's right button per second. While left click speed dominates competitive
        gaming discussion, right click performance is a frequently overlooked skill with direct impact in
        Minecraft survival, strategy games, RPGs, and any title where the right button drives core
        gameplay mechanics.
      </p>

      {/* ── RC-1 ── */}
      <h2 style={h2Style}>What is a Right Click Test?</h2>
      <p style={pStyle}>
        A Right Click Test works identically to a standard CPS test — it starts a countdown timer on your
        first right click, counts every subsequent right mouse button press inside the click zone, and
        calculates your final score in Clicks Per Second. The key difference is that the browser's default
        context menu is suppressed during the test so that menu popups never interrupt your clicking
        rhythm or steal focus from the measurement window. Every right click registers cleanly as a data
        point in the same high-resolution timing system used for left-click benchmarks.
      </p>
      <p style={pStyle}>
        Right click tests reveal an independent performance dimension that combined mouse tests miss.
        A player can have an elite left-click CPS of 12 while their right-click CPS sits at 5, exposing
        a genuine mechanical weakness. Identifying and training this gap produces measurable improvement
        in any game where both buttons are used under time pressure.
      </p>

      {/* ── RC-2 ── */}
      <h3 style={h3Style}>Left Click vs Right Click — Key Differences</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          margin: '1rem 0 2rem',
        }}
      >
        {[
          {
            title: '🖱️ Left Click',
            color: '#00f5ff',
            points: [
              'Index finger — strongest, fastest digit',
              'Avg CPS: 6–10 for most users',
              'Primary attack, confirm, select',
              'Higher fast-twitch fiber density',
              'Better trained via daily use',
            ],
          },
          {
            title: '🖱️ Right Click',
            color: '#ff9f43',
            points: [
              'Ring / middle finger — weaker, less independent',
              'Avg CPS: 4–8 for most users',
              'ADS, block, place, context actions',
              'Lower endurance under rapid fire',
              'Often undertrained — high improvement ceiling',
            ],
          },
        ].map(col => (
          <div
            key={col.title}
            style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              padding: '1.25rem',
              border: `1px solid ${col.color}30`,
            }}
          >
            <div style={{ fontWeight: '800', color: col.color, fontSize: '1rem', marginBottom: '0.75rem' }}>{col.title}</div>
            <ul style={{ ...ulStyle, marginBottom: 0, paddingLeft: '1.25rem' }}>
              {col.points.map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>
        ))}
      </div>

      {/* ── RC-3 ── */}
      <h3 style={h3Style}>Why Right Click Speed Matters in Gaming</h3>

      <h3 style={h3Style}>Minecraft — Placing & Using Items</h3>
      <p style={pStyle}>
        In Minecraft survival and creative modes, right-clicking places blocks, opens inventories, uses
        food, fires bows, and activates most interactive objects. Speed bridging — one of the most
        demanding movement techniques in competitive Minecraft — requires sustained rapid right clicking
        combined with precise directional movement. Players who can sustain 8–12 right CPS execute
        bridges measurably faster than those capped at 5 CPS, directly impacting escape routes, tower
        rushes, and aerial construction under pressure.
      </p>

      <h3 style={h3Style}>Minecraft PvP — Shield & Sword Combo</h3>
      <p style={pStyle}>
        In Minecraft 1.9+ combat, the shield is raised with right click. Advanced PvP players alternate
        rapidly between sword attacks (left click) and shield raises (right click) to block incoming
        damage while maintaining offensive pressure. This simultaneous two-button technique requires
        independent control of both index and ring fingers at competitive click rates — a dual-hand skill
        that right click training directly develops.
      </p>

      <h3 style={h3Style}>Strategy Games & MOBAs</h3>
      <p style={pStyle}>
        In real-time strategy games and MOBAs, right click issues move commands, attack-move orders, and
        unit targeting. High APM players issue hundreds of right-click commands per minute. Any latency
        between intended and executed right clicks degrades micro control, last-hit timing, and unit
        responsiveness. Dedicated right click CPS training directly improves the physical click rate
        ceiling that your APM is ultimately constrained by.
      </p>

      <h3 style={h3Style}>FPS Games — ADS and Scope</h3>
      <p style={pStyle}>
        In virtually every first-person shooter, right click activates Aim Down Sights, zoom scopes, or
        alternate fire modes. Fast ADS entry and exit is a critical mechanical skill — the difference
        between a smooth transition into a aimed shot and a slow, hesitant engagement often comes down
        to right-click actuation speed and consistency. Right click CPS testing gives you a precise
        baseline for this specific mechanical skill.
      </p>

      {/* ── RC-4 ── */}
      <h3 style={h3Style}>Average Right Click CPS by Skill Level</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
          gap: '1rem',
          margin: '1rem 0 2rem',
        }}
      >
        {[
          { range: '1–3 RPC',  label: '🐌 Beginner',    color: '#8395a7' },
          { range: '4–5 RPC',  label: '🐢 Casual',       color: '#10ac84' },
          { range: '6–7 RPC',  label: '🦊 Intermediate', color: '#00d2d3' },
          { range: '8–10 RPC', label: '🐆 Advanced',      color: '#ff9f43' },
          { range: '11+ RPC',  label: '🤖 Elite',         color: '#ff3838' },
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
        RPC (Right-clicks Per Second) scores typically run 1–3 points lower than an individual's left-click
        CPS because the right button finger has less independent motor training. Players who close this
        gap through deliberate practice gain a genuine mechanical edge in games that require both buttons
        simultaneously.
      </p>

      {/* ── RC-5 ── */}
      <h3 style={h3Style}>How to Improve Right Click CPS</h3>
      <ul style={ulStyle}>
        <li>
          <strong>Isolated Ring Finger Drills:</strong> Practice tapping your ring finger independently
          on a desk surface without involving adjacent fingers. 3 sets of 30 seconds daily builds
          independent neuromuscular control that is the primary limiter for most users.
        </li>
        <li>
          <strong>Right Click Sprint Intervals:</strong> Run 10 × 1-second maximum-effort right click
          tests with 30-second rest periods between each. This progressive overload method builds
          fast-twitch burst capacity in the ring finger's extensor muscles over 2–4 weeks.
        </li>
        <li>
          <strong>Alternating Dual-Button Drills:</strong> Practice alternating left and right clicks
          in rhythm — left, right, left, right — at increasing tempo. This builds the independent
          bilateral finger coordination critical for Minecraft shield-sword combat and strategy game micro.
        </li>
        <li>
          <strong>Grip Adjustment:</strong> A claw or fingertip grip naturally positions the ring finger
          closer to the right button's optimal actuation point with less travel distance, enabling faster
          repeat clicks than a full palm grip.
        </li>
        <li>
          <strong>Mouse Button Force:</strong> If your mouse's right button requires noticeably more
          actuation force than the left, consider a mouse with matched optical switches (e.g. Razer
          optical) where both buttons have identical sub-1ms actuation characteristics.
        </li>
        <li>
          <strong>Warm Up Before Testing:</strong> Cold ring finger tendons actuate measurably slower.
          Perform 60 seconds of gentle ring finger taps before any serious right click testing session.
        </li>
      </ul>

      {/* ── RC-6 ── */}
      <h2 style={h2Style}>Right Click Finger Anatomy & Biomechanics</h2>
      <p style={pStyle}>
        The right mouse button is most commonly operated by the ring finger (fourth digit) in both palm
        and claw grips. The ring finger is mechanically coupled to the middle finger through shared
        extensor digitorum tendons, which limits its independent range of motion compared to the index
        finger. This anatomical constraint is the primary reason right click CPS is biologically capped
        lower than left click CPS for the majority of people — it is a hardware limitation of human
        hand anatomy, not a training deficiency.
      </p>
      <p style={pStyle}>
        Some players use their middle finger for right-click operations, particularly in fingertip grip
        styles. Middle finger right-clicking can achieve higher CPS because the middle finger has greater
        independent extensor tendon control than the ring finger. If your right-click CPS is plateauing
        despite consistent training, experimenting with a middle-finger grip shift may unlock a
        meaningful performance improvement.
      </p>

      {/* ── RC-7 ── */}
      <h3 style={h3Style}>Right Click Test Best Practices</h3>
      <ul style={ulStyle}>
        <li><strong>Use the 5-second test</strong> as your baseline benchmark — it is the same industry-standard duration used for left click comparisons.</li>
        <li><strong>Test both buttons separately</strong> on the same day to calculate your Left/Right CPS ratio. A ratio above 0.85 indicates strong bilateral balance.</li>
        <li><strong>Track your session history</strong> across multiple days to identify improvement trends and fatigue patterns in your right-click endurance.</li>
        <li><strong>Stop immediately if you feel forearm pain.</strong> The ring finger's extensor tendons are more susceptible to overuse strain than the index finger. Never click through discomfort.</li>
        <li><strong>Test in quiet environments</strong> and avoid distractions — right click CPS is more sensitive to focus lapses than left click CPS due to the lower baseline motor control of the ring finger.</li>
      </ul>

      {/* ── RC-8 ── */}
      <h3 style={h3Style}>Right Click Speed in Specific Games</h3>
      <ul style={ulStyle}>
        <li><strong>Minecraft Survival / Creative:</strong> 6–10 right CPS optimal for speed bridging and item placement</li>
        <li><strong>Minecraft 1.9+ PvP:</strong> 5–8 right CPS for shield cycling combined with 10–14 left CPS sword attacks</li>
        <li><strong>Fortnite:</strong> Right click switches weapon zoom; 5–7 RPS ensures instant scope-in without input delay</li>
        <li><strong>League of Legends:</strong> Right click issues move and attack-move orders; 8–12 RPS contributes directly to APM</li>
        <li><strong>Starcraft II:</strong> Right click controls unit movement and attack commands; professional players exceed 15 RPS during high-intensity micro</li>
        <li><strong>PUBG / Warzone ADS:</strong> Right click hold-to-ADS; fast initial actuation (not sustained CPS) is the critical metric</li>
        <li><strong>Diablo / Path of Exile:</strong> Right click frequently bound to movement or primary skill; sustained 6–9 RPS is comfortable for extended play sessions</li>
      </ul>
      {/* ── CTA ── */}
      <div style={{
        margin: '3rem 0 0',
        background: 'linear-gradient(135deg, rgba(0,245,255,0.06) 0%, rgba(0,255,136,0.06) 100%)',
        border: '1px solid rgba(0,245,255,0.2)',
        borderRadius: '16px',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h2 style={{ color: '#fff', fontWeight: '900', fontSize: '1.5rem', margin: '0 0 0.5rem' }}>
          Ready to Improve Your CPS?
        </h2>
        <p style={{ color: '#9ca3af', margin: '0 0 1.25rem', fontSize: '0.95rem' }}>
          Start a free 5-second CPS Test now — no account, no download, instant results.
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: 'var(--neon-green, #00ff88)',
            color: '#000',
            border: 'none',
            borderRadius: '10px',
            padding: '0.75rem 2rem',
            fontWeight: '800',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ▶ Take the CPS Test Now
        </button>
      </div>
    </article>
  </>
));
SeoArticle.displayName = 'SeoArticle';


// ─────────────────────────────────────────────
// REAL-TIME CPS GRAPH (SVG-based, zero deps)
// ─────────────────────────────────────────────
const CpsGraph = memo(({ data, duration, clickMode, phase }: { data: GraphPoint[]; duration: number; clickMode: ClickMode; phase: Phase }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const W = 900, H = 180;
  const PAD = { top: 20, right: 20, bottom: 32, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const lineColor  = clickMode === 'right' ? '#ff9f43' : '#00f5ff';
  const fillColor  = clickMode === 'right' ? 'rgba(255,159,67,0.10)' : 'rgba(0,245,255,0.08)';
  const avgColor   = clickMode === 'right' ? '#b06aff' : '#b06aff';
  const dotColor   = clickMode === 'right' ? '#ff9f43' : '#00ff88';
  const gridColor  = 'rgba(255,255,255,0.05)';
  const labelColor = '#6b7280';

  const maxCps = Math.max(10, ...data.map(d => d.cps));
  const yMax   = Math.ceil(maxCps / 5) * 5;

  const xScale = (t: number): number => PAD.left + (t / duration) * innerW;
  const yScale = (c: number): number => PAD.top + innerH - (c / yMax) * innerH;

  // Average CPS line data
  const avgCps = data.length > 0
    ? data.reduce((s, d) => s + d.cps, 0) / data.length
    : 0;

  // Build polyline points for real-time line
  const points = data.map(d => `${xScale(d.t)},${yScale(d.cps)}`).join(' ');

  // Build fill path
  let fillPath = '';
  if (data.length > 1) {
    const first = data[0];
    const last  = data[data.length - 1];
    fillPath =
      `M${xScale(first.t)},${yScale(0)} ` +
      data.map(d => `L${xScale(d.t)},${yScale(d.cps)}`).join(' ') +
      ` L${xScale(last.t)},${yScale(0)} Z`;
  }

  // Y-axis ticks
  const yTicks = [];
  const yStep = yMax <= 10 ? 2 : yMax <= 20 ? 5 : 10;
  for (let v = 0; v <= yMax; v += yStep) yTicks.push(v);

  // X-axis ticks
  const xTicks = [];
  const xStep = duration <= 5 ? 1 : duration <= 15 ? 5 : duration <= 60 ? 10 : 30;
  for (let t = 0; t <= duration; t += xStep) xTicks.push(t);

  const last = data[data.length - 1];

  // Mouse move → find nearest data point → show tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (data.length === 0) return;
    if (!svgContainerRef.current) return;
    const rect = svgContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    // Convert to SVG coordinate space (viewBox 900px mapped to actual width)
    const scaleX = W / rect.width;
    const svgMouseX = mouseX * scaleX;

    // Find closest data point by x position
    let closest = data[0];
    let minDist = Infinity;
    for (const d of data) {
      const dist = Math.abs(xScale(d.t) - svgMouseX);
      if (dist < minDist) { minDist = dist; closest = d; }
    }

    // Tooltip screen position — clamp so it doesn't overflow
    const tooltipX = Math.min(mouseX, rect.width - 180);
    const tooltipY = e.clientY - rect.top - 80;

    setTooltip({
      x: tooltipX,
      y: tooltipY,
      t: closest.t,
      rtCps: closest.cps,
      avgCps: parseFloat(avgCps.toFixed(3)),
    });
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <section style={{
      background: 'var(--bg-card, #1e2235)',
      border: `1px solid ${clickMode === 'right' ? 'rgba(255,159,67,0.3)' : 'rgba(0,245,255,0.2)'}`,
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '1.5rem',
    }} aria-label="Real-time CPS Graph">

      {/* Header */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderBottom: '1px solid var(--border, #2a3047)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontWeight: '700', fontSize: '0.85rem', color: lineColor, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📈 CPS Graph
          {phase === 'running' && (
            <span style={{
              fontSize: '0.65rem', fontWeight: '700', padding: '2px 7px',
              borderRadius: '20px', background: 'rgba(0,255,136,0.15)',
              color: '#00ff88', border: '1px solid rgba(0,255,136,0.35)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>● LIVE</span>
          )}
          {phase === 'done' && (
            <span style={{
              fontSize: '0.65rem', fontWeight: '700', padding: '2px 7px',
              borderRadius: '20px', background: 'rgba(255,159,67,0.12)',
              color: '#ff9f43', border: '1px solid rgba(255,159,67,0.3)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>FINAL</span>
          )}
          {phase === 'idle' && (
            <span style={{
              fontSize: '0.65rem', fontWeight: '700', padding: '2px 7px',
              borderRadius: '20px', background: 'rgba(255,255,255,0.06)',
              color: '#8395a7', border: '1px solid rgba(255,255,255,0.1)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>LAST RUN</span>
          )}
        </span>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#9ca3af' }}>
            <span style={{ display: 'inline-block', width: '20px', height: '3px', background: lineColor, borderRadius: '2px' }} />
            Real-time CPS
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#9ca3af' }}>
            <span style={{ display: 'inline-block', width: '20px', height: '2px', background: avgColor, borderRadius: '2px', opacity: 0.8 }} />
            Average CPS
          </span>
          {last && (
            <span style={{ fontWeight: '800', fontSize: '1rem', color: dotColor, fontVariantNumeric: 'tabular-nums' }}>
              {last.cps} CPS
            </span>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <div
        ref={svgContainerRef}
        style={{ padding: '0.5rem 0.5rem 0', overflowX: 'auto', position: 'relative', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: 'block', minWidth: '280px' }}
          aria-hidden="true"
        >
          {/* Y grid lines */}
          {yTicks.map(v => (
            <g key={v}>
              <line
                x1={PAD.left} y1={yScale(v)}
                x2={PAD.left + innerW} y2={yScale(v)}
                stroke={gridColor} strokeWidth="1"
              />
              <text x={PAD.left - 7} y={yScale(v) + 4}
                textAnchor="end" fontSize="11" fill={labelColor}
              >{v}</text>
            </g>
          ))}

          {/* X axis labels */}
          {xTicks.map(t => (
            <text key={t}
              x={xScale(t)} y={H - 8}
              textAnchor="middle" fontSize="11" fill={labelColor}
            >{t}s</text>
          ))}

          {/* Fill area */}
          {fillPath && <path d={fillPath} fill={fillColor} />}

          {/* Average CPS dashed line */}
          {data.length > 1 && (
            <line
              x1={xScale(data[0].t)} y1={yScale(avgCps)}
              x2={xScale(data[data.length - 1].t)} y2={yScale(avgCps)}
              stroke={avgColor} strokeWidth="1.8"
              strokeDasharray="5,4" opacity="0.75"
            />
          )}

          {/* Real-time line */}
          {data.length > 1 && (
            <polyline
              points={points}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Hover vertical line */}
          {tooltip && (
            <line
              x1={xScale(tooltip.t)} y1={PAD.top}
              x2={xScale(tooltip.t)} y2={PAD.top + innerH}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1"
              strokeDasharray="3,3"
            />
          )}

          {/* Hover dot on real-time line */}
          {tooltip && (() => {
            const pt = data.find(d => d.t === tooltip.t) || data[data.length - 1];
            return (
              <>
                <circle cx={xScale(pt.t)} cy={yScale(pt.cps)} r="5" fill={lineColor} />
                <circle cx={xScale(pt.t)} cy={yScale(pt.cps)} r="9"
                  fill="none" stroke={lineColor} strokeWidth="1.5" opacity="0.35" />
                {/* Dot on average line */}
                <circle cx={xScale(pt.t)} cy={yScale(avgCps)} r="4" fill={avgColor} opacity="0.8" />
              </>
            );
          })()}

          {/* Live dot (when no hover) */}
          {!tooltip && last && (
            <>
              <circle cx={xScale(last.t)} cy={yScale(last.cps)} r="5" fill={dotColor} />
              <circle cx={xScale(last.t)} cy={yScale(last.cps)} r="9"
                fill="none" stroke={dotColor} strokeWidth="1.5" opacity="0.4" />
            </>
          )}

          {/* Axis borders */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH}
            stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH}
            stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'absolute',
            left: tooltip.x,
            top: Math.max(4, tooltip.y),
            background: '#0d1117',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px',
            padding: '8px 12px',
            pointerEvents: 'none',
            zIndex: 10,
            minWidth: '170px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', marginBottom: '6px', fontVariantNumeric: 'tabular-nums' }}>
              {tooltip.t}s
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '4px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: lineColor, flexShrink: 0 }} />
              Real-time CPS: <strong style={{ color: '#fff', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{tooltip.rtCps}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem', color: '#e2e8f0' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: avgColor, flexShrink: 0 }} />
              Average CPS: <strong style={{ color: '#fff', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{tooltip.avgCps}</strong>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});
CpsGraph.displayName = 'CpsGraph';

// ─────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────
export default function CPSTestPage() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback((): void => {
    if (!document.fullscreenElement) {
      const el = areaRef.current;
      if (!el) return;
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const [duration, setDuration] = useState<number>(5);
  const [customTime, setCustomTime] = useState<string>(''); 
  const [phase, setPhase] = useState<Phase>('idle');
  const [clicks, setClicks] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(5);
  const [cps, setCps] = useState<number>(0);
  const [maxCps, setMaxCps] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const [graphData, setGraphData] = useState<GraphPoint[]>([]);
  const graphRef = useRef<GraphPoint[]>([]);

  // 🖱️ Click Mode: 'left' or 'right'
  const [clickMode, setClickMode] = useState<ClickMode>('left');
  const clickModeRef = useRef<ClickMode>('left');

  // 🛡️ Anti-Cheat Security Layer States & Refs
  const [isBot, setIsBot] = useState<boolean>(false);
  const botTriggers = useRef<number>(0);

  // 🔊 Audio configuration state and references
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startTime = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clickEvents = useRef<ClickEvent[]>([]);
  const rippleId = useRef<number>(0);
  const phaseRef = useRef<Phase>('idle');
  const durationRef = useRef<number>(duration);
  const lastEndTimeRef = useRef<number>(0);
  
  // ⚡ CRITICAL BUG FIX: Track the absolute total clicks of the test in a mutable ref.
  const totalClicksRef = useRef<number>(0);

  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { clickModeRef.current = clickMode; }, [clickMode]);

  // Audio Initializer to resume or create browser AudioContext
  const initAudio = (): void => {
    if (typeof window === 'undefined') return;
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  // SOUND GENERATION: Web Audio API Oscillator synthesizer for lightweight, local zero-asset sounds
  const playSound = (type: 'click' | 'complete'): void => {
    if (!soundEnabledRef.current || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;

    if (type === 'click') {
      const playTone = (freq: number, startDelay: number, durationSec: number): void => {
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

      playTone(987.77, 0, 0.06);
      playTone(1318.51, 0.05, 0.15);
    } else if (type === 'complete') {
      const playTone = (freq: number, startDelay: number, durationSec: number): void => {
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

      playTone(523.25, 0, 0.15);
      playTone(659.25, 0.08, 0.15);
      playTone(783.99, 0.16, 0.15);
      playTone(1046.50, 0.24, 0.30);
    }
  };

  const recordClick = (): void => {
    const now = performance.now();
    
    clickEvents.current = clickEvents.current.filter(e => now - e.time < 1200);

    if (clickEvents.current.length > 0) {
      const lastClickTime = clickEvents.current[clickEvents.current.length - 1].time;
      const interval = now - lastClickTime;

      if (interval < 15) {
        botTriggers.current += 1;
      } else {
        botTriggers.current = Math.max(0, botTriggers.current - 1);
      }

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
    totalClicksRef.current += 1;
    setClicks(prev => prev + 1);
  };

  const endTest = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    phaseRef.current = 'done';

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const dur: number = durationRef.current;
    const totalClicks: number = totalClicksRef.current;
    const finalCps = parseFloat((totalClicks / dur).toFixed(2));
    
    setCps(finalCps);
    setClicks(totalClicks);
    setPhase('done');
    setTimeLeft(0);
    lastEndTimeRef.current = Date.now();
    
    playSound('complete');
    
    if (botTriggers.current < 15) {
      setHistory((prev: HistoryItem[]) => [{ cps: finalCps, clicks: totalClicks, duration: dur }, ...prev.slice(0, 9)]);
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
    graphRef.current = [];
    setGraphData([]);
    startTime.current = performance.now();

    let tickCount: number = 0;
    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      const remaining = Math.max(0, dur - elapsed);
      setTimeLeft(remaining);

      const now = performance.now();
      const recent = clickEvents.current.filter(e => now - e.time < 1000);
      const liveCps = recent.length;
      setCps(liveCps);
      setMaxCps(prev => Math.max(prev, liveCps));

      // Push a graph point every 4 ticks (~200ms)
      tickCount++;
      if (tickCount % 4 === 0) {
        const point: GraphPoint = { t: parseFloat(elapsed.toFixed(1)), cps: liveCps };
        graphRef.current = [...graphRef.current, point];
        setGraphData(graphRef.current);
      }

      if (remaining <= 0) endTest();
    }, 50);
  }, [endTest]);

  const resetTest = useCallback(() => {
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
    // NOTE: graph data intentionally NOT cleared here — persists until next test starts
  }, []);

  const handleCustomTimeSet = (): void => {
    const time = parseInt(customTime);
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.detail === 0) return;
    // In right-click mode, left clicks do nothing (right-click handler takes over)
    if (clickModeRef.current === 'right') return;

    initAudio();

    if (phaseRef.current === 'idle') { startTest(); return; }
    if (phaseRef.current !== 'running') return;

    recordClick();
    playSound('click');

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;

    setRipples(prev => {
      const next: RippleItem[] = [...prev, { id, x, y, color: '#00f5ff' }];
      if (next.length > 15) {
        return next.slice(next.length - 15);
      }
      return next;
    });

    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 660);
  };

  // RIGHT CLICK handler — prevents context menu and records click in right mode
  const handleRightClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault(); // Always block context menu on the click area
    if (clickModeRef.current !== 'right') return;

    initAudio();

    if (phaseRef.current === 'idle') { startTest(); return; }
    if (phaseRef.current !== 'running') return;

    recordClick();
    playSound('click');

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;

    setRipples(prev => {
      const next: RippleItem[] = [...prev, { id, x, y, color: '#ff9f43' }];
      if (next.length > 15) return next.slice(next.length - 15);
      return next;
    });

    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 660);
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

  const progress: number = phase === 'running' ? ((duration - timeLeft) / duration) * 100 : phase === 'done' ? 100 : 0;
  
  const finalCpsValue: number = phase === 'done' ? parseFloat((clicks / duration).toFixed(2)) : cps;
  
  const finalRating: (RatingResult & { stars: number }) | null = phase === 'done' ? (isBot ? {
    label: 'Bot Detected',
    emoji: '🚫',
    color: 'var(--neon-red, #ff3838)',
    stars: 0,
    desc: '"Software Macro or Auto-clicker emulation detected! Play fair to test your authentic biological human reflex limits."'
  } : getRating(finalCpsValue)) : null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Global style injections */}
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />

      {/* ── HEADER ── */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label" style={{ fontSize: '0.85rem', color: 'var(--neon-cyan, #00f5ff)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold' }}>CPS Test</div>
        <h1 className="tool-title" style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0.5rem 0 0.2rem', color: '#fff' }}>CPS Test — Free Click Speed Test &amp; CPS Counter Online</h1>
        <p className="tool-subtitle" style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '1rem', margin: '0' }}>Free <strong style={{color:'#fff'}}>CPS Test</strong> — measure your <strong style={{color:'#fff'}}>clicks per second</strong> with left &amp; right click modes. Kohi click test, jitter click test, drag click test, butterfly click — all in one <strong style={{color:'#fff'}}>click speed tester</strong>. No download required.</p>
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTime(e.target.value)}
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
            initAudio();
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

        {/* ── CLICK MODE TOGGLE ── */}
        <div
          style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--bg-card, #1e2235)',
            border: '1px solid var(--border, #2a3047)',
            borderRadius: '8px', overflow: 'hidden',
            height: '34px',
          }}
        >
          {[
            { mode: 'left' as ClickMode,  label: '🖱️ Left',  activeColor: 'rgba(0,255,136,0.15)', activeBorder: '#00ff88', activeText: '#00ff88' },
            { mode: 'right' as ClickMode, label: '🖱️ Right', activeColor: 'rgba(255,159,67,0.15)', activeBorder: '#ff9f43', activeText: '#ff9f43' },
          ].map(({ mode, label, activeColor, activeText }: { mode: ClickMode; label: string; activeColor: string; activeText: string }) => (
            <button
              key={mode}
              onClick={() => {
                if (phase === 'running') return;
                setClickMode(mode);
                clickModeRef.current = mode;
                resetTest();
              }}
              disabled={phase === 'running'}
              title={mode === 'right' ? 'Right Click Test Mode' : 'Left Click Test Mode'}
              style={{
                padding: '0 0.9rem',
                height: '100%',
                border: 'none',
                background: clickMode === mode ? activeColor : 'transparent',
                color: clickMode === mode ? activeText : 'var(--text-muted, #8395a7)',
                fontWeight: '700', fontSize: '0.8rem',
                cursor: phase === 'running' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                borderRight: mode === 'left' ? '1px solid var(--border, #2a3047)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </div>
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
        onContextMenu={handleRightClick}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as unknown as React.MouseEvent<HTMLDivElement>); }}
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

        {ripples.map(r => {
          const rc = r.color || '#00f5ff';
          return (
            <span key={r.id} style={{
              position: 'absolute',
              left: r.x,
              top: r.y,
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: rc,
              opacity: 0,
              transform: 'translate(-50%, -50%) scale(0)',
              animation: 'rippleAnim 0.65s cubic-bezier(0.22, 0.61, 0.36, 1) forwards',
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }} />
          );
        })}

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

        {/* ── RESULT MODAL ── */}
        {phase === 'done' && finalRating && (
          <>
            <div style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
              zIndex: 999, animation: 'fadeIn 0.3s ease-out forwards',
            }} />

            <div
              className="cps-modal-inner"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
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
              {/* Close button */}
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
                <button
                  onClick={resetTest}
                  style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-card, #1e2235)', border: '1px solid var(--border, #2a3047)', color: '#fff' }}
                >
                  🔄 Reset
                </button>
                <button
                  onClick={() => {
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
      </div>

      {/* ── RESET BUTTON (while running) ── */}
      {phase === 'running' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease-in' }}>
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); resetTest(); }}
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

      {/* ── REAL-TIME GRAPH ── */}
      {graphData.length > 0 && (
        <CpsGraph data={graphData} duration={duration} clickMode={clickMode} phase={phase} />
      )}

      {/* ── SESSION HISTORY ── */}
      {history.length > 0 && <SessionHistory history={history} />}

      {/* ── MORE TOOLS GRID ── */}
      <section aria-label="More Tools" style={{ marginTop: '3rem', marginBottom: '2.5rem' }}>
        <h2 style={{
          fontWeight: 800, fontSize: '1.5rem', color: '#fff',
          marginBottom: '1.5rem', textAlign: 'center',
          letterSpacing: '-0.3px',
        }}>More Tools</h2>
        <div
          className="cps-games-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '1rem',
          }}
        >
          {[
            { label: 'Typing Test',      href: '/typing-test',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 15h8M7 11h2m3 0h2m3 0h-1"/></svg> },
            { label: 'Reaction Time',    href: '/reaction-time',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { label: 'Aim Trainer',      href: '/aim-trainer',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg> },
            { label: 'Spacebar Counter', href: '/spacebar',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="8" width="20" height="12" rx="2"/><path d="M7 17h10"/></svg> },
            { label: 'Scroll Test',      href: '/scroll-test',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="10"/><line x1="12" y1="14" x2="12" y2="16"/><path d="M9 11l3-3 3 3"/><path d="M9 13l3 3 3-3"/></svg> },
            { label: 'Double Click',     href: '/double-click',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/></svg> },
            { label: '3D Aim Trainer', href: '/3d-aim-trainer',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/><circle cx="12" cy="12" r="8" opacity=".4"/></svg> },
            { label: 'Mouse Accuracy',   href: '/mouse-accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 2v10"/></svg> },
            { label: 'Key Visualizer',   href: '/key-visualizer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"/></svg> },
            { label: 'F1 Reaction',      href: '/f1-reaction',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
            { label: 'Space Defense',    href: '/space-defense',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
            { label: 'Voyager Game',     href: '/voyager-game',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },
            { label: 'Space Waves', href: '/space-waves', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg> },
            { label: 'CPS Rush',         href: '/cps-rush',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 12v-4"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
            { label: 'Accuracy Test',    href: '/accuracy',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
          ].map(({ label, href, icon }) => (
            <a
              key={href}
              href={href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '0.6rem',
                background: '#141a2a',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '1.2rem 0.5rem',
                cursor: 'pointer', textDecoration: 'none',
                color: 'var(--neon-green, #00ff88)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,255,136,0.07)';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,255,136,0.3)';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#141a2a';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--neon-green, #00ff88)',
              }}>
                {icon}
              </div>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700,
                color: '#cbd5e1', textAlign: 'center', lineHeight: 1.3,
              }}>{label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── WHY FIXEDAIM ── */}
      <section style={{ marginBottom: '2.5rem', background: 'var(--bg-card, #1e2235)', border: '1px solid var(--border, #2a3047)', borderRadius: '16px', padding: '1.75rem 1.5rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--neon-cyan, #00f5ff)', margin: '0 0 1rem' }}>
          Why Use FixedAim's CPS Test?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '📈', title: 'Real-time Graph', desc: 'Live CPS graph with hover tooltip — see exactly when your speed peaks or drops.' },
            { icon: '🛡️', title: 'Anti-Cheat Built-in', desc: 'Detects macros and auto-clickers using interval analysis — your score is genuine.' },
            { icon: '🖱️', title: 'Left + Right Click', desc: 'Test both mouse buttons independently. Most tools only support left click.' },
            { icon: '📊', title: 'Session History', desc: 'Every test run saved in a session table — track your improvement across attempts.' },
            { icon: '⚡', title: 'Sub-ms Accuracy', desc: 'Uses performance.now() for sub-millisecond timing — not a simple click counter.' },
            { icon: '📱', title: 'Works Everywhere', desc: 'PC, Mac, mobile, tablet — no download, no account, no ads.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{icon}</div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{title}</div>
              <div style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <FaqSection />

      {/* ── PRO SEO ARTICLE ── */}
      <SeoArticle />
    </div>
  );
}
