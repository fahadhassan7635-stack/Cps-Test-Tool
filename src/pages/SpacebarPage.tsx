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
export const FAQ_ITEMS = [
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

  // Prevent accidental spacebar/enter presses from instantly restarting the test 
  // right after it finishes. Give the user a 500ms cooldown.
  const [cooldown, setCooldown] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setCooldown(false), 500);
    return () => clearTimeout(t);
  }, []);

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
          disabled={cooldown}
          aria-label="Close result dialog"
          style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${rating.color}40`,
            color: rating.color,
            width: '32px', height: '32px',
            borderRadius: '50%',
            cursor: cooldown ? 'not-allowed' : 'pointer',
            opacity: cooldown ? 0.5 : 1,
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
            disabled={cooldown}
            style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: cooldown ? 0.5 : 1, cursor: cooldown ? 'not-allowed' : 'pointer' }}
          >
            🔄 Reset
          </button>
          <button
            className="btn btn-primary"
            onClick={onTryAgain}
            disabled={cooldown}
            style={{
              padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              backgroundColor: rating.color, borderColor: rating.color, color: '#000', fontWeight: '700',
              opacity: cooldown ? 0.5 : 1, cursor: cooldown ? 'not-allowed' : 'pointer'
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


// ─── JSON-LD Injector ─────────────────────────────────────────────────────────


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
        
        <h2 style={{ ...h2, marginTop: 0 }}>What is a Spacebar Counter (CPS Test)?</h2>
        <p style={p}>
          A Spacebar Counter is a simple and effective tool that measures how fast you can press the spacebar key within a specific time limit. This speed is typically measured in <strong>Clicks Per Second (CPS)</strong>. By using this tool, gamers and typists can accurately track their finger speed, stamina, and reaction time in real-time.
        </p>

        <h2 style={h2}>How to Use the Spacebar Test</h2>
        <ul style={ul}>
          <li style={li}><strong>Select a Timer:</strong> Choose your preferred time limit from the buttons above (1s, 5s, 10s, up to 100s).</li>
          <li style={li}><strong>Start Clicking:</strong> Press the spacebar as fast as you can. The timer starts automatically on your first press.</li>
          <li style={li}><strong>Review Your Score:</strong> Once the timer hits zero, a popup will display your final CPS score and performance rank.</li>
          <li style={li}><strong>Try Again:</strong> Click the "Try Again" button or hit Enter to quickly restart the test and beat your previous high score.</li>
        </ul>

        <h2 style={h2}>What is a Good Spacebar CPS Score?</h2>
        <p style={p}>
          Your spacebar clicking speed can be categorized into different performance tiers based on your CPS score:
        </p>
        <ul style={ul}>
          <li style={li}><strong>Turtle (0 - 4 CPS):</strong> Beginner level. This is the average speed for casual computer users pressing with one finger.</li>
          <li style={li}><strong>Rabbit (5 - 7 CPS):</strong> Intermediate level. You have good finger agility and can click significantly faster than the average user.</li>
          <li style={li}><strong>Cheetah (8 - 10 CPS):</strong> Advanced level. Excellent for gaming, showing fast reflexes and developed muscle memory.</li>
          <li style={li}><strong>Alien (10+ CPS):</strong> Pro level. Typically achieved by competitive gamers using advanced techniques like "jitter clicking" or "butterfly clicking" on the spacebar.</li>
        </ul>

        <h2 style={h2}>Why Practice Spacebar Clicking?</h2>
        <p style={p}>
          Practicing your spacebar speed isn't just a fun mini-game�it has practical benefits for your daily computer usage:
        </p>
        <ul style={ul}>
          <li style={li}><strong>Gaming Performance:</strong> Many popular games (like Minecraft, Geometry Dash, and various platformers or rhythm games) rely heavily on rapid spacebar inputs for jumping, dodging, or attacking. A higher CPS directly translates to better in-game performance.</li>
          <li style={li}><strong>Typing Speed:</strong> The spacebar is the most frequently used key on the keyboard. Improving your thumb dexterity can help you transition between words faster, subtly improving your overall Words Per Minute (WPM).</li>
          <li style={li}><strong>Stamina & Endurance:</strong> Rapidly pressing a key builds finger stamina, which is helpful during long gaming or typing sessions, reducing early fatigue.</li>
        </ul>

        <h2 style={h2}>Tips to Improve Your Spacebar Speed</h2>
        <p style={p}>
          If you want to achieve the "Alien" rank and push your CPS to the absolute limit, try these proven techniques:
        </p>
        <ul style={ul}>
          <li style={li}><strong>Use Two Hands:</strong> Instead of relying on a single thumb, use two fingers (one from each hand) and alternate them rapidly over the spacebar. This instantly doubles your pressing speed.</li>
          <li style={li}><strong>Jitter Clicking:</strong> Tense the muscles in your arm and wrist to generate a rapid vibration. Transfer this vibration directly to your fingertip resting on the spacebar.</li>
          <li style={li}><strong>Posture and Positioning:</strong> Keep your keyboard flat or slightly angled according to your comfort. Ensure your forearm rests comfortably on the desk to minimize wrist strain.</li>
          <li style={li}><strong>Hardware Matters:</strong> A mechanical keyboard with light, linear switches (like Cherry MX Red or Silver) will actuate faster and reset quicker than a standard membrane keyboard.</li>
        </ul>

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
      if (phaseRef.current === 'idle') { 
        start(); 
        recordPress();
        return; 
      }
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
      
      

      <main
        style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}
        role="main"
        aria-label="Spacebar Counter CPS Test"
      >
        <style>{GLOBAL_STYLES}</style>


        {/* ── Header ── */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-label">Keyboard Tool</div>
          <h1 className="tool-title">
            Spacebar Counter{' '}
            <span style={{ fontSize: '0.5em', color: 'var(--neon-cyan)', fontWeight: '700' }}>
              (KPS Test)
            </span>
          </h1>
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

        {/* ── MORE TOOLS GRID ── */}
        <section aria-label="More Tools" style={{ marginTop: '3rem', marginBottom: '2.5rem' }}>
          <h2 style={{
            fontWeight: 800, fontSize: '1.5rem', color: '#fff',
            marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '-0.3px',
          }}>More Tools</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '1rem',
          }}>
            {[
              { label: 'CPS Test',        href: '/cps-test',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
              { label: 'Typing Test',     href: '/typing-test',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 15h8M7 11h2m3 0h2m3 0h-1"/></svg> },
              { label: 'Reaction Time',   href: '/reaction-time',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              { label: 'Aim Trainer',     href: '/aim-trainer',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg> },
              { label: 'Scroll Test',     href: '/scroll-test',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="9"/><path d="M9 11l3-3 3 3"/><path d="M9 13l3 3 3-3"/></svg> },
              { label: 'Double Click',    href: '/double-click',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/></svg> },
              { label: '3D Aim Trainer', href: '/3d-aim-trainer',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/><circle cx="12" cy="12" r="8" opacity=".4"/></svg> },
              { label: 'Mouse Accuracy',  href: '/mouse-accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 2v10"/></svg> },
              { label: 'Key Visualizer',  href: '/key-visualizer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"/></svg> },
              { label: 'F1 Reaction',     href: '/f1-reaction',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
              { label: 'Space Defense',   href: '/space-defense',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
              { label: 'Accuracy Test',   href: '/accuracy',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
              { label: 'CPS Rush',        href: '/cps-rush',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 12v-4"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
              { label: 'Voyager Game',    href: '/voyager-game',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },
              { label: 'Space Waves', href: '/space-waves', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg> },
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
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,245,255,0.07)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,245,255,0.3)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = '#141a2a';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--neon-cyan, #00f5ff)',
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