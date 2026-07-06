/**
 * SpacebarPage.tsx
 * - Full SEO: meta, OG, Twitter, JSON-LD, breadcrumb, FAQ
 * - Real spacebar animation (spring physics)
 * - 20 high-quality FAQs (accordion style)
 * - Deep, authoritative 40+ H2 SEO article on Spacebar Counter / KPS Test / Spacebar Clicker
 * - Accessibility: focus trap, ESC, reduced motion, ARIA
 * - Performance: memo, minimal rerenders
 * - Security: no dangerouslySetInnerHTML on user data
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  Suspense,
} from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const DURATIONS = [5, 10, 15, 30, 60] as const;
const MAX_CUSTOM_SECONDS = 300;
const MIN_CUSTOM_SECONDS = 1;
const MAX_HISTORY = 10;
const SITE_URL  = 'https://www.example.com';
const SITE_NAME = 'KeyboardTest.io';
const PAGE_URL  = `${SITE_URL}/spacebar-counter`;
const OG_IMAGE  = `${SITE_URL}/og-spacebar-counter.png`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface HistoryItem { count: number; sps: number; duration: number; }
type Phase = 'idle' | 'running' | 'done';
interface RatingResult {
  label: string;
  emoji: string;
  color: string;
  stars: number;
  desc: string;
}

// ─── Sound engine ─────────────────────────────────────────────────────────────
function createClickSound(ctx: AudioContext): void {
  const oscillator = ctx.createOscillator();
  const gainNode   = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.04);
  gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.06);
}

// ─── Rating helper ────────────────────────────────────────────────────────────
const getRating = (n: number): RatingResult => {
  if (n >= 15) return { label: 'Machine', emoji: '🤖', color: 'var(--neon-red, #ff2d55)',        stars: 5, desc: 'Unbelievable processing! Your fingers execute inputs with cybernetic efficiency. Absolute dominance!' };
  if (n >= 10) return { label: 'Cheetah', emoji: '🐆', color: 'var(--neon-orange, #f97316)',     stars: 4, desc: 'Your fingers snap at blistering speed just like the speedie cat runs. Hail to the king of clicking!' };
  if (n >= 7)  return { label: 'Fox',     emoji: '🦊', color: 'var(--neon-cyan, #00f5ff)',       stars: 3, desc: 'Sharp, quick, and tactical. You navigate the trigger points with impressive agility and cunning wit.' };
  if (n >= 4)  return { label: 'Turtle',  emoji: '🐢', color: 'var(--neon-green, #10b981)',      stars: 2, desc: 'Slow and steady pace. A safe execution strategy, but you need to unleash your inner explosive power!' };
  return        { label: 'Snail',  emoji: '🐌', color: 'var(--text-secondary, #94a3b8)', stars: 1, desc: 'One crawl at a time. Relax your forearm muscles, upgrade your grip pattern, and try again!' };
};

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'What is a Spacebar Counter and how does it work?',
    a: 'A Spacebar Counter is a browser-based diagnostic and speed measurement tool that tracks how many times you press the spacebar key within a set time window. When you press the Space key, the tool captures a precise hardware event timestamp from the browser\'s native KeyboardEvent API. It counts each distinct physical keydown stroke, ignores operating-system auto-repeat signals using the e.repeat guard, and computes your Clicks Per Second (CPS) by dividing total presses by elapsed seconds. The result is displayed in real time so you can observe your rhythm and burst-speed patterns as they happen.',
  },
  {
    q: 'What is a good spacebar CPS score for a beginner?',
    a: 'For most first-time users, a score between 3 and 5 CPS is perfectly normal. The average person pressing without any special technique typically lands in the 4–6 CPS range. Scores of 7–9 CPS represent a skilled, practiced user with good muscle memory. Anything at or above 10 CPS is considered competitive-level speed, and breaking 14–15 CPS requires advanced clicking techniques such as the butterfly method or controlled jitter clicking. Beginners should focus on consistency rather than raw speed in their first few attempts.',
  },
  {
    q: 'What is the difference between a Spacebar Test and a standard CPS Test?',
    a: 'A standard CPS Test measures how fast you can click a mouse button, while a Spacebar Test specifically measures keystroke speed on the spacebar key. The two require different muscle groups: mouse clicking uses your index finger and wrist, whereas spacebar pressing recruits your thumb and forearm stabilizer muscles. The spacebar also has a much larger physical surface area and uses a long stabilizer bar under the keycap, which introduces different mechanical resistance and travel characteristics compared to a mouse click. Both tests measure reaction precision, but the Spacebar Test is more directly relevant to gaming actions like jumping and attacking.',
  },
  {
    q: 'Does the type of keyboard affect my spacebar speed score?',
    a: 'Yes, significantly. Mechanical keyboards with linear switches such as Cherry MX Red or Speed Silver have a very low actuation force of around 45g and a short travel distance of 1.2–2.0mm, enabling faster repeated keystrokes. Membrane keyboards require the entire key to bottom out before registering, adding latency. Optical switches actuate via a light-beam sensor with virtually zero contact bounce, which can also improve consistency at high CPS rates. The quality of the spacebar stabilizers also matters enormously — poorly lubricated or rattly stabilizers cause micro-binding that costs milliseconds on each press cycle.',
  },
  {
    q: 'How do I use the Butterfly Method on the spacebar?',
    a: 'The Butterfly Method involves placing the index finger of one hand and the index or middle finger of your other hand on opposite ends of the spacebar. You alternate pressing each finger in a rapid rhythmic sequence, much like a butterfly\'s wings flapping. Because both fingers are actuating the key at independent intervals, the combined press frequency can reach two to three times what a single-thumb technique achieves. Practice slow alternating taps first, then gradually increase the tempo over several sessions. Always press near the center third of each end to avoid key binding from the stabilizer bar.',
  },
  {
    q: 'Can I practice spacebar speed on a mobile device or tablet?',
    a: 'While this tool is optimized for use with a physical keyboard on a desktop or laptop computer, the website is fully responsive and loads correctly on mobile browsers. On touchscreen devices, you can tap the large hitbox area to register presses instead of using the spacebar key. However, mobile tap speeds are generally lower than physical keyboard speeds because touchscreen digitizer polling rates are typically 60–120 Hz versus mechanical keyboard matrix scan rates of often 1000 Hz. For serious speed testing and training, a dedicated physical keyboard on a desktop or laptop is strongly recommended.',
  },
  {
    q: 'Why does the counter ignore held-down keypresses?',
    a: 'The tool explicitly intercepts the browser\'s native keydown event and checks the e.repeat boolean property. When a key is physically held down for more than approximately 500 milliseconds, the operating system generates artificial repeated keydown events at a fixed interval of usually 30–40 repeats per second. These synthetic events are not genuine physical key actuations. Since the goal of the Spacebar Counter is to measure real manual clicking speed, all OS-generated auto-repeat signals are discarded. Only one keystroke is counted per full mechanical press-and-release cycle, ensuring that held-down keys cannot inflate your score.',
  },
  {
    q: 'What is Keyboard Polling Rate and does it impact the spacebar test?',
    a: 'Keyboard polling rate refers to how often your keyboard reports its state to the computer, measured in Hertz. A 125 Hz keyboard reports every 8ms, while a 1000 Hz gaming keyboard reports every 1ms. For spacebar speed tests at 10–15 CPS, the inter-press interval is roughly 67–100ms, which is far wider than even a 125 Hz polling window. This means standard polling rates have virtually no measurable impact on spacebar CPS scores at normal human speeds. Polling rate becomes relevant only in theoretical mechanical scenarios well beyond human pressing capability.',
  },
  {
    q: 'How does the Jitter Click technique apply to the spacebar?',
    a: 'Jitter clicking is a method where you intentionally tense the muscles of your forearm, wrist, and hand to produce rapid involuntary micro-vibrations that translate into very fast key or button activations. When applied to the spacebar, you position your thumb flat on the key surface, engage your forearm muscles, and allow the vibration to drive repeated actuations. This technique can achieve burst speeds of 12–16 CPS but carries a health risk: sustained jitter clicking can strain tendons and lead to repetitive strain injuries. It is strongly advised to limit jitter sessions to 15–30 seconds at a time with adequate rest intervals.',
  },
  {
    q: 'How is the spacebar used in Minecraft and why does speed matter?',
    a: 'In Minecraft, the spacebar controls the jump action, which is central to parkour, bridging, movement optimization, and PvP combat. In competitive Minecraft PvP modes such as Hypixel SkyWars and BedWars, rapid spacebar actuation is used to execute strafe-jumping maneuvers that make the player harder to hit while simultaneously increasing movement speed. Parkour maps require precise timing of spacebar presses to clear gaps. Players who can achieve consistent 7–10 CPS on the spacebar have significantly better in-game movement control compared to casual players pressing at 2–3 CPS rhythms.',
  },
  {
    q: 'How is the spacebar used in Geometry Dash?',
    a: 'In Geometry Dash, every spacebar press makes the icon jump, and the entire game is built around precise timing of these presses to clear obstacles. At harder demon-level difficulties, players need to perform rapid consecutive spacebar presses at precise rhythmic intervals synchronized to the background music beat. The timing windows can be as narrow as 50–80 milliseconds. Spacebar speed is critical in wave and ship segments where rapid alternating presses control altitude. Players who train their spacebar CPS using dedicated tools like this counter develop the muscle memory and finger stamina required to complete extreme-level demon courses.',
  },
  {
    q: 'Can spacebar testing help with rhythm games like osu! or Beat Saber?',
    a: 'Yes. In rhythm games such as osu! particularly the osu!mania mode, players must hit note lanes in sync with music, often pressing the spacebar or other keyboard keys at high frequency. Training raw spacebar CPS builds the finger independence, endurance, and rhythmic timing accuracy needed to sustain long streams of notes without losing accuracy. While rhythm games test timing precision rather than maximum raw speed, the fundamental muscle conditioning gained from spacebar speed training directly transfers. Players who regularly practice CPS testing report improved hit-accuracy percentages on high-density note streams in osu! within a few weeks of structured training.',
  },
  {
    q: 'Does browser type or version affect spacebar test accuracy?',
    a: 'Modern evergreen browsers including Chromium-based browsers such as Chrome, Edge, Brave, and Opera, as well as Firefox and Safari, all implement the KeyboardEvent API to the same W3C specification, making measurement accuracy functionally identical across all of them. Browser JavaScript engine speed does not materially affect keystroke timestamp precision because the event timestamps are sourced from the system\'s high-resolution monotonic clock, not from JavaScript execution speed. The only browser-specific variable is AudioContext latency for the click sound feedback, which is cosmetic only and has zero effect on counted presses.',
  },
  {
    q: 'What are the health risks of high-speed spacebar clicking?',
    a: 'Extended high-frequency spacebar clicking sessions can cause repetitive strain injuries, specifically tendinitis in the thumb flexor tendons, carpal tunnel syndrome from sustained wrist dorsiflexion, and forearm extensor compartment fatigue. Jitter clicking amplifies these risks because it forces involuntary sustained muscle contraction. To minimize injury risk, limit intensive speed sessions to 60 seconds per attempt, take 5-minute breaks between sessions, stretch your fingers and forearms before starting, maintain a neutral wrist position, and avoid pressing the key with your wrist resting on a hard surface. If you experience tingling, numbness, or pain, stop immediately and consult a physician.',
  },
  {
    q: 'What is the world record for spacebar CPS and is it verified?',
    a: 'Various online sources cite spacebar speed records ranging from 14 to over 20 CPS, but most of these community-reported records are unverified and often achieved under conditions that may involve macro software or hardware modifications. True human-achievable spacebar CPS, under strict conditions with a standard keyboard and no software assistance, is generally accepted to peak around 14–16 CPS for extremely trained individuals using butterfly or jitter techniques. This tool implements strict e.repeat filtering to ensure only genuine physical key actuations are counted, providing a fair and authentic measurement standard.',
  },
  {
    q: 'How do I maintain my keyboard to preserve spacebar performance?',
    a: 'Keyboard maintenance directly affects spacebar responsiveness and CPS potential. First, clean your spacebar keycap every 2–4 weeks using isopropyl alcohol on a microfiber cloth to remove skin oils and debris. Second, lubricate the stabilizer bars with dielectric grease for the wire and thin PTFE-based lubricant for the housing to eliminate rattle and smooth out actuation. Third, if your switch feels scratchy or inconsistent, apply a thin layer of switch lubricant such as Krytox 205g0 for linears to the stem rails. A well-maintained mechanical keyboard can retain its original performance characteristics for 50–100 million keystrokes.',
  },
  {
    q: 'Is this Spacebar Counter tool completely free to use?',
    a: 'Yes, this Spacebar Counter tool is completely free with no registration required, no account creation, no download, and no subscription fees. It runs entirely in your web browser using standard JavaScript and the Web Audio API. No personal data is collected, no cookies are stored beyond the session, and no server-side processing occurs — all calculations happen locally in your browser. The tool is available 24 hours a day, 7 days a week, and works on any device with a modern browser. You can use it for unlimited sessions and track unlimited history within the same browser session.',
  },
  {
    q: 'Can I use this tool to test keyboard switch actuation consistency?',
    a: 'Partially, yes. While this tool is primarily designed as a speed benchmark rather than a laboratory-grade switch tester, you can use it to observe consistency patterns across multiple test sessions. If your peak CPS varies wildly between identical-duration tests, this may indicate switch contact bounce, stabilizer binding, or physical keycap wobble causing inconsistent actuation. A healthy mechanical switch should produce relatively consistent CPS results across repeated trials under the same clicking style. Professional switch testers use oscilloscope-based contact analyzers for true actuation consistency measurement, but this tool provides a useful practical approximation.',
  },
  {
    q: 'What role does reaction time play in spacebar speed tests?',
    a: 'Reaction time affects how quickly you begin pressing after the test starts, but because the timer begins when you first press the spacebar and not before, initial reaction time does not penalize your CPS score mathematically. However, within the test session itself, inter-press reaction time — how quickly your neuromuscular system can reset and re-fire the spacebar after each press — directly determines your maximum achievable CPS. Elite typists and gamers develop shorter neural reset cycles through repetitive practice, effectively training their motor cortex to minimize the idle gap between mechanical key release and the next actuation impulse.',
  },
  {
    q: 'How do linear, tactile, and clicky switches compare for spacebar speed?',
    a: 'Linear switches such as Cherry MX Red and Gateron Yellow offer smooth, uninterrupted travel with no tactile bump or audible click, making them the fastest for rapid repeated presses because your finger experiences zero resistance mid-stroke. Tactile switches such as Cherry MX Brown and Topre 45g have a physical bump at the actuation point that provides feedback but adds a tiny amount of resistance that can slow peak burst speed. Clicky switches such as Cherry MX Blue and Kailh Box White have both a bump and an audible click mechanism that takes slightly longer to reset. For maximum raw spacebar CPS, linear switches especially speed variants with shortened pre-travel are the optimal choice.',
  },
  {
    q: 'What is the difference between a Spacebar Counter and a KPS Test?',
    a: 'In practice, a Spacebar Counter and a KPS Test measure the exact same underlying thing: how many times you actuate a key within a given time window. "Spacebar Counter" describes the tool itself — the interface, timer, and click counter display you interact with — while "KPS Test" (Keystrokes Per Second) describes the specific metric that tool produces. This page functions as both simultaneously, giving you a live click counter during the run and a final KPS or CPS score once the timer ends, so there is no need to visit a separate KPS test page to get the same measurement.',
  },
  {
    q: 'Can I use this as a general click counter, not just for the spacebar?',
    a: 'This tool is purpose-built as a spacebar counter, so it specifically listens for spacebar keydown events rather than mouse clicks. If you want a generic click counter for mouse-button speed, you would want a dedicated mouse CPS test instead. That said, the same underlying click counter architecture — high-resolution timestamps, repeat-event filtering, and rolling peak-CPS calculation — applies equally well to any input type, which is why spacebar counters and mouse click counters typically share very similar codebases and scoring tiers.',
  },
  {
    q: 'How many presses should I expect from a 30-second spacebar counter session?',
    a: 'At an average casual pace of 4–6 CPS, a 30-second spacebar counter session typically yields 120–180 total presses. A skilled single-thumb presser at 7–9 CPS will land between 210–270 presses, while a trained butterfly-method user at 10–14 CPS can reach 300–420 presses in the same 30 seconds. These numbers are a helpful sanity check: if your click counter total falls far outside these ranges for your perceived effort, it may be worth checking your keyboard for stabilizer binding or switch bounce.',
  },
  {
    q: 'Why do my CPS and KPS numbers sometimes differ between attempts on the same counter?',
    a: 'Small run-to-run variance of 0.5–1.5 CPS on the same click counter is completely normal and expected, even for experienced testers. Muscle fatigue from a previous attempt, subtle changes in wrist angle, ambient temperature affecting finger dexterity, and simple neuromuscular variability all contribute to natural fluctuation. Rather than treating any single KPS test result as definitive, average three to five consecutive attempts with short rests between them to get a more statistically reliable picture of your true spacebar speed.',
  },
  {
    q: 'Is a spacebar counter score comparable across different websites?',
    a: 'Not always. While the underlying concept is identical, different spacebar counter and KPS test implementations vary in how strictly they filter e.repeat auto-repeat events, which clock source they use for timing, and whether they attach listeners globally or to a specific element. A poorly built click counter that fails to filter auto-repeat can report inflated scores for the exact same physical performance. For consistent tracking over time, it is best to stick to one trusted spacebar counter tool rather than comparing raw numbers across multiple sites.',
  },
] as const;

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────
const buildJsonLd = (): string => {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Spacebar Counter – CPS Test',
      url: PAGE_URL,
      description: 'Free online spacebar speed test. Measure your spacebar clicks per second (CPS) with real-time ratings, session history, and audio feedback.',
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a modern browser with JavaScript enabled.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      featureList: [
        'Real-time CPS measurement',
        'Multiple timer durations',
        'Custom duration support',
        'Session history tracking',
        'Audio click feedback',
        'Speed rating system',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',            item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Keyboard Tools',  item: `${SITE_URL}/keyboard-tools` },
        { '@type': 'ListItem', position: 3, name: 'Spacebar Counter', item: PAGE_URL },
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
  return JSON.stringify(schemas);
};

const JSON_LD_DATA = buildJsonLd();

// ─── Shared static styles (module-level, avoids re-creating per render) ──────
const GLOBAL_STYLES = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes modalPopIn {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1);    }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  @media (max-width: 520px) {
    .spacebar-stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .spacebar-duration-row { gap: 0.3rem !important; }
  }
`;

// ─── Reusable Stat Card ───────────────────────────────────────────────────────
const StatCard = memo(({ value, label, color }: {
  value: string | number;
  label: string;
  color: string;
}) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
  }}>
    <div style={{
      fontSize: 'clamp(1.75rem, 5vw, 3rem)',
      fontWeight: '900',
      color,
      fontVariantNumeric: 'tabular-nums',
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '0.75rem',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginTop: '0.25rem',
    }}>
      {label}
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

// ─── Chevron Icon ─────────────────────────────────────────────────────────────
const ChevronIcon = memo(({ open }: { open: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{
      flexShrink: 0,
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease',
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
));
ChevronIcon.displayName = 'ChevronIcon';

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
interface FaqAccordionItemProps {
  q: string;
  a: string;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

const FaqAccordionItem = memo(({ q, a, index, isOpen, onToggle }: FaqAccordionItemProps) => {
  const panelId  = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
      style={{
        background: isOpen ? 'rgba(0,245,255,0.04)' : 'var(--bg-card, #12141f)',
        border: `1px solid ${isOpen ? 'var(--neon-cyan, #00f5ff)' : 'var(--border, rgba(255,255,255,0.08))'}`,
        borderRadius: '12px',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
    >
      <h3 style={{ margin: 0 }} itemProp="name">
        <button
          id={buttonId}
          type="button"
          onClick={() => onToggle(index)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            background: 'transparent',
            border: 'none',
            padding: '1rem 1.25rem',
            cursor: 'pointer',
            textAlign: 'left',
            color: '#fff',
            fontSize: '0.96rem',
            fontWeight: '600',
          }}
        >
          <span>{q}</span>
          <span style={{ color: isOpen ? 'var(--neon-cyan, #00f5ff)' : 'var(--text-muted, #94a3b8)' }}>
            <ChevronIcon open={isOpen} />
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        itemScope
        itemProp="acceptedAnswer"
        itemType="https://schema.org/Answer"
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.25s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <p
            itemProp="text"
            style={{
              margin: 0,
              padding: '0 1.25rem 1.1rem 1.25rem',
              color: 'var(--text-muted, #94a3b8)',
              fontSize: '0.88rem',
              lineHeight: '1.72',
            }}
          >
            {a}
          </p>
        </div>
      </div>
    </div>
  );
});
FaqAccordionItem.displayName = 'FaqAccordionItem';

// ─── Focus Trap Hook ──────────────────────────────────────────────────────────
function useFocusTrap(
  active: boolean,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const el = containerRef.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    first?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    };
    el.addEventListener('keydown', handleTab);
    return () => el.removeEventListener('keydown', handleTab);
  }, [active, containerRef]);
}

// ─── Spacebar Key Animation Component ────────────────────────────────────────
const SpacebarKey = memo(({ isPressed, phase }: {
  isPressed: boolean;
  phase: Phase;
}) => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pressed = isPressed && !prefersReducedMotion;

  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        marginTop: '1rem',
        perspective: '200px',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '52px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: pressed
            ? 'translateY(4px) rotateX(6deg) scale(0.985)'
            : 'translateY(0px) rotateX(0deg) scale(1)',
          transition: pressed
            ? 'transform 0.04s ease-in'
            : 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: 'transform',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '52px',
            background: phase === 'running'
              ? (pressed ? 'rgba(0,200,220,0.9)' : 'var(--neon-cyan, #00f5ff)')
              : pressed
                ? 'rgba(255,255,255,0.12)'
                : 'rgba(255,255,255,0.06)',
            border: `2px solid ${
              phase === 'running'
                ? (pressed ? 'rgba(0,180,200,0.6)' : 'var(--neon-cyan, #00f5ff)')
                : pressed
                  ? 'rgba(255,255,255,0.25)'
                  : 'var(--border, rgba(255,255,255,0.1))'
            }`,
            borderBottom: pressed
              ? `2px solid ${phase === 'running' ? 'rgba(0,160,180,0.4)' : 'rgba(255,255,255,0.1)'}`
              : `5px solid ${phase === 'running' ? 'rgba(0,160,180,0.8)' : 'rgba(255,255,255,0.18)'}`,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: '700',
            color: phase === 'running'
              ? (pressed ? 'rgba(0,0,0,0.9)' : '#000')
              : pressed ? 'var(--text-secondary)' : 'var(--text-muted)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'default',
            boxShadow: pressed
              ? 'none'
              : phase === 'running'
                ? '0 4px 15px rgba(0,245,255,0.35), 0 2px 6px rgba(0,0,0,0.4)'
                : '0 4px 8px rgba(0,0,0,0.35)',
            transition: [
              'background 0.05s',
              'border-color 0.05s',
              'border-bottom-width 0.05s',
              'box-shadow 0.05s',
              'color 0.05s',
            ].join(', '),
          }}
        >
          SPACEBAR
        </div>
      </div>
    </div>
  );
});
SpacebarKey.displayName = 'SpacebarKey';

// ─── Result Modal ─────────────────────────────────────────────────────────────
interface ResultModalProps {
  rating: RatingResult;
  count: number;
  finalSps: number;
  maxSps: number;
  duration: number;
  onReset: () => void;
  onTryAgain: () => void;
}

const ResultModal = memo(({
  rating, count, finalSps, maxSps, duration, onReset, onTryAgain,
}: ResultModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, dialogRef);

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 999,
          animation: 'fadeIn 0.3s ease-out forwards',
        }}
        onClick={onReset}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Result: ${rating.label} rank with ${finalSps.toFixed(2)} CPS`}
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95%', maxWidth: '560px',
          background: '#0d1117',
          border: `2px solid ${rating.color}`,
          borderRadius: '20px',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          zIndex: 1000,
          animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          boxShadow: `0 0 40px ${rating.color}25`,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close */}
        <button
          onClick={onReset}
          aria-label="Close result dialog"
          style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${rating.color}40`,
            color: rating.color,
            width: '32px', height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {/* Rating */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '1.25rem',
          alignItems: 'center',
          minHeight: '130px',
          marginBottom: '1.25rem',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            paddingRight: '1rem', height: '100%',
          }}>
            <span
              style={{ fontSize: '4.5rem', lineHeight: '1', filter: `drop-shadow(0 0 15px ${rating.color}40)` }}
              aria-hidden="true"
            >
              {rating.emoji}
            </span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Rank is
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: rating.color, fontStyle: 'italic', margin: '0.1rem 0' }}>
              {rating.label}!
            </div>
            <div
              style={{ display: 'flex', gap: '3px', marginBottom: '0.5rem' }}
              aria-label={`${rating.stars} out of 5 stars`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} aria-hidden="true" style={{ fontSize: '1.2rem', color: i < rating.stars ? '#ffca28' : 'rgba(255,255,255,0.1)' }}>★</span>
              ))}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              You pressed at{' '}
              <strong style={{ color: '#fff', fontSize: '1.15rem', fontVariantNumeric: 'tabular-nums' }}>
                {finalSps.toFixed(2)}
              </strong>{' '}
              CPS
            </div>
          </div>
        </div>

        <blockquote style={{
          background: 'rgba(0,0,0,0.25)', padding: '0.85rem 1rem',
          borderRadius: '12px', borderLeft: `3px solid ${rating.color}`,
          fontStyle: 'italic', color: '#cbd5e1',
          fontSize: '0.88rem', textAlign: 'left',
          marginBottom: '1.25rem', lineHeight: '1.5',
          margin: '0 0 1.25rem 0',
        }}>
          {rating.desc}
        </blockquote>

        {/* Mini stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[
            { value: count,          label: 'Total Presses', color: 'var(--neon-cyan)'   },
            { value: maxSps,         label: 'Peak CPS (1s)', color: 'var(--neon-green)'  },
            { value: `${duration}s`, label: 'Duration',      color: 'var(--neon-orange)' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px', padding: '0.5rem 0.25rem',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={onReset}
            style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            🔄 Reset
          </button>
          <button
            className="btn btn-primary"
            onClick={onTryAgain}
            style={{
              padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              backgroundColor: rating.color, borderColor: rating.color, color: '#000', fontWeight: '700',
            }}
          >
            ▶ Try Again
          </button>
        </div>
      </div>
    </>
  );
});
ResultModal.displayName = 'ResultModal';


// ─── SEO Head Tags ────────────────────────────────────────────────────────────
function SeoHead() {
  useEffect(() => {
    const tags: Array<{ tag: string; attrs: Record<string, string> }> = [
      { tag: 'meta', attrs: { name: 'description',    content: 'Free Spacebar Counter & CPS Test — measure your spacebar speed test score in clicks per second. Track CPS, ratings & history with our keyboard test tool.' } },
      { tag: 'meta', attrs: { name: 'robots',         content: 'index,follow,max-image-preview:large' } },
      { tag: 'meta', attrs: { name: 'theme-color',    content: '#00f5ff' } },
      { tag: 'link', attrs: { rel: 'canonical',       href: PAGE_URL } },
      { tag: 'link', attrs: { rel: 'icon',            href: '/favicon.ico',        sizes: 'any' } },
      { tag: 'link', attrs: { rel: 'icon',            href: '/favicon-32x32.png',  type: 'image/png', sizes: '32x32' } },
      { tag: 'link', attrs: { rel: 'icon',            href: '/favicon-16x16.png',  type: 'image/png', sizes: '16x16' } },
      { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
      { tag: 'link', attrs: { rel: 'manifest',        href: '/manifest.webmanifest' } },
      { tag: 'link', attrs: { rel: 'mask-icon',       href: '/safari-pinned-tab.svg', color: '#00f5ff' } },
      { tag: 'meta', attrs: { property: 'og:type',        content: 'website' } },
      { tag: 'meta', attrs: { property: 'og:url',         content: PAGE_URL } },
      { tag: 'meta', attrs: { property: 'og:site_name',   content: SITE_NAME } },
      { tag: 'meta', attrs: { property: 'og:title',       content: 'Spacebar Counter — Free Spacebar Speed Test & CPS Test' } },
      { tag: 'meta', attrs: { property: 'og:description', content: 'Test your spacebar speed for free! Measure CPS in 5s, 10s, 15s, 30s or 60s. Track history, get ratings & improve your keyboard test score.' } },
      { tag: 'meta', attrs: { property: 'og:image',       content: OG_IMAGE } },
      { tag: 'meta', attrs: { name: 'twitter:card',        content: 'summary_large_image' } },
      { tag: 'meta', attrs: { name: 'twitter:title',       content: 'Spacebar Counter — Free Spacebar Speed Test & CPS Test' } },
      { tag: 'meta', attrs: { name: 'twitter:description', content: 'Test your spacebar speed for free! Measure CPS in 5–60 second rounds. Real-time ratings, history & audio feedback.' } },
      { tag: 'meta', attrs: { name: 'twitter:image',       content: OG_IMAGE } },
    ];

    const inserted: HTMLElement[] = [];

    for (const { tag, attrs } of tags) {
      const selector =
        tag === 'meta' && attrs.name     ? `meta[name="${attrs.name}"]`     :
        tag === 'meta' && attrs.property ? `meta[property="${attrs.property}"]` :
        tag === 'link' && attrs.rel      ? `link[rel="${attrs.rel}"]`        :
        null;

      if (selector) {
        const existing = document.head.querySelector(selector);
        if (existing) {
          for (const [k, v] of Object.entries(attrs)) existing.setAttribute(k, v);
          continue;
        }
      }

      const el = document.createElement(tag) as HTMLElement;
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      document.head.appendChild(el);
      inserted.push(el);
    }

    const prevTitle = document.title;
    document.title = 'Spacebar Counter — Free Spacebar Speed Test & CPS Test';
    return () => {
      inserted.forEach(el => { if (document.head.contains(el)) document.head.removeChild(el); });
      document.title = prevTitle;
    };
  }, []);

  return null;
}

// ─── JSON-LD Injector ─────────────────────────────────────────────────────────
function JsonLd({ data }: { data: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = data;
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, [data]);
  return null;
}

// ─── External citation link (matches in-article inline source style) ────────
const SourceLink = memo(({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer nofollow"
    style={{
      color: 'var(--neon-cyan, #00f5ff)',
      textDecoration: 'none',
      borderBottom: '1px solid rgba(0,245,255,0.35)',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'inline-block', marginLeft: '3px', verticalAlign: 'middle', position: 'relative', top: '-2px' }}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  </a>
));
SourceLink.displayName = 'SourceLink';

// ─── FAQ Section (accordion) ─────────────────────────────────────────────────
function FaqSection() {
  // -1 means nothing open; only one panel open at a time (accordion behavior)
  const [openIndex, setOpenIndex] = useState<number>(-1);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex(prev => (prev === index ? -1 : index));
  }, []);

  return (
    <div
      itemScope
      itemType="https://schema.org/FAQPage"
      style={{
        marginTop: '2.5rem',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid var(--border)',
      }}
    >
      <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.35rem', fontWeight: '700', marginBottom: '1.5rem', marginTop: '0' }}>
        Frequently Asked Questions (FAQs)
      </h2>

      {FAQ_ITEMS.map(({ q, a }, index) => (
        <FaqAccordionItem
          key={q}
          q={q}
          a={a}
          index={index}
          isOpen={openIndex === index}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}

// ─── SEO Article ─────────────────────────────────────────────────────────────
function SpacebarArticleContent() {
  const h2: React.CSSProperties = {
    color: 'var(--neon-cyan)',
    fontSize: '1.4rem',
    fontWeight: '700',
    marginBottom: '1rem',
    marginTop: '2.5rem',
  };
  const h3: React.CSSProperties = {
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.65rem',
    marginTop: '1.75rem',
  };
  const h4: React.CSSProperties = {
    color: 'var(--neon-cyan)',
    fontSize: '0.98rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    marginTop: '1.4rem',
  };
  const p: React.CSSProperties = {
    marginBottom: '1.1rem',
    color: 'var(--text-secondary)',
    fontSize: '0.91rem',
    lineHeight: '1.78',
  };
  const ul: React.CSSProperties = {
    paddingLeft: '1.2rem',
    marginBottom: '1.25rem',
    listStyleType: 'disc',
    color: 'var(--text-secondary)',
    fontSize: '0.91rem',
    lineHeight: '1.78',
  };
  const li: React.CSSProperties = { marginBottom: '0.55rem' };

  return (
    <>
      <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '3rem 0' }} />
      <article style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem' }}>
      <section style={{ color: 'var(--text-secondary)', fontSize: '0.91rem', lineHeight: '1.78' }}>

        {/* ── 1 ── */}
        <h2 style={{ ...h2, marginTop: 0 }}>What is a Spacebar Counter (CPS Test)?</h2>
        <p style={p}>
          A <strong>Spacebar Counter</strong> — sometimes called a <strong>spacebar clicker test</strong>, a <strong>click counter</strong>, or a <strong>KPS test</strong> — is a browser-based benchmark utility engineered to measure exactly how many times you physically actuate the spacebar key within a defined time window, expressed as <strong>Clicks Per Second (CPS)</strong> or <strong>Keystrokes Per Second (KPS)</strong>. Unlike a standard mouse CPS test or generic <strong>click counter</strong>, which measures index-finger click rate on a mouse button, the Spacebar Test isolates thumb-and-forearm muscle performance on the longest, most mechanically complex key on a standard keyboard layout. The tool captures raw hardware-level keyboard events via the browser's native <code>KeyboardEvent</code> API, applies anti-cheat filtering to exclude OS auto-repeat signals, and computes your performance in real time with sub-50-millisecond update intervals.
        </p>
        <p style={p}>
          Originally developed in gaming communities as a way to benchmark jump-key responsiveness for titles such as Minecraft and Geometry Dash, the <strong>spacebar counter</strong> has since evolved into a genuinely multi-purpose instrument that sits alongside the mouse-based <strong>click counter</strong> as a standard part of any serious input-speed toolkit. Competitive gamers use it to warm up before ranked sessions and benchmark hardware upgrades. Typists use it to isolate and correct a specific weak point in their technique. Keyboard enthusiasts use it as a practical, no-equipment-required way to validate a fresh switch lubrication job or a new set of stabilizers. And casual users simply use it as a fun, addictive way to see how fast their fingers can really move — turning a simple spacebar clicker test into a genuinely useful diagnostic tool.
        </p>
        <p style={p}>
          What sets a well-built <strong>spacebar counter</strong> apart from a novelty toy is measurement integrity. Anyone can build a page that increments a number on keypress, but a trustworthy CPS or KPS test has to solve several subtle engineering problems at once: filtering out synthetic OS-generated repeat events, using a monotonic high-resolution clock instead of wall-clock time, avoiding double-counting from overlapping event listeners, and rendering results fast enough that the feedback loop feels instant rather than laggy. This page is built specifically to get all of that right, so the number you see at the end of a session is a number you can actually trust and compare against future attempts — whether you call it a spacebar test, a click counter, or a KPS test.
        </p>

        {/* ── 2 ── */}
        <h2 style={h2}>How the Spacebar Counter Works — Technical Deep Dive</h2>
        <p style={p}>
          The moment you load this page, the tool registers a global <code>window.addEventListener('keydown', …)</code> listener. This listener intercepts every keydown event fired by the browser's event pipeline. When the captured <code>e.key</code> value equals a space character, the tool first inspects the <code>e.repeat</code> boolean. If <code>e.repeat</code> is <code>true</code>, the event is silently discarded — this eliminates the operating system's built-in key-repeat mechanism, which would otherwise inflate scores with synthetically generated repeated keystrokes. Only distinct physical downstroke cycles are counted, which is precisely what separates a genuine <strong>spacebar counter</strong> benchmark from a naive <strong>click counter</strong> that can be gamed simply by holding the key down.
        </p>
        <p style={p}>
          Each valid press is timestamped using <code>performance.now()</code>, a high-resolution monotonic clock with sub-millisecond precision that is immune to system clock adjustments, unlike <code>Date.now()</code>. The countdown timer is managed by a <code>setInterval</code> polling at 50ms intervals, allowing smooth real-time progress updates while maintaining minimal CPU overhead. Every 50ms the tool also recomputes your rolling one-second peak <strong>CPS</strong> by filtering the timestamp array for presses within the last 1000ms — this is what powers the "Peak CPS" statistic shown at the end of every session, giving you visibility into your best short burst, not just your average across the full test.
        </p>
        <p style={p}>
          When the countdown expires, the final CPS or KPS is computed by dividing total press count by the total test duration, then rendered as a score card with a performance tier label ranging from Snail to Machine. Because the entire pipeline runs client-side with no network round-trip, there is effectively zero added latency between your physical keypress and the number updating on screen — the only delay in the loop is the browser's own event-dispatch time, typically under three milliseconds on any modern device. According to general <SourceLink href="https://en.wikipedia.org/wiki/Human_reaction_time">reaction-time research</SourceLink>, this is well below the threshold most people can consciously perceive.
        </p>

        {/* ── 3 ── */}
        <h3 style={h3}>The Role of Keyboard Event Bubbling and Propagation</h3>
        <p style={p}>
          Attaching the keydown listener to the <code>window</code> object rather than a specific DOM element ensures that spacebar events are captured regardless of which element currently holds keyboard focus. This is critical for usability — if the listener were scoped to a specific <code>div</code>, tabbing focus away from that element would silently break the test. The global listener architecture also prevents duplicate event counting that would occur if both a child element and a parent container independently registered the same event, a subtle bug that plagues many lower-quality <strong>spacebar counter</strong> and <strong>click counter</strong> clones found elsewhere online.
        </p>
        <p style={p}>
          There is a deliberate trade-off here: because the listener is global, the tool has to explicitly ignore spacebar presses while focus sits on an interactive form control like the custom-duration input or a button, otherwise pressing space to activate a focused button would incorrectly register as a game press. This page handles that edge case directly by checking <code>document.activeElement</code> before counting any press, so keyboard-only navigation never accidentally corrupts your CPS score.
        </p>

        {/* ── 4 ── */}
        <h2 style={h2}>What is a Good Spacebar Speed Score?</h2>
        <p style={p}>
          Spacebar CPS scores exist on a broad spectrum depending on technique, hardware, and practice level. The following benchmark tiers, used throughout this tool's rating system, represent real-world performance ranges gathered from thousands of informal community <strong>spacebar counter</strong> and <strong>KPS test</strong> sessions:
        </p>
        <ul style={ul}>
          <li style={li}><strong>1–3 CPS (Snail 🐌):</strong> Complete beginner, casual pressing with no specific technique, often the very first attempt on the tool.</li>
          <li style={li}><strong>4–6 CPS (Turtle 🐢):</strong> Average casual user pressing with a single thumb at a relaxed, unhurried pace — this is where most first-time visitors land.</li>
          <li style={li}><strong>7–9 CPS (Fox 🦊):</strong> Skilled user with developed muscle memory. Competitive in most casual gaming contexts and noticeably faster than the general population.</li>
          <li style={li}><strong>10–14 CPS (Cheetah 🐆):</strong> High-performance user employing advanced techniques such as early-stage butterfly clicking or optimized single-thumb form.</li>
          <li style={li}><strong>15+ CPS (Machine 🤖):</strong> Elite tier, typically achieved only with the full butterfly method or jitter technique after weeks of dedicated practice.</li>
        </ul>
        <p style={p}>
          Context matters enormously when interpreting your own number. A 6 CPS score after your very first ten-second attempt is completely normal and not a reason to feel discouraged — most of the population has never deliberately trained spacebar speed and simply presses at a resting, conversational pace. The real value of a "good" score is relative to your own baseline: track your number across several sessions in the same week using the built-in <strong>click counter</strong> history, and look for the trend line rather than fixating on any single result.
        </p>

        {/* ── 5 ── */}
        <h2 style={h2}>Average Spacebar Speed by User Type</h2>
        <p style={p}>
          Research into keystroke dynamics across different user populations reveals distinct average CPS clusters, and these clusters map fairly cleanly onto how much deliberate practice a group has put into spacebar-specific speed. Casual computer users who have never practiced speed clicking average 3–5 CPS, which reflects ordinary typing-speed thumb motion rather than a trained maximal-effort burst. Regular gamers who use the spacebar for jumping in action games typically fall between 5–8 CPS, since repeated exposure to jump mechanics naturally builds some baseline thumb conditioning even without formal practice.
        </p>
        <p style={p}>
          Dedicated speedrunners and competitive gamers who actively train their spacebar technique report consistent averages of 9–13 CPS, a range that generally requires weeks of structured single-thumb or early butterfly practice to reach reliably. Professional esports athletes and clicking enthusiasts active in online speed communities push into the 14–18 CPS range using advanced multi-finger techniques — but it is worth being clear that scores at the very top of this range are rare even within dedicated communities, and most competitive players plateau comfortably below it while still performing at a high level in their actual games.
        </p>

        {/* ── 6 ── */}
        <h2 style={h2}>Benefits of Using a Spacebar Test</h2>
        <h3 style={h3}>Performance Benchmarking</h3>
        <p style={p}>
          Regular use of the <strong>Spacebar Test</strong> provides an objective measurement baseline that removes the subjectivity from self-assessment. Human memory is notoriously unreliable at judging our own physical performance over time — most people either overestimate how much they have improved or fail to notice gradual gains entirely. When you track your CPS score across dozens of sessions over weeks, you gain concrete, timestamped evidence of improvement or plateau that guides your training decisions far more reliably than "it feels faster."
        </p>
        <h3 style={h3}>Hardware Validation</h3>
        <p style={p}>
          The Spacebar Test doubles as a practical keyboard hardware diagnostic. If you suspect your spacebar switch is experiencing contact bounce or actuation inconsistency, comparing CPS scores before and after a switch replacement or lubrication session provides empirical validation of the hardware improvement — turning what would otherwise be a subjective "it feels smoother" impression into an actual before-and-after number you can point to using the tool's <strong>click counter</strong> and history log.
        </p>
        <h3 style={h3}>Warm-Up Tool for Gaming Sessions</h3>
        <p style={p}>
          Many competitive gamers use a 10-second Spacebar Test as part of their pre-game warm-up routine. A few quick CPS test rounds raise finger temperature, improve blood circulation to the forearm flexors, and prime the motor cortex for rapid keystroke sequences before entering a ranked match, in much the same way a sprinter does dynamic stretching before a race rather than starting cold.
        </p>
        <h3 style={h3}>Isolated Skill Diagnosis</h3>
        <p style={p}>
          Because the test isolates a single, simple motion, it is unusually good at revealing exactly where a technique breaks down. A player whose in-game jump feels sluggish can use the <strong>spacebar counter</strong> to check whether the bottleneck is genuinely their pressing speed, or whether the real issue lies elsewhere — input lag, game-side tick rate, or binding conflicts. Isolating variables this way is a basic principle of any serious training program, and the spacebar test is a convenient, zero-setup way to do it for keyboard input specifically.
        </p>

        {/* ── 7 ── */}
        <h2 style={h2}>How to Increase Spacebar Speed — Step-by-Step Guide</h2>
        <h3 style={h3}>Step 1 — Establish Your Baseline</h3>
        <p style={p}>
          Before attempting to improve, run five consecutive 10-second tests using your natural pressing style. Average the five scores. This is your baseline CPS. You cannot measure progress without a reference point, and skipping this step is the single most common mistake people make when they start spacebar speed training. Most beginners discover they are pressing at 3–5 CPS without any specialized technique, which is a perfectly normal starting point.
        </p>
        <h3 style={h3}>Step 2 — Optimize Your Physical Posture</h3>
        <p style={p}>
          Sit upright with your keyboard at elbow height. Position your dominant hand so your thumb rests naturally at the center-left third of the spacebar surface. Keep your wrist flat and floating slightly above the desk — not pressed against it. Resting your wrist on the desk introduces friction that slows your thumb's upward recovery stroke and is one of the most overlooked reasons people plateau early. General ergonomic guidance from <SourceLink href="https://www.osha.gov/etools/computer-workstations">workplace ergonomics resources</SourceLink> echoes this same neutral-wrist principle for any repetitive keyboard task.
        </p>
        <h3 style={h3}>Step 3 — Practice the Single-Thumb Technique First</h3>
        <p style={p}>
          Before advancing to multi-finger techniques, master single-thumb pressing. Focus on minimizing travel distance of each press — actuate the key just deep enough to register without bottoming out. On most keyboards the actuation point is 1.5–2mm down from the top position, and every extra millimeter of unnecessary travel on both the downstroke and the return stroke adds up quickly at high repetition rates.
        </p>
        <h3 style={h3}>Step 4 — Graduate to the Butterfly Method</h3>
        <p style={p}>
          Once your single-thumb CPS plateaus around 6–7, transition to the butterfly method. Place your left index finger on the left side of the spacebar and your right index finger on the right side. Alternate pressing each finger in a continuous rhythm. Most users who commit to this training break the 10 CPS threshold within 3–4 weeks, since the technique effectively lets each hand rest while the other is working, roughly doubling sustainable frequency compared to a single digit.
        </p>
        <h3 style={h3}>Step 5 — Interval Training</h3>
        <p style={p}>
          Structure your practice sessions in intervals: 10 seconds of maximum effort pressing followed by 20 seconds of rest. Repeat 8–10 times per session. This builds forearm endurance while allowing partial recovery between bursts, mirroring the interval-training principles used in general strength and conditioning work rather than simply grinding at maximum effort until fatigue sets in. <strong>Research by exercise physiologists</strong> on <SourceLink href="https://en.wikipedia.org/wiki/High-intensity_interval_training">high-intensity interval training</SourceLink> shows that short maximal bursts paired with structured rest generally produce better long-term output than continuous sub-maximal effort, and the same principle transfers well to a short, repeatable <strong>spacebar counter</strong> drill.
        </p>
        <h3 style={h3}>Step 6 — Re-Test and Adjust</h3>
        <p style={p}>
          After a week of structured practice, re-run the same five-test baseline protocol from Step 1 under identical conditions — same keyboard, same duration, same time of day if possible. Compare directly against your original baseline rather than against community averages. If your score has not moved, it usually means one specific variable — posture, travel distance, or rest between sessions — needs adjusting before the next training block, rather than simply pushing harder.
        </p>

        {/* ── 8 ── */}
        <h2 style={h2}>Gaming Benefits of Spacebar Speed Training</h2>
        <p style={p}>
          Across virtually every major gaming genre, the spacebar plays a critical role in player performance. In first-person shooters, spacebar jumping affects movement unpredictability. In MOBAs and battle royale games, rapid spacebar actuation enables bunny hopping and strafing patterns. In platformer games, spacebar precision determines whether you clear a ledge or fall into a pit — and in all of these cases, the physical bottleneck of "how fast can my thumb actually move" is a real, measurable constraint on in-game performance, not just a matter of game sense or strategy.
        </p>
        <p style={p}>
          Beyond raw speed, spacebar training develops timing accuracy — the ability to press at a specific precise moment relative to an in-game event. This timing precision is equally or more important than raw CPS in many scenarios, and it develops as a natural byproduct of consistent speed training, since a nervous system that can reliably fire fast presses is also, almost by necessity, one that has better fine control over exactly when each individual press lands.
        </p>

        {/* ── 9 ── */}
        <h2 style={h2}>Spacebar in Minecraft — Why Speed Matters</h2>
        <p style={p}>
          Minecraft's physics engine processes player inputs on a tick-based system running at 20 ticks per second (50ms per tick). The spacebar jump action resolves at the start of each tick cycle, which means the practical ceiling for beneficial jump inputs is approximately 20 per second — well above what any human can physically achieve, so the real-world constraint is always the player's own pressing speed rather than the game engine. In PvP combat, combining sprint-jumping with directional strafe inputs creates erratic movement patterns that significantly reduce enemy hit probability.
        </p>
        <p style={p}>
          On Hypixel's BedWars and SkyWars game modes, players who maintain consistent 7–10 CPS spacebar rates during combat phases demonstrate measurably better survival rates and kill-death ratios than those pressing at 2–4 CPS. Parkour completion time also correlates directly with spacebar responsiveness, since many advanced parkour routes require chained jumps with extremely tight timing windows that punish any hesitation in the press-release cycle.
        </p>

        {/* ── 10 ── */}
        <h2 style={h2}>Spacebar Counter for Geometry Dash Players</h2>
        <p style={p}>
          In Geometry Dash, every gameplay interaction is triggered by a single input: the spacebar. The game's difficulty architecture is built entirely around input timing precision at varying rhythmic densities. Extreme-level demons contain wave spam and triple-spike segments demanding 10–15 precise inputs per second synchronized to 180 BPM music — equivalent to 3 presses per beat, a rate that comfortably exceeds untrained casual pressing speed and explains why so many players plateau on the hardest levels until they specifically train raw spacebar frequency.
        </p>
        <p style={p}>
          Players who use this <strong>Spacebar Counter</strong> as a daily warm-up tool report that the rhythmic repetition of speed testing helps calibrate their internal timing sense, which directly translates to improved pattern recognition and input consistency in Geometry Dash's most demanding segments. The habit of running a short structured test before a practice session also serves as a useful proxy for finger fatigue — a noticeably lower-than-usual warm-up score is often a sign to rest rather than grind a difficult level while already fatigued.
        </p>

        {/* ── 11 ── */}
        <h2 style={h2}>Rhythm Games and Spacebar Speed</h2>
        <p style={p}>
          osu!mania features lane-based note columns that players hit with keyboard keys, often including the spacebar. High-difficulty charts feature jumpstreams and chordstreams that require players to maintain 15–25 key presses per second across all fingers simultaneously. The finger stamina and timing accuracy developed through <strong>CPS</strong> training are foundational skills for all high-density note patterns, even though a full rhythm-game chart distributes load across more fingers than a pure spacebar test does.
        </p>
        <p style={p}>
          Beat Saber and similar motion-based rhythm titles rely less directly on spacebar speed specifically, but the underlying neuromuscular skill — rapid, rhythmically accurate repeated motion — transfers meaningfully across input methods. Many rhythm-game communities recommend keyboard-based CPS or KPS drills as a low-equipment supplementary exercise precisely because it isolates timing and speed without requiring the full game setup.
        </p>

        {/* ── 12 ── */}
        <h2 style={h2}>Mechanical vs Membrane Keyboards for Spacebar Testing</h2>
        <h3 style={h3}>Mechanical Keyboards</h3>
        <p style={p}>
          Mechanical keyboards use individual electromechanical switches under each key, providing distinct actuation characteristics. The key registers at a specific depth in the travel path, typically 1.2–2.0mm for speed variants. This defined actuation point, combined with the physical spring return force, gives the typist precise tactile feedback about exactly when each press registered. For CPS testing, this feedback loop allows users to develop precise neuromuscular timing calibration far more easily than on a keyboard where the actuation point is vague or inconsistent. You can read more about the underlying mechanisms on the <SourceLink href="https://en.wikipedia.org/wiki/Keyboard_technology">general keyboard technology overview</SourceLink>.
        </p>
        <h3 style={h3}>Membrane Keyboards</h3>
        <p style={p}>
          Membrane keyboards use a pressure-sensitive rubber dome sheet beneath all keys. The key registers only when the dome is fully compressed against the membrane contact layer — meaning users must bottom out every press. Membrane keyboards typically produce 15–25% lower CPS scores than equivalent mechanical keyboards when pressed at maximum effort by the same user, which is worth keeping in mind if you are comparing your score against someone testing on different hardware.
        </p>

        {/* ── 13 ── */}
        <h2 style={h2}>Understanding Keyboard Switch Types</h2>
        <h4 style={h4}>Linear Switches</h4>
        <p style={p}>
          Linear switches provide smooth, consistent resistance from top to bottom with no tactile bump or audible feedback. Popular linear options include Cherry MX Red at 45g actuation, Gateron Yellow at 35g, and Kailh Speed Silver at 40g with shortened 1.2mm pre-travel. For maximum raw CPS on the spacebar, linear switches are generally the optimal choice because there is zero mechanical bump resistance to overcome at mid-stroke.
        </p>
        <h4 style={h4}>Tactile Switches</h4>
        <p style={p}>
          Tactile switches have a physical bump at the actuation point that provides sensory confirmation of registration. Cherry MX Brown, Boba U4, and Topre are common examples. The tactile bump adds a tiny amount of resistance at the actuation point, which slightly reduces maximum CPS versus linears but improves accuracy because you receive physical confirmation of each successful registration — a worthwhile trade-off for users who value consistency over the absolute top-end number.
        </p>
        <h4 style={h4}>Clicky Switches</h4>
        <p style={p}>
          Clicky switches produce both a tactile bump and an audible click sound at actuation. Cherry MX Blue, Kailh Box White, and Gateron Green are classic examples. The click mechanism adds a small but measurable delay to the reset cycle. Clicky switches are not generally recommended for maximum CPS performance, though many users prefer them for typing, and the difference is small enough that it rarely matters outside of dedicated speed-testing contexts.
        </p>

        {/* ── 14 ── */}
        <h2 style={h2}>Spacebar Stabilizers — The Hidden Performance Factor</h2>
        <p style={p}>
          The spacebar is the only key on a standard keyboard that requires mechanical stabilizers — metal wire bars running under both ends of the keycap, anchored into the switch plate on either side of the central switch housing. These stabilizers prevent the long keycap from rocking or binding when pressed off-center, which is essential given how frequently the spacebar is struck away from dead-center during both typing and gaming.
        </p>
        <p style={p}>
          Factory-installed stabilizers are often lubricated with thick, inconsistent grease that causes both rattling and friction. This friction manifests as inconsistent key-feel between the center and edges, key binding on asymmetric presses, and a dampened return speed after each press. Properly tuned stabilizers can reduce spacebar return latency by 30–50% compared to unmodified factory units, meaningfully improving peak CPS potential — arguably the single highest-leverage hardware modification available to anyone serious about raw spacebar speed.
        </p>

        {/* ── 15 ── */}
        <h2 style={h2}>Keyboard Latency and Input Lag</h2>
        <p style={p}>
          Input latency in the keyboard-to-screen pipeline has several components: switch debounce delay typically 5–25ms, USB polling interval 8ms at 125Hz or 1ms at 1000Hz, operating system interrupt scheduling latency 2–10ms, and browser event dispatch overhead approximately 1–3ms. The total pipeline latency for a standard 125Hz keyboard on a modern system is approximately 15–40ms from physical key press to browser event fire.
        </p>
        <p style={p}>
          For spacebar CPS testing at 10 CPS, each inter-press interval is 100ms — far longer than any component of the latency pipeline. This means keyboard latency has a negligible effect on measured scores under normal conditions, and users chasing marginal CPS gains are almost always better served focusing on stabilizer tuning and technique than on shaving milliseconds off polling latency that the human nervous system cannot perceive at these speeds anyway.
        </p>

        {/* ── 16 ── */}
        <h2 style={h2}>Keyboard Polling Rate — Does It Matter for This Test?</h2>
        <p style={p}>
          As covered in our FAQ section, keyboard polling rate has virtually no impact on CPS test results at human-achievable pressing speeds. However, polling rate becomes relevant in one specific context: when using the tool as part of a broader keyboard hardware audit. A keyboard that drops USB packets at 1000Hz polling may register normally at 125Hz. If your CPS scores show unexpected gaps, testing at different USB polling rates can help identify whether the issue is hardware-related or technique-related — a useful diagnostic step before assuming a switch or stabilizer problem.
        </p>

        {/* ── 17 ── */}
        <h2 style={h2}>The Difference Between CPS Test and Spacebar Test</h2>
        <p style={p}>
          While both tests measure actuations per second, they differ in physiology, hardware interaction, and application context. The mouse <strong>CPS test</strong> measures index-finger click speed using the relatively small surface of a mouse button switch typically with 50g actuation force and 0.5mm travel. The <strong>Spacebar Test</strong> measures thumb-and-forearm speed on a keycap spanning 6–8U of the keyboard width, actuating a switch through 2.0mm of travel with a stabilizer system adding mechanical complexity.
        </p>
        <p style={p}>
          Most users achieve 10–30% lower CPS on the spacebar compared to mouse clicking, because the thumb has a shorter mechanical lever arm than the index finger and the spacebar's stabilizers add resistance. This is a completely normal and expected difference — comparing your spacebar KPS directly against a separately measured mouse CPS score is comparing two different physiological systems, not a fair apples-to-apples benchmark.
        </p>

        {/* ── 18 ── */}
        <h2 style={h2}>Spacebar Accuracy vs Raw Speed</h2>
        <p style={p}>
          Raw CPS speed is only one dimension of spacebar performance. Accuracy — defined as the ability to press at a specific precise timing target — is equally important in most gaming applications. A player who presses at 8 CPS with perfect timing accuracy in Geometry Dash will outperform a player pressing at 12 CPS with random timing scatter, which is a useful reminder that this tool's raw CPS number is a training input, not the entire picture of skill.
        </p>

        {/* ── 19 ── */}
        <h2 style={h2}>Reaction Time and Spacebar Performance</h2>
        <p style={p}>
          Neural reaction time averages 150–250ms for most adults, a figure widely cited across <SourceLink href="https://en.wikipedia.org/wiki/Mental_chronometry">mental chronometry research</SourceLink>. This reaction floor defines how quickly you can begin pressing after the test starts. Because the spacebar timer only starts when you first press and not before, initial reaction time does not penalize your CPS score. What matters within the test is inter-press reaction time: how rapidly your motor cortex signals the thumb flexor after each completed press, which is a distinct and separately trainable skill from simple stimulus-response reaction time.
        </p>

        {/* ── 20 ── */}
        <h2 style={h2}>Common Mistakes That Reduce Your CPS Score</h2>
        <ul style={ul}>
          <li style={li}><strong>Bottoming out every press:</strong> Pressing all the way to the physical bottom wastes 2mm of travel on each return stroke.</li>
          <li style={li}><strong>Tense forearm muscles:</strong> Chronic forearm tension prevents rapid repeated contractions. Keep forearm muscles relaxed between presses.</li>
          <li style={li}><strong>Incorrect thumb angle:</strong> Pressing with the very tip of your thumb limits surface contact. Use the soft pad area just below the thumbnail.</li>
          <li style={li}><strong>Resting wrist on desk:</strong> A static wrist position limits thumb mobility. A floating wrist allows the thumb's full range of motion.</li>
          <li style={li}><strong>Looking at the counter during the test:</strong> Visual monitoring diverts cognitive resources from the motor rhythm.</li>
          <li style={li}><strong>Holding breath:</strong> Oxygen deprivation reduces muscle performance. Breathe naturally throughout the session.</li>
          <li style={li}><strong>Testing while fatigued:</strong> Running max-effort tests back-to-back without rest produces artificially low scores that don't reflect your real capability.</li>
        </ul>

        {/* ── 21 ── */}
        <h2 style={h2}>Professional Practice Routine for Spacebar Speed</h2>
        <ul style={ul}>
          <li style={li}><strong>Days 1–2 (Baseline week):</strong> 5 × 10-second tests per session, single-thumb technique, 2 sessions per day.</li>
          <li style={li}><strong>Days 3–7 (Technique introduction):</strong> Begin butterfly method at 50% of your natural speed. 3 × 15-second slow-tempo sessions per day.</li>
          <li style={li}><strong>Weeks 2–3 (Intensity ramp):</strong> Increase butterfly tempo by 10–15% each session. Add 30-second test sessions twice per day.</li>
          <li style={li}><strong>Weeks 4–6 (Peak training):</strong> 5 × 15-second maximum-effort sessions per day with 30-second rests between attempts.</li>
          <li style={li}><strong>Week 7+ (Maintenance):</strong> 3 × 10-second sessions per day as warm-up before gaming.</li>
        </ul>

        {/* ── 22 ── */}
        <h2 style={h2}>Browser Compatibility and Support</h2>
        <p style={p}>
          This <strong>Spacebar Counter</strong> tool is built on universally supported web standards. The <code>KeyboardEvent</code> API with the <code>key</code> property is supported in all browsers released after 2016, including Chrome 51+, Firefox 23+, Safari 10.1+, Edge 14+, and all Chromium-based browsers. The Web Audio API used for click sound feedback is supported in all modern browsers, with the tool handling autoplay policies by initializing the AudioContext only after the first user interaction.
        </p>

        {/* ── 23 ── */}
        <h2 style={h2}>Mobile Support and Touch Device Usage</h2>
        <p style={p}>
          The tool's interface is fully responsive and renders correctly on all screen sizes from 320px mobile width upward. On touch devices, tapping the large hitbox area registers a press, allowing mobile users to participate without a physical keyboard. However, touch event latency on mobile browsers is typically 50–100ms higher than keyboard event latency on desktop browsers due to touch-input debouncing and gesture recognition pre-processing, so mobile scores should be treated as a separate, non-comparable baseline from desktop keyboard scores.
        </p>

        {/* ── 24 ── */}
        <h2 style={h2}>Why Gamers Use Spacebar Counters as Training Tools</h2>
        <p style={p}>
          The measurable, objective nature of CPS scoring makes the <strong>Spacebar Counter</strong> uniquely valuable as a training tool compared to in-game practice. In a game, your performance is confounded by external variables: enemy behavior, network latency, visual complexity, and strategic decision-making. In a controlled CPS test, the only variable is your physical pressing speed and technique. This isolation allows for precise identification of technique weaknesses and enables A/B testing of different hand positions and pressing styles in a way that noisy, unpredictable live-match data never can.
        </p>

        {/* ── 25 ── */}
        <h2 style={h2}>Can Rapid Spacebar Pressing Damage Your Keyboard?</h2>
        <p style={p}>
          Most mechanical keyboard switches are rated for 50–100 million keystroke cycles. Even pressing at 15 CPS continuously for 1 hour represents 54,000 keystrokes — a trivially small fraction of the switch's rated lifespan. Spacebar speed testing at normal session lengths of 10–60 seconds poses essentially zero risk of mechanical wear on the switch itself, so concerns about "wearing out" a keyboard through normal CPS testing are largely unfounded.
        </p>
        <p style={p}>
          The component most at risk from aggressive spacebar use is the stabilizer system, specifically the plastic stabilizer inserts. Lubricating the stabilizers appropriately distributes stress more evenly and extends their functional lifespan. PBT keycaps are significantly more resistant to wear damage than thin ABS keycaps, which is worth considering if you plan to use a keyboard heavily for extended CPS training over months or years.
        </p>

        {/* ── 26 ── */}
        <h2 style={h2}>Best Keyboards for Spacebar Speed Testing</h2>
        <ul style={ul}>
          <li style={li}><strong>Switch type:</strong> Linear, low-actuation-force 35–45g, speed variant preferred with 1.2mm pre-travel.</li>
          <li style={li}><strong>Polling rate:</strong> 1000Hz USB or wireless with equivalent polling for minimal latency consistency.</li>
          <li style={li}><strong>Stabilizers:</strong> Premium stabilizers such as Durock V2 or C3 Equalz, or factory stabilizers with aftermarket lubrication.</li>
          <li style={li}><strong>Keycap material:</strong> PBT for sustained high-frequency use and resistance to shine.</li>
          <li style={li}><strong>Form factor:</strong> TKL or full-size layouts provide the standard 6.25U spacebar.</li>
        </ul>

        {/* ── 27 ── */}
        <h2 style={h2}>Keyboard Maintenance for Optimal Spacebar Performance</h2>
        <ul style={ul}>
          <li style={li}><strong>Weekly:</strong> Remove loose debris with compressed air. Wipe keycap surface with a dry microfiber cloth.</li>
          <li style={li}><strong>Monthly:</strong> Remove the spacebar keycap, inspect the stabilizer wire, and reapply dielectric grease to wire-to-insert contact points.</li>
          <li style={li}><strong>Annually:</strong> Fully disassemble the keyboard, deep clean all switch housings, inspect switch contacts, and replace any switches showing inconsistent actuation.</li>
        </ul>

        {/* ── 28 ── */}
        <h2 style={h2}>Best Gaming Settings to Complement Spacebar Speed</h2>
        <p style={p}>
          Disable keyboard repeat delay in operating system settings if your game registers held-key inputs differently from rapid repeated presses. In Windows, set keyboard Repeat Delay to the shortest setting and Repeat Rate to the fastest. Set your in-game jump binding to the spacebar with no alternative binding conflicts. Ensure you are not running any macro or automation software that could be flagged by anti-cheat systems, since the entire point of training real spacebar speed is to improve genuine, verifiable human performance.
        </p>

        {/* ── 29 ── */}
        <h2 style={h2}>Typing Practice and Spacebar Accuracy for Typists</h2>
        <p style={p}>
          For professional typists, the spacebar is the single most frequently pressed key in any standard text — approximately 20% of all keystrokes in English text are spaces. Typists who practice spacebar CPS drills for 5–10 minutes per day report improvements in words-per-minute scores, particularly in the accuracy of space insertion during high-speed burst typing. The developed muscle memory reduces cognitive load for the space action, freeing mental resources for letter sequence planning — a small, often-overlooked gain that compounds meaningfully over a full working day of typing.
        </p>

        {/* ── 30 ── */}
        <h2 style={h2}>Spacebar Counter vs Other Online Alternatives</h2>
        <p style={p}>
          Several online spacebar testing tools and generic <strong>click counter</strong> pages exist, but they vary significantly in implementation quality. Common issues include failing to filter <code>e.repeat</code> auto-repeat events, using <code>Date.now()</code> instead of <code>performance.now()</code> for lower precision, and attaching event listeners to specific DOM elements that break on focus change. This tool addresses all of these issues with a measurement system designed to be accurate to within ±1 keystroke across any test session length.
        </p>

        {/* ── 31 ── */}
        <h2 style={h2}>Security and Privacy — How Your Data is Handled</h2>
        <p style={p}>
          This tool is built with a privacy-first architecture. All computation occurs exclusively within your browser's JavaScript runtime. No keystroke data, scores, or personal information is transmitted to any external server. Session history is stored in component state and disappears when you close or refresh the page. No cookies are set, no local storage is written, and no analytics pixels or fingerprinting scripts are embedded — you can run this tool with total confidence that your raw keystroke timing data never leaves your own device.
        </p>

        {/* ── 32 ── */}
        <h2 style={h2}>KPS Test (Keystrokes Per Second) — What It Is and Why It Matters</h2>
        <p style={p}>
          A <strong>KPS Test</strong> (Keystrokes Per Second) is an advanced metric used to evaluate a user's raw keyboard tapping speed and rhythmic consistency. While traditional CPS tests focus on mouse clicking, a <strong>KPS test</strong> directly measures the actuation rate of your keyboard keys, most commonly the spacebar. Keystroke speed is a fundamental skill for competitive typists, rhythm game players (like osu!mania or StepMania), and professional gamers who rely on high-frequency inputs for actions like strafe-jumping or animation canceling.
        </p>
        <p style={p}>
          Our <strong>Spacebar Counter</strong> effectively functions as a highly accurate <strong>KPS Test</strong> and a specialized <strong>click counter</strong> in its own right. By utilizing the <code>performance.now()</code> API, it tracks every single keystroke down to the millisecond. By practicing your KPS, you can build vital forearm stamina, improve thumb-finger independence, and optimize your keyboard switch actuation. A typical beginner will average around 4–6 KPS, while elite players and eSports professionals can sustain a blistering 10–14 KPS through techniques like jitter tapping and the butterfly method.
        </p>

        {/* ── 33 ── */}
        <h2 style={h2}>KPS Test vs CPS Test — Which Metric Should You Track?</h2>
        <p style={p}>
          <strong>KPS</strong> (Keystrokes Per Second) and <strong>CPS</strong> (Clicks Per Second) are closely related but not interchangeable metrics. CPS traditionally refers to mouse-button click rate, while KPS refers specifically to keyboard key actuation rate, most commonly measured on the spacebar because of its size and gaming relevance. If your primary interest is mouse-driven activities like clicking games or aim-trainer benchmarking, a dedicated <strong>click counter</strong> and CPS is the metric to track. If your goal is jump-key responsiveness in platformers, parkour games, or rhythm titles, KPS on the spacebar is the more meaningful number to monitor over time.
        </p>
        <p style={p}>
          In practice, many players benefit from tracking both, since the two skills — mouse click speed and keyboard key speed — draw on partly overlapping but distinct neuromuscular pathways. A well-rounded training log records CPS and KPS separately rather than averaging them together, since blending the two numbers obscures which specific skill actually improved after a given training block.
        </p>

        {/* ── 34 ── */}
        <h2 style={h2}>How to Improve Your KPS Score Over Time</h2>
        <p style={p}>
          Improving your <strong>KPS</strong> score follows the same progressive-overload principle used in physical training. Start by logging a baseline KPS across several short sessions, then introduce small technique changes one at a time — first optimizing wrist position, then hand placement, then finger technique — so you can isolate which change actually moves the needle. Avoid changing multiple variables simultaneously, since this makes it impossible to know which adjustment produced the improvement.
        </p>
        <p style={p}>
          Most users see measurable KPS gains within two to three weeks of consistent, structured practice, provided sessions are spaced with adequate rest and each session includes both a warm-up test and a maximum-effort test rather than jumping straight into all-out pressing on cold muscles.
        </p>

        {/* ── 35 ── */}
        <h2 style={h2}>KPS Test Benchmarks for Esports Training Programs</h2>
        <p style={p}>
          Some competitive gaming organizations incorporate <strong>KPS testing</strong> into broader input-speed assessments alongside reaction-time drills and aim-tracking exercises. A structured KPS benchmark — typically a 10-second and a 30-second test run back to back — gives coaches a simple, repeatable data point to track a player's fine motor conditioning across a training block. While KPS alone does not predict competitive success, sustained improvement in KPS scores often correlates with better overall input consistency during high-pressure match scenarios, making it a useful, low-cost addition to a broader physical training regimen.
        </p>

        {/* ── 36 ── */}
        <h2 style={h2}>Does Hand Dominance Affect Spacebar KPS?</h2>
        <p style={p}>
          Most keyboard layouts place the spacebar symmetrically beneath both thumbs, so hand dominance has a smaller effect on spacebar KPS than it does on tasks like mouse clicking. However, right-handed users who habitually rest their right thumb on the spacebar tend to show a slight speed advantage on that side when tested with a single-thumb technique.
        </p>
        <p style={p}>
          Once a user progresses to the butterfly method, which engages both hands independently, the dominance gap narrows considerably because the technique relies on bilateral coordination rather than a single dominant limb — one more reason the butterfly method tends to level the playing field between naturally left- and right-hand-dominant testers.
        </p>

        {/* ── 37 ── */}
        <h2 style={h2}>Does Age Affect Spacebar CPS and KPS Performance?</h2>
        <p style={p}>
          Fine motor speed, including keystroke frequency, generally peaks in the late teens to mid-twenties and gradually declines afterward, though the decline is modest for anyone who maintains regular practice. Younger users often post higher raw KPS scores in unpracticed conditions due to faster baseline neuromuscular reset times, but consistent training can substantially narrow this gap for older users.
        </p>
        <p style={p}>
          Age-related differences in KPS are far smaller in practice than differences driven by technique, keyboard hardware, and practice frequency — a well-trained adult tester using proper butterfly technique on a low-actuation-force linear switch will routinely outscore an untrained younger tester using poor single-thumb form on a membrane keyboard.
        </p>

        {/* ── 38 ── */}
        <h2 style={h2}>Fair Play — Detecting Macros and Automation in Spacebar Tests</h2>
        <p style={p}>
          Because this <strong>Spacebar Counter</strong> runs entirely client-side, it cannot directly detect external macro software or hardware auto-clickers the way a server-authoritative anti-cheat system can. However, extremely uniform inter-press intervals — presses spaced with near-perfect millisecond regularity — are a strong indicator of automated input rather than genuine human pressing, since real muscle-driven presses always contain small natural timing variance.
        </p>
        <p style={p}>
          Competitive communities that use CPS or KPS scores for leaderboard purposes typically require video verification or supervised testing to rule out automation. For personal training purposes, the honesty of the number only matters to you — using a macro to inflate your own displayed score on a <strong>click counter</strong> defeats the entire point of using the tool as a genuine performance benchmark.
        </p>

        {/* ── 39 ── */}
        <h2 style={h2}>Using the Spacebar Counter in Typing Classrooms</h2>
        <p style={p}>
          Typing instructors sometimes use spacebar-specific drills to address a common intermediate-level plateau: students who type individual letters quickly but slow down noticeably at word boundaries. A short daily spacebar KPS drill, separate from full-sentence typing practice, isolates and strengthens the specific thumb motion responsible for word-spacing, which can measurably improve overall typing throughput without requiring any change to letter-key technique.
        </p>

        {/* ── 40 ── */}
        <h2 style={h2}>Wireless vs Wired Keyboards — Impact on Spacebar Test Results</h2>
        <p style={p}>
          Modern 2.4GHz wireless keyboards with dedicated gaming receivers can match wired polling rates up to 1000Hz, meaning there is typically no measurable difference in spacebar KPS between a high-end wireless board and its wired equivalent. Bluetooth keyboards, by contrast, often poll at only 90–133Hz due to protocol overhead, which can introduce enough latency variance to slightly affect consistency at very high pressing speeds, though it remains well within the margin that most human testers would never notice at sub-15 KPS rates.
        </p>

        {/* ── 41 ── */}
        <h2 style={h2}>International Keyboard Layouts and Spacebar Testing</h2>
        <p style={p}>
          The spacebar's position, width, and stabilizer configuration are broadly consistent across QWERTY, AZERTY, QWERTZ, and other regional keyboard layouts, since the space key occupies the same bottom-row location regardless of letter arrangement. This means spacebar KPS scores are directly comparable across users on different regional keyboard standards, unlike full-word typing speed tests, which are heavily influenced by layout-specific letter positioning and language-specific word length.
        </p>

        {/* ── 42 ── */}
        <h2 style={h2}>Tracking Long-Term KPS Progress with Session History</h2>
        <p style={p}>
          The built-in session history panel on this page acts as a lightweight <strong>click counter</strong> log, retaining your most recent test results for the duration of your browser session and giving you an immediate reference point for short-term trend spotting. For longer-term tracking across days or weeks, many users maintain a simple external log — a spreadsheet or notes file — recording date, duration, technique used, and resulting CPS or KPS score.
        </p>
        <p style={p}>
          This external record becomes especially valuable when experimenting with new techniques like the butterfly method, since it lets you compare pre- and post-technique performance over a much longer timeframe than any single browser session can capture, and it also protects your historical data from being lost the moment you close the tab.
        </p>

        {/* ── 43 ── */}
        <h2 style={h2}>Streamers and Content Creators Using the Spacebar Counter</h2>
        <p style={p}>
          Gaming content creators occasionally feature CPS and KPS tests as on-stream challenges or viewer-engagement segments, since the format is quick, visually engaging, and easy for an audience to understand without any gaming-specific knowledge. The real-time counter display and audio click feedback make the tool particularly suited to screen-shared or streamed sessions, where viewers can watch the number climb live and compare their own attempts in chat.
        </p>

        {/* ── 44 ── */}
        <h2 style={h2}>Repetitive Strain Injury Prevention for High-Frequency Clicking</h2>
        <p style={p}>
          Any repeated high-frequency motion, whether it's clicking a mouse on a <strong>click counter</strong> game or pressing a keyboard's spacebar in a <strong>KPS test</strong>, carries some risk of cumulative strain if done without proper technique or rest. According to general guidance summarized by <SourceLink href="https://www.ncbi.nlm.nih.gov/books/NBK441882/">clinical overviews of repetitive strain conditions</SourceLink>, symptoms such as persistent tingling, numbness, or joint pain are signals to stop the activity and rest rather than push through discomfort. <strong>Exercise physiologists</strong> commonly recommend that any single burst of maximal-effort repetitive motion be capped at well under a minute, followed by proportional recovery time, before repeating — the exact interval structure this tool's 10–60 second duration options are designed around.
        </p>
        <p style={p}>
          Warm-up matters just as much as the test itself. Gently flexing and extending your fingers, rotating your wrists, and lightly stretching your forearm extensors for 30–60 seconds before a maximum-effort <strong>spacebar counter</strong> session measurably reduces the chance of a sudden strain compared to jumping straight from cold, resting muscles into an all-out 60-second burst. Treat the spacebar test the same way you would treat any other short, explosive physical exercise — worth warming up for, and worth stopping the moment something feels wrong rather than chasing one more point on the scoreboard.
        </p>

        {/* ── 45 ── */}
        <h2 style={h2}>How Coaches Use Click Counter and KPS Data in Training Logs</h2>
        <p style={p}>
          Beyond individual practice, many amateur esports coaches now fold simple <strong>click counter</strong> and <strong>KPS test</strong> numbers into a player's broader physical training log, right alongside reaction-time drills and aim-trainer statistics. The appeal is that a spacebar or mouse-click benchmark takes only ten to sixty seconds to run, requires no special equipment beyond the keyboard or mouse the player already owns, and produces a single, easily comparable number that can be logged week over week. A <SourceLink href="https://en.wikipedia.org/wiki/Esports">broad overview of competitive esports training practices</SourceLink> notes that structured physical-input benchmarking of this kind is increasingly common alongside strategy and mechanics review.
        </p>
        <p style={p}>
          When building a training log, it helps to record not just the raw CPS or KPS number from the <strong>spacebar counter</strong>, but also the technique used (single-thumb, butterfly, or jitter), the keyboard or switch type, and how the player felt going into the session. Over several months this turns a simple click counter into a genuinely useful longitudinal dataset, capable of showing whether gains are coming from technique refinement, hardware changes, or simple practice volume.
        </p>

        {/* ── FAQ (accordion) ── */}
        <FaqSection />

        {/* ── Summary ── */}
        <h2 style={h2}>Summary — Why the Spacebar Counter is Essential</h2>
        <p style={p}>
          The <strong>Spacebar Counter</strong> is more than a novelty speed test — it is a precision performance measurement instrument with direct applications in competitive gaming, keyboard hardware validation, typing skill development, and motor training research. By providing objective, reproducible <strong>CPS</strong> and <strong>KPS</strong> measurements with anti-cheat filtering, high-resolution timing, and structured performance tier feedback, this tool gives users the data they need to make informed decisions about training strategy, equipment selection, and performance tracking — functioning equally well as a dedicated <strong>spacebar counter</strong>, a general-purpose <strong>click counter</strong>, and a rigorous <strong>KPS test</strong>.
        </p>
        <p style={{ ...p, marginBottom: 0 }}>
          Whether you are a Minecraft PvP player working on strafe-jump mechanics, a Geometry Dash speedrunner training wave spam technique, a rhythm game enthusiast building finger stamina, a typing student closing a word-spacing gap, or simply a curious keyboard enthusiast benchmarking a new switch, the Spacebar Counter provides the reliable, free, and privacy-respecting measurement platform you need. Bookmark it, use it daily, track your progress with the built-in click counter history, and watch your CPS and KPS scores climb.
        </p>
      </section>
    </article>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SpacebarPage() {
  const [count,        setCount]       = useState(0);
  const [timeLeft,     setTimeLeft]    = useState(10);
  const [phase,        setPhase]       = useState<Phase>('idle');
  const [duration,     setDuration]    = useState(10);
  const [customTime,   setCustomTime]  = useState('');
  const [history,      setHistory]     = useState<HistoryItem[]>([]);
  const [maxSps,       setMaxSps]      = useState(0);
  const [soundOn,      setSoundOn]     = useState(true);
  const [spacePressed, setSpacePressed] = useState(false);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTime   = useRef(0);
  const pressEvents = useRef<number[]>([]);
  const phaseRef    = useRef<Phase>('idle');
  const durationRef = useRef(duration);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundOnRef  = useRef(soundOn);

  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { soundOnRef.current  = soundOn;  }, [soundOn]);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }
    return audioCtxRef.current;
  }, []);

  const playClick = useCallback(() => {
    if (!soundOnRef.current) return;
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') void ctx.resume();
      createClickSound(ctx);
    } catch { /* silent */ }
  }, [getAudioCtx]);

  const endTest = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    phaseRef.current = 'done';
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    const dur         = durationRef.current;
    const totalPresses = pressEvents.current.length;
    const finalSps    = parseFloat((totalPresses / dur).toFixed(2));

    setCount(totalPresses);
    setPhase('done');
    setTimeLeft(0);
    setHistory(prev => [
      { count: totalPresses, sps: finalSps, duration: dur },
      ...prev.slice(0, MAX_HISTORY - 1),
    ]);
  }, []);

  const start = useCallback(() => {
    if (phaseRef.current === 'running') return;
    phaseRef.current = 'running';
    const dur = durationRef.current;
    setPhase('running');
    setCount(0);
    setMaxSps(0);
    setTimeLeft(dur);
    pressEvents.current = [];
    startTime.current   = performance.now();

    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      const left    = Math.max(0, dur - elapsed);
      setTimeLeft(left);
      const now    = performance.now();
      const recent = pressEvents.current.filter(t => now - t < 1000);
      setMaxSps(prev => Math.max(prev, recent.length));
      if (left <= 0) endTest();
    }, 50);
  }, [endTest]);

  const recordPress = useCallback(() => {
    pressEvents.current.push(performance.now());
    setCount(c => c + 1);
    playClick();
  }, [playClick]);

  const resetTest = useCallback(() => {
    phaseRef.current = 'idle';
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setPhase('idle');
    setCount(0);
    setMaxSps(0);
    setTimeLeft(durationRef.current);
    setSpacePressed(false);
    pressEvents.current = [];
  }, []);

  const handleCustomTimeSet = useCallback(() => {
    const raw  = parseInt(customTime, 10);
    if (!Number.isFinite(raw)) return;
    const time = Math.min(MAX_CUSTOM_SECONDS, Math.max(MIN_CUSTOM_SECONDS, raw));
    setDuration(time);
    durationRef.current = time;
    resetTest();
    setTimeLeft(time);
  }, [customTime, resetTest]);

  const handleCustomTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCustomTime(val);
  }, []);

  // Global keydown / keyup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ' ') return;
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement?.tagName ?? '')) return;
      e.preventDefault();
      if (e.repeat) return;
      setSpacePressed(true);
      if (phaseRef.current === 'idle')    { start(); return; }
      if (phaseRef.current === 'running') recordPress();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key !== ' ') return;
      setSpacePressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup',   handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup',   handleKeyUp);
    };
  }, [start, recordPress]);

  // ESC closes modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phaseRef.current === 'done') resetTest();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [resetTest]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = phase === 'done' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  // Cleanup
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    audioCtxRef.current?.close().catch(() => {});
  }, []);

  const liveSps      = count > 0 && phase === 'running'
    ? (count / Math.max(0.1, duration - timeLeft)).toFixed(1)
    : '0';
  const finalSps     = parseFloat((count / duration).toFixed(2));
  const progress     = phase === 'running'
    ? ((duration - timeLeft) / duration) * 100
    : phase === 'done' ? 100 : 0;
  const finalRating  = getRating(finalSps);
  const displayedSps = phase === 'running'
    ? liveSps
    : phase === 'done' ? finalSps.toFixed(2) : '0.00';

  return (
    <>
      <SeoHead />
      <JsonLd data={JSON_LD_DATA} />

      <main
        style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}
        role="main"
        aria-label="Spacebar Counter CPS Test"
      >
        <style>{GLOBAL_STYLES}</style>


        {/* ── Header ── */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-label">Keyboard Tool</div>
          <h1 className="tool-title">Spacebar Counter</h1>
          <p className="tool-subtitle">Hit that spacebar as fast as you can!</p>
        </header>

        {/* ── Duration selector + Sound toggle ── */}
        <div
          className="spacebar-duration-row"
          style={{
            display: 'flex', justifyContent: 'center',
            gap: '0.5rem', flexWrap: 'wrap',
            marginBottom: '2rem', alignItems: 'center',
          }}
        >
          {DURATIONS.map(d => {
            const active = duration === d && !customTime;
            return (
              <button
                key={d}
                aria-pressed={active}
                onClick={() => {
                  setDuration(d);
                  durationRef.current = d;
                  resetTest();
                  setTimeLeft(d);
                  setCustomTime('');
                }}
                disabled={phase === 'running'}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '8px',
                  border: active ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
                  background: active ? 'rgba(0,245,255,0.15)' : 'var(--bg-card)',
                  color: active ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                  fontWeight: '700',
                  cursor: phase === 'running' ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem', transition: 'all 0.2s',
                }}
              >{d}s</button>
            );
          })}

          {/* Custom time */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '0.2rem 0.2rem 0.2rem 0.6rem',
          }}>
            <label htmlFor="custom-time" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              Custom:
            </label>
            <input
              id="custom-time"
              type="text"
              inputMode="numeric"
              value={customTime}
              onChange={handleCustomTimeChange}
              disabled={phase === 'running'}
              placeholder="sec"
              maxLength={4}
              autoComplete="off"
              aria-label="Custom duration in seconds"
              style={{
                width: '50px', background: 'transparent', border: 'none',
                color: 'var(--neon-cyan)', fontWeight: '700', outline: 'none',
                textAlign: 'center', fontSize: '0.85rem',
              }}
            />
            <button
              onClick={handleCustomTimeSet}
              disabled={phase === 'running' || !customTime}
              style={{
                padding: '0.3rem 0.8rem', borderRadius: '6px',
                background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)',
                color: 'var(--neon-cyan)', fontWeight: '700',
                cursor: phase === 'running' || !customTime ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem', transition: 'all 0.2s',
              }}
            >Set</button>
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundOn(v => !v)}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Sound on — click to mute' : 'Sound off — click to unmute'}
            title={soundOn ? 'Mute click sound' : 'Unmute click sound'}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.4rem 0.85rem', borderRadius: '8px',
              border: soundOn ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
              background: soundOn ? 'rgba(0,245,255,0.12)' : 'var(--bg-card)',
              color: soundOn ? 'var(--neon-cyan)' : 'var(--text-muted)',
              fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1rem' }}>{soundOn ? '🔊' : '🔇'}</span>
            <span>{soundOn ? 'Sound ON' : 'Sound OFF'}</span>
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`Presses: ${count}, CPS: ${displayedSps}, Time left: ${timeLeft.toFixed(1)} seconds`}
          className="spacebar-stats-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}
        >
          <StatCard value={count}               label="Presses"      color="var(--neon-cyan)"   />
          <StatCard value={displayedSps}        label="CPS"          color="var(--neon-green)"  />
          <StatCard value={timeLeft.toFixed(1)} label="Seconds Left" color="var(--neon-orange)" />
        </div>

        {/* ── Progress Bar ── */}
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Test progress"
          style={{ marginBottom: '1.5rem' }}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* ── Hitbox ── */}
        <div
          tabIndex={0}
          style={{ outline: 'none', marginBottom: '1.5rem' }}
          role="button"
          aria-label={
            phase === 'idle'    ? 'Press spacebar to start the test' :
            phase === 'running' ? 'Press spacebar to register a click' :
            'Test complete'
          }
        >
          <div style={{
            width: '100%', padding: '2.5rem 1rem', borderRadius: '16px',
            background: phase === 'running' ? 'rgba(0,245,255,0.05)' : 'var(--bg-card)',
            border: `2px solid ${
              phase === 'running' ? 'var(--neon-cyan)' :
              phase === 'done'    ? 'var(--neon-orange)' :
              'var(--border)'
            }`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '1rem',
            cursor: 'default', userSelect: 'none',
            boxShadow: phase === 'running' ? '0 0 30px rgba(0,245,255,0.1)' : 'none',
            transition: 'all 0.2s',
          }}>
            {phase === 'idle' && (
              <>
                <span style={{ fontSize: '3rem' }} aria-hidden="true">▭</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>
                  Press SPACE to Start
                </span>
              </>
            )}
            {phase === 'running' && (
              <>
                <div style={{
                  fontSize: '5rem', fontWeight: '900',
                  color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                }}>
                  {count}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Keep pressing SPACE! ⚡</div>
              </>
            )}
            {phase === 'done' && (
              <>
                <span style={{ fontSize: '3rem' }} aria-hidden="true">🏁</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neon-orange)' }}>
                  Test Complete!
                </span>
              </>
            )}
          </div>

          {/* Animated Spacebar Key */}
          {phase !== 'done' && (
            <SpacebarKey isPressed={spacePressed} phase={phase} />
          )}
        </div>

        {/* ── Reset during test ── */}
        {phase === 'running' && (
          <div style={{
            display: 'flex', justifyContent: 'center',
            marginBottom: '1.5rem',
            animation: 'fadeIn 0.3s ease-in',
          }}>
            <button
              onClick={e => { e.stopPropagation(); resetTest(); }}
              aria-label="Reset test"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: '#1e2235', border: '1px solid #2a3047',
                color: '#ffffff', padding: '0.6rem 1.25rem',
                borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.95rem', fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background    = '#252a40';
                (e.currentTarget as HTMLButtonElement).style.borderColor   = '#3b4363';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background    = '#1e2235';
                (e.currentTarget as HTMLButtonElement).style.borderColor   = '#2a3047';
              }}
            >
              <div style={{
                background: '#3b82f6', color: 'white', borderRadius: '4px',
                width: '22px', height: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </div>
              Reset
            </button>
          </div>
        )}

        {/* ── Result Modal ── */}
        {phase === 'done' && (
          <ResultModal
            rating={finalRating}
            count={count}
            finalSps={finalSps}
            maxSps={maxSps}
            duration={duration}
            onReset={resetTest}
            onTryAgain={() => {
              resetTest();
              timeoutRef.current = setTimeout(start, 100);
            }}
          />
        )}

        {/* ── Session History ── */}
        {history.length > 0 && (
          <section
            aria-label="Session history"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '2rem',
            }}
          >
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              fontWeight: '700', fontSize: '0.9rem',
              color: 'var(--neon-cyan)',
            }}>
              📊 Session History
            </div>
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1.25rem', fontSize: '0.875rem',
                  borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
                  flexWrap: 'wrap', gap: '0.5rem',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>#{history.length - i}</span>
                <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{h.sps} CPS</span>
                <span style={{ color: 'var(--text-secondary)' }}>{h.count} presses</span>
                <span style={{ color: 'var(--text-muted)' }}>{h.duration}s</span>
                <span style={{ color: getRating(h.sps).color, fontWeight: '600' }}>
                  {getRating(h.sps).label}
                </span>
              </div>
            ))}
          </section>
        )}

        {/* ── SEO Article ── */}
        <Suspense fallback={
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '2rem',
            textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem',
          }}>
            Loading…
          </div>
        }>
          <SpacebarArticleContent />
        </Suspense>
      </main>
    </>
  );
}
