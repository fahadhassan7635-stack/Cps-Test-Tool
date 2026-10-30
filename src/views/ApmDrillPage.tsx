"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Volume2, VolumeX, RotateCcw, Home, ChevronRight, Zap, Target,
  Trophy, HelpCircle, ChevronDown, ChevronUp, Activity, Award
} from 'lucide-react';

const SITE_URL = 'https://fixedaim.com/apm-drill';

interface ModeConfig {
  id: 'g3' | 'g4' | 'g5' | 'kb';
  label: string;
  type: 'grid' | 'kb';
  n?: number;
}

const MODES: ModeConfig[] = [
  { id: 'g3', label: '3×3 Grid', type: 'grid', n: 3 },
  { id: 'g4', label: '4×4 Grid', type: 'grid', n: 4 },
  { id: 'g5', label: '5×5 Grid', type: 'grid', n: 5 },
  { id: 'kb', label: 'Keyboard Drill', type: 'kb' },
];

const DURATIONS = [15, 30, 60, 120];

interface Tier {
  name: string;
  min: number;
  range: string;
}

const TIERS: Tier[] = [
  { name: 'Beginner', min: 65, range: '65–110 APM' },
  { name: 'Skilled', min: 111, range: '111–160 APM' },
  { name: 'Expert', min: 161, range: '161–199 APM' },
  { name: 'Master', min: 200, range: '200+ APM' },
];

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ─── Sound System ───────────────────────────────────────────────────────────
class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  public on = true;
  public vol = 60;
  public style: 'pop' | 'thock' | 'blip' | 'tick' = 'pop';

  private ensure() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.vol / 100;
        this.master.connect(this.ctx.destination);

        const len = Math.floor(this.ctx.sampleRate * 0.03);
        this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noise.getChannelData(0);
        for (let i = 0; i < len; i++) {
          d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        }
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    this.ensure();
  }

  private tone(type: OscillatorType, f0: number, f1: number, dur: number, gain: number, when = 0) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  public hit() {
    if (!this.on || !this.ensure() || !this.ctx || !this.master) return;
    const r = 0.94 + Math.random() * 0.12;
    const s = this.style;

    const burst = (freq: number, q: number, gain: number, type: BiquadFilterType) => {
      if (!this.noise || !this.ctx || !this.master) return;
      const src = this.ctx.createBufferSource();
      const f = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      src.buffer = this.noise;
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      g.gain.value = gain;
      src.connect(f);
      f.connect(g);
      g.connect(this.master);
      src.start();
    };

    if (s === 'pop') {
      this.tone('sine', 820 * r, 240 * r, 0.09, 0.4);
    } else if (s === 'thock') {
      this.tone('triangle', 190 * r, 65 * r, 0.09, 0.5);
      burst(1100 * r, 0.7, 0.6, 'lowpass');
    } else if (s === 'blip') {
      this.tone('square', 700 * r, 1400 * r, 0.06, 0.12);
      this.tone('square', 1400 * r, 1400 * r, 0.04, 0.08, 0.05);
    } else {
      this.tone('square', 1500 * r, 650 * r, 0.045, 0.1);
      burst(3200 * r, 0.8, 0.5, 'bandpass');
    }
  }

  public miss() {
    if (!this.on || !this.ensure()) return;
    this.tone('sawtooth', 190, 105, 0.15, 0.13);
  }

  public end() {
    if (!this.on || !this.ensure()) return;
    this.tone('sine', 660, 660, 0.18, 0.18, 0);
    this.tone('sine', 880, 880, 0.32, 0.18, 0.15);
  }

  public setVolume(v: number) {
    this.vol = v;
    if (this.master) this.master.gain.value = v / 100;
  }
}

// ─── More Tools List ────────────────────────────────────────────────────────
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

// ─── FAQ List ───────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'What is a good APM score?', a: 'On this test, 65 to 110 APM is a beginner score, 111 to 160 is skilled, and anything over 160 is expert level. A good score is one that beats your own best with high accuracy.' },
  { q: 'How is APM calculated?', a: 'APM equals your total clicks and key presses, including misses, divided by the elapsed seconds played, multiplied by 60. The FixedAim test calculates and displays this live while you play.' },
  { q: 'Does a miss count as an action?', a: 'Yes. A miss counts toward your total APM but lowers your accuracy. This ensures you cannot simply spam clicks randomly to achieve a high score.' },
  { q: 'Is APM the same as CPS?', a: 'No. CPS (clicks per second) counts pure clicking speed. APM measures actions per minute across both mouse clicks and keyboard presses while requiring you to locate and acquire specific targets.' },
  { q: 'Does the APM test work on mobile/phones?', a: 'Yes! The grid modes (3×3, 4×4, 5×5) fully support touchscreen taps with 0ms latency. The Keyboard Drill includes interactive touch keys as well as physical keyboard support.' },
  { q: 'Are my best scores saved?', a: 'Yes, your high scores for each board size and duration are saved locally in your browser. You can reset them anytime using the reset button in the sidebar.' },
  { q: 'Which test length should I use?', a: 'We recommend 60 seconds for a benchmark score that is comparable to standard competitive benchmarks. 15s and 30s are ideal for quick warm-ups, and 120s tests your muscle endurance.' },
  { q: 'Why does the timer start after my first hit?', a: 'The clock begins only when you make your first correct hit. This allows you to position your hand, mouse, or fingers without wasting any test time.' },
  { q: 'Why is my APM lower on the 5×5 grid?', a: 'The 5×5 grid covers 25 tiles with wider physical travel distance between targets. Having a lower APM on 5×5 compared to 3×3 is completely normal.' },
  { q: 'What does Peak APM mean?', a: 'Peak is your fastest burst speed during the drill, measured over a rolling 3-second window and scaled to 1 minute. It shows your maximum burst reaction limit.' },
  { q: 'Does the click sound affect performance?', a: 'No, the sound is purely instant auditory feedback synthesized directly in your browser. You can customize the sound style (pop, thock, blip, tick) or mute it anytime.' },
  { q: 'Can the Keyboard Drill help in gaming and esports?', a: 'Yes. It exercises high-speed key recall, finger independence, and hand-eye coordination required in RTS (StarCraft), MOBAs (League, Dota 2), and FPS games.' },
  { q: 'How often should I practice?', a: 'Short daily sessions of 5 to 10 minutes produce the fastest neuromuscular improvements. Always take breaks if your hand or wrist feels strained.' },
];

export default function ApmDrillPage() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'g3' | 'g4' | 'g5' | 'kb'>('g3');
  const [dur, setDur] = useState<number>(60);
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');

  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [peak, setPeak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [target, setTarget] = useState<number>(-1);
  const [targetKey, setTargetKey] = useState<string>('A');
  const [badTile, setBadTile] = useState<number | null>(null);
  const [badKey, setBadKey] = useState<string | null>(null);

  const [soundOn, setSoundOn] = useState(true);
  const [soundVol, setSoundVol] = useState(60);
  const [soundStyle, setSoundStyle] = useState<'pop' | 'thock' | 'blip' | 'tick'>('pop');

  const [bests, setBests] = useState<Record<string, number>>({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({ 0: true });

  const [finalStats, setFinalStats] = useState<{
    apm: number;
    acc: number;
    hits: number;
    misses: number;
    peak: number;
    rank: string;
    isBest: boolean;
  } | null>(null);

  // References
  const soundRef = useRef<SoundEngine | null>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const stampsRef = useRef<number[]>([]);
  const samplesRef = useRef<Array<{ t: number; live: number; avg: number }>>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const peakRef = useRef<number>(0);
  const hitsRef = useRef<number>(0);
  const missesRef = useRef<number>(0);
  const statusRef = useRef<'idle' | 'running' | 'done'>('idle');
  const modeRef = useRef(mode);
  const durRef = useRef(dur);
  const targetRef = useRef(target);
  const targetKeyRef = useRef(targetKey);

  modeRef.current = mode;
  durRef.current = dur;
  statusRef.current = status;
  hitsRef.current = hits;
  missesRef.current = misses;
  targetRef.current = target;
  targetKeyRef.current = targetKey;

  // Initialize SoundEngine on mount
  useEffect(() => {
    setMounted(true);
    const se = new SoundEngine();
    soundRef.current = se;

    // Load sound settings & bests from localStorage
    try {
      const savedSound = localStorage.getItem('apmdrill.sound');
      if (savedSound) {
        const parsed = JSON.parse(savedSound);
        if (typeof parsed.on === 'boolean') { se.on = parsed.on; setSoundOn(parsed.on); }
        if (typeof parsed.vol === 'number') { se.setVolume(parsed.vol); setSoundVol(parsed.vol); }
        if (parsed.style) { se.style = parsed.style; setSoundStyle(parsed.style); }
      }
      const savedBests = localStorage.getItem('apmdrill.bests');
      if (savedBests) {
        setBests(JSON.parse(savedBests));
      }
    } catch {
      // ignore localstorage errors
    }

    const unlockSound = () => se.unlock();
    window.addEventListener('pointerdown', unlockSound, { once: true });
    window.addEventListener('keydown', unlockSound, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockSound);
      window.removeEventListener('keydown', unlockSound);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const curMode = useMemo(() => MODES.find((m) => m.id === mode) || MODES[0], [mode]);
  const bestKey = useCallback((m: string, d: number) => `${m}-${d}`, []);

  const rankName = useCallback((apm: number) => {
    let name = 'Warming up';
    TIERS.forEach((t) => {
      if (apm >= t.min) name = t.name;
    });
    return name;
  }, []);

  // Target picker
  const pickNewTarget = useCallback(() => {
    const cur = MODES.find((m) => m.id === modeRef.current) || MODES[0];
    if (cur.type === 'grid') {
      const count = (cur.n || 3) * (cur.n || 3);
      let next: number;
      do {
        next = Math.floor(Math.random() * count);
      } while (next === targetRef.current && count > 1);
      setTarget(next);
      targetRef.current = next;
    } else {
      let nextKey: string;
      do {
        nextKey = LETTERS.charAt(Math.floor(Math.random() * 26));
      } while (nextKey === targetKeyRef.current);
      setTargetKey(nextKey);
      targetKeyRef.current = nextKey;
    }
  }, []);

  // Draw chart
  const drawChart = useCallback(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const L = 40, R = 14, T = 12, B = 24;
    const pw = w - L - R;
    const ph = h - T - B;

    const samples = samplesRef.current;
    let mx = 0;
    samples.forEach((s) => { mx = Math.max(mx, s.live, s.avg); });
    const maxY = Math.max(120, Math.ceil((mx * 1.15) / 40) * 40);
    const X = (t: number) => L + (t / durRef.current) * pw;
    const Y = (v: number) => T + ph * (1 - v / maxY);

    ctx.font = '11px sans-serif';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = Math.round(T + ph * (1 - i / 4)) + 0.5;
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(L, y);
      ctx.lineTo(w - R, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(Math.round((maxY * i) / 4)), L - 8, y);
    }

    // Time markers
    ctx.textBaseline = 'alphabetic';
    [
      [0, 'left'],
      [durRef.current / 2, 'center'],
      [durRef.current, 'right'],
    ].forEach(([timeVal, align]) => {
      ctx.fillStyle = '#64748b';
      ctx.textAlign = align as CanvasTextAlign;
      ctx.fillText(`${timeVal}s`, X(Number(timeVal)), h - 6);
    });

    if (samples.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Your real-time APM curve will appear here once the run starts.', L + pw / 2, T + ph / 2);
      return;
    }

    const buildPath = (key: 'live' | 'avg') => {
      ctx.beginPath();
      samples.forEach((s, idx) => {
        if (idx === 0) ctx.moveTo(X(s.t), Y(s[key]));
        else ctx.lineTo(X(s.t), Y(s[key]));
      });
    };

    // Area under live curve
    buildPath('live');
    ctx.lineTo(X(samples[samples.length - 1].t), Y(0));
    ctx.lineTo(X(samples[0].t), Y(0));
    ctx.closePath();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#00f5ff';
    ctx.fill();
    ctx.globalAlpha = 1;

    // Line paths
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;

    buildPath('avg');
    ctx.strokeStyle = '#9a7bff';
    ctx.stroke();

    buildPath('live');
    ctx.strokeStyle = '#00f5ff';
    ctx.stroke();

    // Pulse dot at current tip
    const last = samples[samples.length - 1];
    ctx.fillStyle = '#00f5ff';
    ctx.beginPath();
    ctx.arc(X(last.t), Y(last.live), 3.5, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  // Reset drill
  const resetDrill = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus('idle');
    setHits(0);
    setMisses(0);
    setPeak(0);
    setTimeLeft(durRef.current);
    setFinalStats(null);
    setBadTile(null);
    setBadKey(null);
    stampsRef.current = [];
    samplesRef.current = [];
    peakRef.current = 0;
    pickNewTarget();
    requestAnimationFrame(drawChart);
  }, [pickNewTarget, drawChart]);

  // Finish run
  const finishRun = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus('done');
    setTimeLeft(0);

    const total = hitsRef.current + missesRef.current;
    const avgApm = total / Math.max(durRef.current, 1) * 60;
    const finalApm = Math.round(avgApm);
    const finalAcc = total > 0 ? Math.round((hitsRef.current / total) * 100) : 100;
    const currentPeak = Math.round(peakRef.current);
    const rank = rankName(finalApm);

    const key = bestKey(modeRef.current, durRef.current);
    const prevBest = bests[key];
    const isNewBest = prevBest == null || finalApm > prevBest;

    if (isNewBest) {
      const updated = { ...bests, [key]: finalApm };
      setBests(updated);
      try {
        localStorage.setItem('apmdrill.bests', JSON.stringify(updated));
      } catch {}
    }

    setFinalStats({
      apm: finalApm,
      acc: finalAcc,
      hits: hitsRef.current,
      misses: missesRef.current,
      peak: currentPeak,
      rank,
      isBest: isNewBest,
    });

    if (soundRef.current) soundRef.current.end();
    drawChart();
  }, [bestKey, bests, rankName, drawChart]);

  // Tick function
  const onTick = useCallback(() => {
    const now = performance.now();
    const elapsed = Math.min((now - startTimeRef.current) / 1000, durRef.current);
    const remaining = Math.max(0, durRef.current - elapsed);
    setTimeLeft(Math.ceil(remaining));

    if (elapsed >= durRef.current) {
      finishRun();
      return;
    }

    const total = hitsRef.current + missesRef.current;
    const avg = total / Math.max(elapsed, 1) * 60;

    // Rolling 5s live APM
    const cut5 = now - 5000;
    const recent = stampsRef.current.filter((t) => t >= cut5);
    const live = recent.length / Math.min(5, Math.max(elapsed, 1)) * 60;

    // Rolling 3s peak APM
    if (elapsed >= 3) {
      const cut3 = now - 3000;
      const recent3 = stampsRef.current.filter((t) => t >= cut3);
      const curBurst = (recent3.length / 3) * 60;
      if (curBurst > peakRef.current) {
        peakRef.current = curBurst;
        setPeak(Math.round(curBurst));
      }
    }

    // Sample chart points every 0.5s
    const lastSampleT = samplesRef.current.length > 0 ? samplesRef.current[samplesRef.current.length - 1].t : 0;
    if (elapsed - lastSampleT >= 0.5) {
      samplesRef.current.push({ t: elapsed, live, avg });
      drawChart();
    }
  }, [finishRun, drawChart]);

  // Handle action (hit or miss)
  const handleAction = useCallback((isCorrect: boolean, tileIndex?: number, keyChar?: string) => {
    if (statusRef.current === 'done') return;
    const now = performance.now();

    if (statusRef.current === 'idle') {
      if (!isCorrect) {
        if (soundRef.current) soundRef.current.miss();
        if (tileIndex !== undefined) setBadTile(tileIndex);
        if (keyChar) setBadKey(keyChar);
        setTimeout(() => { setBadTile(null); setBadKey(null); }, 250);
        return;
      }
      // Start run on first hit!
      setStatus('running');
      startTimeRef.current = now;
      stampsRef.current = [];
      samplesRef.current = [];
      peakRef.current = 0;
      setHits(0);
      setMisses(0);
      setFinalStats(null);
      timerRef.current = setInterval(onTick, 50);
    }

    stampsRef.current.push(now);

    if (isCorrect) {
      setHits((h) => h + 1);
      hitsRef.current += 1;
      if (soundRef.current) soundRef.current.hit();
      pickNewTarget();
    } else {
      setMisses((m) => m + 1);
      missesRef.current += 1;
      if (soundRef.current) soundRef.current.miss();
      if (tileIndex !== undefined) setBadTile(tileIndex);
      if (keyChar) setBadKey(keyChar);
      setTimeout(() => { setBadTile(null); setBadKey(null); }, 250);
    }
  }, [onTick, pickNewTarget]);

  // Keyboard drill key listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetDrill();
        return;
      }
      if (modeRef.current !== 'kb') return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        const pressed = e.key.toUpperCase();
        handleAction(pressed === targetKeyRef.current, undefined, pressed);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleAction, resetDrill]);

  // Reset drill whenever mode or duration changes
  useEffect(() => {
    resetDrill();
  }, [mode, dur, resetDrill]);

  // Sound preference changes
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (soundRef.current) {
      soundRef.current.on = next;
      soundRef.current.hit();
    }
    try {
      localStorage.setItem('apmdrill.sound', JSON.stringify({ on: next, vol: soundVol, style: soundStyle }));
    } catch {}
  };

  const handleVolumeChange = (v: number) => {
    setSoundVol(v);
    if (soundRef.current) soundRef.current.setVolume(v);
    try {
      localStorage.setItem('apmdrill.sound', JSON.stringify({ on: soundOn, vol: v, style: soundStyle }));
    } catch {}
  };

  const handleStyleChange = (s: 'pop' | 'thock' | 'blip' | 'tick') => {
    setSoundStyle(s);
    if (soundRef.current) {
      soundRef.current.style = s;
      soundRef.current.hit();
    }
    try {
      localStorage.setItem('apmdrill.sound', JSON.stringify({ on: soundOn, vol: soundVol, style: s }));
    } catch {}
  };

  const handleResetBests = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    setConfirmReset(false);
    const updated = { ...bests };
    DURATIONS.forEach((d) => {
      delete updated[bestKey(mode, d)];
    });
    setBests(updated);
    try {
      localStorage.setItem('apmdrill.bests', JSON.stringify(updated));
    } catch {}
  };

  // Calculations for display
  const totalActions = hits + misses;
  const currentAccuracy = totalActions > 0 ? Math.round((hits / totalActions) * 100) : 100;
  const elapsedSec = status === 'idle' ? 0 : Math.max(1, dur - timeLeft);
  const liveApm = status === 'idle' ? 0 : Math.round((totalActions / elapsedSec) * 60);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '1.5rem 1rem 4rem', minHeight: '85vh', color: 'var(--text-primary)' }}>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://fixedaim.com/' },
              { '@type': 'ListItem', position: 2, name: 'Games', item: 'https://fixedaim.com/games' },
              { '@type': 'ListItem', position: 3, name: 'APM Drill', item: SITE_URL },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'APM Drill - Actions Per Minute Speed Test',
            operatingSystem: 'Any',
            applicationCategory: 'GameApplication',
            url: SITE_URL,
            description: 'Free online APM speed test and drill to test clicking actions per minute and keyboard speed.',
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />

      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <Home size={14} /> Home
        </Link>
        <ChevronRight size={13} />
        <Link href="/games" style={{ color: 'inherit', textDecoration: 'none' }}>Games</Link>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>APM Drill</span>
      </nav>

      {/* HEADER SECTION */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{
          display: 'inline-block',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--neon-cyan)',
          border: '1px solid var(--neon-cyan)',
          borderRadius: '999px',
          padding: '4px 14px',
          marginBottom: '0.75rem'
        }}>
          SPEED TEST & DRILL
        </span>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          margin: '0 0 0.5rem',
          color: 'var(--neon-cyan)',
          textShadow: '0 0 24px rgba(0,245,255,0.4)',
          letterSpacing: '-0.02em'
        }}>
          APM Drill
        </h1>
        <p style={{
          margin: '0 auto',
          maxWidth: '620px',
          color: 'var(--text-secondary)',
          fontSize: '1rem',
          lineHeight: '1.6'
        }}>
          Measure your actions per minute with surgical precision. Pick a grid or keyboard drill, then click or type as fast and cleanly as you can.
        </p>
      </header>

      {/* TOOLBAR */}
      <section aria-label="Test settings" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '10px 14px',
        padding: '12px 18px',
        background: 'var(--bg-card, #111823)',
        border: '1px solid var(--border, #243245)',
        borderRadius: '16px',
        marginBottom: '1.25rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.95rem', color: 'var(--neon-cyan)' }}>
          <Zap size={18} /> APM
        </div>

        <div style={{ width: '1px', height: '22px', background: 'var(--border, #243245)' }} />

        {/* Mode selector */}
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px' }}>
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              style={{
                fontWeight: 600,
                fontSize: '0.85rem',
                color: mode === m.id ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                background: mode === m.id ? 'rgba(0,245,255,0.1)' : 'transparent',
                border: `1px solid ${mode === m.id ? 'var(--neon-cyan)' : 'var(--border, #243245)'}`,
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '22px', background: 'var(--border, #243245)' }} />

        {/* Duration selector */}
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px' }}>
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDur(d)}
              style={{
                fontWeight: 600,
                fontSize: '0.85rem',
                color: dur === d ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                background: dur === d ? 'rgba(0,245,255,0.1)' : 'transparent',
                border: `1px solid ${dur === d ? 'var(--neon-cyan)' : 'var(--border, #243245)'}`,
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {d}s
            </button>
          ))}
        </div>

        {/* Sound Controls */}
        <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={toggleSound}
            title={soundOn ? 'Sound On' : 'Sound Muted'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: soundOn ? 'var(--neon-cyan)' : 'var(--text-secondary)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border, #243245)',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer'
            }}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <input
            type="range"
            min={0}
            max={100}
            value={soundVol}
            disabled={!soundOn}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            style={{ width: '70px', accentColor: 'var(--neon-cyan)', cursor: 'pointer' }}
            aria-label="Click sound volume"
          />

          <select
            value={soundStyle}
            disabled={!soundOn}
            onChange={(e) => handleStyleChange(e.target.value as 'pop' | 'thock' | 'blip' | 'tick')}
            style={{
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border, #243245)',
              borderRadius: '8px',
              padding: '6px 8px',
              cursor: 'pointer'
            }}
          >
            <option value="pop" style={{ background: '#111823' }}>Soft pop</option>
            <option value="thock" style={{ background: '#111823' }}>Keyboard thock</option>
            <option value="blip" style={{ background: '#111823' }}>Arcade blip</option>
            <option value="tick" style={{ background: '#111823' }}>Sharp tick</option>
          </select>
        </div>
      </section>

      {/* MAIN GAME LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: '16px', alignItems: 'start', marginBottom: '1.5rem' }}>
        {/* PLAY ARENA */}
        <section style={{
          background: 'var(--bg-card, #111823)',
          border: '1px solid var(--border, #243245)',
          borderRadius: '16px',
          padding: '1.25rem',
          minWidth: 0,
          position: 'relative'
        }}>
          {/* STATS HEADER */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>APM</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neon-cyan)' }}>{liveApm}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Accuracy</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{currentAccuracy}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Peak</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{peak}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Hits</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{hits}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Time Left</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: timeLeft <= 5 && status === 'running' ? '#ff6b5e' : 'inherit' }}>
                {status === 'idle' ? `${dur}s` : `${timeLeft}s`}
              </div>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', marginTop: '14px' }}>
            <div style={{
              height: '100%',
              width: `${status === 'idle' ? 0 : Math.min(100, ((dur - timeLeft) / dur) * 100)}%`,
              background: 'var(--neon-cyan)',
              transition: 'width 0.1s linear'
            }} />
          </div>

          {/* HINT TEXT */}
          <p style={{ margin: '12px 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {status === 'done' ? (
              <span><b>Time is up!</b> Check your results and click Play Again.</span>
            ) : status === 'idle' ? (
              <span>
                <b>Hit the highlighted {curMode.type === 'grid' ? 'cyan tile' : 'letter'}</b> to start the {dur}s clock.
              </span>
            ) : (
              <span>
                <b>Keep going!</b> Hit the highlighted {curMode.type === 'grid' ? 'tile' : 'letter'} as fast as possible.
              </span>
            )}
          </p>

          {/* STAGE CONTAINER */}
          <div style={{
            position: 'relative',
            marginTop: '16px',
            minHeight: '340px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            padding: '16px',
            userSelect: 'none'
          }}>
            {/* GRID MODE */}
            {curMode.type === 'grid' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${curMode.n || 3}, minmax(0, 1fr))`,
                gap: curMode.n === 3 ? '12px' : curMode.n === 4 ? '10px' : '8px',
                width: 'min(100%, 420px)',
                aspectRatio: '1',
              }}>
                {Array.from({ length: (curMode.n || 3) * (curMode.n || 3) }).map((_, idx) => {
                  const isTarget = idx === target;
                  const isBad = badTile === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Tile ${idx + 1}`}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        handleAction(isTarget, idx);
                      }}
                      style={{
                        border: '0',
                        borderRadius: '12px',
                        background: isBad ? '#ff6b5e' : isTarget ? 'var(--neon-cyan)' : 'var(--bg-card, #1a2433)',
                        boxShadow: isTarget ? '0 0 24px rgba(0,245,255,0.5)' : 'none',
                        cursor: 'pointer',
                        touchAction: 'manipulation',
                        outline: 'none',
                        transition: 'transform 0.08s ease, background 0.1s ease',
                        transform: isBad ? 'scale(0.95)' : isTarget ? 'scale(1.02)' : 'scale(1)',
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* KEYBOARD DRILL MODE */}
            {curMode.type === 'kb' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
                {/* BIG TARGET LETTER CARD */}
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '18px',
                  background: 'var(--neon-cyan)',
                  color: '#000',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '62px',
                  fontWeight: 900,
                  boxShadow: '0 0 32px rgba(0,245,255,0.45)',
                  letterSpacing: '-0.02em',
                }}>
                  {targetKey}
                </div>

                {/* ON-SCREEN KEYBOARD */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxWidth: '520px' }}>
                  {ROWS.map((row, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      {row.split('').map((ch) => {
                        const isTarget = ch === targetKey;
                        const isBad = badKey === ch;
                        return (
                          <button
                            key={ch}
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              handleAction(isTarget, undefined, ch);
                            }}
                            style={{
                              flex: '1 1 0',
                              minWidth: 0,
                              maxWidth: '46px',
                              height: '44px',
                              border: 0,
                              borderRadius: '8px',
                              background: isBad ? '#ff6b5e' : isTarget ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.06)',
                              color: isTarget ? '#000' : 'var(--text-secondary)',
                              fontSize: '14px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              touchAction: 'manipulation',
                              boxShadow: isTarget ? '0 0 16px rgba(0,245,255,0.45)' : 'none',
                              padding: 0
                            }}
                          >
                            {ch}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RESULTS OVERLAY */}
            {status === 'done' && finalStats && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(10, 15, 23, 0.94)',
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(8px)',
                zIndex: 10
              }}>
                <div style={{ width: 'min(100%, 360px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    {dur}s · {curMode.label}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '80px',
                    fontWeight: 900,
                    lineHeight: 1,
                    color: 'var(--neon-cyan)',
                    letterSpacing: '-0.03em'
                  }}>
                    {finalStats.apm}
                  </p>
                  <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    actions per minute
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '4px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>
                      {finalStats.rank}
                    </span>
                    {finalStats.isBest && (
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '4px 14px', borderRadius: '999px', background: 'var(--neon-cyan)', color: '#000' }}>
                        ⭐ New Best!
                      </span>
                    )}
                  </div>

                  {/* MINI STATS */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px', width: '100%', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Accuracy</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{finalStats.acc}%</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Hits</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{finalStats.hits}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Misses</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: finalStats.misses > 0 ? '#ff6b5e' : 'inherit' }}>{finalStats.misses}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Peak</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--neon-cyan)' }}>{finalStats.peak}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={resetDrill}
                    style={{
                      border: 0,
                      borderRadius: '10px',
                      background: 'var(--neon-cyan)',
                      color: '#000',
                      fontWeight: 800,
                      fontSize: '1rem',
                      padding: '12px 32px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <RotateCcw size={16} /> Play Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SIDEBAR: BESTS & RANKS */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* PERSONAL BESTS */}
          <section style={{
            background: 'var(--bg-card, #111823)',
            border: '1px solid var(--border, #243245)',
            borderRadius: '16px',
            padding: '16px'
          }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={14} color="var(--neon-cyan)" /> Your Best · {curMode.label}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px' }}>
              {DURATIONS.map((d) => {
                const val = mounted ? bests[bestKey(mode, d)] : undefined;
                const isCur = d === dur;
                return (
                  <div
                    key={d}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '8px 4px',
                      border: `1px solid ${isCur ? 'var(--neon-cyan)' : 'var(--border, #243245)'}`,
                      borderRadius: '8px',
                      textAlign: 'center',
                      background: isCur ? 'rgba(0,245,255,0.04)' : 'transparent'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d}s</span>
                    <b style={{ fontSize: '1rem', fontWeight: 700, color: val != null ? 'var(--neon-cyan)' : 'inherit' }}>
                      {val != null ? Math.round(val) : '–'}
                    </b>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleResetBests}
              style={{
                marginTop: '12px',
                width: '100%',
                background: 'transparent',
                border: '1px solid var(--border, #243245)',
                color: confirmReset ? '#ff6b5e' : 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '7px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {confirmReset ? 'Click again to confirm' : 'Reset bests for this mode'}
            </button>
            <p style={{ margin: '8px 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Saved locally in this browser.
            </p>
          </section>

          {/* RANK SCALE */}
          <section style={{
            background: 'var(--bg-card, #111823)',
            border: '1px solid var(--border, #243245)',
            borderRadius: '16px',
            padding: '16px'
          }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={14} color="var(--neon-cyan)" /> Rank Scale
            </h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {TIERS.map((t, idx) => {
                const isActive = liveApm >= t.min && (idx === TIERS.length - 1 || liveApm < TIERS[idx + 1].min) && status !== 'idle';
                return (
                  <li
                    key={t.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(0,245,255,0.1)' : 'transparent',
                      border: isActive ? '1px solid var(--neon-cyan)' : '1px solid transparent'
                    }}
                  >
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isActive ? 'var(--neon-cyan)' : 'var(--border, #243245)',
                      boxShadow: isActive ? '0 0 8px var(--neon-cyan)' : 'none'
                    }} />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.name}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{t.range}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>

      {/* REAL-TIME PERFORMANCE CHART */}
      <section style={{
        background: 'var(--bg-card, #111823)',
        border: '1px solid var(--border, #243245)',
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '2.5rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px 16px', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={16} color="var(--neon-cyan)" /> Real-Time APM Curve
          </h2>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <i style={{ width: '14px', height: '3px', borderRadius: '2px', background: 'var(--neon-cyan)', display: 'inline-block' }} /> Live APM
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <i style={{ width: '14px', height: '3px', borderRadius: '2px', background: '#9a7bff', display: 'inline-block' }} /> Average APM
            </span>
          </div>
        </div>
        <canvas
          ref={chartCanvasRef}
          role="img"
          aria-label="Line chart of live and average APM during run"
          style={{ display: 'block', width: '100%', height: '200px' }}
        />
      </section>

      {/* COMPREHENSIVE SEO CONTENT & GUIDES */}
      <article style={{ maxWidth: '860px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.75' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--neon-cyan)', margin: '2rem 0 1rem' }}>
          What Is an APM Test?
        </h2>
        <p>
          APM stands for <strong>actions per minute</strong>. Unlike raw CPS (clicks per second) which only counts rapid button mashing, APM measures every intentional click and keystroke performed over an extended period. Strategy gamers (StarCraft, Age of Empires), MOBA competitors (League of Legends, Dota 2), and precision FPS players rely on high APM to issue commands, navigate menus, and react swiftly during heated skirmishes.
        </p>
        <p>
          The FixedAim APM Drill gamifies this metric into a structured training tool. As glowing targets appear, you must quickly identify, target, and acquire them without hesitation. While wrong clicks or keys still register as actions, they penalize your overall accuracy score—ensuring that speed never comes at the cost of precision.
        </p>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '1.75rem 0 0.75rem' }}>
          🎮 How to Master the FixedAim APM Test
        </h3>
        <ul style={{ paddingLeft: '1.25rem', margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li><strong>Select your target mode:</strong> Choose from 3×3 (classic short-range grid), 4×4 (balanced search), 5×5 (wide-angle mouse precision), or the 26-letter Keyboard Drill.</li>
          <li><strong>Select your session length:</strong> Warm up with 15s or 30s, or test your true endurance with a competitive 60s or 120s marathon.</li>
          <li><strong>Zero-latency start:</strong> The countdown clock begins only when you land your first valid hit, giving you ample time to settle in.</li>
          <li><strong>Target acquisition:</strong> Click the lit neon tile or tap the highlighted key. Immediately look for the next target as it spawns.</li>
          <li><strong>Analyze your analytics:</strong> Review final APM, accuracy percentage, peak 3-second burst, and your progression curve on the real-time canvas chart.</li>
        </ul>

        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--neon-cyan)', margin: '2.5rem 0 1rem' }}>
          APM Test Modes Compared
        </h2>
        <div style={{ overflowX: 'auto', marginBottom: '2rem', border: '1px solid var(--border, #243245)', borderRadius: '12px', background: 'var(--bg-card, #111823)' }}>
          <table style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--neon-cyan)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Mode</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Targets</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Primary Skill</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Difficulty</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border, #243245)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--neon-cyan)' }}>3×3 Grid</td>
                <td style={{ padding: '12px 16px' }}>9 tiles</td>
                <td style={{ padding: '12px 16px', color: '#9a7bff' }}>Short rapid flicks</td>
                <td style={{ padding: '12px 16px' }}>Easy</td>
                <td style={{ padding: '12px 16px' }}>Warm-up & beginners</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border, #243245)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#ffb347' }}>4×4 Grid</td>
                <td style={{ padding: '12px 16px' }}>16 tiles</td>
                <td style={{ padding: '12px 16px', color: 'var(--neon-cyan)' }}>Target spotting</td>
                <td style={{ padding: '12px 16px' }}>Medium</td>
                <td style={{ padding: '12px 16px' }}>Daily speed training</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border, #243245)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#ff6b5e' }}>5×5 Grid</td>
                <td style={{ padding: '12px 16px' }}>25 tiles</td>
                <td style={{ padding: '12px 16px', color: '#ffb347' }}>Range & spatial focus</td>
                <td style={{ padding: '12px 16px' }}>Hard</td>
                <td style={{ padding: '12px 16px' }}>Mouse precision & aim</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#9a7bff' }}>Keyboard Drill</td>
                <td style={{ padding: '12px 16px' }}>26 keys</td>
                <td style={{ padding: '12px 16px', color: '#ff6b5e' }}>Key recall & finger speed</td>
                <td style={{ padding: '12px 16px' }}>Medium</td>
                <td style={{ padding: '12px 16px' }}>RTS, MOBA & FPS keybinds</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--neon-cyan)', margin: '2.5rem 0 1rem' }}>
          APM Rank Classification
        </h2>
        <div style={{ overflowX: 'auto', marginBottom: '2.5rem', border: '1px solid var(--border, #243245)', borderRadius: '12px', background: 'var(--bg-card, #111823)' }}>
          <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--neon-cyan)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Rank Tier</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>APM Range</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Description & Player Level</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border, #243245)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>Warming up</td>
                <td style={{ padding: '12px 16px' }}>Below 65</td>
                <td style={{ padding: '12px 16px' }}>Getting familiar with grid layouts and basic hand coordination.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border, #243245)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--neon-cyan)' }}>Beginner</td>
                <td style={{ padding: '12px 16px' }}>65 – 110</td>
                <td style={{ padding: '12px 16px' }}>Consistent fundamental rhythm. Focus on maintaining 95%+ accuracy.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border, #243245)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#9a7bff' }}>Skilled</td>
                <td style={{ padding: '12px 16px' }}>111 – 160</td>
                <td style={{ padding: '12px 16px' }}>Rapid muscle memory and sharp hand-eye coordination. Competitive gamer benchmark.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border, #243245)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#ffb347' }}>Expert</td>
                <td style={{ padding: '12px 16px' }}>161 – 199</td>
                <td style={{ padding: '12px 16px' }}>Elite reaction speed with virtually zero wasted clicks or hesitation.</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#ff6b5e' }}>Master</td>
                <td style={{ padding: '12px 16px' }}>200+</td>
                <td style={{ padding: '12px 16px' }}>Professional esports echelon. Peak burst capacity maintained over full duration.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--neon-cyan)', margin: '2.5rem 0 1rem' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '3rem' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = !!faqOpen[idx];
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card, #111823)',
                  border: `1px solid ${isOpen ? 'var(--neon-cyan)' : 'var(--border, #243245)'}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                  style={{
                    width: '100%',
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    background: 'transparent',
                    border: 0,
                    color: 'var(--text-primary)',
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} color="var(--neon-cyan)" /> : <ChevronDown size={18} />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 18px 16px', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.7' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

                {/* ── MORE TOOLS GRID ── */}
        <section aria-label="More Tools" style={{ marginTop: '3.5rem', marginBottom: '2.5rem' }}>
          <h2 style={{
            fontWeight: 800, fontSize: '1.5rem', color: '#fff',
            marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '-0.3px',
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
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '0.6rem',
                  background: 'var(--bg-card, #111823)',
                  border: '1px solid var(--border, #243245)',
                  borderRadius: '14px',
                  padding: '1.2rem 0.5rem',
                  cursor: 'pointer', textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,245,255,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,245,255,0.35)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-card, #111823)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, #243245)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--neon-cyan)', transition: 'color 0.3s ease',
                }}>
                  {icon}
                </div>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  color: '#cbd5e1', textAlign: 'center', lineHeight: 1.3,
                }}>{label}</span>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
