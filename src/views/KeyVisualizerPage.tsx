"use client";

// src/pages/KeyVisualizerPage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// HARDENED Key Visualizer — Tamper-proof, crash-proof, sound-locked
// Complete 100% Full-Size Keyboard with Numpad, Navigation, Function Keys,
// Layout Switcher (100% Full / 80% TKL / 60% Compact), and Tab Scroll Prevention
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

export const ROBOTS_TXT_CONTENT = `User-agent: *
Allow: /

Sitemap: https://fixedaim.com/sitemap.xml
`;

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const MAX_HISTORY      = 20  as const;
const MAX_UNIQUE_KEYS  = 200 as const;
const READING_TIME_WPM = 200 as const;

// Virtual Key Model
export interface VirtualKey {
  id: string;
  label: string;
  subLabel?: string;
  width?: number; // in pixels (base 1u = 40px)
  height?: number; // in pixels (base 1u = 40px)
  gridRowSpan?: number;
  gridColSpan?: number;
  matchKeys: string[];
}

// ─── 1. Main Alphanumeric & Function Block ───────────────────────────────────
export const MAIN_BLOCK_ROWS: VirtualKey[][] = [
  // Row 0: Function Row
  [
    { id: 'Escape', label: 'Esc', width: 40, matchKeys: ['escape', 'esc'] },
    { id: 'spacer_f0', label: '', width: 20, matchKeys: [] },
    { id: 'F1', label: 'F1', width: 40, matchKeys: ['f1'] },
    { id: 'F2', label: 'F2', width: 40, matchKeys: ['f2'] },
    { id: 'F3', label: 'F3', width: 40, matchKeys: ['f3'] },
    { id: 'F4', label: 'F4', width: 40, matchKeys: ['f4'] },
    { id: 'spacer_f1', label: '', width: 14, matchKeys: [] },
    { id: 'F5', label: 'F5', width: 40, matchKeys: ['f5'] },
    { id: 'F6', label: 'F6', width: 40, matchKeys: ['f6'] },
    { id: 'F7', label: 'F7', width: 40, matchKeys: ['f7'] },
    { id: 'F8', label: 'F8', width: 40, matchKeys: ['f8'] },
    { id: 'spacer_f2', label: '', width: 14, matchKeys: [] },
    { id: 'F9', label: 'F9', width: 40, matchKeys: ['f9'] },
    { id: 'F10', label: 'F10', width: 40, matchKeys: ['f10'] },
    { id: 'F11', label: 'F11', width: 40, matchKeys: ['f11'] },
    { id: 'F12', label: 'F12', width: 40, matchKeys: ['f12'] },
  ],
  // Row 1: Number Row
  [
    { id: 'Backquote', label: '`', subLabel: '~', width: 40, matchKeys: ['backquote', '`', '~'] },
    { id: 'Digit1', label: '1', subLabel: '!', width: 40, matchKeys: ['digit1', '1', '!'] },
    { id: 'Digit2', label: '2', subLabel: '@', width: 40, matchKeys: ['digit2', '2', '@'] },
    { id: 'Digit3', label: '3', subLabel: '#', width: 40, matchKeys: ['digit3', '3', '#'] },
    { id: 'Digit4', label: '4', subLabel: '$', width: 40, matchKeys: ['digit4', '4', '$'] },
    { id: 'Digit5', label: '5', subLabel: '%', width: 40, matchKeys: ['digit5', '5', '%'] },
    { id: 'Digit6', label: '6', subLabel: '^', width: 40, matchKeys: ['digit6', '6', '^'] },
    { id: 'Digit7', label: '7', subLabel: '&', width: 40, matchKeys: ['digit7', '7', '&'] },
    { id: 'Digit8', label: '8', subLabel: '*', width: 40, matchKeys: ['digit8', '8', '*'] },
    { id: 'Digit9', label: '9', subLabel: '(', width: 40, matchKeys: ['digit9', '9', '('] },
    { id: 'Digit0', label: '0', subLabel: ')', width: 40, matchKeys: ['digit0', '0', ')'] },
    { id: 'Minus', label: '-', subLabel: '_', width: 40, matchKeys: ['minus', '-', '_'] },
    { id: 'Equal', label: '=', subLabel: '+', width: 40, matchKeys: ['equal', '=', '+'] },
    { id: 'Backspace', label: '⌫ Back', width: 85, matchKeys: ['backspace'] },
  ],
  // Row 2: QWERTY Row
  [
    { id: 'Tab', label: 'Tab ⇥', width: 62, matchKeys: ['tab'] },
    { id: 'KeyQ', label: 'Q', width: 40, matchKeys: ['keyq', 'q'] },
    { id: 'KeyW', label: 'W', width: 40, matchKeys: ['keyw', 'w'] },
    { id: 'KeyE', label: 'E', width: 40, matchKeys: ['keye', 'e'] },
    { id: 'KeyR', label: 'R', width: 40, matchKeys: ['keyr', 'r'] },
    { id: 'KeyT', label: 'T', width: 40, matchKeys: ['keyt', 't'] },
    { id: 'KeyY', label: 'Y', width: 40, matchKeys: ['keyy', 'y'] },
    { id: 'KeyU', label: 'U', width: 40, matchKeys: ['keyu', 'u'] },
    { id: 'KeyI', label: 'I', width: 40, matchKeys: ['keyi', 'i'] },
    { id: 'KeyO', label: 'O', width: 40, matchKeys: ['keyo', 'o'] },
    { id: 'KeyP', label: 'P', width: 40, matchKeys: ['keyp', 'p'] },
    { id: 'BracketLeft', label: '[', subLabel: '{', width: 40, matchKeys: ['bracketleft', '[', '{'] },
    { id: 'BracketRight', label: ']', subLabel: '}', width: 40, matchKeys: ['bracketright', ']', '}'] },
    { id: 'Backslash', label: '\\', subLabel: '|', width: 63, matchKeys: ['backslash', '\\', '|'] },
  ],
  // Row 3: Home Row
  [
    { id: 'CapsLock', label: 'Caps Lock', width: 72, matchKeys: ['capslock'] },
    { id: 'KeyA', label: 'A', width: 40, matchKeys: ['keya', 'a'] },
    { id: 'KeyS', label: 'S', width: 40, matchKeys: ['keys', 's'] },
    { id: 'KeyD', label: 'D', width: 40, matchKeys: ['keyd', 'd'] },
    { id: 'KeyF', label: 'F', width: 40, matchKeys: ['keyf', 'f'] },
    { id: 'KeyG', label: 'G', width: 40, matchKeys: ['keyg', 'g'] },
    { id: 'KeyH', label: 'H', width: 40, matchKeys: ['keyh', 'h'] },
    { id: 'KeyJ', label: 'J', width: 40, matchKeys: ['keyj', 'j'] },
    { id: 'KeyK', label: 'K', width: 40, matchKeys: ['keyk', 'k'] },
    { id: 'KeyL', label: 'L', width: 40, matchKeys: ['keyl', 'l'] },
    { id: 'Semicolon', label: ';', subLabel: ':', width: 40, matchKeys: ['semicolon', ';', ':'] },
    { id: 'Quote', label: "'", subLabel: '"', width: 40, matchKeys: ['quote', "'", '"'] },
    { id: 'Enter', label: '↵ Enter', width: 93, matchKeys: ['enter'] },
  ],
  // Row 4: Shift Row
  [
    { id: 'ShiftLeft', label: '⇧ Shift', width: 92, matchKeys: ['shiftleft', 'shift'] },
    { id: 'KeyZ', label: 'Z', width: 40, matchKeys: ['keyz', 'z'] },
    { id: 'KeyX', label: 'X', width: 40, matchKeys: ['keyx', 'x'] },
    { id: 'KeyC', label: 'C', width: 40, matchKeys: ['keyc', 'c'] },
    { id: 'KeyV', label: 'V', width: 40, matchKeys: ['keyv', 'v'] },
    { id: 'KeyB', label: 'B', width: 40, matchKeys: ['keyb', 'b'] },
    { id: 'KeyN', label: 'N', width: 40, matchKeys: ['keyn', 'n'] },
    { id: 'KeyM', label: 'M', width: 40, matchKeys: ['keym', 'm'] },
    { id: 'Comma', label: ',', subLabel: '<', width: 40, matchKeys: ['comma', ',', '<'] },
    { id: 'Period', label: '.', subLabel: '>', width: 40, matchKeys: ['period', '.', '>'] },
    { id: 'Slash', label: '/', subLabel: '?', width: 40, matchKeys: ['slash', '/', '?'] },
    { id: 'ShiftRight', label: '⇧ Shift', width: 113, matchKeys: ['shiftright', 'shift'] },
  ],
  // Row 5: Modifier / Space Row
  [
    { id: 'ControlLeft', label: 'Ctrl', width: 52, matchKeys: ['controlleft', 'ctrl', 'control'] },
    { id: 'MetaLeft', label: '⊞ Win', width: 50, matchKeys: ['metaleft', 'win', 'meta', 'os'] },
    { id: 'AltLeft', label: 'Alt', width: 50, matchKeys: ['altleft', 'alt'] },
    { id: 'Space', label: 'Space', width: 236, matchKeys: ['space', ' '] },
    { id: 'AltRight', label: 'Alt', width: 50, matchKeys: ['altright', 'altgraph', 'alt'] },
    { id: 'MetaRight', label: '⊞ Win', width: 50, matchKeys: ['metaright', 'win', 'meta', 'os'] },
    { id: 'ContextMenu', label: '▤ Menu', width: 50, matchKeys: ['contextmenu', 'menu', 'apps'] },
    { id: 'ControlRight', label: 'Ctrl', width: 52, matchKeys: ['controlright', 'ctrl', 'control'] },
  ],
];

// ─── 2. Navigation & Arrow Block ─────────────────────────────────────────────
export const NAV_BLOCK_ROWS: VirtualKey[][] = [
  // Row 0: PrtSc, ScrLk, Pause
  [
    { id: 'PrintScreen', label: 'PrtSc', width: 40, matchKeys: ['printscreen', 'prtsc', 'print'] },
    { id: 'ScrollLock', label: 'ScrLk', width: 40, matchKeys: ['scrolllock', 'scrlk'] },
    { id: 'Pause', label: 'Pause', width: 40, matchKeys: ['pause', 'break'] },
  ],
  // Row 1: Ins, Home, PgUp
  [
    { id: 'Insert', label: 'Ins', width: 40, matchKeys: ['insert', 'ins'] },
    { id: 'Home', label: 'Home', width: 40, matchKeys: ['home'] },
    { id: 'PageUp', label: 'PgUp', width: 40, matchKeys: ['pageup', 'pgup'] },
  ],
  // Row 2: Del, End, PgDn
  [
    { id: 'Delete', label: 'Del', width: 40, matchKeys: ['delete', 'del'] },
    { id: 'End', label: 'End', width: 40, matchKeys: ['end'] },
    { id: 'PageDown', label: 'PgDn', width: 40, matchKeys: ['pagedown', 'pgdn'] },
  ],
  // Row 3: Spacer
  [
    { id: 'nav_spacer_3', label: '', width: 130, matchKeys: [] },
  ],
  // Row 4: Arrow Up
  [
    { id: 'spacer_arrow_l', label: '', width: 45, matchKeys: [] },
    { id: 'ArrowUp', label: '↑', width: 40, matchKeys: ['arrowup', 'up'] },
    { id: 'spacer_arrow_r', label: '', width: 45, matchKeys: [] },
  ],
  // Row 5: Arrow Left, Down, Right
  [
    { id: 'ArrowLeft', label: '←', width: 40, matchKeys: ['arrowleft', 'left'] },
    { id: 'ArrowDown', label: '↓', width: 40, matchKeys: ['arrowdown', 'down'] },
    { id: 'ArrowRight', label: '→', width: 40, matchKeys: ['arrowright', 'right'] },
  ],
];

// ─── 3. Full Numpad Block ────────────────────────────────────────────────────
export const NUMPAD_KEYS: VirtualKey[] = [
  // Row 1
  { id: 'NumLock', label: 'Num', matchKeys: ['numlock'], gridRowSpan: 1, gridColSpan: 1 },
  { id: 'NumpadDivide', label: '/', matchKeys: ['numpaddivide', 'divide'], gridRowSpan: 1, gridColSpan: 1 },
  { id: 'NumpadMultiply', label: '*', matchKeys: ['numpadmultiply', 'multiply'], gridRowSpan: 1, gridColSpan: 1 },
  { id: 'NumpadSubtract', label: '-', matchKeys: ['numpadsubtract', 'subtract'], gridRowSpan: 1, gridColSpan: 1 },
  // Row 2
  { id: 'Numpad7', label: '7', subLabel: 'Home', matchKeys: ['numpad7'], gridRowSpan: 1, gridColSpan: 1 },
  { id: 'Numpad8', label: '8', subLabel: '↑', matchKeys: ['numpad8'], gridRowSpan: 1, gridColSpan: 1 },
  { id: 'Numpad9', label: '9', subLabel: 'PgUp', matchKeys: ['numpad9'], gridRowSpan: 1, gridColSpan: 1 },
  { id: 'NumpadAdd', label: '+', matchKeys: ['numpadadd', 'add'], gridRowSpan: 2, gridColSpan: 1 },
  // Row 3
  { id: 'Numpad4', label: '4', subLabel: '←', matchKeys: ['numpad4'], gridRowSpan: 1, gridColSpan: 1 },
  { id: 'Numpad5', label: '5', matchKeys: ['numpad5'], gridRowSpan: 1, gridColSpan: 1 },
  { id: 'Numpad6', label: '6', subLabel: '→', matchKeys: ['numpad6'], gridRowSpan: 1, gridColSpan: 1 },
  // Row 4
  { id: 'Numpad1', label: '1', subLabel: 'End', matchKeys: ['numpad1'], gridRowSpan: 1, gridColSpan: 1 },
  { id: 'Numpad2', label: '2', subLabel: '↓', matchKeys: ['numpad2'], gridRowSpan: 1, gridColSpan: 1 },
  { id: 'Numpad3', label: '3', subLabel: 'PgDn', matchKeys: ['numpad3'], gridRowSpan: 1, gridColSpan: 1 },
  { id: 'NumpadEnter', label: '↵', matchKeys: ['numpadenter'], gridRowSpan: 2, gridColSpan: 1 },
  // Row 5
  { id: 'Numpad0', label: '0', subLabel: 'Ins', matchKeys: ['numpad0'], gridRowSpan: 1, gridColSpan: 2 },
  { id: 'NumpadDecimal', label: '.', subLabel: 'Del', matchKeys: ['numpaddecimal', 'decimal'], gridRowSpan: 1, gridColSpan: 1 },
];

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
  description:'Free online Key Visualizer: watch every keystroke light up in real time with 100% full keyboard, Numpad, and Arrow keys. Test keyboard ghosting, N-Key Rollover, key history, and usage stats locally in your browser.',
  canonical:  'https://fixedaim.com/key-visualizer',
  keywords:   'key visualizer, keyboard visualizer, keyboard tester, real-time key display, ghosting test, NKRO test, numpad test, f keys test, typing tool, keyboard diagnostics',
  ogImage:    'https://fixedaim.com/og/key-visualizer.png',
  themeColor: '#00f5ff',
  author:     'FixedAim',
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
  | { type: 'KEY_DOWN';     payload: Readonly<{ raw: string; code?: string; norm: string; id: number }> }
  | { type: 'KEY_UP';       payload: Readonly<{ raw?: string; code?: string; norm: string }>                           }
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
  'Control': 'ctrl',
  'Meta':    'win',
  'OS':      'win',
  'Escape':  'escape',
});

function normalizeKey(key: unknown, code?: unknown): string {
  try {
    if (typeof code === 'string' && code.length > 0) {
      return code.toLowerCase();
    }
    if (typeof key !== 'string' || key.length === 0) return 'unknown';
    if (key === ' ') return 'space';
    const remapped = BROWSER_KEY_MAP[key] ?? key;
    return remapped.toLowerCase();
  } catch {
    return 'unknown';
  }
}

function safeLabel(key: string): string {
  if (key === ' ' || key === 'space') return 'Space';
  if (key === 'ArrowUp') return '↑ Up';
  if (key === 'ArrowDown') return '↓ Down';
  if (key === 'ArrowLeft') return '← Left';
  if (key === 'ArrowRight') return '→ Right';
  if (key === 'Tab') return 'Tab';
  if (key === 'Backspace') return 'Backspace';
  if (key === 'Enter') return 'Enter';
  if (key === 'Escape') return 'Esc';
  if (key === 'CapsLock') return 'Caps';
  if (key === 'Control' || key === 'ControlLeft' || key === 'ControlRight') return 'Ctrl';
  if (key === 'Meta' || key === 'MetaLeft' || key === 'MetaRight') return 'Win';
  if (key === 'Shift' || key === 'ShiftLeft' || key === 'ShiftRight') return 'Shift';
  if (key === 'Alt' || key === 'AltLeft' || key === 'AltRight') return 'Alt';
  if (key.startsWith('Numpad')) return key.replace('Numpad', 'Num ');
  return key;
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
      if (typeof window === 'undefined') return null;
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
      { selector: 'meta[name="twitter:image"]',        attrs: { name: 'twitter:image',        content: PAGE_META.ogImage                  } },
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
        const { raw, code, norm, id } = action.payload;
        const codeKey = code ? code.toLowerCase() : '';
        const rawKey = raw.toLowerCase();

        const nextActive = new Set(state.activeKeys);
        nextActive.add(norm);
        if (codeKey) nextActive.add(codeKey);
        if (rawKey) nextActive.add(rawKey);

        // Aliases
        if (raw === ' ' || norm === 'space') nextActive.add('space');
        if (rawKey === 'control' || codeKey.includes('control')) {
          nextActive.add('ctrl');
          nextActive.add('control');
        }
        if (rawKey === 'shift' || codeKey.includes('shift')) {
          nextActive.add('shift');
        }
        if (rawKey === 'alt' || codeKey.includes('alt')) {
          nextActive.add('alt');
        }
        if (rawKey === 'meta' || codeKey.includes('meta')) {
          nextActive.add('win');
          nextActive.add('meta');
        }
        if (rawKey === 'escape') {
          nextActive.add('esc');
          nextActive.add('escape');
        }

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
        const { raw, code, norm } = action.payload;
        const codeKey = code ? code.toLowerCase() : '';
        const rawKey = raw ? raw.toLowerCase() : '';

        const nextActive = new Set(state.activeKeys);
        nextActive.delete(norm);
        if (codeKey) nextActive.delete(codeKey);
        if (rawKey) nextActive.delete(rawKey);

        if (raw === ' ' || norm === 'space') nextActive.delete('space');
        if (rawKey === 'control' || codeKey.includes('control')) {
          nextActive.delete('ctrl');
          nextActive.delete('control');
          nextActive.delete('controlleft');
          nextActive.delete('controlright');
        }
        if (rawKey === 'shift' || codeKey.includes('shift')) {
          nextActive.delete('shift');
          nextActive.delete('shiftleft');
          nextActive.delete('shiftright');
        }
        if (rawKey === 'alt' || codeKey.includes('alt')) {
          nextActive.delete('alt');
          nextActive.delete('altleft');
          nextActive.delete('altright');
        }
        if (rawKey === 'meta' || codeKey.includes('meta')) {
          nextActive.delete('win');
          nextActive.delete('meta');
          nextActive.delete('metaleft');
          nextActive.delete('metaright');
        }
        if (rawKey === 'escape') {
          nextActive.delete('esc');
          nextActive.delete('escape');
        }

        return { ...state, activeKeys: nextActive };
      }
      case 'RESET_ACTIVE':
        return { ...state, activeKeys: new Set<string>() };
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
// CUSTOM HOOK WITH TAB SCROLL SUPPRESSION
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

      // ── PREVENT BROWSER DEFAULT ACTIONS (SCROLL & FOCUS JUMPS) ──
      // This strictly stops Tab from focusing away & scrolling the page!
      const SCROLL_KEYS = new Set([
        'Tab',
        ' ',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        'F1',
        'F3',
        'F7',
        'ContextMenu',
        'Backspace',
      ]);

      if (
        e.key === 'Tab' ||
        e.code === 'Tab' ||
        SCROLL_KEYS.has(e.key) ||
        SCROLL_KEYS.has(e.code)
      ) {
        e.preventDefault();
      }

      if (e.repeat && repeatRef.current.blockRepeats) return;
      const rawKey = e.key;
      if (typeof rawKey !== 'string' || rawKey.length === 0) return;

      const norm = normalizeKey(rawKey, e.code);
      const id   = nextId();
      dispatch({ type: 'KEY_DOWN', payload: { raw: rawKey, code: e.code, norm, id } });

      _soundEngine.setEnabled(Boolean(soundRef.current.enabled));
      _soundEngine.setVolume(soundRef.current.volume);
      _soundEngine.playClick();
    } catch { /* never crash */ }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    try {
      if (!e.isTrusted) return;

      if (e.key === 'Tab' || e.code === 'Tab') {
        e.preventDefault();
      }

      const rawKey = e.key;
      if (typeof rawKey !== 'string' || rawKey.length === 0) return;
      dispatch({ type: 'KEY_UP', payload: { raw: rawKey, code: e.code, norm: normalizeKey(rawKey, e.code) } });
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
      window.addEventListener('keydown',     handleKeyDown,    { passive: false });
      window.addEventListener('keyup',       handleKeyUp,      { passive: false });
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

interface KeyCapProps {
  keyDef: VirtualKey;
  isActive: boolean;
}

const KeyCap = memo(function KeyCap({ keyDef, isActive }: KeyCapProps) {
  if (keyDef.width && !keyDef.label && keyDef.id.startsWith('spacer')) {
    return <div style={{ width: `${keyDef.width}px`, flexShrink: 0 }} aria-hidden="true" />;
  }

  const isWide = (keyDef.width && keyDef.width > 55) || (keyDef.gridColSpan && keyDef.gridColSpan > 1);
  const isTall = keyDef.gridRowSpan && keyDef.gridRowSpan > 1;

  return (
    <div
      role="img"
      aria-label={`${keyDef.label} key${isActive ? ' — pressed' : ''}`}
      aria-pressed={isActive}
      style={{
        width: keyDef.width ? `${keyDef.width}px` : '100%',
        minWidth: keyDef.width ? `${keyDef.width}px` : '40px',
        height: isTall ? '86px' : '40px',
        gridColumn: keyDef.gridColSpan ? `span ${keyDef.gridColSpan}` : undefined,
        gridRow: keyDef.gridRowSpan ? `span ${keyDef.gridRowSpan}` : undefined,
        background: isActive
          ? 'var(--neon-cyan, #00f5ff)'
          : 'rgba(255,255,255,0.04)',
        border: isActive
          ? '1px solid var(--neon-cyan, #00f5ff)'
          : '1px solid var(--border)',
        borderBottom: isActive
          ? '1px solid rgba(0,180,200,0.8)'
          : '3px solid rgba(255,255,255,0.15)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isWide ? '0.68rem' : '0.72rem',
        fontWeight: 700,
        color: isActive ? '#000000' : 'var(--text-secondary)',
        transition: 'all 0.05s ease',
        boxShadow: isActive ? '0 0 15px rgba(0,245,255,0.5), inset 0 0 6px rgba(255,255,255,0.4)' : 'none',
        transform: isActive ? 'translateY(2px)' : 'none',
        userSelect: 'none',
        flexShrink: 0,
        position: 'relative',
        boxSizing: 'border-box',
        cursor: 'default',
        padding: '2px 4px',
        lineHeight: 1.1,
      }}
    >
      {keyDef.subLabel && (
        <span
          style={{
            fontSize: '0.6rem',
            opacity: isActive ? 0.75 : 0.5,
            marginBottom: '1px',
            color: isActive ? '#111827' : 'var(--text-muted)',
          }}
        >
          {keyDef.subLabel}
        </span>
      )}
      <span style={{ textTransform: 'uppercase' }}>
        {keyDef.label}
      </span>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUAL KEYBOARD GRID WITH FULL LAYOUTS
// ─────────────────────────────────────────────────────────────────────────────

interface KeyboardGridProps {
  activeKeys: ReadonlySet<string>;
}

const KeyboardGrid = memo(function KeyboardGrid({ activeKeys }: KeyboardGridProps) {
  const [layoutMode, setLayoutMode] = useState<'100' | '80' | '60'>('100');

  // Check if key is active
  const isKeyActive = useCallback((keyDef: VirtualKey): boolean => {
    if (!keyDef.matchKeys || keyDef.matchKeys.length === 0) return false;
    return keyDef.matchKeys.some(k => activeKeys.has(k.toLowerCase()));
  }, [activeKeys]);

  const mainRows = useMemo(() => {
    if (layoutMode === '60') {
      // Exclude F-row for 60% compact
      return MAIN_BLOCK_ROWS.slice(1);
    }
    return MAIN_BLOCK_ROWS;
  }, [layoutMode]);

  return (
    <div
      role="presentation"
      aria-label="Virtual keyboard — active keys light up"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
      }}
    >
      {/* ── LAYOUT SELECTOR TABS ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Layout Mode:
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', fontWeight: 600 }}>
            {layoutMode === '100' ? '104-Key Full Size (Numpad + Arrows + F-Row)' : layoutMode === '80' ? 'Tenkeyless (TKL + Arrows + F-Row)' : '60% Compact'}
          </span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {[
            { id: '100', label: '100% Full Keyboard' },
            { id: '80',  label: '80% TKL' },
            { id: '60',  label: '60% Compact' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLayoutMode(tab.id as '100' | '80' | '60')}
              style={{
                padding: '5px 12px',
                borderRadius: '7px',
                border: 'none',
                background: layoutMode === tab.id ? 'var(--neon-cyan)' : 'transparent',
                color: layoutMode === tab.id ? '#000000' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SCROLLABLE KEYBOARD HOUSING ── */}
      <div style={{ overflowX: 'auto', paddingBottom: '0.75rem' }}>
        <div
          style={{
            display: 'inline-flex',
            gap: '16px',
            alignItems: 'flex-start',
            minWidth: layoutMode === '100' ? '960px' : layoutMode === '80' ? '800px' : '640px',
          }}
        >
          {/* BLOCK 1: MAIN ALPHANUMERIC & FUNCTION KEYS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {mainRows.map((row, rIdx) => (
              <div key={rIdx} style={{ display: 'flex', gap: '5px' }}>
                {row.map((keyDef) => (
                  <KeyCap
                    key={keyDef.id}
                    keyDef={keyDef}
                    isActive={isKeyActive(keyDef)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* BLOCK 2: NAVIGATION & ARROW KEYS (100% and 80% only) */}
          {layoutMode !== '60' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {NAV_BLOCK_ROWS.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', gap: '5px' }}>
                  {row.map((keyDef) => (
                    <KeyCap
                      key={keyDef.id}
                      keyDef={keyDef}
                      isActive={isKeyActive(keyDef)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* BLOCK 3: FULL NUMERIC KEYPAD (100% only) */}
          {layoutMode === '100' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Header spacer to align with F-Row */}
              <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  NUMPAD
                </span>
              </div>

              {/* Grid 4 columns x 5 rows */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 40px)',
                  gridTemplateRows: 'repeat(5, 40px)',
                  gap: '5px',
                }}
              >
                {NUMPAD_KEYS.map((keyDef) => (
                  <KeyCap
                    key={keyDef.id}
                    keyDef={keyDef}
                    isActive={isKeyActive(keyDef)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
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
              <span key={k.id} aria-label={safeLabel(k.key)}
                style={{
                  padding: '0.2rem 0.5rem', borderRadius: '4px',
                  background: i === 0 ? 'rgba(0,245,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border:     `1px solid ${i === 0 ? 'var(--neon-cyan)' : 'var(--border)'}`,
                  fontSize: '0.75rem', fontWeight: 600,
                  color: i === 0 ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                  fontFamily: 'monospace',
                }}
              >
                {safeLabel(k.key)}
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
              <div key={key} role="listitem" aria-label={`${safeLabel(key)}: pressed ${count} times`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0.5rem' }}
              >
                <span style={{ minWidth: '42px', height: '28px', padding: '0 4px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--neon-cyan)', flexShrink: 0 }}>
                  {safeLabel(key)}
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
    a: 'Certain key combinations such as Alt+Tab or OS-level shortcuts are intercepted by your operating system before they reach the browser. The Key Visualizer captures all standard keys including F-keys, Numpad, and Arrows.',
  },
  {
    q: 'How is the Most Used Keys bar width calculated?',
    a: 'The progress bar uses your highest single-key press count as the 100% anchor. All other keys scale proportionally, giving a clear visual comparison of your typing habits.',
  },
  {
    q: 'Can the Key Visualizer test Numpad and Arrow keys?',
    a: 'Yes! The 100% Full Keyboard layout displays the complete numeric keypad (with NumLock, operators, numbers, and Numpad Enter) as well as the independent arrow and navigation clusters.',
  },
  {
    q: 'Can the Key Visualizer detect multi-key rollover (NKRO) and ghosting?',
    a: 'Yes. Press multiple keys simultaneously to test whether your keyboard registers all inputs without blocking or ghosting.',
  },
  {
    q: 'Does the Key Visualizer store or transmit my keystrokes?',
    a: 'No. All keystroke data is processed entirely in your browser memory. Nothing is stored in a database, sent to a server, or logged externally.',
  },
  {
    q: 'What browsers does the Key Visualizer support?',
    a: 'The Key Visualizer works on all modern browsers including Chrome, Firefox, Edge, Safari, and Opera. Tab navigation scrolling is prevented so you can test smoothly.',
  },
];

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
    'Real-time key detection for 100% full keyboards',
    'Numpad and Arrow key testing',
    'Function key F1-F12 testing',
    'Active key highlighting with zero Tab scroll',
    'Key press history log',
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
    Object.freeze({ '@type': 'ListItem', 'position': 1, 'name': 'Home',           'item': 'https://fixedaim.com/'               }),
    Object.freeze({ '@type': 'ListItem', 'position': 2, 'name': 'Keyboard',       'item': 'https://fixedaim.com/keyboard'       }),
    Object.freeze({ '@type': 'ListItem', 'position': 3, 'name': 'Key Visualizer', 'item': PAGE_META.canonical                   }),
  ]),
});

// ─────────────────────────────────────────────────────────────────────────────
// SEO ARTICLE
// ─────────────────────────────────────────────────────────────────────────────

const ArticleSection = lazy(() =>
  Promise.resolve({
    default: memo(function ArticleSection() {
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
        <article aria-label="Key Visualizer guide and information">
          <h2 id="how-to-use" style={h2Style}>How to Use the Key Visualizer</h2>
          <p style={pStyle}>
            FixedAim&apos;s <strong>Key Visualizer</strong> is a high-precision, zero-latency keyboard testing suite.
            Simply start pressing any key on your physical keyboard to see it actuate on the virtual display in real time.
            Whether you are testing individual mechanical switches, identifying ghosted clusters, or benchmarking multi-key rollover (NKRO),
            every keystroke is captured with sub-millisecond hardware accuracy.
          </p>

          <h3 style={h3Style}>1. Switch Between Full 100%, TKL, and 60% Layouts</h3>
          <p style={pStyle}>
            Use the layout switcher at the top of the keyboard to choose between:
          </p>
          <ul style={ulStyle}>
            <li style={liStyle}><strong>100% Full Keyboard:</strong> Includes standard alphanumeric keys, Function Row (<code style={codeStyle}>F1–F12</code>), Navigation Cluster (<code style={codeStyle}>Ins, Del, Home, End, PgUp, PgDn</code>), dedicated Arrow Keys, and a complete Numeric Keypad.</li>
            <li style={liStyle}><strong>80% Tenkeyless (TKL):</strong> Retains the Function Row, Navigation Cluster, and Arrow Keys without the Numpad.</li>
            <li style={liStyle}><strong>60% Compact:</strong> Streamlined alphanumeric layout optimized for compact desks and mobile screens.</li>
          </ul>

          <h3 style={h3Style}>2. Testing Key Rollover (NKRO) & Ghosting</h3>
          <p style={pStyle}>
            Press and hold multiple keys simultaneously (e.g. <code style={codeStyle}>W + A + S + D + Shift + Space</code>).
            The <em>Active Keys</em> counter reflects the exact number of switches registered simultaneously.
            Quality gaming keyboards feature N-Key Rollover (NKRO), allowing all held keys to register without dropped inputs.
          </p>

          <h2 id="features" style={h2Style}>Features of This Keyboard Visualizer</h2>
          <ul style={ulStyle}>
            <li style={liStyle}><strong>Complete 104-Key Coverage:</strong> Includes F-keys, Numpad, and navigation clusters.</li>
            <li style={liStyle}><strong>Zero-Scroll Tab Key:</strong> Tab navigation is suppressed so you can test the <code style={codeStyle}>Tab</code> key smoothly without viewport jumps.</li>
            <li style={liStyle}><strong>Live Key Log:</strong> Inspect your last 20 keystrokes with timestamps and clear badges.</li>
            <li style={liStyle}><strong>Usage Bar Chart:</strong> Analyze which keys receive the heaviest actuation during gaming and typing sessions.</li>
            <li style={liStyle}><strong>Mechanical Audio Feedback:</strong> Optional Web Audio click sounds simulate mechanical key switch actuation.</li>
          </ul>

          <h2 id="benefits-gamers" style={h2Style}>Benefits for Gamers</h2>
          <p style={pStyle}>
            In fast-paced competitive esports (Valorant, CS2, Fortnite, Apex Legends, and Minecraft PvP), input consistency is vital.
            A single chatter-prone switch or unseated keycap can break strafe movement or weapon swaps.
            Using this tool, gamers can diagnose switch debounce bounce, dead switches, and key rollover limits before entering ranked matches.
          </p>

          <h2 id="benefits-typists" style={h2Style}>Benefits for Programmers and Typists</h2>
          <p style={pStyle}>
            Programmers rely heavily on modifier keys (<code style={codeStyle}>Ctrl, Alt, Shift, Win</code>) and punctuation brackets (<code style={codeStyle}>&#123;&#125;, [], &lt;&gt;, ;, :</code>).
            The Key Visualizer verifies that every modifier and symbol switch actuates reliably on both hands.
          </p>

          <h2 id="common-problems" style={h2Style}>Common Keyboard Problems You Can Detect</h2>
          <ul style={ulStyle}>
            <li style={liStyle}><strong>Key Chatter (Double-Typing):</strong> If a single light tap increments the count by 2 or more, your mechanical switch leaf is bouncing or oxidized.</li>
            <li style={liStyle}><strong>Dead Keys:</strong> If a keycap fails to illuminate when pressed, the PCB trace or switch diode may be faulty.</li>
            <li style={liStyle}><strong>Key Ghosting:</strong> If pressing three keys causes an adjacent unpressed key to falsely register, your keyboard matrix lacks anti-ghosting diodes.</li>
          </ul>

          <h2 id="browser-compat" style={h2Style}>Browser Compatibility</h2>
          <p style={pStyle}>
            FixedAim Key Visualizer is compatible with all modern desktop and mobile browsers, including Google Chrome, Mozilla Firefox, Microsoft Edge, Brave, and Apple Safari.
          </p>

          <h2 id="privacy" style={h2Style}>Privacy & Security</h2>
          <p style={pStyle}>
            Your keystrokes are processed strictly in local browser memory via JavaScript event listeners.
            No data is transmitted over the network, stored in cookies, or sent to any analytics server.
          </p>

          <h2 id="conclusion" style={h2Style}>Conclusion</h2>
          <p style={pStyle}>
            Keep your peripherals in peak mechanical condition with FixedAim&apos;s full-size Key Visualizer.
            Benchmark, diagnose, and train with confidence.
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

  const [sound, setSound]   = useState<SoundSettings>({ enabled: false, volume: 0.4 });
  const [repeat, setRepeat] = useState<RepeatSettings>({ blockRepeats: false });

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
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '2rem 1.25rem' }}>

      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Keyboard Tool</div>
        <h1 className="tool-title">Key Visualizer</h1>
        <p className="tool-subtitle">Real-time full keyboard display — test all 104 keys, Numpad, F-keys & Arrows</p>
      </header>

      <div role="region" aria-label="Keyboard statistics"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}
      >
        {statsData.map(s => (
          <StatCard key={s.label} value={s.value} label={s.label} color={s.color} />
        ))}
      </div>

      <SoundControls sound={sound} repeat={repeat} onSound={setSound} onRepeat={setRepeat} />

      <div role="note" aria-label="Typing instruction"
        style={{ background: 'rgba(0,245,255,0.05)', border: '1px dashed rgba(0,245,255,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}
      >
        ⌨️ Press any key on your keyboard to test! (Tab key scroll is disabled for smooth testing)
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

      {/* ── SEO Article + FAQ wrapper ── */}
      <div style={{ marginTop: '2rem' }}>

        {/* Reading time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <span aria-hidden="true">🕐</span>
          <span aria-label={`Estimated reading time: ${READING_TIME_MIN} minutes`}>{READING_TIME_MIN} min read</span>
        </div>

        <TableOfContents />

        {/* Article section */}
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

        {/* FAQ accordion */}
        <KeyVisualizerErrorBoundary label="FAQ section">
          <FaqSection />
        </KeyVisualizerErrorBoundary>

      </div>
    </div>
  );
}
