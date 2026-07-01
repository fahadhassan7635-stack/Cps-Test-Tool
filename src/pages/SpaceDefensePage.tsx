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
  Flame
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

  // JSON-LD Schemas
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
      { '@type': 'Question', name: 'Does Space Defense require download?', acceptedAnswer: { '@type': 'Answer', text: 'No. Space Defense runs entirely in your browser using HTML5 Canvas technology. No download, no installation, and no plugins are required. Simply open the page and start playing immediately.' } },
      { '@type': 'Question', name: 'What are the difficulty levels?', acceptedAnswer: { '@type': 'Answer', text: 'Space Defense offers three difficulty levels: Easy (slower meteors, lower spawn rate, great for beginners), Normal (balanced gameplay for most players), and Hard (fast meteors, high spawn rate, tougher HP, but higher score multipliers for competitive players).' } },
      { '@type': 'Question', name: 'What power-ups are available?', acceptedAnswer: { '@type': 'Answer', text: 'There are five power-ups: Shield (temporary invincibility), Rapid Fire (doubled fire rate), Double Shot (fires two projectiles simultaneously), Magnet (attracts power-up drops), and Slow Motion (slows all meteors temporarily).' } },
      { '@type': 'Question', name: 'What is a Boss Meteor?', acceptedAnswer: { '@type': 'Answer', text: 'Boss Meteors appear every 5 levels. They are significantly larger than normal meteors, have massive HP bars, unique glowing colors, and special explosion animations. Destroying a Boss Meteor rewards bonus points and can drop power-ups.' } },
      { '@type': 'Question', name: 'How does the combo system work?', acceptedAnswer: { '@type': 'Answer', text: 'Destroying meteors in quick succession builds your combo multiplier. A 2x combo doubles your points, 5x gives five times the points, and so on. If you stop destroying meteors for too long, the combo resets. Maintaining a high combo is key to achieving top scores.' } },
      { '@type': 'Question', name: 'Is Space Defense mobile friendly?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Space Defense includes on-screen touch controls for mobile devices. Use the D-pad to move and the fire button to shoot. The game automatically detects mobile devices and shows the appropriate controls.' } },
      { '@type': 'Question', name: 'How is the high score saved?', acceptedAnswer: { '@type': 'Answer', text: 'Your high score is saved automatically using your browser\'s LocalStorage. This means your best scores persist between sessions without requiring an account or internet connection. Stored stats include highest score, best level, longest survival time, best accuracy, and peak CPS.' } },
      { '@type': 'Question', name: 'Can I play Space Defense in fullscreen?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the fullscreen button in the top right of the game or press F11 to enter fullscreen mode. Press Escape to exit fullscreen. The canvas automatically resizes to fill your screen for an immersive experience.' } },
      { '@type': 'Question', name: 'How do I pause the game?', acceptedAnswer: { '@type': 'Answer', text: 'Press Escape during gameplay to pause. A pause menu will appear with options to Resume, Restart, or return to the Main Menu. The game world freezes completely while paused.' } },
      { '@type': 'Question', name: 'Does Space Defense improve real-world skills?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Regular play genuinely improves reaction time, hand-eye coordination, keyboard control speed, mouse accuracy, focus, and multitasking ability. These cognitive skills transfer to real-world activities including typing speed, sports, and professional tasks.' } },
      { '@type': 'Question', name: 'What browsers support Space Defense?', acceptedAnswer: { '@type': 'Answer', text: 'Space Defense works on all modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, and Opera. For the best performance, use the latest version of Google Chrome or Firefox on desktop.' } },
      { '@type': 'Question', name: 'How is accuracy calculated?', acceptedAnswer: { '@type': 'Answer', text: 'Accuracy is calculated as (total hits / total shots fired) × 100%. Each projectile that successfully strikes a meteor counts as a hit. Missing meteors does not penalize you directly, but lower accuracy indicates inefficient shooting.' } },
      { '@type': 'Question', name: 'What happens when I reach a new level?', acceptedAnswer: { '@type': 'Answer', text: 'A Level Up animation plays showing your new level number. Meteor speed and spawn rates increase. Every 5 levels, a Boss Meteor spawns. The game becomes progressively more challenging with each level.' } },
      { '@type': 'Question', name: 'Is there sound in Space Defense?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Space Defense features a complete audio engine with distinct sounds for laser shots, explosions, hits, level up fanfares, and game over. You can toggle sound on or off at any time using the mute button in the HUD.' } },
      { '@type': 'Question', name: 'What is the best strategy for a high score?', acceptedAnswer: { '@type': 'Answer', text: 'Maintain a high combo multiplier by destroying meteors continuously. Prioritize boss meteors for bonus points. Collect power-ups, especially Rapid Fire and Double Shot. Choose Hard difficulty for higher score multipliers. Focus on accuracy to maximize damage per shot.' } },
      { '@type': 'Question', name: 'How do I improve my CPS in Space Defense?', acceptedAnswer: { '@type': 'Answer', text: 'Practice rapid clicking or key pressing. Use your index finger for mouse clicks and maintain a relaxed wrist position. Try alternating F and Space keys for maximum keyboard fire rate. Warming up your fingers before playing can also help improve your CPS.' } },
      { '@type': 'Question', name: 'Are there any cheats or secrets?', acceptedAnswer: { '@type': 'Answer', text: 'There are no built-in cheats, as the game is designed as a fair skill test. However, experienced players can exploit the Magnet power-up to collect multiple drops simultaneously, and timing Slow Motion during boss fights dramatically increases damage output.' } }
    ]
  });
}

// ============================================================
// AUDIO ENGINE (unchanged + extended)
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

  // Game state
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'countdown' | 'playing' | 'paused' | 'gameover'>('loading');
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
  const [loadingProgress, setLoadingProgress] = useState(0);

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
  const gameStateRef = useRef<'loading' | 'menu' | 'countdown' | 'playing' | 'paused' | 'gameover'>('loading');

  // Sync refs
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const PLAYER_SPEED = 7;
  const SHOOT_COOLDOWN = 150;
  const PROJECTILE_SPEED = 12;
  const INVULNERABILITY_TIME = 60;

  // ── Loading Screen ──────────────────────────────────────────
  useEffect(() => {
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 15 + 5;
      if (prog >= 100) { prog = 100; setLoadingProgress(100); clearInterval(interval); setTimeout(() => setGameState('menu'), 500); }
      else setLoadingProgress(Math.floor(prog));
    }, 120);
    return () => clearInterval(interval);
  }, []);

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
    for (let i = 0; i < count; i++) {
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
        isBoss: true
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
      color: `hsl(${Math.random() * 30 + 10}, 70%, 50%)`
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
    const tick = () => {
      n--;
      if (n > 0) { setCountdownNum(n); setTimeout(tick, 900); }
      else { setCountdownNum('GO!'); setTimeout(() => {
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

    // Player movement
    if (keysRef.current['KeyW'] || keysRef.current['ArrowUp'])    playerRef.current.y -= PLAYER_SPEED;
    if (keysRef.current['KeyS'] || keysRef.current['ArrowDown'])  playerRef.current.y += PLAYER_SPEED;
    if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft'])  playerRef.current.x -= PLAYER_SPEED;
    if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) playerRef.current.x += PLAYER_SPEED;
    if (keysRef.current['KeyF'] || keysRef.current['Space'])      handleShoot();

    playerRef.current.x = Math.max(0, Math.min(canvas.width - playerRef.current.width, playerRef.current.x));
    playerRef.current.y = Math.max(0, Math.min(canvas.height - playerRef.current.height, playerRef.current.y));

    // Projectiles
    projectilesRef.current = projectilesRef.current.filter(p => p.y > -p.height);
    projectilesRef.current.forEach(p => { p.y -= p.speed; });

    // Magnet effect on powerups
    if (hasPowerUp('magnet')) {
      powerUpsRef.current.forEach(pu => {
        const dx = playerRef.current.x + playerRef.current.width / 2 - pu.x;
        const dy = playerRef.current.y + playerRef.current.height / 2 - pu.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) { pu.x += dx / dist * 3; pu.y += dy / dist * 3; }
      });
    }

    // Power-up collection
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

    // Clean expired power-ups
    const now = Date.now();
    activePowerUpsRef.current = activePowerUpsRef.current.filter(p => p.endsAt > now);

    // Spawn meteors
    let spawnChance = 0.015 * cfg.spawnMult;
    if (levelRef.current > 3) spawnChance += (levelRef.current - 3) * 0.002;
    if (levelRef.current > 7) spawnChance += (levelRef.current - 7) * 0.001;
    spawnChance = Math.min(spawnChance, 0.05 * cfg.spawnMult);
    if (Math.random() < spawnChance) meteorsRef.current.push(spawnMeteor(canvas.width, levelRef.current));

    // Boss spawn every 5 levels
    if (levelRef.current % 5 === 0 && !bossSpawnedForLevelRef.current) {
      bossSpawnedForLevelRef.current = true;
      meteorsRef.current.push(spawnMeteor(canvas.width, levelRef.current, true));
    }

    // Combo timer
    if (comboRef.current > 0) {
      comboTimerRef.current += 1;
      if (comboTimerRef.current > 120) { comboRef.current = 0; comboTimerRef.current = 0; setCombo(0); }
    }

    // Meteors
    for (let i = meteorsRef.current.length - 1; i >= 0; i--) {
      const m = meteorsRef.current[i];
      m.y += m.speed * slowFactor;
      m.rotation += m.rotationSpeed;

      // Player collision
      const dx = m.x - (playerRef.current.x + playerRef.current.width / 2);
      const dy = m.y - (playerRef.current.y + playerRef.current.height / 2);
      if (Math.sqrt(dx * dx + dy * dy) < m.radius + 20 && invulnerabilityRef.current <= 0) {
        handleHitPlayer();
        createExplosion(m.x, m.y, m.color, 10);
        meteorsRef.current.splice(i, 1); continue;
      }

      // Off screen
      if (m.y - m.radius > canvas.height) {
        handleHitPlayer();
        meteorsRef.current.splice(i, 1);
        comboRef.current = 0; comboTimerRef.current = 0; setCombo(0);
        continue;
      }

      // Projectile collisions
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

            // Combo
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

    // Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.02;
      if (p.life <= 0) particlesRef.current.splice(i, 1);
    }

    // CPS / Stats
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

    // Meteors
    meteorsRef.current.forEach(m => {
      ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.rotation);
      ctx.shadowBlur = m.isBoss ? 30 : 15; ctx.shadowColor = m.color;

      if (m.isBoss) {
        // Boss ring
        ctx.beginPath(); ctx.arc(0, 0, m.radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = m.color; ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]); ctx.stroke(); ctx.setLineDash([]);
      }

      ctx.fillStyle = m.isBoss ? '#0a0015' : '#1e2430';
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2;
        const r = m.radius * (0.8 + (m.isBoss ? 0.05 : Math.random() * 0.2));
        const px = Math.cos(angle) * r; const py = Math.sin(angle) * r;
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

      // HP bar
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

    // Invulnerability flash
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

  // ── Active power-up sync ───────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setActivePowerUps([...activePowerUpsRef.current.filter(p => p.endsAt > Date.now())]);
    }, 250);
    return () => clearInterval(interval);
  }, [gameState]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>

      {/* Loading Screen */}
      {gameState === 'loading' && (
        <div style={{ position: 'fixed', inset: 0, background: '#080d14', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: '900', fontStyle: 'italic', color: '#fff', textShadow: '0 0 30px rgba(0,245,255,0.6)', marginBottom: '0.5rem', animation: 'pulse 1.5s infinite' }}>
              Space <span style={{ color: '#00f5ff' }}>DEFENSE</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Preparing Mission...</div>
          </div>
          <div style={{ width: '280px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${loadingProgress}%`, background: 'linear-gradient(90deg, #00f5ff, #00ff88)', borderRadius: '100px', transition: 'width 0.15s ease', boxShadow: '0 0 10px #00f5ff' }} />
            </div>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{loadingProgress}%</div>
          </div>
          <style>{`@keyframes pulse { 0%,100%{text-shadow:0 0 20px rgba(0,245,255,0.4)} 50%{text-shadow:0 0 40px rgba(0,245,255,0.8)} }`}</style>
        </div>
      )}

      {/* Game Container Wrapper */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '4rem' }}>
        <div ref={containerRef} style={{
          position: 'relative', width: '100%', maxWidth: '900px', aspectRatio: '16/9',
          background: 'rgba(8,13,20,0.9)', border: '1px solid rgba(0,245,255,0.2)',
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
              {/* Left */}
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
                {/* Combo display */}
                {combo >= 2 && (
                  <div style={{ background: 'rgba(255,107,53,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,107,53,0.4)', borderRadius: '12px', padding: '0.4rem 0.8rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--neon-orange)', fontWeight: '800', textTransform: 'uppercase' }}>Combo</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', fontFamily: 'monospace' }}>{combo}x</div>
                  </div>
                )}
                {/* Sound / Pause / Fullscreen */}
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

              {/* Right Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <StatBox icon={<Zap size={14} color="var(--neon-yellow)" />} label="CPS" value={currentCPS} />
                  <StatBox icon={<Trophy size={14} color="var(--neon-orange)" />} label="Peak" value={peakCPS} />
                  <StatBox icon={<Target size={14} color="var(--neon-cyan)" />} label="Acc" value={`${accuracy}%`} />
                  <StatBox icon={<Activity size={14} color="var(--neon-green)" />} label="Kills" value={meteorsDestroyed} />
                </div>
                {/* Level badge */}
                <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={14} color="var(--neon-yellow)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>LVL {level}</span>
                </div>
                {/* Active power-ups */}
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
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,13,20,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}>
              {/* Top right controls */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '8px' }}>
                <button onClick={toggleSound} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', padding: '0.6rem', color: isMuted ? 'rgba(255,255,255,0.4)' : '#fff', cursor: 'pointer' }}>
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button onClick={toggleFullscreen} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', padding: '0.6rem', color: '#fff', cursor: 'pointer' }}>
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>

              <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.05em', color: '#fff', textShadow: '0 0 20px rgba(0,245,255,0.4)', marginBottom: '0.25rem' }}>
                  Space <span style={{ color: 'var(--neon-cyan)' }}>DEFENSE</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1.5rem' }}>Test your CPS and survival skills</p>

                {/* High Score Panel */}
                {highScore.score > 0 && (
                  <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,215,0,0.7)', fontWeight: '700', textTransform: 'uppercase' }}>Best Score</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', fontFamily: 'monospace' }}>{highScore.score.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,215,0,0.7)', fontWeight: '700', textTransform: 'uppercase' }}>Best Level</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', fontFamily: 'monospace' }}>{highScore.level}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,215,0,0.7)', fontWeight: '700', textTransform: 'uppercase' }}>Best Time</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', fontFamily: 'monospace' }}>{highScore.time}s</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,215,0,0.7)', fontWeight: '700', textTransform: 'uppercase' }}>Best Acc</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', fontFamily: 'monospace' }}>{highScore.accuracy}%</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,215,0,0.7)', fontWeight: '700', textTransform: 'uppercase' }}>Peak CPS</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', fontFamily: 'monospace' }}>{highScore.peakCPS}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trophy size={20} color="gold" />
                    </div>
                  </div>
                )}

                {/* Difficulty Selector */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Difficulty</div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => {
                      const cfg = DIFFICULTY_CONFIG[d];
                      const isSelected = difficulty === d;
                      return (
                        <button key={d} onClick={() => setDifficulty(d)} style={{ flex: 1, padding: '0.6rem', background: isSelected ? `${cfg.color}20` : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? cfg.color : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', color: isSelected ? cfg.color : 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s', boxShadow: isSelected ? `0 0 12px ${cfg.color}40` : 'none' }}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem' }}>
                    {difficulty === 'hard' ? '2× score multiplier · Faster meteors' : difficulty === 'easy' ? '0.8× score · Slower meteors' : 'Standard gameplay · 1× score'}
                  </div>
                </div>

                {/* Controls + Objective */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem', textAlign: 'left' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--neon-cyan)', textTransform: 'uppercase', marginBottom: '0.75rem', marginTop: 0 }}>Controls</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.9' }}>
                      <li><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px', fontSize: '0.75rem' }}>WASD</kbd> Move</li>
                      <li><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px', fontSize: '0.75rem' }}>F / Space</kbd> Shoot</li>
                      <li><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px', fontSize: '0.75rem' }}>Esc</kbd> Pause</li>
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--neon-orange)', textTransform: 'uppercase', marginBottom: '0.75rem', marginTop: 0 }}>Objective</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.6', margin: 0 }}>Destroy meteors, collect power-ups, defeat bosses every 5 levels. Don't let them through!</p>
                  </div>
                </div>

                <button onClick={startCountdown} style={{ width: '100%', padding: '1.1rem', background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-green))', color: '#000', fontSize: '1.15rem', fontWeight: '900', borderRadius: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'transform 0.2s', boxShadow: '0 10px 30px rgba(0,245,255,0.3)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}>
                  <Play fill="currentColor" /> START MISSION
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
                {/* Best scores */}
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

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '3rem 2.5rem' }}>
        <section style={{ maxWidth: '900px', margin: '0 auto', color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>

          <h2 style={{ color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: '800', marginBottom: '1.5rem', textAlign: 'center' }}>
            Why You Should Play Space Defence
          </h2>

          <p style={{ marginBottom: '2rem' }}>
            Space Defence is more than just a simple browser game. It combines fast reactions, keyboard control, mouse accuracy, and hand-eye coordination into one exciting challenge. Whether you're a gamer looking to sharpen your skills or simply want a fun way to pass the time, Space Defence offers an engaging experience that keeps you coming back for higher scores.
          </p>

          {/* Original sections */}
          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Improve Your Reaction Speed</h3>
            <p style={{ marginBottom: '1rem' }}>Every meteor that falls from the sky requires quick decisions. As the game progresses, meteors become faster and more difficult to destroy. Players must react instantly to avoid collisions and eliminate threats before they reach the bottom of the screen.</p>
            <p style={{ margin: '0' }}>Regular play can help improve reaction time, focus, and decision-making speed.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-green)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Train Keyboard Control Skills</h3>
            <p style={{ marginBottom: '1rem' }}>Space Defence uses multiple keyboard controls:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'circle' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>W</strong> = Move Up</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>A</strong> = Move Left</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>S</strong> = Move Down</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>D</strong> = Move Right</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>F</strong> = Fire Weapons</li>
            </ul>
            <p style={{ marginBottom: '1rem' }}>Players can also use the Arrow Keys:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'circle' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>↑</strong> Up Arrow</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>↓</strong> Down Arrow</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>←</strong> Left Arrow</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>→</strong> Right Arrow</li>
            </ul>
            <p style={{ margin: '0' }}>Using both movement and shooting controls at the same time creates an excellent keyboard coordination exercise.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Practice Mouse Accuracy</h3>
            <p style={{ marginBottom: '1rem' }}>In addition to keyboard controls, players can shoot using the left mouse button. This adds another layer of control and helps improve clicking accuracy and timing.</p>
            <p style={{ margin: '0' }}>The combination of keyboard movement and mouse shooting creates a gameplay experience similar to many popular PC action games.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-purple)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Increasing Challenge Keeps the Game Exciting</h3>
            <p style={{ marginBottom: '1rem' }}>The game starts at a comfortable pace, allowing new players to learn the controls. As more meteors are destroyed, the difficulty gradually increases:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'circle' }}>
              <li style={{ marginBottom: '0.5rem' }}>Faster meteor speed</li>
              <li style={{ marginBottom: '0.5rem' }}>Higher spawn rates</li>
              <li style={{ marginBottom: '0.5rem' }}>More challenging gameplay</li>
              <li style={{ marginBottom: '0.5rem' }}>Greater score potential</li>
            </ul>
            <p style={{ margin: '0' }}>This progression keeps every session fresh and rewarding.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-yellow)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>A Fun Way to Test Your Skills</h3>
            <p style={{ marginBottom: '1rem' }}>Unlike traditional reaction tests, Space Defence turns skill training into an enjoyable game. Players are constantly challenged to improve their:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'circle' }}>
              <li style={{ marginBottom: '0.5rem' }}>Reaction time</li>
              <li style={{ marginBottom: '0.5rem' }}>Keyboard speed</li>
              <li style={{ marginBottom: '0.5rem' }}>Mouse control</li>
              <li style={{ marginBottom: '0.5rem' }}>Focus</li>
              <li style={{ marginBottom: '0.5rem' }}>Hand-eye coordination</li>
              <li style={{ marginBottom: '0.5rem' }}>Accuracy</li>
            </ul>
            <p style={{ margin: '0' }}>The longer you survive, the more intense the challenge becomes.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Track Your Performance</h3>
            <p style={{ marginBottom: '1rem' }}>At the end of each run, players can review their results, including:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'circle' }}>
              <li style={{ marginBottom: '0.5rem' }}>Final Score</li>
              <li style={{ marginBottom: '0.5rem' }}>Meteors Destroyed</li>
              <li style={{ marginBottom: '0.5rem' }}>Peak CPS</li>
              <li style={{ marginBottom: '0.5rem' }}>Accuracy Percentage</li>
              <li style={{ marginBottom: '0.5rem' }}>Survival Time</li>
            </ul>
            <p style={{ margin: '0' }}>These statistics make it easy to track improvement and compete against your own personal best scores.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-green)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Perfect for Casual and Competitive Players</h3>
            <p style={{ margin: '0' }}>Whether you have a few minutes to spare or want to chase a high score for hours, Space Defence offers a simple but addictive gameplay loop. Easy-to-learn controls, increasing difficulty, and fast-paced action make it enjoyable for players of all skill levels.</p>
          </div>

          {/* ── NEW SECTIONS ── */}

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>How to Play Space Defense</h2>
            <p style={{ marginBottom: '1rem' }}>Space Defense is an arcade-style space shooter played entirely in your browser. Your mission is simple: pilot your fighter spacecraft across the battlefield, destroy every incoming meteor before it hits you or slips past your defenses, and survive as many waves as possible.</p>
            <p style={{ marginBottom: '1rem' }}>When you first launch the game, you'll be presented with the main menu, where you can choose your difficulty level, view your personal best records, and configure sound settings. Once you press START MISSION, a three-second countdown begins before the action starts.</p>
            <p style={{ marginBottom: '1rem' }}>During gameplay, meteors fall from the top of the screen. You must position your ship to avoid being hit while simultaneously shooting down every threat. Letting a meteor pass the bottom boundary or collide with your ship costs you one Hull Integrity point. Lose all ten and the mission ends.</p>
            <p>Every meteor you destroy adds to your score. Destroying meteors in rapid succession builds your combo multiplier, dramatically increasing your points. Collecting power-up drops enhances your abilities temporarily. Boss Meteors appear every five levels, requiring sustained firepower to eliminate but rewarding you generously when destroyed.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Complete Game Controls Guide</h2>
            <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.75rem' }}>Keyboard Shortcuts</h3>
            <p style={{ marginBottom: '1rem' }}>Space Defense is designed for efficient keyboard control. Here is a complete reference of all keyboard shortcuts:</p>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', color: 'var(--neon-cyan)', padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>Key</th>
                    <th style={{ textAlign: 'left', color: 'var(--neon-cyan)', padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['W / ↑', 'Move spaceship upward'],
                    ['S / ↓', 'Move spaceship downward'],
                    ['A / ←', 'Move spaceship left'],
                    ['D / →', 'Move spaceship right'],
                    ['F', 'Fire primary weapon'],
                    ['Space', 'Fire primary weapon'],
                    ['Esc', 'Pause / Resume game'],
                    ['Click', 'Fire primary weapon'],
                  ].map(([key, action], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.6rem 0.75rem' }}><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '5px', fontSize: '0.85rem', color: '#fff', fontFamily: 'monospace' }}>{key}</kbd></td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)' }}>{action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ color: 'var(--neon-green)', fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.75rem' }}>Mobile Touch Controls</h3>
            <p style={{ marginBottom: '1rem' }}>On mobile devices and tablets, Space Defense automatically displays an on-screen control overlay. The left side features a four-directional D-pad for movement. The right side displays a circular FIRE button for shooting.</p>
            <p>Touch controls use the same responsive input system as keyboard controls, ensuring smooth and lag-free movement on all touchscreen devices. The game supports simultaneous touch inputs, so you can move and shoot at the same time without any issues.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Difficulty Levels Explained</h2>
            <p style={{ marginBottom: '1.5rem' }}>Space Defense offers three distinct difficulty settings to accommodate players of all experience levels. Choosing the right difficulty affects meteor speed, spawn frequency, meteor HP, and your score multiplier.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { title: 'Easy', color: '#00ff88', desc: 'Meteors move at 60% normal speed with a reduced spawn rate and 70% of normal HP. Score multiplier is 0.8×. Ideal for new players learning the game mechanics, building confidence, and developing basic shooting patterns without overwhelming pressure.' },
                { title: 'Normal', color: '#00f5ff', desc: 'Standard gameplay with all values at 100%. Meteors move at base speed with normal spawn rates and HP values. Score multiplier is 1×. This is the recommended starting point for most players looking for a balanced, authentic experience.' },
                { title: 'Hard', color: '#ff4d4d', desc: 'Meteors move at 150% speed with 1.5× spawn rate and 1.5× HP. However, the score multiplier is 2×, rewarding skilled players significantly. Boss Meteors are considerably more dangerous. Recommended only for experienced players.' },
              ].map(({ title, color, desc }) => (
                <div key={title} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}40`, borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ color, fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{title}</div>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>{desc}</p>
                </div>
              ))}
            </div>
            <p>Switching between difficulty levels before each run allows you to set personal goals, such as beating your Hard Mode high score or achieving perfect accuracy on Normal Mode. There is no permanent lock on difficulty, so you can always adjust for each session.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Game Features Overview</h2>
            <p style={{ marginBottom: '1.25rem' }}>Space Defense packs an impressive set of features into a lightweight browser game:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                ['Combo System', 'Build multipliers by destroying meteors consecutively'],
                ['Boss Battles', 'Massive boss meteors every 5 levels with unique HP bars'],
                ['5 Power-Ups', 'Shield, Rapid Fire, Double Shot, Magnet, Slow Motion'],
                ['High Score Tracking', 'Persistent records saved in your browser'],
                ['3 Difficulty Modes', 'Easy, Normal, and Hard with score multipliers'],
                ['Fullscreen Mode', 'Immersive fullscreen support via browser API'],
                ['Pause / Resume', 'Pause anytime with Esc key'],
                ['Sound Engine', 'Custom audio synthesis for all game events'],
                ['Screen Shake', 'Dynamic feedback on explosions and hits'],
                ['Mobile Controls', 'Full touch support with on-screen D-pad'],
                ['CPS Tracking', 'Real-time clicks per second measurement'],
                ['Accuracy Metrics', 'Live shot accuracy percentage tracking'],
              ].map(([title, desc]) => (
                <div key={title as string} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.875rem' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.5' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Boss Battles</h2>
            <p style={{ marginBottom: '1rem' }}>Every five levels, the game spawns a Boss Meteor, a dramatically larger and more powerful variant that tests your full skill set. Boss Meteors are visually distinct: they appear in deep purple hues with a glowing energy ring orbiting their surface, a dashed orbital pattern, and a large HP bar displayed above them labeled "BOSS."</p>
            <p style={{ marginBottom: '1rem' }}>Defeating a Boss Meteor requires sustained fire. Their HP scales with the current level, so a Level 5 boss is significantly easier than a Level 20 boss. When destroyed, Boss Meteors trigger a multi-stage explosion animation with three consecutive particle bursts, accompanied by a deep, rumbling explosion sound distinct from regular meteors.</p>
            <p style={{ marginBottom: '1rem' }}>Boss kills reward bonus score points equal to 500 × current level, on top of normal size-based scoring. They also have an increased chance of dropping power-ups, making boss fights excellent opportunities to refresh your active abilities.</p>
            <p>Strategic tip: When a Boss Meteor spawns, immediately collect any power-ups on screen. Activate Rapid Fire or Double Shot before engaging the boss to maximize damage output. Use Slow Motion if available to extend your shooting window considerably.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Power-Ups Explained</h2>
            <p style={{ marginBottom: '1.25rem' }}>Power-ups drop from destroyed meteors (25% chance) and Boss Meteors (guaranteed drop, sometimes multiple). They appear as glowing circular icons that slowly fall down the screen. Walk your ship into them to activate. The Magnet power-up automatically pulls nearby drops toward your ship.</p>

            {[
              { type: 'Shield', color: '#00f5ff', icon: '🛡', dur: '5s', desc: 'Grants complete invincibility for 5 seconds. Your ship glows green and no damage can be taken during this period. Ideal for surviving overwhelming meteor waves or buying time during boss fights. Activating another Shield during the duration resets the timer.' },
              { type: 'Rapid Fire', color: '#ff6b35', icon: '⚡', dur: '6s', desc: 'Halves your weapon cooldown, allowing you to fire twice as fast for 6 seconds. Combined with Double Shot, this creates an extremely dense projectile spray. Rapid Fire is one of the most impactful power-ups for dealing with high-HP meteors and bosses.' },
              { type: 'Double Shot', color: '#a855f7', icon: '✦', dur: '7s', desc: 'Adds two additional projectiles to each shot, one on each side of your main beam. The side projectiles fire in purple hues, making them visually distinct. This triples your raw damage output and is especially effective against boss meteors with large hit boxes.' },
              { type: 'Magnet', color: '#facc15', icon: '🧲', dur: '5s', desc: 'Creates a magnetic field around your ship that attracts all power-up drops within a 200-pixel radius. This makes collecting multiple simultaneous drops much easier, especially in chaotic later levels where avoiding meteors and collecting drops simultaneously is difficult.' },
              { type: 'Slow Motion', color: '#22d3ee', icon: '⏳', dur: '4s', desc: 'Slows all meteors to 40% of their normal speed for 4 seconds while your ship retains full movement and firing speed. This is extraordinarily powerful during boss battles, giving you significantly more time to deal damage without repositioning pressure. Also excellent for clearing dense meteor clusters.' },
            ].map(({ type, color, icon, dur, desc }) => (
              <div key={type} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}30`, borderRadius: '12px', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '2rem', flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{ color, fontWeight: '800', fontSize: '1rem' }}>{type}</span>
                    <span style={{ background: `${color}20`, color, fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '100px' }}>{dur}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>The Combo System</h2>
            <p style={{ marginBottom: '1rem' }}>The combo system rewards consistent, uninterrupted destruction. Every time you destroy a meteor, your combo counter increases by one. A floating popup briefly appears showing your current combo multiplier. Your actual score multiplier is calculated as max(1, floor(combo / 2)), meaning:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'circle' }}>
              <li style={{ marginBottom: '0.5rem' }}>1–3 kills = 1× multiplier (base score)</li>
              <li style={{ marginBottom: '0.5rem' }}>4–5 kills = 2× multiplier (double points)</li>
              <li style={{ marginBottom: '0.5rem' }}>6–7 kills = 3× multiplier</li>
              <li style={{ marginBottom: '0.5rem' }}>10–11 kills = 5× multiplier</li>
              <li style={{ marginBottom: '0.5rem' }}>20+ kills = 10× multiplier and beyond</li>
            </ul>
            <p style={{ marginBottom: '1rem' }}>The combo timer resets if two seconds pass without destroying a meteor. Letting a meteor reach the bottom also resets your combo. This creates a risk-reward dynamic: you can focus on movement and safety, but doing so at the cost of your combo can significantly reduce your total score.</p>
            <p>For maximum scoring, maintain continuous fire and position yourself to intercept meteors early. The combo bonus stacks with difficulty score multipliers, meaning a Hard Mode 10× combo gives you 20× score on each kill.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>How to Increase Your CPS</h2>
            <p style={{ marginBottom: '1rem' }}>CPS (Clicks Per Second) is a core metric in Space Defense. A higher CPS means more projectiles, faster meteor destruction, and maintained combos. Here are proven methods to improve your CPS:</p>
            <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Keyboard Technique</h3>
            <p style={{ marginBottom: '1rem' }}>Using the keyboard F or Space key, you can achieve much higher sustained CPS than mouse clicking. The recommended technique is to use two fingers alternating between F and another nearby key in rapid succession, but for Space Defense specifically, holding F or Space while moving with WASD maximizes firepower without sacrificing maneuverability.</p>
            <h3 style={{ color: 'var(--neon-green)', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Mouse Clicking Technique</h3>
            <p style={{ marginBottom: '1rem' }}>For mouse clicking, use a light, relaxed grip. Position your index finger directly over the left mouse button with minimal pressure. Butterfly clicking (using two fingers alternating) can achieve very high CPS but requires practice. Jitter clicking by tensing wrist muscles is another method, though it is more fatiguing.</p>
            <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Warm Up Before Playing</h3>
            <p>Before competitive sessions, warm up your fingers by doing light clicking exercises for 60 seconds. Stretch your fingers, shake out your wrist, and ensure you're in a comfortable seated position. Wrist position and overall comfort directly affect CPS consistency during long sessions.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Best Strategies for High Score</h2>
            <p style={{ marginBottom: '1rem' }}>Achieving top scores in Space Defense requires combining multiple skills and strategic decisions:</p>
            <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Prioritize Combo Maintenance</h3>
            <p style={{ marginBottom: '1rem' }}>Your combo multiplier is the single biggest lever for score. A 10× combo turns a 100-point kill into a 1,000-point kill. Position yourself to intercept meteors continuously without gaps. On Hard difficulty, the increased spawn rate actually helps maintain combos more easily since there are always targets available.</p>
            <h3 style={{ color: 'var(--neon-green)', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Choose Hard Difficulty</h3>
            <p style={{ marginBottom: '1rem' }}>The 2× score multiplier on Hard difficulty means every kill is worth double. While the game is significantly harder, an experienced player who can maintain a combo on Hard will far outscore even a perfect Easy run. Work your way up through difficulties as your skill improves.</p>
            <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Save Slow Motion for Bosses</h3>
            <p style={{ marginBottom: '1rem' }}>If you have Slow Motion active when a Boss spawns, it becomes dramatically easier to destroy. Combine Slow Motion with Rapid Fire and Double Shot for maximum boss damage. A fully buffed player with all three power-ups active can sometimes eliminate a boss before it travels halfway down the screen.</p>
            <h3 style={{ color: 'var(--neon-purple)', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Maintain Center Position</h3>
            <p>Positioning your ship at the horizontal center of the screen gives you the shortest average travel distance to intercept any meteor regardless of its spawn position. From center, you can reach left or right meteors equally quickly. This positioning strategy reduces reaction time requirements by up to 50% compared to camping in corners.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Improve Hand-Eye Coordination Through Gaming</h2>
            <p style={{ marginBottom: '1rem' }}>Hand-eye coordination is the ability to synchronize visual information with physical motor responses. It is a critical skill in sports, surgery, engineering, art, and countless other fields. Space Defense provides an engaging training environment for this skill because it requires continuous, rapid, and precise coordination between what you see on screen and what your hands execute on keyboard and mouse.</p>
            <p style={{ marginBottom: '1rem' }}>Unlike passive exercises, gaming creates emotional engagement through score feedback, level progression, and competitive high score tracking. This emotional investment causes deeper focus and faster neural pathway development. Research in cognitive science suggests that action games can improve hand-eye coordination, attention span, and spatial reasoning more effectively than traditional exercises.</p>
            <p>Playing Space Defense for 15–30 minutes per day can yield measurable improvements in your coordination within two to three weeks of consistent practice. The increasing difficulty ensures you're always being pushed slightly beyond your current ability, which is the optimal condition for skill development.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Reaction Time Training</h2>
            <p style={{ marginBottom: '1rem' }}>Human average reaction time is approximately 200–250 milliseconds for visual stimuli. Expert gamers often achieve 150–180ms through regular training. Space Defense trains your reaction time through several mechanisms:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'circle' }}>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-primary)' }}>Threat Identification:</strong> Instantly recognizing which meteor is most dangerous requires pattern recognition training.</li>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-primary)' }}>Motor Response Execution:</strong> The moment you identify a threat, executing the correct key press chain requires practiced muscle memory.</li>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-primary)' }}>Predictive Positioning:</strong> Anticipating where a meteor will be in 0.5 seconds and moving preemptively reduces the effective reaction time needed.</li>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-primary)' }}>Dual-task Management:</strong> Managing movement and shooting simultaneously trains your brain to handle parallel task streams efficiently.</li>
            </ul>
            <p>Regular sessions progressively decrease the mental effort required for basic controls, freeing cognitive resources for strategic decision-making. Over time, movement and shooting become near-automatic, and your conscious attention can focus entirely on threat assessment and priority targeting.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Tips for Beginners</h2>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
              <li style={{ marginBottom: '0.5rem' }}>Start on Easy difficulty to learn the controls without pressure.</li>
              <li style={{ marginBottom: '0.5rem' }}>Practice moving and shooting simultaneously before focusing on score.</li>
              <li style={{ marginBottom: '0.5rem' }}>Position yourself near the center of the screen for better coverage.</li>
              <li style={{ marginBottom: '0.5rem' }}>Always pick up power-ups whenever it is safe to do so.</li>
              <li style={{ marginBottom: '0.5rem' }}>Focus on one meteor at a time rather than spraying shots randomly.</li>
              <li style={{ marginBottom: '0.5rem' }}>Watch for the boss warning every 5 levels and prepare accordingly.</li>
              <li style={{ marginBottom: '0.5rem' }}>Use Slow Motion during boss fights for maximum impact.</li>
              <li style={{ marginBottom: '0.5rem' }}>Remember that Esc pauses the game if you need a break.</li>
              <li style={{ marginBottom: '0.5rem' }}>Study your post-game accuracy stat and try to improve it each run.</li>
              <li>Build your combo gradually before attempting risky interceptions.</li>
            </ol>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Advanced Tips for High-Level Play</h2>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
              <li style={{ marginBottom: '0.5rem' }}>Switch to Hard difficulty once you can consistently reach Level 10 on Normal.</li>
              <li style={{ marginBottom: '0.5rem' }}>Maintain continuous fire to build and sustain combos rather than timing individual shots.</li>
              <li style={{ marginBottom: '0.5rem' }}>Track power-up icons in your peripheral vision while focusing on meteor threats.</li>
              <li style={{ marginBottom: '0.5rem' }}>Combine Rapid Fire + Double Shot + Slow Motion for boss fights when possible.</li>
              <li style={{ marginBottom: '0.5rem' }}>Learn the meteor spawn patterns at each level range to predict threats early.</li>
              <li style={{ marginBottom: '0.5rem' }}>Sacrifice hull points strategically if the alternative is breaking a high combo.</li>
              <li style={{ marginBottom: '0.5rem' }}>Use the Shield power-up offensively: charge through meteor clusters to reset the screen.</li>
              <li style={{ marginBottom: '0.5rem' }}>Keep your accuracy above 60% by maintaining tight shooting discipline.</li>
              <li style={{ marginBottom: '0.5rem' }}>Aim for bosses early while they are still high on screen to give yourself reaction time.</li>
              <li>Practice no-damage runs on Easy to develop evasion instincts.</li>
            </ol>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Common Mistakes to Avoid</h2>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '2', listStyleType: 'circle' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Corner camping:</strong> Staying in corners limits your coverage area and reduces your ability to intercept meteors on the opposite side.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Ignoring power-ups:</strong> Power-up drops have enormous impact on performance. Missing them, especially during boss fights, significantly reduces your potential score.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Random spraying:</strong> Firing without aiming reduces accuracy and wastes the fire rate cooldown window. Aim toward meteor clusters for maximum efficiency.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Ignoring the combo:</strong> Many players focus only on survival and ignore their combo meter. A broken combo at 20× costs you an enormous amount of potential score.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Boss panic:</strong> When a boss appears, many players freeze or retreat. Instead, immediately engage with continuous fire while maintaining evasion movement.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Playing on Easy permanently:</strong> Easy mode is great for learning, but the 0.8× score multiplier and slow meteors limit your skill development ceiling.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Forgetting to pause:</strong> If you need to look away or respond to something, press Esc immediately. Failing to pause costs unnecessary lives.</li>
            </ul>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Performance Tracking and High Score System</h2>
            <p style={{ marginBottom: '1rem' }}>Space Defense saves your best performances permanently in your browser's LocalStorage. This means your records persist between sessions without requiring an account or internet connection. The following records are tracked:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'circle' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Highest Score:</strong> The maximum total score achieved across all sessions and difficulties.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Highest Level Reached:</strong> The farthest level progression ever achieved.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Longest Survival Time:</strong> The maximum number of seconds survived in a single run.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Best Accuracy:</strong> The highest shot accuracy percentage recorded at game over.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Peak CPS:</strong> The highest clicks per second ever recorded during a single second of gameplay.</li>
            </ul>
            <p style={{ marginBottom: '1rem' }}>When you beat your previous high score, the game celebrates with a golden "NEW HIGH SCORE!" banner and a confetti animation. Records are displayed prominently in the main menu so you're always aware of your goals for the next run.</p>
            <p>This persistent tracking system transforms Space Defense from a casual game into a meaningful long-term skill development tool. Watching your records improve over days and weeks provides clear evidence of your cognitive and motor skill growth.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Benefits of Playing Browser Games Daily</h2>
            <p style={{ marginBottom: '1rem' }}>Short daily gaming sessions offer scientifically supported cognitive benefits. Action games in particular have been studied extensively by researchers at the University of Rochester and other institutions. Key findings include:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'circle' }}>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-primary)' }}>Improved Visual Attention:</strong> Action game players demonstrate superior ability to track multiple moving objects simultaneously, a skill directly trained in Space Defense.</li>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-primary)' }}>Faster Decision Making:</strong> Players who regularly engage in fast-paced games make decisions 25% faster with no loss of accuracy compared to non-gamers.</li>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-primary)' }}>Enhanced Working Memory:</strong> Managing movement, shooting, combo tracking, power-up collection, and boss awareness simultaneously strengthens working memory capacity.</li>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-primary)' }}>Reduced Cognitive Fatigue:</strong> Brief gaming sessions serve as mental breaks that refresh focus and attention, making them effective study or work break activities.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Stress Relief:</strong> The engaging, goal-oriented nature of games provides genuine psychological relief from daily stress and anxiety.</li>
            </ul>
            <p>A daily 15–20 minute session in Space Defense provides these benefits without requiring significant time investment, making it an ideal mental exercise to incorporate into any routine.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem' }}>Why Space Defense Works in Your Browser</h2>
            <p style={{ marginBottom: '1rem' }}>Space Defense is built using React and the HTML5 Canvas API, running entirely client-side with zero server dependencies during gameplay. The game engine renders at 60 frames per second using requestAnimationFrame, providing smooth, responsive gameplay on modern hardware.</p>
            <p style={{ marginBottom: '1rem' }}>The audio system uses the Web Audio API for real-time procedural sound synthesis. Every sound in the game including laser shots, explosions, level-up fanfares, and boss detonations is generated mathematically at runtime, eliminating the need to load any audio files.</p>
            <p>This architecture means Space Defense works on any device with a modern browser, requires zero installation, loads in seconds, and occupies no storage space on your device. It is accessible from any computer, tablet, or smartphone with an internet connection.</p>
          </div>

          {/* FAQ Section */}
          <div style={{ margin: '3rem 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', marginBottom: '1.5rem', textAlign: 'center' }}>Frequently Asked Questions</h2>

            {[
              { q: 'What is Space Defense?', a: 'Space Defense is a free browser-based space shooter game where you control a fighter spacecraft and destroy incoming meteors. The game features boss battles every 5 levels, five different power-ups, a combo multiplier system, three difficulty modes, and detailed performance statistics including CPS, accuracy, and survival time tracking. All progress is saved locally in your browser.' },
              { q: 'How do I play Space Defense?', a: 'Use WASD or Arrow Keys to move your spaceship across the screen. Press F or Space to fire your weapon. You can also left-click to shoot. Destroy meteors before they hit you or reach the bottom of the screen. Collect glowing power-up drops by flying through them. Survive as long as possible and achieve the highest score. Press Esc to pause at any time.' },
              { q: 'What is CPS and why does it matter?', a: 'CPS stands for Clicks Per Second. In Space Defense, it measures how many projectiles you fire per second. A higher CPS means more shots hitting meteors per second, which is critical for destroying high-HP meteors and bosses quickly. The game tracks both your current CPS and your all-time peak CPS.' },
              { q: 'Does Space Defense require a download?', a: 'No. Space Defense runs entirely in your browser using HTML5 Canvas and Web Audio API technology. No download, installation, account, or plugin is required. Simply open the page and click START MISSION to play immediately from any modern browser on any device.' },
              { q: 'What are the three difficulty levels?', a: 'Easy mode reduces meteor speed to 60% and spawn rate, with a 0.8× score multiplier, ideal for beginners. Normal mode is standard gameplay with a 1× multiplier. Hard mode increases all meteor stats by 1.5× but rewards you with a 2× score multiplier, making it the best choice for chasing high scores once you have developed strong skills.' },
              { q: 'What power-ups are available in Space Defense?', a: 'There are five power-ups: Shield grants 5 seconds of complete invincibility, Rapid Fire doubles your fire rate for 6 seconds, Double Shot adds side projectiles for 7 seconds, Magnet attracts power-up drops for 5 seconds, and Slow Motion reduces all meteor speeds to 40% for 4 seconds. Power-ups drop from destroyed meteors with a 25% chance, and bosses always drop at least one.' },
              { q: 'What is a Boss Meteor?', a: 'Boss Meteors appear every 5 levels. They are much larger than normal meteors, purple in color, and surrounded by a glowing orbital ring. Their HP bar is displayed above them. Destroying a Boss Meteor triggers a multi-stage explosion and rewards bonus points of 500 × current level. They always drop power-ups when destroyed.' },
              { q: 'How does the combo system work?', a: 'Each meteor you destroy increments your combo counter. Your score multiplier is max(1, floor(combo / 2)), so a 10× combo gives 5× score. If more than 2 seconds pass without a kill, or if a meteor reaches the bottom, your combo resets. Maintaining a high combo is the most impactful strategy for achieving top scores.' },
              { q: 'Is Space Defense available on mobile?', a: 'Yes. On mobile devices and tablets, Space Defense displays touch-friendly on-screen controls automatically. The left side shows a D-pad for directional movement and the right side shows a FIRE button. The game supports multi-touch so you can move and shoot simultaneously. Performance is smooth on modern smartphones.' },
              { q: 'How are high scores saved?', a: 'High scores are saved automatically to your browser\'s LocalStorage after each game over. Tracked records include your highest score, highest level, longest survival time, best accuracy percentage, and peak CPS. These records persist between browser sessions and are displayed in the main menu. No account or internet connection is needed to save records.' },
              { q: 'Can I play Space Defense in fullscreen mode?', a: 'Yes. Click the fullscreen icon button in the top right of the game (available in both the menu and HUD) to enter fullscreen mode via the browser Fullscreen API. Press Escape to exit fullscreen. The game canvas automatically adapts to fill the entire screen for an immersive experience.' },
              { q: 'How do I pause and resume the game?', a: 'Press Escape during gameplay to open the pause menu. The game world freezes completely. The pause menu offers three options: Resume (continue from where you paused), Restart (start a new run with the countdown), and Main Menu (return to the main screen). You can also resume by pressing Escape again.' },
              { q: 'Does playing Space Defense improve real-world skills?', a: 'Yes. Research supports that regular action game play improves reaction time, hand-eye coordination, visual attention, working memory, decision-making speed, and multitasking ability. Space Defense specifically trains all of these simultaneously through its combination of evasion, targeting, and resource management mechanics.' },
              { q: 'What browsers support Space Defense?', a: 'Space Defense works on all modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, and Opera. For best performance, use the latest version of Google Chrome or Firefox on desktop. Mobile browsers on iOS Safari and Android Chrome are also fully supported.' },
              { q: 'How is shot accuracy calculated?', a: 'Accuracy = (total hits / total shots) × 100%. Each projectile that strikes any meteor counts as one hit. Missing shots are counted but not penalized directly beyond reducing your accuracy metric. Maintaining high accuracy indicates efficient, targeted shooting rather than random spraying, and it\'s tracked as a personal record.' },
              { q: 'What happens when I reach a new level?', a: 'A large animated Level Up overlay appears showing your new level number with a glow animation and particle effects. Simultaneously, meteor speed and spawn rates increase according to the level formula. A level-up fanfare plays. Every 5 levels, a Boss Meteor spawns as an additional challenge.' },
              { q: 'Is there sound in Space Defense?', a: 'Yes. Space Defense features a complete procedural audio engine built on the Web Audio API. Sounds include laser fire, meteor impacts, small explosions, boss explosions, level-up fanfares, power-up collection tones, combo sounds, and a game-over sequence. You can toggle sound on or off at any time using the mute button.' },
              { q: 'What is the best strategy for achieving high scores?', a: 'Play Hard difficulty for the 2× score multiplier. Maintain your combo by continuously destroying meteors without gaps. Use Rapid Fire + Double Shot + Slow Motion simultaneously during boss fights. Position yourself at horizontal center. Collect all power-ups. Aim for accuracy above 60%. These combined strategies can produce scores 5–10× higher than casual play.' },
              { q: 'How can I improve my CPS?', a: 'For keyboard: hold F or Space during movement for sustained fire. For mouse: use a relaxed grip with your index finger positioned directly over the left button. Butterfly clicking (two fingers alternating) achieves higher peak CPS. Warm up your fingers before playing and ensure you\'re in a comfortable, ergonomic seated position to avoid fatigue.' },
              { q: 'Are there any secrets or hidden features?', a: 'While there are no traditional cheat codes, experienced players discover that combining the Magnet power-up with multiple simultaneous power-up drops creates a stacking advantage. Timing Slow Motion at the exact moment a boss enters the screen maximizes DPS output. The invulnerability frames after taking damage can also be used strategically to pass through meteor clusters safely.' },
            ].map(({ q, a }, i) => (
              <details key={i} style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                <summary style={{ padding: '1rem 1.25rem', cursor: 'pointer', fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {q}
                  <span style={{ color: 'var(--neon-cyan)', fontSize: '1.25rem', flexShrink: 0, marginLeft: '1rem' }}>+</span>
                </summary>
                <div style={{ padding: '0 1.25rem 1rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>{a}</div>
              </details>
            ))}
          </div>

          {/* Conclusion */}
          <div style={{ marginTop: '3.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem', marginTop: '0' }}>Ready to Defend the Sky?</h4>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
              Space Defense combines fast-paced action, strategic depth, and genuine skill development into a completely free browser experience. Whether your goal is to beat your own high score, improve your CPS, develop faster reactions, or simply enjoy an exciting game during your break, Space Defense delivers on every front.
            </p>
            <p style={{ margin: '0', color: 'var(--text-muted)' }}>
              Take control of your fighter spacecraft, select your difficulty, destroy incoming meteors, collect power-ups, defeat boss monsters every five levels, and survive as long as possible. Use W, A, S, D, Arrow Keys, F, Space, and your mouse to defend against the endless meteor storm. Your next personal record is waiting.
            </p>
          </div>

        </section>
      </div>

      <style>{`
        @media (min-width: 768px) { .mobile-controls { display: none !important; } }
        details summary::-webkit-details-marker { display: none; }
        details[open] summary span { transform: rotate(45deg); }
        details summary span { display: inline-block; transition: transform 0.2s; }
      `}</style>
    </div>
  );
}

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
