// src/pages/KeyVisualizerPage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// HARDENED Key Visualizer — Tamper-proof, crash-proof, sound-locked
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState,
  useEffect,
  useCallback,
  useReducer,
  useMemo,
  useRef,
  memo,
  lazy,
  Suspense,
  Component,
  type ReactNode,
  type ErrorInfo,
  type CSSProperties,
} from 'react';

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
  { label: 'Sniper Mode', href: '/sniper-mode', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/><circle cx="12" cy="12" r="8" opacity=".4"/></svg> },
  { label: 'Mouse Accuracy', href: '/mouse-accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 2v10"/></svg> },
  { label: 'Key Visualizer', href: '/key-visualizer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"/></svg> },
  { label: 'F1 Reaction', href: '/f1-reaction', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { label: 'Space Defense', href: '/space-defense', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { label: 'Accuracy Test', href: '/accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { label: 'CPS Rush', href: '/cps-rush', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 12v-4"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Voyager Game', href: '/voyager-game', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },
];

export const ROBOTS_TXT_CONTENT = `User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
`;

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const MAX_HISTORY      = 20  as const;
const MAX_UNIQUE_KEYS  = 200 as const;
const READING_TIME_WPM = 200 as const;

const KEYBOARD_LAYOUT: ReadonlyArray<ReadonlyArray<string>> = Object.freeze([
  Object.freeze(['`','1','2','3','4','5','6','7','8','9','0','-','=','Backspace']),
  Object.freeze(['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\']),
  Object.freeze(['CapsLock','a','s','d','f','g','h','j','k','l',';',"'",'Enter']),
  Object.freeze(['Shift','z','x','c','v','b','n','m',',','.','/','Shift']),
  Object.freeze(['Ctrl','Win','Alt',' ','Alt','Ctrl']),
]);

const WIDE_KEYS: ReadonlySet<string> = Object.freeze(
  new Set(['Backspace','Tab','CapsLock','Enter','Shift','Ctrl','Win','Alt',' '])
) as ReadonlySet<string>;

const KEY_LABELS: Readonly<Record<string, string>> = Object.freeze({
  ' ':         'Space',
  'Backspace': '⌫',
  'Enter':     '↵',
  'Shift':     '⇧',
  'CapsLock':  'Caps',
  'Tab':       'Tab',
  'Ctrl':      'Ctrl',
  'Win':       '⊞',
  'Alt':       'Alt',
  '\\':        '\\',
});

const ARTICLE_WORD_COUNT = 1_450;
const READING_TIME_MIN   = Math.ceil(ARTICLE_WORD_COUNT / READING_TIME_WPM);

const TOC_SECTIONS: ReadonlyArray<Readonly<{ id: string; label: string }>> = Object.freeze([
  Object.freeze({ id: 'how-to-use',       label: 'How to Use the Key Visualizer'           }),
  Object.freeze({ id: 'features',         label: 'Features of This Keyboard Visualizer'    }),
  Object.freeze({ id: 'benefits-gamers',  label: 'Benefits for Gamers'                     }),
  Object.freeze({ id: 'benefits-typists', label: 'Benefits for Programmers and Typists'    }),
  Object.freeze({ id: 'common-problems',  label: 'Common Keyboard Problems You Can Detect' }),
  Object.freeze({ id: 'browser-compat',   label: 'Browser Compatibility'                   }),
  Object.freeze({ id: 'privacy',          label: 'Privacy'                                 }),
  Object.freeze({ id: 'conclusion',       label: 'Conclusion'                              }),
]);

const PAGE_META = Object.freeze({
  title:      'Key Visualizer — Real-Time Keyboard Key Display Tool',
  description:'Free online Key Visualizer: watch every keystroke light up in real time. Test keyboard ghosting, N-Key Rollover, key history, and usage stats — all locally in your browser.',
  canonical:  'https://yourdomain.com/key-visualizer',
  keywords:   'key visualizer, keyboard visualizer, keyboard tester, real-time key display, ghosting test, NKRO test, key press visualizer, typing tool, keyboard diagnostics',
  ogImage:    'https://yourdomain.com/og/key-visualizer.png',
  themeColor: '#00f5ff',
  author:     'YourSiteName',
  appName:    'Key Visualizer',
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface KeyHistory {
  readonly id:   number;
  readonly key:  string;
  readonly time: number;
}

interface KeyVisualizerState {
  readonly activeKeys: ReadonlySet<string>;
  readonly keyHistory: ReadonlyArray<KeyHistory>;
  readonly totalKeys:  number;
  readonly keyCount:   Readonly<Record<string, number>>;
}

type KeyVisualizerAction =
  | { type: 'KEY_DOWN';     payload: Readonly<{ raw: string; norm: string; id: number }> }
  | { type: 'KEY_UP';       payload: Readonly<{ norm: string }>                           }
  | { type: 'RESET' }
  | { type: 'RESET_ACTIVE' };

interface SoundSettings {
  readonly enabled: boolean;
  readonly volume:  number;
}

interface RepeatSettings {
  readonly blockRepeats: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const BROWSER_KEY_MAP: Readonly<Record<string, string>> = Object.freeze({
  'Control': 'Ctrl',
  'Meta':    'Win',
  'OS':      'Win',
});

function normalizeKey(key: unknown): string {
  try {
    if (typeof key !== 'string' || key.length === 0) return 'Unknown';
    if (key === ' ') return ' ';
    const remapped = BROWSER_KEY_MAP[key] ?? key;
    return remapped.toLowerCase();
  } catch {
    return 'Unknown';
  }
}

function safeLabel(key: string): string {
  try {
    if (!key || typeof key !== 'string') return '?';
    return KEY_LABELS[key] ?? key;
  } catch {
    return '?';
  }
}

function clamp(value: number, min: number, max: number): number {
  const v = Number(value);
  if (!isFinite(v)) return min;
  return Math.min(max, Math.max(min, v));
}

let _idCounter = 0;
function nextId(): number {
  try {
    _idCounter = (_idCounter + 1) % Number.MAX_SAFE_INTEGER;
    return _idCounter;
  } catch {
    return Math.floor(Math.random() * 1e9);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SOUND ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const _soundEngine = (() => {
  let _enabled: boolean = false;
  let _volume:  number  = 0.4;
  let _ctx:     AudioContext | null = null;
  let _initialised = false;

  function _getCtx(): AudioContext | null {
    try {
      if (_ctx && _ctx.state !== 'closed') return _ctx;
      const w = window as unknown as {
        AudioContext?:       typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const Ctor = w.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return null;
      _ctx = new Ctor();
      return _ctx;
    } catch {
      return null;
    }
  }

  const engine = {
    init(): void {
      if (_initialised) return;
      try { _getCtx(); _initialised = true; } catch { /* silent */ }
    },
    setVolume(v: number): void {
      try {
        const safe = isFinite(Number(v)) ? clamp(Number(v), 0, 1) : 0.4;
        _volume = safe;
      } catch { /* silent */ }
    },
    setEnabled(v: boolean): void {
      try { _enabled = Boolean(v); } catch { /* silent */ }
    },
    playClick(): void {
      try {
        if (!_enabled) return;
        const ctx = _getCtx();
        if (!ctx) return;
        if (ctx.state === 'suspended') { ctx.resume().catch(() => { /* silent */ }); }
        const now   = ctx.currentTime;
        const osc   = ctx.createOscillator();
        const gain  = ctx.createGain();
        const vol   = clamp(_volume, 0, 1);
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
        gain.gain.setValueAtTime(vol * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch { /* silent */ } };
      } catch { /* silent */ }
    },
  };

  return Object.freeze(engine);
})();

// ─────────────────────────────────────────────────────────────────────────────
// SEO META INJECTION HOOK
// ─────────────────────────────────────────────────────────────────────────────

function useDocumentMeta() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let prevTitle = '';
    try { prevTitle = document.title; } catch { /* ignore */ }
    try { document.title = PAGE_META.title; } catch { /* ignore */ }

    type MetaEntry = { selector: string; attrs: Record<string, string> };
    const metas: MetaEntry[] = [
      { selector: 'meta[name="description"]',         attrs: { name: 'description',          content: PAGE_META.description              } },
      { selector: 'meta[name="keywords"]',            attrs: { name: 'keywords',             content: PAGE_META.keywords                 } },
      { selector: 'meta[name="author"]',              attrs: { name: 'author',               content: PAGE_META.author                   } },
      { selector: 'meta[name="application-name"]',    attrs: { name: 'application-name',     content: PAGE_META.appName                  } },
      { selector: 'meta[name="theme-color"]',         attrs: { name: 'theme-color',          content: PAGE_META.themeColor               } },
      { selector: 'meta[name="robots"]',              attrs: { name: 'robots',               content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' } },
      { selector: 'meta[name="viewport"]',            attrs: { name: 'viewport',             content: 'width=device-width, initial-scale=1' } },
      { selector: 'meta[property="og:title"]',        attrs: { property: 'og:title',         content: PAGE_META.title                    } },
      { selector: 'meta[property="og:description"]',  attrs: { property: 'og:description',   content: PAGE_META.description              } },
      { selector: 'meta[property="og:type"]',         attrs: { property: 'og:type',          content: 'website'                          } },
      { selector: 'meta[property="og:url"]',          attrs: { property: 'og:url',           content: PAGE_META.canonical                } },
      { selector: 'meta[property="og:image"]',        attrs: { property: 'og:image',         content: PAGE_META.ogImage                  } },
      { selector: 'meta[name="twitter:card"]',        attrs: { name: 'twitter:card',         content: 'summary_large_image'              } },
      { selector: 'meta[name="twitter:title"]',       attrs: { name: 'twitter:title',        content: PAGE_META.title                    } },
      { selector: 'meta[name="twitter:description"]', attrs: { name: 'twitter:description',  content: PAGE_META.description              } },
      { selector: 'meta[name="twitter:image"]',       attrs: { name: 'twitter:image',        content: PAGE_META.ogImage                  } },
    ];

    const created: HTMLElement[] = [];
    for (const { selector, attrs } of metas) {
      try {
        let el = document.head.querySelector(selector) as HTMLMetaElement | null;
        if (!el) {
          el = document.createElement('meta');
          for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
          document.head.appendChild(el);
          created.push(el);
        } else {
          el.setAttribute('content', attrs['content'] ?? '');
        }
      } catch { /* ignore */ }
    }

    let canonical: HTMLLinkElement | null = null;
    let canonicalCreated = false;
    try {
      canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
        canonicalCreated = true;
      }
      canonical.setAttribute('href', PAGE_META.canonical);
    } catch { /* ignore */ }

    const scripts: HTMLScriptElement[] = [];
    for (const schema of [FAQSchema, WebApplicationSchema, BreadcrumbSchema]) {
      try {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.text = JSON.stringify(schema);
        s.setAttribute('data-key-visualizer-schema', 'true');
        document.head.appendChild(s);
        scripts.push(s);
      } catch { /* ignore */ }
    }

    return () => {
      try { document.title = prevTitle; } catch { /* ignore */ }
      for (const el of created) { try { el.remove(); } catch { /* ignore */ } }
      for (const el of scripts)  { try { el.remove(); } catch { /* ignore */ } }
      if (canonicalCreated && canonical) { try { canonical.remove(); } catch { /* ignore */ } }
    };
  }, []);
}

// ─────────────────────────────────────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────────────────────────────────────

const initialState: KeyVisualizerState = Object.freeze({
  activeKeys: Object.freeze(new Set<string>()) as ReadonlySet<string>,
  keyHistory: Object.freeze([]) as ReadonlyArray<KeyHistory>,
  totalKeys:  0,
  keyCount:   Object.freeze({}) as Readonly<Record<string, number>>,
});

function keyVisualizerReducer(
  state: KeyVisualizerState,
  action: KeyVisualizerAction,
): KeyVisualizerState {
  try {
    switch (action.type) {
      case 'KEY_DOWN': {
        const { raw, norm, id } = action.payload;
        if (state.activeKeys.has(norm)) return state;
        const nextActive = new Set(state.activeKeys);
        nextActive.add(norm);
        const now: number = Date.now();
        const entry: KeyHistory = Object.freeze({ id, key: raw, time: now });
        const nextHistory = [entry, ...state.keyHistory].slice(0, MAX_HISTORY);
        const currentCount = state.keyCount[norm] ?? 0;
        const uniqueKeys   = Object.keys(state.keyCount).length;
        const canAdd       = currentCount > 0 || uniqueKeys < MAX_UNIQUE_KEYS;
        const nextCount    = canAdd
          ? { ...state.keyCount, [norm]: currentCount + 1 }
          : state.keyCount;
        return { activeKeys: nextActive, keyHistory: nextHistory, totalKeys: state.totalKeys + 1, keyCount: nextCount };
      }
      case 'KEY_UP': {
        const { norm } = action.payload;
        if (!state.activeKeys.has(norm)) return state;
        const nextActive = new Set(state.activeKeys);
        nextActive.delete(norm);
        return { ...state, activeKeys: nextActive };
      }
      case 'RESET':
        return { activeKeys: new Set<string>(), keyHistory: [], totalKeys: 0, keyCount: {} };
      default:
        return state;
    }
  } catch {
    return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM HOOK
// ─────────────────────────────────────────────────────────────────────────────

function useKeyVisualizer(sound: SoundSettings, repeat: RepeatSettings) {
  const [state, dispatch] = useReducer(keyVisualizerReducer, initialState);
  const soundRef  = useRef(sound);
  const repeatRef = useRef(repeat);
  useEffect(() => { soundRef.current  = sound;  }, [sound]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);

  const initSound = useCallback(() => {
    try { _soundEngine.init(); } catch { /* silent */ }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    try {
      if (!e.isTrusted) return;
      const SCROLL_KEYS = new Set([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End']);
      if (SCROLL_KEYS.has(e.key)) e.preventDefault();
      if (e.repeat && repeatRef.current.blockRepeats) return;
      const rawKey = e.key;
      if (typeof rawKey !== 'string' || rawKey.length === 0) return;
      const norm = normalizeKey(rawKey);
      const id   = nextId();
      dispatch({ type: 'KEY_DOWN', payload: { raw: rawKey, norm, id } });
      _soundEngine.setEnabled(Boolean(soundRef.current.enabled));
      _soundEngine.setVolume(soundRef.current.volume);
      _soundEngine.playClick();
    } catch { /* never crash */ }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    try {
      if (!e.isTrusted) return;
      const rawKey = e.key;
      if (typeof rawKey !== 'string' || rawKey.length === 0) return;
      dispatch({ type: 'KEY_UP', payload: { norm: normalizeKey(rawKey) } });
    } catch { /* never crash */ }
  }, []);

  const reset = useCallback(() => {
    try { dispatch({ type: 'RESET' }); } catch { /* silent */ }
  }, []);

  const handleWindowBlur = useCallback(() => {
    try { dispatch({ type: 'RESET_ACTIVE' }); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      window.addEventListener('keydown',     handleKeyDown);
      window.addEventListener('keyup',       handleKeyUp,      { passive: true });
      window.addEventListener('blur',        handleWindowBlur, { passive: true });
      window.addEventListener('pointerdown', initSound,        { once: true, passive: true });
    } catch { /* ignore */ }
    return () => {
      try {
        window.removeEventListener('keydown',     handleKeyDown);
        window.removeEventListener('keyup',       handleKeyUp);
        window.removeEventListener('blur',        handleWindowBlur);
        window.removeEventListener('pointerdown', initSound);
      } catch { /* ignore */ }
    };
  }, [handleKeyDown, handleKeyUp, handleWindowBlur, initSound]);

  return { state, reset };
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BOUNDARY
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorBoundaryProps { children: ReactNode; fallback?: ReactNode; label?: string }
interface ErrorBoundaryState { hasError: boolean; error: Error | null }

class KeyVisualizerErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo): void {
    try {
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
        console.error('[KeyVisualizer] Render error:', error, info);
      }
    } catch { /* ignore */ }
  }
  handleRetry = () => {
    try { this.setState({ hasError: false, error: null }); } catch { /* ignore */ }
  };
  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert" style={{ padding: '2rem', textAlign: 'center', color: 'var(--neon-cyan)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>⚠️ {this.props.label ?? 'A section'} failed to render.</p>
          <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={this.handleRetry}>🔄 Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps { value: number; label: string; color: string }

const StatCard = memo(function StatCard({ value, label, color }: StatCardProps) {
  const safeValue = isFinite(Number(value)) ? Number(value) : 0;
  return (
    <div role="status" aria-label={`${label}: ${safeValue}`} aria-live="polite" aria-atomic="true"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}
    >
      <div style={{ fontSize: '2rem', fontWeight: 900, color }}>{safeValue}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );
});

interface KeyCapProps { keyValue: string; isActive: boolean }

const KeyCap = memo(function KeyCap({ keyValue, isActive }: KeyCapProps) {
  const isSpace = keyValue === ' ';
  const isWide  = WIDE_KEYS.has(keyValue);
  const label   = safeLabel(keyValue);
  return (
    <div
      role="img"
      aria-label={`${label} key${isActive ? ' — pressed' : ''}`}
      aria-pressed={isActive}
      style={{
        height: '42px',
        width:    isSpace ? '200px' : isWide ? '80px' : '42px',
        minWidth: isSpace ? '200px' : isWide ? '80px' : '42px',
        background:   isActive ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.04)',
        border:       isActive ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
        borderBottom: isActive ? '3px solid rgba(0,180,200,0.8)' : '3px solid rgba(255,255,255,0.15)',
        borderRadius: '6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isWide || isSpace ? '0.65rem' : '0.7rem',
        fontWeight: 600,
        color: isActive ? '#000' : 'var(--text-secondary)',
        transition: 'background 0.06s ease, border-color 0.06s ease, color 0.06s ease, box-shadow 0.06s ease',
        boxShadow:  isActive ? '0 0 15px rgba(0,245,255,0.5)' : 'none',
        userSelect: 'none',
        textTransform: 'uppercase',
        willChange: 'background, box-shadow',
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
});

interface KeyboardGridProps { activeKeys: ReadonlySet<string> }

const KeyboardGrid = memo(function KeyboardGrid({ activeKeys }: KeyboardGridProps) {
  return (
    <div role="presentation" aria-label="Virtual keyboard — active keys are highlighted"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', overflowX: 'auto' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '600px' }}>
        {KEYBOARD_LAYOUT.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {row.map((key, keyIdx) => {
              let isActive = false;
              try { isActive = activeKeys.has(normalizeKey(key)); } catch { /* ignore */ }
              return <KeyCap key={`${rowIdx}-${keyIdx}-${key}`} keyValue={key} isActive={isActive} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

interface KeyHistoryPanelProps { history: ReadonlyArray<KeyHistory> }

const KeyHistoryPanel = memo(function KeyHistoryPanel({ history }: KeyHistoryPanelProps) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--neon-cyan)' }}>
        ⌨️ Key Log
      </div>
      <div role="log" aria-label="Recent key presses" aria-live="polite" aria-relevant="additions"
        style={{ padding: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}
      >
        {history.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Start typing…</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '0.5rem' }}>
            {history.map((k, i) => (
              <span key={k.id} aria-label={k.key === ' ' ? 'Space' : k.key}
                style={{
                  padding: '0.2rem 0.5rem', borderRadius: '4px',
                  background: i === 0 ? 'rgba(0,245,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border:     `1px solid ${i === 0 ? 'var(--neon-cyan)' : 'var(--border)'}`,
                  fontSize: '0.75rem', fontWeight: 600,
                  color: i === 0 ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                  fontFamily: 'monospace',
                }}
              >
                {k.key === ' ' ? '␣' : k.key}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

interface TopKeysPanelProps { topKeys: ReadonlyArray<[string, number]> }

const TopKeysPanel = memo(function TopKeysPanel({ topKeys }: TopKeysPanelProps) {
  const maxCount = topKeys[0]?.[1] ?? 1;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--neon-orange)' }}>
        🏆 Most Used Keys
      </div>
      <div role="list" aria-label="Most frequently pressed keys" style={{ padding: '0.5rem' }}>
        {topKeys.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No data yet…</div>
        ) : (
          topKeys.map(([key, count]) => {
            const pct = clamp((count / Math.max(maxCount, 1)) * 100, 0, 100);
            return (
              <div key={key} role="listitem" aria-label={`${key === ' ' ? 'Space' : key}: pressed ${count} times`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0.5rem' }}
              >
                <span style={{ width: '32px', height: '28px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--neon-cyan)', flexShrink: 0 }}>
                  {key === ' ' ? '␣' : key.toUpperCase()}
                </span>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                    style={{ height: '100%', borderRadius: '3px', background: 'var(--neon-orange)', width: `${pct}%`, transition: 'width 0.2s ease' }}
                  />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--neon-orange)', minWidth: '30px', textAlign: 'right' }}>{count}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

interface SoundControlsProps {
  sound:    SoundSettings;
  repeat:   RepeatSettings;
  onSound:  (s: SoundSettings)  => void;
  onRepeat: (r: RepeatSettings) => void;
}

interface NeonToggleProps { checked: boolean; onChange: (v: boolean) => void; color?: string; id: string }

const NeonToggle = memo(function NeonToggle({ checked, onChange, color = '#00f5ff', id }: NeonToggleProps) {
  const trackOn:  CSSProperties = { background: `linear-gradient(135deg, ${color}33, ${color}22)`, border: `1px solid ${color}`, boxShadow: `0 0 8px ${color}55, inset 0 0 6px ${color}22` };
  const trackOff: CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'none' };
  const thumbOn:  CSSProperties = { transform: 'translateX(20px)', background: color, boxShadow: `0 0 10px ${color}cc` };
  const thumbOff: CSSProperties = { transform: 'translateX(2px)', background: 'rgba(255,255,255,0.35)', boxShadow: 'none' };
  return (
    <button id={id} role="switch" aria-checked={checked}
      onClick={() => { try { onChange(!checked); } catch { /* ignore */ } }}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s', outline: 'none', padding: 0, ...(checked ? trackOn : trackOff) }}
    >
      <span style={{ position: 'absolute', top: '2px', width: '18px', height: '18px', borderRadius: '50%', transition: 'transform 0.2s cubic-bezier(.4,0,.2,1), background 0.2s, box-shadow 0.2s', ...(checked ? thumbOn : thumbOff) }} />
    </button>
  );
});

interface VolumeBarProps { value: number; disabled: boolean; onChange: (v: number) => void }

const VolumeBar = memo(function VolumeBar({ value, disabled, onChange }: VolumeBarProps) {
  const pct = Math.round(clamp(value, 0, 1) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', opacity: disabled ? 0.35 : 1, transition: 'opacity 0.2s' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', userSelect: 'none' }}>
        {pct === 0 ? '🔇' : pct < 50 ? '🔉' : '🔊'}
      </span>
      <div style={{ position: 'relative', width: '110px', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', left: 0, height: '4px', width: `${pct}%`, borderRadius: '2px', background: disabled ? 'rgba(255,255,255,0.2)' : `linear-gradient(90deg, rgba(0,245,255,0.5), var(--neon-cyan))`, transition: 'width 0.05s' }} />
        <input type="range" min={0} max={1} step={0.05} value={clamp(value, 0, 1)} disabled={disabled} aria-label={`Sound volume: ${pct}%`}
          onChange={e => { try { const raw = parseFloat(e.target.value); onChange(clamp(isFinite(raw) ? raw : 0.4, 0, 1)); } catch { /* ignore */ } }}
          style={{ position: 'absolute', left: 0, right: 0, width: '100%', margin: 0, opacity: 0, height: '20px', cursor: disabled ? 'not-allowed' : 'pointer' }}
        />
        <div style={{ position: 'absolute', left: `calc(${pct}% - 8px)`, width: '16px', height: '16px', borderRadius: '50%', background: disabled ? 'rgba(255,255,255,0.25)' : 'var(--neon-cyan)', boxShadow: disabled ? 'none' : '0 0 8px rgba(0,245,255,0.7)', transition: 'left 0.05s, box-shadow 0.15s', pointerEvents: 'none' }} />
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: disabled ? 'var(--text-muted)' : 'var(--neon-cyan)', minWidth: '34px' }}>{pct}%</span>
    </div>
  );
});

const SoundControls = memo(function SoundControls({ sound, repeat, onSound, onRepeat }: SoundControlsProps) {
  const handleEnabledChange = useCallback((v: boolean) => { try { onSound({ ...sound, enabled: v }); } catch { /* ignore */ } }, [sound, onSound]);
  const handleVolumeChange  = useCallback((v: number) => { try { onSound({ ...sound, volume: v }); } catch { /* ignore */ } }, [sound, onSound]);
  const handleRepeatChange  = useCallback((v: boolean) => { try { onRepeat({ blockRepeats: v }); } catch { /* ignore */ } }, [onRepeat]);

  const cardBase: CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '0.6rem',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px', padding: '1rem 1.25rem', flex: '1 1 160px', minWidth: '160px',
  };

  return (
    <div role="group" aria-label="Keyboard sound and repeat settings" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <div style={cardBase}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,245,255,0.5)' }}>Sound</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: sound.enabled ? '#fff' : 'var(--text-muted)', transition: 'color 0.2s' }}>Click Sounds</span>
          <NeonToggle id="toggle-sound" checked={sound.enabled} onChange={handleEnabledChange} color="var(--neon-cyan, #00f5ff)" />
        </div>
        <VolumeBar value={sound.volume} disabled={!sound.enabled} onChange={handleVolumeChange} />
      </div>
      <div style={cardBase}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,160,0,0.5)' }}>Input</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: repeat.blockRepeats ? '#fff' : 'var(--text-muted)', transition: 'color 0.2s' }}>Block Key Repeat</span>
          <NeonToggle id="toggle-repeat" checked={repeat.blockRepeats} onChange={handleRepeatChange} color="#ffa000" />
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {repeat.blockRepeats ? 'Held keys fire once only' : 'Held keys repeat continuously'}
        </div>
      </div>
    </div>
  );
});

const TableOfContents = memo(function TableOfContents() {
  return (
    <nav aria-label="Article table of contents" style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--neon-cyan)', marginBottom: '0.75rem', marginTop: 0 }}>📋 Table of Contents</p>
      <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {TOC_SECTIONS.map(s => (
          <li key={s.id} style={{ marginBottom: '0.35rem' }}>
            <a href={`#${s.id}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}
              onFocus={e  => { (e.target as HTMLAnchorElement).style.color = 'var(--neon-cyan)'; }}
              onBlur={e   => { (e.target as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
              onMouseEnter={e => { (e.target as HTMLAnchorElement).style.color = 'var(--neon-cyan)'; }}
              onMouseLeave={e => { (e.target as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// FAQ DATA — same CPS-style accordion pattern
// ─────────────────────────────────────────────────────────────────────────────

const FAQ_DATA = [
  {
    q: 'Why do some system shortcut keys not light up on the Key Visualizer?',
    a: 'Certain key combinations such as Alt+Tab or OS-level shortcuts are intercepted by your operating system before they reach the browser. The Key Visualizer only captures events that the browser tab receives.',
  },
  {
    q: 'How is the Most Used Keys bar width calculated?',
    a: 'The progress bar uses your highest single-key press count as the 100% anchor. All other keys scale proportionally, giving a clear visual comparison of your typing habits.',
  },
  {
    q: 'Can the Key Visualizer detect multi-key or macro pad inputs?',
    a: 'Yes. Any hardware that sends standard HID keyboard events to the browser will be detected and displayed in real time, including macro pads and programmable keyboards.',
  },
  {
    q: 'Does the Key Visualizer store or transmit my keystrokes?',
    a: 'No. All keystroke data is processed entirely in your browser. Nothing is stored in a database, sent to a server, or logged externally.',
  },
  {
    q: 'What browsers does the Key Visualizer support?',
    a: 'The Key Visualizer works on all modern browsers including Chrome, Firefox, Edge, Safari, and Opera. Some OS-level shortcuts may still be intercepted depending on your operating system.',
  },
];

// CPS-style FAQ accordion — no extra theme colors, plain border + arrow toggle
const FaqSection = memo(function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section aria-label="Frequently Asked Questions" style={{ marginBottom: '3rem', marginTop: '2.5rem' }}>
      <h2 style={{
        fontWeight: 800, fontSize: '1.75rem', color: '#fff',
        marginTop: 0, marginBottom: '1.5rem',
        borderBottom: '1px solid #1f2937', paddingBottom: '1rem',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neon-cyan, #00f5ff)', flexShrink: 0 }} aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Frequently Asked Questions
      </h2>

      <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {FAQ_DATA.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              role="listitem"
              style={{
                border: `1px solid ${isOpen ? 'rgba(0,245,255,0.4)' : '#1f2937'}`,
                borderRadius: '10px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              <button
                aria-expanded={isOpen}
                aria-controls={`kv-faq-answer-${i}`}
                id={`kv-faq-question-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: isOpen ? 'rgba(0,245,255,0.05)' : 'transparent',
                  border: 'none',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                <span>{faq.q}</span>
                {/* Up/down chevron — same as CPS design */}
                {isOpen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan, #00f5ff)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </button>
              {isOpen && (
                <div
                  id={`kv-faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`kv-faq-question-${i}`}
                  style={{ padding: '0 18px 16px', backgroundColor: 'rgba(0,245,255,0.03)' }}
                >
                  <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
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

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED DATA (JSON-LD)
// ─────────────────────────────────────────────────────────────────────────────

const FAQSchema = Object.freeze({
  '@context':   'https://schema.org',
  '@type':      'FAQPage',
  'mainEntity': FAQ_DATA.map(({ q, a }) => Object.freeze({
    '@type':          'Question',
    'name':           q,
    'acceptedAnswer': Object.freeze({ '@type': 'Answer', 'text': a }),
  })),
});

const WebApplicationSchema = Object.freeze({
  '@context':            'https://schema.org',
  '@type':               'WebApplication',
  'name':                'Key Visualizer',
  'url':                 PAGE_META.canonical,
  'description':         PAGE_META.description,
  'applicationCategory': 'UtilityApplication',
  'operatingSystem':     'Any',
  'browserRequirements': 'Requires JavaScript. Works in Chrome, Firefox, Edge, Safari, Opera.',
  'offers': Object.freeze({ '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' }),
  'featureList': Object.freeze([
    'Real-time key detection',
    'Active key highlighting',
    'Key press history',
    'Most-used key statistics',
    'Click sound effects',
    'Reset dashboard',
    'Privacy-first — no data leaves the browser',
  ]),
});

const BreadcrumbSchema = Object.freeze({
  '@context': 'https://schema.org',
  '@type':    'BreadcrumbList',
  'itemListElement': Object.freeze([
    Object.freeze({ '@type': 'ListItem', 'position': 1, 'name': 'Home',           'item': 'https://yourdomain.com/'               }),
    Object.freeze({ '@type': 'ListItem', 'position': 2, 'name': 'Keyboard Tools', 'item': 'https://yourdomain.com/keyboard-tools' }),
    Object.freeze({ '@type': 'ListItem', 'position': 3, 'name': 'Key Visualizer', 'item': PAGE_META.canonical                     }),
  ]),
});

// ─────────────────────────────────────────────────────────────────────────────
// SEO ARTICLE — no extra neon backgrounds; plain text only, CPS heading style
// ─────────────────────────────────────────────────────────────────────────────

const ArticleSection = lazy(() =>
  Promise.resolve({
    default: memo(function ArticleSection() {
      // Same style constants as CPS test — no colored backgrounds on sections
      const h2Style: CSSProperties = {
        color: 'var(--neon-green, #00ff88)',
        fontSize: '1.5rem',
        fontWeight: 700,
        margin: '2.5rem 0 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: '0.5rem',
        scrollMarginTop: '80px',
      };
      const h3Style: CSSProperties = {
        color: 'var(--neon-orange, #ff9f43)',
        fontSize: '1.15rem',
        fontWeight: 700,
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
      const liStyle: CSSProperties = { marginBottom: '0.55rem' };
      const codeStyle: CSSProperties = {
        background: 'rgba(0,245,255,0.1)',
        padding: '1px 6px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '0.9em',
        color: 'var(--neon-cyan, #00f5ff)',
      };

      return (
        <article aria-label="Key Visualizer guide and information"
          style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.8' }}
        >
          {/* ── Main title ── */}
          <h2 style={{ ...h2Style, marginTop: 0, color: 'var(--neon-cyan, #00f5ff)', fontSize: '2rem', borderBottom: 'none', paddingBottom: 0 }}>
            The Ultimate Guide to Key Visualizer &amp; Keyboard Diagnostics
          </h2>

          <p style={{ ...pStyle, fontSize: '1rem', color: '#d1d5db', marginBottom: '2rem' }}>
            A <strong>Key Visualizer</strong> is an interactive web utility designed to record,
            translate, and render physical peripheral inputs onto a simulated hardware interface.
            By tracking input changes in real time, this diagnostics tool benchmarks complex
            processing operations like multi-key rollover capabilities and localized input lag.
            Programmers, hardware enthusiasts, and speed typists use it to inspect immediate
            mechanical actuation patterns and confirm continuous peripheral signal accuracy.
          </p>

          {/* ── What is ── */}
          <h2 style={h2Style}>What is a Key Visualizer?</h2>
          <p style={pStyle}>
            A Key Visualizer is a browser-based tool that renders every keystroke on a virtual
            keyboard in real time. Unlike simple key loggers, it displays simultaneous presses,
            tracks frequency per key, and maintains a rolling history — all within your browser
            tab without sending any data externally.
          </p>

          <h3 style={h3Style}>Debugging ghosting and testing N-Key Rollover (NKRO)</h3>
          <p style={pStyle}>
            When multiple keys are pressed simultaneously on modern membranes, a circuit error
            called <strong>ghosting</strong> can prevent the machine from acknowledging inputs.
            Key visualizers isolate these connection faults immediately. By checking whether a
            sequence shows up completely on screen, users can confirm if their keyboard features
            partial or full <strong>N-Key Rollover (NKRO)</strong> — critical for executing
            split-second macros or intense gaming commands without signal drops.
          </p>

          <h3 style={h3Style}>How hardware latency impacts typing and gaming output</h3>
          <ul style={ulStyle}>
            <li style={liStyle}>
              <strong>Peripheral polling rate:</strong> Higher polling frequencies (1000 Hz or greater)
              shorten the interval between physical contact and system interrupt events, allowing
              inputs to render with virtually no micro-stuttering.
            </li>
            <li style={liStyle}>
              <strong>Actuation depth variables:</strong> Standard linear, tactile, or clicky
              mechanical switches feature varying travel thresholds. Inspecting these properties
              provides predictable tactile feedback and helps prevent hand fatigue.
            </li>
            <li style={liStyle}>
              <strong>Browser context binding:</strong> Web-based event listeners hook into DOM
              tracking components. Keeping your tab focused guarantees instantaneous key register
              tracking and reliable statistics parsing.
            </li>
          </ul>

          {/* ── How to use ── */}
          <h2 id="how-to-use" style={h2Style}>How to Use the Key Visualizer</h2>
          <p style={pStyle}>Getting started is instant — no installation, account, or plugin required.</p>
          <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', color: '#9ca3af', lineHeight: '1.9' }}>
            <li style={liStyle}><strong>Open the page</strong> in any modern browser.</li>
            <li style={liStyle}><strong>Click anywhere</strong> to give the browser window focus.</li>
            <li style={liStyle}><strong>Start typing</strong> — each key lights up immediately on the virtual keyboard.</li>
            <li style={liStyle}><strong>Hold a key</strong> to observe repeat behavior, then toggle Block Key Repeat.</li>
            <li style={liStyle}><strong>Enable click sounds</strong> for an audible click on every keystroke.</li>
            <li style={liStyle}><strong>Monitor the Key Log</strong> to spot unexpected inputs or dropped keys.</li>
            <li style={liStyle}><strong>Analyse Most Used Keys</strong> to identify typing patterns.</li>
            <li style={liStyle}><strong>Reset the dashboard</strong> to start a fresh session.</li>
          </ol>

          {/* ── Features ── */}
          <h2 id="features" style={h2Style}>Features of This Keyboard Visualizer</h2>

          <h3 style={h3Style}>Real-time key detection</h3>
          <p style={pStyle}>
            The visualizer hooks into the browser's native <code style={codeStyle}>keydown</code> and{' '}
            <code style={codeStyle}>keyup</code> events, registering every keystroke within milliseconds
            of physical actuation. Only <code style={codeStyle}>isTrusted</code> events generated by
            real hardware are processed — synthetic or scripted inputs are automatically filtered out.
          </p>

          <h3 style={h3Style}>Active key highlighting</h3>
          <p style={pStyle}>
            Every key on the virtual keyboard illuminates in cyan the instant you press the
            corresponding physical key. The highlight fades immediately on release, giving a
            true real-time picture of your active finger positions.
          </p>

          <h3 style={h3Style}>Key history log</h3>
          <p style={pStyle}>
            The Key Log records the last 20 keystrokes in chronological order. The most recent
            key is always highlighted distinctly — invaluable for spotting erratic inputs,
            unexpected characters, or double-fire events caused by hardware faults.
          </p>

          <h3 style={h3Style}>Most-used keys statistics</h3>
          <p style={pStyle}>
            Each key press increments an internal counter and the top 10 most-pressed keys
            are displayed with a dynamic bar chart scaled to the most-pressed key.
          </p>

          <h3 style={h3Style}>Statistics dashboard</h3>
          <p style={pStyle}>
            Three live counters sit at the top: <em>Total Keys</em>, <em>Active Keys</em>, and{' '}
            <em>Unique Keys</em>. These update with every event and serve as a quick health
            indicator for keyboard performance.
          </p>

          <h3 style={h3Style}>Reset dashboard</h3>
          <p style={pStyle}>
            A single button wipes all statistics, history, and counters — useful when switching
            between keyboards or users.
          </p>

          {/* ── Benefits gamers ── */}
          <h2 id="benefits-gamers" style={h2Style}>Benefits for Gamers</h2>

          <h3 style={h3Style}>Ghosting detection made easy</h3>
          <p style={pStyle}>
            Press your gaming macro combination and watch the visualizer — immediately confirm
            whether every key lights up, or identify which one is being ghosted.
          </p>

          <h3 style={h3Style}>N-Key Rollover verification</h3>
          <p style={pStyle}>
            N-Key Rollover guarantees every simultaneously pressed key is independently
            recognized. The active key counter and real-time display let you verify full NKRO,
            partial rollover (6KRO), or USB protocol caps.
          </p>

          <h3 style={h3Style}>Mechanical keyboard evaluation</h3>
          <p style={pStyle}>
            Switching switch types? The visualizer helps evaluate how new switches feel under
            actual gaming conditions. Missed actuations or chattering become visible immediately
            in the key history log.
          </p>

          {/* ── Benefits typists ── */}
          <h2 id="benefits-typists" style={h2Style}>Benefits for Programmers and Typists</h2>

          <h3 style={h3Style}>Shortcut verification</h3>
          <p style={pStyle}>
            Developers rely on complex modifier combinations daily. The Key Visualizer confirms
            which key events actually reach the browser, helping distinguish OS-intercepted
            shortcuts from application-level bindings.
          </p>

          <h3 style={h3Style}>Typing productivity and habit analysis</h3>
          <p style={pStyle}>
            The Most Used Keys chart exposes typing patterns. Heavy Backspace use may indicate
            error-prone typing. These insights guide deliberate practice and ergonomic layout
            choices.
          </p>

          <h3 style={h3Style}>Touch typing practice feedback</h3>
          <p style={pStyle}>
            Learners practicing Colemak, Dvorak, or QWERTY can use the visualizer as a
            real-time feedback layer confirming correct finger assignment and exposing mistakes.
          </p>

          {/* ── Common problems ── */}
          <h2 id="common-problems" style={h2Style}>Common Keyboard Problems You Can Detect</h2>

          <h3 style={h3Style}>Dead keys / ghosting / chattering / sticky keys</h3>
          <p style={pStyle}>
            The visualizer makes silent failures visible. Dead keys never light up. Ghosted
            keys disappear from the active display. Chattering shows duplicate consecutive
            entries. Sticky keys keep their indicator lit after release because the{' '}
            <code style={codeStyle}>keyup</code> event failed to fire.
          </p>

          {/* ── Browser compat ── */}
          <h2 id="browser-compat" style={h2Style}>Browser Compatibility</h2>
          <ul style={ulStyle}>
            <li style={liStyle}><strong>Chrome 90+</strong> — Full support including Web Audio.</li>
            <li style={liStyle}><strong>Firefox 88+</strong> — Full support. Sound requires a user interaction first (handled automatically).</li>
            <li style={liStyle}><strong>Edge 90+</strong> — Full support on Chromium-based versions.</li>
            <li style={liStyle}><strong>Safari 14+</strong> — Full support. Sound initialises on first click or keypress.</li>
            <li style={liStyle}><strong>Opera 76+</strong> — Full support.</li>
          </ul>
          <p style={pStyle}>
            OS-level shortcuts (<code style={codeStyle}>Ctrl+Alt+Del</code>,{' '}
            <code style={codeStyle}>Alt+Tab</code>, Win key) are consumed by the operating system
            before the browser receives them. Internet Explorer is not supported.
          </p>

          {/* ── Privacy ── */}
          <h2 id="privacy" style={h2Style}>Privacy</h2>
          <ul style={ulStyle}>
            <li style={liStyle}><strong>No keystrokes leave your browser.</strong> Every keystroke is processed entirely within your browser tab — no network request, no WebSocket, no upload.</li>
            <li style={liStyle}><strong>No data is stored.</strong> Statistics live only in React component state (volatile memory). Refresh or Reset erases everything. Nothing is written to localStorage, cookies, or IndexedDB.</li>
            <li style={liStyle}><strong>Trusted-only events.</strong> Only events with <code style={codeStyle}>isTrusted: true</code> are processed — programmatic injection is silently ignored.</li>
            <li style={liStyle}><strong>No third-party keylogger scripts.</strong> The visualizer contains no session recording tools or advertising scripts that could intercept keystrokes.</li>
          </ul>

          {/* ── Conclusion ── */}
          <h2 id="conclusion" style={h2Style}>Conclusion</h2>
          <p style={pStyle}>
            The <strong>Key Visualizer</strong> is an essential browser-based utility for
            anyone who wants instant, accurate insight into keyboard performance. Built with
            performance, accessibility, and security as first-class concerns, it processes
            only trusted hardware events, keeps all data local, and maintains smooth 60 fps
            rendering even during the fastest typing bursts.
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            Bookmark this tool and return whenever you need to diagnose a hardware issue,
            test a new keyboard, or simply enjoy the satisfying glow of watching every
            keystroke light up in real time.
          </p>
        </article>
      );
    }),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function KeyVisualizerPage() {
  useDocumentMeta();

  const [sound,  setSound]  = useState<SoundSettings>({ enabled: false, volume: 0.4 });
  const [repeat, setRepeat] = useState<RepeatSettings>({ blockRepeats: true });

  const { state, reset } = useKeyVisualizer(sound, repeat);

  const topKeys = useMemo<ReadonlyArray<[string, number]>>(() => {
    try {
      return Object.entries(state.keyCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) as Array<[string, number]>;
    } catch {
      return [];
    }
  }, [state.keyCount]);

  const statsData = useMemo(() => [
    { value: state.totalKeys,                    label: 'Total Keys',  color: 'var(--neon-cyan)'   },
    { value: state.activeKeys.size,              label: 'Active Keys', color: 'var(--neon-green)'  },
    { value: Object.keys(state.keyCount).length, label: 'Unique Keys', color: 'var(--neon-orange)' },
  ], [state.totalKeys, state.activeKeys.size, state.keyCount]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Keyboard Tool</div>
        <h1 className="tool-title">Key Visualizer</h1>
        <p className="tool-subtitle">Real-time keyboard display — see every keystroke light up</p>
      </header>

      <div role="region" aria-label="Keyboard statistics"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}
      >
        {statsData.map(s => (
          <StatCard key={s.label} value={s.value} label={s.label} color={s.color} />
        ))}
      </div>

      <SoundControls sound={sound} repeat={repeat} onSound={setSound} onRepeat={setRepeat} />

      <div role="note" aria-label="Typing instruction"
        style={{ background: 'rgba(0,245,255,0.05)', border: '1px dashed rgba(0,245,255,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}
      >
        ⌨️ Click anywhere on the page and start typing to see keys light up!
      </div>

      <KeyVisualizerErrorBoundary label="Virtual keyboard">
        <KeyboardGrid activeKeys={state.activeKeys} />
      </KeyVisualizerErrorBoundary>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <KeyVisualizerErrorBoundary label="Key log">
          <KeyHistoryPanel history={state.keyHistory} />
        </KeyVisualizerErrorBoundary>
        <KeyVisualizerErrorBoundary label="Top keys panel">
          <TopKeysPanel topKeys={topKeys} />
        </KeyVisualizerErrorBoundary>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
        <button className="btn btn-secondary" aria-label="Reset all keyboard statistics and history" onClick={reset}>
          🔄 Reset Dashboard
        </button>
      </div>

      {/* ── MORE TOOLS GRID ── */}
      <section aria-label="More Tools" style={{ marginBottom: '3.5rem', marginTop: '3.5rem' }}>
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

      {/* ── SEO Article + FAQ wrapper — no extra neon backgrounds ── */}
      <div style={{ marginTop: '2rem' }}>

        {/* Reading time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <span aria-hidden="true">🕐</span>
          <span aria-label={`Estimated reading time: ${READING_TIME_MIN} minutes`}>{READING_TIME_MIN} min read</span>
        </div>

        <TableOfContents />

        {/* Article — plain text, CPS heading style */}
        <KeyVisualizerErrorBoundary label="Article section">
          <Suspense fallback={
            <div aria-label="Loading article content" style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
              Loading…
            </div>
          }>
            <ArticleSection />
          </Suspense>
        </KeyVisualizerErrorBoundary>

        {/* Divider before FAQ */}
        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.07)', margin: '3rem 0' }} />

        {/* FAQ accordion — CPS-style */}
        <KeyVisualizerErrorBoundary label="FAQ section">
          <FaqSection />
        </KeyVisualizerErrorBoundary>

      </div>
    </div>
  );
}