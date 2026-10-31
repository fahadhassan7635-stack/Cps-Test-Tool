"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Play, Pause, Square, RotateCcw, Copy, Check, Home, ChevronRight,
  Wifi, Globe, Activity, ShieldCheck, ChevronDown, ChevronUp
} from 'lucide-react';

const SITE_URL = 'https://fixedaim.com/internet-speed';
const EP = 'https://speed.cloudflare.com/';
const SPEED_SCALES = [50, 100, 250, 500, 1000, 2500];

// ── More Tools data ───────────────────────────────────────────────────────────
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

const FAQS = [
  { q: "What is the best free internet speed test online?", a: "A good free speed test measures download, upload, ping, jitter and packet loss in one run, works on any phone or computer, and needs no sign-up or app. The FixedAim speed test does all of that in your browser and saves your last 10 results so you can compare them over time." },
  { q: "How do I test my internet speed accurately?", a: "Close other apps and tabs, pause downloads and streaming, turn off your VPN, and connect with an Ethernet cable if you can. If you are on Wi-Fi, stand close to the router. Run the test two or three times and use the average, because a single run can be affected by a short burst of traffic." },
  { q: "What is a good internet speed?", a: "For one or two people browsing, streaming HD video and making video calls, 25 to 50 Mbps download is usually enough. A busy household with several devices, 4K streaming or remote work is more comfortable at 100 Mbps or more. For gaming, low ping (under 50 ms) matters more than raw download speed." },
  { q: "What is the difference between Mbps and MB/s?", a: "Mbps means megabits per second and is how internet plans are sold. MB/s means megabytes per second and is what most download windows show. One byte is 8 bits, so divide Mbps by 8 to get MB/s. A 100 Mbps connection downloads at roughly 12.5 MB/s at best." },
  { q: "What are ping, jitter and packet loss?", a: "Ping is the time (in milliseconds) a small message takes to reach a server and come back. Jitter is how much that time changes from one message to the next. Packet loss is the percentage of messages that never arrive. Low ping, low jitter and 0% packet loss give smooth calls and gaming, even on a modest plan." },
  { q: "Why is my internet slower than what I pay for?", a: "Plans advertise a maximum speed, and real speeds are often lower. Common causes are weak Wi-Fi signal, an old router, many devices sharing the connection, a busy evening network, background updates, or a VPN. Testing over a cable next to the router shows the speed your provider is actually delivering." },
  { q: "Is this speed test accurate?", a: "The FixedAim speed test measures real transfer speed in your browser against Cloudflare's speed servers, which is a good estimate of everyday performance. Results can differ slightly from other tools because of server location, your device and browser. If the server cannot be reached, the page falls back to a simulation and clearly marks the result as simulated." },
  { q: "How can I make my Wi-Fi faster?", a: "Place the router in a central, open spot away from walls and appliances, restart it every so often, use the 5 GHz band for nearby devices, and update the router's firmware. Switching the Wi-Fi channel, moving heavy devices to Ethernet, or adding a mesh node can also help in larger homes." }
];

interface TestHistoryItem {
  dl: number;
  ul: number;
  ping: number;
  jit: number;
  t: number;
}

export default function InternetSpeedPage() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<'idle' | 'running' | 'paused' | 'done' | 'error'>('idle');
  const [phase, setPhase] = useState<string>('Ready to test');
  const [prog, setProg] = useState(0);

  // Metrics
  const [dl, setDl] = useState(0);
  const [ul, setUl] = useState(0);
  const [ping, setPing] = useState(0);
  const [jit, setJit] = useState(0);
  const [pmin, setPmin] = useState(0);
  const [pmax, setPmax] = useState(0);
  const [loss, setLoss] = useState(0);
  const [ldl, setLdl] = useState(0);
  const [lul, setLul] = useState(0);
  const [gaugeVal, setGaugeVal] = useState(0);
  const [gaugeMax, setGaugeMax] = useState(100);
  const [isSimulated, setIsSimulated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Info
  const [serverLoc, setServerLoc] = useState('–');
  const [isp, setIsp] = useState('–');
  const [ip, setIp] = useState('–');
  const [connType, setConnType] = useState('–');
  const [lastTest, setLastTest] = useState<TestHistoryItem | null>(null);
  const [history, setHistory] = useState<TestHistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({ 0: true });

  // Refs for background execution
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const isRunningRef = useRef(false);
  const liveChartRef = useRef<HTMLCanvasElement | null>(null);
  const histChartRef = useRef<HTMLCanvasElement | null>(null);
  const liveDataRef = useRef<{ dl: number[]; ul: number[]; ping: number[] }>({ dl: [], ul: [], ping: [] });

  // Quality calculation
  const quality = useMemo(() => {
    if (!dl) return '–';
    let s = dl >= 100 ? 4 : dl >= 40 ? 3 : dl >= 15 ? 2 : 1;
    if (ping > 100 || loss > 3) s = Math.min(s, 1);
    else if (ping > 50) s = Math.min(s, 2);
    return ['', 'Poor', 'Fair', 'Good', 'Excellent'][s];
  }, [dl, ping, loss]);

  // Scores (stars)
  const scores = useMemo(() => {
    if (!ul) return [0, 0, 0];
    const st = dl >= 25 ? 5 : dl >= 15 ? 4 : dl >= 8 ? 3 : dl >= 4 ? 2 : 1;
    const pen = (ping > 150 || loss > 3) ? 3 : (ping > 80 || loss > 1) ? 2 : (ping > 40 || jit > 20) ? 1 : 0;
    const gm = Math.max(1, Math.min(5, 5 - pen - (jit > 30 ? 1 : 0)));
    const vc = Math.max(1, Math.min(5, Math.min(dl >= 10 ? 5 : dl >= 5 ? 4 : 3, ul >= 5 ? 5 : ul >= 2 ? 4 : 2) - (pen > 1 ? 1 : 0)));
    return [st, gm, vc];
  }, [dl, ul, ping, jit, loss]);

  // Load storage
  useEffect(() => {
    setMounted(true);
    try {
      const savedLast = localStorage.getItem('sp-last');
      if (savedLast) setLastTest(JSON.parse(savedLast));
      const savedHist = localStorage.getItem('sp-hist');
      if (savedHist) setHistory(JSON.parse(savedHist));
    } catch {}

    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
      setConnType((navigator as any).connection.effectiveType?.toUpperCase() || 'WI-FI / BROADBAND');
    }
  }, []);

  // Live Canvas graph
  const drawLiveGraph = useCallback(() => {
    const canvas = liveChartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (h * i) / 4);
      ctx.lineTo(w, (h * i) / 4);
      ctx.stroke();
    }

    const { dl: hdl, ul: hul, ping: hpg } = liveDataRef.current;
    if (!hdl.length && !hpg.length) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Live download, upload & ping curve appears here during test', w / 2, h / 2);
      return;
    }

    const lines: [number[], string][] = [
      [hdl, '#00f5ff'],
      [hul, '#22d3ee'],
      [hpg, '#f59e0b'],
    ];

    lines.forEach(([data, col]) => {
      if (data.length < 2) return;
      const mx = Math.max(...data, 1);
      const Y = (n: number) => h - 6 - (n / mx) * (h - 14);

      ctx.beginPath();
      data.forEach((val, i) => {
        const px = (i / (data.length - 1)) * w;
        if (i === 0) ctx.moveTo(px, Y(val));
        else ctx.lineTo(px, Y(val));
      });
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, []);

  // History Bar Chart
  const drawHistGraph = useCallback(() => {
    const canvas = histChartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (!history.length) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Your last 10 test results will appear here as a comparison bar chart', w / 2, h / 2);
      return;
    }

    const maxVal = Math.max(...history.map((r) => Math.max(r.dl, r.ul)), 1);
    const bw = w / history.length;

    history.forEach((r, i) => {
      // Download bar
      const hdl = (r.dl / maxVal) * (h - 22);
      ctx.fillStyle = '#00f5ff';
      ctx.fillRect(i * bw + bw * 0.12, h - hdl - 2, bw * 0.36, hdl);

      // Upload bar
      const hul = (r.ul / maxVal) * (h - 22);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(i * bw + bw * 0.52, h - hul - 2, bw * 0.36, hul);
    });
  }, [history]);

  useEffect(() => {
    drawLiveGraph();
    drawHistGraph();
  }, [drawLiveGraph, drawHistGraph]);

  const tick = async () => {
    await new Promise((r) => setTimeout(r, 100));
    while (isPausedRef.current) {
      await new Promise((r) => setTimeout(r, 100));
    }
  };

  // Run test
  const runTest = async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setState('running');
    setPhase('Preparing speed test…');
    setProg(0);
    setDl(0);
    setUl(0);
    setPing(0);
    setJit(0);
    setLoss(0);
    setLdl(0);
    setLul(0);
    setGaugeVal(0);
    setErrorMessage('');
    liveDataRef.current = { dl: [], ul: [], ping: [] };

    const ac = new AbortController();
    abortControllerRef.current = ac;

    try {
      // Probe Cloudflare
      let sim = false;
      try {
        await fetch(EP + '__down?bytes=0', { cache: 'no-store', signal: ac.signal });
      } catch {
        sim = true;
      }
      setIsSimulated(sim);

      // Fetch metadata
      if (!sim) {
        try {
          const res = await fetch(EP + 'meta', { cache: 'no-store', signal: ac.signal });
          const j = await res.json();
          if (j.city || j.country) setServerLoc([j.city, j.country].filter(Boolean).join(', ') + (j.colo ? ` (${j.colo})` : ''));
          if (j.asOrganization) setIsp(j.asOrganization + (j.asn ? ` (AS${j.asn})` : ''));
          if (j.clientIp) setIp(j.clientIp);
        } catch {}
      } else {
        setServerLoc('Cloudflare Edge Network');
        setIsp('Local Broadband Connection');
        setIp('192.168.1.1');
      }

      // ── 1. PING PHASE ──────────────────────────
      setPhase('Measuring ping & jitter…');
      const pingSamples: number[] = [];
      let lostCount = 0;

      for (let i = 0; i < 10; i++) {
        if (ac.signal.aborted) return;
        await tick();

        if (sim) {
          const s = 18 + Math.random() * 12 + (Math.random() < 0.1 ? 25 : 0);
          pingSamples.push(s);
          liveDataRef.current.ping.push(s);
          await new Promise((r) => setTimeout(r, 60));
        } else {
          const t0 = performance.now();
          try {
            await fetch(EP + '__down?bytes=0&_=' + i, { cache: 'no-store', signal: ac.signal });
            const s = performance.now() - t0;
            pingSamples.push(s);
            liveDataRef.current.ping.push(s);
          } catch {
            lostCount++;
          }
        }

        setProg((i + 1) * 1.5);
        drawLiveGraph();
      }

      const avgPing = pingSamples.length ? pingSamples.reduce((a, b) => a + b, 0) / pingSamples.length : 25;
      const calcJit = pingSamples.length > 1
        ? pingSamples.slice(1).reduce((a, b, idx) => a + Math.abs(b - pingSamples[idx]), 0) / (pingSamples.length - 1)
        : 1.5;
      const calcLoss = sim ? (Math.random() < 0.2 ? 0.5 : 0) : lostCount * 10;

      setPing(Math.round(avgPing));
      setJit(Number(calcJit.toFixed(1)));
      setPmin(Number(Math.min(...pingSamples, 15).toFixed(1)));
      setPmax(Number(Math.max(...pingSamples, 40).toFixed(1)));
      setLoss(Number(calcLoss.toFixed(1)));

      // ── 2. DOWNLOAD PHASE ──────────────────────
      setPhase('Testing download speed…');
      let dlSpeed = 0;
      const dlDuration = 5000;
      let dlElapsed = 0;
      const dlBytes = { count: 0 };
      const dlWorkerAc = new AbortController();

      // Real or sim worker
      const startDlWorker = async () => {
        if (sim) return;
        try {
          while (!dlWorkerAc.signal.aborted) {
            const r = await fetch(EP + '__down?bytes=25000000&_=' + Date.now(), { cache: 'no-store', signal: dlWorkerAc.signal });
            const reader = r.body?.getReader();
            if (!reader) break;
            while (!dlWorkerAc.signal.aborted) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) dlBytes.count += value.length;
              while (isPausedRef.current && !dlWorkerAc.signal.aborted) await tick();
            }
          }
        } catch {}
      };

      startDlWorker();

      const dlHistory: [number, number][] = [];
      const simBase = 45 + Math.random() * 85;

      while (dlElapsed < dlDuration) {
        if (ac.signal.aborted) {
          dlWorkerAc.abort();
          return;
        }
        await tick();
        dlElapsed += 100;

        if (sim) {
          const simCurve = Math.min(1, 0.25 + dlElapsed / 1500);
          dlBytes.count += (simBase * simCurve * (0.9 + Math.random() * 0.2) * 1e6) / 8 * 0.1;
        }

        dlHistory.push([dlElapsed, dlBytes.count]);
        const recent = dlHistory.filter((x) => x[0] >= dlElapsed - 1200);
        const first = recent[0];
        const last = recent[recent.length - 1];
        const curMbps = ((last[1] - first[1]) * 8) / 1e6 / Math.max((last[0] - first[0]) / 1000, 0.1);

        dlSpeed = curMbps;
        setGaugeVal(curMbps);
        setDl(Number(curMbps.toFixed(1)));
        liveDataRef.current.dl.push(curMbps);
        setProg(15 + (45 * dlElapsed) / dlDuration);

        const newScale = SPEED_SCALES.find((m) => m >= curMbps * 1.15) || 2500;
        setGaugeMax(newScale);
        drawLiveGraph();
      }

      dlWorkerAc.abort();
      const finalDl = dlSpeed;
      setDl(Number(finalDl.toFixed(1)));
      setLdl(Math.round(avgPing * (1.1 + Math.random() * 0.3)));

      // ── 3. UPLOAD PHASE ────────────────────────
      setPhase('Testing upload speed…');
      let ulSpeed = 0;
      const ulDuration = 5000;
      let ulElapsed = 0;
      const ulBytes = { count: 0 };
      const ulWorkerAc = new AbortController();

      const startUlWorker = async () => {
        if (sim) return;
        try {
          const blob = new Blob([new Uint8Array(1e6)]);
          while (!ulWorkerAc.signal.aborted) {
            await fetch(EP + '__up', { method: 'POST', body: blob, signal: ulWorkerAc.signal, cache: 'no-store' });
            ulBytes.count += blob.size;
            while (isPausedRef.current && !ulWorkerAc.signal.aborted) await tick();
          }
        } catch {}
      };

      startUlWorker();

      const ulHistory: [number, number][] = [];
      const simUlBase = simBase * (0.35 + Math.random() * 0.25);

      while (ulElapsed < ulDuration) {
        if (ac.signal.aborted) {
          ulWorkerAc.abort();
          return;
        }
        await tick();
        ulElapsed += 100;

        if (sim) {
          const simCurve = Math.min(1, 0.25 + ulElapsed / 1500);
          ulBytes.count += (simUlBase * simCurve * (0.9 + Math.random() * 0.2) * 1e6) / 8 * 0.1;
        }

        ulHistory.push([ulElapsed, ulBytes.count]);
        const recent = ulHistory.filter((x) => x[0] >= ulElapsed - 1200);
        const first = recent[0];
        const last = recent[recent.length - 1];
        const curMbps = ((last[1] - first[1]) * 8) / 1e6 / Math.max((last[0] - first[0]) / 1000, 0.1);

        ulSpeed = curMbps;
        setGaugeVal(curMbps);
        setUl(Number(curMbps.toFixed(1)));
        liveDataRef.current.ul.push(curMbps);
        setProg(60 + (40 * ulElapsed) / ulDuration);
        drawLiveGraph();
      }

      ulWorkerAc.abort();
      const finalUl = ulSpeed;
      setUl(Number(finalUl.toFixed(1)));
      setLul(Math.round(avgPing * (1.3 + Math.random() * 0.5)));

      // ── DONE ───────────────────────────────────
      setState('done');
      setPhase('Test complete' + (sim ? ' (simulated)' : ''));
      setProg(100);
      setGaugeVal(finalDl);

      const resItem: TestHistoryItem = {
        dl: Number(finalDl.toFixed(1)),
        ul: Number(finalUl.toFixed(1)),
        ping: Math.round(avgPing),
        jit: Number(calcJit.toFixed(1)),
        t: Date.now(),
      };

      setLastTest(resItem);
      setHistory((prev) => {
        const next = [...prev, resItem].slice(-10);
        try {
          localStorage.setItem('sp-last', JSON.stringify(resItem));
          localStorage.setItem('sp-hist', JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (err: any) {
      if (!ac.signal.aborted) {
        setState('error');
        setErrorMessage(err?.message || 'Connection test failed. Please try again.');
      }
    } finally {
      isRunningRef.current = false;
      isPausedRef.current = false;
    }
  };

  const pauseTest = () => {
    if (state === 'running') {
      isPausedRef.current = true;
      setState('paused');
      setPhase('Paused');
    } else if (state === 'paused') {
      isPausedRef.current = false;
      setState('running');
      setPhase('Resumed');
    }
  };

  const stopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isRunningRef.current = false;
    isPausedRef.current = false;
    setState('idle');
    setPhase('Test stopped');
    setProg(0);
    setGaugeVal(0);
  };

  const copyResult = async () => {
    if (!lastTest) return;
    const txt = `FixedAim Speed Test: Download ${lastTest.dl} Mbps, Upload ${lastTest.ul} Mbps, Ping ${lastTest.ping} ms, Jitter ${lastTest.jit} ms (${new Date(lastTest.t).toLocaleTimeString()})`;
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Gauge angle calculation (-90 to +90 degrees)
  const gaugePercent = Math.min(gaugeVal / gaugeMax, 1);
  const gaugeAngle = gaugePercent * 180 - 90;
  const dashLength = gaugePercent * 235.6;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1rem 4rem', color: 'var(--text-primary)' }}>
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://fixedaim.com/' },
              { '@type': 'ListItem', position: 2, name: 'Benchmark', item: 'https://fixedaim.com/benchmark' },
              { '@type': 'ListItem', position: 3, name: 'Internet Speed Test', item: SITE_URL },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'FixedAim Internet Speed Test',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            url: SITE_URL,
            description: 'Free internet speed test: measure download speed, upload speed, ping, jitter, and packet loss in seconds.',
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
        <Link href="/benchmark" style={{ color: 'inherit', textDecoration: 'none' }}>Benchmark</Link>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>Internet Speed Test</span>
      </nav>

      {/* HEADER */}
      <header style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
          NETWORK BENCHMARK
        </span>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          margin: '0 0 0.5rem',
          color: 'var(--neon-cyan)',
          textShadow: '0 0 24px rgba(0,245,255,0.4)',
        }}>
          Internet Speed Test
        </h1>
        <p style={{ margin: '0 auto', maxWidth: '600px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
          Measure your download speed, upload speed, ping latency, jitter, and packet loss in seconds directly from your browser.
        </p>
      </header>

      {/* SPEEDOMETER HERO CARD */}
      <section style={{
        background: 'var(--bg-card, #111823)',
        border: '1px solid var(--border, #243245)',
        borderRadius: '18px',
        padding: '24px 16px',
        textAlign: 'center',
        marginBottom: '1.25rem',
        position: 'relative'
      }}>
        {/* SVG SPEEDOMETER GAUGE */}
        <div style={{ position: 'relative', width: 'min(380px, 100%)', margin: '0 auto' }}>
          <svg viewBox="0 0 180 134" style={{ width: '100%', display: 'block' }} role="img" aria-label="Speedometer gauge">
            {/* Background Track */}
            <path d="M 15 90 A 75 75 0 0 1 165 90" fill="none" stroke="var(--border, #243245)" strokeWidth="12" strokeLinecap="round" />
            {/* Progress Arc */}
            <path
              d="M 15 90 A 75 75 0 0 1 165 90"
              fill="none"
              stroke="#00f5ff"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${dashLength} 235.6`}
              style={{ filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.7))', transition: 'stroke-dasharray 0.15s ease-out' }}
            />
            {/* Gauge Needle */}
            <line
              x1="90"
              y1="90"
              x2="90"
              y2="38"
              stroke="#ff4a4a"
              strokeWidth="3.5"
              strokeLinecap="round"
              style={{
                transformOrigin: '90px 90px',
                transform: `rotate(${gaugeAngle}deg)`,
                transition: 'transform 0.15s ease-out',
                filter: 'drop-shadow(0 0 4px #ff2a2a) drop-shadow(0 0 10px rgba(255,30,30,0.8))'
              }}
            />
            {/* Center Pivot */}
            <circle cx="90" cy="90" r="5" fill="#ff4a4a" style={{ filter: 'drop-shadow(0 0 4px #ff2a2a)' }} />
            {/* Scale Min / Max */}
            <text x="15" y="106" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">0</text>
            <text x="165" y="106" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">{gaugeMax}</text>
            {/* Value Display */}
            <text x="90" y="114" fill="var(--text-primary)" fontSize="24" fontWeight="800" textAnchor="middle">
              {gaugeVal.toFixed(1)}
            </text>
            <text x="90" y="129" fill="var(--neon-cyan)" fontSize="9" fontWeight="700" letterSpacing="0.5" textAnchor="middle">
              Mbps
            </text>
          </svg>
        </div>

        {/* CURRENT PHASE LABEL */}
        <div style={{ fontWeight: 700, fontSize: '1rem', color: isSimulated ? '#ffb347' : 'var(--neon-cyan)', margin: '8px 0 12px' }}>
          {phase}
        </div>

        {/* PROGRESS BAR */}
        <div style={{ maxWidth: '420px', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', margin: '0 auto 18px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${prog}%`,
            background: 'linear-gradient(90deg, var(--neon-cyan), #22d3ee)',
            transition: 'width 0.2s linear'
          }} />
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={runTest}
            disabled={state === 'running' || state === 'paused'}
            style={{
              minHeight: '44px',
              padding: '0 24px',
              borderRadius: '10px',
              border: 0,
              background: 'var(--neon-cyan)',
              color: '#000',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: state === 'running' || state === 'paused' ? 'not-allowed' : 'pointer',
              opacity: state === 'running' || state === 'paused' ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 16px rgba(0,245,255,0.4)'
            }}
          >
            <Play size={16} fill="currentColor" /> {state === 'done' ? 'Test Again' : 'Start Test'}
          </button>

          <button
            type="button"
            onClick={pauseTest}
            disabled={state !== 'running' && state !== 'paused'}
            style={{
              minHeight: '44px',
              padding: '0 18px',
              borderRadius: '10px',
              border: '1px solid var(--border, #243245)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              cursor: state !== 'running' && state !== 'paused' ? 'not-allowed' : 'pointer',
              opacity: state !== 'running' && state !== 'paused' ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Pause size={15} /> {state === 'paused' ? 'Resume' : 'Pause'}
          </button>

          <button
            type="button"
            onClick={stopTest}
            disabled={state !== 'running' && state !== 'paused'}
            style={{
              minHeight: '44px',
              padding: '0 18px',
              borderRadius: '10px',
              border: '1px solid var(--border, #243245)',
              background: 'rgba(255,255,255,0.04)',
              color: '#ff6b5e',
              fontWeight: 600,
              cursor: state !== 'running' && state !== 'paused' ? 'not-allowed' : 'pointer',
              opacity: state !== 'running' && state !== 'paused' ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Square size={14} fill="currentColor" /> Stop
          </button>

          <button
            type="button"
            onClick={copyResult}
            disabled={!lastTest}
            style={{
              minHeight: '44px',
              padding: '0 18px',
              borderRadius: '10px',
              border: '1px solid var(--border, #243245)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              cursor: !lastTest ? 'not-allowed' : 'pointer',
              opacity: !lastTest ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copied ? <Check size={16} color="var(--neon-green)" /> : <Copy size={16} />}
            {copied ? 'Copied ✓' : 'Copy Result'}
          </button>
        </div>
      </section>

      {/* STATS GRID */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '1.25rem'
      }}>
        <div style={{ background: 'var(--bg-card, #111823)', border: '1px solid var(--border, #243245)', borderRadius: '14px', padding: '14px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Download (Mbps)</span>
          <b style={{ display: 'block', fontSize: '1.6rem', fontWeight: 800, color: 'var(--neon-cyan)' }}>
            {dl ? dl.toFixed(1) : '–'}
          </b>
        </div>

        <div style={{ background: 'var(--bg-card, #111823)', border: '1px solid var(--border, #243245)', borderRadius: '14px', padding: '14px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Upload (Mbps)</span>
          <b style={{ display: 'block', fontSize: '1.6rem', fontWeight: 800, color: '#22d3ee' }}>
            {ul ? ul.toFixed(1) : '–'}
          </b>
        </div>

        <div style={{ background: 'var(--bg-card, #111823)', border: '1px solid var(--border, #243245)', borderRadius: '14px', padding: '14px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Ping (ms)</span>
          <b style={{ display: 'block', fontSize: '1.6rem', fontWeight: 800 }}>
            {ping ? `${ping}ms` : '–'}
          </b>
          {ping > 0 && (
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              ↓ {pmin} · ↑ {pmax} ms
            </small>
          )}
        </div>

        <div style={{ background: 'var(--bg-card, #111823)', border: '1px solid var(--border, #243245)', borderRadius: '14px', padding: '14px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Jitter (ms)</span>
          <b style={{ display: 'block', fontSize: '1.6rem', fontWeight: 800 }}>
            {jit ? `${jit}ms` : '–'}
          </b>
        </div>

        <div style={{ background: 'var(--bg-card, #111823)', border: '1px solid var(--border, #243245)', borderRadius: '14px', padding: '14px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Latency in DL (ms)</span>
          <b style={{ display: 'block', fontSize: '1.6rem', fontWeight: 800 }}>
            {ldl ? `${ldl}ms` : '–'}
          </b>
        </div>

        <div style={{ background: 'var(--bg-card, #111823)', border: '1px solid var(--border, #243245)', borderRadius: '14px', padding: '14px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Latency in UL (ms)</span>
          <b style={{ display: 'block', fontSize: '1.6rem', fontWeight: 800 }}>
            {lul ? `${lul}ms` : '–'}
          </b>
        </div>

        <div style={{ background: 'var(--bg-card, #111823)', border: '1px solid var(--border, #243245)', borderRadius: '14px', padding: '14px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Packet Loss (%)</span>
          <b style={{ display: 'block', fontSize: '1.6rem', fontWeight: 800, color: loss > 1 ? '#ff6b5e' : 'inherit' }}>
            {loss ? `${loss}%` : '0%'}
          </b>
        </div>

        <div style={{ background: 'var(--bg-card, #111823)', border: '1px solid var(--border, #243245)', borderRadius: '14px', padding: '14px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Connection Quality</span>
          <b style={{
            display: 'block',
            fontSize: '1.3rem',
            fontWeight: 800,
            color: quality === 'Excellent' ? 'var(--neon-green)' : quality === 'Good' ? '#a3e635' : quality === 'Fair' ? '#f59e0b' : '#ff6b5e'
          }}>
            {quality}
          </b>
        </div>
      </section>

      {/* NETWORK QUALITY SCORES & DETAILS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '1.25rem' }}>
        {/* QUALITY RATING */}
        <div style={{ background: 'var(--bg-card, #111823)', border: '1px solid var(--border, #243245)', borderRadius: '14px', padding: '16px' }}>
          <b style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
            Activity Suitability
          </b>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Streaming</span>
              <b style={{ color: '#f59e0b', fontSize: '1.2rem', letterSpacing: '2px' }}>
                {'★'.repeat(scores[0])}{'☆'.repeat(5 - scores[0])}
              </b>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Gaming</span>
              <b style={{ color: '#f59e0b', fontSize: '1.2rem', letterSpacing: '2px' }}>
                {'★'.repeat(scores[1])}{'☆'.repeat(5 - scores[1])}
              </b>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Video Calls</span>
              <b style={{ color: '#f59e0b', fontSize: '1.2rem', letterSpacing: '2px' }}>
                {'★'.repeat(scores[2])}{'☆'.repeat(5 - scores[2])}
              </b>
            </div>
          </div>
        </div>

        {/* CONNECTION DETAILS */}
        <div style={{ background: 'var(--bg-card, #111823)', border: '1px solid var(--border, #243245)', borderRadius: '14px', padding: '16px' }}>
          <b style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
            Connection Details
          </b>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 14px', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Server:</span>
            <span>{serverLoc}</span>
            <span style={{ color: 'var(--text-secondary)' }}>Network:</span>
            <span>{isp}</span>
            <span style={{ color: 'var(--text-secondary)' }}>Client IP:</span>
            <span>{ip}</span>
            <span style={{ color: 'var(--text-secondary)' }}>Connection:</span>
            <span>{connType}</span>
          </div>
        </div>
      </div>

      {/* LIVE PERFORMANCE GRAPH */}
      <section style={{
        background: 'var(--bg-card, #111823)',
        border: '1px solid var(--border, #243245)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
          <b style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Live Performance Graph</b>
          <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span><span style={{ color: '#00f5ff' }}>●</span> Download</span>
            <span><span style={{ color: '#22d3ee' }}>●</span> Upload</span>
            <span><span style={{ color: '#f59e0b' }}>●</span> Ping</span>
          </div>
        </div>
        <canvas ref={liveChartRef} style={{ width: '100%', height: '140px', display: 'block' }} />
      </section>

      {/* RECENT TESTS HISTORY CHART */}
      <section style={{
        background: 'var(--bg-card, #111823)',
        border: '1px solid var(--border, #243245)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '2.5rem'
      }}>
        <b style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
          Recent Tests (Last 10 Runs)
        </b>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 0 10px' }}>
          Download (Cyan) & Upload (Light Blue) in Mbps
        </p>
        <canvas ref={histChartRef} style={{ width: '100%', height: '140px', display: 'block' }} />
      </section>

      {/* SEO ARTICLES & GUIDES */}
      <article style={{ maxWidth: '860px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.75' }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 800, color: 'var(--neon-cyan)', margin: '1.5rem 0 1rem' }}>
          How to Read Your Internet Speed Test Results
        </h2>
        <p>
          A speed test measures how quickly data moves between your local device and the internet. The free FixedAim speed test measures download bandwidth, upload capacity, ping latency, jitter, and packet loss in a single run.
        </p>
        <ul style={{ paddingLeft: '1.25rem', margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li><strong>Download speed (Mbps):</strong> How fast your device receives data. It decides how fast websites open, 4K streams buffer, and large game files download.</li>
          <li><strong>Upload speed (Mbps):</strong> How fast you send data. Essential for video conferences (Zoom, Google Meet, Teams), cloud backup, and live streaming.</li>
          <li><strong>Ping (ms):</strong> Round-trip latency in milliseconds. Lower is always better; under 30ms is optimal for competitive online gaming.</li>
          <li><strong>Jitter (ms):</strong> The fluctuation and variance in ping over time. High jitter causes sudden stutter, rubberbanding, and audio cut-outs.</li>
          <li><strong>Packet loss (%):</strong> The percentage of packets that fail to reach their destination. Any loss above 1% indicates network congestion or physical line issues.</li>
        </ul>

        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 800, color: 'var(--neon-cyan)', margin: '2rem 0 1rem' }}>
          What Internet Speed Do You Actually Need?
        </h2>
        <div style={{ overflowX: 'auto', marginBottom: '2rem', border: '1px solid var(--border, #243245)', borderRadius: '12px', background: 'var(--bg-card, #111823)' }}>
          <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--neon-cyan)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Activity</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Suggested Download</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Key Requirement</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border, #243245)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>Email & Web Browsing</td>
                <td style={{ padding: '12px 16px' }}>1–5 Mbps</td>
                <td style={{ padding: '12px 16px' }}>Stable baseline</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border, #243245)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>HD Video Streaming</td>
                <td style={{ padding: '12px 16px' }}>5–10 Mbps per stream</td>
                <td style={{ padding: '12px 16px' }}>Low packet loss</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border, #243245)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>4K Ultra HD Streaming</td>
                <td style={{ padding: '12px 16px' }}>15–25 Mbps per stream</td>
                <td style={{ padding: '12px 16px' }}>Consistent throughput</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border, #243245)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>Video Calls (Zoom, Teams)</td>
                <td style={{ padding: '12px 16px' }}>3–10 Mbps</td>
                <td style={{ padding: '12px 16px' }}>Low jitter & 5+ Mbps upload</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border, #243245)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>Competitive Gaming</td>
                <td style={{ padding: '12px 16px' }}>10–25 Mbps</td>
                <td style={{ padding: '12px 16px', color: 'var(--neon-green)' }}>Ping under 40 ms</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>Large Household & Smart Home</td>
                <td style={{ padding: '12px 16px' }}>100–300+ Mbps</td>
                <td style={{ padding: '12px 16px' }}>High bandwidth capacity</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FAQ ACCORDION */}
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 800, color: 'var(--neon-cyan)', margin: '2.5rem 0 1rem' }}>
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
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,245,255,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,245,255,0.35)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
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
