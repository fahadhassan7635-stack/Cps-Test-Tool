import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, 
  Play, 
  RefreshCcw, 
  Activity, 
  Zap, 
  Shield, 
  Timer, 
  TrendingUp,
  Home,
  Volume2,
  VolumeX,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Types ---
interface Point {
  x: number;
  y: number;
}

interface Particle extends Point {
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface Obstacle extends Point {
  radius: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  type: 'asteroid' | 'comet';
  points: Point[];
  hasNearMissed?: boolean;
}

// --- Audio Manager ---
class AudioManager {
  ctx: AudioContext | null = null;
  muted = false;

  init() {
    if (!this.ctx && !this.muted && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      } catch {
        console.warn('Web Audio API not supported');
      }
    }
  }

  playBoost() {
    if (this.muted) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playCollision() {
    if (this.muted) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    try {
      const noise = this.ctx.createBufferSource();
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.6);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {
      console.error(e);
    }
  }

  playGameOver() {
    if (this.muted) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.2);
  }

  playNearMiss() {
    if (this.muted) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }
}

const audio = new AudioManager();

// --- Constants ---
const GRAVITY = 0.35;
const BOOST_STRENGTH = -0.75;
const MAX_VELOCITY = 7;
const INITIAL_SPEED = 5;
const SPEED_INCREMENT = 0.4;
const VOYAGER_X = 120;
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 500;

// Direct DOM modification to avoid state lag
const updateHUD = (id: string, value: string | number) => {
  if (typeof document !== 'undefined') {
    const el = document.getElementById(id);
    if (el) el.innerText = value.toString();
  }
};

export default function VoyagerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [uiView, setUiView] = useState<'start' | 'playing' | 'gameover'>('start');

  // Single truth source for game loop
  const g = useRef({
    status: 'start',
    y: CANVAS_HEIGHT / 2,
    vel: 0,
    speed: INITIAL_SPEED,
    distance: 0,
    avoided: 0,
    time: 0,
    cps: 0,
    peakCps: 0,
    isBoosting: false,
    startTime: 0,
    lastSpawn: 0,
    lastSpeedUp: 0,
    clickTimes: [] as number[],
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    stars: [] as {x: number, y: number, z: number, size: number}[],
    screenShake: 0
  });

  const actionsRef = useRef<{ start: () => void, boostUp: () => void, boostDown: () => void } | null>(null);

  const toggleSound = () => {
    const next = !isMuted;
    audio.muted = next;
    setIsMuted(next);
    if (!next) audio.init();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let frameId: number;

    // Initialize Stars
    g.current.stars = [];
    for (let i = 0; i < 150; i++) {
      g.current.stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        z: Math.random() * 8 + 1,
        size: Math.random() * 2 + 0.5
      });
    }

    const createObstacle = (speed: number): Obstacle => {
      const size = 20 + Math.random() * 45;
      const type = Math.random() > 0.85 ? 'comet' : 'asteroid';
      const points: Point[] = [];
      const segments = 9 + Math.floor(Math.random() * 6);
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const r = size * (0.7 + Math.random() * 0.4);
        points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
      }
      return {
        x: CANVAS_WIDTH + size * 2,
        y: Math.random() * CANVAS_HEIGHT,
        radius: size,
        speed: speed + (Math.random() * 2),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        type,
        points
      };
    };

    const triggerGameOver = () => {
      g.current.status = 'gameover';
      g.current.isBoosting = false;
      audio.playCollision();
      audio.playGameOver();
      
      for (let i = 0; i < 50; i++) {
        g.current.particles.push({
          x: VOYAGER_X,
          y: g.current.y,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 0.5) * 16,
          life: 1,
          color: Math.random() > 0.4 ? '#ff6b35' : '#ef4444',
          size: Math.random() * 4 + 2
        });
      }
      g.current.screenShake = 20;
      setUiView('gameover');
    };

    actionsRef.current = {
      start: () => {
        const now = Date.now();
        g.current = {
          ...g.current,
          status: 'playing',
          y: CANVAS_HEIGHT / 2,
          vel: 0,
          speed: INITIAL_SPEED,
          distance: 0,
          avoided: 0,
          time: 0,
          cps: 0,
          peakCps: 0,
          isBoosting: false,
          startTime: now,
          lastSpawn: now,
          lastSpeedUp: now,
          clickTimes: [],
          obstacles: [],
          particles: []
        };
        setUiView('playing');
        if (!audio.muted) audio.init();
      },
      boostUp: () => {
        if (g.current.status !== 'playing') return;
        g.current.isBoosting = true;
        audio.playBoost();
        g.current.clickTimes.push(Date.now());
      },
      boostDown: () => {
        g.current.isBoosting = false;
      }
    };

    // Safe Physics & State Updates
    const update = () => {
      if (g.current.status !== 'playing') return;
      const state = g.current;
      const now = Date.now();

      const oneSecondAgo = now - 1000;
      state.clickTimes = state.clickTimes.filter(t => t > oneSecondAgo);
      
      if (state.cps !== state.clickTimes.length) {
        state.cps = state.clickTimes.length;
        if (state.cps > state.peakCps) state.peakCps = state.cps;
        updateHUD('stat-cps', state.cps);
      }

      if (state.screenShake > 0) state.screenShake -= 1;

      if (state.isBoosting) {
        state.vel += BOOST_STRENGTH;
        if (state.particles.length < 100) {
          state.particles.push({
            x: VOYAGER_X - 15,
            y: state.y + (Math.random() - 0.5) * 8,
            vx: -3 - Math.random() * 5,
            vy: (Math.random() - 0.5) * 2.5,
            life: 0.8,
            color: 'rgba(0, 245, 255, 0.7)',
            size: Math.random() * 3 + 1
          });
        }
      }
      
      state.vel += GRAVITY;
      state.vel = Math.min(Math.max(state.vel, -MAX_VELOCITY), MAX_VELOCITY);
      state.y += state.vel;

      if (state.y < 0 || state.y > CANVAS_HEIGHT) {
        triggerGameOver();
        return;
      }

      state.distance += state.speed / 10;
      updateHUD('stat-distance', Math.floor(state.distance).toLocaleString());

      const survivalSecs = Math.floor((now - state.startTime) / 1000);
      if (survivalSecs !== state.time) {
        state.time = survivalSecs;
        updateHUD('stat-time', `${survivalSecs}s`);
      }
      
      if (now - state.lastSpeedUp > 15000) {
        state.speed += SPEED_INCREMENT;
        state.lastSpeedUp = now;
        updateHUD('stat-speed', `${state.speed.toFixed(1)}u`);
      }

      const spawnInterval = Math.max(1800 - (survivalSecs * 60), 500);
      if (now - state.lastSpawn > spawnInterval) {
        state.obstacles.push(createObstacle(state.speed));
        state.lastSpawn = now;
      }

      state.obstacles = state.obstacles.filter(obs => {
        obs.x -= obs.speed;
        obs.rotation += obs.rotationSpeed;

        const dx = obs.x - VOYAGER_X;
        const dy = obs.y - state.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < obs.radius + 18) {
          triggerGameOver();
        } else if (!obs.hasNearMissed && dist < obs.radius + 50 && obs.x < VOYAGER_X + 20 && obs.x > VOYAGER_X - 20) {
          audio.playNearMiss();
          obs.hasNearMissed = true;
        }

        if (obs.x < -obs.radius * 2) {
          state.avoided += 1;
          updateHUD('stat-avoided', state.avoided);
          return false;
        }
        return true;
      });

      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        return p.life > 0;
      });
    };

    // Render Engine
    const draw = () => {
      ctx.save();
      const state = g.current;

      if (state.screenShake > 0) {
        const sx = (Math.random() - 0.5) * state.screenShake;
        const sy = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(sx, sy);
      }
      
      ctx.clearRect(-50, -50, CANVAS_WIDTH + 100, CANVAS_HEIGHT + 100);

      // Stars
      const activeSpeed = state.status === 'playing' ? state.speed : 1;
      state.stars.forEach(star => {
        const pSpeed = 1 / star.z;
        star.x -= pSpeed * activeSpeed;
        if (star.x < 0) star.x = CANVAS_WIDTH;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + (1/star.z) * 0.9})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / star.z, 0, Math.PI * 2);
        ctx.fill();
      });

      update();

      // Particles
      state.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Entities
      if (state.status !== 'start') {
        // Voyager Ship
        ctx.save();
        ctx.translate(VOYAGER_X, state.y);
        ctx.rotate(state.vel * 0.06);

        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-18, 0, 22, -Math.PI/2.5, Math.PI/2.5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(2, 0);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-10, -10, 28, 20);
        
        ctx.fillStyle = '#ff6b35'; 
        ctx.fillRect(0, -8, 18, 16);

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(18, 6);
        ctx.lineTo(50, 16); 
        ctx.stroke();
        
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(45, 12, 12, 10);

        ctx.beginPath();
        ctx.moveTo(10, -10);
        ctx.lineTo(20, -45);
        ctx.stroke();

        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(0, 245, 255, 0.5)';
        ctx.restore();

        // Obstacles
        state.obstacles.forEach(obs => {
          ctx.save();
          ctx.translate(obs.x, obs.y);
          ctx.rotate(obs.rotation);

          if (obs.type === 'asteroid') {
            ctx.beginPath();
            ctx.moveTo(obs.points[0].x, obs.points[0].y);
            obs.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            
            const grad = ctx.createRadialGradient(-obs.radius/4, -obs.radius/4, 0, 0, 0, obs.radius);
            grad.addColorStop(0, '#64748b');
            grad.addColorStop(1, '#080d14');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.arc(obs.radius/3, -obs.radius/5, obs.radius/4, 0, Math.PI*2);
            ctx.fill();
          } else {
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, obs.radius);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.2, '#00f5ff');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.rotate(-obs.rotation); 
            const tailGrad = ctx.createLinearGradient(0, 0, obs.radius * 5, 0);
            tailGrad.addColorStop(0, 'rgba(0, 245, 255, 0.3)');
            tailGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = tailGrad;
            ctx.beginPath();
            ctx.moveTo(0, -obs.radius/1.5);
            ctx.lineTo(obs.radius * 5, -obs.radius * 1.5);
            ctx.lineTo(obs.radius * 5, obs.radius * 1.5);
            ctx.lineTo(0, obs.radius/1.5);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        });
      }

      ctx.restore();
      frameId = requestAnimationFrame(draw);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault(); 
        if (e.repeat) return; 
        
        if (g.current.status === 'playing') {
          actionsRef.current?.boostUp();
        } else if (g.current.status === 'start' || g.current.status === 'gameover') {
          actionsRef.current?.start();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        actionsRef.current?.boostDown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#030712', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '900px',
        aspectRatio: '16/9',
        background: 'rgba(8,13,20,0.95)',
        border: '1px solid rgba(0, 245, 255, 0.2)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0,245,255,0.05)',
        userSelect: 'none',
        marginBottom: '4rem'
      }}>
        
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer', touchAction: 'none' }}
          onMouseDown={() => actionsRef.current?.boostUp()}
          onMouseUp={() => actionsRef.current?.boostDown()}
          onMouseLeave={() => actionsRef.current?.boostDown()}
          onTouchStart={(e) => { e.preventDefault(); actionsRef.current?.boostUp(); }}
          onTouchEnd={(e) => { e.preventDefault(); actionsRef.current?.boostDown(); }}
        />

        {/* HUD Overlay */}
        {uiView === 'playing' && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', pointerEvents: 'auto' }}>
              <StatBox id="stat-distance" icon={<TrendingUp size={16} color="#22c55e" />} label="Distance" />
              <StatBox id="stat-avoided" icon={<Shield size={16} color="#ff6b35" />} label="Avoided" />
              <button 
                onClick={(e) => { e.currentTarget.blur(); toggleSound(); }}
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: isMuted ? '#64748b' : '#fff', cursor: 'pointer', alignSelf: 'flex-start', transition: 'all 0.2s', marginTop: '0.5rem' }}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} color="#00f5ff" />}
                <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>{isMuted ? 'UNMUTE' : 'MUTE'}</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <StatBox id="stat-cps" icon={<Zap size={16} color="#eab308" />} label="CPS" />
              <StatBox id="stat-speed" icon={<Activity size={16} color="#00f5ff" />} label="Speed" initialValue={`${INITIAL_SPEED.toFixed(1)}u`} />
              <StatBox id="stat-time" icon={<Timer size={16} color="#a855f7" />} label="Time" initialValue="0s" />
            </div>
          </div>
        )}

        {/* Start Menu */}
        {uiView === 'start' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,13,20,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ maxWidth: '450px', width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2.5rem' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(0,245,255,0.1)', borderRadius: '20px', border: '1px solid rgba(0,245,255,0.3)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(15deg)' }}>
                <Rocket size={40} color="#00f5ff" style={{ transform: 'rotate(-45deg)' }} />
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#fff', marginBottom: '0.5rem', lineHeight: '1.2' }}>
                Guide The <span style={{ color: '#00f5ff' }}>Voyager</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem' }}>
                Navigate through the asteroid field using your spacebar or clicking speed.
              </p>
              <button 
                onClick={(e) => { e.currentTarget.blur(); actionsRef.current?.start(); }}
                style={{ width: '100%', padding: '1.25rem', background: 'linear-gradient(135deg, #00f5ff, #22c55e)', color: '#000', fontSize: '1.1rem', fontWeight: '900', borderRadius: '16px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(0, 245, 255, 0.3)' }}
              >
                <Play fill="currentColor" /> START MISSION
              </button>
            </div>
          </div>
        )}

        {/* Game Over Menu */}
        {uiView === 'gameover' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,13,20,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ maxWidth: '380px', width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ color: '#ff4d4d', fontWeight: '900', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.25rem' }}>Signal Lost</div>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>MISSION FAILED</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <GameOverStat label="Distance" value={Math.floor(g.current.distance).toLocaleString()} highlight="#00f5ff" />
                  <GameOverStat label="Avoided" value={g.current.avoided} highlight="#ff6b35" />
                  <GameOverStat label="Peak CPS" value={g.current.peakCps} highlight="#eab308" />
                  <GameOverStat label="Time" value={`${g.current.time}s`} highlight="#a855f7" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button 
                    onClick={(e) => { e.currentTarget.blur(); actionsRef.current?.start(); }}
                    style={{ width: '100%', padding: '0.875rem', background: '#fff', color: '#000', fontSize: '0.95rem', fontWeight: '800', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <RefreshCcw size={18} /> RETRY MISSION
                  </button>
                  <Link 
                    to="/games"
                    style={{ width: '100%', padding: '0.75rem', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: '600', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                  >
                    <Home size={16} /> ALL GAMES
                  </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Article Section --- */}
      <article style={{
        width: '100%',
        maxWidth: '850px',
        background: 'rgba(17, 24, 39, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        lineHeight: '1.7',
        color: '#d1d5db'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <BookOpen size={24} color="#00f5ff" />
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', margin: 0 }}>
            Voyager 1: The Human Journey Beyond Our Solar System
          </h2>
        </div>

        <p style={{ marginBottom: '1.25rem' }}>
          Launched by NASA on September 5, 1977, the <strong>Voyager 1</strong> spacecraft has become one of humanity's greatest achievements in exploration. Originally designed for a five-year mission to study Jupiter and Saturn, this robust probe surpassed all expectations and continues to beam data back to Earth from the freezing, uncharted territory of interstellar space.
        </p>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00f5ff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          Breaking Boundaries
        </h3>
        <p style={{ marginBottom: '1.25rem' }}>
          In August 2012, Voyager 1 made history by crossing the <em>heliopause</em>—the boundary where the solar wind meets the interstellar medium. This milestone officially made it the first human-made object to venture into the space between stars. Traveling at an immense speed of over 38,000 miles per hour (61,000 km/h), it is currently the most distant human object from Earth.
        </p>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00f5ff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          The Golden Record
        </h3>
        <p style={{ marginBottom: '1.25rem' }}>
          As a cosmic message in a bottle, Voyager 1 carries a 12-inch gold-plated copper disk. This <strong>Golden Record</strong> contains sounds and images selected to portray the diversity of life and culture on Earth. It features greetings in 55 languages, classical masterpieces from Bach and Mozart, natural sounds of thunder and whales, and structural diagrams of our DNA—a token of peace for any extraterrestrial intelligence that might encounter it.
        </p>

        <blockquote style={{
          borderLeft: '4px solid #22c55e',
          paddingLeft: '1rem',
          margin: '1.5rem 0',
          color: '#9ca3af',
          fontStyle: 'italic'
        }}>
          "The spacecraft will be encountered and the record played only if there are advanced spacefaring civilizations in interstellar space." — Carl Sagan
        </blockquote>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00f5ff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          An Enduring Legacy
        </h3>
        <p style={{ margin: 0 }}>
          Today, Voyager 1 operates on minimal power generated by its decaying plutonium source. Scientists have systematically turned off non-essential instruments to prolong its life, allowing it to continue measuring cosmic rays and magnetic fields. Even after its transmitters eventually go silent, Voyager 1 will silently coast through the Milky Way for millions of years, carrying the eternal memory of planet Earth.
        </p>
      </article>

    </div>
  );
}

// --- Subcomponents ---
const StatBox = ({ icon, label, id, initialValue }: { icon: React.ReactNode, label: string, id: string, initialValue?: string | number }) => (
  <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '800' }}>{label}</span>
        <span id={id} style={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: '700', color: '#fff', lineHeight: 1 }}>{initialValue ?? 0}</span>
    </div>
  </div>
);

const GameOverStat = ({ label, value, highlight = '#fff' }: { label: string, value: string | number, highlight?: string }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
    </div>
    <div style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'monospace', color: highlight }}>
        {value}
    </div>
  </div>
);
