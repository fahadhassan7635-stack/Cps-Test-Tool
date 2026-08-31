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
const SITE_URL = 'https://fixedaim.com/space-waves';

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
  { label: '3D Aim Trainer', href: '/3d-aim-trainer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/><circle cx="12" cy="12" r="8" opacity=".4"/></svg> },
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
  { q: 'Can I pause the game mid-run?', a: 'Yes. Press Escape or P, or tap the pause icon in the corner of the game window, to freeze the run at any point. From the pause screen you can resume exactly where you left off or exit back to the start screen.' }
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
  const progressRef = useRef(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLDivElement>(null);
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
      gameContainerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
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
    progressRef.current = 0;
    setProgress(0);
    if (progressBarRef.current) progressBarRef.current.style.width = '0%';
    if (progressTextRef.current) progressTextRef.current.innerText = '0%';
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
    setProgress(progressRef.current);
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

      const newProgress = Math.min(100, Math.max(0, (player.x / LEVEL_LENGTH) * 100));
      progressRef.current = newProgress;
      if (progressBarRef.current) progressBarRef.current.style.width = `${newProgress}%`;
      if (progressTextRef.current) progressTextRef.current.innerText = `${newProgress.toFixed(0)}%`;

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
        setProgress(progressRef.current);
        setGameState('GAMEOVER');
        gameStateRef.current = 'GAMEOVER';
      }

      if (player.x >= LEVEL_LENGTH) {
        playBeep(660, 150, 'triangle');
        setProgress(100);
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

      starsRef.current.forEach(star => {
        const starX = (star.x - cameraX * star.speed) % CANVAS_WIDTH;
        const drawX = starX < 0 ? starX + CANVAS_WIDTH : starX;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.speed})`;
        ctx.fillRect(drawX, star.y, star.size, star.size);
      });

      ctx.save();
      ctx.translate(-cameraX, 0);

      ctx.strokeStyle = '#0d1522';
      ctx.lineWidth = 1;
      const gridOffset = cameraX % 100;
      ctx.beginPath();
      for (let i = -100; i < CANVAS_WIDTH + 100; i += 100) {
        ctx.moveTo(cameraX + i - gridOffset, 0);
        ctx.lineTo(cameraX + i - gridOffset, CANVAS_HEIGHT);
      }
      for (let i = 0; i < CANVAS_HEIGHT; i += 100) {
        ctx.moveTo(cameraX, i);
        ctx.lineTo(cameraX + CANVAS_WIDTH, i);
      }
      ctx.stroke();

      obstaclesRef.current.forEach(obs => {
        if (obs.x + obs.w > cameraX && obs.x < cameraX + CANVAS_WIDTH) {
          ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
          ctx.fillRect(obs.x - 6, obs.y - 6, obs.w + 12, obs.h + 12);
          ctx.fillStyle = '#0e7490';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.strokeStyle = '#67e8f9';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
          ctx.strokeStyle = 'rgba(103, 232, 249, 0.35)';
          ctx.strokeRect(obs.x + 4, obs.y + 4, obs.w - 8, obs.h - 8);
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

          ctx.fillStyle = '#0a0a12';
          ctx.fill();
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
              <div className="sw-hud-value" ref={progressTextRef}>{progress.toFixed(0)}%</div>
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
              ref={progressBarRef}
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

        <article style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem' }}>
      <section style={{ color: 'var(--text-secondary)', fontSize: '0.91rem', lineHeight: '1.78' }}>
        <h2 style={{ color: 'var(--neon-green, #00ff88)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0.5rem' }}>
          How to Play Space Waves
        </h2>
        <p style={{ marginBottom: '1.25rem', color: '#9ca3af' }}>
          Space Waves is a rhythm-based geometry dodging game that tests your click timing and obstacle avoidance skills. Navigate your ship through increasingly difficult waves of barriers by clicking to change direction. This game is perfect for improving your click timing, patience, and visual processing speed under pressure.
        </p>
      </section>
    </article>
      </div>
    </>
  );
}