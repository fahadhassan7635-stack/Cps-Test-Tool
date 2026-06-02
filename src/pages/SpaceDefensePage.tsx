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
  VolumeX
} from 'lucide-react';

// --- Audio Engine ---
const createAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContext();
};

class GameSound {
  ctx: AudioContext | null = null;
  muted = false; // Sound toggle state

  init() {
    if (!this.ctx && !this.muted) this.ctx = createAudioContext();
  }

  playLaser() {
    if (this.muted) return;
    const context = this.ctx;
    if (!context) return;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, context.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + 0.1);
  }

  playExplosion() {
    if (this.muted) return;
    const context = this.ctx;
    if (!context) return;
    const bufferSize = context.sampleRate * 0.2;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, context.currentTime + 0.2);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.3, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    noise.start();
  }

  playHit() {
    if (this.muted) return;
    const context = this.ctx;
    if (!context) return;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, context.currentTime);
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + 0.05);
  }

  playLevelUp() {
    if (this.muted) return;
    const context = this.ctx;
    if (!context) return;
    const now = context.currentTime;
    [440, 554, 659, 880].forEach((freq, i) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.1);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.1);
    });
  }

  playGameOver() {
    if (this.muted) return;
    const context = this.ctx;
    if (!context) return;
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 1);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    osc.stop(now + 1);
  }
}

const sounds = new GameSound();

// --- Types ---
interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Projectile extends Entity {
  speed: number;
}

interface Meteor extends Entity {
  id: number;
  radius: number;
  speed: number;
  health: number;
  maxHealth: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

// --- Component ---
export default function SpaceDefensePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [meteorsDestroyed, setMeteorsDestroyed] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(10);
  const [currentCPS, setCurrentCPS] = useState(0);
  const [peakCPS, setPeakCPS] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [isMuted, setIsMuted] = useState(false); // UI State for Sound

  // Game Refs
  const gameLoopRef = useRef<number | undefined>(undefined);
  const playerRef = useRef<Entity & { vx: number; vy: number }>({ x: 0, y: 0, width: 50, height: 60, vx: 0, vy: 0 });
  const projectilesRef = useRef<Projectile[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const lastShotTimeRef = useRef(0);
  const shotHistoryRef = useRef<number[]>([]);
  const statsRef = useRef({ totalShots: 0, hits: 0, startTime: 0 });
  const screenShakeRef = useRef(0);
  const invulnerabilityRef = useRef(0);

  // Constants
  const PLAYER_SPEED = 7;
  const SHOOT_COOLDOWN = 150;
  const PROJECTILE_SPEED = 12;
  const INVULNERABILITY_TIME = 60;

  // Toggle Sound
  const toggleSound = () => {
    const newMutedState = !isMuted;
    sounds.muted = newMutedState;
    setIsMuted(newMutedState);
    if (!newMutedState) sounds.init();
  };

  // Initialization
  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    playerRef.current = {
      x: canvas.width / 2 - 25,
      y: canvas.height - 100,
      width: 50,
      height: 60,
      vx: 0,
      vy: 0
    };
    projectilesRef.current = [];
    meteorsRef.current = [];
    particlesRef.current = [];
    setScore(0);
    setMeteorsDestroyed(0);
    setLevel(1);
    setLives(10);
    setCurrentCPS(0);
    setPeakCPS(0);
    setAccuracy(100);
    setTimeSurvived(0);
    statsRef.current = { totalShots: 0, hits: 0, startTime: Date.now() };
    shotHistoryRef.current = [];
    invulnerabilityRef.current = 0;
    if (!isMuted) sounds.init();
  }, [isMuted]);

  const spawnMeteor = useCallback((canvasWidth: number, currentLevel: number) => {
    const radius = Math.random() * 20 + 20 + (Math.random() * currentLevel * 2);
    
    let health, speed;
    
    if (currentLevel <= 3) {
      health = 1; 
      speed = Math.random() * 0.3 + 0.4;
    } else if (currentLevel <= 7) {
      health = Math.ceil(1 + (currentLevel - 3) * 0.2);
      speed = Math.random() * 0.4 + 0.6 + (currentLevel - 3) * 0.05;
    } else {
      health = Math.ceil(2 + (currentLevel - 7) * 0.3);
      speed = Math.random() * 0.5 + 0.9 + (currentLevel - 7) * 0.04;
    }
    
    return {
      id: Math.random(),
      x: Math.random() * (canvasWidth - radius * 2) + radius,
      y: -radius * 2,
      width: radius * 2,
      height: radius * 2,
      radius,
      speed,
      health,
      maxHealth: health,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      color: `hsl(${Math.random() * 30 + 10}, 70%, 50%)`
    };
  }, []);

  const createExplosion = (x: number, y: number, color: string, count = 15) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        color,
        size: Math.random() * 4 + 2
      });
    }
  };

  const handleShoot = () => {
    const now = Date.now();
    if (now - lastShotTimeRef.current >= SHOOT_COOLDOWN) {
      sounds.playLaser();
      projectilesRef.current.push({
        x: playerRef.current.x + playerRef.current.width / 2 - 2,
        y: playerRef.current.y,
        width: 4,
        height: 20,
        speed: PROJECTILE_SPEED
      });
      lastShotTimeRef.current = now;
      statsRef.current.totalShots++;
      shotHistoryRef.current.push(now);
      createExplosion(playerRef.current.x + playerRef.current.width / 2, playerRef.current.y, '#00f5ff', 5);
    }
  };

  const update = (_ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) playerRef.current.y -= PLAYER_SPEED;
    if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) playerRef.current.y += PLAYER_SPEED;
    if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) playerRef.current.x -= PLAYER_SPEED;
    if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) playerRef.current.x += PLAYER_SPEED;

    if (keysRef.current['KeyF'] || keysRef.current['Space']) {
      handleShoot();
    }

    playerRef.current.x = Math.max(0, Math.min(canvas.width - playerRef.current.width, playerRef.current.x));
    playerRef.current.y = Math.max(0, Math.min(canvas.height - playerRef.current.height, playerRef.current.y));

    projectilesRef.current.forEach((p, i) => {
      p.y -= p.speed;
      if (p.y < -p.height) projectilesRef.current.splice(i, 1);
    });

    let spawnChance = 0.015;
    if (level > 3) spawnChance += (level - 3) * 0.002;
    if (level > 7) spawnChance += (level - 7) * 0.001;
    spawnChance = Math.min(spawnChance, 0.05);

    if (Math.random() < spawnChance) {
      meteorsRef.current.push(spawnMeteor(canvas.width, level));
    }

    meteorsRef.current.forEach((m, i) => {
      m.y += m.speed;
      m.rotation += m.rotationSpeed;

      const dx = (m.x) - (playerRef.current.x + playerRef.current.width/2);
      const dy = (m.y) - (playerRef.current.y + playerRef.current.height/2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < m.radius + 20 && invulnerabilityRef.current <= 0) {
        handleHitPlayer();
        meteorsRef.current.splice(i, 1);
        return;
      }

      if (m.y - m.radius > canvas.height) {
        handleHitPlayer();
        meteorsRef.current.splice(i, 1);
        return;
      }

      projectilesRef.current.forEach((p, pi) => {
        const pdx = m.x - p.x;
        const pdy = m.y - p.y;
        const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

        if (pDist < m.radius) {
          projectilesRef.current.splice(pi, 1);
          m.health--;
          statsRef.current.hits++;
          sounds.playHit();
          createExplosion(p.x, p.y, '#ff6b35', 3);

          if (m.health <= 0) {
            sounds.playExplosion();
            createExplosion(m.x, m.y, m.color, 20);
            meteorsRef.current.splice(i, 1);
            setScore(prev => prev + Math.floor(m.radius * level));
            setMeteorsDestroyed(prev => {
              const newVal = prev + 1;
              const threshold = level <= 3 ? 15 : (level <= 7 ? 25 : 35);
              if (newVal % threshold === 0) {
                setLevel(l => {
                  sounds.playLevelUp();
                  return l + 1;
                });
              }
              return newVal;
            });
            screenShakeRef.current = 10;
          }
        }
      });
    });

    particlesRef.current.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) particlesRef.current.splice(i, 1);
    });

    const now = Date.now();
    shotHistoryRef.current = shotHistoryRef.current.filter(t => now - t < 1000);
    const currentCPSVal = shotHistoryRef.current.length;
    setCurrentCPS(currentCPSVal);
    setPeakCPS(prev => Math.max(prev, currentCPSVal));
    
    if (statsRef.current.totalShots > 0) {
      setAccuracy(Math.floor((statsRef.current.hits / statsRef.current.totalShots) * 100));
    }
    
    setTimeSurvived(Math.floor((now - statsRef.current.startTime) / 1000));

    if (screenShakeRef.current > 0) screenShakeRef.current -= 1;
    if (invulnerabilityRef.current > 0) invulnerabilityRef.current -= 1;
  };

  const handleHitPlayer = () => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        gameOver();
        return 0;
      }
      return newLives;
    });
    sounds.playHit();
    screenShakeRef.current = 15;
    invulnerabilityRef.current = INVULNERABILITY_TIME;
  };

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (screenShakeRef.current > 0) {
      ctx.translate((Math.random() - 0.5) * screenShakeRef.current, (Math.random() - 0.5) * screenShakeRef.current);
    }

    ctx.fillStyle = '#fff';
    for(let i=0; i<50; i++) {
        const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * canvas.width;
        const y = ((Math.cos(i * 456.78) * 0.5 + 0.5) * canvas.height + (Date.now() / 20)) % canvas.height;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    particlesRef.current.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    projectilesRef.current.forEach(p => {
      const gradient = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
      gradient.addColorStop(0, '#00f5ff');
      gradient.addColorStop(1, '#00ff88');
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f5ff';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.shadowBlur = 0;
    });

    meteorsRef.current.forEach(m => {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rotation);
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = m.color;
      
      ctx.fillStyle = '#1e2430';
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2;
        const r = m.radius * (0.8 + Math.random() * 0.2);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (m.maxHealth > 1) {
          ctx.restore();
          ctx.save();
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(m.x - 20, m.y - m.radius - 10, 40, 4);
          ctx.fillStyle = m.color;
          ctx.fillRect(m.x - 20, m.y - m.radius - 10, 40 * (m.health / m.maxHealth), 4);
      }
      ctx.restore();
    });

    const p = playerRef.current;
    ctx.save();
    ctx.translate(p.x + p.width/2, p.y + p.height/2);
    
    const engineGlow = ctx.createRadialGradient(0, p.height/2, 0, 0, p.height/2, 20);
    engineGlow.addColorStop(0, '#ff6b35');
    engineGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = engineGlow;
    ctx.fillRect(-15, p.height/2 - 5, 30, 20);

    ctx.fillStyle = '#080d14';
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -p.height/2); 
    ctx.lineTo(p.width/2, p.height/4); 
    ctx.lineTo(p.width/4, p.height/2); 
    ctx.lineTo(-p.width/4, p.height/2); 
    ctx.lineTo(-p.width/2, p.height/4); 
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00f5ff';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(0, -p.height/6, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    if (invulnerabilityRef.current > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    update(ctx, canvas);
    draw(ctx, canvas);
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [level]);

  const startGame = () => {
    initGame();
    setGameState('playing');
  };

  const gameOver = () => {
    setGameState('gameover');
    sounds.playGameOver();
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        keysRef.current[e.code] = true;
        if (e.code === 'KeyF' || e.code === 'Space') {
            if (gameState === 'playing') handleShoot();
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const handleCanvasInteraction = (_e: React.MouseEvent | React.TouchEvent) => {
    if (gameState === 'playing') {
        handleShoot();
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      
      {/* Game Container Wrapper */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '4rem' }}>
        
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '900px',
          aspectRatio: '16/9',
          background: 'rgba(8,13,20,0.9)',
          border: '1px solid rgba(0, 245, 255, 0.2)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0,245,255,0.05)',
          userSelect: 'none'
        }}>
          
          {/* Background Grid */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(var(--neon-cyan) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={900}
            height={500}
            onMouseDown={handleCanvasInteraction}
            onTouchStart={handleCanvasInteraction}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair', touchAction: 'none' }}
          />

          {/* HUD (Playing State) */}
          {gameState === 'playing' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
              
              {/* Left Stats + Sound Toggle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', pointerEvents: 'auto' }}>
                
                <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem 1.25rem' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--neon-cyan)', fontWeight: '700', marginBottom: '0.25rem' }}>Score</div>
                    <div style={{ fontSize: '1.75rem', fontFamily: 'monospace', fontWeight: '800', color: '#fff' }}>{score.toLocaleString()}</div>
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem 1.25rem' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ff4d4d', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Heart size={12} fill="currentColor" /> Hull Integrity
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} style={{
                                width: '8px', height: '16px', borderRadius: '2px', transition: 'all 0.3s',
                                background: i < lives ? 'var(--neon-orange)' : 'rgba(255,255,255,0.1)',
                                boxShadow: i < lives ? '0 0 8px var(--neon-orange)' : 'none'
                            }} />
                        ))}
                    </div>
                </div>

                {/* Sound Button */}
                <button 
                  onClick={toggleSound}
                  style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: isMuted ? 'var(--text-muted)' : '#fff', cursor: 'pointer', alignSelf: 'flex-start', transition: 'all 0.2s' }}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} color="var(--neon-cyan)" />}
                  <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{isMuted ? 'UNMUTE' : 'MUTE'}</span>
                </button>

              </div>

              {/* Right Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <StatBox icon={<Zap size={16} color="var(--neon-yellow)" />} label="CPS" value={currentCPS} />
                <StatBox icon={<Trophy size={16} color="var(--neon-orange)" />} label="Peak" value={peakCPS} />
                <StatBox icon={<Target size={16} color="var(--neon-cyan)" />} label="Acc" value={`${accuracy}%`} />
                <StatBox icon={<Activity size={16} color="var(--neon-green)" />} label="Meteors" value={meteorsDestroyed} />
              </div>
            </div>
          )}

          {/* Mobile Controls Overlay */}
          {gameState === 'playing' && (
            <div className="mobile-controls" style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', pointerEvents: 'auto' }}>
                <div />
                <ControlButton icon={<ChevronUp />} onStart={() => keysRef.current['KeyW'] = true} onEnd={() => keysRef.current['KeyW'] = false} />
                <div />
                <ControlButton icon={<ChevronLeft />} onStart={() => keysRef.current['KeyA'] = true} onEnd={() => keysRef.current['KeyA'] = false} />
                <ControlButton icon={<ChevronDown />} onStart={() => keysRef.current['KeyS'] = true} onEnd={() => keysRef.current['KeyS'] = false} />
                <ControlButton icon={<ChevronRight />} onStart={() => keysRef.current['KeyD'] = true} onEnd={() => keysRef.current['KeyD'] = false} />
              </div>
              <div style={{ pointerEvents: 'auto' }}>
                <button 
                    onMouseDown={() => keysRef.current['KeyF'] = true}
                    onMouseUp={() => keysRef.current['KeyF'] = false}
                    onTouchStart={() => keysRef.current['KeyF'] = true}
                    onTouchEnd={() => keysRef.current['KeyF'] = false}
                    style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(0, 245, 255, 0.1)', border: '2px solid var(--neon-cyan)', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(5px)' }}
                >
                    <Zap size={32} fill="currentColor" />
                </button>
              </div>
            </div>
          )}

          {/* Menu Overlay */}
          {gameState === 'menu' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,13,20,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              
              {/* Menu Sound Toggle Top Right */}
              <button 
                onClick={toggleSound}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', padding: '0.75rem', color: isMuted ? 'var(--text-muted)' : '#fff', cursor: 'pointer' }}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.05em', color: '#fff', textShadow: '0 0 20px rgba(0, 245, 255, 0.4)', marginBottom: '0.5rem' }}>
                    Space <span style={{ color: 'var(--neon-cyan)' }}>DEFENSE</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>Test your CPS and survival skills</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem', textAlign: 'left' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--neon-cyan)', textTransform: 'uppercase', marginBottom: '1rem' }}>Controls</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                            <li><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>WASD</kbd> - Move</li>
                            <li><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>F / Space</kbd> - Shoot</li>
                            <li><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Click</kbd> - Shoot</li>
                        </ul>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--neon-orange)', textTransform: 'uppercase', marginBottom: '1rem' }}>Objective</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>Destroy meteors. Higher CPS = faster destruction. Don't let them hit you.</p>
                    </div>
                </div>

                <button 
                  onClick={startGame}
                  style={{ width: '100%', padding: '1.25rem', background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-green))', color: '#000', fontSize: '1.25rem', fontWeight: '900', borderRadius: '16px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'transform 0.2s', boxShadow: '0 10px 30px rgba(0, 245, 255, 0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Play fill="currentColor" /> START MISSION
                </button>
              </div>
            </div>
          )}

          {/* Game Over Overlay (Minimized) */}
          {gameState === 'gameover' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,13,20,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div style={{ maxWidth: '380px', width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.5rem', textAlign: 'center' }}>
                
                <div style={{ color: '#ff4d4d', fontWeight: '900', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.25rem' }}>Mission Failed</div>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>GAME OVER</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <GameOverStat label="Final Score" value={score.toLocaleString()} highlight="var(--neon-cyan)" />
                    <GameOverStat label="Meteors" value={meteorsDestroyed} icon={<Activity size={12} />} />
                    <GameOverStat label="Peak CPS" value={peakCPS} icon={<Trophy size={12} />} />
                    <GameOverStat label="Accuracy" value={`${accuracy}%`} icon={<Target size={12} />} />
                    <GameOverStat label="Time" value={`${timeSurvived}s`} icon={<Timer size={12} />} />
                    <GameOverStat label="Level" value={level} highlight="var(--neon-purple)" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button 
                      onClick={startGame}
                      style={{ width: '100%', padding: '0.875rem', background: '#fff', color: '#000', fontSize: '0.95rem', fontWeight: '800', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--neon-cyan)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                    >
                    <RotateCcw size={18} /> TRY AGAIN
                    </button>
                    <button 
                      onClick={() => setGameState('menu')}
                      style={{ width: '100%', padding: '0.75rem', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: '600', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    >
                    <Home size={16} /> MAIN MENU
                    </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* SEO ARTICLE SECTION */}
      <hr style={{ borderColor: 'var(--border)', margin: '5rem 0 4rem' }} />
      
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '3rem 2.5rem' }}>
        <section style={{ maxWidth: '900px', margin: '0 auto', color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
          
          <h2 style={{ color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: '800', marginBottom: '1.5rem', textAlign: 'center' }}>
            Why You Should Play Space Defence
          </h2>
          
          <p style={{ marginBottom: '2rem' }}>
            Space Defence is more than just a simple browser game. It combines fast reactions, keyboard control, mouse accuracy, and hand-eye coordination into one exciting challenge. Whether you're a gamer looking to sharpen your skills or simply want a fun way to pass the time, Space Defence offers an engaging experience that keeps you coming back for higher scores.
          </p>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Improve Your Reaction Speed
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              Every meteor that falls from the sky requires quick decisions. As the game progresses, meteors become faster and more difficult to destroy. Players must react instantly to avoid collisions and eliminate threats before they reach the bottom of the screen.
            </p>
            <p style={{ margin: '0' }}>
              Regular play can help improve reaction time, focus, and decision-making speed.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-green)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Train Keyboard Control Skills
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              Space Defence uses multiple keyboard controls:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'circle', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>W</strong> = Move Up</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>A</strong> = Move Left</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>S</strong> = Move Down</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>D</strong> = Move Right</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>F</strong> = Fire Weapons</li>
            </ul>
            <p style={{ marginBottom: '1rem' }}>Players can also use the Arrow Keys:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'circle', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>↑</strong> Up Arrow</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>↓</strong> Down Arrow</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>←</strong> Left Arrow</li>
              <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>→</strong> Right Arrow</li>
            </ul>
            <p style={{ margin: '0' }}>Using both movement and shooting controls at the same time creates an excellent keyboard coordination exercise.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Practice Mouse Accuracy
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              In addition to keyboard controls, players can shoot using the left mouse button. This adds another layer of control and helps improve clicking accuracy and timing.
            </p>
            <p style={{ margin: '0' }}>
              The combination of keyboard movement and mouse shooting creates a gameplay experience similar to many popular PC action games.
            </p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-purple)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Increasing Challenge Keeps the Game Exciting
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              The game starts at a comfortable pace, allowing new players to learn the controls. As more meteors are destroyed, the difficulty gradually increases:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'circle', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '0.5rem' }}>Faster meteor speed</li>
              <li style={{ marginBottom: '0.5rem' }}>Higher spawn rates</li>
              <li style={{ marginBottom: '0.5rem' }}>More challenging gameplay</li>
              <li style={{ marginBottom: '0.5rem' }}>Greater score potential</li>
            </ul>
            <p style={{ margin: '0' }}>This progression keeps every session fresh and rewarding.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-yellow)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              A Fun Way to Test Your Skills
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              Unlike traditional reaction tests, Space Defence turns skill training into an enjoyable game. Players are constantly challenged to improve their:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'circle', color: 'var(--text-secondary)' }}>
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
            <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Track Your Performance
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              At the end of each run, players can review their results, including:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'circle', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '0.5rem' }}>Final Score</li>
              <li style={{ marginBottom: '0.5rem' }}>Meteors Destroyed</li>
              <li style={{ marginBottom: '0.5rem' }}>Peak CPS</li>
              <li style={{ marginBottom: '0.5rem' }}>Accuracy Percentage</li>
              <li style={{ marginBottom: '0.5rem' }}>Survival Time</li>
            </ul>
            <p style={{ margin: '0' }}>These statistics make it easy to track improvement and compete against your own personal best scores.</p>
          </div>

          <div style={{ margin: '2.5rem 0' }}>
            <h3 style={{ color: 'var(--neon-green)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Perfect for Casual and Competitive Players
            </h3>
            <p style={{ margin: '0' }}>
              Whether you have a few minutes to spare or want to chase a high score for hours, Space Defence offers a simple but addictive gameplay loop. Easy-to-learn controls, increasing difficulty, and fast-paced action make it enjoyable for players of all skill levels.
            </p>
          </div>

          <div style={{ marginTop: '3.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', marginTop: '0' }}>
              Ready to Defend the Sky?
            </h4>
            <p style={{ margin: '0', color: 'var(--text-muted)' }}>
              Take control of your fighter jet, dodge incoming meteors, and survive as long as possible. Use W, A, S, D, F, Arrow Keys, and the Left Mouse Button to defend against the endless meteor storm and achieve your highest score in Space Defence.
            </p>
          </div>

        </section>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .mobile-controls { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// --- Subcomponents ---

const StatBox = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
    {icon}
    <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700' }}>{label}</span>
        <span style={{ fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: '700', color: '#fff' }}>{value}</span>
    </div>
  </div>
);

const ControlButton = ({ icon, onStart, onEnd }: { icon: React.ReactNode, onStart: () => void, onEnd: () => void }) => (
  <button 
    onMouseDown={onStart}
    onMouseUp={onEnd}
    onTouchStart={onStart}
    onTouchEnd={onEnd}
    style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
  >
    {icon}
  </button>
);

const GameOverStat = ({ label, value, icon, highlight = '#fff' }: { label: string, value: string | number, icon?: React.ReactNode, highlight?: string }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon}
        {label}
    </div>
    <div style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'monospace', color: highlight, lineHeight: 1 }}>
        {value}
    </div>
  </div>
);