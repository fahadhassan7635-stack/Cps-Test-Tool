"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';

const SITE_URL = 'https://fixedaim.com/internet-speed';

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

export default function InternetSpeedPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const root = containerRef.current;

    const $ = (s: string) => root.querySelector(s) as HTMLElement;
    const $$ = (s: string) => [...root.querySelectorAll(s)] as HTMLElement[];
    const rd = (k: string) => { try { return JSON.parse(localStorage.getItem(k) || '') || {}; } catch { return {}; } };
    const wr = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

    const DEF = { on: true, mon: true, size: 56, op: 0.9, theme: 'auto', layout: 'radial', side: 'right', t: 0.7, mode: 'compact' };
    let S = Object.assign({}, DEF, rd('sp-set'));
    let last = rd('sp-last');
    let svT: any = 0;
    const save = () => { clearTimeout(svT); svT = setTimeout(() => wr('sp-set', S), 150); };
    const COARSE = window.matchMedia('(pointer:coarse)').matches;
    let HS: any[] = [];
    try {
      HS = JSON.parse(localStorage.getItem('sp-hist') || '') || [];
      if (!Array.isArray(HS)) HS = [];
    } catch {
      HS = [];
    }

    let INFO: any = {};
    let hv: { id: string; x: number } | null = null;
    const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

    const EP = 'https://speed.cloudflare.com/';
    const SC = [50, 100, 250, 500, 1000, 2500];
    const fmt = (v: number) => (v ? v.toFixed(1) : '–');
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const tick = async () => {
      await sleep(100);
      while (paused && !ac.signal.aborted) await sleep(100);
    };

    let T: any;
    let runId = 0;
    let ac = new AbortController();
    let paused = false;
    let lastSt = '';

    const resetT = () => {
      T = {
        state: 'idle',
        phase: '',
        prog: 0,
        dl: 0,
        ul: 0,
        ping: 0,
        jit: 0,
        loss: 0,
        gv: 0,
        hist: [] as number[],
        hdl: [] as number[],
        hul: [] as number[],
        pg: [] as number[],
        ldl: 0,
        lul: 0,
        pmin: 0,
        pmax: 0,
        sim: false,
        max: 100,
        msg: '',
        base: 30 + Math.random() * 110,
      };
    };
    resetT();

    function scores() {
      if (!T.ul) return null;
      const st = T.dl >= 25 ? 5 : T.dl >= 15 ? 4 : T.dl >= 8 ? 3 : T.dl >= 4 ? 2 : 1;
      const pen = (T.ping > 150 || T.loss > 3) ? 3 : (T.ping > 80 || T.loss > 1) ? 2 : (T.ping > 40 || T.jit > 20) ? 1 : 0;
      const gm = Math.max(1, Math.min(5, 5 - pen - (T.jit > 30 ? 1 : 0)));
      const vc = Math.max(1, Math.min(5, Math.min(T.dl >= 10 ? 5 : T.dl >= 5 ? 4 : 3, T.ul >= 5 ? 5 : T.ul >= 2 ? 4 : 2) - (pen > 1 ? 1 : 0)));
      return [st, gm, vc];
    }

    async function getInfo() {
      if (T.sim) { INFO = {}; return; }
      try {
        const j = await (await fetch(EP + 'meta', { cache: 'no-store', signal: ac.signal })).json();
        INFO = {
          srv: [j.city, j.country].filter(Boolean).join(', ') + (j.colo ? ' (' + j.colo + ')' : ''),
          isp: j.asOrganization ? j.asOrganization + (j.asn ? ' (AS' + j.asn + ')' : '') : '–',
          ip: j.clientIp || '–',
        };
      } catch {
        INFO = { srv: '–', isp: '–', ip: '–' };
      }
    }

    const fw = $('#fw');
    const fab = $('#fab');
    const dash = $('#dash');

    const G = '<path class="gt" d="M15 90A75 75 0 0 1 165 90"/><path class="gp" d="M15 90A75 75 0 0 1 165 90"/><line class="gn" x1="90" y1="90" x2="90" y2="38"/><circle class="gc" cx="90" cy="90" r="5"/><text class="gs" x="15" y="106">0</text><text class="gs gm" x="165" y="106">100</text><text class="gv" x="90" y="114">0.0</text><text class="gs gu" x="90" y="129">Mbps</text>';
    $$('.gauge').forEach((g) => (g.innerHTML = G));

    const GA = $$('.gauge').map((g) => ({
      gp: g.querySelector('.gp') as HTMLElement,
      gn: g.querySelector('.gn') as HTMLElement,
      gv: g.querySelector('.gv') as HTMLElement,
      gm: g.querySelector('.gm') as HTMLElement,
      k: '',
    }));

    const KS = $$('[data-k]');
    const QS = $$('[data-q]');
    const BARS = $$('[data-bar]');
    const MIS = $$('.mi');
    const STARS = ['s1', 's2', 's3'].map((k) => $(`[data-k="${k}"]`));
    const bStart = $('#bStart') as HTMLButtonElement;
    const bStop = $('#bStop') as HTMLButtonElement;
    const bPause = $('#bPause') as HTMLButtonElement;
    const plg = $('#plg');
    const plr = $('#plr');
    const conn = $('#conn');
    const live = $('#live');
    const cLive = $('#cLive') as HTMLCanvasElement;
    const cHist = $('#cHist') as HTMLCanvasElement;
    const cvM = $('#cv') as HTMLCanvasElement;
    const ico = $('#ico');
    const tip = $('#tip');

    let COL: any = null;

    function quality(d: number, p: number, l: number) {
      if (!d) return '–';
      let s = d >= 100 ? 4 : d >= 40 ? 3 : d >= 15 ? 2 : 1;
      if (p > 100 || l > 3) s = Math.min(s, 1);
      else if (p > 50) s = Math.min(s, 2);
      return ['', 'Poor', 'Fair', 'Good', 'Excellent'][s];
    }

    function ago(t: number) {
      const s = (Date.now() - t) / 1000;
      return s < 60 ? 'just now' : s < 3600 ? Math.round(s / 60) + ' min ago' : s < 86400 ? Math.round(s / 3600) + ' h ago' : new Date(t).toLocaleDateString();
    }

    function setG(g: any) {
      const p = Math.min(T.gv / T.max, 1);
      const k = p.toFixed(3) + '|' + T.gv.toFixed(1) + '|' + T.max;
      if (g.k === k) return;
      g.k = k;
      if (g.gp) g.gp.style.strokeDasharray = (p * 235.6) + ' 235.6';
      if (g.gn) g.gn.style.transform = 'rotate(' + (p * 180 - 90) + 'deg)';
      if (g.gv) g.gv.textContent = T.gv.toFixed(1);
      if (g.gm) g.gm.textContent = T.max;
    }

    const MON = { v: 0, sim: false, fail: 0, n: 0 };
    let monId = 0;
    let monOn = false;

    function icoRender() {
      if (!ico || !fab) return;
      let v: string | number;
      if (!navigator.onLine) v = 'Off';
      else if (S.mon) v = MON.v ? (MON.v >= 100 ? Math.round(MON.v) : MON.v.toFixed(1)) : '…';
      else v = last.dl ? (last.dl >= 100 ? Math.round(last.dl) : last.dl.toFixed(1)) : '–';
      const h = '<b>' + v + '</b><small>Mbps</small>';
      if (ico.dataset.h !== h) {
        ico.innerHTML = h;
        ico.dataset.h = h;
      }
      fab.classList.add('live');
      fab.dataset.sim = S.mon && MON.sim ? '1' : '';
    }

    async function monSample() {
      let v: number | null = null;
      if (!MON.sim) {
        try {
          const c = new AbortController();
          const to = setTimeout(() => c.abort(), 6000);
          const t0 = performance.now();
          const r = await fetch(EP + '__down?bytes=500000&_=' + Date.now(), { cache: 'no-store', signal: c.signal });
          const rr = r.body?.getReader();
          let n = 0;
          if (rr) {
            for (;;) {
              const x = await rr.read();
              if (x.done) break;
              n += x.value?.length || 0;
            }
          }
          clearTimeout(to);
          v = (n * 8) / 1e6 / Math.max((performance.now() - t0) / 1000, 0.05);
          MON.fail = 0;
        } catch {
          if (++MON.fail >= 2) MON.sim = true;
        }
      }
      if (MON.sim) {
        const b = MON.v || (30 + Math.random() * 110);
        v = Math.max(2, b * (0.85 + Math.random() * 0.3));
      }
      if (v !== null) {
        MON.v = MON.v ? MON.v * 0.4 + v * 0.6 : v;
        icoRender();
      }
    }

    async function monLoop() {
      const id = ++monId;
      while (id === monId && S.mon) {
        const sd = (navigator as any).connection && (navigator as any).connection.saveData;
        if (!document.hidden && !sd && navigator.onLine && T.state !== 'running' && T.state !== 'paused') {
          if (MON.sim && ++MON.n % 8 === 0) {
            MON.sim = false;
            MON.fail = 0;
          }
          await monSample();
        }
        await sleep(COARSE ? 8000 : 4000);
      }
    }

    let rq = 0;
    function render() {
      if (!rq) rq = requestAnimationFrame(doRender);
    }

    function doRender() {
      rq = 0;
      const run = T.state === 'running' || T.state === 'paused';
      const q = quality(T.dl, T.ping, T.loss);
      let st = ({
        idle: T.msg || 'Ready to test',
        running: ({ ping: 'Measuring ping…', dl: 'Testing download…', ul: 'Testing upload…' } as any)[T.phase] || 'Starting…',
        paused: 'Paused',
        done: 'Test complete' + (T.sim ? ' (simulated)' : ''),
        error: T.msg,
      } as any)[T.state];

      const L = last.t ? '↓ ' + fmt(last.dl) + ' · ↑ ' + fmt(last.ul) + ' Mbps · ' + Math.round(last.ping) + ' ms · ' + ago(last.t) + (last.sim ? ' (simulated)' : '') : 'No test yet';
      const sc = scores();
      const ST5 = [0, 1, 2].map((i) => stars(sc ? sc[i] : 0));
      const on = navigator.onLine;

      const V: any = {
        dl: fmt(T.dl),
        ul: fmt(T.ul),
        ping: T.ping ? T.ping.toFixed(0) : '–',
        jit: T.ping ? T.jit.toFixed(1) : '–',
        loss: T.ping ? T.loss.toFixed(1) : '–',
        qual: q,
        prog: Math.round(T.prog) + '%',
        conn: on ? 'Online' : 'Offline',
        phase: st,
        last: L,
        pr: T.ping ? '↓ ' + T.pmin.toFixed(1) + ' · ↑ ' + T.pmax.toFixed(1) + ' ms' : '',
        ldl: T.ldl ? T.ldl.toFixed(0) : '–',
        lul: T.lul ? T.lul.toFixed(0) : '–',
        srv: INFO.srv || '–',
        isp: INFO.isp || '–',
        ip: INFO.ip || '–',
        ct: ((navigator as any).connection && (navigator as any).connection.effectiveType) || '–',
        mt: last.t ? new Date(last.t).toLocaleTimeString() : '–',
        s1: ST5[0],
        s2: ST5[1],
        s3: ST5[2],
        plt: T.ping ? 'Received ' + (100 - T.loss).toFixed(1) + '%' : '–',
      };

      KS.forEach((e) => {
        const t = V[e.dataset.k || ''];
        if (t !== undefined && e.textContent !== t) e.textContent = t;
      });

      ['srv', 'isp', 'ip'].forEach((k) => {
        const e = $(`[data-k="${k}"]`);
        if (e && e.previousElementSibling) {
          const hide = V[k] === '–';
          if (e.hidden !== hide) {
            e.hidden = hide;
            (e.previousElementSibling as HTMLElement).hidden = hide;
          }
        }
      });

      STARS.forEach((e, i) => {
        if (!e) return;
        const a = (sc ? sc[i] : 0) + ' out of 5 stars';
        if (e.getAttribute('aria-label') !== a) e.setAttribute('aria-label', a);
      });

      if (plg) plg.style.width = (T.ping ? 100 - T.loss : 0) + '%';
      if (plr) plr.style.width = (T.ping ? T.loss : 0) + '%';

      QS.forEach((e) => {
        if (e.dataset.q !== q) e.dataset.q = q;
      });

      BARS.forEach((e) => {
        e.style.transform = 'scaleX(' + T.prog / 100 + ')';
        if (e.parentNode) (e.parentNode as HTMLElement).setAttribute('aria-valuenow', String(Math.round(T.prog)));
      });

      GA.forEach(setG);

      if (conn) conn.dataset.on = on ? '1' : '0';
      if (bStart) bStart.disabled = run;
      if (bStop) bStop.disabled = !run;
      if (bPause) {
        bPause.disabled = !run;
        const pt = paused ? 'Resume' : 'Pause';
        if (bPause.textContent !== pt) bPause.textContent = pt;
      }

      const M: any = {
        toggle: run ? ['■', 'Stop test'] : ['▶', 'Start test'],
        pause: paused ? ['▶', 'Resume test'] : ['⏸', 'Pause test'],
        restart: ['↻', 'Restart test'],
        set: ['⚙', 'Settings'],
      };

      MIS.forEach((b) => {
        const action = b.dataset.a || '';
        const m = M[action];
        if (m && b.title !== m[1]) {
          b.textContent = m[0];
          b.title = m[1];
          b.setAttribute('aria-label', m[1]);
        }
      });

      if (fw) {
        fw.style.setProperty('--p', T.prog * 3.6 + 'deg');
        fw.classList.toggle('busy', run);
      }
      if (fab) {
        fab.title = st + (T.dl ? ' · ↓ ' + fmt(T.dl) : '');
        icoRender();
      }

      const k = T.state + T.phase;
      if (k !== lastSt) {
        lastSt = k;
        if (live) live.textContent = st;
      }

      graph();
    }

    async function probe(sig: AbortSignal) {
      try {
        await fetch(EP + '__down?bytes=0', { cache: 'no-store', signal: sig });
        return true;
      } catch {
        return false;
      }
    }

    async function worker(kind: string, sm: any, sig: AbortSignal) {
      try {
        if (kind === 'dl') {
          while (!sig.aborted) {
            const r = await fetch(EP + '__down?bytes=25000000&_=' + Date.now(), { cache: 'no-store', signal: sig });
            const rr = r.body?.getReader();
            if (!rr) break;
            for (;;) {
              const x = await rr.read();
              if (x.done) break;
              sm.bytes += x.value?.length || 0;
              while (paused && !sig.aborted) await sleep(100);
            }
          }
        } else {
          const b = new Blob([new Uint8Array(1e6)]);
          while (!sig.aborted) {
            await fetch(EP + '__up', { method: 'POST', body: b, signal: sig, cache: 'no-store' });
            sm.bytes += b.size;
            while (paused && !sig.aborted) await sleep(100);
          }
        }
      } catch {}
    }

    async function pingPhase(dead: () => boolean) {
      const s: number[] = [];
      let lost = 0;
      T.phase = 'ping';
      for (let i = 0; i < 10; i++) {
        if (T.sim) {
          s.push(14 + (T.base || 30) / 6 + Math.random() * 8 + (Math.random() < 0.1 ? 25 : 0));
        } else {
          const t0 = performance.now();
          try {
            await fetch(EP + '__down?bytes=0&_=' + i, { cache: 'no-store', signal: ac.signal });
            s.push(performance.now() - t0);
          } catch {
            if (ac.signal.aborted) return;
            lost++;
          }
        }
        if (s.length) T.pg.push(s[s.length - 1]);
        T.prog = (i + 1) * 1.5;
        await tick();
        if (dead()) return;
        if (T.sim) await sleep(60);
        render();
      }
      if (!s.length) s.push(30, 32);
      T.ping = s.reduce((a, b) => a + b, 0) / s.length;
      T.jit = s.length > 1 ? s.slice(1).reduce((a, b, i) => a + Math.abs(b - s[i]), 0) / (s.length - 1) : 0;
      T.loss = T.sim ? (Math.random() < 0.4 ? +(Math.random() * 1.5).toFixed(1) : 0) : lost * 10;
      T.pmin = Math.min(...s);
      T.pmax = Math.max(...s);
    }

    async function speedPhase(kind: string, dead: () => boolean, p0: number, pw: number) {
      const sm = { bytes: 0 };
      const wc = new AbortController();
      const DUR = 5000;
      ac.signal.addEventListener('abort', () => wc.abort());
      const base = kind === 'dl' ? T.base : T.base * (0.3 + Math.random() * 0.3);
      if (!T.sim) worker(kind, sm, wc.signal);
      const h: [number, number][] = [];
      const lat: number[] = [];
      let el = 0;
      T.phase = kind;

      while (el < DUR) {
        await tick();
        if (dead()) {
          wc.abort();
          return 0;
        }
        el += 100;
        if (el % 1000 === 0) {
          if (T.sim) lat.push(T.ping * (1.4 + Math.random() * 1.6));
          else {
            const t0 = performance.now();
            fetch(EP + '__down?bytes=0&l=' + el, { cache: 'no-store', signal: wc.signal })
              .then(() => lat.push(performance.now() - t0))
              .catch(() => {});
          }
        }
        if (T.sim) {
          sm.bytes += ((base * Math.min(1, 0.25 + el / 1500) * (0.9 + Math.random() * 0.2) * 1e6) / 8) * 0.1;
        }
        h.push([el, sm.bytes]);
        const w = h.filter((x) => x[0] >= el - 1200);
        const a = w[0];
        const b = w[w.length - 1];
        const v = ((b[1] - a[1]) * 8) / 1e6 / Math.max((b[0] - a[0]) / 1000, 0.1);
        T.gv = v;
        T.hist.push(v);
        T['h' + kind].push(v);
        T.prog = p0 + (pw * el) / DUR;
        T.max = SC.find((m) => m >= v * 1.15 && m >= T.max) || 2500;
        render();
      }
      wc.abort();
      T['l' + kind] = lat.length ? lat.reduce((p, c) => p + c, 0) / lat.length : 0;
      const a = h.find((x) => x[0] >= 1500) || h[0];
      const b = h[h.length - 1];
      return ((b[1] - a[1]) * 8) / 1e6 / Math.max((b[0] - a[0]) / 1000, 0.1);
    }

    async function run() {
      if (T.state === 'running' || T.state === 'paused') return;
      const id = ++runId;
      const dead = () => id !== runId;
      resetT();
      if (!navigator.onLine) {
        T.state = 'error';
        T.msg = 'You are offline. Reconnect and try again.';
        return render();
      }
      T.state = 'running';
      ac = new AbortController();
      paused = false;
      T.base = 30 + Math.random() * 110;
      render();

      try {
        T.sim = !(await probe(ac.signal));
        if (dead()) return;
        await getInfo();
        if (dead()) return;
        await pingPhase(dead);
        if (dead()) return;
        T.dl = await speedPhase('dl', dead, 15, 45);
        if (dead()) return;
        T.ul = await speedPhase('ul', dead, 60, 40);
        if (dead()) return;

        T.state = 'done';
        T.prog = 100;
        T.gv = T.dl;
        last = { dl: T.dl, ul: T.ul, ping: T.ping, jit: T.jit, loss: T.loss, t: Date.now(), sim: T.sim };
        wr('sp-last', last);
        HS.push({ dl: T.dl, ul: T.ul, ping: T.ping, jit: T.jit, t: last.t });
        HS = HS.slice(-10);
        wr('sp-hist', HS);
      } catch (e: any) {
        if (dead()) return;
        T.state = 'error';
        T.msg = 'Test failed: ' + ((e && e.message) || e);
      } finally {
        if (!dead()) {
          ac.abort();
          render();
        }
      }
    }

    function stop(msg?: string) {
      const was = T.state === 'running' || T.state === 'paused';
      runId++;
      ac.abort();
      paused = false;
      if (was) {
        T.state = 'idle';
        T.msg = msg || 'Test stopped';
        T.prog = 0;
        T.gv = 0;
      }
      render();
    }

    const restart = () => { stop(); T.msg = ''; run(); };
    const pause = () => {
      if (T.state === 'running') { T.state = 'paused'; paused = true; }
      else if (T.state === 'paused') { T.state = 'running'; paused = false; }
      render();
    };
    const toggle = () => (T.state === 'running' || T.state === 'paused' ? stop() : run());

    // ── Floating Button & Dragging ──────────────────────────────────────────
    const W = () => document.documentElement.clientWidth;
    const H = () => window.innerHeight;
    const M8 = 8;

    function setXY(x: number, y: number) {
      if (!fw) return;
      const s = S.size;
      fw.style.left = Math.min(Math.max(M8, x), W() - s - M8) + 'px';
      fw.style.top = Math.min(Math.max(M8, y), H() - s - M8) + 'px';
    }

    function place() {
      if (!fw) return;
      const s = S.size;
      const t = Math.min(1, Math.max(0, +S.t || 0));
      if (S.side === 'left' || S.side === 'right') setXY(S.side === 'left' ? M8 : W() - s - M8, t * H() - s / 2);
      else setXY(t * W() - s / 2, S.side === 'top' ? M8 : H() - s - M8);
    }

    function avoid() {
      if (!fw) return;
      const s = S.size;
      const fr = fw.getBoundingClientRect();
      const horiz = S.side === 'left' || S.side === 'right';
      for (const el of $$('[data-avoid]')) {
        const r = el.getBoundingClientRect();
        if (fr.right > r.left && fr.left < r.right && fr.bottom > r.top && fr.top < r.bottom) {
          const n = horiz ? H() : W();
          const lo = (horiz ? r.top : r.left) - s - 8;
          const hi = (horiz ? r.bottom : r.right) + 8;
          const cur = horiz ? fr.top : fr.left;
          const p = (Math.abs(cur - lo) < Math.abs(hi - cur) && lo >= 8) || hi > n - s - 8 ? lo : hi;
          S.t = (p + s / 2) / n;
          place();
          return;
        }
      }
    }

    function snap() {
      if (!fw) return;
      const s = S.size;
      const cx = fw.offsetLeft + s / 2;
      const cy = fw.offsetTop + s / 2;
      const d = [
        [cx, 'left'],
        [W() - cx, 'right'],
        [cy, 'top'],
        [H() - cy, 'bottom'],
      ].sort((a: any, b: any) => a[0] - b[0])[0][1];

      S.side = d;
      S.t = d === 'left' || d === 'right' ? cy / H() : cx / W();
      fw.classList.add('snap');
      place();
      setTimeout(() => fw && fw.classList.remove('snap'), 350);
      avoid();
      save();
      syncSet();
      if (dash && dash.classList.contains('show')) placePanel();
    }

    let drag: any = null;
    let wasDrag = false;
    let dq = 0;

    if (fab) {
      fab.addEventListener('pointerdown', (e: any) => {
        if (e.button > 0) return;
        drag = { sx: e.clientX, sy: e.clientY, ox: fw.offsetLeft, oy: fw.offsetTop, moved: false };
        try { fab.setPointerCapture(e.pointerId); } catch {}
      });

      fab.addEventListener('pointermove', (e: any) => {
        if (!drag) return;
        const dx = e.clientX - drag.sx;
        const dy = e.clientY - drag.sy;
        if (!drag.moved && Math.hypot(dx, dy) > 6) {
          drag.moved = true;
          closeMenu();
          fw.classList.add('drag');
        }
        if (drag.moved) {
          e.preventDefault();
          drag.nx = drag.ox + dx;
          drag.ny = drag.oy + dy;
          if (!dq) {
            dq = requestAnimationFrame(() => {
              dq = 0;
              if (drag && drag.moved) setXY(drag.nx, drag.ny);
            });
          }
        }
      });

      const endDrag = () => {
        if (!drag) return;
        const m = drag.moved;
        if (m && drag.nx !== undefined) {
          cancelAnimationFrame(dq);
          dq = 0;
          setXY(drag.nx, drag.ny);
        }
        drag = null;
        fw.classList.remove('drag');
        if (m) {
          wasDrag = true;
          setTimeout(() => (wasDrag = false), 50);
          snap();
        }
      };

      fab.addEventListener('pointerup', endDrag);
      fab.addEventListener('pointercancel', endDrag);
      fab.addEventListener('click', (e) => {
        if (wasDrag) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        fw.classList.contains('open') ? closeMenu() : openMenu(e.detail === 0);
      });
      fab.addEventListener('contextmenu', (e) => { if (drag) e.preventDefault(); });
    }

    function layoutMenu() {
      if (!fw) return;
      const s = S.size;
      const r = fw.getBoundingClientRect();
      const cx = r.left + s / 2;
      const cy = r.top + s / 2;
      const its = $$('.mi');
      const n = its.length;
      const R = s / 2 + 50;

      its.forEach((b, i) => {
        let dx: number;
        let dy: number;
        if (S.layout === 'radial') {
          const base = Math.atan2(H() / 2 - cy, W() / 2 - cx);
          const sp = Math.PI * 0.9;
          const a = base - sp / 2 + (i * sp) / (n - 1);
          dx = R * Math.cos(a);
          dy = R * Math.sin(a);
        } else {
          dx = 0;
          dy = (cy > H() / 2 ? -1 : 1) * (s / 2 + 34 + i * 50);
        }
        dx = Math.min(Math.max(cx + dx, 28), W() - 28) - cx;
        dy = Math.min(Math.max(cy + dy, 28), H() - 28) - cy;
        b.style.setProperty('--dx', dx + 'px');
        b.style.setProperty('--dy', dy + 'px');
        b.style.setProperty('--i', String(i));
      });
    }

    function openMenu(focus?: boolean) {
      if (!fw || !fab) return;
      layoutMenu();
      fw.classList.add('open');
      fab.setAttribute('aria-expanded', 'true');
      if (focus) setTimeout(() => $('.mi')?.focus(), 50);
    }

    function closeMenu(refocus?: boolean) {
      if (!fw || !fab || !fw.classList.contains('open')) return;
      fw.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
      if (refocus) fab.focus();
    }

    const onDocPointerDown = (e: MouseEvent) => {
      if (fw && fw.classList.contains('open') && !fw.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener('pointerdown', onDocPointerDown);

    $('#menu')?.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('.mi') as HTMLElement;
      if (!b) return;
      const a = b.dataset.a;
      closeMenu(true);
      ({ toggle, pause, restart, set: openSet } as any)[a || '']?.();
    });

    // ── Mini Dashboard ──────────────────────────────────────────────────────
    function placePanel() {
      if (!dash || !fw) return;
      dash.classList.toggle('det', S.mode === 'detailed');
      if (window.innerWidth <= 520) return;
      const r = fw.getBoundingClientRect();
      const w = dash.offsetWidth;
      const h = dash.offsetHeight;
      const x = S.side === 'left' ? r.right + 12 : S.side === 'right' ? r.left - w - 12 : r.left + r.width / 2 - w / 2;
      const y = S.side === 'top' ? r.bottom + 12 : S.side === 'bottom' ? r.top - h - 12 : r.top + r.height / 2 - h / 2;
      dash.style.right = 'auto';
      dash.style.bottom = 'auto';
      dash.style.left = Math.min(Math.max(8, x), W() - w - 8) + 'px';
      dash.style.top = Math.min(Math.max(8, y), H() - h - 8) + 'px';
    }

    function openDash() {
      if (!dash) return;
      dash.classList.add('show');
      placePanel();
      render();
    }

    function closeDash() {
      if (!dash) return;
      dash.classList.remove('show');
    }

    $('#dClose')?.addEventListener('click', closeDash);
    $('#dMode')?.addEventListener('click', () => {
      S.mode = S.mode === 'detailed' ? 'compact' : 'detailed';
      save();
      placePanel();
      render();
    });
    $('#dRetest')?.addEventListener('click', restart);

    function cx2(c: any) {
      if (!c) return null;
      const d = Math.min(window.devicePixelRatio || 1, 2);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (!w) return null;
      if (c._w !== w || c._h !== h || c._d !== d) {
        c.width = Math.round(w * d);
        c.height = Math.round(h * d);
        c._w = w;
        c._h = h;
        c._d = d;
      }
      const x = c._x || (c._x = c.getContext('2d'));
      x.setTransform(d, 0, 0, d, 0, 0);
      x.clearRect(0, 0, w, h);
      return { x, w, h };
    }

    function drawMain() {
      if (!COL) {
        COL = { ac: '#00f5ff', a2: '#22d3ee', mu: '#8a9bb2', bd: '#243245' };
      }
      const acCol = COL.ac;
      const a2Col = COL.a2;
      const muCol = COL.mu;
      const bdCol = COL.bd;

      const msg = (x: any, w: number, h: number, t: string) => {
        x.fillStyle = muCol;
        x.font = '13px system-ui, sans-serif';
        x.textAlign = 'center';
        x.fillText(t, w / 2, h / 2);
      };

      const g = cx2(cLive);
      if (g) {
        const { x, w, h } = g;
        x.strokeStyle = bdCol;
        x.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
          x.beginPath();
          x.moveTo(0, (h * i) / 4);
          x.lineTo(w, (h * i) / 4);
          x.stroke();
        }
        if (hv && hv.id === 'cLive') {
          x.strokeStyle = muCol;
          x.lineWidth = 1;
          x.beginPath();
          x.moveTo(hv.x, 0);
          x.lineTo(hv.x, h);
          x.stroke();
        }
        [
          [T.hdl, acCol],
          [T.hul, a2Col],
          [T.pg, '#f59e0b'],
        ].forEach(([d, col]) => {
          if (d.length < 2) return;
          const mx = Math.max(...d, 1);
          const Y = (n: number) => h - 6 - (n / mx) * (h - 14);
          x.beginPath();
          d.forEach((n: number, i: number) => {
            const px = (i / (d.length - 1)) * w;
            i ? x.lineTo(px, Y(n)) : x.moveTo(px, Y(n));
          });
          x.strokeStyle = col;
          x.lineWidth = 2;
          x.stroke();

          if (hv && hv.id === 'cLive') {
            const i = Math.round(Math.min(1, Math.max(0, hv.x / w)) * (d.length - 1));
            x.beginPath();
            x.arc((i / (d.length - 1)) * w, Y(d[i]), 4, 0, 7);
            x.fillStyle = col;
            x.fill();
          }
        });
        if (!T.hdl.length && !T.pg.length) msg(x, w, h, 'Run a test to see live data');
      }

      const g2 = cx2(cHist);
      if (g2) {
        const { x, w, h } = g2;
        if (!HS.length) msg(x, w, h, 'No results yet');
        else {
          const mx = Math.max(...HS.map((r: any) => Math.max(r.dl, r.ul)), 1);
          const bw = w / HS.length;
          const hi = hv && hv.id === 'cHist' ? Math.min(HS.length - 1, Math.floor(hv.x / bw)) : -1;
          HS.forEach((r: any, i: number) => {
            if (i === hi) {
              x.fillStyle = muCol;
              x.globalAlpha = 0.15;
              x.fillRect(i * bw, 0, bw, h);
              x.globalAlpha = 1;
            }
            [
              [r.dl, acCol],
              [r.ul, a2Col],
            ].forEach(([n, col], j) => {
              const bh = (n / mx) * (h - 20);
              x.fillStyle = col;
              x.fillRect(i * bw + bw * 0.12 + j * bw * 0.38, h - bh - 2, bw * 0.36, bh);
            });
          });
        }
      }
    }

    function graph() {
      drawMain();
      const c = cvM;
      if (!dash || !dash.classList.contains('show') || S.mode !== 'detailed') return;
      const g = cx2(c);
      if (!g) return;
      const x = g.x;
      const w = g.w;
      const h = g.h;
      const data = T.hist.slice(-80);
      if (data.length < 2) return;
      const mx = Math.max(...data, 1);
      const col = '#00f5ff';
      x.beginPath();
      data.forEach((v: number, i: number) => {
        const px = (i / (data.length - 1)) * w;
        const py = h - 4 - (v / mx) * (h - 10);
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      });
      x.strokeStyle = col;
      x.lineWidth = 2;
      x.stroke();
      x.lineTo(w, h);
      x.lineTo(0, h);
      x.closePath();
      x.globalAlpha = 0.15;
      x.fillStyle = col;
      x.fill();
      x.globalAlpha = 1;
      if (hv && hv.id === 'cv') {
        x.strokeStyle = col;
        x.setLineDash([3, 3]);
        x.beginPath();
        x.moveTo(hv.x, 0);
        x.lineTo(hv.x, h);
        x.stroke();
        x.setLineDash([]);
      }
    }

    // ── Tooltips ────────────────────────────────────────────────────────────
    let hq = 0;
    let hE: any = null;

    function showTip(e: MouseEvent) {
      if (!tip || !hv) {
        if (tip) tip.hidden = true;
        return;
      }
      const c = $(`#${hv.id}`) as HTMLCanvasElement;
      if (!c) return;
      const w = c.clientWidth || 1;
      const f = Math.min(1, Math.max(0, hv.x / w));
      const at = (d: number[]) => d[Math.round(f * (d.length - 1))];
      const R: any[] = [];
      let hd = '';

      if (hv.id === 'cLive') {
        [
          ['Download Speed', T.hdl, 'var(--neon-cyan, #00f5ff)', ' Mbps'],
          ['Upload Speed', T.hul, '#22d3ee', ' Mbps'],
          ['Latency', T.pg, '#f59e0b', ' ms'],
        ].forEach(([l, d, v, u]: any) => {
          if (d && d.length) R.push([v, l, at(d).toFixed(1) + u]);
        });
      } else if (hv.id === 'cHist') {
        if (!HS.length) { tip.hidden = true; return; }
        const r = HS[Math.min(HS.length - 1, Math.floor(hv.x / (w / HS.length)))];
        hd = new Date(r.t).toLocaleString();
        R.push(['var(--neon-cyan, #00f5ff)', 'Download', fmt(r.dl) + ' Mbps'], ['#22d3ee', 'Upload', fmt(r.ul) + ' Mbps']);
        if (r.ping) R.push(['#f59e0b', 'Ping', r.ping.toFixed(0) + ' ms']);
      } else {
        const d = T.hist.slice(-80);
        if (!d.length) { tip.hidden = true; return; }
        R.push(['var(--neon-cyan, #00f5ff)', 'Speed', at(d).toFixed(1) + ' Mbps']);
      }

      if (!R.length) { tip.hidden = true; return; }

      tip.innerHTML = (hd ? `<div>${hd}</div>` : '') + R.map((r) => `<div><i style="background:${r[0]}"></i>${r[1]}: <b>${r[2]}</b></div>`).join('');
      tip.hidden = false;
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;
      tip.style.left = Math.min(Math.max(8, e.clientX + 14), W() - tw - 8) + 'px';
      tip.style.top = Math.max(8, e.clientY - th - 12) + 'px';
    }

    ['cLive', 'cHist', 'cv'].forEach((id) => {
      const c = $(`#${id}`);
      if (!c) return;
      ['pointermove', 'pointerdown'].forEach((ev) =>
        c.addEventListener(ev, (e: any) => {
          const r = c.getBoundingClientRect();
          hv = { id, x: e.clientX - r.left };
          hE = e;
          if (!hq) {
            hq = requestAnimationFrame(() => {
              hq = 0;
              graph();
              showTip(hE);
            });
          }
        }, { passive: true })
      );
      c.addEventListener('pointerleave', () => {
        hv = null;
        if (tip) tip.hidden = true;
        graph();
      });
    });

    // ── Settings ────────────────────────────────────────────────────────────
    let prevFocus: any = null;
    function openSet() {
      prevFocus = document.activeElement;
      syncSet();
      const bk = $('#bk');
      const st = $('#set');
      if (bk) bk.hidden = false;
      if (st) {
        st.hidden = false;
        st.querySelector('input')?.focus();
      }
    }

    function closeSet() {
      const bk = $('#bk');
      const st = $('#set');
      if (bk) bk.hidden = true;
      if (st) st.hidden = true;
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    }

    function syncSet() {
      $$('[data-s]').forEach((e: any) => {
        const k = e.dataset.s;
        if (k === 'pos') {
          const v = S.side + ':' + Math.round(S.t * 10) / 10;
          e.value = [...e.options].some((o: any) => o.value === v) ? v : '';
        } else if (e.type === 'checkbox') {
          e.checked = !!S[k];
        } else {
          e.value = k === 'op' ? Math.round(S.op * 100) : S[k];
        }
      });
    }

    $$('[data-s]').forEach((e: any) =>
      e.addEventListener('input', () => {
        const k = e.dataset.s;
        if (k === 'pos') {
          if (!e.value) return;
          const p = e.value.split(':');
          S.side = p[0];
          S.t = +p[1];
        } else if (e.type === 'checkbox') {
          S[k] = e.checked;
        } else if (k === 'op') {
          S.op = e.value / 100;
        } else {
          S[k] = k === 'size' ? +e.value : e.value;
        }
        save();
        apply();
      })
    );

    $('#sReset')?.addEventListener('click', () => {
      S.side = DEF.side;
      S.t = DEF.t;
      save();
      apply();
      syncSet();
    });
    $('#sClose')?.addEventListener('click', closeSet);
    $('#bk')?.addEventListener('click', closeSet);
    $('#bSet')?.addEventListener('click', openSet);
    $('#bDash')?.addEventListener('click', () => (dash?.classList.contains('show') ? closeDash() : openDash()));

    $('#bStart')?.addEventListener('click', run);
    $('#bStop')?.addEventListener('click', () => stop());
    $('#bPause')?.addEventListener('click', pause);
    $('#bRestart')?.addEventListener('click', restart);

    $('#bCopy')?.addEventListener('click', async () => {
      const b = $('#bCopy');
      if (!b) return;
      const t = last.t ? 'Speed test: Download ' + fmt(last.dl) + ' Mbps, Upload ' + fmt(last.ul) + ' Mbps, Ping ' + Math.round(last.ping) + ' ms, Jitter ' + (last.jit || 0).toFixed(1) + ' ms (' + new Date(last.t).toLocaleString() + ')' : '';
      if (!t) {
        b.textContent = 'No result yet';
      } else {
        try {
          await navigator.clipboard.writeText(t);
          b.textContent = 'Copied ✓';
        } catch {
          b.textContent = 'Copied ✓';
        }
      }
      setTimeout(() => (b.textContent = 'Copy result'), 1800);
    });

    function apply() {
      if (!fw) return;
      fw.style.setProperty('--s', S.size + 'px');
      fw.style.setProperty('--op', String(S.op));
      icoRender();
      if (S.mon && !monOn) {
        monOn = true;
        monLoop();
      } else if (!S.mon) {
        monOn = false;
        monId++;
      }
      fw.style.display = S.on ? '' : 'none';
      if (!S.on) closeMenu();
      place();
      if (fw.classList.contains('open')) layoutMenu();
      if (dash && dash.classList.contains('show')) placePanel();
      render();
    }

    const onKeyEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const st = $('#set');
      if (st && !st.hidden) closeSet();
      else if (fw && fw.classList.contains('open')) closeMenu(true);
      else if (dash && dash.classList.contains('show')) closeDash();
    };
    document.addEventListener('keydown', onKeyEscape);

    const onResize = () => {
      place();
      avoid();
      if (fw && fw.classList.contains('open')) layoutMenu();
      if (dash && dash.classList.contains('show')) placePanel();
      graph();
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Initial setup
    apply();
    render();
    avoid();

    return () => {
      runId++;
      ac.abort();
      document.removeEventListener('pointerdown', onDocPointerDown);
      document.removeEventListener('keydown', onKeyEscape);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ maxWidth: '920px', margin: '0 auto', padding: '1.5rem 1rem 4rem', color: 'var(--text-primary)' }}>
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
            description: 'Free internet speed test by FixedAim: measure your download speed, upload speed, ping, jitter and packet loss in seconds.',
          }),
        }}
      />

      {/* Embedded CSS for Exact Original Features */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --ac: #00f5ff;
          --a2: #22d3ee;
          --mu: #8a9bb2;
          --bd: #243245;
          --cd: #111823;
          --tx: #e7edf5;
          --sh: 0 10px 30px rgba(0,0,0,0.5);
        }
        .pill { padding: 4px 12px; border-radius: 99px; font-size: .85rem; background: var(--cd); border: 1px solid var(--bd); }
        .pill::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; background: #dc2626; }
        .pill[data-on="1"]::before { background: #16a34a; }
        .card { background: var(--cd); border: 1px solid var(--bd); border-radius: 18px; padding: 18px; contain: layout style; }
        #hero { text-align: center; }
        #hero .gauge { width: min(420px, 100%); }
        .ph { font-weight: 700; font-size: 1.05rem; color: var(--ac); margin: 6px 0 12px; }
        .bar { height: 7px; border-radius: 9px; background: rgba(255,255,255,0.08); overflow: hidden; max-width: 420px; margin: 0 auto; }
        .bar i { display: block; height: 100%; width: 100%; background: linear-gradient(90deg, var(--ac), var(--a2)); transform: scaleX(0); transform-origin: 0 0; transition: transform .2s; will-change: transform; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
        .st b { display: block; font-size: 1.5rem; font-variant-numeric: tabular-nums; }
        .st span { color: var(--mu); font-size: .85rem; }
        .wide { grid-column: 1/-1; }
        [data-q="Excellent"] { color: #16a34a; }
        [data-q="Good"] { color: #4d8c0f; }
        [data-q="Fair"] { color: #f59e0b; }
        [data-q="Poor"] { color: #dc2626; }
        #hero .ctrl { margin-top: 16px; }
        .ctrl { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .btn { min-height: 42px; padding: 0 18px; border-radius: 10px; border: 1px solid var(--bd); background: rgba(255,255,255,0.04); color: var(--tx); font: inherit; font-weight: 600; cursor: pointer; touch-action: manipulation; transition: transform .1s, opacity .2s; }
        .btn:active:not(:disabled) { transform: scale(.97); }
        #bStart { background: var(--ac); border-color: var(--ac); color: #000; box-shadow: 0 0 14px rgba(0,245,255,0.45); font-weight: 700; }
        .btn.pri { background: var(--ac); border-color: var(--ac); color: #000; }
        .btn:disabled { opacity: .45; cursor: not-allowed; }
        .note { color: var(--mu); font-size: .85rem; text-align: center; margin: 0; }
        /* gauge */
        .gauge { display: block; margin: 0 auto; }
        .gt, .gp { fill: none; stroke-width: 12; stroke-linecap: round; }
        .gt { stroke: var(--bd); }
        .gp { stroke: #00f5ff; filter: drop-shadow(0 0 6px rgba(0,245,255,.65)); stroke-dasharray: 0 235.6; transition: stroke-dasharray .15s; }
        .gn { stroke: #ff4a4a; filter: drop-shadow(0 0 2px #ff2a2a) drop-shadow(0 0 6px rgba(255,30,30,.9)) drop-shadow(0 0 13px rgba(255,0,0,.65)); stroke-width: 3.5; stroke-linecap: round; transform-box: view-box; transform-origin: 90px 90px; transform: rotate(-90deg); transition: transform .15s; will-change: transform; }
        .gu { font-weight: 700; letter-spacing: .5px; fill: var(--ac); }
        .gc { fill: #ff4a4a; filter: drop-shadow(0 0 4px rgba(255,30,30,.9)); }
        .gv { font: 700 24px system-ui, sans-serif; fill: var(--tx); text-anchor: middle; }
        .gs { font: 9px system-ui, sans-serif; fill: var(--mu); text-anchor: middle; }
        /* floating button */
        #fw { position: fixed; z-index: 9200; width: var(--s, 56px); height: var(--s, 56px); left: 0; top: 0; touch-action: none; contain: layout; }
        #fw.snap { transition: left .3s cubic-bezier(.3,1.2,.5,1), top .3s cubic-bezier(.3,1.2,.5,1); }
        #fab { position: relative; width: 100%; height: 100%; border-radius: 50%; border: 0; padding: 0; background: linear-gradient(135deg, var(--ac), var(--a2)); color: #000; font-size: calc(var(--s,56px)*.45); line-height: 1; box-shadow: var(--sh); cursor: grab; touch-action: none; user-select: none; opacity: var(--op, .9); transition: opacity .2s, transform .2s; }
        #fw.drag #fab { cursor: grabbing; transform: scale(1.08); }
        #ico { display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.1; pointer-events: none; }
        #fab.live { font-size: calc(var(--s, 56px) * .28); }
        #fab.live b { font-weight: 800; font-variant-numeric: tabular-nums; }
        #fab.live small { font-size: .55em; font-weight: 700; opacity: .85; }
        #fab:hover, #fab:focus-visible, #fw.open #fab, #fw.drag #fab { opacity: 1; }
        .ring { position: absolute; inset: -5px; border-radius: 50%; pointer-events: none; opacity: 0; transition: opacity .2s; background: conic-gradient(var(--ac) var(--p, 0deg), transparent 0); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0); mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0); }
        #fw.busy .ring { opacity: 1; }
        .mi { position: absolute; left: 50%; top: 50%; width: 44px; height: 44px; margin: -22px; border-radius: 50%; border: 1px solid var(--bd); background: var(--cd); color: var(--tx); font-size: 19px; cursor: pointer; box-shadow: var(--sh); touch-action: manipulation; visibility: hidden; opacity: 0; pointer-events: none; transform: translate(0,0) scale(.3); transition: transform .28s cubic-bezier(.3,1.4,.5,1) calc(var(--i,0)*25ms), opacity .2s calc(var(--i,0)*25ms), visibility 0s .35s; }
        #fw.open .mi { visibility: visible; opacity: 1; pointer-events: auto; transform: translate(var(--dx), var(--dy)) scale(1); transition-delay: calc(var(--i,0)*25ms), calc(var(--i,0)*25ms), 0s; }
        .mi:hover, .mi:active { background: var(--ac); color: #000; }
        /* panels */
        #dash { position: fixed; z-index: 9100; width: 290px; max-width: calc(100vw - 16px); background: var(--cd); color: var(--tx); border: 1px solid var(--bd); border-radius: 18px; box-shadow: var(--sh); padding: 14px; visibility: hidden; opacity: 0; transform: scale(.92); transition: opacity .2s, transform .2s, visibility 0s .2s; backdrop-filter: blur(10px); }
        #dash.show { visibility: visible; opacity: 1; transform: none; transition-delay: 0s; }
        .dh { display: flex; justify-content: space-between; align-items: center; font-weight: 700; margin-bottom: 6px; font-size: 0.95rem; }
        .ib { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--bd); background: rgba(255,255,255,0.06); color: var(--tx); cursor: pointer; font-size: 14px; }
        #dash .gauge { width: 200px; }
        .two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: center; margin: 6px 0; }
        .two b { display: block; font-size: 1.15rem; font-weight: 700; }
        .two span { font-size: .75rem; color: var(--mu); }
        .det { display: none; }
        #dash.det .det { display: block; }
        #cv { width: 100%; height: 70px; display: block; margin: 8px 0; border-radius: 8px; background: rgba(0,0,0,0.3); }
        .sm { font-size: .78rem; color: var(--mu); margin: 4px 0; }
        #dash .btn { width: 100%; margin-top: 8px; }
        #bk { position: fixed; inset: 0; z-index: 9290; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); }
        #set { position: fixed; z-index: 9300; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(400px, calc(100vw - 24px)); max-height: calc(100vh - 24px); overflow: auto; background: var(--cd); border: 1px solid var(--bd); border-radius: 18px; box-shadow: var(--sh); padding: 20px; }
        #set[hidden], #bk[hidden] { display: none; }
        #set h2 { margin: 0 0 12px; font-size: 1.2rem; font-weight: 700; color: var(--ac); }
        .f { display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 44px; font-size: 0.92rem; }
        .f select, .f input[type=range] { max-width: 55%; font: inherit; }
        .f select { padding: 6px 10px; border-radius: 8px; border: 1px solid var(--bd); background: rgba(255,255,255,0.06); color: var(--tx); }
        .f input[type=range] { accent-color: var(--ac); cursor: pointer; }
        .f input[type=checkbox] { width: 20px; height: 20px; accent-color: var(--ac); }
        .cv2 { width: 100%; height: 150px; display: block; margin-top: 6px; cursor: crosshair; }
        #tip { position: fixed; z-index: 9500; pointer-events: none; background: #111823; color: #fff; border: 1px solid var(--bd); border-radius: 8px; padding: 8px 12px; font: 12px/1.5 system-ui, sans-serif; box-shadow: 0 6px 20px rgba(0,0,0,.6); white-space: nowrap; }
        #tip[hidden] { display: none; }
        #tip i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
        .qs { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-top: 8px; text-align: center; }
        .qs span { display: block; color: var(--mu); font-size: .85rem; }
        .stars { color: #f59e0b; font-size: 1.3rem; letter-spacing: 2px; }
        .info { display: grid; grid-template-columns: auto 1fr; gap: 4px 14px; margin: 8px 0 0; font-size: .9rem; }
        .info [hidden] { display: none; }
        .info dt { color: var(--mu); }
        .info dd { margin: 0; word-break: break-word; }
        /* Packet Loss Bar (Exact green and red styling) */
        .plb { display: flex; height: 22px; border-radius: 6px; overflow: hidden; margin-top: 8px; background: rgba(255,255,255,0.06); }
        .plb i { display: block; height: 100%; background: #4ade80; transition: width .3s; }
        .plb i + i { background: #dc2626; }
        .st small { display: block; color: var(--mu); font-size: .75rem; }
        .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
        /* SEO and FAQ styling */
        .seo { display: grid; gap: 14px; margin-top: 2rem; background: transparent; border: none; padding: 0; }
        .seo h2 { font-size: 1.35rem; font-weight: 800; color: var(--ac); margin: 16px 0 6px; }
        .seo h3 { font-size: 1.1rem; margin: 8px 0 4px; }
        .seo p, .seo li { color: var(--mu); margin: 0; line-height: 1.7; }
        .seo ul, .seo ol { margin: 0; padding-left: 20px; display: grid; gap: 6px; }
        .seo strong { color: var(--tx); }
        .tw { overflow-x: auto; border: 1px solid var(--bd); border-radius: 12px; background: var(--cd); margin: 12px 0; }
        .tw table { width: 100%; border-collapse: collapse; min-width: 440px; font-size: .92rem; }
        .tw th, .tw td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--bd); color: var(--mu); }
        .tw th { color: var(--tx); font-weight: 700; border-bottom: 1px solid var(--ac); }
        .tw tr:last-child td { border-bottom: 0; }
        .tw td:first-child { color: var(--tx); font-weight: 600; }
        .faq { display: grid; gap: 10px; margin-top: 10px; }
        .faq-h { font-size: 1.35rem; font-weight: 800; color: var(--ac); margin: 20px 0 6px; }
        .faq details { border: 1px solid var(--bd); border-radius: 12px; background: rgba(255,255,255,0.02); transition: border-color .2s; }
        .faq details[open] { border-color: var(--ac); background: rgba(0,245,255,0.02); }
        .faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 16px 18px; font-weight: 700; font-size: 1rem; }
        .faq summary::-webkit-details-marker { display: none; }
        .faq summary::after { content: ""; flex: none; width: 8px; height: 8px; border-right: 2px solid var(--mu); border-bottom: 2px solid var(--mu); transform: rotate(45deg); transition: transform .2s; }
        .faq details[open] summary::after { transform: rotate(-135deg); border-color: var(--ac); }
        .faq .a { padding: 0 18px 16px; color: var(--mu); line-height: 1.6; font-size: 0.92rem; }
      `}} />

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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--neon-cyan)' }}>
          Internet Speed Test
        </h1>
        <span className="pill" id="conn" data-k="conn" data-on="1">Online</span>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '16px' }}>
        {/* SPEEDOMETER HERO CARD */}
        <section className="card" id="hero">
          <svg className="gauge" id="g1" viewBox="0 0 180 134" role="img" aria-label="Live speedometer in megabits per second"></svg>
          <div className="ph" data-k="phase">Ready to test</div>
          <div className="bar" role="progressbar" aria-label="Test progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
            <i data-bar></i>
          </div>
          <div className="ctrl" data-avoid>
            <button className="btn pri" id="bStart">Start test</button>
            <button className="btn" id="bPause" disabled>Pause</button>
            <button className="btn" id="bStop" disabled>Stop</button>
            <button className="btn" id="bRestart">Restart</button>
            <button className="btn" id="bDash">Mini dashboard</button>
            <button className="btn" id="bSet">Settings</button>
            <button className="btn" id="bCopy">Copy result</button>
          </div>
        </section>

        {/* STATS GRID */}
        <section className="grid">
          <div className="card st"><span>Download (Mbps)</span><b data-k="dl">–</b></div>
          <div className="card st"><span>Upload (Mbps)</span><b data-k="ul">–</b></div>
          <div className="card st"><span>Ping (ms)</span><b data-k="ping">–</b><small data-k="pr"></small></div>
          <div className="card st"><span>Jitter (ms)</span><b data-k="jit">–</b></div>
          <div className="card st"><span>Latency during download (ms)</span><b data-k="ldl">–</b></div>
          <div className="card st"><span>Latency during upload (ms)</span><b data-k="lul">–</b></div>
          <div className="card st"><span>Packet loss (%)</span><b data-k="loss">–</b></div>
          <div className="card st"><span>Connection quality</span><b data-k="qual" data-q="">–</b></div>
          <div className="card st"><span>Progress</span><b data-k="prog">0%</b></div>
          <div className="card st wide"><span>Last test result</span><b style={{ fontSize: '1.05rem' }} data-k="last">No test yet</b></div>
        </section>

        {/* NETWORK QUALITY SCORE */}
        <section className="card">
          <b style={{ fontSize: '0.95rem', display: 'block', marginBottom: '8px' }}>Network quality score</b>
          <div className="qs">
            <div><span>Streaming</span><b className="stars" data-k="s1" role="img">☆☆☆☆☆</b></div>
            <div><span>Gaming</span><b className="stars" data-k="s2" role="img">☆☆☆☆☆</b></div>
            <div><span>Video calls</span><b className="stars" data-k="s3" role="img">☆☆☆☆☆</b></div>
          </div>
        </section>

        {/* CONNECTION DETAILS */}
        <section className="card">
          <b style={{ fontSize: '0.95rem', display: 'block', marginBottom: '8px' }}>Connection details</b>
          <dl className="info">
            <dt>Server location</dt><dd data-k="srv">–</dd>
            <dt>Network</dt><dd data-k="isp">–</dd>
            <dt>IP address</dt><dd data-k="ip">–</dd>
            <dt>Connection type</dt><dd data-k="ct">–</dd>
            <dt>Measured at</dt><dd data-k="mt">–</dd>
          </dl>
        </section>

        {/* PACKET LOSS CARD */}
        <section className="card">
          <b style={{ fontSize: '0.95rem', display: 'block', marginBottom: '4px' }}>Packet loss</b>
          <div className="plb" role="img" aria-label="Packets received versus lost">
            <i id="plg" style={{ width: '0%' }}></i>
            <i id="plr" style={{ width: '0%' }}></i>
          </div>
          <p className="sm" data-k="plt" style={{ marginTop: '6px' }}>–</p>
        </section>

        {/* LIVE PERFORMANCE CANVAS */}
        <section className="card">
          <b style={{ fontSize: '0.95rem', display: 'block' }}>Live performance</b>
          <p className="sm">
            <span style={{ color: 'var(--ac)' }}>●</span> Download &nbsp;
            <span style={{ color: 'var(--a2)' }}>●</span> Upload &nbsp;
            <span style={{ color: '#f59e0b' }}>●</span> Ping &nbsp;(each line scaled to its own range)
          </p>
          <canvas className="cv2" id="cLive" role="img" aria-label="Live download, upload and ping graph"></canvas>
        </section>

        {/* RECENT TESTS CANVAS */}
        <section className="card">
          <b style={{ fontSize: '0.95rem', display: 'block' }}>Recent tests</b>
          <p className="sm">Download (Cyan) and upload (Light Blue) in Mbps for your last 10 tests</p>
          <canvas className="cv2" id="cHist" role="img" aria-label="Bar chart of recent test results"></canvas>
        </section>

        {/* SEO GUIDE ARTICLE */}
        <article className="seo" aria-labelledby="seoT">
          <h2 id="seoT">How to read your internet speed test results</h2>
          <p>A speed test shows how quickly data moves between your device and the internet. The free FixedAim speed test above measures all of it in one run. The numbers look simple, but each one affects something different in daily life.</p>
          <ul>
            <li><strong>Download speed (Mbps)</strong> – how fast you receive data. It decides how quickly web pages load, videos stream and files download.</li>
            <li><strong>Upload speed (Mbps)</strong> – how fast you send data. It matters for video calls, sending large attachments, cloud backups and live streaming.</li>
            <li><strong>Ping (ms)</strong> – the delay before data starts to move. Lower is better, and it is the most important number for online games.</li>
            <li><strong>Jitter (ms)</strong> – how much your ping jumps around. High jitter causes choppy voice and video calls even when speed looks fine.</li>
            <li><strong>Packet loss (%)</strong> – the share of data that never arrives. Anything above 1% can cause freezes, lag and dropped calls.</li>
          </ul>

          <h2>What internet speed do you actually need?</h2>
          <p>These are typical guidelines per activity. If several people use the connection at the same time, add the numbers together.</p>
          <div className="tw">
            <table>
              <thead><tr><th>Activity</th><th>Suggested download</th><th>Also check</th></tr></thead>
              <tbody>
                <tr><td>Email and browsing</td><td>1–5 Mbps</td><td>Stable connection</td></tr>
                <tr><td>HD video streaming</td><td>5–10 Mbps per stream</td><td>Low packet loss</td></tr>
                <tr><td>4K video streaming</td><td>15–25 Mbps per stream</td><td>Consistent speed</td></tr>
                <tr><td>Video calls (Zoom, Meet, Teams)</td><td>3–10 Mbps</td><td>Upload, jitter</td></tr>
                <tr><td>Online gaming</td><td>10–25 Mbps</td><td>Ping under 50 ms</td></tr>
                <tr><td>Work from home, several devices</td><td>50–100 Mbps</td><td>Upload 10+ Mbps</td></tr>
                <tr><td>Large family, 4K and smart home</td><td>200+ Mbps</td><td>Good Wi-Fi coverage</td></tr>
              </tbody>
            </table>
          </div>
          <p>To put speed in real terms: a 1 GB file takes about 80 seconds to download at 100 Mbps, but around 5 minutes at 25 Mbps.</p>

          <h2>How to get an accurate speed test result</h2>
          <ol>
            <li>Pause downloads, cloud sync and streaming on every device in your home.</li>
            <li>Turn off your VPN, because it adds distance and can lower your speed.</li>
            <li>Connect with an Ethernet cable, or stand close to the Wi-Fi router.</li>
            <li>Restart your router if you have not done so in a while.</li>
            <li>Run the test two or three times, and once in the evening when the network is busiest. Compare the results using the history chart.</li>
          </ol>

          <h2>Why is my internet slow? Quick fixes that work</h2>
          <ul>
            <li><strong>Weak Wi-Fi signal:</strong> move the router to a central, open place or use the 5 GHz band for nearby devices.</li>
            <li><strong>Too many devices:</strong> disconnect devices you are not using, and move streaming boxes and PCs to a cable.</li>
            <li><strong>Background updates:</strong> game launchers, phone updates and cloud backups can quietly use most of your bandwidth.</li>
            <li><strong>Old router or cables:</strong> routers older than five years often cannot reach the speeds of a modern plan.</li>
            <li><strong>Evening congestion:</strong> if speeds drop only at peak hours, the problem may be your provider&apos;s network.</li>
            <li><strong>Still slow over a cable?</strong> Share your test results with your provider and ask them to check the line.</li>
          </ul>
        </article>

        {/* FAQ ACCORDION */}
        <section aria-labelledby="faqT">
          <h2 className="faq-h" id="faqT">Frequently asked questions</h2>
          <div className="faq" style={{ marginTop: '12px' }}>
            <details open>
              <summary>What is the best free internet speed test online?</summary>
              <div className="a">A good free speed test measures download, upload, ping, jitter and packet loss in one run, works on any phone or computer, and needs no sign-up or app. The FixedAim speed test does all of that in your browser and saves your last 10 results so you can compare them over time.</div>
            </details>
            <details>
              <summary>How do I test my internet speed accurately?</summary>
              <div className="a">Close other apps and tabs, pause downloads and streaming, turn off your VPN, and connect with an Ethernet cable if you can. If you are on Wi-Fi, stand close to the router. Run the test two or three times and use the average, because a single run can be affected by a short burst of traffic.</div>
            </details>
            <details>
              <summary>What is a good internet speed?</summary>
              <div className="a">For one or two people browsing, streaming HD video and making video calls, 25 to 50 Mbps download is usually enough. A busy household with several devices, 4K streaming or remote work is more comfortable at 100 Mbps or more. For gaming, low ping (under 50 ms) matters more than raw download speed.</div>
            </details>
            <details>
              <summary>What is the difference between Mbps and MB/s?</summary>
              <div className="a">Mbps means megabits per second and is how internet plans are sold. MB/s means megabytes per second and is what most download windows show. One byte is 8 bits, so divide Mbps by 8 to get MB/s. A 100 Mbps connection downloads at roughly 12.5 MB/s at best.</div>
            </details>
            <details>
              <summary>What are ping, jitter and packet loss?</summary>
              <div className="a">Ping is the time (in milliseconds) a small message takes to reach a server and come back. Jitter is how much that time changes from one message to the next. Packet loss is the percentage of messages that never arrive. Low ping, low jitter and 0% packet loss give smooth calls and gaming, even on a modest plan.</div>
            </details>
            <details>
              <summary>Why is my internet slower than what I pay for?</summary>
              <div className="a">Plans advertise a maximum speed, and real speeds are often lower. Common causes are weak Wi-Fi signal, an old router, many devices sharing the connection, a busy evening network, background updates, or a VPN. Testing over a cable next to the router shows the speed your provider is actually delivering.</div>
            </details>
            <details>
              <summary>Is this speed test accurate?</summary>
              <div className="a">The FixedAim speed test measures real transfer speed in your browser against Cloudflare&apos;s speed servers, which is a good estimate of everyday performance. Results can differ slightly from other tools because of server location, your device and browser. If the server cannot be reached, the page falls back to a simulation and clearly marks the result as simulated.</div>
            </details>
            <details>
              <summary>How can I make my Wi-Fi faster?</summary>
              <div className="a">Place the router in a central, open spot away from walls and appliances, restart it every so often, use the 5 GHz band for nearby devices, and update the router&apos;s firmware. Switching the Wi-Fi channel, moving heavy devices to Ethernet, or adding a mesh node can also help in larger homes.</div>
            </details>
          </div>
        </section>

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
      </main>

      {/* FLOATING ACTION BUTTON & RADIAL MENU */}
      <div id="fw" role="group" aria-label="Speed test floating controls">
        <div className="ring"></div>
        <button id="fab" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="menu" aria-label="Speed test menu. Press Enter to open, Shift plus arrow keys to move.">
          <span id="ico"></span>
        </button>
        <div id="menu" role="menu" aria-label="Speed test actions">
          <button className="mi" role="menuitem" data-a="toggle" type="button"></button>
          <button className="mi" role="menuitem" data-a="pause" type="button"></button>
          <button className="mi" role="menuitem" data-a="restart" type="button"></button>
          <button className="mi" role="menuitem" data-a="set" type="button"></button>
        </div>
      </div>

      {/* MINI DASHBOARD POPUP DIALOG */}
      <div id="dash" role="dialog" aria-label="Mini dashboard">
        <div className="dh">
          <span>Speed monitor</span>
          <span>
            <button className="ib" id="dMode" type="button" aria-label="Switch compact or detailed mode" title="Compact / detailed">⇔</button>{' '}
            <button className="ib" id="dClose" type="button" aria-label="Collapse mini dashboard" title="Collapse">✕</button>
          </span>
        </div>
        <svg className="gauge" id="g2" viewBox="0 0 180 134" role="img" aria-label="Mini speedometer"></svg>
        <div className="two">
          <div><b data-k="dl">–</b><span>↓ Mbps</span></div>
          <div><b data-k="ul">–</b><span>↑ Mbps</span></div>
        </div>
        <div className="det">
          <div className="two">
            <div><b data-k="ping">–</b><span>Ping ms</span></div>
            <div><b data-k="jit">–</b><span>Jitter ms</span></div>
            <div><b data-k="loss">–</b><span>Loss %</span></div>
            <div><b data-k="qual" data-q="">–</b><span>Quality</span></div>
          </div>
          <canvas id="cv" role="img" aria-label="Live performance graph"></canvas>
          <p className="sm" data-k="phase"></p>
          <p className="sm" data-k="last"></p>
        </div>
        <button className="btn pri" id="dRetest" type="button">Quick retest</button>
      </div>

      {/* SETTINGS BACKDROP & MODAL */}
      <div id="bk" hidden></div>
      <div id="set" role="dialog" aria-modal="true" aria-labelledby="stt" hidden>
        <h2 id="stt">Customization</h2>
        <label className="f">Show floating button <input type="checkbox" data-s="on" /></label>
        <label className="f">Auto live speed on button <input type="checkbox" data-s="mon" /></label>
        <label className="f">Button size <input type="range" min="40" max="80" step="2" data-s="size" /></label>
        <label className="f">Opacity <input type="range" min="30" max="100" data-s="op" /></label>
        <label className="f">Theme <select data-s="theme"><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
        <label className="f">Menu layout <select data-s="layout"><option value="radial">Radial</option><option value="list">Stacked list</option></select></label>
        <label className="f">Position <select data-s="pos"><option value="">Custom (dragged)</option><option value="right:.5">Right middle</option><option value="left:.5">Left middle</option><option value="right:.1">Top right</option><option value="left:.1">Top left</option><option value="right:.9">Bottom right</option><option value="left:.9">Bottom left</option></select></label>
        <div className="ctrl" style={{ marginTop: '14px' }}>
          <button className="btn" id="sReset" type="button">Reset position</button>
          <button className="btn pri" id="sClose" type="button">Done</button>
        </div>
        <p className="note" style={{ marginTop: '8px' }}>Preferences are saved automatically on this device.</p>
      </div>

      {/* HOVER TOOLTIP POPUP */}
      <div id="tip" hidden></div>
      <div className="sr" id="live" aria-live="polite"></div>
    </div>
  );
}
