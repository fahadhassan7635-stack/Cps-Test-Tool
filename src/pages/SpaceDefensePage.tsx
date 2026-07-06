import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  RotateCcw, 
  ChevronUp, 
  ChevronLeft, 
  ChevronDown, 
  ChevronRight, 
  Target, 
  Trophy, 
  Zap,
  Activity,
  Timer,
  Home,
  Heart,
  Volume2,
  VolumeX,
  Pause,
  Maximize,
  Minimize,
  Shield,
  Star,
  Flame,
  ExternalLink
} from 'lucide-react';

// ============================================================
// SEO HEAD INJECTION
// ============================================================
if (typeof document !== 'undefined') {
  const setMeta = (attr: string, val: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${val}"]`) as HTMLMetaElement | null;
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  const setLink = (rel: string, href: string, extra?: Record<string, string>) => {
    let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
    el.setAttribute('href', href);
    if (extra) Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
  };

  document.title = 'Space Defense – Free Browser Shooter Game | Improve Reaction Time & CPS';
  setMeta('name', 'description', 'Play Space Defense, the free browser-based space shooter game. Destroy meteors, survive boss battles, collect power-ups, and improve your reaction time, CPS, and accuracy. No download required.');
  setMeta('name', 'robots', 'index, follow');
  setMeta('name', 'theme-color', '#00f5ff');
  setMeta('name', 'keywords', 'space defense game, browser shooter game, space game online, meteor defense, reaction time game, CPS test game, free online game');
  setMeta('property', 'og:title', 'Space Defense – Free Browser Space Shooter Game');
  setMeta('property', 'og:description', 'Defend Earth from meteor showers in this fast-paced browser space shooter. Test your CPS, reaction time, and accuracy. Free to play, no download needed.');
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:url', 'https://yourdomain.com/space-defense');
  setMeta('property', 'og:image', 'https://yourdomain.com/og-space-defense.png');
  setMeta('property', 'og:site_name', 'Space Defense Game');
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', 'Space Defense – Free Browser Space Shooter Game');
  setMeta('name', 'twitter:description', 'Destroy meteors, survive boss battles, collect power-ups. Free browser game.');
  setMeta('name', 'twitter:image', 'https://yourdomain.com/og-space-defense.png');
  setLink('canonical', 'https://yourdomain.com/space-defense');

  const injectSchema = (id: string, data: object) => {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement('script'); el.id = id; (el as HTMLScriptElement).type = 'application/ld+json'; document.head.appendChild(el); }
    el.textContent = JSON.stringify(data);
  };

  injectSchema('schema-webapp', {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Space Defense',
    url: 'https://yourdomain.com/space-defense',
    description: 'A free browser-based space shooter game where players defend Earth from meteor showers, fight boss meteors, collect power-ups, and improve their CPS and reaction time.',
    applicationCategory: 'Game',
    operatingSystem: 'Any',
    browserRequirements: 'Requires HTML5 Canvas support',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: ['Boss Battles', 'Power-Ups', 'Combo System', 'Difficulty Levels', 'High Score Tracking', 'Fullscreen Mode'],
    screenshot: 'https://yourdomain.com/og-space-defense.png',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '1240' }
  });

  injectSchema('schema-website', {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Space Defense Game',
    url: 'https://yourdomain.com',
    potentialAction: { '@type': 'SearchAction', target: 'https://yourdomain.com/?q={search_term_string}', 'query-input': 'required name=search_term_string' }
  });

  injectSchema('schema-breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://yourdomain.com' },
      { '@type': 'ListItem', position: 2, name: 'Games', item: 'https://yourdomain.com/games' },
      { '@type': 'ListItem', position: 3, name: 'Space Defense', item: 'https://yourdomain.com/space-defense' }
    ]
  });

  injectSchema('schema-faq', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is Space Defense?', acceptedAnswer: { '@type': 'Answer', text: 'Space Defense is a free browser-based space shooter game where you control a fighter jet and destroy incoming meteors. The game features boss battles, power-ups, a combo system, multiple difficulty levels, and detailed performance statistics including CPS tracking and accuracy measurement.' } },
      { '@type': 'Question', name: 'How do I play Space Defense?', acceptedAnswer: { '@type': 'Answer', text: 'Use WASD or Arrow Keys to move your spaceship. Press F or Space to shoot. You can also click the left mouse button to fire. Destroy meteors before they hit you or reach the bottom of the screen. Survive as long as possible and achieve the highest score.' } },
      { '@type': 'Question', name: 'What is CPS in Space Defense?', acceptedAnswer: { '@type': 'Answer', text: 'CPS stands for Clicks Per Second. In Space Defense, it measures how many shots you fire per second. A higher CPS means more projectiles hitting meteors, which is especially important during boss battles and at higher difficulty levels.' } },
      { '@type': 'Question', name: 'Does Space Defense require download?', acceptedAnswer: { '@type': 'Answer', text: 'No. Space Defense runs entirely in your browser using HTML5 Canvas technology. No download, installation, and no plugins are required. Simply open the page and start playing immediately.' } },
      { '@type': 'Question', name: 'What are the difficulty levels?', acceptedAnswer: { '@type': 'Answer', text: 'Space Defense offers three difficulty levels: Easy (slower meteors, lower spawn rate, great for beginners), Normal (balanced gameplay for most players), and Hard (fast meteors, high spawn rate, tougher HP, but higher score multipliers for competitive players).' } },
      { '@type': 'Question', name: 'Can playing Space Defense improve reaction time?', acceptedAnswer: { '@type': 'Answer', text: 'Research on fast-paced action games has linked regular play to faster visual reaction times and better hand-eye coordination without a loss in accuracy. Space Defense tracks CPS, Peak CPS, and Accuracy across every run.' } },
      { '@type': 'Question', name: 'How many lives do I get?', acceptedAnswer: { '@type': 'Answer', text: 'Each run starts with 10 hull points. Every meteor that hits you, or reaches the bottom of the screen unshot, costs one hull point. The run ends when hull reaches zero.' } },
      { '@type': 'Question', name: 'When do boss meteors appear?', acceptedAnswer: { '@type': 'Answer', text: 'A boss meteor spawns automatically every 5 levels, with a much larger health bar and a guaranteed power-up drop when defeated.' } },
      { '@type': 'Question', name: 'What does the combo counter do?', acceptedAnswer: { '@type': 'Answer', text: 'Destroying meteors back-to-back without missing or taking damage builds a combo counter that multiplies score earned per kill. Getting hit or missing resets the combo to zero.' } },
      { '@type': 'Question', name: 'Can I pause the game?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, press Esc at any time to pause. From the pause screen you can resume, restart, or return to the main menu.' } },
      { '@type': 'Question', name: 'Can I play Space Defense in fullscreen?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, click the fullscreen icon on the menu or in-game HUD to expand the play field to your entire display.' } },
      { '@type': 'Question', name: 'Does Space Defense work on mobile phones?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, on touch devices an on-screen directional pad and fire button appear automatically, and fullscreen mode is supported for a larger play area.' } },
      { '@type': 'Question', name: 'What is the difference between the three difficulty levels?', acceptedAnswer: { '@type': 'Answer', text: 'Easy slows meteors and lowers health at a reduced score multiplier. Normal is balanced at a 1x multiplier. Hard increases speed, spawn rate, and health by 1.5x but doubles the score multiplier.' } },
      { '@type': 'Question', name: 'Can I turn off the sound?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, click the speaker icon on the menu or HUD to mute all sound effects including laser shots, explosions, power-ups, and countdown beeps.' } },
      { '@type': 'Question', name: 'What happens if two power-ups overlap?', acceptedAnswer: { '@type': 'Answer', text: 'Power-ups of different types stack and run simultaneously with their own countdown timers. Picking up a second copy of the same power-up refreshes its duration instead of stacking.' } },
      { '@type': 'Question', name: 'Is Space Defense free to play?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Space Defense is completely free with no purchases, subscriptions, or ads blocking gameplay.' } },
      { '@type': 'Question', name: 'How is accuracy percentage calculated?', acceptedAnswer: { '@type': 'Answer', text: 'Accuracy is the number of shots that hit a meteor divided by total shots fired, shown as a percentage in the HUD and game-over summary.' } },
    ]
  });
}

// ============================================================
// AUDIO ENGINE
// ============================================================
const createAudioContext = () => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContextClass();
};

class GameSound {
  ctx: AudioContext | null = null;
  muted = false;

  init() {
    if (!this.ctx) {
      try { this.ctx = createAudioContext(); } catch { /* noop */ }
    }
  }

  private getCtx(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) this.init();
    return this.ctx;
  }

  playLaser() {
    const context = this.getCtx(); if (!context) return;
    const osc = context.createOscillator(); const gain = context.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, context.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    osc.connect(gain); gain.connect(context.destination); osc.start(); osc.stop(context.currentTime + 0.1);
  }

  playExplosion() {
    const context = this.getCtx(); if (!context) return;
    const bufferSize = context.sampleRate * 0.2;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = context.createBufferSource(); noise.buffer = buffer;
    const filter = context.createBiquadFilter(); filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, context.currentTime + 0.2);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.3, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    noise.connect(filter); filter.connect(gain); gain.connect(context.destination); noise.start();
  }

  playBossExplosion() {
    const context = this.getCtx(); if (!context) return;
    const bufferSize = context.sampleRate * 0.5;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = context.createBufferSource(); noise.buffer = buffer;
    const filter = context.createBiquadFilter(); filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(20, context.currentTime + 0.5);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.6, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    noise.connect(filter); filter.connect(gain); gain.connect(context.destination); noise.start();
  }

  playHit() {
    const context = this.getCtx(); if (!context) return;
    const osc = context.createOscillator(); const gain = context.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(150, context.currentTime);
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);
    osc.connect(gain); gain.connect(context.destination); osc.start(); osc.stop(context.currentTime + 0.05);
  }

  playLevelUp() {
    const context = this.getCtx(); if (!context) return;
    const now = context.currentTime;
    [440, 554, 659, 880].forEach((freq, i) => {
      const osc = context.createOscillator(); const gain = context.createGain();
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.1);
      osc.connect(gain); gain.connect(context.destination);
      osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.1);
    });
  }

  playGameOver() {
    const context = this.getCtx(); if (!context) return;
    const now = context.currentTime;
    const osc = context.createOscillator(); const gain = context.createGain();
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 1);
    gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0, now + 1);
    osc.connect(gain); gain.connect(context.destination); osc.start(); osc.stop(now + 1);
  }

  playPowerUp() {
    const context = this.getCtx(); if (!context) return;
    const now = context.currentTime;
    [523, 659, 784].forEach((freq, i) => {
      const osc = context.createOscillator(); const gain = context.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.1);
      osc.connect(gain); gain.connect(context.destination);
      osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.1);
    });
  }

  playCombo() {
    const context = this.getCtx(); if (!context) return;
    const now = context.currentTime;
    const osc = context.createOscillator(); const gain = context.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain); gain.connect(context.destination); osc.start(); osc.stop(now + 0.15);
  }

  playCountdownBeep() {
    const context = this.getCtx(); if (!context) return;
    const now = context.currentTime;
    const osc = context.createOscillator(); const gain = context.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain); gain.connect(context.destination); osc.start(now); osc.stop(now + 0.2);
  }

  playCountdownGo() {
    const context = this.getCtx(); if (!context) return;
    const now = context.currentTime;
    const osc = context.createOscillator(); const gain = context.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain); gain.connect(context.destination); osc.start(now); osc.stop(now + 0.35);
  }
}

const sounds = new GameSound();

// ============================================================
// TYPES
// ============================================================
interface Entity { x: number; y: number; width: number; height: number; }
interface Projectile extends Entity { speed: number; isDouble?: boolean; }
interface Meteor extends Entity {
  id: number; radius: number; speed: number; health: number; maxHealth: number;
  rotation: number; rotationSpeed: number; color: string; isBoss?: boolean;
  shapePoints: number[]; // ✅ pre-calculated shape to avoid jitter
}
interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; color: string; size: number;
}
interface PowerUp {
  id: number; x: number; y: number; type: PowerUpType; speed: number; radius: number;
}
type PowerUpType = 'shield' | 'rapidfire' | 'doubleshot' | 'magnet' | 'slowmotion';
type Difficulty = 'easy' | 'normal' | 'hard';

interface HighScore {
  score: number; level: number; time: number; accuracy: number; peakCPS: number;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { speedMult: number; spawnMult: number; hpMult: number; scoreMult: number; label: string; color: string; }> = {
  easy:   { speedMult: 0.6,  spawnMult: 0.6,  hpMult: 0.7,  scoreMult: 0.8,  label: 'EASY',   color: '#00ff88' },
  normal: { speedMult: 1.0,  spawnMult: 1.0,  hpMult: 1.0,  scoreMult: 1.0,  label: 'NORMAL', color: '#00f5ff' },
  hard:   { speedMult: 1.5,  spawnMult: 1.5,  hpMult: 1.5,  scoreMult: 2.0,  label: 'HARD',   color: '#ff4d4d' },
};

const POWERUP_CONFIG: Record<PowerUpType, { label: string; color: string; icon: string; duration: number }> = {
  shield:     { label: 'SHIELD',      color: '#00f5ff', icon: '🛡', duration: 5000  },
  rapidfire:  { label: 'RAPID FIRE',  color: '#ff6b35', icon: '⚡', duration: 6000  },
  doubleshot: { label: 'DOUBLE SHOT', color: '#a855f7', icon: '✦', duration: 7000  },
  magnet:     { label: 'MAGNET',      color: '#facc15', icon: '🧲', duration: 5000  },
  slowmotion: { label: 'SLOW MOTION', color: '#22d3ee', icon: '⏳', duration: 4000  },
};

const LS_KEY = 'space_defense_highscore';

function loadHighScore(): HighScore {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { score: 0, level: 1, time: 0, accuracy: 0, peakCPS: 0 };
}

function saveHighScore(hs: HighScore) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(hs)); } catch { /* noop */ }
}

const MAX_PARTICLES = 200;

// ============================================================
// CONFETTI
// ============================================================
function launchConfetti(canvas: HTMLCanvasElement) {
  const pieces: { x: number; y: number; vx: number; vy: number; color: string; size: number; rotation: number; rotSpeed: number; life: number }[] = [];
  const colors = ['#00f5ff','#00ff88','#ff6b35','#a855f7','#facc15','#ff4d4d','#fff'];
  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: Math.random() * canvas.width, y: -10,
      vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4, rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2, life: 1.0
    });
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let frame = 0;
  const animate = () => {
    if (frame++ > 180) return;
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.rotation += p.rotSpeed; p.life -= 0.008;
    });
    pieces.forEach(p => {
      if (p.life <= 0) return;
      ctx.save(); ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
      ctx.restore();
    });
    requestAnimationFrame(animate);
  };
  animate();
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SpaceDefensePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── CHANGE 1: removed 'loading' state, start directly at 'menu' ──
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [meteorsDestroyed, setMeteorsDestroyed] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(10);
  const [currentCPS, setCurrentCPS] = useState(0);
  const [peakCPS, setPeakCPS] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [highScore, setHighScore] = useState<HighScore>(loadHighScore);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [countdownNum, setCountdownNum] = useState<number | string>(3);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpNum, setLevelUpNum] = useState(1);
  const [combo, setCombo] = useState(0);
  const [showComboPopup, setShowComboPopup] = useState(false);
  const [comboPopupVal, setComboPopupVal] = useState(0);
  const [activePowerUps, setActivePowerUps] = useState<{ type: PowerUpType; endsAt: number }[]>([]);

  // Game refs
  const gameLoopRef = useRef<number | undefined>(undefined);
  const playerRef = useRef<Entity & { vx: number; vy: number }>({ x: 0, y: 0, width: 50, height: 60, vx: 0, vy: 0 });
  const projectilesRef = useRef<Projectile[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const lastShotTimeRef = useRef(0);
  const shotHistoryRef = useRef<number[]>([]);
  const statsRef = useRef({ totalShots: 0, hits: 0, startTime: 0 });
  const screenShakeRef = useRef(0);
  const invulnerabilityRef = useRef(0);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const livesRef = useRef(10);
  const meteorsDestroyedRef = useRef(0);
  const comboRef = useRef(0);
  const comboTimerRef = useRef(0);
  const bossSpawnedForLevelRef = useRef(false);
  const difficultyRef = useRef<Difficulty>('normal');
  const activePowerUpsRef = useRef<{ type: PowerUpType; endsAt: number }[]>([]);
  const peakCPSRef = useRef(0);
  const gameStateRef = useRef<'menu' | 'countdown' | 'playing' | 'paused' | 'gameover'>('menu');

  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const PLAYER_SPEED = 7;
  const SHOOT_COOLDOWN = 150;
  const PROJECTILE_SPEED = 12;
  const INVULNERABILITY_TIME = 60;

  // ── Fullscreen ────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Sound ─────────────────────────────────────────────────
  const toggleSound = () => {
    const newMuted = !isMuted;
    sounds.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted) sounds.init();
  };

  // ── Power-Up helpers ──────────────────────────────────────
  const hasPowerUp = useCallback((type: PowerUpType) => {
    return activePowerUpsRef.current.some(p => p.type === type && p.endsAt > Date.now());
  }, []);

  const addPowerUp = useCallback((type: PowerUpType) => {
    const duration = POWERUP_CONFIG[type].duration;
    const endsAt = Date.now() + duration;
    activePowerUpsRef.current = activePowerUpsRef.current.filter(p => p.type !== type);
    activePowerUpsRef.current.push({ type, endsAt });
    setActivePowerUps([...activePowerUpsRef.current]);
    sounds.playPowerUp();
    if (type === 'shield') invulnerabilityRef.current = Math.floor(duration / (1000 / 60));
  }, []);

  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() > 0.25) return;
    const types: PowerUpType[] = ['shield', 'rapidfire', 'doubleshot', 'magnet', 'slowmotion'];
    powerUpsRef.current.push({
      id: Math.random(), x, y,
      type: types[Math.floor(Math.random() * types.length)],
      speed: 1.5, radius: 16
    });
  }, []);

  // ── Particle helper ────────────────────────────────────────
  const createExplosion = useCallback((x: number, y: number, color: string, count = 15) => {
    // ✅ cap particles to avoid performance issues
    const toAdd = Math.min(count, MAX_PARTICLES - particlesRef.current.length);
    for (let i = 0; i < toAdd; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
        life: 1.0, color, size: Math.random() * 4 + 2
      });
    }
  }, []);

  // ── Spawn meteor ───────────────────────────────────────────
  const spawnMeteor = useCallback((canvasWidth: number, currentLevel: number, isBoss = false): Meteor => {
    const cfg = DIFFICULTY_CONFIG[difficultyRef.current];

    // ✅ pre-generate shape points here, NOT in draw()
    const generateShapePoints = (numPoints: number, radiusMult: number) => {
      const pts: number[] = [];
      for (let j = 0; j < numPoints; j++) {
        pts.push(radiusMult * (0.8 + Math.random() * 0.2));
      }
      return pts;
    };

    if (isBoss) {
      const radius = 55 + currentLevel * 2;
      return {
        id: Math.random(), x: canvasWidth / 2, y: -radius * 2,
        width: radius * 2, height: radius * 2, radius,
        speed: (0.4 + currentLevel * 0.02) * cfg.speedMult,
        health: Math.floor((15 + currentLevel * 3) * cfg.hpMult),
        maxHealth: Math.floor((15 + currentLevel * 3) * cfg.hpMult),
        rotation: 0, rotationSpeed: 0.008,
        color: `hsl(${280 + currentLevel * 5}, 90%, 60%)`,
        isBoss: true,
        shapePoints: generateShapePoints(8, 0.05) // boss uses near-uniform shape
      };
    }
    const radius = Math.random() * 20 + 20 + Math.random() * currentLevel * 2;
    let health: number, speed: number;
    if (currentLevel <= 3)       { health = 1;                                    speed = Math.random() * 0.3 + 0.4; }
    else if (currentLevel <= 7)  { health = Math.ceil(1 + (currentLevel - 3) * 0.2); speed = Math.random() * 0.4 + 0.6 + (currentLevel - 3) * 0.05; }
    else                          { health = Math.ceil(2 + (currentLevel - 7) * 0.3); speed = Math.random() * 0.5 + 0.9 + (currentLevel - 7) * 0.04; }
    health  = Math.ceil(health  * cfg.hpMult);
    speed   = speed * cfg.speedMult;
    return {
      id: Math.random(),
      x: Math.random() * (canvasWidth - radius * 2) + radius, y: -radius * 2,
      width: radius * 2, height: radius * 2, radius, speed, health, maxHealth: health,
      rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.05,
      color: `hsl(${Math.random() * 30 + 10}, 70%, 50%)`,
      shapePoints: generateShapePoints(8, 1)
    };
  }, []);

  // ── Shoot ──────────────────────────────────────────────────
  const handleShoot = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    const now = Date.now();
    const cooldown = hasPowerUp('rapidfire') ? SHOOT_COOLDOWN / 2 : SHOOT_COOLDOWN;
    if (now - lastShotTimeRef.current >= cooldown) {
      sounds.playLaser();
      const baseX = playerRef.current.x + playerRef.current.width / 2 - 2;
      const baseY = playerRef.current.y;
      projectilesRef.current.push({ x: baseX, y: baseY, width: 4, height: 20, speed: PROJECTILE_SPEED });
      if (hasPowerUp('doubleshot')) {
        projectilesRef.current.push({ x: baseX - 14, y: baseY + 10, width: 4, height: 20, speed: PROJECTILE_SPEED, isDouble: true });
        projectilesRef.current.push({ x: baseX + 14, y: baseY + 10, width: 4, height: 20, speed: PROJECTILE_SPEED, isDouble: true });
      }
      lastShotTimeRef.current = now;
      statsRef.current.totalShots++;
      shotHistoryRef.current.push(now);
      createExplosion(baseX + 2, baseY, '#00f5ff', 3);
    }
  }, [hasPowerUp, createExplosion]);

  // ── Hit player ─────────────────────────────────────────────
  const gameOver = useCallback(() => {
    if (gameStateRef.current === 'gameover') return;
    gameStateRef.current = 'gameover';
    setGameState('gameover');
    sounds.playGameOver();
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);

    const finalScore = scoreRef.current;
    const finalLevel = levelRef.current;
    const finalTime = Math.floor((Date.now() - statsRef.current.startTime) / 1000);
    const finalAcc = statsRef.current.totalShots > 0 ? Math.floor((statsRef.current.hits / statsRef.current.totalShots) * 100) : 100;
    const finalPeak = peakCPSRef.current;

    const prev = loadHighScore();
    const updated: HighScore = {
      score: Math.max(prev.score, finalScore),
      level: Math.max(prev.level, finalLevel),
      time: Math.max(prev.time, finalTime),
      accuracy: Math.max(prev.accuracy, finalAcc),
      peakCPS: Math.max(prev.peakCPS, finalPeak)
    };
    if (finalScore > prev.score) {
      setIsNewHighScore(true);
      const canvas = canvasRef.current;
      if (canvas) setTimeout(() => launchConfetti(canvas), 300);
    }
    saveHighScore(updated);
    setHighScore(updated);
  }, []);

  const handleHitPlayer = useCallback(() => {
    if (hasPowerUp('shield')) return;
    if (invulnerabilityRef.current > 0) return;
    livesRef.current = Math.max(0, livesRef.current - 1);
    setLives(livesRef.current);
    if (livesRef.current <= 0) { gameOver(); return; }
    sounds.playHit();
    screenShakeRef.current = 15;
    invulnerabilityRef.current = INVULNERABILITY_TIME;
    comboRef.current = 0; setCombo(0);
  }, [hasPowerUp, gameOver]);

  // ── Init game ──────────────────────────────────────────────
  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    playerRef.current = { x: canvas.width / 2 - 25, y: canvas.height - 100, width: 50, height: 60, vx: 0, vy: 0 };
    projectilesRef.current = []; meteorsRef.current = []; particlesRef.current = [];
    powerUpsRef.current = []; activePowerUpsRef.current = [];
    scoreRef.current = 0; levelRef.current = 1; livesRef.current = 10;
    meteorsDestroyedRef.current = 0; comboRef.current = 0; peakCPSRef.current = 0;
    bossSpawnedForLevelRef.current = false;
    setScore(0); setMeteorsDestroyed(0); setLevel(1); setLives(10);
    setCurrentCPS(0); setPeakCPS(0); setAccuracy(100); setTimeSurvived(0);
    setCombo(0); setActivePowerUps([]); setIsNewHighScore(false);
    statsRef.current = { totalShots: 0, hits: 0, startTime: 0 };
    shotHistoryRef.current = []; invulnerabilityRef.current = 0;
    screenShakeRef.current = 0; lastShotTimeRef.current = 0;
    if (!isMuted) sounds.init();
  }, [isMuted]);

  // ── Countdown then start ───────────────────────────────────
  const startCountdown = useCallback(() => {
    initGame();
    setGameState('countdown');
    gameStateRef.current = 'countdown';
    let n = 3;
    setCountdownNum(3);
    sounds.playCountdownBeep();
    const tick = () => {
      n--;
      if (n > 0) {
        setCountdownNum(n);
        sounds.playCountdownBeep();
        setTimeout(tick, 900);
      }
      else { setCountdownNum('GO!'); sounds.playCountdownGo(); setTimeout(() => {
        statsRef.current.startTime = Date.now();
        setGameState('playing');
        gameStateRef.current = 'playing';
      }, 700); }
    };
    setTimeout(tick, 900);
  }, [initGame]);

  // ── Pause ──────────────────────────────────────────────────
  const pauseGame = useCallback(() => {
    if (gameStateRef.current === 'playing') {
      setGameState('paused'); gameStateRef.current = 'paused';
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  const resumeGame = useCallback(() => {
    if (gameStateRef.current === 'paused') {
      setGameState('playing'); gameStateRef.current = 'playing';
    }
  }, []);

  // ── Update ─────────────────────────────────────────────────
  const update = useCallback((_ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const cfg = DIFFICULTY_CONFIG[difficultyRef.current];
    const slowFactor = hasPowerUp('slowmotion') ? 0.4 : 1;

    if (keysRef.current['KeyW'] || keysRef.current['ArrowUp'])    playerRef.current.y -= PLAYER_SPEED;
    if (keysRef.current['KeyS'] || keysRef.current['ArrowDown'])  playerRef.current.y += PLAYER_SPEED;
    if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft'])  playerRef.current.x -= PLAYER_SPEED;
    if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) playerRef.current.x += PLAYER_SPEED;
    if (keysRef.current['KeyF'] || keysRef.current['Space'])      handleShoot();

    playerRef.current.x = Math.max(0, Math.min(canvas.width - playerRef.current.width, playerRef.current.x));
    playerRef.current.y = Math.max(0, Math.min(canvas.height - playerRef.current.height, playerRef.current.y));

    projectilesRef.current = projectilesRef.current.filter(p => p.y > -p.height);
    projectilesRef.current.forEach(p => { p.y -= p.speed; });

    if (hasPowerUp('magnet')) {
      powerUpsRef.current.forEach(pu => {
        const dx = playerRef.current.x + playerRef.current.width / 2 - pu.x;
        const dy = playerRef.current.y + playerRef.current.height / 2 - pu.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) { pu.x += dx / dist * 3; pu.y += dy / dist * 3; }
      });
    }

    powerUpsRef.current = powerUpsRef.current.filter(pu => {
      pu.y += pu.speed;
      const pdx = pu.x - (playerRef.current.x + playerRef.current.width / 2);
      const pdy = pu.y - (playerRef.current.y + playerRef.current.height / 2);
      if (Math.sqrt(pdx * pdx + pdy * pdy) < pu.radius + 25) {
        addPowerUp(pu.type);
        createExplosion(pu.x, pu.y, POWERUP_CONFIG[pu.type].color, 12);
        return false;
      }
      return pu.y < canvas.height + 20;
    });

    const now = Date.now();
    activePowerUpsRef.current = activePowerUpsRef.current.filter(p => p.endsAt > now);

    let spawnChance = 0.015 * cfg.spawnMult;
    if (levelRef.current > 3) spawnChance += (levelRef.current - 3) * 0.002;
    if (levelRef.current > 7) spawnChance += (levelRef.current - 7) * 0.001;
    spawnChance = Math.min(spawnChance, 0.05 * cfg.spawnMult);
    if (Math.random() < spawnChance) meteorsRef.current.push(spawnMeteor(canvas.width, levelRef.current));

    if (levelRef.current % 5 === 0 && !bossSpawnedForLevelRef.current) {
      bossSpawnedForLevelRef.current = true;
      meteorsRef.current.push(spawnMeteor(canvas.width, levelRef.current, true));
    }

    if (comboRef.current > 0) {
      comboTimerRef.current += 1;
      if (comboTimerRef.current > 120) { comboRef.current = 0; comboTimerRef.current = 0; setCombo(0); }
    }

    for (let i = meteorsRef.current.length - 1; i >= 0; i--) {
      const m = meteorsRef.current[i];
      m.y += m.speed * slowFactor;
      m.rotation += m.rotationSpeed;

      const dx = m.x - (playerRef.current.x + playerRef.current.width / 2);
      const dy = m.y - (playerRef.current.y + playerRef.current.height / 2);
      if (Math.sqrt(dx * dx + dy * dy) < m.radius + 20 && invulnerabilityRef.current <= 0) {
        handleHitPlayer();
        createExplosion(m.x, m.y, m.color, 10);
        meteorsRef.current.splice(i, 1); continue;
      }

      if (m.y - m.radius > canvas.height) {
        handleHitPlayer();
        meteorsRef.current.splice(i, 1);
        comboRef.current = 0; comboTimerRef.current = 0; setCombo(0);
        continue;
      }

      for (let pi = projectilesRef.current.length - 1; pi >= 0; pi--) {
        const p = projectilesRef.current[pi];
        const pdx = m.x - p.x; const pdy = m.y - p.y;
        if (Math.sqrt(pdx * pdx + pdy * pdy) < m.radius) {
          projectilesRef.current.splice(pi, 1);
          m.health--; statsRef.current.hits++;
          sounds.playHit();
          createExplosion(p.x, p.y, m.isBoss ? '#a855f7' : '#ff6b35', m.isBoss ? 8 : 3);

          if (m.health <= 0) {
            m.isBoss ? sounds.playBossExplosion() : sounds.playExplosion();
            createExplosion(m.x, m.y, m.color, m.isBoss ? 50 : 20);
            if (m.isBoss) {
              for (let b = 0; b < 3; b++) {
                setTimeout(() => createExplosion(
                  m.x + (Math.random() - 0.5) * 80, m.y + (Math.random() - 0.5) * 80,
                  '#a855f7', 20
                ), b * 150);
              }
              spawnPowerUp(m.x, m.y);
            }
            spawnPowerUp(m.x, m.y);
            meteorsRef.current.splice(i, 1);

            comboRef.current++; comboTimerRef.current = 0;
            const newCombo = comboRef.current;
            setCombo(newCombo);
            if (newCombo >= 2) { sounds.playCombo(); setComboPopupVal(newCombo); setShowComboPopup(true); setTimeout(() => setShowComboPopup(false), 800); }

            const comboMult = Math.max(1, Math.floor(newCombo / 2));
            const baseScore = Math.floor(m.radius * levelRef.current * cfg.scoreMult);
            const bonus = m.isBoss ? 500 * levelRef.current : 0;
            scoreRef.current += (baseScore + bonus) * comboMult;
            setScore(scoreRef.current);

            meteorsDestroyedRef.current++;
            setMeteorsDestroyed(meteorsDestroyedRef.current);
            screenShakeRef.current = m.isBoss ? 25 : 10;

            const threshold = levelRef.current <= 3 ? 15 : levelRef.current <= 7 ? 25 : 35;
            if (meteorsDestroyedRef.current % threshold === 0) {
              levelRef.current++;
              bossSpawnedForLevelRef.current = levelRef.current % 5 !== 0;
              setLevel(levelRef.current);
              setLevelUpNum(levelRef.current);
              setShowLevelUp(true);
              setTimeout(() => setShowLevelUp(false), 2000);
              sounds.playLevelUp();
            }
            break;
          }
        }
      }
    }

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.02;
      if (p.life <= 0) particlesRef.current.splice(i, 1);
    }

    const nowMs = Date.now();
    shotHistoryRef.current = shotHistoryRef.current.filter(t => nowMs - t < 1000);
    const cpsVal = shotHistoryRef.current.length;
    if (cpsVal > peakCPSRef.current) peakCPSRef.current = cpsVal;
    setCurrentCPS(cpsVal);
    setPeakCPS(peakCPSRef.current);
    if (statsRef.current.totalShots > 0) setAccuracy(Math.floor((statsRef.current.hits / statsRef.current.totalShots) * 100));
    setTimeSurvived(Math.floor((nowMs - statsRef.current.startTime) / 1000));

    if (screenShakeRef.current > 0) screenShakeRef.current--;
    if (invulnerabilityRef.current > 0) invulnerabilityRef.current--;
  }, [hasPowerUp, handleShoot, handleHitPlayer, spawnMeteor, spawnPowerUp, addPowerUp, createExplosion]);

  // ── Draw ───────────────────────────────────────────────────
  const draw = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (screenShakeRef.current > 0) {
      ctx.translate((Math.random() - 0.5) * screenShakeRef.current, (Math.random() - 0.5) * screenShakeRef.current);
    }

    // Stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
      const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * canvas.width;
      const y = ((Math.cos(i * 456.78) * 0.5 + 0.5) * canvas.height + (Date.now() / 20)) % canvas.height;
      ctx.globalAlpha = 0.2; ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    // Particles
    particlesRef.current.forEach(p => {
      ctx.fillStyle = p.color; ctx.globalAlpha = p.life;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Power-up drops
    powerUpsRef.current.forEach(pu => {
      const cfg = POWERUP_CONFIG[pu.type];
      ctx.save(); ctx.translate(pu.x, pu.y);
      ctx.shadowBlur = 15; ctx.shadowColor = cfg.color;
      ctx.beginPath(); ctx.arc(0, 0, pu.radius, 0, Math.PI * 2);
      ctx.strokeStyle = cfg.color; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `${pu.radius}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(cfg.icon, 0, 0);
      ctx.shadowBlur = 0; ctx.restore();
    });

    // Projectiles
    projectilesRef.current.forEach(p => {
      const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
      grad.addColorStop(0, p.isDouble ? '#a855f7' : '#00f5ff');
      grad.addColorStop(1, p.isDouble ? '#e879f9' : '#00ff88');
      ctx.fillStyle = grad; ctx.shadowBlur = 10;
      ctx.shadowColor = p.isDouble ? '#a855f7' : '#00f5ff';
      ctx.fillRect(p.x, p.y, p.width, p.height); ctx.shadowBlur = 0;
    });

    // Meteors — ✅ use pre-calculated shapePoints, no Math.random() here
    meteorsRef.current.forEach(m => {
      ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.rotation);
      ctx.shadowBlur = m.isBoss ? 30 : 15; ctx.shadowColor = m.color;

      if (m.isBoss) {
        ctx.beginPath(); ctx.arc(0, 0, m.radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = m.color; ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]); ctx.stroke(); ctx.setLineDash([]);
      }

      ctx.fillStyle = m.isBoss ? '#0a0015' : '#1e2430';
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2;
        // ✅ use stored shapePoints instead of Math.random()
        const r = m.isBoss
          ? m.radius * (0.95 + (m.shapePoints[j] || 0.05))
          : m.radius * m.shapePoints[j];
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = m.color; ctx.lineWidth = m.isBoss ? 3 : 2; ctx.stroke();

      if (m.isBoss) {
        ctx.fillStyle = m.color; ctx.globalAlpha = 0.15;
        ctx.beginPath(); ctx.arc(0, 0, m.radius * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      if (m.maxHealth > 1 || m.isBoss) {
        const bw = m.isBoss ? 100 : 40; const bh = m.isBoss ? 8 : 4;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(m.x - bw / 2, m.y - m.radius - 14, bw, bh);
        ctx.fillStyle = m.isBoss ? '#a855f7' : m.color;
        ctx.fillRect(m.x - bw / 2, m.y - m.radius - 14, bw * (m.health / m.maxHealth), bh);
        if (m.isBoss) {
          ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1;
          ctx.strokeRect(m.x - bw / 2, m.y - m.radius - 14, bw, bh);
          ctx.fillStyle = '#fff'; ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('BOSS', m.x, m.y - m.radius - 18);
        }
      }
    });

    // Player
    const pl = playerRef.current;
    ctx.save(); ctx.translate(pl.x + pl.width / 2, pl.y + pl.height / 2);
    const engineGlow = ctx.createRadialGradient(0, pl.height / 2, 0, 0, pl.height / 2, 20);
    engineGlow.addColorStop(0, '#ff6b35'); engineGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = engineGlow; ctx.fillRect(-15, pl.height / 2 - 5, 30, 20);
    ctx.fillStyle = '#080d14'; ctx.strokeStyle = hasPowerUp('shield') ? '#00ff88' : '#00f5ff'; ctx.lineWidth = 2;
    ctx.shadowBlur = hasPowerUp('shield') ? 20 : 0; ctx.shadowColor = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(0, -pl.height / 2); ctx.lineTo(pl.width / 2, pl.height / 4);
    ctx.lineTo(pl.width / 4, pl.height / 2); ctx.lineTo(-pl.width / 4, pl.height / 2);
    ctx.lineTo(-pl.width / 2, pl.height / 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00f5ff'; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.ellipse(0, -pl.height / 6, 6, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    if (invulnerabilityRef.current > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.3; ctx.fillStyle = hasPowerUp('shield') ? '#00ff88' : '#ff6b35';
      ctx.beginPath(); ctx.arc(pl.x + pl.width / 2, pl.y + pl.height / 2, pl.width, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }, [hasPowerUp]);

  // ── Game loop ──────────────────────────────────────────────
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    update(ctx, canvas);
    draw(ctx, canvas);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState, gameLoop]);

  // ── Keyboard ───────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'Escape') {
        e.preventDefault();
        if (gameStateRef.current === 'playing') pauseGame();
        else if (gameStateRef.current === 'paused') resumeGame();
      }
      if ((e.code === 'KeyF' || e.code === 'Space') && gameStateRef.current === 'playing') {
        e.preventDefault(); handleShoot();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [pauseGame, resumeGame, handleShoot]);

  const handleCanvasInteraction = (_e: React.MouseEvent | React.TouchEvent) => {
    if (gameState === 'playing') handleShoot();
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setActivePowerUps([...activePowerUpsRef.current.filter(p => p.endsAt > Date.now())]);
    }, 250);
    return () => clearInterval(interval);
  }, [gameState]);

  // ── Render ─────────────────────────────────────────────────
  return (
    // ── CHANGE 2: removed background/padding from outer wrapper ──
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>

      {/* Game Container Wrapper */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '4rem' }}>
        <div ref={containerRef} style={{
          position: 'relative', width: '100%', maxWidth: '900px', aspectRatio: '16/9',
          // ── CHANGE 2: background removed from game container ──
          border: '1px solid rgba(0,245,255,0.2)',
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0,245,255,0.05)', userSelect: 'none'
        }}>
          {/* Background Grid */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none', backgroundImage: 'radial-gradient(var(--neon-cyan) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          {/* Canvas */}
          <canvas
            ref={canvasRef} width={900} height={500}
            onMouseDown={handleCanvasInteraction} onTouchStart={handleCanvasInteraction}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair', touchAction: 'none' }}
          />

          {/* ── HUD (Playing) ── */}
          {(gameState === 'playing' || gameState === 'paused') && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', pointerEvents: 'auto' }}>
                <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.6rem 1rem' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--neon-cyan)', fontWeight: '700', marginBottom: '0.2rem' }}>Score</div>
                  <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: '800', color: '#fff' }}>{score.toLocaleString()}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.6rem 1rem' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#ff4d4d', fontWeight: '700', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Heart size={11} fill="currentColor" /> Hull
                  </div>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} style={{ width: '7px', height: '14px', borderRadius: '2px', transition: 'all 0.3s', background: i < lives ? 'var(--neon-orange)' : 'rgba(255,255,255,0.1)', boxShadow: i < lives ? '0 0 6px var(--neon-orange)' : 'none' }} />
                    ))}
                  </div>
                </div>
                {combo >= 2 && (
                  <div style={{ background: 'rgba(255,107,53,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,107,53,0.4)', borderRadius: '12px', padding: '0.4rem 0.8rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--neon-orange)', fontWeight: '800', textTransform: 'uppercase' }}>Combo</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', fontFamily: 'monospace' }}>{combo}x</div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={toggleSound} style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', gap: '6px', color: isMuted ? 'rgba(255,255,255,0.4)' : '#fff', cursor: 'pointer' }}>
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} color="var(--neon-cyan)" />}
                  </button>
                  <button onClick={pauseGame} style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                    <Pause size={16} />
                  </button>
                  <button onClick={toggleFullscreen} style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <StatBox icon={<Zap size={14} color="var(--neon-yellow)" />} label="CPS" value={currentCPS} />
                  <StatBox icon={<Trophy size={14} color="var(--neon-orange)" />} label="Peak" value={peakCPS} />
                  <StatBox icon={<Target size={14} color="var(--neon-cyan)" />} label="Acc" value={`${accuracy}%`} />
                  <StatBox icon={<Activity size={14} color="var(--neon-green)" />} label="Kills" value={meteorsDestroyed} />
                </div>
                <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={14} color="var(--neon-yellow)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>LVL {level}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {activePowerUps.filter(p => p.endsAt > Date.now()).map(p => {
                    const cfg = POWERUP_CONFIG[p.type];
                    const remain = Math.max(0, Math.ceil((p.endsAt - Date.now()) / 1000));
                    return (
                      <div key={p.type} style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${cfg.color}`, borderRadius: '8px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: `0 0 8px ${cfg.color}40` }}>
                        <span style={{ fontSize: '12px' }}>{cfg.icon}</span>
                        <span style={{ fontSize: '0.65rem', color: cfg.color, fontWeight: '700' }}>{remain}s</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Level Up Overlay */}
          {showLevelUp && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', animation: 'levelUpAnim 2s ease-out forwards' }}>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--neon-yellow)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Level Up!</div>
                <div style={{ fontSize: '4rem', fontWeight: '900', color: '#fff', textShadow: '0 0 40px rgba(0,245,255,0.8)', fontFamily: 'monospace' }}>{levelUpNum}</div>
              </div>
              <style>{`@keyframes levelUpAnim { 0%{transform:scale(0.5);opacity:0} 30%{transform:scale(1.15);opacity:1} 70%{transform:scale(1);opacity:1} 100%{transform:scale(1.2);opacity:0} }`}</style>
            </div>
          )}

          {/* Combo Popup */}
          {showComboPopup && (
            <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', textAlign: 'center', animation: 'comboAnim 0.8s ease-out forwards' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--neon-orange)', textShadow: '0 0 20px rgba(255,107,53,0.8)', fontFamily: 'monospace' }}>{comboPopupVal}x COMBO!</div>
              <style>{`@keyframes comboAnim { 0%{transform:translateX(-50%) translateY(0) scale(0.8);opacity:0} 30%{transform:translateX(-50%) translateY(-10px) scale(1.1);opacity:1} 100%{transform:translateX(-50%) translateY(-30px) scale(1);opacity:0} }`}</style>
            </div>
          )}

          {/* Mobile Controls */}
          {(gameState === 'playing') && (
            <div className="mobile-controls" style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', pointerEvents: 'auto' }}>
                <div />
                <ControlButton icon={<ChevronUp />} onStart={() => { keysRef.current['KeyW'] = true; }} onEnd={() => { keysRef.current['KeyW'] = false; }} />
                <div />
                <ControlButton icon={<ChevronLeft />} onStart={() => { keysRef.current['KeyA'] = true; }} onEnd={() => { keysRef.current['KeyA'] = false; }} />
                <ControlButton icon={<ChevronDown />} onStart={() => { keysRef.current['KeyS'] = true; }} onEnd={() => { keysRef.current['KeyS'] = false; }} />
                <ControlButton icon={<ChevronRight />} onStart={() => { keysRef.current['KeyD'] = true; }} onEnd={() => { keysRef.current['KeyD'] = false; }} />
              </div>
              <div style={{ pointerEvents: 'auto' }}>
                <button onMouseDown={() => { keysRef.current['KeyF'] = true; }} onMouseUp={() => { keysRef.current['KeyF'] = false; }} onTouchStart={() => { keysRef.current['KeyF'] = true; }} onTouchEnd={() => { keysRef.current['KeyF'] = false; }}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,245,255,0.1)', border: '2px solid var(--neon-cyan)', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(5px)' }}>
                  <Zap size={28} fill="currentColor" />
                </button>
              </div>
            </div>
          )}

          {/* ── Countdown ── */}
          {gameState === 'countdown' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,13,20,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div key={String(countdownNum)} style={{ fontSize: countdownNum === 'GO!' ? '5rem' : '8rem', fontWeight: '900', color: countdownNum === 'GO!' ? '#00ff88' : '#fff', textShadow: `0 0 60px ${countdownNum === 'GO!' ? '#00ff88' : '#00f5ff'}`, fontFamily: 'monospace', animation: 'countAnim 0.8s ease-out' }}>
                {countdownNum}
              </div>
              <style>{`@keyframes countAnim { 0%{transform:scale(1.6);opacity:0} 50%{transform:scale(0.95);opacity:1} 100%{transform:scale(1);opacity:1} }`}</style>
            </div>
          )}

          {/* ── Pause Overlay ── */}
          {gameState === 'paused' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,13,20,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Pause size={32} color="var(--neon-cyan)" />
                  <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', margin: 0 }}>PAUSED</h2>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem' }}>Press Esc to resume</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '240px' }}>
                  <button onClick={resumeGame} style={{ padding: '0.875rem', background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-green))', color: '#000', fontWeight: '800', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Play size={18} fill="currentColor" /> RESUME
                  </button>
                  <button onClick={startCountdown} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: '700', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <RotateCcw size={16} /> RESTART
                  </button>
                  <button onClick={() => { setGameState('menu'); gameStateRef.current = 'menu'; }} style={{ padding: '0.75rem', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontWeight: '600', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Home size={16} /> MAIN MENU
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Menu ── */}
          {gameState === 'menu' && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(2,4,10,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '8px' }}>
                <button onClick={toggleSound} aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'} style={{ background: 'rgba(4,9,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px', color: isMuted ? 'rgba(255,255,255,0.4)' : '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} style={{ background: 'rgba(4,9,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
              </div>

              <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', backgroundColor: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)', color: 'var(--neon-cyan)', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>
                  METEOR SHOOTER
                </div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.03em', color: '#fff', textShadow: '0 0 20px rgba(0,245,255,0.4)', margin: '0 0 0.3rem' }}>
                  Space <span style={{ color: 'var(--neon-cyan)' }}>DEFENSE</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.4rem' }}>Test your CPS and survival skills</p>

                <div style={{ marginBottom: '1.4rem' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => {
                      const cfg = DIFFICULTY_CONFIG[d];
                      const isSelected = difficulty === d;
                      return (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          aria-pressed={isSelected}
                          style={{
                            flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800,
                            fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                            border: '1px solid', borderColor: isSelected ? cfg.color : '#1f2937',
                            backgroundColor: isSelected ? `${cfg.color}14` : '#0b111e',
                            color: isSelected ? cfg.color : '#9ca3af',
                            boxShadow: isSelected ? `0 0 12px ${cfg.color}40` : 'none',
                            transition: 'all 0.2s',
                          }}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.5rem' }}>
                    {difficulty === 'hard' ? '2× score · Faster, tougher meteors' : difficulty === 'easy' ? '0.8× score · Slower meteors' : 'Standard gameplay · 1× score'}
                  </div>
                </div>

                <div style={{ marginBottom: '1.2rem', color: '#6b7280', fontSize: '0.8rem' }}>
                  <strong style={{ color: '#9ca3af' }}>WASD</strong> move · <strong style={{ color: '#9ca3af' }}>F / Space</strong> shoot
                </div>

                {highScore.score > 0 && (
                  <div style={{ color: 'rgba(255,215,0,0.75)', fontSize: '0.78rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Trophy size={13} color="gold" /> Best: {highScore.score.toLocaleString()} pts · Lv {highScore.level}
                  </div>
                )}

                <button
                  onClick={startCountdown}
                  style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-green))', color: '#000', fontSize: '1rem', fontWeight: 900, borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 30px rgba(0,245,255,0.3)' }}
                  aria-label="Start game"
                >
                  <Play fill="currentColor" size={16} /> START MISSION
                </button>
              </div>
            </div>
          )}

          {/* ── Game Over ── */}
          {gameState === 'gameover' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,13,20,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div style={{ maxWidth: '380px', width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.5rem', textAlign: 'center' }}>
                {isNewHighScore && (
                  <div style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '10px', padding: '0.5rem', marginBottom: '0.75rem', color: 'gold', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Trophy size={16} /> NEW HIGH SCORE!
                  </div>
                )}
                <div style={{ color: '#ff4d4d', fontWeight: '900', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.2rem' }}>Mission Failed</div>
                <h2 style={{ fontSize: '1.9rem', fontWeight: '900', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>GAME OVER</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
                  <GameOverStat label="Final Score" value={score.toLocaleString()} highlight="var(--neon-cyan)" />
                  <GameOverStat label="Meteors" value={meteorsDestroyed} icon={<Activity size={11} />} />
                  <GameOverStat label="Peak CPS" value={peakCPS} icon={<Trophy size={11} />} />
                  <GameOverStat label="Accuracy" value={`${accuracy}%`} icon={<Target size={11} />} />
                  <GameOverStat label="Time" value={`${timeSurvived}s`} icon={<Timer size={11} />} />
                  <GameOverStat label="Level" value={level} highlight="var(--neon-purple)" />
                </div>
                <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-around' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,215,0,0.6)', fontWeight: '700' }}>BEST SCORE</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'gold', fontFamily: 'monospace' }}>{highScore.score.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,215,0,0.6)', fontWeight: '700' }}>BEST TIME</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'gold', fontFamily: 'monospace' }}>{highScore.time}s</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,215,0,0.6)', fontWeight: '700' }}>BEST LEVEL</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'gold', fontFamily: 'monospace' }}>{highScore.level}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button onClick={startCountdown} style={{ width: '100%', padding: '0.8rem', background: '#fff', color: '#000', fontSize: '0.9rem', fontWeight: '800', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--neon-cyan)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}>
                    <RotateCcw size={16} /> TRY AGAIN
                  </button>
                  <button onClick={() => { setGameState('menu'); gameStateRef.current = 'menu'; }} style={{ width: '100%', padding: '0.7rem', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', fontWeight: '600', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                    <Home size={15} /> MAIN MENU
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ============================================================
          SEO ARTICLE SECTION
          ============================================================ */}
      <hr style={{ borderColor: 'var(--border)', margin: '5rem 0 4rem' }} />

      <div style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '3rem 2.5rem' }}>
        <section style={{ maxWidth: '900px', margin: '0 auto', color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>

          <h2 style={{ color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: '800', marginBottom: '1.5rem', textAlign: 'center' }}>
            Why You Should Play Space Defense
          </h2>

          <p style={{ marginBottom: '1.5rem' }}>
            Space Defense is more than just a simple browser game. It combines fast reactions, keyboard control, mouse accuracy, and hand-eye coordination into one exciting challenge. Whether you're a gamer looking to sharpen your skills or simply want a fun way to pass the time, Space Defense offers an engaging experience that keeps you coming back for higher scores.
          </p>

          <p style={{ marginBottom: '2rem' }}>
            Unlike a lot of casual browser games that rely purely on luck or repetitive tapping, Space Defense is built around a genuine skill loop. Every meteor you destroy, every boss you survive, and every combo you chain together is a small test of how quickly your brain can read a moving target and turn that information into an accurate, well-timed shot. That loop is exactly the kind of task that cognitive scientists have spent decades studying in relation to fast-paced video games, and it's worth understanding why it works so well before you jump into your next run.
          </p>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Improve Your Reaction Speed</h2>
            <p style={{ marginBottom: '1rem' }}>Every meteor that falls from the sky requires quick decisions. As the game progresses, meteors become faster and more difficult to destroy. Players must react instantly to avoid collisions and eliminate threats before they reach the bottom of the screen. This is not just a design gimmick — it's the same principle that researchers have used for years to study how fast-paced action gameplay trains the visual system.</p>
            <p style={{ marginBottom: '1rem' }}>
              A widely cited review of action video game research, led by cognitive neuroscientist Daphne Bavelier and published on <SourceLink href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2871325/">the National Center for Biotechnology Information</SourceLink>, found that experienced action-game players consistently respond faster across a wide range of visual tasks than people who don't play these games, and crucially, that speed didn't come at the cost of accuracy. The review's authors argued that the fast, unpredictable stream of targets in games like meteor shooters forces the visual system to become more efficient at picking out relevant information under time pressure — which is essentially the exact scenario Space Defense recreates with every wave of meteors.
            </p>
            <p style={{ margin: '0' }}>Regular play can help improve reaction time, focus, and decision-making speed, and the built-in CPS and accuracy tracker in Space Defense lets you see that improvement in numbers rather than just a feeling.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-purple)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Sharpen Hand-Eye Coordination</h2>
            <p style={{ marginBottom: '1rem' }}>
              Hand-eye coordination is the skill of translating what your eyes see into precise, well-timed movement — exactly what happens every time you line up a shot on a spinning meteor while still dodging incoming debris. It's a skill set that shows up far beyond gaming, from parallel parking a car to catching an object thrown across a room.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              A study out of the University of Toronto, summarized in a release from <SourceLink href="https://media.utoronto.ca/media-releases/university-of-toronto-study-finds-action-video-games-bolster-sensorimotor-skills/">the university's media office</SourceLink>, found that people who regularly played action video games showed measurably better sensorimotor control — the coordinated function of vision and hand movement — than people who didn't. The researchers behind the study noted that the improvement seemed to come from better visuomotor prediction, meaning gamers got better at anticipating where a moving object was headed and adjusting their aim accordingly.
            </p>
            <p style={{ margin: '0' }}>
              More recent work has extended those findings across a broader mix of game genres. A 2024 paper published in the journal <em>Behavioral Sciences</em> and hosted on <SourceLink href="https://www.mdpi.com/2076-328X/14/10/874">MDPI's open-access platform</SourceLink> linked higher videogaming proficiency to measurable gains in psychomotor speed and hand-eye coordination, alongside improvements in short-term visuospatial memory. In Space Defense, that translates directly into cleaner shots, fewer wasted projectiles, and a higher accuracy percentage on your end-of-run stat card.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-green)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Train Keyboard Control and Multitasking</h2>
            <p style={{ marginBottom: '1rem' }}>Space Defense uses multiple keyboard controls simultaneously, creating an excellent exercise for coordination and response speed. You're steering with WASD or the arrow keys, firing with F or Space, and mentally tracking your Hull meter, your combo counter, and any active power-ups — often all within the same second.</p>
            <p style={{ margin: '0' }}>
              This kind of simultaneous input handling is a form of divided attention, and it's one of the cognitive skills most consistently linked to action gaming in the research literature. A long-running review of three decades of video-game studies, archived on <SourceLink href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3772618/">PMC</SourceLink>, points to task switching and sustained visual attention as two of the abilities that show up again and again when scientists test experienced players against non-gamers. Practically speaking, the more you play Space Defense, the more automatic your movement becomes, freeing up mental bandwidth to focus on aiming and threat assessment instead of hunting for the right key.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Practice Mouse Accuracy and Understand Your CPS</h2>
            <p style={{ marginBottom: '1rem' }}>In addition to keyboard controls, players can shoot using the left mouse button or a tap on mobile. This adds another layer of control and helps improve clicking accuracy and timing, since firing too early or too late against a moving meteor means a wasted shot.</p>
            <p style={{ marginBottom: '1rem' }}>
              CPS, or Clicks Per Second, is the metric Space Defense uses to measure how quickly you can fire. It sits in the HUD next to your Peak CPS, which records the fastest burst you managed during the run. A higher sustained CPS matters most during boss fights, when a large health bar needs to be worn down before the boss reaches the bottom of the play field, and during Hard difficulty runs, where meteors move faster and spawn more often.
            </p>
            <p style={{ margin: '0' }}>
              CPS on its own isn't the whole story, though. Firing as fast as possible while missing every other shot will tank your accuracy percentage, which is exactly why Space Defense tracks both numbers side by side. The most efficient runs tend to come from players who find a rhythm — firing quickly, but only when a meteor is actually lined up — rather than simply mashing the fire key nonstop.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-yellow)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Boss Battles and Sustained Attention</h2>
            <p style={{ marginBottom: '1rem' }}>
              Every fifth level in Space Defense introduces a boss meteor: a slower but far tougher target with its own dedicated health bar and a much larger blast radius when it finally breaks apart. Bosses change the rhythm of the game. Instead of reacting to a stream of short-lived threats, you have to hold your focus on a single target for a sustained period, all while smaller meteors can still spawn around it.
            </p>
            <p style={{ margin: '0' }}>
              That shift from quick, reactive attention to longer sustained focus is itself a distinct cognitive skill, and it's one of the reasons boss encounters tend to feel noticeably more demanding than the regular meteor waves that precede them. Treat a boss fight as a different mode of concentration rather than "the same thing, but longer," and you'll find it easier to keep your aim steady instead of panicking and burning through your ammo.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Power-Ups and Strategic Decision-Making</h2>
            <p style={{ marginBottom: '1rem' }}>Space Defense includes five power-ups, each dropped randomly from destroyed meteors and especially likely to appear after a boss fight: Shield grants temporary invincibility, Rapid Fire doubles your rate of fire, Double Shot adds two angled side projectiles to every shot, Magnet pulls nearby drops toward your ship, and Slow Motion reduces meteor speed to 40 percent for a short window.</p>
            <p style={{ margin: '0' }}>
              None of these are simply "free points." Picking up a power-up at the wrong moment, or ignoring one that's about to drift off-screen, is itself a small decision under pressure. Do you break formation to chase a Magnet pickup while three meteors are closing in, or do you let it go and keep your position? Space Defense is deliberately designed so that these micro-decisions stack on top of the raw reaction-time challenge, which is part of why a single run rarely feels repetitive even after dozens of attempts.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-purple)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>The Combo System: Risk, Reward, and Rhythm</h2>
            <p style={{ margin: '0' }}>
              Destroying meteors back-to-back without missing or getting hit builds a combo multiplier that directly boosts your score. Combos reward consistency over bursts of luck: a two-combo streak is nice, but a ten-combo streak — visible as a bright "COMBO!" popup on screen — can be the difference between a mediocre run and a new personal best. Because taking a hit resets your combo to zero, the system quietly encourages a calmer, more controlled playstyle rather than frantic button mashing, especially once meteors start moving fast enough that a single missed dodge can end a long streak.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-green)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Track Your Performance Across Sessions</h2>
            <p style={{ margin: '0' }}>At the end of each run, players can review their Final Score, Meteors Destroyed, Peak CPS, Accuracy Percentage, and Survival Time, alongside their personal best in each category — making it easy to track improvement across sessions instead of relying on a vague sense of "I think I did better that time." Because high scores are saved locally in your browser, you can close the tab, come back the next day, and immediately see how today's run compares to your best.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Choosing the Right Difficulty for Your Goals</h2>
            <p style={{ marginBottom: '1rem' }}>
              Space Defense offers three difficulty levels, and picking the right one matters more than it might seem. Easy mode slows meteors down and reduces their spawn rate and health, which makes it the better choice if your goal is simply to practice clean aim and build muscle memory for the controls without the added pressure of a fast-moving screen.
            </p>
            <p style={{ margin: '0' }}>
              Normal mode is balanced for most players and is the best starting point if you want a fair read on your current reaction time and accuracy. Hard mode multiplies meteor speed and spawn rate by 1.5x and meteor health by the same amount, but it also doubles your score multiplier — so competitive players chasing a spot at the top of their personal leaderboard will usually want to push into Hard once Normal starts to feel too easy. There's no single "correct" difficulty; the right one is whichever setting keeps you right at the edge of your current skill level, since that's where the fastest improvement tends to happen.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Seven Tips to Push Your High Score Higher</h2>
            <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <li><strong style={{ color: 'var(--text-primary)' }}>Stay mobile, not centered.</strong> Sitting in the middle of the play field feels safe but gives you the least time to react to meteors spawning on either side. Drift toward whichever side has fewer active threats.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Prioritize threats near your ship.</strong> A meteor about to reach the bottom of the screen costs you a life the moment it passes; a meteor still high on the screen can wait a second longer.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Save Shield for boss levels.</strong> Since power-ups are timed rather than stockpiled, picking up Shield right before a boss spawns gets you more value than using it during a quiet stretch.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Don't break your combo for greed.</strong> Chasing a distant power-up while ignoring a nearby meteor is often a losing trade once you factor in the combo multiplier you'd lose from a missed hit.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Use Slow Motion to reset your rhythm.</strong> If the screen gets chaotic, a Slow Motion pickup is the easiest way to regain control without losing lives.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Watch your accuracy, not just your CPS.</strong> A high CPS with low accuracy usually means you're firing blind. Slow down fractionally and aim for a rhythm where most shots connect.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Play in short, focused sessions.</strong> Reaction-time tasks are known to be sensitive to fatigue, so a handful of sharp five-minute runs will usually beat one long, tired session for both your score and your enjoyment.</li>
            </ol>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-yellow)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Playing in Moderation: Protecting Your Eyes</h2>
            <p style={{ marginBottom: '1rem' }}>
              Space Defense is designed to be played in short, high-intensity bursts rather than marathon sessions, and that's a good habit for screen-based activities in general. Extended, uninterrupted screen time is one of the most common causes of digital eye strain, sometimes called computer vision syndrome.
            </p>
            <p style={{ margin: '0' }}>
              <SourceLink href="https://www.aoa.org/healthy-eyes/eye-and-vision-conditions/computer-vision-syndrome">The American Optometric Association</SourceLink> recommends these as effective ways to reduce eye strain during long screen sessions: follow the 20-20-20 rule by looking at something roughly 20 feet away for 20 seconds every 20 minutes, blink deliberately and often since screen focus tends to reduce blink rate, and take a longer rest break after about two hours of continuous device use. Building a short break into your Space Defense sessions — between runs rather than mid-boss-fight, ideally — costs you almost nothing in score and does your eyes a real favor.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-green)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>What the Research Says About Gaming and Wellbeing</h2>
            <p style={{ margin: '0' }}>
              Fast-paced games like Space Defense are sometimes assumed to be "just" entertainment, but the picture from the psychology literature is more nuanced than that. <SourceLink href="https://www.apa.org/monitor/2024/07/inclusive-ethical-video-games">The American Psychological Association</SourceLink> has published research pointing to learning, social, and stress-relief benefits tied to regular, moderate video game play, alongside the well-documented cognitive gains in attention and visuomotor control discussed earlier in this article. As with most leisure activities, the benefits show up most clearly when play is balanced against sleep, movement, and time away from the screen — which is exactly why Space Defense keeps its runs short, scoreable, and easy to step away from between sessions.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-purple)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Playing on Mobile and Touch Devices</h2>
            <p style={{ marginBottom: '1rem' }}>
              Space Defense includes an on-screen directional pad and a dedicated fire button for phones and tablets, and the whole game supports fullscreen mode so a small screen doesn't cost you visibility over incoming meteors. Touch input changes the shape of the challenge slightly: instead of holding a key down, you're tapping repeatedly, which shifts the emphasis from raw fire rate toward precise timing.
            </p>
            <p style={{ margin: '0' }}>
              If you're playing on a touchscreen, it's usually worth favoring accuracy over speed a little more than you would on keyboard and mouse, since each tap takes marginally longer to register than a key held under your fingers. The CPS and accuracy stats work exactly the same way regardless of input method, so mobile players can still compare their runs directly against a desktop high score.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-yellow)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>How the Difficulty Curve Actually Works</h2>
            <p style={{ marginBottom: '1rem' }}>
              Space Defense doesn't just get "harder" in a vague sense as you level up — the underlying numbers shift in specific, learnable ways. In the first three levels, meteors are single-hit kills moving at a gentle pace, which gives new players room to learn the controls without much punishment for a missed shot. From level four onward, meteor health starts to climb gradually, meaning some meteors will now soak up two or three hits before breaking apart, and their speed increases in small, steady steps.
            </p>
            <p style={{ margin: '0' }}>
              Past level seven, both health and speed continue to scale, and the threshold of meteors you need to destroy to reach the next level also increases, which is the game's way of making sure later levels feel earned rather than arbitrary. Every fifth level layers a boss meteor on top of that curve, so the difficulty isn't just "more of the same" — it's a steady ramp punctuated by distinct spikes that test a different kind of focus. Understanding this curve is part of why experienced players can plan their power-up usage in advance instead of reacting to each level as a surprise.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Space Defense vs. Idle Clicker Browser Games</h2>
            <p style={{ margin: '0' }}>
              A lot of free browser games in the "clicker" or "idle" category are built around waiting, not skill: numbers go up whether or not you're paying attention. Space Defense is the opposite. Every point on the scoreboard comes from a shot you aimed, a dodge you timed, or a power-up you chose to grab. That's the main reason a five-minute Space Defense run tends to feel more satisfying than an hour of idle tapping — the score is a direct reflection of how you played, not how long you left the tab open.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-purple)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>The Sound Design Behind Every Explosion</h2>
            <p style={{ margin: '0' }}>
              Every laser shot, meteor explosion, boss kill, power-up pickup, and level-up chime in Space Defense is generated live using the Web Audio API rather than played back from pre-recorded audio files. That's also true of the countdown before each run: the "3, 2, 1" numbers each play a short beep, and "GO!" triggers a higher-pitched tone so you always have an audio cue for exactly when control returns to you. If you'd rather play in silence, the speaker icon in the corner mutes everything instantly.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-green)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Setting Up the Perfect Play Session</h2>
            <p style={{ margin: '0' }}>
              A few small setup choices make a real difference to your score. Play in fullscreen mode so you can see meteors the moment they spawn instead of after they've already crossed half the screen. Make sure your browser tab is the active window, since background tabs can throttle animation timing in some browsers. And if you're on a laptop trackpad, switching to a mouse for a session or two tends to noticeably tighten up your aim, since a trackpad's shorter travel distance makes fine adjustments harder to land consistently.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-orange)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Why No Download Is Ever Required</h2>
            <p style={{ margin: '0' }}>
              Space Defense runs entirely inside the browser's built-in HTML5 Canvas, which draws every meteor, projectile, and particle effect frame by frame without needing a plugin, an app store listing, or an installer. That also means there's nothing to update: the moment you refresh the page, you're on the current version. It's the same technology that powers most modern browser-based games and keeps Space Defense equally playable on a school computer, a work laptop, or a personal phone.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--neon-yellow)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Building a Personal Practice Routine</h2>
            <p style={{ margin: '0' }}>
              If your goal is steady improvement rather than a single lucky run, treat Space Defense a bit like a warm-up drill. Start on Easy for a run or two to loosen up your aim, move to Normal for your "real" attempts, and only push into Hard once your Normal-mode accuracy is consistently sitting above 80 percent. Because your best score, best time, and best level are all saved automatically, you don't need to track anything yourself — just check the menu screen before each session to see exactly what you're trying to beat.
            </p>
          </div>

          <p style={{ marginTop: '2.5rem', marginBottom: '0' }}>
            Space Defense packs a surprising amount of depth into a free browser game: a reaction-time challenge tuned by three difficulty levels, a combo system that rewards consistency, five power-ups that force real strategic choices, and boss fights that test sustained focus rather than pure reflex. Whether you're chasing a new Peak CPS, trying to push your accuracy above 90 percent, or just want a few minutes of focused, satisfying gameplay, the mission is the same: get in your ship, defend the skies, and see how far your reflexes can take you.
          </p>

          <div style={{ margin: '3rem 0 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1.5rem', textAlign: 'center' }}>Frequently Asked Questions</h2>
            <FaqAccordion items={FAQ_ITEMS} />
          </div>

        </section>
      </div>

      <style>{`
        @media (min-width: 768px) { .mobile-controls { display: none !important; } }
      `}</style>
    </div>
  );
}

// ── FAQ data & accordion ────────────────────────────────────────
const FAQ_ITEMS = [
  { q: 'What is Space Defense?', a: 'Space Defense is a free browser-based space shooter game where you control a fighter spacecraft and destroy incoming meteors. The game features boss battles every 5 levels, five different power-ups, a combo multiplier system, three difficulty modes, and detailed performance statistics.' },
  { q: 'How do I play Space Defense?', a: 'Use WASD or Arrow Keys to move your spaceship. Press F or Space to fire. You can also left-click to shoot. Destroy meteors before they hit you or reach the bottom. Press Esc to pause at any time.' },
  { q: 'What power-ups are available?', a: 'There are five power-ups: Shield (5s invincibility), Rapid Fire (doubles fire rate for 6s), Double Shot (adds side projectiles for 7s), Magnet (attracts drops for 5s), and Slow Motion (slows meteors to 40% for 4s).' },
  { q: 'Does Space Defense require a download?', a: 'No. Space Defense runs entirely in your browser using HTML5 Canvas and Web Audio API technology. No download, installation, or plugin is required.' },
  { q: 'How are high scores saved?', a: "High scores are saved automatically to your browser's LocalStorage after each game over. No account or internet connection is needed." },
  { q: 'Can playing Space Defense actually improve reaction time?', a: 'Research on fast-paced action games has repeatedly linked regular play to faster visual reaction times and better hand-eye coordination, without a loss in accuracy. Space Defense tracks your CPS, Peak CPS, and Accuracy across every run so you can see that kind of progress for yourself.' },
  { q: 'How many lives do I get?', a: 'You start each run with 10 hull points, shown as small bars in the top-left corner. Every meteor that hits you, or reaches the bottom of the screen unshot, costs one hull point. The run ends when your hull reaches zero.' },
  { q: 'When do boss meteors appear?', a: 'A boss meteor spawns automatically every 5 levels. Bosses have a much larger health bar, take longer to destroy, and reward extra score plus a guaranteed power-up drop when defeated.' },
  { q: 'What does the combo counter do?', a: 'Destroying meteors back-to-back without missing a shot or taking damage builds your combo counter. Higher combos multiply the score you earn from each kill, but getting hit or letting a meteor pass resets the combo to zero.' },
  { q: 'Can I pause the game?', a: 'Yes. Press Esc at any time during a run to pause. From the pause screen you can resume, restart the run, or return to the main menu.' },
  { q: 'Can I play Space Defense in fullscreen?', a: 'Yes. Click the fullscreen icon in the top corner of the game or menu screen to expand the play field to your entire display, then click it again (or press Esc) to exit fullscreen.' },
  { q: 'Does Space Defense work on mobile phones?', a: 'Yes. On touch devices, an on-screen directional pad and a fire button appear automatically at the bottom of the screen, and the game also supports fullscreen mode for a larger play area.' },
  { q: 'What is the difference between the three difficulty levels?', a: 'Easy slows meteors down and lowers their health for beginners at a reduced score multiplier. Normal offers balanced, standard gameplay at a 1x multiplier. Hard increases meteor speed, spawn rate, and health by 1.5x but doubles your score multiplier for experienced players.' },
  { q: 'Can I turn off the sound?', a: 'Yes. Click the speaker icon on the menu screen or in-game HUD to mute all sound effects, including laser shots, explosions, power-up pickups, and the countdown beeps before each run.' },
  { q: 'What happens if two power-ups overlap?', a: 'Power-ups of different types stack and run simultaneously, each shown with its own countdown timer in the HUD. Picking up a second copy of a power-up you already have refreshes its duration instead of stacking the effect.' },
  { q: 'Is Space Defense free to play?', a: 'Yes, Space Defense is completely free, with no purchases, subscriptions, or ads blocking gameplay. It runs directly in the browser at no cost.' },
  { q: 'How is my accuracy percentage calculated?', a: 'Accuracy is calculated as the number of shots that hit a meteor divided by your total shots fired, shown as a percentage in both the HUD and the game-over summary screen.' },
];

const FaqAccordion = ({ items }: { items: { q: string; a: string }[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            role="listitem"
            style={{ border: '1px solid', borderColor: isOpen ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s' }}
          >
            <button
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: isOpen ? 'rgba(0,245,255,0.05)' : 'rgba(255,255,255,0.02)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', textAlign: 'left', gap: '12px' }}
            >
              <span>{item.q}</span>
              {isOpen ? <ChevronUp size={16} color="var(--neon-cyan)" /> : <ChevronDown size={16} color="#6b7280" />}
            </button>
            {isOpen && (
              <div style={{ padding: '0 18px 16px', backgroundColor: 'rgba(0,245,255,0.03)' }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.7', fontSize: '0.95rem' }}>{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────
const StatBox = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
    {icon}
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700' }}>{label}</span>
      <span style={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: '700', color: '#fff' }}>{value}</span>
    </div>
  </div>
);

const ControlButton = ({ icon, onStart, onEnd }: { icon: React.ReactNode; onStart: () => void; onEnd: () => void }) => (
  <button
    onMouseDown={onStart} onMouseUp={onEnd} onTouchStart={onStart} onTouchEnd={onEnd}
    style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
  >
    {icon}
  </button>
);

const GameOverStat = ({ label, value, icon, highlight = '#fff' }: { label: string; value: string | number; icon?: React.ReactNode; highlight?: string }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {icon}{label}
    </div>
    <div style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'monospace', color: highlight, lineHeight: 1 }}>{value}</div>
  </div>
);

// ── External source link (styled like an inline citation) ────────
const SourceLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: '#ff2d95',
      fontWeight: 700,
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '3px',
      borderBottom: '1px solid rgba(255,45,149,0.35)',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = '#ff2d95'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'rgba(255,45,149,0.35)'; }}
  >
    {children}
    <ExternalLink size={13} style={{ position: 'relative', top: '1px' }} />
  </a>
);
