import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play, RotateCcw, Pause, LogOut, ExternalLink, ChevronDown, ChevronUp,
  Home, ChevronRight, HelpCircle, Maximize, Minimize, Volume2, VolumeX, MousePointer2,
} from 'lucide-react';

function ResearchLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: '#22d3ee',
        fontWeight: 600,
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
    >
      {children}
      <ExternalLink size={13} style={{ position: 'relative', top: '-1px' }} />
    </a>
  );
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_X_OFFSET = 200;
const PLAYER_SPEED_X = 6;
const PLAYER_SPEED_Y = 6;
const PLAYER_SIZE = 12;
const LEVEL_LENGTH = 15000;
const COUNTDOWN_STEP_MS = 700;
const SITE_URL = 'https://yourdomain.com/space-waves';

type GameState = 'START' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

interface Rect { x: number; y: number; w: number; h: number; }
interface TrailPoint { x: number; y: number; alpha: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; }
interface Star { x: number; y: number; size: number; speed: number; }
interface Rotator { x: number; y: number; radius: number; angle: number; spinSpeed: number; spikes: number; }

// ─── More Tools ───────────────────────────────────────────────────────────
interface ToolLink { label: string; href: string; icon: React.ReactNode; }
const MORE_TOOLS: ToolLink[] = [
  { label: 'CPS Test', href: '/cps-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Spacebar Counter', href: '/spacebar', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="6" y1="15" x2="18" y2="15"/></svg> },
  { label: 'Aim Trainer', href: '/aim-trainer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
  { label: 'Typing Test', href: '/typing-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 15h8M7 11h2m3 0h2m3 0h-1"/></svg> },
  { label: 'Reaction Time', href: '/reaction-time', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: 'Scroll Test', href: '/scroll-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><circle cx="12" cy="12" r="9"/><path d="M9 11l3-3 3 3"/><path d="M9 13l3 3 3-3"/></svg> },
  { label: 'Double Click Test', href: '/double-click', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/></svg> },
  { label: 'Sniper Mode', href: '/sniper-mode', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/><circle cx="12" cy="12" r="8" opacity=".4"/></svg> },
  { label: 'Mouse Accuracy', href: '/mouse-accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 2v10"/></svg> },
  { label: 'Key Visualizer', href: '/key-visualizer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"/></svg> },
  { label: 'F1 Reaction', href: '/f1-reaction', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { label: 'Space Defense', href: '/space-defense', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { label: 'Accuracy Test', href: '/accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { label: 'CPS Rush', href: '/cps-rush', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 12v-4"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Voyager Game', href: '/voyager-game', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },
];

// ─── FAQ data ───────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'What is Space Waves?', a: 'Space Waves is a side-scrolling arcade dodging game. You steer a glowing arrow through a procedurally generated course made of walls, floating blocks, narrow tunnels, and spinning spiked hazards, trying to reach the finish line without crashing.' },
  { q: 'How do I control the arrow?', a: 'Hold Space or hold down your mouse button (or tap and hold on mobile) to make the arrow climb. Release to let it glide back down. The arrow moves forward automatically, so your only job is managing altitude.' },
  { q: 'What do the different obstacles look like?', a: 'You will run into narrow gaps between glowing cyan walls, stacked floating blocks, long tunnel sections that squeeze the play area, and rotating spiked hazards with a bright red core. Each type asks for a slightly different dodge — some want a steady line, others want quick taps.' },
  { q: 'What does the progress bar and percentage show?', a: 'The progress bar and the percentage counter track how far your arrow has traveled through the current run, from 0% at the start to 100% at the finish line. Crashing ends the run and shows exactly how far you made it.' },
  { q: 'What does the attempts counter track?', a: 'Every time you crash and start over, your attempts count goes up by one. It resets back to one whenever you clear a level, so you can see how many tries it actually took you to finish.' },
  { q: 'Can I pause the game mid-run?', a: 'Yes. Press Escape or P, or tap the pause icon in the corner of the game window, to freeze the run at any point. From the pause screen you can resume exactly where you left off or exit back to the start screen.' },
  { q: 'Is the course the same every time I play?', a: 'No. Each run generates a fresh sequence of gaps, blocks, tunnels, and spinning hazards, so the layout you see is different every time you start a new attempt, keeping runs from feeling memorized.' },
  { q: 'What happens if I hit a wall or a spinning hazard?', a: 'Touching any wall, block, or spinning hazard immediately ends your run with a burst of particles and a crash sound. Your final progress percentage is shown so you can see exactly where the run ended.' },
  { q: 'Can I play Space Waves on mobile?', a: 'Yes. On a touchscreen device, press and hold anywhere on the game area to climb and release to descend, the same timing as holding Space or a mouse button on desktop.' },
  { q: "What's the best way to get past a tight gap?", a: 'Start your climb or descent a little early rather than at the last moment. Because the arrow takes a beat to change direction, lining up before the gap arrives gives you room to correct if you misjudge the timing.' },
  { q: 'How do the spinning spiked hazards work?', a: 'Each spiked hazard rotates continuously and has a small hitbox near its glowing core. Treat them like a stationary obstacle to steer around rather than something you can outrun, since they spin in place rather than chase you.' },
  { q: 'Does the game get harder the further I go?', a: 'The course mixes gap sections, block clusters, tunnels, and spinning hazards throughout the run, and tighter combinations of these appear more often the longer a run continues, so later stretches generally demand tighter control.' },
  { q: 'Why do I keep overshooting when I tap the controls?', a: 'Holding the control moves the arrow upward at a steady rate, and releasing sends it downward at the same rate, so short, deliberate taps rather than long holds usually give you finer control through tight spaces.' },
  { q: 'Is there a sound I can use as a cue?', a: 'Yes. A short flap sound plays every time you start a climb, which can help you build a rhythm for timing your taps without staring only at the arrow.' },
  { q: 'What happens when I reach the end of the course?', a: 'Clearing the full course triggers a victory screen showing how many attempts it took you, and gives you the option to jump straight back in for another run with your attempt count reset.' },
  { q: 'How is clicking speed connected to a game like this?', a: 'Space Waves rewards timing and rhythm more than raw speed, but players who also practice on a CPS (clicks per second) test often notice their taps feel more consistent, since both skills draw on quick, controlled finger movements.' },
  { q: 'Can I use a keyboard and mouse at the same time?', a: 'Yes. Space and your mouse button both trigger the same climb action, so you can switch between them freely or use whichever feels more comfortable for a given stretch of the course.' },
  { q: 'Why did my run end even though I thought I was clear?', a: 'The arrow has a hitbox slightly smaller than its visible triangle, but clipping the very edge of a wall, block, or spinning hazard still counts as a crash, so leave a little extra room when threading a tight gap.' },
  { q: 'Do I need an account to play?', a: 'No. You can jump straight into a run from the start screen, and your attempts and progress for the current session are tracked automatically without needing to sign up for anything.' },
  { q: "What's a good way to practice before a hard section?", a: 'Restarting quickly after a crash and replaying the same style of section a few times in a row helps you build muscle memory for that pattern of gaps, blocks, or hazards faster than spacing runs far apart.' },
];

// ─── SEO Head Injection ─────────────────────────────────────────────────────
const SEOHead: React.FC = () => {
  useEffect(() => {
    document.title = 'Space Waves — Free Arcade Dodging Game';

    const setMeta = (attrs: Record<string, string>) => {
      const sel = Object.entries(attrs).filter(([k]) => k !== 'content').map(([k, v]) => `[${k}="${v}"]`).join('');
      let el = document.querySelector<HTMLMetaElement>(`meta${sel}`);
      if (!el) {
        el = document.createElement('meta');
        Object.entries(attrs).filter(([k]) => k !== 'content').forEach(([k, v]) => el!.setAttribute(k, v));
        document.head.appendChild(el);
      }
      el.setAttribute('content', attrs.content);
    };

    const setJsonLd = (id: string, data: object) => {
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('script');
        el.id = id;
        el.setAttribute('type', 'application/ld+json');
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(data);
    };

    setMeta({ name: 'description', content: 'Space Waves is a free browser arcade game. Hold to climb, release to fall, and dodge walls, blocks, tunnels, and spinning hazards to reach the finish line.' });
    setMeta({ name: 'robots', content: 'index, follow' });
    setMeta({ property: 'og:type', content: 'website' });
    setMeta({ property: 'og:title', content: 'Space Waves — Free Arcade Dodging Game' });
    setMeta({ property: 'og:description', content: 'Hold to climb, release to fall. Dodge your way through a procedurally generated course of obstacles in Space Waves.' });

    setJsonLd('schema-webapp', {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Space Waves',
      url: SITE_URL,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      description: 'Space Waves is a free browser arcade dodging game where holding a key or mouse button makes your arrow climb, and releasing lets it fall.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });

    setJsonLd('schema-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });

    setJsonLd('schema-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Games', item: `${SITE_URL}/games` },
        { '@type': 'ListItem', position: 3, name: 'Space Waves', item: SITE_URL },
      ],
    });

    return () => {
      ['schema-webapp', 'schema-faq', 'schema-breadcrumb'].forEach(id => document.getElementById(id)?.remove());
    };
  }, []);

  return null;
};

// ─── Breadcrumb ─────────────────────────────────────────────────────────────
function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 w-full">
      <ol className="flex items-center gap-1.5 text-sm text-slate-500 list-none p-0 m-0">
        <li>
          <a href="/" className="flex items-center gap-1 text-slate-500 hover:text-cyan-300 no-underline">
            <Home size={13} /> Home
          </a>
        </li>
        <li aria-hidden="true"><ChevronRight size={12} className="text-slate-700" /></li>
        <li><a href="/games" className="text-slate-500 hover:text-cyan-300 no-underline">Games</a></li>
        <li aria-hidden="true"><ChevronRight size={12} className="text-slate-700" /></li>
        <li aria-current="page" className="text-cyan-300 font-bold">Space Waves</li>
      </ol>
    </nav>
  );
}

// ─── FAQ Accordion ──────────────────────────────────────────────────────────
function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(3);
  return (
    <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {FAQS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} role="listitem" className={`sw-faq-item ${isOpen ? 'open' : ''}`}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="sw-faq-question"
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              {isOpen ? <ChevronUp size={20} className="sw-faq-chevron open" /> : <ChevronDown size={20} className="sw-faq-chevron" />}
            </button>
            {isOpen && <p className="sw-faq-answer">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}

export default function SpaceWavesGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>('START');
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [countdownText, setCountdownText] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const gameStateRef = useRef<GameState>('START');
  const mutedRef = useRef(false);
  const playerRef = useRef({ x: PLAYER_X_OFFSET, y: CANVAS_HEIGHT / 2, isUp: false });
  const trailRef = useRef<TrailPoint[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const obstaclesRef = useRef<Rect[]>([]);
  const rotatorsRef = useRef<Rotator[]>([]);
  const starsRef = useRef<Star[]>([]);
  const keysRef = useRef({ space: false, mouse: false });
  const audioCtxRef = useRef<AudioContext | null>(null);
  const countdownTimeoutsRef = useRef<number[]>([]);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1,
      });
    }
    starsRef.current = stars;
  }, []);

  // Fullscreen detection
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    playClickSoundRef.current?.();
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const ensureAudioContext = () => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } catch (e) {
      // Web Audio not available
    }
    return audioCtxRef.current;
  };

  const playBeep = (freq: number, durationMs: number, type: OscillatorType = 'sine') => {
    if (mutedRef.current) return;
    const ctx = ensureAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000 + 0.02);
    } catch (e) {
      // ignore
    }
  };

  const playClickSound = () => playBeep(720, 70, 'square');
  const playFlapSound = () => playBeep(520, 60, 'triangle');
  const playClickSoundRef = useRef(playClickSound);
  useEffect(() => { playClickSoundRef.current = playClickSound; });

  const generateLevel = () => {
    const obs: Rect[] = [];
    const rotators: Rotator[] = [];
    let currentX = 800;

    obs.push({ x: 0, y: 0, w: LEVEL_LENGTH + 1000, h: 40 });
    obs.push({ x: 0, y: CANVAS_HEIGHT - 40, w: LEVEL_LENGTH + 1000, h: 40 });

    while (currentX < LEVEL_LENGTH) {
      const pattern = Math.floor(Math.random() * 4);

      if (pattern === 0) {
        const gapSize = 160;
        const gapY = Math.random() * (CANVAS_HEIGHT - 80 - gapSize) + 40;
        obs.push({ x: currentX, y: 40, w: 60, h: Math.max(0, gapY - 40) });
        const bottomY = gapY + gapSize;
        obs.push({ x: currentX, y: bottomY, w: 60, h: Math.max(0, CANVAS_HEIGHT - 40 - bottomY) });
        currentX += 350;
      } else if (pattern === 1) {
        obs.push({ x: currentX, y: 200, w: 80, h: 80 });
        obs.push({ x: currentX + 150, y: 400, w: 80, h: 80 });
        currentX += 400;
      } else if (pattern === 2) {
        const tunnelY = Math.random() * 200 + 200;
        const tunnelSize = 160;
        const topHeight = tunnelY - tunnelSize / 2 - 40;
        const bottomY = tunnelY + tunnelSize / 2;
        obs.push({ x: currentX, y: 40, w: 400, h: Math.max(0, topHeight) });
        obs.push({ x: currentX, y: bottomY, w: 400, h: Math.max(0, CANVAS_HEIGHT - 40 - bottomY) });
        currentX += 600;
      } else {
        obs.push({ x: currentX, y: 250, w: 50, h: 100 });
        currentX += 250;
      }

      if (Math.random() < 0.55) {
        rotators.push({
          x: currentX - 150 + Math.random() * 100,
          y: Math.random() * (CANVAS_HEIGHT - 200) + 100,
          radius: 22,
          angle: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() < 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.03),
          spikes: 8,
        });
      }
    }
    obstaclesRef.current = obs;
    rotatorsRef.current = rotators;
  };

  const resetGame = () => {
    playerRef.current = { x: PLAYER_X_OFFSET, y: CANVAS_HEIGHT / 2, isUp: false };
    trailRef.current = [];
    particlesRef.current = [];
    generateLevel();
    setProgress(0);
  };

  const createExplosion = (x: number, y: number) => {
    const colors = ['#22d3ee', '#67e8f9', '#ffffff'];
    for (let i = 0; i < 30; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        maxLife: Math.random() * 30 + 20,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  };

  const clearCountdownTimers = () => {
    countdownTimeoutsRef.current.forEach(id => window.clearTimeout(id));
    countdownTimeoutsRef.current = [];
  };

  const startGame = () => {
    const allowed =
      gameStateRef.current === 'START' ||
      gameStateRef.current === 'GAMEOVER' ||
      gameStateRef.current === 'VICTORY';
    if (!allowed) return;

    if (gameStateRef.current === 'GAMEOVER' || gameStateRef.current === 'VICTORY') {
      setAttempts(a => a + 1);
    }

    ensureAudioContext();
    resetGame();
    clearCountdownTimers();
    setGameState('COUNTDOWN');
    gameStateRef.current = 'COUNTDOWN';

    const steps = [
      { text: '3', freq: 440, dur: 160 },
      { text: '2', freq: 440, dur: 160 },
      { text: '1', freq: 440, dur: 160 },
      { text: 'GO!', freq: 880, dur: 320 },
    ];

    steps.forEach((step, i) => {
      const id = window.setTimeout(() => {
        setCountdownText(step.text);
        playBeep(step.freq, step.dur, step.text === 'GO!' ? 'square' : 'sine');
      }, i * COUNTDOWN_STEP_MS);
      countdownTimeoutsRef.current.push(id);
    });

    const finishId = window.setTimeout(() => {
      setCountdownText(null);
      setGameState('PLAYING');
      gameStateRef.current = 'PLAYING';
    }, steps.length * COUNTDOWN_STEP_MS + 300);
    countdownTimeoutsRef.current.push(finishId);
  };

  const pauseGame = () => {
    if (gameStateRef.current !== 'PLAYING') return;
    keysRef.current.space = false;
    keysRef.current.mouse = false;
    setGameState('PAUSED');
    gameStateRef.current = 'PAUSED';
  };

  const resumeGame = () => {
    if (gameStateRef.current !== 'PAUSED') return;
    playClickSound();
    setGameState('PLAYING');
    gameStateRef.current = 'PLAYING';
  };

  const togglePause = () => {
    if (gameStateRef.current === 'PLAYING') {
      playClickSound();
      pauseGame();
    } else if (gameStateRef.current === 'PAUSED') {
      resumeGame();
    }
  };

  const exitToMenu = () => {
    playClickSound();
    clearCountdownTimers();
    setCountdownText(null);
    keysRef.current.space = false;
    keysRef.current.mouse = false;
    setGameState('START');
    gameStateRef.current = 'START';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (!keysRef.current.space && gameStateRef.current === 'PLAYING') {
          playFlapSound();
        }
        keysRef.current.space = true;
        if (
          gameStateRef.current !== 'PLAYING' &&
          gameStateRef.current !== 'COUNTDOWN' &&
          gameStateRef.current !== 'PAUSED'
        ) {
          startGame();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') keysRef.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearCountdownTimers();
    };
  }, []);

  const handleMouseDown = () => {
    if (!keysRef.current.mouse && gameState === 'PLAYING') {
      playFlapSound();
    }
    keysRef.current.mouse = true;
    if (gameState !== 'PLAYING' && gameState !== 'COUNTDOWN' && gameState !== 'PAUSED') {
      startGame();
    }
  };
  const handleMouseUp = () => {
    keysRef.current.mouse = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let animationFrameId: number;

    const loop = () => {
      update();
      draw(ctx);
      animationFrameId = requestAnimationFrame(loop);
    };

    const update = () => {
      const state = gameStateRef.current;
      if (state === 'PAUSED') return;

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        return p.life < p.maxLife;
      });

      if (state !== 'PLAYING') return;

      const player = playerRef.current;
      const isInputActive = keysRef.current.space || keysRef.current.mouse;

      player.x += PLAYER_SPEED_X;
      player.y += isInputActive ? -PLAYER_SPEED_Y : PLAYER_SPEED_Y;

      setProgress(Math.min(100, Math.max(0, (player.x / LEVEL_LENGTH) * 100)));

      trailRef.current.push({ x: player.x, y: player.y, alpha: 1 });
      if (trailRef.current.length > 50) trailRef.current.shift();
      trailRef.current.forEach(t => (t.alpha -= 0.02));
      trailRef.current = trailRef.current.filter(t => t.alpha > 0);

      rotatorsRef.current.forEach(r => {
        r.angle += r.spinSpeed;
      });

      const hitBox = {
        x: player.x - PLAYER_SIZE + 4,
        y: player.y - PLAYER_SIZE + 4,
        w: PLAYER_SIZE * 2 - 8,
        h: PLAYER_SIZE * 2 - 8,
      };

      let hasCollided = false;
      for (const obs of obstaclesRef.current) {
        if (
          hitBox.x < obs.x + obs.w &&
          hitBox.x + hitBox.w > obs.x &&
          hitBox.y < obs.y + obs.h &&
          hitBox.y + hitBox.h > obs.y
        ) {
          hasCollided = true;
          break;
        }
      }

      if (!hasCollided) {
        for (const r of rotatorsRef.current) {
          const dx = player.x - r.x;
          const dy = player.y - r.y;
          const distSq = dx * dx + dy * dy;
          const minDist = r.radius * 0.75 + PLAYER_SIZE * 0.7;
          if (distSq < minDist * minDist) {
            hasCollided = true;
            break;
          }
        }
      }

      if (hasCollided) {
        createExplosion(player.x, player.y);
        playBeep(120, 300, 'sawtooth');
        setGameState('GAMEOVER');
        gameStateRef.current = 'GAMEOVER';
      }

      if (player.x >= LEVEL_LENGTH) {
        playBeep(660, 150, 'triangle');
        setGameState('VICTORY');
        gameStateRef.current = 'VICTORY';
      }
    };

    // Keeps the canvas's internal pixel resolution matched to its actual displayed
    // CSS size (times devicePixelRatio), so scaling up in fullscreen (or on high-DPI
    // "4K-like" screens) stays crisp instead of the browser stretching a low-res
    // 800x600 backing store and blurring it. All existing draw calls below still use
    // the original logical 800x600 coordinate system — this transform maps them onto
    // the higher-resolution backing store automatically.
    const syncCanvasResolution = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 4);
      const rect = canvas.getBoundingClientRect();
      const displayWidth = Math.max(1, Math.round(rect.width * dpr));
      const displayHeight = Math.max(1, Math.round(rect.height * dpr));
      // Only touch the backing store when the size actually changed by a real
      // amount — resizing the canvas clears it, so avoid doing it for
      // sub-pixel layout jitter (which would otherwise thrash every frame).
      if (Math.abs(canvas.width - displayWidth) > 1 || Math.abs(canvas.height - displayHeight) > 1) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }
      ctx.setTransform(canvas.width / CANVAS_WIDTH, 0, 0, canvas.height / CANVAS_HEIGHT, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };

    // Resync immediately on fullscreen toggles / window/display resizes instead
    // of waiting for the next animation frame, so the switch to a large fullscreen
    // canvas never shows even a single blurry upscaled frame.
    const handleResize = () => syncCanvasResolution();
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);

    const draw = (ctx: CanvasRenderingContext2D) => {
      syncCanvasResolution();
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const player = playerRef.current;
      const cameraX = Math.max(0, player.x - PLAYER_X_OFFSET);

      ctx.fillStyle = '#ffffff';
      starsRef.current.forEach(star => {
        const starX = (star.x - cameraX * star.speed) % CANVAS_WIDTH;
        const drawX = starX < 0 ? starX + CANVAS_WIDTH : starX;
        ctx.globalAlpha = star.speed;
        ctx.fillRect(drawX, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1.0;

      ctx.save();
      ctx.translate(-cameraX, 0);

      ctx.strokeStyle = '#0d1522';
      ctx.lineWidth = 1;
      const gridOffset = cameraX % 100;
      for (let i = -100; i < CANVAS_WIDTH + 100; i += 100) {
        ctx.beginPath();
        ctx.moveTo(cameraX + i - gridOffset, 0);
        ctx.lineTo(cameraX + i - gridOffset, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let i = 0; i < CANVAS_HEIGHT; i += 100) {
        ctx.beginPath();
        ctx.moveTo(cameraX, i);
        ctx.lineTo(cameraX + CANVAS_WIDTH, i);
        ctx.stroke();
      }

      obstaclesRef.current.forEach(obs => {
        if (obs.x + obs.w > cameraX && obs.x < cameraX + CANVAS_WIDTH) {
          ctx.save();
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#0e7490';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#67e8f9';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
          ctx.strokeStyle = 'rgba(103, 232, 249, 0.35)';
          ctx.strokeRect(obs.x + 4, obs.y + 4, obs.w - 8, obs.h - 8);
          ctx.restore();
        }
      });

      rotatorsRef.current.forEach(r => {
        if (r.x + r.radius > cameraX && r.x - r.radius < cameraX + CANVAS_WIDTH) {
          ctx.save();
          ctx.translate(r.x, r.y);
          ctx.rotate(r.angle);

          const outerR = r.radius;
          const innerR = r.radius * 0.45;
          const points = r.spikes * 2;

          ctx.beginPath();
          for (let i = 0; i < points; i++) {
            const rad = i % 2 === 0 ? outerR : innerR;
            const a = (Math.PI / r.spikes) * i;
            const px = Math.cos(a) * rad;
            const py = Math.sin(a) * rad;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();

          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 18;
          ctx.fillStyle = '#0a0a12';
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, innerR);
          coreGradient.addColorStop(0, '#ffe4e6');
          coreGradient.addColorStop(0.5, '#fb7185');
          coreGradient.addColorStop(1, '#e11d48');
          ctx.beginPath();
          ctx.arc(0, 0, innerR * 0.85, 0, Math.PI * 2);
          ctx.fillStyle = coreGradient;
          ctx.fill();

          ctx.restore();
        }
      });

      if (trailRef.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
        for (let i = 1; i < trailRef.current.length; i++) {
          ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y);
        }
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
        ctx.lineWidth = 12;
        ctx.stroke();
      }

      if (gameStateRef.current !== 'GAMEOVER') {
        const isUp = keysRef.current.space || keysRef.current.mouse;

        ctx.save();
        ctx.translate(player.x, player.y);

        const angle = isUp ? -Math.PI / 4 : Math.PI / 4;
        ctx.rotate(angle);

        ctx.shadowColor = '#67e8f9';
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.moveTo(PLAYER_SIZE, 0);
        ctx.lineTo(-PLAYER_SIZE, PLAYER_SIZE);
        ctx.lineTo(-PLAYER_SIZE, -PLAYER_SIZE);
        ctx.closePath();

        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      particlesRef.current.forEach(p => {
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      if (LEVEL_LENGTH < cameraX + CANVAS_WIDTH) {
        ctx.save();
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(LEVEL_LENGTH, 0, 40, CANVAS_HEIGHT);
        ctx.restore();

        ctx.fillStyle = '#083344';
        for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
          ctx.fillRect(LEVEL_LENGTH + ((y / 40) % 2 === 0 ? 0 : 20), y, 20, 20);
          ctx.fillRect(LEVEL_LENGTH + ((y / 40) % 2 === 0 ? 20 : 0), y + 20, 20, 20);
        }
      }

      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
    };
  }, []);

  return (
    <>
      <SEOHead />
      <div className="relative flex flex-col items-center">
        <style>{`
          @keyframes countdownPop {
            0% { transform: scale(0.4); opacity: 0; }
            55% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .countdown-pop { animation: countdownPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
          .sw-btn-primary {
            display: flex; align-items: center; gap: 8px;
            padding: 14px 32px; background: #06b6d4; color: #020617;
            border: none; border-radius: 9999px; font-weight: 800; font-size: 1.1rem;
            font-family: inherit; cursor: pointer; transition: all 0.2s ease;
            letter-spacing: 0.05em; box-shadow: 0 0 20px rgba(6,182,212,0.4); text-transform: uppercase;
          }
          .sw-btn-primary:hover { background: #22d3ee; transform: scale(1.05); box-shadow: 0 0 30px rgba(34,211,238,0.7); }
          .sw-btn-outline {
            display: flex; align-items: center; gap: 8px;
            padding: 14px 32px; background: transparent; color: #67e8f9;
            border: 2px solid rgba(6,182,212,0.5); border-radius: 9999px; font-weight: 800;
            font-size: 1.1rem; font-family: inherit; cursor: pointer; transition: all 0.2s ease;
            letter-spacing: 0.05em; text-transform: uppercase;
          }
          .sw-btn-outline:hover { border-color: #67e8f9; background: rgba(15,23,42,0.8); transform: scale(1.05); }
          .sw-btn-pause {
            width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
            background: rgba(2,6,23,0.7); border: 1px solid rgba(6,182,212,0.4); border-radius: 9999px;
            color: #67e8f9; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 0 15px rgba(34,211,238,0.2);
          }
          .sw-btn-pause:hover { background: rgba(15,23,42,0.9); color: #ffffff; }
          .sw-hud-box {
            border-radius: 10px; border: 1px solid rgba(6,182,212,0.4); background: rgba(2,6,23,0.75);
            backdrop-filter: blur(6px); padding: 5px 14px; font-family: monospace; text-align: center;
          }
          .sw-hud-label { font-size: 10px; letter-spacing: 0.15em; color: #22d3ee; font-weight: 700; }
          .sw-hud-value { color: #ffffff; font-size: 1.1rem; font-weight: 700; }
          .sw-overlay {
            position: absolute; inset: 0; background: rgba(2,6,23,0.88); backdrop-filter: blur(4px);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: #fff; text-align: center;
          }
          .sw-overlay-title {
            font-size: 2.8rem; font-weight: 900; margin-bottom: 8px; letter-spacing: 0.05em;
            background: linear-gradient(to bottom, #ffffff, #67e8f9); -webkit-background-clip: text;
            background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 20px rgba(34,211,238,0.5));
          }
          .sw-overlay-sub { color: rgba(165,243,252,0.75); margin-bottom: 32px; font-family: monospace; font-size: 1.05rem; }
          .sw-overlay-hint { margin-top: 16px; color: rgba(165,243,252,0.35); font-family: monospace; font-size: 0.85rem; }
          .sw-page-header { display: flex; flex-direction: column; align-items: center; margin-top: 28px; margin-bottom: 20px; }
          .sw-page-badge {
            display: inline-block; padding: 6px 16px; margin-bottom: 12px; border-radius: 9999px;
            border: 1px solid rgba(34,211,238,0.4); background: rgba(15,23,42,0.6); color: #22d3ee;
            font-size: 0.7rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;
          }
          .sw-page-title {
            font-size: 2.5rem; font-weight: 900; letter-spacing: 0.03em; color: #22d3ee;
            text-shadow: 0 0 25px rgba(34,211,238,0.5); margin: 0; text-align: center;
          }
          .sw-tool-card {
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem;
            background: #0f172a; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px;
            padding: 1.2rem 0.5rem; text-decoration: none; color: #22d3ee; transition: all 0.2s ease;
          }
          .sw-tool-card:hover { background: rgba(34,211,238,0.07); border-color: rgba(34,211,238,0.3); transform: translateY(-2px); }
          .sw-tool-icon-box {
            width: 48px; height: 48px; border-radius: 12px;
            background: rgba(255,255,255,0.05);
            display: flex; align-items: center; justify-content: center;
            color: #22d3ee;
          }
          .sw-callout {
            border-left: 4px solid #22d3ee; background: rgba(34,211,238,0.05); border-radius: 0 12px 12px 0;
            padding: 1.4rem 1.5rem; margin-bottom: 2.5rem;
          }
          .sw-faq-item {
            border-radius: 14px; border: 1px solid rgba(148,163,184,0.15); background: rgba(15,23,42,0.5);
            transition: all 0.2s ease; overflow: hidden;
          }
          .sw-faq-item.open {
            border: 1px solid rgba(45, 212, 191, 0.5);
            background: linear-gradient(180deg, rgba(20,184,166,0.08), rgba(2,6,23,0.4));
            box-shadow: 0 0 20px rgba(45,212,191,0.15);
          }
          .sw-faq-question {
            width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px;
            padding: 18px 22px; background: transparent; border: none; cursor: pointer; text-align: left;
            font: inherit; color: #ffffff; font-weight: 700; font-size: 1rem;
          }
          .sw-faq-chevron { flex-shrink: 0; color: #94a3b8; transition: transform 0.2s ease, color 0.2s ease; }
          .sw-faq-chevron.open { color: #2dd4bf; transform: rotate(180deg); }
          .sw-faq-answer { padding: 0 22px 20px 22px; color: rgba(203,213,225,0.85); font-size: 0.95rem; line-height: 1.6; margin: 0; }

          /* Fullscreen-specific layout: the container keeps its 4:3 aspect ratio and is
             scaled up as large as the screen allows, centered with margin:auto. This keeps
             the border frame, HUD, and bottom control bar attached tightly to the visible
             game area at every screen size, instead of stretching/cropping past them. */
          .sw-fullscreen-container {
            position: fixed !important;
            inset: 0 !important;
            margin: auto !important;
            width: min(100vw, 133.3333vh) !important;
            height: min(100vh, 75vw) !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            z-index: 2147483647;
          }
          .sw-fullscreen-canvas {
            width: 100% !important;
            height: 100% !important;
          }
        `}</style>

        <Breadcrumb />

        <div className="sw-page-header">
          <span className="sw-page-badge">Mouse &amp; Keyboard Speed Test</span>
          <h1 className="sw-page-title">SPACE WAVES</h1>
        </div>

        <div
          ref={gameContainerRef}
          className={
            isFullscreen
              ? 'sw-fullscreen-container relative overflow-hidden flex items-center justify-center rounded-lg border-4 border-cyan-500/30 shadow-[0_0_60px_rgba(34,211,238,0.25)] bg-slate-950'
              : 'relative rounded-lg overflow-hidden border-4 border-cyan-500/30 shadow-[0_0_60px_rgba(34,211,238,0.25)] w-full max-w-[800px]'
          }
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className={
              isFullscreen
                ? 'sw-fullscreen-canvas block bg-slate-950 cursor-crosshair touch-none'
                : 'block bg-slate-950 cursor-crosshair touch-none w-full max-w-full h-auto aspect-[4/3]'
            }
          />

          {/* HUD */}
          <div className="absolute top-3 left-3 right-16 flex justify-between pointer-events-none z-10">
            <div className="sw-hud-box">
              <div className="sw-hud-label">ATTEMPTS</div>
              <div className="sw-hud-value">{attempts}</div>
            </div>
            <div className="sw-hud-box">
              <div className="sw-hud-label">PROGRESS</div>
              <div className="sw-hud-value">{progress.toFixed(0)}%</div>
            </div>
          </div>

          {gameState === 'PLAYING' && (
            <button
              onClick={(e) => { e.stopPropagation(); togglePause(); }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="sw-btn-pause absolute top-3 right-3 z-20"
              aria-label="Pause"
            >
              <Pause size={16} />
            </button>
          )}

          {/* Fullscreen + Mute controls */}
          <div className="absolute bottom-3 right-3 flex gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
              className="sw-btn-pause"
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="sw-btn-pause"
            >
              {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            </button>
          </div>

          {gameState === 'START' && (
            <div className="sw-overlay">
              <h2 className="sw-overlay-title">SPACE WAVES</h2>
              <p className="sw-overlay-sub" style={{ lineHeight: 1.7 }}>
                Hold Space or Click to go UP<br />
                Release to go DOWN
              </p>
              <button className="sw-btn-primary" onClick={() => { playClickSound(); startGame(); }}>
                <Play fill="currentColor" size={22} />
                PLAY NOW
              </button>
            </div>
          )}

          {gameState === 'COUNTDOWN' && countdownText && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                key={countdownText}
                className={`countdown-pop font-black drop-shadow-[0_0_25px_rgba(34,211,238,0.7)] ${
                  countdownText === 'GO!' ? 'text-8xl text-cyan-300' : 'text-9xl text-white'
                }`}
              >
                {countdownText}
              </div>
            </div>
          )}

          {gameState === 'PAUSED' && (
            <div className="sw-overlay">
              <h2 className="sw-overlay-title">PAUSED</h2>
              <p className="sw-overlay-sub" style={{ marginBottom: '32px', fontSize: '0.85rem' }}>
                Progress: {progress.toFixed(1)}%
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button className="sw-btn-primary" onClick={resumeGame}>
                  <Play fill="currentColor" size={20} />
                  RESUME
                </button>
                <button className="sw-btn-outline" onClick={exitToMenu}>
                  <LogOut size={20} />
                  EXIT
                </button>
              </div>
              <p className="sw-overlay-hint">Press Esc or P to resume</p>
            </div>
          )}

          {gameState === 'GAMEOVER' && (
            <div className="sw-overlay">
              <h2 className="sw-overlay-title">CRASHED!</h2>
              <p className="sw-overlay-sub">Progress: {progress.toFixed(1)}%</p>
              <button onClick={() => { playClickSound(); startGame(); }} className="sw-btn-primary">
                <RotateCcw size={22} />
                TRY AGAIN
              </button>
              <p className="sw-overlay-hint">Press Space to restart</p>
            </div>
          )}

          {gameState === 'VICTORY' && (
            <div className="sw-overlay">
              <h2 className="sw-overlay-title">LEVEL CLEARED!</h2>
              <p className="sw-overlay-sub">Attempts: {attempts}</p>
              <button
                onClick={() => { playClickSound(); setAttempts(1); startGame(); }}
                className="sw-btn-primary"
              >
                <Play fill="currentColor" size={22} />
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 w-full max-w-[800px]">
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-cyan-500/20">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(34,211,238,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {gameState === 'PLAYING' ? (
          <p className="text-center text-slate-600 text-xs mt-3 mb-8">
            Press <kbd className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">ESC</kbd> to pause
          </p>
        ) : (
          <div className="mb-8" />
        )}

        {/* ── MORE TOOLS GRID ── */}
        <section aria-label="More Tools" className="w-full max-w-[800px] mb-14">
          <h2 className="text-2xl font-black text-white mb-6 text-center">More Tools</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {MORE_TOOLS.map(({ label, href, icon }) => (
              <a key={href} href={href} className="sw-tool-card">
                <div className="sw-tool-icon-box">{icon}</div>
                <span className="text-xs font-bold text-slate-300 text-center leading-tight">{label}</span>
              </a>
            ))}
          </div>
        </section>

        <article className="w-full max-w-[800px] text-slate-400 font-sans border-t border-slate-800 pt-10" style={{ lineHeight: 1.8 }}>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white mb-7">
            Space Waves: The Complete Guide to Flying, Dodging, and Beating Your Best Run
          </h2>

          <p className="mb-7">
            Space Waves is an arcade dodging game built around one simple rule: hold to rise, let go to fall. Your glowing
            arrow flies forward on its own through a glowing tunnel of hazards, and everything else comes down to timing.
            There are no menus to memorize and no complicated combos, just a single control that turns into a genuine test
            of reflexes and rhythm the longer your run goes on.
          </p>

          <div className="sw-callout">
            <h3 className="flex items-center gap-2 text-white text-lg font-extrabold mt-0 mb-2">
              <MousePointer2 size={19} className="text-cyan-300" />
              The Ultimate Mouse &amp; Keyboard Check
            </h3>
            <p className="text-slate-400 m-0 leading-relaxed">
              Just picked up a new mouse or keyboard? Space Waves doubles as a quick responsiveness check. Since your
              arrow reacts the instant you hold or release, any input lag or missed presses show up immediately as a
              mistimed climb or an unexpected crash — a fast, practical way to feel out new gear before a real gaming
              session.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">How to Play Space Waves</h2>
            <p className="mb-7">
              Press Play, and after a short countdown your arrow appears in the middle of the screen and starts moving
              forward automatically. Hold Space or hold down your mouse button to climb, and release to glide back down.
              On a touchscreen, press and hold anywhere on the game area to do the same thing. There's no separate jump or
              dash button, so every decision you make comes down to when you press and when you let go.
            </p>
            <p>
              Because gliding only takes you down and holding only takes you up, it helps to think a few beats ahead rather
              than reacting the instant an obstacle appears. The arrow takes a moment to change direction, so starting your
              climb or your release slightly before you need it usually lines you up more cleanly than waiting until the
              last second.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Understanding the Obstacles</h2>
            <p className="mb-7">
              Every run through Space Waves mixes four kinds of hazards, and recognizing each one at a glance makes a huge
              difference to how far you get:
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Narrow Gaps</h3>
            <p className="mb-7">
              Two glowing cyan walls with a single opening between them. Line your arrow up with the gap early and hold
              steady through the middle.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Floating Block Pairs</h3>
            <p className="mb-7">
              A pair of solid blocks staggered at different heights. These usually call for a quick climb, then a quick
              release to slot between them.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Tunnel Sections</h3>
            <p className="mb-7">
              Long stretches where the ceiling and floor squeeze together around a narrow channel. Small, controlled taps
              work better here than big swings up or down.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Spinning Spiked Hazards</h3>
            <p>
              Rotating shapes with a bright red core that sit in place rather than move toward you. Treat them like a
              stationary obstacle and steer wide rather than trying to time a pass through the center. Because the course
              is generated fresh for every run, you'll never see the exact same sequence twice, so reading each hazard as
              it appears matters more than memorizing a set path.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Tracking Your Progress and Attempts</h2>
            <p className="mb-7">
              The progress bar and percentage at the top of the screen show exactly how far your current run has traveled,
              from 0% at the start to 100% when you cross the finish line. Every time you crash, that percentage freezes so
              you can see precisely where the run ended, and your attempts counter ticks up by one, giving you a clear
              record of how many tries a level actually took.
            </p>
            <p>
              Clearing a run resets the attempts counter back to one, so each fresh clear reflects a clean count for that
              particular pass through the course.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Pausing, Fullscreen, and Sound</h2>
            <p className="mb-7">
              Press Escape or P, or tap the pause icon in the top corner of the game window, to freeze a run at any point.
              From the pause screen you can resume exactly where you left off or exit back to the start screen if you want
              a clean restart.
            </p>
            <p>
              Use the fullscreen icon in the bottom corner of the game window for a larger, distraction-free play area, and
              the speaker icon right next to it to mute the climb, crash, and countdown sounds whenever you'd rather play
              in silence.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Tips and Tricks for Longer Runs</h2>
            <ol className="list-decimal list-inside mb-0 space-y-3">
              <li><strong className="text-white">Tap, don't hold, through tight spaces</strong> — Short, deliberate presses give you finer control than long holds, especially through tunnel sections and back-to-back gaps.</li>
              <li><strong className="text-white">Give spinning hazards a wide berth</strong> — Their hitbox sits close to the glowing core, so steering around the whole shape rather than skimming past the tips is the safer habit.</li>
              <li><strong className="text-white">Start your move early</strong> — The arrow needs a beat to change direction, so begin adjusting your height just before an obstacle arrives instead of right as you reach it.</li>
              <li><strong className="text-white">Use the flap sound as a rhythm cue</strong> — A short tone plays every time you start a climb, which can help you build a steady tapping rhythm without staring only at the arrow.</li>
              <li><strong className="text-white">Replay right after a crash</strong> — Restarting immediately while the layout of that section is still fresh in your memory helps you build muscle memory faster than spacing attempts far apart.</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Pro Tips by Obstacle Type</h2>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Clearing Back-to-Back Gaps</h3>
            <p className="mb-7">
              When two gap sections appear close together, resist the urge to climb hard for the first one. A shallow,
              controlled climb keeps you closer to the center of the screen, giving you room to adjust either up or down
              for the second gap without over-correcting.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Surviving Long Tunnels</h3>
            <p className="mb-7">
              Long tunnel sections punish big movements. Instead of full holds and full releases, try short taps that
              nudge your altitude just enough to stay centered in the channel, saving your bigger movements for the gaps
              and blocks that follow.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Building Endurance for Long Runs</h3>
            <p>
              The later stretches of a run pack obstacles closer together, so staying relaxed matters as much as staying
              accurate. Keep your hand loose between inputs rather than gripping the mouse or hovering tensely over the
              spacebar — a relaxed hand reacts faster over a long run than a tired, clenched one.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Beginner's Guide to Space Waves</h2>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Your First Run</h3>
            <p className="mb-7">
              On your very first attempt, resist the urge to hold Space or your mouse button down constantly. Instead, get a
              feel for how quickly the arrow responds by tapping in short bursts while the course is still open and empty.
              This gives you a sense of how much altitude a single tap adds before you hit the first real obstacle.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Understanding the HUD</h3>
            <p className="mb-7">
              The two boxes at the top of the screen are your main reference points during a run. Attempts tells you how
              many tries this level has taken so far, and Progress shows exactly how far along the course you currently
              are. Glancing at Progress occasionally can help you gauge how much of the run is left and whether it's worth
              pushing for a personal best or playing it safe.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Don't Panic When You Crash</h3>
            <p>
              Crashing resets the run immediately, but every crash tells you something useful about the pattern you just
              hit. Rather than mashing Space to restart out of frustration, take a half-second to notice what killed the
              run — a late climb, an early release, or misjudging a spinning hazard's hitbox — before jumping back in.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Advanced Strategy &amp; Techniques</h2>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Pre-Positioning Before Hazard Clusters</h3>
            <p className="mb-7">
              Experienced players start adjusting their altitude a fraction of a second before a cluster of obstacles
              actually appears on screen, using the edge of the visible play area as an early warning zone. By the time a
              gap or spinning hazard is fully on screen, your arrow is already roughly where it needs to be.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Reading the Rhythm of the Course</h3>
            <p className="mb-7">
              Because gaps, block pairs, tunnels, and spinning hazards are mixed together in a random order, it helps to
              treat each new obstacle as its own short decision rather than trying to memorize a fixed sequence. Focus on
              recognizing the shape of what's ahead quickly rather than predicting exactly what comes next.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Managing Momentum Through Chains</h3>
            <p>
              When obstacles are spaced closely together, your altitude at the end of one obstacle becomes your starting
              point for the next. Aim to exit each gap or tunnel near the vertical center of the play area whenever
              possible, since that gives you the most room to correct in either direction for whatever comes right after.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Space Waves vs Traditional Reflex Games</h2>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">The Problem with Static Reaction Testers</h3>
            <p className="mb-7">
              Simple reaction-time testers measure how quickly you respond to a single isolated signal and hand you a
              number. That's a fine baseline, but it doesn't capture how your reflexes hold up when you also have to track
              a moving obstacle course, plan a route, and manage momentum at the same time.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Why Consequence-Driven Practice Works Better</h3>
            <p className="mb-7">
              In Space Waves, a mistimed input doesn't just register a slower reaction — it ends the run. That real
              consequence mirrors the pressure of actual gaming scenarios far more closely than a static test, which is
              part of why practicing timing here tends to translate more directly into other reflex-heavy games.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Building Automaticity Through Repetition</h3>
            <p>
              The more runs you play, the less conscious effort it takes to judge when to climb or release. Once that
              judgment becomes automatic, your attention is freed up to focus on reading the course further ahead instead
              of the immediate obstacle in front of you.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">How Space Waves Helps With Other Games</h2>
            <p className="mb-7">
              The single-input, precise-timing skillset Space Waves builds carries over to a wide range of other genres,
              particularly ones built around a similar hold-and-release or tap-based rhythm:
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Auto-Runner and Flappy-Style Games</h3>
            <p className="mb-7">
              Any game where a character moves forward automatically and a single tap or hold controls vertical movement
              shares Space Waves' core mechanic almost exactly. Time spent here builds the same tap discipline needed to
              thread narrow gaps in those games without overcorrecting.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Rhythm and Precision Platformers</h3>
            <p className="mb-7">
              Games that punish even small timing errors reward the same "commit early, adjust smoothly" habit that
              Space Waves trains. Practicing here helps build a steadier internal sense of timing that transfers well to
              precision platformers with tight jump windows.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Fast-Paced Shooters and Dodging Mechanics</h3>
            <p>
              Games with dodge-roll windows or hazard patterns that must be read and reacted to quickly benefit from the
              same pattern-recognition skill Space Waves builds — spotting the shape of a threat and reacting before it's
              fully on screen rather than after.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Daily Training Routine &amp; Practice Plan</h2>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">The Warm-Up Routine</h3>
            <p className="mb-7">
              Before a longer gaming session, run 3 to 5 quick attempts in Space Waves. It's a fast way to wake up your
              timing and get your hand used to short, controlled taps rather than jumping straight into a game with cold
              reflexes.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Weekly Progression Plan</h3>
            <p className="mb-7">
              Give your practice some structure instead of playing at random. Alternate between sessions focused purely on
              survival and control, and sessions where you deliberately push for a new best progress percentage, so you're
              training both consistency and risk-taking.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Tracking Progress</h3>
            <p>
              Keep a rough mental note of your best progress percentage and your average number of attempts before
              clearing a run. Small, steady improvements in either number over a couple of weeks are a good sign your
              timing is genuinely getting sharper rather than just having a lucky run.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Best Mouse &amp; Keyboard Settings for Precise Timing</h2>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Keyboard Considerations</h3>
            <p className="mb-7">
              Since Space is the primary control, a keyboard with a light, linear switch and minimal input lag makes it
              easier to feel exactly when your press registers. Heavier tactile or clicky switches can introduce a slight
              delay in your perception of when the input actually landed.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Mouse Considerations</h3>
            <p>
              If you prefer controlling the arrow with your mouse button, a light main-button spring and a reasonably high
              polling rate help ensure your hold and release are registered as close to instantly as possible, which
              matters a lot in a game built entirely around split-second timing.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">How to Improve Your Reaction Time</h2>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Visual Processing Speed</h3>
            <p className="mb-7">
              Since the course scrolls toward you, training yourself to look slightly ahead of the arrow rather than
              directly at it gives your visual system more time to process upcoming shapes. This forward-looking habit is
              one of the most transferable skills Space Waves builds.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">The Hardware Advantage</h3>
            <p className="mb-7">
              A higher refresh-rate monitor and a low-latency input device reduce the delay between an obstacle appearing
              and you actually seeing it clearly enough to react. Removing hardware lag means the only real limiting factor
              left is your own reflexes.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Cognitive Warm-Up Routines</h3>
            <p>
              A brief warm-up primes your nervous system the same way physical stretching warms up a muscle. A few short
              runs of Space Waves before a longer session can noticeably sharpen your first few minutes of play compared to
              starting cold.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Common Mistakes &amp; How to Fix Them</h2>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Mistake: Overcorrecting</h3>
            <p className="mb-7">
              Holding Space for too long after realizing you're too low, or releasing for too long after realizing you're
              too high, tends to send the arrow swinging past where it needs to be. Short, deliberate taps almost always
              give you more control than a big correction.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Mistake: Staring Only at the Arrow</h3>
            <p className="mb-7">
              Watching your own arrow instead of the obstacles ahead means you're always reacting a beat late. Try shifting
              your focus slightly ahead of the arrow so you see each obstacle as early as possible.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Mistake: Not Using Pause Strategically</h3>
            <p>
              Press Escape or P mid-run if you need a moment to reset your focus — it's easy to forget this option exists
              in the middle of a tense run. A short pause to steady your hand can be the difference between a clean finish
              and an avoidable crash.
            </p>
          </section>

          <div className="sw-callout">
            <h2 className="flex items-center gap-2 text-white text-xl font-extrabold mt-0 mb-3">
              Health &amp; Hand Safety
            </h2>

            <h3 className="text-cyan-300 text-base font-extrabold mb-1">Recognizing Strain</h3>
            <p className="text-slate-400 mb-4 leading-relaxed">
              Long, intense sessions of rapid tapping can leave your fingers or wrist feeling tired or achy. Treat that as
              a signal to slow down rather than something to push through, especially if the feeling lingers after you stop
              playing.
            </p>

            <h3 className="text-cyan-300 text-base font-extrabold mb-1">Take Regular Breaks</h3>
            <p className="text-slate-400 mb-4 leading-relaxed">
              Step away for a minute or two every fifteen to twenty minutes of continuous play. A short break is enough to
              let your hand recover without breaking your overall practice rhythm for the session.
            </p>

            <h3 className="text-cyan-300 text-base font-extrabold mb-1">Simple Stretches</h3>
            <p className="text-slate-400 m-0 leading-relaxed">
              Gently flexing and extending your wrist, spreading your fingers wide, and rolling your wrist in slow circles
              before and after a session can help keep your hand feeling loose rather than tense.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Pro Player Tips &amp; Situational Strategies</h2>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Handling a Gap Right After a Tunnel</h3>
            <p className="mb-7">
              Coming out of a tunnel, your altitude is already fairly constrained, so a gap immediately afterward usually
              only needs a small nudge rather than a full climb or release. Resist the instinct to make a big movement just
              because the tunnel felt tense.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Dealing With Two Spinning Hazards Close Together</h3>
            <p className="mb-7">
              When two spinning hazards appear near each other, plan a single smooth path that threads between both rather
              than reacting to the first one and scrambling for the second. Slowing your decision-making down slightly here
              usually beats a rushed reaction.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Recovering From a Late Reaction</h3>
            <p>
              If you notice you're about to clip an obstacle, a sharp, decisive tap in the right direction gives you a
              better chance than hesitating. Half-committing to a correction is often worse than committing fully and
              adjusting again right after.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Space Waves for Testing New Gaming Gear</h2>
            <p className="mb-7">
              Beyond being a fun dodging game, Space Waves is a genuinely useful way to feel out a new keyboard or mouse.
              Because the arrow reacts the instant you hold or release, any inconsistency in your new gear shows up almost
              immediately as a mistimed climb or an unexpected crash.
            </p>
            <p>
              If you're testing a new mechanical keyboard, focus on whether every hold and release feels equally
              responsive. If you're testing a new mouse, pay attention to whether the button feels consistent under rapid,
              repeated taps — any hint of double-registering or missed presses will quickly become obvious here.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Frequently Overlooked Details</h2>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">The Hitbox Is Smaller Than It Looks</h3>
            <p className="mb-7">
              Your arrow's actual collision area is slightly smaller than the visible triangle, which is forgiving in most
              cases but not an excuse to cut things too close on purpose — the very edge of an obstacle can still end a
              run.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Every Run Is Freshly Generated</h3>
            <p>
              Because the layout of gaps, blocks, tunnels, and spinning hazards is randomized each time, memorizing a
              specific run won't help on the next attempt. What actually improves over time is your general read on each
              obstacle type, not the memory of a particular sequence.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-black text-white border-b border-slate-800 pb-4 mb-8">
              Situational FAQs &amp; Quick Answers
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Why does my arrow feel sluggish to respond?</h3>
                <p className="text-slate-400">
                  This is usually a sign of holding or releasing a moment too late rather than an actual input delay. Try
                  reacting slightly earlier to obstacles and see if the feeling of sluggishness goes away.
                </p>
              </div>
              <div>
                <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Is it better to play with the mouse or the keyboard?</h3>
                <p className="text-slate-400">
                  Both control the same climb-and-release mechanic identically, so it mostly comes down to personal
                  comfort. Some players find short spacebar taps easier to control precisely, while others prefer the feel
                  of a mouse button.
                </p>
              </div>
              <div>
                <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Why do my early attempts feel harder than later ones on the same session?</h3>
                <p className="text-slate-400">
                  Your timing sense tends to sharpen after a few runs as your hand adjusts to the pace of the game, which
                  is part of why a short warm-up before a serious attempt tends to help.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">The Science Behind Hold-and-Release Timing</h2>
            <p className="mb-7">
              Underneath the simple one-button control, Space Waves is quietly exercising a skill researchers call motor
              timing: the ability to start and stop a movement at a precise moment in response to something you see. Every
              time you decide to hold or release a beat before an obstacle actually arrives, you're relying on a prediction
              your brain makes about where that obstacle will be a fraction of a second in the future, not just a reaction
              to where it is right now.
            </p>
            <p className="mb-7">
              This predictive element is what separates a game like Space Waves from a pure reflex test. A reflex test asks
              "how fast can you respond to something that already happened." Space Waves asks "how well can you anticipate
              something that's about to happen," which draws more on <ResearchLink href="https://en.wikipedia.org/wiki/Hand%E2%80%93eye_coordination">hand-eye coordination</ResearchLink> and
              visual tracking than on raw nerve conduction speed. That's a big part of why players often feel their runs
              getting smoother over a session even when a formal reaction-time score barely changes: the improvement is
              happening in prediction and timing, not in the speed of the nerve signal itself.
            </p>
            <p>
              It also explains why rushing rarely helps. Slamming the control the instant you see a wall tends to produce
              a late, oversized correction, because your brain hasn't finished predicting where the gap will be relative to
              your current position. Players who do well tend to look slightly ahead of the arrow, giving themselves a
              longer window to judge the timing before committing to a hold or a release.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Where This Style of Game Came From</h2>
            <p className="mb-7">
              The "hold to rise, release to fall" control scheme that Space Waves uses has a long history in browser and
              mobile games. It traces back to simple auto-scrolling arcade experiments where developers wanted a game that
              needed only one input, so it would work identically on a keyboard, a mouse, or a single finger on a
              touchscreen. That constraint turned out to be a strength rather than a limitation: with only one thing to
              press, every ounce of challenge has to come from the timing and the shape of the course itself, not from
              memorizing a complicated set of controls.
            </p>
            <p className="mb-7">
              Over time, this format split into a few recognizable families. Some versions emphasize tight vertical gaps and
              punishing precision. Others, like Space Waves, mix in floating blocks, squeezed tunnels, and rotating hazards
              so that no two stretches of the course ask for exactly the same kind of input. The random level generation in
              Space Waves is a direct descendant of that design goal: by never repeating the exact same layout, the game
              keeps testing your general sense of timing rather than rewarding memorization of one specific sequence of
              moves.
            </p>
            <p>
              What's stayed constant across all of these games is the core appeal: a single control that's trivially easy
              to explain in one sentence, paired with a course that gets progressively less forgiving. That combination is
              part of why the genre has remained popular in browsers for years, long after more complex control schemes
              have come and gone.
            </p>
            <p>
              It's a genre that also travels well across generations of hardware. A game built around a single held input
              and simple vector shapes runs comfortably on almost any device with a browser, from an older laptop to a
              budget phone, which is part of why this style has stuck around even as more graphically demanding genres
              have come to dominate app stores. The low barrier to entry, both in terms of hardware and in terms of
              learning the controls, is arguably as important to its lasting popularity as the timing challenge itself.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Playing on Different Devices</h2>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Desktop and Laptop Trackpads</h3>
            <p className="mb-7">
              If you're on a laptop without an external mouse, holding down the trackpad button works the same way as a
              regular mouse click, but it can feel less precise because trackpad buttons often have more travel and a
              softer press. If you notice your taps feel mushy or delayed, switching to the spacebar usually gives you a
              more consistent feel, since keyboard presses tend to register with less physical give.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">Phones and Tablets</h3>
            <p className="mb-7">
              On a touchscreen, your thumb or finger is doing the same job the spacebar does on desktop: press and hold to
              climb, lift off to fall. Because a finger covers more of the screen than a mouse cursor, it can help to rest
              your hand along the bottom edge of the device rather than hovering over the middle of the play area, so your
              own hand doesn't block your view of the upcoming course.
            </p>

            <h3 className="text-cyan-300 text-lg font-extrabold mb-2">External Controllers and Alternative Inputs</h3>
            <p>
              Space Waves doesn't require any special hardware, but if you use an adaptive input device or switch access
              tool that can simulate a held keypress, it should work the same way a held spacebar does, since the game only
              ever needs to know whether the "climb" input is currently down or up. There's no timing window shorter than a
              single frame that the game depends on, so slower or assistive input methods can still complete a full run
              with practice.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Reading a Course Like a Pattern Language</h2>
            <p className="mb-7">
              Once you've played enough runs, it helps to stop thinking of each obstacle as a brand-new puzzle and start
              thinking of the course as a small vocabulary of shapes that keep recombining. There are really only a handful
              of "words" in that vocabulary: a narrow gap, a pair of staggered blocks, a squeezed tunnel, and a spinning
              hazard. Everything you see on a run is one of those four shapes, placed at a different height, spaced a
              different distance apart, and mixed with the others in a different order.
            </p>
            <p className="mb-7">
              Treating the course this way changes how you play. Instead of reacting to every pixel of a new shape sliding
              into view, your eyes start to recognize "that's a gap" or "that's a tunnel" almost instantly, the same way an
              experienced reader recognizes whole words instead of sounding out individual letters. That recognition speed
              is exactly what separates a player who's played for ten minutes from one who's played for ten hours: both can
              see the obstacle, but only one of them recognizes it fast enough to already be adjusting before it's fully on
              screen.
            </p>
            <p>
              This is also why replaying shortly after a crash is such an effective way to practice. The specific layout
              won't repeat, but the shape that killed your run will show up again in some form soon, and your brain is
              still primed from just having seen a version of it. That's a much more efficient way to build recognition
              than spacing attempts far apart and starting cold each time.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Setting Personal Goals Beyond Just Finishing</h2>
            <p className="mb-7">
              Reaching 100% and clearing the course is the obvious first goal, but once you've done that a few times, it
              stops being much of a challenge on its own. A few alternate goals tend to keep the game interesting well past
              that point. One is chasing a lower attempts count: instead of playing until you eventually clear a run, treat
              each session as a challenge to clear it in as few tries as possible, which rewards consistency over lucky
              runs.
            </p>
            <p className="mb-7">
              Another is a no-tunnel or no-block challenge, where you mentally note which obstacle type gives you the most
              trouble and specifically try to notice how your handling of that shape improves from one attempt to the
              next. Because the course is regenerated every run, you'll get plenty of fresh chances at whichever obstacle
              you're targeting without needing to search for it.
            </p>
            <p>
              A third option is a calm-hands challenge: try to complete a full run using only short, controlled taps, never
              holding the control down for more than a few frames at a time. This is harder than it sounds through tunnel
              sections, and it's a genuinely useful drill for building the kind of fine input control that carries over to
              other timing-based games.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">What Makes a "Good" Run Feel Different</h2>
            <p className="mb-7">
              Ask any regular player what a good run feels like and you'll usually hear the same description: it feels
              quiet. Not literally silent, but mentally quiet — fewer moments of surprise, fewer sharp corrections, and a
              steadier rhythm of small taps rather than a string of near-misses. That feeling isn't an accident of luck; it's
              a direct byproduct of the arrow spending more time near the vertical center of the play area, since that's the
              position that leaves the most room to adjust in either direction no matter what comes next.
            </p>
            <p className="mb-7">
              A rough run, by contrast, tends to have a very different shape even when it doesn't end in a crash. You'll
              notice the arrow riding close to the ceiling or floor for long stretches, which works fine until a hazard
              happens to appear on that same side, at which point there's very little room left to correct. Paying
              attention to where your arrow tends to drift during calm stretches of a run is one of the more useful things
              you can do between attempts, since it points directly at the habit that's most likely to cause your next
              crash.
            </p>
            <p>
              Over enough attempts, most players naturally start correcting this without consciously trying to, simply
              because staying centered keeps working better than the alternative. That's a good sign your instincts are
              catching up to the game's actual demands rather than just memorizing a handful of specific obstacles.
            </p>
            <p>
              It's also worth remembering that a "good" run doesn't have to mean a perfect one. Clipping the edge of a wall
              early in a run and still recovering to finish is often more useful practice than a flawless run where you
              never had to correct anything at all, simply because recovering from a mistake is exactly the skill that
              separates a solid player from a lucky one. Treat the occasional close call as information rather than a
              failure, and the parts of your game that need the most work tend to become obvious fairly quickly.
            </p>
          </section>


          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Accessibility Notes</h2>
            <p className="mb-7">
              Because Space Waves only needs a single input held down or released, it tends to be easier to adapt to
              different needs than games with several simultaneous controls. Players who find rapid tapping tiring can lean
              on longer, more deliberate holds through open stretches of the course and save short taps for the tightest
              sections, rather than tapping constantly throughout an entire run.
            </p>
            <p>
              If bright, high-contrast visuals are uncomfortable, using the mute button and taking more frequent breaks
              between attempts can make longer practice sessions more comfortable, since the game doesn't require sound to
              play and there's no penalty for pausing as often as you like.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Clicking Speed and Timing Games Like Space Waves</h2>
            <p>
              Space Waves rewards timing and rhythm far more than raw speed, but the finger control it builds overlaps with
              a broader category of reflex and timing games, including <ResearchLink href="https://en.wikipedia.org/wiki/Mental_chronometry">reaction time research</ResearchLink> and
              CPS (clicks per second) tests. If you enjoy the precise, repeated taps that Space Waves asks for, a quick CPS
              test is a fun way to see how fast and consistent your clicking rhythm has become, and warming up on one before
              a session can loosen up your hand for tighter runs.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-800 pb-3 mb-6">Final Thoughts</h2>
            <p>
              Space Waves keeps its rules simple on purpose: hold to rise, release to fall, and everything else is on you.
              The real challenge comes from reading gaps, blocks, tunnels, and spinning hazards fast enough to react, and
              building the kind of timing that turns a short first attempt into a run that makes it all the way to the
              finish line. Play a few rounds, watch your attempts and progress climb, and see how far your best run can go.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-black text-white border-b border-slate-800 pb-4 mb-8 flex items-center gap-2.5">
              <HelpCircle size={24} className="text-cyan-300" />
              Frequently Asked Questions
            </h2>
            <FaqAccordion />
          </section>

          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-600 text-sm leading-relaxed m-0">
              Space Waves is a free browser game. No download required. Works on Chrome, Firefox, Edge, and Safari.
            </p>
          </div>
        </article>
      </div>
    </>
  );
}
