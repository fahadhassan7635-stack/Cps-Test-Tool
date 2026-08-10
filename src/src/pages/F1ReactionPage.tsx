import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─── More Tools ───────────────────────────────────────────────────────────────
interface ToolLink { label: string; href: string; icon: React.ReactNode; }

const MORE_TOOLS: ToolLink[] = [
  { label: 'CPS Test', href: '/cps-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Spacebar Counter', href: '/spacebar', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="6" y1="15" x2="18" y2="15"/></svg> },
  { label: 'Aim Trainer', href: '/aim-trainer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
  { label: 'Typing Test', href: '/typing-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 15h8M7 11h2m3 0h2m3 0h-1"/></svg> },
  { label: 'Reaction Time', href: '/reaction-time', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: 'Scroll Test', href: '/scroll-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="9"/><path d="M9 11l3-3 3 3"/><path d="M9 13l3 3 3-3"/></svg> },
  { label: 'Double Click', href: '/double-click', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/></svg> },
  { label: '3D Aim Trainer', href: '/3d-aim-trainer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/><circle cx="12" cy="12" r="8" opacity=".4"/></svg> },
  { label: 'Mouse Accuracy', href: '/mouse-accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 2v10"/></svg> },
  { label: 'Key Visualizer', href: '/key-visualizer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"/></svg> },
  { label: 'F1 Reaction', href: '/f1-reaction', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { label: 'Space Defense', href: '/space-defense', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { label: 'Accuracy Test', href: '/accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { label: 'CPS Rush', href: '/cps-rush', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 12v-4"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Voyager Game', href: '/voyager-game', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },
  { label: 'Space Waves', href: '/space-waves', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg> },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const LIGHT_COUNT = 5;
const LIGHT_INTERVAL_MS = 900;
const LIGHTS_COMPLETE_MS = LIGHT_COUNT * LIGHT_INTERVAL_MS;
const CONFETTI_DURATION_MS = 3000;
const COPIED_RESET_MS = 2500;
const MAX_HISTORY_DISPLAY = 20;
const MAX_HISTORY_CHART = 10;
const MAX_HISTORY_STORAGE = 1000;
const MIN_BUTTON_SIZE = 48; // increased for better mobile touch
const MIN_REACTION_MS = 80;
const MAX_REACTION_MS = 5000;
const MAX_FALSE_STARTS = 999_999;
const START_TIME_UNSET = -1;
const SEQUENCE_LOCK_MS = 150;
const MAX_AUDIO_NODES = 32;

const MODE_DELAYS: Record<Mode, [number, number]> = {
  Rookie: [800, 2500],
  Pro: [1500, 4000],
  'F1 Elite': [2500, 6000],
};

const RATING_THRESHOLDS: { max: number; text: string; color: string }[] = [
  { max: 150, text: 'F1 Driver Level', color: '#e040fb' },
  { max: 200, text: 'Alien Reflexes', color: '#00e5ff' },
  { max: 250, text: 'Excellent', color: '#00f5b4' },
  { max: 300, text: 'Great', color: '#ff7a00' },
  { max: 400, text: 'Average', color: '#94a3b8' },
];

const THEME = {
  bg: '#070b12',
  cardBg: '#111823',
  border: '#1b2636',
  cyan: '#00e5ff',
  green: '#00f5b4',
  orange: '#ff7a00',
  textMuted: '#64748b',
  textLight: '#f8fafc',
  f1Red: '#ff2a4b',
} as const;

const CONFETTI_COLORS = [THEME.cyan, THEME.green, THEME.orange, '#fff'];
const CONFETTI_COUNT = 60;

const STORAGE_KEYS = {
  history: 'f1rt_hist_v2', // bumped version to avoid old corrupt data
  fouls: 'f1rt_fouls_v2',
  muted: 'f1rt_muted',
} as const;

const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', icon: '🏁', label: 'First Race', check: (h) => h.length >= 1 },
  { id: 'a2', icon: '⚡', label: 'Sub 300ms', check: (h) => h.some((x) => x.time < 300) },
  { id: 'a3', icon: '🔥', label: 'Sub 250ms', check: (h) => h.some((x) => x.time < 250) },
  { id: 'a4', icon: '🚀', label: 'Sub 200ms', check: (h) => h.some((x) => x.time < 200) },
  { id: 'a5', icon: '👽', label: 'Sub 150ms', check: (h) => h.some((x) => x.time < 150) },
  { id: 'a6', icon: '🥈', label: '10 Races', check: (h) => h.length >= 10 },
  { id: 'a7', icon: '🥇', label: '50 Races', check: (h) => h.length >= 50 },
  { id: 'a8', icon: '🏆', label: '100 Races', check: (h) => h.length >= 100 },
];

const FAQ_ITEMS = [
  {
    q: 'What makes the F1 Reaction Test different from standard reaction tests?',
    a: 'A regular reaction utility usually relies on a simple, unpredictable full-screen color shift. The F1 variant builds anticipation with five sequential warning lamps followed by a highly randomized suspension phase before turning off, mirroring the high-stress conditions found in competitive gaming and real motorsport.',
  },
  {
    q: 'Can this tool directly help increase my maximum CPS click capacity?',
    a: 'Reaction speed and clicking rhythm are related but not identical skills. Sharpening your visual-to-motor response can help you start a click burst sooner, but sustained CPS depends more on repetitive motor rhythm and technique than on single-stimulus reaction time.',
  },
  {
    q: 'How can I shave milliseconds off my personal best score?',
    a: 'Minimize hardware processing latency by leveraging high polling-rate gaming gear, ensure you are fully hydrated, eliminate background distractions, and consistently practice short intervals daily. Warming up your fingers before testing also helps.',
  },
  {
    q: 'What is the average human reaction time?',
    a: 'The average human simple visual reaction time is approximately 250ms. Trained athletes and esports professionals often achieve 150–200ms through consistent practice and optimized setups.',
  },
  {
    q: 'Does screen size or device type affect my score?',
    a: 'Display latency can marginally affect results. Using a monitor with low response time and a high refresh rate (144Hz+) provides the most accurate baseline. On mobile, ensure your screen brightness is high and tap response is enabled.',
  },
  {
    q: 'What counts as a false start or "jump start"?',
    a: 'If you tap, click, or press a key before all five lights have gone out, the system immediately flags it as a jump start, just like a real Formula 1 grid penalty. Your timer resets and the attempt does not count toward your history.',
  },
  {
    q: 'Why is the delay after the lights randomized instead of fixed?',
    a: 'A fixed delay would let you memorize the timing and anticipate rather than truly react. Randomizing the gap after the fifth light forces your brain to respond to the actual visual stimulus, giving a genuine measurement of reaction speed.',
  },
  {
    q: 'What is the difference between Rookie, Pro, and F1 Elite modes?',
    a: 'Each mode changes the range of the random delay after the lights go out. Rookie uses a shorter, more predictable window, Pro extends it, and F1 Elite uses the longest and widest range to prevent pattern guessing at a professional level.',
  },
  {
    q: 'Is my history and personal best saved permanently?',
    a: 'Your results are stored locally in your browser so they persist between visits on the same device. Clearing your browser data or switching devices will reset your saved history and personal best.',
  },
  {
    q: 'Why does my score sometimes seem inconsistent between attempts?',
    a: 'Reaction time naturally fluctuates run to run due to attention, fatigue, and momentary distraction. Looking at your rolling average over the last ten attempts is usually a more reliable indicator of your true skill level than any single result.',
  },
  {
    q: 'Can I use this test on a mobile phone or tablet?',
    a: 'Yes, the test is fully touch-optimized. Simply tap the arena instead of clicking, and results are measured with the same precision timing used on desktop.',
  },
  {
    q: 'Does using a wired mouse or keyboard improve my score?',
    a: 'Wired peripherals generally introduce less input latency than wireless ones, especially budget wireless devices. For the most accurate measurement of your biological reaction time, a low-latency wired connection is recommended.',
  },
  {
    q: 'What is the difference between reaction time and response time?',
    a: 'Reaction time refers purely to the delay between a stimulus appearing and your first physical response. Response time can include the full duration of a more complex action, such as choosing between multiple options before responding.',
  },
  {
    q: 'Why do esports players train reaction time specifically?',
    a: 'In fast-paced competitive games, the gap between spotting an opponent and executing an action can decide a round. Consistent reaction training narrows that gap, which compounds into a measurable competitive advantage over time.',
  },
  {
    q: 'Is a lower reaction time always better?',
    a: 'Generally yes, but results below roughly 100ms are usually caused by anticipating the lights rather than truly reacting to them, since that falls near the physiological limit of human visual response. The test flags unrealistically fast times as invalid.',
  },
  {
    q: 'How many attempts should I do per session?',
    a: 'Short, focused sessions of around ten attempts tend to produce more meaningful data than long marathon sessions, since fatigue and reduced focus can skew later attempts toward slower times.',
  },
  {
    q: 'Does age affect reaction time?',
    a: 'Reaction time generally improves through childhood, peaks in the early twenties, and gradually slows with age afterward. Regular practice and staying physically active can help maintain sharper responses over time.',
  },
  {
    q: 'Can caffeine or fatigue affect my results?',
    a: 'Yes. Moderate caffeine intake can modestly improve alertness and reaction speed, while fatigue, dehydration, and lack of sleep are well documented to slow reaction time measurably.',
  },
  {
    q: 'Why does the test use five lights instead of one?',
    a: 'The five-light sequence mirrors the official FIA Formula 1 starting procedure, where all lights illuminate before going out simultaneously. This builds realistic anticipation pressure similar to what real drivers experience on the grid.',
  },
  {
    q: 'What should I do if the lights or timer seem to freeze?',
    a: 'This is usually caused by a browser tab losing focus or being throttled in the background. Refreshing the page and keeping the tab active during the test typically resolves timing inconsistencies.',
  },
  {
    q: 'Can I mute the sound effects?',
    a: 'Yes, use the speaker icon in the top corner or press the S key to toggle sound on or off at any time, including mid-session.',
  },
  {
    q: 'How is my personal best calculated?',
    a: 'Your personal best is simply the lowest valid reaction time recorded across all your saved attempts. Achieving a new personal best triggers a confetti celebration and a distinct sound cue.',
  },
  {
    q: 'What do the achievement badges represent?',
    a: 'Achievements track milestones such as completing your first race, reaching specific speed thresholds like sub-200ms or sub-150ms, and hitting attempt-count milestones such as ten, fifty, or one hundred completed races.',
  },
  {
    q: 'Why is my reaction time on mobile slower than on desktop?',
    a: 'Touchscreens can introduce slightly more input latency than a physical mouse click due to touch-processing overhead in some devices and browsers. This is normal and does not indicate a problem with the test.',
  },
  {
    q: 'Is this test scientifically accurate?',
    a: 'The test uses high-precision browser timing APIs to measure the interval between the stimulus and your input, which is broadly consistent with methods used in simple reaction time research. However, browser and device variability mean it should be treated as a fun benchmark rather than a clinical instrument.',
  },
  {
    q: 'Can I compare my results with friends?',
    a: 'Yes, use the share button after completing a run to copy or share your time and rating, so friends can try to beat your score.',
  },
  {
    q: 'Why does my false start count keep increasing across sessions?',
    a: 'False start counts are saved locally alongside your history, so they accumulate across visits until your browser data is cleared, giving you a long-term view of your discipline in waiting for the correct stimulus.',
  },
  {
    q: 'Does practicing this test translate to real racing simulators?',
    a: 'Grid-start discipline and reaction consistency trained here can transfer to racing simulators that use similar starting-light sequences, though full driving performance also depends on many other skills like car control and race craft.',
  },
  {
    q: 'What is the difference between this test and a simple color-change reaction test?',
    a: 'A basic color-change test uses a single unstructured stimulus with no build-up. This test adds a five-light anticipation phase and a randomized hold, closely mirroring the real F1 start procedure and specifically testing your ability to resist anticipating the signal.',
  },
  {
    q: 'Why do my results improve within the same session but reset the next day?',
    a: 'Short-term improvement within a session usually reflects warm-up and rhythm familiarity, which fades between sessions. Long-term, durable improvement comes from repeated practice over days and weeks, which is why tracking your rolling average over time matters more than any single session.',
  },
  {
    q: 'Can background browser tabs or extensions slow down my recorded time?',
    a: 'Yes. Heavy background tabs, browser extensions, or system processes can occasionally introduce small timing hiccups. For the most accurate results, close unnecessary tabs and extensions before testing.',
  },
  {
    q: 'Is there a difference between reacting with a thumb versus a finger?',
    a: 'Different fingers and hand postures can produce slightly different results due to variations in muscle response and habitual dexterity. Sticking with the same hand and finger consistently makes your personal history more comparable over time.',
  },
  {
    q: 'Why does F1 Elite mode feel so much harder than Rookie mode?',
    a: 'F1 Elite uses a longer and wider randomized delay window after the lights go out, making the exact release moment far less predictable. This forces you to rely on genuine reaction rather than a learned sense of timing.',
  },
  {
    q: 'Does this test measure hand-eye coordination as well as reaction time?',
    a: 'Not directly. This test isolates simple reaction time — how quickly you respond to a stimulus — rather than spatial tracking or aiming accuracy, which are separate skills typically measured by dedicated aim-trainer tools.',
  },
  {
    q: 'Can I reset my history and start fresh?',
    a: 'Clearing your browser\u2019s site data or local storage for this page will remove your saved history, personal best, and false-start count, letting you start with a clean slate.',
  },
  {
    q: 'Why do professional racing drivers still occasionally jump the start?',
    a: 'Even elite drivers with exceptional reflexes can misjudge the randomized delay under high pressure, since anticipation naturally increases with stress and adrenaline. This is precisely why the random hold period exists — to keep the start fair even for the fastest reflexes in the world.',
  },
  {
    q: 'Does listening to music while testing affect my score?',
    a: 'It can, in either direction. For some people, background music increases arousal and alertness, slightly improving reaction speed, while for others it adds a distraction that slows response. Testing in a quiet environment first gives you the clearest baseline.',
  },
  {
    q: 'Is it normal for my false start count to be higher on F1 Elite mode?',
    a: 'Yes. The longer, less predictable delay in F1 Elite makes anticipation errors more likely, so a higher false-start count on this mode does not necessarily indicate a decline in skill compared to Rookie or Pro mode.',
  },
];

const SCORE_CHART_ROWS = [
  { range: '< 150 ms', rating: 'F1 Driver Level', equivalent: 'God-Tier Speed (Verstappen / Hamilton Level)', color: '#e040fb' },
  { range: '150 – 200 ms', rating: 'Alien Reflexes', equivalent: 'Tier-1 Esports Professional Athlete', color: '#00e5ff' },
  { range: '200 – 250 ms', rating: 'Excellent', equivalent: 'Hardcore High-Tier Competitive Gamer', color: '#00f5b4' },
  { range: '250 – 300 ms', rating: 'Great', equivalent: 'Standard Average Human Response Baseline', color: '#ff7a00' },
  { range: '300 – 400 ms', rating: 'Average', equivalent: 'Casual Gamer / Occasional Player', color: '#94a3b8' },
  { range: '> 400 ms', rating: 'Rookie', equivalent: 'Needs Dedicated Warm-Ups and Focus Training', color: '#64748b' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'lighting' | 'ready' | 'foul' | 'result';
type Mode = 'Rookie' | 'Pro' | 'F1 Elite';

interface HistoryItem {
  id: string;
  time: number;
  mode: Mode;
  date: number;
  checksum: number;
}

interface Achievement {
  id: string;
  icon: string;
  label: string;
  check: (hist: HistoryItem[]) => boolean;
}

interface ConfettiPiece {
  id: number;
  color: string;
  left: string;
  size: string;
  delay: string;
  radius: string;
  duration: string;
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function computeChecksum(time: number, mode: string, date: number): number {
  const raw = `${time}|${mode}|${date}|f1rt-integrity`;
  let h = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = (Math.imul(h, 0x01000193) >>> 0);
  }
  return h >>> 0;
}

function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function safeParseInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or private-browsing — fail silently
  }
}

function isValidHistoryItem(item: unknown): item is HistoryItem {
  if (!item || typeof item !== 'object') return false;
  const h = item as Record<string, unknown>;

  if (typeof h.id !== 'string') return false;
  if (h.id.length < 1 || h.id.length > 40) return false;
  // FIX #6: case-insensitive regex to accept uppercase hex from crypto.randomUUID
  if (!/^[a-zA-Z0-9]+$/.test(h.id as string)) return false;

  if (typeof h.time !== 'number') return false;
  if (!Number.isFinite(h.time)) return false;
  if (h.time < MIN_REACTION_MS) return false;
  if (h.time > MAX_REACTION_MS) return false;
  if (!Number.isInteger(h.time)) return false;

  if (typeof h.mode !== 'string') return false;
  if (!(['Rookie', 'Pro', 'F1 Elite'] as string[]).includes(h.mode)) return false;

  if (typeof h.date !== 'number') return false;
  if (!Number.isFinite(h.date)) return false;
  if (h.date <= 0) return false;
  if (h.date > Date.now() + 60_000) return false;

  if (typeof h.checksum !== 'number') return false;
  const expected = computeChecksum(h.time as number, h.mode as string, h.date as number);
  if ((h.checksum as number) !== expected) return false;

  return true;
}

function sanitizeHistory(raw: unknown): HistoryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValidHistoryItem).slice(0, MAX_HISTORY_STORAGE);
}

function arrayMin(arr: number[]): number {
  if (arr.length === 0) return Infinity;
  let min = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) min = arr[i];
  }
  return min;
}

function arrayMax(arr: number[]): number {
  if (arr.length === 0) return -Infinity;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

function getRating(ms: number): { text: string; color: string } {
  for (const tier of RATING_THRESHOLDS) {
    if (ms < tier.max) return { text: tier.text, color: tier.color };
  }
  return { text: 'Rookie', color: THEME.textMuted };
}

function getBarColor(ms: number): string {
  if (ms < 150) return '#e040fb';
  if (ms < 200) return THEME.cyan;
  if (ms < 250) return THEME.green;
  if (ms < 300) return THEME.orange;
  return '#334155';
}

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    left: `${Math.random() * 100}%`,
    size: `${4 + Math.random() * 8}px`,
    delay: `${(Math.random() * 0.5).toFixed(3)}s`,
    radius: Math.random() > 0.5 ? '50%' : '2px',
    duration: `${(1.5 + Math.random() * 2).toFixed(3)}s`,
  }));
}

// FIX #6: always lowercase output so regex always passes
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').toLowerCase().slice(0, 16);
  }
  return Math.random().toString(36).slice(2, 11) + Math.random().toString(36).slice(2, 7);
}

function vibrateDevice(pattern: number | number[]): void {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    // Not supported
  }
}

const trustedPerfNow: () => number = (() => {
  try {
    return Performance.prototype.now.bind(performance);
  } catch {
    return () => Date.now();
  }
})();

// ─── Component ────────────────────────────────────────────────────────────────

export default function F1ReactionTimePage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [mode, setMode] = useState<Mode>('Pro');
  const [lights, setLights] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [falseStarts, setFalseStarts] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Refs
  const startTime = useRef<number>(START_TIME_UNSET);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioCtx = useRef<AudioContext | null>(null);
  const activeAudioNodes = useRef<number>(0);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessing = useRef<boolean>(false);
  const processingLockAt = useRef<number>(0);
  const sequenceGen = useRef<number>(0);
  const isMutedRef = useRef<boolean>(isMuted);
  const phaseRef = useRef<Phase>('idle');
  // FIX mobile: track last pointer event to prevent ghost clicks
  const lastPointerType = useRef<string>('');
  const lastEventTime = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);
  const historyRef = useRef<HistoryItem[]>([]); // FIX #2: ref mirror for history

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Keep refs in sync
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { historyRef.current = history; }, [history]); // FIX #2

  // ── Load persisted state ───────────────────────────────────────────────────
  useEffect(() => {
    const rawHistory = safeParseJSON(safeLocalStorageGet(STORAGE_KEYS.history), []);
    const loaded = sanitizeHistory(rawHistory);
    setHistory(loaded);
    historyRef.current = loaded;

    const storedFouls = safeParseInt(safeLocalStorageGet(STORAGE_KEYS.fouls), 0);
    setFalseStarts(storedFouls >= 0 && storedFouls < MAX_FALSE_STARTS ? storedFouls : 0);

    setIsMuted(safeLocalStorageGet(STORAGE_KEYS.muted) === 'true');
  }, []);

  // FIX #1: unmount cleanup uses refs directly — no stale closure
  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      if (confettiTimer.current) clearTimeout(confettiTimer.current);
      try { audioCtx.current?.close(); } catch { /* ignore */ }
    };
  }, []);

  // ── Audio helpers ──────────────────────────────────────────────────────────
  // FIX #3: init audio regardless of muted state so unmute works later
  const initAudio = useCallback(() => {
    if (audioCtx.current) return;
    try {
      const Ctor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) audioCtx.current = new Ctor();
    } catch {
      // Audio API unavailable
    }
  }, []);

  const resumeCtx = useCallback(() => {
    if (audioCtx.current?.state === 'suspended') {
      audioCtx.current.resume().catch(() => {});
    }
  }, []);

  const playTone = useCallback(
    (freq: number, type: OscillatorType, dur: number, freqEnd?: number) => {
      if (isMutedRef.current || !audioCtx.current) return;
      if (activeAudioNodes.current >= MAX_AUDIO_NODES) return;
      resumeCtx();
      try {
        const ctx = audioCtx.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        activeAudioNodes.current += 2;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        if (freqEnd) {
          osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + dur);
        }
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
        osc.onended = () => {
          activeAudioNodes.current = Math.max(0, activeAudioNodes.current - 2);
          try { osc.disconnect(); } catch { /* ignore */ }
          try { gain.disconnect(); } catch { /* ignore */ }
        };
      } catch {
        activeAudioNodes.current = Math.max(0, activeAudioNodes.current - 2);
      }
    },
    [resumeCtx],
  );

  const playLight = useCallback(() => playTone(440, 'sine', 0.08), [playTone]);
  const playFoul = useCallback(() => playTone(150, 'sawtooth', 0.35, 50), [playTone]);

  const playRecord = useCallback(() => {
    if (isMutedRef.current || !audioCtx.current) return;
    if (activeAudioNodes.current >= MAX_AUDIO_NODES) return;
    resumeCtx();
    const ctx = audioCtx.current;
    const notes: [number, number][] = [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.35]];
    notes.forEach(([f, t]) => {
      if (activeAudioNodes.current >= MAX_AUDIO_NODES) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        activeAudioNodes.current += 2;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + t);
        gain.gain.setValueAtTime(0, ctx.currentTime + t);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + t + 0.02);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + t + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.15);
        osc.onended = () => {
          activeAudioNodes.current = Math.max(0, activeAudioNodes.current - 2);
          try { osc.disconnect(); } catch { /* ignore */ }
          try { gain.disconnect(); } catch { /* ignore */ }
        };
      } catch {
        activeAudioNodes.current = Math.max(0, activeAudioNodes.current - 2);
      }
    });
  }, [resumeCtx]);

  // ── Timer helpers ──────────────────────────────────────────────────────────
  const clearAllTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timers.current.push(id);
    return id;
  }, []);

  // ── Confetti ───────────────────────────────────────────────────────────────
  const spawnConfetti = useCallback(() => {
    if (!mountedRef.current) return;
    setConfetti(generateConfetti());
    if (confettiTimer.current) clearTimeout(confettiTimer.current);
    confettiTimer.current = setTimeout(() => {
      if (mountedRef.current) setConfetti([]);
    }, CONFETTI_DURATION_MS);
  }, []);

  // ── Start sequence ─────────────────────────────────────────────────────────
  const startSequence = useCallback(() => {
    initAudio();
    clearAllTimers();
    isProcessing.current = false;
    processingLockAt.current = 0;
    startTime.current = START_TIME_UNSET;
    lastEventTime.current = 0;

    const gen = ++sequenceGen.current;

    setReactionTime(null);
    setIsNewRecord(false);
    setPhase('lighting');
    setLights(0);

    for (let i = 1; i <= LIGHT_COUNT; i++) {
      addTimer(() => {
        if (sequenceGen.current !== gen) return;
        if (!mountedRef.current) return;
        setLights(i);
        playLight();
        vibrateDevice(20);
      }, i * LIGHT_INTERVAL_MS);
    }

    const [min, max] = MODE_DELAYS[mode];
    const rand = Math.random() * (max - min) + min;

    addTimer(() => {
      if (sequenceGen.current !== gen) return;
      if (!mountedRef.current) return;
      const capturedStart = trustedPerfNow();
      startTime.current = capturedStart;
      setPhase('ready');
      setLights(0);
    }, LIGHTS_COMPLETE_MS + rand);
  }, [mode, initAudio, clearAllTimers, addTimer, playLight]);

  // ── Core interaction handler ───────────────────────────────────────────────
  const handleInteraction = useCallback(
    (e?: React.SyntheticEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // FIX mobile #8: use pointerType from the stored ref to prevent
      // both touchstart + mousedown firing on the same tap
      const now = trustedPerfNow();
      if (now - lastEventTime.current < 32) return; // ~2 frames debounce
      lastEventTime.current = now;

      vibrateDevice(30);

      const currentPhase = phaseRef.current;

      if (currentPhase === 'idle' || currentPhase === 'result' || currentPhase === 'foul') {
        startSequence();

      } else if (currentPhase === 'lighting') {
        clearAllTimers();
        sequenceGen.current++;
        setPhase('foul');
        setLights(0);
        setFalseStarts((prev) => {
          const next = Math.min(prev + 1, MAX_FALSE_STARTS);
          safeLocalStorageSet(STORAGE_KEYS.fouls, String(next));
          return next;
        });
        playFoul();
        vibrateDevice([100, 50, 100]);

      } else if (currentPhase === 'ready') {
        // ── Double-event guard ─────────────────────────────────────────────
        if (isProcessing.current) {
          if (now - processingLockAt.current > 2000) {
            isProcessing.current = false;
            processingLockAt.current = 0;
          } else {
            return;
          }
        }

        isProcessing.current = true;
        processingLockAt.current = now;

        if (startTime.current === START_TIME_UNSET) {
          isProcessing.current = false;
          return;
        }

        const rawTime = trustedPerfNow() - startTime.current;

        if (rawTime < MIN_REACTION_MS || rawTime > MAX_REACTION_MS) {
          isProcessing.current = false;
          return;
        }

        const time = Math.round(rawTime);

        // FIX #2: read history from ref, not closure — no side effects in updater
        const currentHistory = historyRef.current;
        const prevBest = currentHistory.length
          ? arrayMin(currentHistory.map((h) => h.time))
          : Infinity;
        const isRecord = time < prevBest;

        // Set state cleanly — no side effects inside updater
        setReactionTime(time);
        setIsNewRecord(isRecord);
        setPhase('result');

        // Side effects outside the updater
        if (isRecord) {
          playRecord();
          spawnConfetti();
          vibrateDevice([50, 30, 50, 30, 100]);
        }

        const stamp = Date.now();
        const checksum = computeChecksum(time, mode, stamp);
        const newItem: HistoryItem = {
          id: generateId(),
          time,
          mode,
          date: stamp,
          checksum,
        };

        // Pure updater — only computes next state
        setHistory((prev) => {
          const next = [newItem, ...prev].slice(0, MAX_HISTORY_STORAGE);
          historyRef.current = next; // keep ref in sync
          safeLocalStorageSet(STORAGE_KEYS.history, JSON.stringify(next));
          return next;
        });

        // FIX #4: mountedRef guard inside the timeout
        setTimeout(() => {
          if (!mountedRef.current) return;
          isProcessing.current = false;
          processingLockAt.current = 0;
        }, SEQUENCE_LOCK_MS);
      }
    },
    [startSequence, clearAllTimers, playFoul, playRecord, spawnConfetti, mode],
  );

  // ── Pointer-based arena handler (FIX mobile #8) ───────────────────────────
  // Single onPointerDown replaces onMouseDown + onTouchStart combo
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only primary button / first touch
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      lastPointerType.current = e.pointerType;
      handleInteraction(e as unknown as React.SyntheticEvent);
    },
    [handleInteraction],
  );

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleInteraction();
      }
      if (e.key.toLowerCase() === 'r' && phaseRef.current !== 'lighting') {
        startSequence();
      }
      if (e.key.toLowerCase() === 's') {
        setIsMuted((prev) => {
          const next = !prev;
          safeLocalStorageSet(STORAGE_KEYS.muted, String(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInteraction, startSequence]);

  // ── Derived analytics ──────────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const pb = history.length ? arrayMin(history.map((h) => h.time)) : null;
    const recentSlice = history.slice(0, MAX_HISTORY_CHART);
    const avg = recentSlice.length
      ? Math.round(recentSlice.reduce((a, b) => a + b.time, 0) / recentSlice.length)
      : null;
    const reversed = recentSlice.slice().reverse();
    const times = reversed.map((h) => h.time);
    const maxTime = times.length ? arrayMax(times) : 1;
    const minTime = times.length ? arrayMin(times) : 0;
    const timeRange = maxTime - minTime || 1;
    return { pbValue: pb, avgValue: avg, recentReverse: reversed, maxTime, minTime, timeRange };
  }, [history]);

  const { pbValue, avgValue, recentReverse, minTime, timeRange } = analytics;

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.check(history) })),
    [history],
  );

  // ── Toggle helpers ─────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    initAudio(); // ensure context exists when unmuting
    setIsMuted((prev) => {
      const next = !prev;
      safeLocalStorageSet(STORAGE_KEYS.muted, String(next));
      return next;
    });
  }, [initAudio]);

  const toggleFaq = useCallback((index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  }, []);

  // ── Share ──────────────────────────────────────────────────────────────────
  const shareScore = useCallback(async () => {
    if (!reactionTime) return;
    const r = getRating(reactionTime);
    const text = `🏎️ F1 Lights Out Reaction Test\n⏱️ My time: ${reactionTime}ms\n🏆 Rating: ${r.text}\nCan you beat me?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'F1 Reaction Test', text });
      } else {
        try {
          await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
          setCopied(true);
          if (copiedTimer.current) clearTimeout(copiedTimer.current);
          copiedTimer.current = setTimeout(() => {
            if (mountedRef.current) setCopied(false);
          }, COPIED_RESET_MS);
        } catch {
          window.prompt('Copy your score:', `${text}\n${window.location.href}`);
        }
      }
    } catch {
      // User cancelled share sheet
    }
  }, [reactionTime]);

  // ── Arena derived styles ───────────────────────────────────────────────────
  const arenaBorderColor =
    phase === 'foul' ? 'rgba(255,42,75,0.3)' :
    phase === 'ready' ? 'rgba(0,245,180,0.2)' :
    THEME.border;

  const arenaBgColor =
    phase === 'foul' ? 'rgba(255,42,75,0.03)' :
    phase === 'ready' ? 'rgba(0,245,180,0.02)' :
    THEME.cardBg;

  const ariaLabel =
    phase === 'idle' ? 'Press to start the reaction test' :
    phase === 'lighting' ? 'Wait for lights to go out — pressing now triggers a false start' :
    phase === 'ready' ? 'Lights out! Tap or press now!' :
    phase === 'foul' ? 'False start! Tap to try again' :
    reactionTime !== null ? `Your reaction time was ${reactionTime} milliseconds. Tap to retry.` :
    'Reaction test arena';

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        backgroundColor: 'transparent',
        color: THEME.textLight,
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
        padding: 'clamp(1rem,3vw,2rem) clamp(0.75rem,3vw,1rem)',
        overflowX: 'hidden',
        WebkitTapHighlightColor: 'transparent',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; -webkit-text-size-adjust: 100%; }
        @keyframes fall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(100vh)  rotate(720deg); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1;   }
        }
        .table-scroll   { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .history-scroll { overflow-y: auto; -webkit-overflow-scrolling: touch; }
        button { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
        :focus-visible { outline: 2px solid #00e5ff; outline-offset: 2px; }
        /* Mobile: prevent text selection during rapid taps */
        .arena-zone { -webkit-user-select: none; user-select: none; }
      `}</style>

      {/* Confetti */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 999, overflow: 'hidden',
        }}
      >
        {confetti.map((piece) => (
          <div
            key={piece.id}
            style={{
              position: 'absolute', top: '-10px',
              left: piece.left,
              backgroundColor: piece.color,
              width: piece.size, height: piece.size,
              borderRadius: piece.radius,
              animation: `fall ${piece.duration} ${piece.delay} linear forwards`,
            }}
          />
        ))}
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <header
          style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              aria-hidden="true"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                backgroundColor: 'rgba(0,229,255,0.05)',
                border: '1px solid rgba(0,229,255,0.2)',
                color: THEME.cyan,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
                padding: '5px 14px', borderRadius: '100px',
                marginBottom: '12px', textTransform: 'uppercase',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: THEME.cyan }} />
              F1 LIGHTS OUT
            </div>

            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(2rem,6vw,4.2rem)',
                fontWeight: 900, letterSpacing: '-1px',
                lineHeight: 0.95, color: '#fff',
                textTransform: 'uppercase',
                margin: '0 0 12px 0',
              }}
            >
              F1 REACTION<br />
              <span style={{ color: THEME.green }}>TIME TEST</span>
            </h1>

            <p style={{ fontSize: 'clamp(0.85rem,2vw,0.95rem)', color: '#64748b', fontWeight: 400, maxWidth: '500px', lineHeight: 1.4, margin: 0 }}>
              Wait for all 5 red lights — when they go out, react instantly.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
            <div
              role="group"
              aria-label="Difficulty mode"
              style={{
                display: 'flex', backgroundColor: THEME.cardBg,
                border: `1px solid ${THEME.border}`,
                borderRadius: '10px', padding: '4px', gap: '2px',
              }}
            >
              {(['Rookie', 'Pro', 'F1 Elite'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => phase !== 'lighting' && setMode(m)}
                  disabled={phase === 'lighting'}
                  aria-pressed={mode === m}
                  aria-label={`Set difficulty to ${m}`}
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 'clamp(11px,2vw,13px)', fontWeight: 700, letterSpacing: '.5px',
                    padding: '0 clamp(10px,2vw,14px)',
                    minHeight: `${MIN_BUTTON_SIZE}px`,
                    border: 'none', borderRadius: '7px',
                    cursor: phase === 'lighting' ? 'not-allowed' : 'pointer',
                    transition: 'all .15s',
                    backgroundColor: mode === m ? THEME.green : 'transparent',
                    color: mode === m ? '#000' : THEME.textMuted,
                    boxShadow: mode === m ? '0 2px 12px rgba(0,245,180,0.4)' : 'none',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              aria-pressed={isMuted}
              style={{
                width: `${MIN_BUTTON_SIZE}px`, height: `${MIN_BUTTON_SIZE}px`,
                border: `1px solid ${THEME.border}`, borderRadius: '10px',
                backgroundColor: THEME.cardBg, color: THEME.textMuted,
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', flexShrink: 0,
              }}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </header>

        {/* ── Arena ── */}
        {/* FIX mobile: single onPointerDown, no onMouseDown/onTouchStart split */}
        <main
          className="arena-zone"
          role="button"
          tabIndex={0}
          aria-label={ariaLabel}
          onPointerDown={handlePointerDown}
          onKeyDown={(e) => {
            if (e.code === 'Space' || e.key === 'Enter') {
              e.preventDefault();
              handleInteraction();
            }
          }}
          style={{
            position: 'relative', borderRadius: '16px',
            border: `1px solid ${arenaBorderColor}`,
            backgroundColor: arenaBgColor,
            cursor: 'pointer',
            touchAction: 'manipulation', // FIX mobile: prevents 300ms tap delay
            minHeight: 'clamp(280px,45vw,340px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: 'clamp(1.25rem,4vw,2rem) clamp(0.75rem,3vw,1rem)',
            backdropFilter: 'blur(4px)',
            outline: 'none',
            transition: 'border-color 0.2s, background-color 0.2s',
            // FIX mobile: ensure full-width tap target
            width: '100%',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: '3px',
              background: `linear-gradient(90deg, transparent, ${THEME.cyan}, transparent)`,
              opacity: 0.3,
            }}
          />

          {/* Gantry */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem', zIndex: 2, width: '100%' }}>
            <div
              role="img"
              aria-label={`Starting lights gantry: ${lights} of ${LIGHT_COUNT} lit`}
              style={{
                background: '#090d14', border: `1px solid ${THEME.border}`,
                borderRadius: '14px',
                padding: 'clamp(10px,3vw,20px) clamp(12px,4vw,28px)',
                display: 'flex', gap: 'clamp(8px,2.5vw,20px)',
                boxShadow: 'inset 0 8px 24px rgba(0,0,0,.5)',
                flexWrap: 'nowrap',
              }}
            >
              {Array.from({ length: LIGHT_COUNT }).map((_, i) => {
                const isOn = lights > i;
                const bulbStyle: React.CSSProperties = {
                  width: 'clamp(28px,6.5vw,60px)', height: 'clamp(28px,6.5vw,60px)',
                  borderRadius: '50%', border: '3px solid #1a2332',
                  backgroundColor: isOn ? THEME.f1Red : '#070a0f',
                  boxShadow: isOn ? `0 0 20px ${THEME.f1Red}, 0 0 40px rgba(255,42,75,0.4)` : 'none',
                  transition: 'all 60ms linear', flexShrink: 0,
                };
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px,2vw,14px)' }}>
                    <div style={bulbStyle} />
                    <div style={bulbStyle} />
                  </div>
                );
              })}
            </div>
            <div
              aria-hidden="true"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '10px', letterSpacing: '3px',
                color: THEME.textMuted, textTransform: 'uppercase',
              }}
            >
              Starting Lights Gantry
            </div>
          </div>

          {/* Phase display */}
          <div
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', textAlign: 'center',
              gap: '.75rem', zIndex: 2,
              minHeight: '140px', justifyContent: 'center',
              width: '100%', padding: '0 0.5rem',
            }}
          >
            {phase === 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem' }}>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(1.4rem,4vw,2.4rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#fff', margin: 0 }}>
                  Ready to Test?
                </p>
                <p style={{ fontSize: 'clamp(0.8rem,2vw,0.85rem)', color: THEME.textMuted, margin: 0 }}>
                  Tap the screen or press SPACE when the lights go out.
                </p>
                <button
                  onPointerDown={(e) => { e.stopPropagation(); handleInteraction(); }}
                  aria-label="Start the reaction test"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    backgroundColor: THEME.green, color: '#000',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 'clamp(0.9rem,3vw,1rem)', fontWeight: 800,
                    letterSpacing: '2px', textTransform: 'uppercase',
                    padding: 'clamp(12px,2vw,14px) clamp(24px,5vw,32px)',
                    borderRadius: '10px', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,245,180,0.3)',
                    minHeight: `${MIN_BUTTON_SIZE}px`,
                    touchAction: 'manipulation',
                  }}
                >
                  🏁 Start Engine
                </button>
              </div>
            )}

            {phase === 'lighting' && (
              <p
                aria-live="assertive"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 'clamp(1.8rem,6vw,3.5rem)', fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '4px',
                  color: THEME.f1Red, margin: 0,
                }}
              >
                Wait For Lights...
              </p>
            )}

            {phase === 'ready' && (
              <p
                aria-live="assertive"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 'clamp(2.5rem,10vw,6rem)', fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '4px',
                  color: THEME.cyan,
                  textShadow: 'rgba(0,229,255,.4) 0 0 30px',
                  margin: 0,
                }}
              >
                TAP NOW!
              </p>
            )}

            {phase === 'foul' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
                <p
                  aria-live="assertive"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 'clamp(1.6rem,5vw,3rem)', fontWeight: 900,
                    textTransform: 'uppercase', color: THEME.f1Red,
                    letterSpacing: '2px', margin: 0,
                  }}
                >
                  ⛔ Jump Start!
                </p>
                <p style={{ fontSize: 'clamp(0.8rem,2vw,0.85rem)', color: '#f87171', margin: 0 }}>
                  You reacted before the lights went out.
                </p>
                <p style={{ fontSize: 'clamp(0.7rem,2vw,0.75rem)', color: THEME.textMuted, margin: '8px 0 0 0' }}>
                  Tap anywhere to try again
                </p>
              </div>
            )}

            {phase === 'result' && reactionTime !== null && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
                {isNewRecord && (
                  <p
                    aria-live="polite"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 'clamp(0.75rem,2vw,0.85rem)', fontWeight: 700,
                      letterSpacing: '3px', color: THEME.orange,
                      textTransform: 'uppercase', margin: 0,
                    }}
                  >
                    ★ New Personal Best ★
                  </p>
                )}
                <div
                  aria-live="polite"
                  aria-label={`${reactionTime} milliseconds`}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 'clamp(3rem,12vw,7rem)', fontWeight: 700,
                    lineHeight: 1, letterSpacing: '-2px',
                    color: getRating(reactionTime).color,
                  }}
                >
                  {reactionTime}
                  <span style={{ fontSize: 'clamp(1rem,3vw,2rem)', fontWeight: 400, color: THEME.textMuted, marginLeft: '4px' }}>ms</span>
                </div>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(0.9rem,2.5vw,1.1rem)', fontWeight: 700, letterSpacing: '1px', color: '#fff', textTransform: 'uppercase', margin: 0 }}>
                  Rating: {getRating(reactionTime).text}
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onPointerDown={(e) => { e.stopPropagation(); startSequence(); }}
                    aria-label="Retry the reaction test"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      backgroundColor: '#1e293b', border: `1px solid ${THEME.border}`,
                      color: '#f0f0f0', fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 'clamp(0.8rem,2vw,0.85rem)', fontWeight: 700,
                      letterSpacing: '1px', textTransform: 'uppercase',
                      padding: '0 20px', minHeight: `${MIN_BUTTON_SIZE}px`,
                      borderRadius: '8px', cursor: 'pointer',
                      touchAction: 'manipulation',
                    }}
                  >
                    ↺ Retry
                  </button>
                  <button
                    onPointerDown={(e) => { e.stopPropagation(); shareScore(); }}
                    aria-label={copied ? 'Score copied to clipboard' : 'Share your score'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      backgroundColor: THEME.cyan, border: 'none', color: '#000',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 'clamp(0.8rem,2vw,0.85rem)', fontWeight: 700,
                      letterSpacing: '1px', textTransform: 'uppercase',
                      padding: '0 20px', minHeight: `${MIN_BUTTON_SIZE}px`,
                      borderRadius: '8px', cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,229,255,0.3)',
                      touchAction: 'manipulation',
                    }}
                  >
                    {copied ? '✓ Copied!' : '↗ Share'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        <p
          aria-hidden="true"
          style={{
            textAlign: 'center',
            fontSize: 'clamp(0.65rem,1.5vw,0.75rem)',
            color: THEME.textMuted, letterSpacing: '.5px', marginTop: '.5rem',
          }}
        >
          [SPACE / ENTER] React &nbsp;•&nbsp; [R] Restart &nbsp;•&nbsp; [S] Toggle Sound
        </p>

        {/* ── Stats ── */}
        <section aria-label="Performance statistics">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '.75rem', marginTop: '1rem',
            }}
          >
            {[
              { icon: '🏆', label: 'Personal Best', value: pbValue !== null ? `${pbValue}ms` : '—', color: THEME.cyan },
              { icon: '📊', label: 'Avg (Last 10)', value: avgValue !== null ? `${avgValue}ms` : '—', color: THEME.green },
              { icon: '🏎️', label: 'Total Races', value: String(history.length), color: THEME.textLight },
              { icon: '⚡', label: 'False Starts', value: String(falseStarts), color: THEME.orange },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  background: THEME.cardBg, border: `1px solid ${THEME.border}`,
                  borderRadius: '12px',
                  padding: 'clamp(0.75rem,2vw,1rem) clamp(0.9rem,2.5vw,1.2rem)',
                  display: 'flex', flexDirection: 'column', gap: '.75rem',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: '#1e293b', border: `1px solid ${THEME.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: THEME.textMuted, marginBottom: '2px' }}>
                    {stat.label}
                  </div>
                  <div
                    aria-label={`${stat.label}: ${stat.value}`}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 'clamp(1.2rem,4vw,1.8rem)', fontWeight: 700,
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Achievements + History ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '.75rem', marginTop: '.75rem',
          }}
        >
          <section
            aria-label="Achievements"
            style={{
              background: THEME.cardBg, border: `1px solid ${THEME.border}`,
              borderRadius: '12px', padding: 'clamp(1rem,3vw,1.25rem)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '.85rem', fontWeight: 700,
                letterSpacing: '2px', textTransform: 'uppercase',
                color: THEME.cyan, margin: '0 0 1rem 0',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <span aria-hidden="true" style={{ fontSize: '16px' }}>🏅</span>
              Achievements
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {unlockedAchievements.map((achv) => {
                const isGold = achv.unlocked && (achv.id === 'a5' || achv.id === 'a8');
                return (
                  <div
                    key={achv.id}
                    role="status"
                    aria-label={`${achv.label} — ${achv.unlocked ? 'unlocked' : 'locked'}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px', minHeight: '32px',
                      borderRadius: '8px', fontSize: '.7rem',
                      fontWeight: 700, letterSpacing: '.5px',
                      textTransform: 'uppercase', transition: 'all .2s',
                      border: `1px solid ${isGold ? 'rgba(255,122,0,.3)' : achv.unlocked ? THEME.border : '#1e293b'}`,
                      backgroundColor: isGold ? 'rgba(255,122,0,.1)' : achv.unlocked ? '#1e293b' : 'transparent',
                      color: isGold ? THEME.orange : achv.unlocked ? '#fff' : '#334155',
                      opacity: achv.unlocked ? 1 : 0.3,
                    }}
                  >
                    <span aria-hidden="true">{achv.icon}</span>
                    {achv.label}
                  </div>
                );
              })}
            </div>
          </section>

          <section
            aria-label="Recent race history"
            style={{
              background: THEME.cardBg, border: `1px solid ${THEME.border}`,
              borderRadius: '12px', padding: 'clamp(1rem,3vw,1.25rem)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '.85rem', fontWeight: 700,
                letterSpacing: '2px', textTransform: 'uppercase',
                color: THEME.green, margin: '0 0 1rem 0',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <span aria-hidden="true" style={{ fontSize: '16px' }}>📈</span>
              Recent History
            </h2>

            {history.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: THEME.textMuted, fontSize: '.85rem', margin: 0 }}>
                Complete a race to see history.
              </p>
            ) : (
              <>
                <div
                  aria-hidden="true"
                  style={{
                    height: '60px', display: 'flex',
                    alignItems: 'flex-end', gap: '4px',
                    marginBottom: '.75rem', padding: '0 2px',
                  }}
                >
                  {recentReverse.map((h) => {
                    const heightPct = 20 + ((h.time - minTime) / timeRange) * 80;
                    return (
                      <div
                        key={h.id}
                        title={`${h.time}ms`}
                        style={{
                          flex: 1, borderRadius: '3px 3px 0 0',
                          minHeight: '4px', height: `${heightPct}%`,
                          backgroundColor: getBarColor(h.time), opacity: 0.85,
                        }}
                      />
                    );
                  })}
                </div>

                <div className="history-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', maxHeight: '170px' }}>
                  {history.slice(0, MAX_HISTORY_DISPLAY).map((h, i) => {
                    const rating = getRating(h.time);
                    const isPB = h.time === arrayMin(history.map((x) => x.time));
                    return (
                      <div
                        key={h.id}
                        style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: '8px',
                          backgroundColor: '#0c111a',
                          border: `1px solid ${THEME.border}`, gap: '8px',
                        }}
                      >
                        <span style={{ fontSize: '.7rem', color: THEME.textMuted, fontFamily: "'JetBrains Mono', monospace", width: '28px', flexShrink: 0 }}>
                          #{history.length - i}
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 700, color: rating.color, flexShrink: 0 }}>
                          {h.time}ms{isPB ? ' ★' : ''}
                        </span>
                        <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: THEME.textMuted, backgroundColor: THEME.cardBg, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${THEME.border}`, flexShrink: 0 }}>
                          {h.mode}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        {/* ── MORE TOOLS GRID ── */}
        <section aria-label="More Tools" style={{ marginBottom: '3.5rem', marginTop: '1rem' }}>
          <h2 style={{
            fontWeight: 800, fontSize: '1.5rem', color: '#fff',
            marginBottom: '1.5rem', textAlign: 'center',
            letterSpacing: '-0.3px',
          }}>More Tools</h2>
          <div
            className="cps-games-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '1rem',
            }}
          >
            {MORE_TOOLS.map(({ label, href, icon }) => (
              <a
                key={href}
                href={href}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '0.6rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '1.2rem 0.5rem',
                  cursor: 'pointer', textDecoration: 'none',
                  color: 'var(--neon-cyan)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,245,255,0.07)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,245,255,0.3)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--neon-cyan)',
                }}>
                  {icon}
                </div>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3,
                }}>{label}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ── SEO Article ── */}
        <article
          style={{
            marginTop: '4rem', borderTop: `1px solid ${THEME.border}`,
            paddingTop: '2.5rem', lineHeight: '1.7',
          }}
        >
          <p style={{ fontSize: 'clamp(0.9rem,2vw,1rem)', color: '#94a3b8', marginBottom: '1.5rem' }}>
            In high-stakes competitive esports and real-life motorsports, victory is decided in fractions of a
            millisecond. Whether you are aiming to land a precision headshot in an FPS title or execute the
            perfect grid launch in Formula 1, your <strong>reaction time</strong> is the ultimate baseline.
            Our professional <strong>F1 Reaction Time Test</strong> — popularly known as the{' '}
            <em>F1 Lights Out Test</em> — faithfully replicates the official FIA Grand Prix starting-light
            sequence to help casual gamers, pro esports players and enthusiasts measure, optimize, and
            dominate their split-second cognitive response. This guide walks through exactly how the test
            works, what the science says about human reaction speed, how the real Formula 1 start procedure
            inspired this simulator, and a complete framework for training and tracking your improvement
            over time.
          </p>

          <h2 style={h2Style}>How to Use the F1 Reaction Time Test</h2>
          <ol style={listStyle}>
            <li><strong>Choose your difficulty</strong> — Rookie gives more time; F1 Elite pushes you to the limit with longer, more unpredictable delays.</li>
            <li><strong>Press Start Engine</strong> (or tap the arena / press SPACE).</li>
            <li><strong>Watch the five red lights</strong> illuminate one by one.</li>
            <li><strong>React the instant all lights go out</strong> — tap, click, or press SPACE.</li>
            <li><strong>Read your result</strong>, compare with your personal best, and share with friends.</li>
          </ol>
          <p style={bodyText}>
            Tapping before the lights go out registers a <em>Jump Start</em> (false start), just like in real
            Formula 1. The randomized delay after the fifth light prevents pattern learning, keeping every
            run genuinely challenging. Each completed attempt is timestamped, checksummed, and stored locally
            so your history, personal best, and false-start count all persist between sessions on the same
            device and browser.
          </p>

          <h2 style={h2Style}>Keyboard Shortcuts</h2>
          <ul style={{ ...listStyle, listStyleType: 'none', paddingLeft: 0 }}>
            {[
              ['SPACE / ENTER', 'React / Start'],
              ['R', 'Restart immediately'],
              ['S', 'Toggle sound on / off'],
            ].map(([key, desc]) => (
              <li key={key}>
                <kbd style={{ backgroundColor: '#1e293b', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${THEME.border}`, fontSize: '0.85em' }}>{key}</kbd>
                {' — '}{desc}
              </li>
            ))}
          </ul>

          <h2 style={h2Style}>How the Real Formula 1 Start Lights Work</h2>
          <p style={bodyText}>
            The five-light gantry used in this simulator is not an arbitrary design choice — it is a faithful
            recreation of the official FIA Formula 1 race-start procedure. On an actual grid, five pairs of
            red lights illuminate one column at a time, roughly one second apart, building tension across the
            entire starting field. Once all five columns are lit, the lights hold for a period that is
            deliberately randomized, typically between roughly one and a bit over four and a half seconds,
            before extinguishing simultaneously. The randomization is the entire point: it exists specifically
            to prevent drivers from anticipating the exact moment of release and jumping the start.
          </p>
          <p style={bodyText}>
            A driver who moves before the lights go out commits a jump start, which is detected by sensors in
            the car and grid position and results in a time penalty or drive-through penalty depending on the
            severity. This simulator mirrors that exact philosophy: the five-light sequence, the randomized
            hold, and the strict false-start penalty are not cosmetic choices, they are the mechanism that
            makes the test a genuine measurement of reaction rather than pattern memorization or rhythmic
            guessing.
          </p>

          <h2 style={h2Style}>The Science Behind Reaction Time</h2>
          <p style={bodyText}>
            Reaction time is a measurable cognitive-motor process that begins the instant a stimulus is
            detected by your sensory system and ends when your muscles execute a response. For a simple
            visual reaction test like this one, the pathway runs from your retina, through the optic nerve,
            into the visual cortex for initial processing, then to decision-related regions of the brain that
            confirm "this is the signal to act," and finally down through the motor cortex and spinal cord to
            the muscles in your hand or finger. Every one of those handoffs takes time, and the sum of all of
            them is what you see displayed on screen in milliseconds.
          </p>
          <p style={bodyText}>
            Researchers typically distinguish between several categories of reaction time. <strong>Simple
            reaction time</strong> measures the response to a single, expected stimulus — exactly what this
            F1 test measures, since there is only one action to take (react) and only one signal to watch for
            (lights out). <strong>Choice reaction time</strong> is slower because it requires the brain to
            first identify which of several possible stimuli appeared and then select the correct
            corresponding response, adding an extra decision-making stage. <strong>Go/no-go reaction time</strong>
            sits in between, requiring the participant to respond to one type of stimulus while withholding a
            response to another, which trains impulse control alongside raw speed. Understanding which
            category a test falls into matters because comparing a simple reaction score directly against a
            choice reaction score is not an apples-to-apples comparison.
          </p>
          <p style={bodyText}>
            It is also worth understanding why a result under roughly 100 milliseconds is treated as invalid
            rather than impressive. Human visual processing alone consumes a meaningful chunk of time before a
            decision can even be made, so results that fast are almost always the product of anticipating the
            timing of the lights rather than genuinely reacting to them — essentially a well-timed guess. The
            test enforces a minimum threshold specifically to filter out these anticipatory taps and keep the
            leaderboard reflective of authentic reaction speed.
          </p>

          <h2 style={h2Style}>What Is a Good Reaction Time?</h2>
          <p style={bodyText}>
            The average human simple visual reaction time is approximately <strong>250 ms</strong>. Trained
            esports athletes and motorsport professionals consistently achieve <strong>150–200 ms</strong>
            through deliberate practice and optimized hardware. Sub-150 ms results are exceptionally rare
            and place you in genuine F1-driver territory.
          </p>
          <p style={bodyText}>
            Many players believe that scaling up scores on a <strong>CPS Test (Clicks Per Second)</strong> is
            purely about finger-muscle speed. In reality, clicking velocity is tethered to neuromuscular
            response latency — the precise window between your brain registering a visual trigger and your
            finger completing the motion. Reducing that window can help your click bursts start sooner.
          </p>
          <p style={bodyText}>
            It is worth noting that reaction time is not a fixed number — it fluctuates from moment to moment
            based on alertness, attention, and even the specific muscle group used to respond. A study
            participant reacting with a foot pedal will typically register slower times than the same person
            reacting with a finger tap, simply because the neural pathway to a finger is shorter and more
            frequently exercised. This is one reason the test standardizes on a simple tap or click as the
            response method — it keeps every attempt, and every comparison between players, consistent.
          </p>

          <h2 style={h2Style}>Reaction Time Across Age Groups</h2>
          <p style={bodyText}>
            Reaction speed is not static across a lifetime. Children generally show slower reaction times than
            adults because the neural pathways involved are still developing and myelination — the
            insulating layer that speeds up nerve signal transmission — is incomplete. Reaction speed
            typically sharpens through adolescence and reaches its peak in the late teens to mid-twenties,
            when nerve conduction is fastest and motor coordination is most refined. From there, reaction
            time tends to slow gradually, often by only a handful of milliseconds per decade, though the rate
            of decline can be meaningfully slowed by staying physically active, mentally engaged, and
            avoiding prolonged sedentary periods.
          </p>

          <h2 style={h2Style}>Reaction Time Score Chart</h2>
          <p style={{ ...bodyText, marginBottom: '1rem' }}>
            Use this table to benchmark your result against competitive tiers:
          </p>

          <div
            className="table-scroll"
            style={{ width: '100%', maxWidth: '100%', marginBottom: '1.5rem', border: `1px solid ${THEME.border}`, borderRadius: '10px' }}
          >
            <table
              style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'clamp(0.8rem,2vw,0.95rem)', minWidth: '480px' }}
              aria-label="Reaction time score benchmarks"
            >
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: '#fff' }}>
                  <th style={thStyle}>Reaction Time</th>
                  <th style={thStyle}>Rating</th>
                  <th style={thStyle}>Real-World Equivalent</th>
                </tr>
              </thead>
              <tbody>
                {SCORE_CHART_ROWS.map((row, i) => (
                  <tr key={row.rating} style={{ backgroundColor: i % 2 !== 0 ? 'rgba(25,30,45,0.4)' : 'transparent' }}>
                    <td style={{ ...tdStyle, borderBottom: i < SCORE_CHART_ROWS.length - 1 ? `1px solid ${THEME.border}` : 'none', color: row.color, fontWeight: 'bold' }}>{row.range}</td>
                    <td style={{ ...tdStyle, borderBottom: i < SCORE_CHART_ROWS.length - 1 ? `1px solid ${THEME.border}` : 'none' }}>{row.rating}</td>
                    <td style={{ ...tdStyle, borderBottom: i < SCORE_CHART_ROWS.length - 1 ? `1px solid ${THEME.border}` : 'none' }}>{row.equivalent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={h2Style}>How to Improve Your Reaction Time</h2>
          <p style={{ ...bodyText, marginBottom: '1rem' }}>
            Consistent, targeted training is the most reliable path to shaving milliseconds off your score:
          </p>
          <ul style={listStyle}>
            <li><strong>Daily short sessions:</strong> Ten focused runs per day builds neural pathways more effectively than occasional marathon sessions.</li>
            <li><strong>Optimize hardware:</strong> A monitor with 1 ms response time and 144 Hz+ refresh rate, paired with a high-polling-rate mouse (1000 Hz+), minimizes system-introduced latency.</li>
            <li><strong>Physical readiness:</strong> Stay hydrated, warm your fingers before testing, and avoid testing when fatigued — reaction time degrades measurably with both.</li>
            <li><strong>Eliminate distractions:</strong> Background noise, notifications, and divided attention all increase processing delay by tens of milliseconds.</li>
            <li><strong>Escalate difficulty gradually:</strong> Start on Rookie mode, then progress through Pro and F1 Elite as your baseline improves.</li>
          </ul>

          <h2 style={h2Style}>A Simple Four-Week Training Framework</h2>
          <p style={bodyText}>
            Structured, progressive practice tends to outperform random, unstructured testing. In the first
            week, focus purely on establishing a stable baseline on Rookie mode — run ten attempts per day and
            resist the urge to chase a single lucky result, since the goal at this stage is consistency rather
            than a personal best. In the second week, move to Pro mode and pay close attention to your false
            start count; if it rises noticeably, that is a signal you are anticipating rather than reacting,
            and you should consciously slow down your intent to respond until the lights actually go out. By
            the third week, most users can comfortably alternate between Pro and F1 Elite, using the harder
            mode specifically to sharpen patience against a longer, more unpredictable delay window. In the
            final week, aim for quality over quantity: five to eight highly focused attempts per session,
            each treated like a real competitive round, tend to produce more durable improvement than a large
            volume of half-attentive taps.
          </p>

          <h2 style={h2Style}>Avoiding False Starts</h2>
          <p style={bodyText}>
            Advanced clicking techniques such as Jitter Clicking or Butterfly Clicking require precise rhythm
            control. The strict Jump Start penalty system in this simulator conditions you to wait for the
            correct visual stimulus rather than anticipating it — a skill directly transferable to competitive
            gameplay where premature inputs result in cooldown or action cancellation.
          </p>
          <p style={bodyText}>
            A useful mental model borrowed from real motorsport is to treat the wait after the fifth light as
            a countdown with no fixed length rather than a countdown you can predict. Drivers who consistently
            avoid jump starts describe holding a relaxed, ready posture rather than a tensed, anticipatory
            one — tension and anticipation are precisely what cause the nervous system to fire a motor command
            before the visual stimulus has actually been processed. Practicing a calm, neutral starting
            position before each attempt can measurably reduce your false-start rate over time.
          </p>

          <h2 style={h2Style}>Equipment and Hardware Considerations</h2>
          <p style={bodyText}>
            While reaction time is fundamentally a biological process, the hardware chain between the screen
            and your recorded result introduces its own latency, and that latency is additive to your true
            biological response. A standard 60 Hz monitor only refreshes the displayed image sixty times per
            second, which means the visual stimulus can sit undisplayed for up to roughly sixteen milliseconds
            before you even have a chance to perceive it. Moving to a 144 Hz or 240 Hz panel shrinks that
            window considerably, which is part of why competitive gamers overwhelmingly favor high-refresh
            displays.
          </p>
          <p style={bodyText}>
            Input devices matter too. Wireless peripherals, particularly budget models using older
            connection protocols, can introduce a small but measurable polling delay compared to a wired
            connection or a modern high-polling-rate wireless receiver. Mouse polling rate, specifically,
            determines how frequently your input device reports its state to the computer; a 1000 Hz mouse
            reports a thousand times per second, versus the older 125 Hz standard which reports only eight
            times as often less. None of this changes your underlying neurological reaction speed, but it
            does affect the number that ultimately appears on screen, which is why serious competitors treat
            hardware optimization as a legitimate part of reaction training.
          </p>
          <p style={bodyText}>
            On mobile devices, touchscreen digitizers themselves introduce a small amount of processing
            overhead compared to a physical mouse click, and this can vary meaningfully between manufacturers
            and even between browser engines on the same device. If you are comparing scores across desktop
            and mobile, keep in mind that the two platforms are not perfectly equivalent measurement
            environments.
          </p>

          <h2 style={h2Style}>Lifestyle Factors That Influence Reaction Speed</h2>
          <p style={bodyText}>
            Reaction time is sensitive to your physiological state in the moment you take the test, which is
            part of why a single result should never be treated as a definitive measurement of your ability.
            Sleep deprivation is one of the most well documented degraders of reaction speed; even a single
            night of significantly reduced sleep can slow simple reaction time by a noticeable margin,
            comparable in some studies to the impairment associated with mild alcohol intoxication. Chronic
            sleep debt compounds this effect over time.
          </p>
          <p style={bodyText}>
            Hydration status plays a similar, if smaller, role — even mild dehydration has been associated
            with reduced alertness and slower cognitive processing speed. Moderate caffeine intake, on the
            other hand, is one of the few substances with reasonably consistent evidence for a short-term
            improvement in simple reaction time, largely due to its effect on alertness and arousal, though
            excessive intake can introduce jitteriness that works against fine motor precision.
          </p>
          <p style={bodyText}>
            Physical warm-up also matters more than most people expect. Cold hands and stiff fingers have
            measurably slower fine motor response than warmed-up ones, which is why many competitive gamers
            perform a brief hand-stretching or warm-up routine before high-stakes matches. Mental warm-up
            follows a similar principle: your first few attempts in any session are typically slower than
            attempts five or six, simply because attention and readiness sharpen with repetition.
          </p>

          <h2 style={h2Style}>Common Myths About Reaction Time</h2>
          <p style={{ ...bodyText, marginBottom: '1rem' }}>
            A few persistent misconceptions are worth addressing directly:
          </p>
          <ul style={listStyle}>
            <li><strong>"Reaction time can be trained down to near zero."</strong> Human neural transmission has hard physiological limits; results consistently below roughly 100 ms are virtually always the product of anticipation rather than genuine improvement.</li>
            <li><strong>"A faster mouse alone will fix a slow reaction time."</strong> Hardware reduces system-introduced latency, but it cannot substitute for the underlying neurological response — both factors matter, but they are not interchangeable.</li>
            <li><strong>"Reaction time is fixed at birth and cannot improve."</strong> While there is a genetic component, deliberate practice, better sleep, and improved focus have all been shown to produce measurable, if modest, improvements over time.</li>
            <li><strong>"One great score proves elite skill."</strong> A single fast result is often influenced by luck, mild anticipation, or a favorable random delay; a stable average across many attempts is a far more reliable indicator.</li>
            <li><strong>"Reaction time and hand-eye coordination are the same thing."</strong> Reaction time measures how quickly you detect and respond to a stimulus, while hand-eye coordination also involves spatial accuracy and continuous tracking — related but distinct skills.</li>
          </ul>

          <h2 style={h2Style}>Why This Test Helps Gamers</h2>
          <p style={{ ...bodyText, marginBottom: '1rem' }}>
            Integrating consistent F1 reaction training accelerates performance across multiple competitive disciplines:
          </p>
          <ul style={listStyle}>
            <li><strong>FPS titles (CS2, Valorant, Apex):</strong> Lower reaction time translates directly to faster first-shot execution and reduced time-to-kill.</li>
            <li><strong>Fighting games:</strong> Frame-precise punish windows demand sub-200 ms response to capitalize on opponent recovery gaps.</li>
            <li><strong>Battle Royale:</strong> Faster looting, quicker weapon swaps, and earlier aiming decisions all compound reaction-speed advantages.</li>
            <li><strong>CPS benchmarks:</strong> Optimizing click latency can help produce cleaner bursts at the start of a high-speed click counter.</li>
            <li><strong>Racing simulators (iRacing, F1 24):</strong> Consistent, well-timed throttle and brake inputs — skills this test directly trains.</li>
            <li><strong>MOBA titles (League of Legends, Dota 2):</strong> Faster reflexes improve last-hitting precision and reaction to sudden ability combos in team fights.</li>
            <li><strong>Rhythm and music games:</strong> While rhythm games rely more on timing prediction than raw reaction, a lower baseline reaction time still improves recovery from unexpected pattern breaks.</li>
          </ul>

          <h2 style={h2Style}>Shifting Into Elite Pro Tiers</h2>
          <p style={bodyText}>
            While the global median reaction time sits around 250 ms, elite esports professionals and actual
            F1 grid drivers operate closer to the sub-150 ms mark. Regular structured training actively
            conditions your neural pathways to narrow that window — tracked visibly in your personal history
            panel above.
          </p>
          <p style={bodyText}>
            It is worth setting realistic expectations about the shape of this improvement curve. Most users
            see their fastest gains in the first one to two weeks of consistent practice, as they learn the
            test's rhythm, adjust their posture and grip, and eliminate obvious anticipation errors. Gains
            beyond that point tend to be smaller and more gradual, often just five to fifteen milliseconds
            over subsequent weeks, because at that stage you are no longer eliminating avoidable mistakes but
            genuinely pushing against your underlying neurological response ceiling. This is entirely normal
            and mirrors the improvement curves seen in professional athlete training data.
          </p>

          <h2 style={h2Style}>The History of Reaction Time Research</h2>
          <p style={bodyText}>
            Formal measurement of human reaction time dates back to nineteenth-century experimental
            psychology, when researchers first used simple mechanical apparatuses to time how quickly a
            person could respond to a light or sound. Those early studies established the roughly 200 to
            250 millisecond baseline that modern digital tests, including this one, still consistently
            reproduce today. What has changed is precision and accessibility — a task that once required a
            physical laboratory and specialized timing equipment can now be measured in a browser using
            high-resolution timing APIs accurate to a fraction of a millisecond.
          </p>

          <h2 style={h2Style}>Simple vs Choice Reaction Time Explained</h2>
          <p style={bodyText}>
            It bears repeating because it is so often misunderstood in online discussion: a simple reaction
            time test, like this one, only ever asks one question — has the stimulus appeared, yes or no.
            A choice reaction time test asks a harder question first — which stimulus appeared, and which of
            several possible responses does it call for. Because the brain must complete an extra
            identification and selection step, choice reaction times are reliably slower, often by fifty
            milliseconds or more, than simple reaction times measured in the same person under the same
            conditions. Comparing your F1 test result to a choice-based test score, such as certain esports
            aim-training drills, will always look faster because the two tools are measuring different things.
          </p>

          <h2 style={h2Style}>Reaction Time in Professional Esports</h2>
          <p style={bodyText}>
            Top-tier esports organizations increasingly treat reaction time as a trainable athletic attribute
            rather than a fixed trait, incorporating regular simple and choice reaction drills into practice
            regimens alongside traditional in-game scrims. Publicly reported reaction benchmarks from
            professional first-person-shooter players frequently fall in the 150 to 200 millisecond range,
            reinforcing the idea that the gap between an average player and a professional is measured in
            tens of milliseconds, not hundreds — small margins that disciplined, repeated practice can close.
          </p>

          <h2 style={h2Style}>Reaction Time in Motorsport Beyond Formula 1</h2>
          <p style={bodyText}>
            The lights-out start format popularized by Formula 1 has been adopted, in one form or another, by
            most major motorsport series, including endurance racing and various single-seater feeder
            categories, precisely because it has proven to be the most reliable way to standardize a fair,
            simultaneous start across a wide field of competitors. Drag racing uses a related but distinct
            system — a vertical "Christmas tree" of staged lights — which similarly punishes early movement
            with a red-light disqualification, underscoring how central controlled, randomized-delay starts
            are across the wider world of competitive racing.
          </p>

          <h2 style={h2Style}>Glossary of Key Terms</h2>
          <ul style={listStyle}>
            <li><strong>Simple reaction time:</strong> The interval between a single expected stimulus and a single corresponding response, which is what this test measures.</li>
            <li><strong>Choice reaction time:</strong> The interval when a participant must first identify which of multiple stimuli appeared before selecting the correct response.</li>
            <li><strong>Jump start / false start:</strong> Responding before the actual stimulus appears, resulting in an invalidated attempt and a penalty.</li>
            <li><strong>Personal best (PB):</strong> The single fastest valid reaction time recorded across all of a user's saved attempts.</li>
            <li><strong>Input latency:</strong> The delay introduced by hardware — displays, peripherals, and connection type — between an event occurring and it being registered or displayed.</li>
            <li><strong>Neuromuscular response:</strong> The chain of nerve signals traveling from the brain's motor cortex to the muscles responsible for executing a physical action.</li>
          </ul>

          <h2 style={h2Style}>How Your Results Are Stored and Verified</h2>
          <p style={bodyText}>
            Every attempt you complete is saved directly in your browser's local storage rather than on a
            remote server, which means your history, personal best, and false-start count remain private to
            your own device and are never transmitted anywhere. Each saved entry is tagged with a lightweight
            integrity checksum derived from the recorded time, the selected mode, and the timestamp, which
            allows the application to detect and silently discard any entry that has been corrupted or
            manually tampered with through browser developer tools. This keeps your personal best meaningful
            as a record of genuine attempts rather than an editable number.
          </p>
          <p style={bodyText}>
            Because the data lives in local storage, clearing your browser's site data, switching to a
            private or incognito window, or moving to a different device or browser will all reset your
            saved history back to zero. If you want to preserve a long-term record of your progress, it is
            worth periodically using the share feature to export a snapshot of your best times before
            clearing browser data or switching setups.
          </p>

          <h2 style={h2Style}>Comparing This Test to Other Reaction Tools</h2>
          <p style={bodyText}>
            Generic reaction-time testers typically use a single, unstructured event, such as a screen
            switching from red to green at a random moment, with no build-up phase at all. That approach
            measures the same underlying biological quantity, but it lacks the anticipation-management
            challenge that the five-light gantry introduces. Because Formula 1's actual start procedure was
            specifically engineered over decades to prevent professional drivers — some of the most trained
            reflexes on the planet — from jumping the start, the lights-out format is widely regarded as a
            more rigorous and more engaging test of genuine reaction discipline than a simple color-swap
            tool.
          </p>
          <p style={bodyText}>
            Other tools, such as aim trainers used by first-person shooter players, combine reaction time
            with spatial precision and tracking accuracy, producing a composite score rather than an isolated
            reaction measurement. If your goal is specifically to understand and train your raw
            stimulus-to-response speed in isolation, a dedicated simple reaction time format like this one is
            the more precise instrument; if your goal is broader aim and tracking skill, a combined aim
            trainer is a better complement to use alongside it.
          </p>

          <h2 style={h2Style}>Mobile vs Desktop Testing Differences</h2>
          <p style={bodyText}>
            Desktop testing with a mouse or keyboard tends to produce marginally more consistent results
            because physical buttons offer immediate, tactile confirmation of input and are processed through
            a mature, well-optimized input pipeline in most browsers. Touchscreens introduce a digitizer
            sampling step that can add a small amount of variable latency, and results can differ slightly
            between browsers even on the same physical device. Neither platform is "wrong" — they simply
            measure the same underlying reaction speed through a slightly different technical pathway, so
            it's most meaningful to track your personal trend on a single platform rather than directly
            comparing a desktop score to a mobile one.
          </p>

          <h2 style={h2Style}>Understanding Your Stats Dashboard</h2>
          <p style={bodyText}>
            The statistics panel above the fold surfaces four figures that matter most for tracking genuine
            improvement: your all-time personal best, your rolling average across the last ten completed
            attempts, your total race count, and your cumulative false-start count. The rolling average is
            usually the more informative number day to day, since a single personal best can be influenced
            by a lucky random delay, while an average smooths out that noise and reflects your true current
            skill level more accurately.
          </p>

          <h2 style={h2Style}>How Achievements Work</h2>
          <p style={bodyText}>
            Achievement badges unlock automatically as your saved history meets specific milestones, ranging
            from completing your very first race to crossing speed thresholds like sub-200ms, sub-150ms, and
            volume milestones such as ten, fifty, or one hundred completed attempts. These badges are
            calculated live from your locally stored history each time you load the page, so they will
            re-lock if your browser data is ever cleared, but they provide a lightweight way to gamify
            consistent practice rather than chasing a single standout score.
          </p>

          <h2 style={h2Style}>Why Sound and Vibration Feedback Matter</h2>
          <p style={bodyText}>
            Each illuminating light plays a short audio cue, and a personal-best result triggers a distinct
            ascending tone alongside a confetti animation, while supported mobile devices also receive haptic
            vibration feedback at key moments. Multisensory feedback — engaging hearing and touch alongside
            vision — has been shown in reaction research to sometimes produce marginally faster responses
            than a purely visual stimulus alone, because the brain can integrate signals from multiple senses
            simultaneously. If you want the purest possible visual-only measurement, the mute toggle lets you
            disable audio cues entirely while keeping the visual sequence unchanged.
          </p>

          <h2 style={h2Style}>Setting Realistic Improvement Goals</h2>
          <p style={bodyText}>
            Rather than fixating on a single dramatic target like breaking 150 milliseconds immediately, it is
            more productive to set incremental goals tied to your rolling average — for example, aiming to
            lower your ten-run average by ten to twenty milliseconds over two weeks of consistent practice.
            Incremental, average-based goals are far more achievable and far more reflective of genuine skill
            growth than chasing a single best-case outlier result.
          </p>

          <h2 style={h2Style}>Tracking Long-Term Progress</h2>
          <p style={bodyText}>
            The recent-history bar chart and scrollable log beneath your statistics give you a rolling visual
            record of your last several attempts, color-coded by performance tier, making it easy to spot
            whether your recent runs are trending faster, slower, or holding steady. Reviewing this chart
            before and after a training session, rather than judging performance from any single tap, is the
            most reliable way to confirm that a practice routine is actually working.
          </p>

          <h2 style={h2Style}>Sharing Your Score and Competing With Friends</h2>
          <p style={bodyText}>
            The share button generates a formatted summary of your latest result and rating, which can be
            sent directly through your device's native share sheet or copied to your clipboard if sharing is
            unavailable. Friendly competition is one of the most effective and enjoyable ways to stay
            consistent with practice — challenging a friend or teammate to beat your personal best adds
            social accountability that a solo leaderboard cannot replicate.
          </p>

          <h2 style={h2Style}>Final Thoughts on Mastering the Lights-Out Start</h2>
          <p style={bodyText}>
            Reaction time will always carry an element of natural variation from run to run, but the gap
            between an average result and an elite one is smaller, and more trainable, than most people
            assume. Consistent short practice sessions, sensible hardware choices, healthy sleep and
            hydration habits, and an honest focus on your rolling average rather than a single lucky attempt
            are, together, the most reliable formula for genuinely lowering your numbers over time — on this
            simulator and in the competitive pursuits it is designed to sharpen you for.
          </p>

          <h2 style={h2Style}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {FAQ_ITEMS.map((faq, index) => (
              <div
                key={index}
                style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}`, borderRadius: '8px', overflow: 'hidden' }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                  style={{
                    width: '100%',
                    padding: 'clamp(12px,3vw,14px) clamp(14px,4vw,20px)',
                    backgroundColor: 'transparent', border: 'none',
                    color: '#fff', textAlign: 'left',
                    fontWeight: 600, fontSize: 'clamp(0.88rem,2vw,1rem)',
                    cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: '12px', minHeight: `${MIN_BUTTON_SIZE}px`, lineHeight: 1.4,
                    touchAction: 'manipulation',
                  }}
                >
                  <span>{faq.q}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      color: THEME.cyan, flexShrink: 0, fontSize: '0.75rem',
                      transition: 'transform 0.2s',
                      transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}
                  >
                    ▼
                  </span>
                </button>
                {openFaq === index && (
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    style={{
                      padding: `10px clamp(14px,4vw,20px) clamp(12px,3vw,14px)`,
                      color: '#94a3b8',
                      fontSize: 'clamp(0.85rem,2vw,0.92rem)',
                      borderTop: `1px solid ${THEME.border}`,
                      lineHeight: 1.65,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

// ─── Shared style objects ─────────────────────────────────────────────────────

const h2Style: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 'clamp(1.4rem, 4vw, 2rem)',
  fontWeight: 800, color: '#fff',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  margin: '2.5rem 0 1rem 0',
};

const bodyText: React.CSSProperties = {
  fontSize: 'clamp(0.9rem, 2vw, 0.98rem)',
  color: '#94a3b8', marginBottom: '1.25rem',
};

const listStyle: React.CSSProperties = {
  color: '#94a3b8', paddingLeft: '1.5rem',
  marginBottom: '1.5rem', display: 'flex',
  flexDirection: 'column', gap: '0.5rem',
  fontSize: 'clamp(0.9rem, 2vw, 0.98rem)',
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #1b2636',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
};
