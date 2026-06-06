import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MousePointer2, Keyboard, Play, RotateCcw, Trophy, Zap, Activity, Shield, Lightbulb, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

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
  
  const [cps, setCps] = useState(0);
  const clickTimestamps = useRef<number[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const ball = useRef({ x: 50, y: 260, vy: 0, vx: 0 });
  const platforms = useRef<Platform[]>([]);
  const finishX = useRef(0);
  const cameraX = useRef(0);
  const frameId = useRef<number>(0);
  const keysPressed = useRef<Record<string, boolean>>({});

  const recordClick = useCallback(() => {
    const now = performance.now();
    clickTimestamps.current.push(now);
  }, []);

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
    
    const p: Platform[] = [{ x: 0, y: 350, width: 220, height: 16, color: '#00f0ff' }];
    let lastX = 220;
    let lastY = 350;
    for (let i = 0; i < 35; i++) {
      const width = Math.max(80, 160 - i * 2);
      const gap = 120 + Math.random() * 80 + (i * 1.5);
      const yOffset = (Math.random() - 0.5) * 140;
      const nextY = Math.min(Math.max(160, lastY + yOffset), 380);
      p.push({ x: lastX + gap, y: nextY, width, height: 14, color: '#00f0ff' });
      lastX += gap + width;
      lastY = nextY;
    }
    const finalX = lastX + 180;
    p.push({ x: finalX, y: lastY - 60, width: 120, height: 160, color: '#ff00aa', isEnd: true });
    finishX.current = finalX;
    platforms.current = p;
    setDistanceToFinish(Math.floor(finalX / 10));
  }, []);

  const handleInput = useCallback(() => {
    if (gameState === 'playing') recordClick();
  }, [gameState, recordClick]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (e.code === 'Space' && inputMode === 'keyboard' && gameState === 'playing') {
        e.preventDefault();
        handleInput();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.code] = false; };
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
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-cameraX.current % 45, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for(let x = 0; x <= canvas.width + 45; x += 45) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.translate(-cameraX.current, 0);
    platforms.current.forEach(p => {
      if (p.x + p.width > cameraX.current && p.x < cameraX.current + canvas.width) {
        ctx.shadowBlur = 15; ctx.shadowColor = p.color; ctx.fillStyle = p.color;
        if (p.isEnd) {
          ctx.beginPath(); ctx.roundRect(p.x, p.y, p.width, p.height, 12); ctx.fill();
          ctx.font = 'bold 20px sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
          ctx.fillText('FINISH', p.x + p.width / 2, p.y + p.height / 2 + 7);
        } else {
          ctx.beginPath(); ctx.roundRect(p.x, p.y, p.width, p.height, 6); ctx.fill();
        }
      }
    });
    ctx.shadowBlur = 18; ctx.shadowColor = '#00f0ff'; ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(ball.current.x, ball.current.y, BALL_RADIUS, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#030712'; ctx.lineWidth = 2; ctx.stroke();
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
    cameraX.current = ball.current.x - 220;
    platforms.current.forEach(p => {
      if ( ball.current.x + BALL_RADIUS > p.x && ball.current.x - BALL_RADIUS < p.x + p.width && ball.current.y + BALL_RADIUS > p.y && ball.current.y - BALL_RADIUS < p.y + p.height && ball.current.vy > 0 ) {
        if (p.isEnd) { setGameState('won'); confetti({ particleCount: 140, spread: 65, colors: ['#00f0ff', '#ff00aa'] }); return; }
        ball.current.y = p.y - BALL_RADIUS;
        ball.current.vy = INITIAL_JUMP_FORCE - jumpBoost;
      }
    });
    setScore(Math.floor(ball.current.x / 80));
    setDistanceToFinish(Math.max(0, Math.floor((finishX.current - ball.current.x) / 5)));
    if (ball.current.y > CANVAS_HEIGHT + 150) initGame();
    draw();
    frameId.current = requestAnimationFrame(update);
  }, [gameState, initGame, draw]);

  useEffect(() => {
    if (gameState === 'playing') frameId.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId.current);
  }, [gameState, update]);

  const startGame = () => { initGame(); setGameState('playing'); };

  return (
    // FIXED: Removed minHeight 100vh and background - now it fits inside Layout
    <div style={{ width: '100%', color: '#ffffff' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <div style={{ display: 'inline-flex', backgroundColor: 'rgba(0, 240, 255, 0.06)', border: '1px solid rgba(0, 240, 255, 0.2)', color: '#00f0ff', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
            MOUSE & KEYBOARD SPEED TEST
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0, color: '#00f0ff', letterSpacing: '-0.5px' }}>
            CPS RUSH
          </h1>
        </header>

        <div onPointerDown={() => { if (inputMode === 'mouse' && gameState === 'playing') handleInput(); }}
          style={{ position: 'relative', width: '100%', maxHeight: '440px', aspectRatio: '16/9', backgroundColor: '#030712', borderRadius: '16px', overflow: 'hidden', border: '1px solid #111827', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)', touchAction: 'none' }}
        >
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ width: '100%', height: '100%', display: 'block' }} />
          
          <div style={{ position: 'absolute', top: '16px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{ background: 'rgba(4, 9, 20, 0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '14px', width: '85px', padding: '8px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#00f0ff' }}>CPS</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{cps}</div>
            </div>
            <div style={{ background: 'rgba(4, 9, 20, 0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(219, 39, 119, 0.3)', borderRadius: '14px', width: '85px', padding: '8px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#db2777' }}>Score</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{score}</div>
            </div>
            <div style={{ background: 'rgba(4, 9, 20, 0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '14px', minWidth: '95px', padding: '8px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#ec4899' }}>Finish</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{distanceToFinish}<span style={{ fontSize: '15px', color: '#cbcbcb', marginLeft: '1px' }}>m</span></div>
            </div>
          </div>

          {gameState === 'menu' && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(2, 4, 10, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.2rem', color: '#fff' }}>SELECT INPUT MODE</h2>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '1.8rem', width: '100%', maxWidth: '340px' }}>
                <button onClick={() => setInputMode('mouse')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontWeight: 'bold', backgroundColor: inputMode === 'mouse' ? 'rgba(0, 240, 255, 0.08)' : '#0b111e', borderColor: inputMode === 'mouse' ? '#00f0ff' : '#1f2937', color: inputMode === 'mouse' ? '#00f0ff' : '#9ca3af' }}>
                  <MousePointer2 size={14} /> Mouse
                </button>
                <button onClick={() => setInputMode('keyboard')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontWeight: 'bold', backgroundColor: inputMode === 'keyboard' ? 'rgba(0, 240, 255, 0.08)' : '#0b111e', borderColor: inputMode === 'keyboard' ? '#00f0ff' : '#1f2937', color: inputMode === 'keyboard' ? '#00f0ff' : '#9ca3af' }}>
                  <Keyboard size={14} /> Spacebar
                </button>
              </div>
              <button onClick={startGame} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#00f0ff', color: '#02040a', padding: '12px 36px', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                <Play fill="currentColor" size={12} /> START GAME
              </button>
            </div>
          )}

          {gameState === 'won' && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(2, 4, 10, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={28} style={{ color: '#00f0ff', marginBottom: '12px' }} />
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>FINISHED!</h2>
              <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Score: <span style={{ color: '#00f0ff', fontWeight: 700 }}>{score}</span></p>
              <button onClick={startGame} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#00f0ff', color: '#02040a', padding: '10px 24px', borderRadius: '6px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                <RotateCcw size={14} /> PLAY AGAIN
              </button>
            </div>
          )}
        </div>

        {/* ... বাকি Article এবং FAQ সেকশন আপনার আগের মতোই থাকবে ... */}
      </div>
    </div>
  );
}
