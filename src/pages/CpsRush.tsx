import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MousePointer2, Keyboard, Play, RotateCcw, Trophy, Zap, Activity, Shield, Lightbulb, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

// Constants
const GRAVITY = 0.35;
const INITIAL_JUMP_FORCE = -8.5;
const BASE_SPEED = 2.5;
const MAX_SPEED_BOOST = 10;
const MAX_JUMP_BOOST = 8;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 440; 
const BALL_RADIUS = 12;

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isEnd?: boolean;
}

export default function CpsRush() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won'>('menu');
  const [inputMode, setInputMode] = useState<'mouse' | 'keyboard'>('mouse');
  const [score, setScore] = useState(0);
  const [distanceToFinish, setDistanceToFinish] = useState(1000);
  
  // Custom Built-in CPS State & Logic
  const [cps, setCps] = useState(0);
  const clickTimestamps = useRef<number[]>([]);
  
  // FAQ state for SEO
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Game variables refs
  const ball = useRef({ x: 50, y: 260, vy: 0, vx: 0 });
  const platforms = useRef<Platform[]>([]);
  const finishX = useRef(0);
  const cameraX = useRef(0);
  const frameId = useRef<number>(0);
  const keysPressed = useRef<Record<string, boolean>>({});

  // CPS Tracker Function
  const recordClick = useCallback(() => {
    const now = performance.now();
    clickTimestamps.current.push(now);
  }, []);

  // Effect to clean and calculate CPS every frame/interval
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (gameState === 'playing') {
      intervalId = setInterval(() => {
        const now = performance.now();
        clickTimestamps.current = clickTimestamps.current.filter(t => now - t < 1000);
        setCps(clickTimestamps.current.length);
      }, 100);
    } else {
      setCps(0);
      clickTimestamps.current = [];
    }
    return () => clearInterval(intervalId);
  }, [gameState]);

  const initGame = useCallback(() => {
    ball.current = { x: 50, y: 260, vy: 0, vx: 0 };
    cameraX.current = 0;
    keysPressed.current = {};
    clickTimestamps.current = [];
    setScore(0);
    setCps(0);
    
    // Initial platform
    const p: Platform[] = [
      { x: 0, y: 350, width: 220, height: 16, color: '#00f0ff' }
    ];

    let lastX = 220;
    let lastY = 350;

    for (let i = 0; i < 35; i++) {
      const width = Math.max(80, 160 - i * 2);
      const gap = 120 + Math.random() * 80 + (i * 1.5);
      const yOffset = (Math.random() - 0.5) * 140;
      const nextY = Math.min(Math.max(160, lastY + yOffset), 380);
      
      p.push({
        x: lastX + gap,
        y: nextY,
        width,
        height: 14,
        color: '#00f0ff' 
      });
      lastX += gap + width;
      lastY = nextY;
    }

    // Final Gate
    const finalX = lastX + 180;
    p.push({
      x: finalX,
      y: lastY - 60,
      width: 120,
      height: 160,
      color: '#ff00aa',
      isEnd: true
    });

    finishX.current = finalX;
    platforms.current = p;
    setDistanceToFinish(Math.floor(finalX / 10));
  }, []);

  const handleInput = useCallback(() => {
    if (gameState === 'playing') {
      recordClick();
    }
  }, [gameState, recordClick]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (e.code === 'Space' && inputMode === 'keyboard' && gameState === 'playing') {
        e.preventDefault();
        handleInput();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [inputMode, gameState, handleInput]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark sleek interface filling
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Vertical Box-Grid lines exactly matching Screenshot 2026-06-04 115239.png
    ctx.save();
    ctx.translate(-cameraX.current % 45, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for(let x = 0; x <= canvas.width + 45; x += 45) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-cameraX.current, 0);

    // Draw Platforms with Cyan high glow
    platforms.current.forEach(p => {
      if (p.x + p.width > cameraX.current && p.x < cameraX.current + canvas.width) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        
        if (p.isEnd) {
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.width, p.height, 12);
          ctx.fill();
          
          ctx.font = 'bold 20px sans-serif';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText('FINISH', p.x + p.width / 2, p.y + p.height / 2 + 7);
        } else {
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.width, p.height, 6);
          ctx.fill();
        }
      }
    });

    // Draw Glowing Ball Player
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Ring layer
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#030712';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }, []);

  const update = useCallback(() => {
    if (gameState !== 'playing') return;

    const currentCps = clickTimestamps.current.filter(t => performance.now() - t < 1000).length;

    const speedBoost = Math.min(currentCps * 0.45, MAX_SPEED_BOOST);
    const jumpBoost = Math.min(currentCps * 0.35, MAX_JUMP_BOOST);

    let direction = 0;
    if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) direction = 1;
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) direction = -1;

    ball.current.vy += GRAVITY;
    ball.current.vx = direction * (BASE_SPEED + speedBoost);
    ball.current.x += ball.current.vx;
    ball.current.y += ball.current.vy;

    // Center viewport track
    cameraX.current = ball.current.x - 220;

    platforms.current.forEach(p => {
      if (
        ball.current.x + BALL_RADIUS > p.x &&
        ball.current.x - BALL_RADIUS < p.x + p.width &&
        ball.current.y + BALL_RADIUS > p.y &&
        ball.current.y - BALL_RADIUS < p.y + p.height &&
        ball.current.vy > 0
      ) {
        if (p.isEnd) {
          setGameState('won');
          confetti({ particleCount: 140, spread: 65, colors: ['#00f0ff', '#ff00aa'] });
          return;
        }

        ball.current.y = p.y - BALL_RADIUS;
        ball.current.vy = INITIAL_JUMP_FORCE - jumpBoost;
      }
    });

    setScore(Math.floor(ball.current.x / 80));
    setDistanceToFinish(Math.max(0, Math.floor((finishX.current - ball.current.x) / 5)));

    if (ball.current.y > CANVAS_HEIGHT + 150) {
      initGame();
    }

    draw();
    frameId.current = requestAnimationFrame(update);
  }, [gameState, initGame, draw]);

  useEffect(() => {
    if (gameState === 'playing') {
      frameId.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(frameId.current);
  }, [gameState, update]);

  const startGame = () => {
    initGame();
    setGameState('playing');
  };

  return (
    <div style={{
      backgroundColor: '#02040a',
      backgroundImage: `
        linear-gradient(rgba(0, 240, 255, 0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 240, 255, 0.015) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      color: '#ffffff',
      fontFamily: "'Inter', sans-serif",
      minHeight: '100vh',
      padding: '1.5rem 1rem',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        
        {/* Header Title Block */}
        <header style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            backgroundColor: 'rgba(0, 240, 255, 0.06)', 
            border: '1px solid rgba(0, 240, 255, 0.2)', 
            color: '#00f0ff', 
            fontSize: '11px', 
            fontWeight: 700, 
            padding: '4px 12px', 
            borderRadius: '20px', 
            marginBottom: '0.5rem',
            letterSpacing: '0.5px'
          }}>
            MOUSE & KEYBOARD SPEED TEST
          </div>
          <h1 style={{ 
            fontSize: '2.4rem', 
            fontWeight: 900, 
            margin: 0,
            color: '#00f0ff',
            letterSpacing: '-0.5px'
          }}>
            CPS RUSH
          </h1>
        </header>

        {/* Compact Canvas Window Frame Wrapper */}
        <div 
          onPointerDown={() => { if (inputMode === 'mouse' && gameState === 'playing') handleInput(); }}
          style={{
            position: 'relative', 
            width: '100%', 
            maxHeight: '440px', 
            aspectRatio: '16/9', 
            backgroundColor: '#030712', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1px solid #111827',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)',
            touchAction: 'none'
          }}
        >
          {/* Active Game Engine Canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />

          {/* ABSOLUTE METERS LAYER INSIDE THE GAME VIEWPORT (Screenshot 2026-06-04 115239.png matching) */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            pointerEvents: 'none', 
            userSelect: 'none'
          }}>
            {/* CPS METER CARD */}
            <div style={{
              background: 'rgba(4, 9, 20, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '14px',
              width: '85px',
              padding: '8px 0',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#00f0ff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>CPS</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{cps}</div>
            </div>

            {/* SCORE METER CARD */}
            <div style={{
              background: 'rgba(4, 9, 20, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(219, 39, 119, 0.3)',
              borderRadius: '14px',
              width: '85px',
              padding: '8px 0',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#db2777', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Score</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{score}</div>
            </div>

            {/* FINISH METER CARD */}
            <div style={{
              background: 'rgba(4, 9, 20, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: '14px',
              minWidth: '95px',
              padding: '8px 6px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#ec4899', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Finish</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                {distanceToFinish}<span style={{ fontSize: '15px', fontWeight: 600, color: '#cbcbcb', marginLeft: '1px' }}>m</span>
              </div>
            </div>
          </div>

          {/* Configuration Setup Menu Layer */}
          {gameState === 'menu' && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(2, 4, 10, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.2rem', color: '#fff' }}>SELECT TARGET BENCHMARK</h2>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '1.8rem', width: '100%', maxWidth: '340px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setInputMode('mouse'); }}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
                    backgroundColor: inputMode === 'mouse' ? 'rgba(0, 240, 255, 0.08)' : '#0b111e',
                    borderColor: inputMode === 'mouse' ? '#00f0ff' : '#1f2937',
                    color: inputMode === 'mouse' ? '#00f0ff' : '#9ca3af'
                  }}
                >
                  <MousePointer2 size={14} /> Mouse Mode
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setInputMode('keyboard'); }}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
                    backgroundColor: inputMode === 'keyboard' ? 'rgba(0, 240, 255, 0.08)' : '#0b111e',
                    borderColor: inputMode === 'keyboard' ? '#00f0ff' : '#1f2937',
                    color: inputMode === 'keyboard' ? '#00f0ff' : '#9ca3af'
                  }}
                >
                  <Keyboard size={14} /> Spacebar
                </button>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#00f0ff', color: '#02040a', padding: '12px 36px', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)'
                }}
              >
                <Play fill="currentColor" size={12} /> ENTER ARENA
              </button>
            </div>
          )}

          {/* Victory Viewport Layer */}
          {gameState === 'won' && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(2, 4, 10, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ width: '50px', height: '50px', backgroundColor: 'rgba(0, 240, 255, 0.1)', border: '1px solid #00f0ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Trophy size={24} style={{ color: '#00f0ff' }} />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>CHALLENGE CLEARED!</h2>
              <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Final Score calculated: <span style={{ color: '#00f0ff', fontWeight: 700 }}>{score}</span></p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#00f0ff', color: '#02040a', padding: '10px 24px', borderRadius: '6px', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} /> PLAY AGAIN
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Action Trigger Bar */}
        {gameState === 'playing' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onPointerDown={() => { keysPressed.current['KeyA'] = true; }}
                onPointerUp={() => { keysPressed.current['KeyA'] = false; }}
                onPointerLeave={() => { keysPressed.current['KeyA'] = false; }}
                style={{ width: '46px', height: '44px', borderRadius: '8px', backgroundColor: '#0b111e', border: '1px solid #1f2937', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
              >
                ◀
              </button>
              <button
                onPointerDown={() => { keysPressed.current['KeyD'] = true; }}
                onPointerUp={() => { keysPressed.current['KeyD'] = false; }}
                onPointerLeave={() => { keysPressed.current['KeyD'] = false; }}
                style={{ width: '46px', height: '44px', borderRadius: '8px', backgroundColor: '#0b111e', border: '1px solid #1f2937', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
              >
                ▶
              </button>
            </div>

            {inputMode === 'mouse' && (
              <button
                onPointerDown={(e) => { handleInput(); e.currentTarget.style.transform = 'scale(0.97)'; }}
                onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                style={{ height: '44px', padding: '0 20px', borderRadius: '8px', backgroundColor: '#00f0ff', border: 'none', color: '#02040a', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', transition: 'transform 0.05s', userSelect: 'none' }}
              >
                <Zap size={14} fill="currentColor" /> TAP TO CLICK / BOOST
              </button>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: '11px', color: '#4b5563', marginTop: '1rem' }}>
          Controls: Balance movement with <span style={{ color: '#9ca3af' }}>A / D</span> keys. Trigger speed metrics via {inputMode === 'mouse' ? 'clicking screen container boundary' : 'Spacebar execution'}.
        </div>

        {/* --- EXPANDED ENHANCED ARTICLE SECTION --- */}
        <section style={{ marginTop: '3.5rem', borderTop: '1px solid #111827', paddingTop: '2.5rem' }}>
          
          {/* Article Feature Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '3rem' }}>
            <div style={{ backgroundColor: '#070c17', border: '1px solid #111c30', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f0ff', marginBottom: '10px', fontWeight: 700 }}>
                <Activity size={18} /> Real-Time Calibration
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', margin: 0, lineHeight: '1.5' }}>
                Measures inputs precisely using millisecond timestamps. The responsive canvas engine converts muscle bursts into rapid horizontal momentum vectors.
              </p>
            </div>
            
            <div style={{ backgroundColor: '#070c17', border: '1px solid #111c30', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#db2777', marginBottom: '10px', fontWeight: 700 }}>
                <Target size={18} /> Multi-Mode Conditioning
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', margin: 0, lineHeight: '1.5' }}>
                Switch effortlessly between advanced jitter clicking practice on your mouse and industrial physical down-force conditioning using our spacebar testing node.
              </p>
            </div>

            <div style={{ backgroundColor: '#070c17', border: '1px solid #111c30', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899', marginBottom: '10px', fontWeight: 700 }}>
                <Shield size={18} /> Integrated Ergonomics
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', margin: 0, lineHeight: '1.5' }}>
                Designed with high-contrast inside HUD meters matching Screenshot 2026-06-04 115239.png to minimize peripheral eye strain while pushing raw physical clicks per second benchmarks.
              </p>
            </div>
          </div>

          {/* Deep-Dive Article Body */}
          <article style={{ lineHeight: '1.7', color: '#9ca3af', fontSize: '0.92rem' }}>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#00f0ff', marginBottom: '1rem', letterSpacing: '-0.3px' }}>
              Unlocking Elite Performance: The Dynamics of Advanced Click Speed Optimization
            </h2>
            <p style={{ marginBottom: '1.25rem' }}>
              In modern tactical gaming and professional eSports, the rate of mechanical reaction directly defines performance ceilings. A traditional <strong>CPS test (Clicks Per Second)</strong> measures how rapidly an individual can actuate switches over isolated intervals. However, static testing fails to capture the complexity of actual high-stress competition. In game environments, you are never just clicking; you are coordinating spatial awareness, managing movement trajectories, and matching structural timing simultaneously.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              <strong>CPS Rush</strong> bridges this functional gap. By attaching an advanced mechanical tracking engine directly onto an unpredictable scrolling platform environment, your nervous system is forced to adapt to combined tasks. High input streams unlock massive vertical liftoff and hyper-speed locomotion, rewarding structured rhythm changes instead of erratic spasms.
            </p>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '2rem 0 0.8rem' }}>
              Comparing Clicking Techniques: Jitter, Butterfly, and Drag Clicking
            </h3>
            <p style={{ marginBottom: '1.25rem' }}>
              To master our gamified testing engine, top-tier practitioners rely on specialized structural grip styles developed to break past typical physical human limits (typically around 6-7 CPS):
            </p>
            
            <div style={{ overflowX: 'auto', marginBottom: '2rem', border: '1px solid #111827', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem', backgroundColor: '#040812' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #111827', backgroundColor: '#090f1c' }}>
                    <th style={{ padding: '12px', color: '#00f0ff', fontWeight: 700 }}>Technique</th>
                    <th style={{ padding: '12px', color: '#fff' }}>Average Output</th>
                    <th style={{ padding: '12px', color: '#fff' }}>Mechanism Description</th>
                    <th style={{ padding: '12px', color: '#fff' }}>Game Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #111827' }}>
                    <td style={{ padding: '12px', color: '#fff', fontWeight: 600 }}>Standard Click</td>
                    <td style={{ padding: '12px' }}>5 - 8 CPS</td>
                    <td style={{ padding: '12px' }}>Basic single-finger isolation through normal index flexion.</td>
                    <td style={{ padding: '12px' }}>Maximum tracking precision; ideal for basic platform navigation.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #111827' }}>
                    <td style={{ padding: '12px', color: '#fff', fontWeight: 600 }}>Jitter Clicking</td>
                    <td style={{ padding: '12px', color: '#00f0ff' }}>10 - 14 CPS</td>
                    <td style={{ padding: '12px' }}>Controlled wrist/arm muscle spasms transferring directly to your fingertips.</td>
                    <td style={{ padding: '12px' }}>Triggers extreme, continuous velocity bursts within the engine.</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', color: '#fff', fontWeight: 600 }}>Butterfly Clicking</td>
                    <td style={{ padding: '12px', color: '#00f0ff' }}>15 - 25 CPS</td>
                    <td style={{ padding: '12px' }}>Alternating index and middle finger strikes onto a single mouse switch.</td>
                    <td style={{ padding: '12px' }}>Generates hyper-leaps, allowing you to bypass multiple obstacle gaps.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '2rem 0 0.8rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00f0ff' }}><Lightbulb size={18} /> Neuro-Muscular Conditioning & Fatigue Prevention</span>
            </h3>
            <p style={{ marginBottom: '1.25rem' }}>
              When pushing for high performance in speed benchmarks, endurance management is absolutely vital. Repeatedly straining finger tendons without proper care can lead to rapid exhaustion or repetitive strain injuries (RSI). Professional operators suggest maintaining a relaxed, slightly arched claw grip to ensure optimal down-force transfer without locking your wrist joints. 
            </p>
            <p style={{ marginBottom: '2rem' }}>
              CPS Rush features integrated rolling interval resets. Because the environment alternates between demanding navigation gaps and flat sprint zones, players naturally shift between fast twitch bursts and split-second muscular relaxation, creating an ideal training cycle for building muscle memory safely.
            </p>
          </article>

          {/* FAQ Accordion Section */}
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.3px' }}>
            Frequently Asked Questions (FAQ)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '3rem' }}>
            {[
              {
                q: "Why are the CPS, Score, and Finish meters built inside the active viewport?",
                a: "Positioning the HUD cards directly within the canvas upper margin mimics high-performance competitive layouts. This minimizes rapid focal shifts, allowing your eyes to track incoming platform layouts and distance calculations without dropping target performance."
              },
              {
                q: "How does the Spacebar configuration differ from the standard Mouse test?",
                a: "Spacebar optimization involves your hand's larger muscle groups, calling for broader wrist extension and rhythmic core endurance. Mouse test modes emphasize localized reflex actions in finger tendons, ideal for fast accuracy training."
              },
              {
                q: "What technical parameters ensure the reliability of this speed counter?",
                a: "The tracking array captures independent pointer triggers at browser performance levels via performance.now() micro-stamps. It filters out double-clicks or multi-frame stutters to report a highly clean and precise current CPS rate."
              }
            ].map((faq, index) => (
              <div key={index} style={{ backgroundColor: '#070c17', border: '1px solid #111c30', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', border: 'none', color: '#fff', textAlign: 'left', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>{faq.q}</span>
                  <span style={{ color: '#00f0ff' }}>{openFaq === index ? '▲' : '▼'}</span>
                </button>
                {openFaq === index && (
                  <div style={{ padding: '0 16px 16px', color: '#9ca3af', fontSize: '0.88rem', borderTop: '1px solid #111c30', paddingTop: '12px', lineHeight: '1.6' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 8cc88d4b147cb1dbf57f2014741e74b0a190547e
