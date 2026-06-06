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
    <div style={{ width: '100%', color: '#ffffff' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '4rem' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '1.2rem', paddingTop: '2rem' }}>
          <div style={{ display: 'inline-flex', backgroundColor: 'rgba(0, 240, 255, 0.06)', border: '1px solid rgba(0, 240, 255, 0.2)', color: '#00f0ff', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
            MOUSE & KEYBOARD SPEED TEST
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0, color: '#00f0ff', letterSpacing: '-0.5px' }}>
            CPS RUSH
          </h1>
        </header>

        <div onPointerDown={() => { if (inputMode === 'mouse' && gameState === 'playing') handleInput(); }}
          style={{ position: 'relative', width: '100%', maxHeight: '440px', aspectRatio: '16/9', backgroundColor: '#030712', borderRadius: '16px', overflow: 'hidden', border: '1px solid #111827', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)', touchAction: 'none', marginBottom: '3rem' }}
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

        {/* ================= MASSIVE SEO ARTICLE SECTION ================= */}
        <div style={{ borderTop: '1px solid #1f2937', paddingTop: '3rem' }}>
          
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
            The Ultimate Guide to CPS Mastery and Platforming Speed
          </h2>
          
          <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
            <strong>CPS Rush</strong> is a hybrid platformer and speed-testing simulator designed to push your mechanical limits. By tying your <em>Clicks Per Second (CPS)</em> directly to your in-game movement speed and jump height, this tool trains your hand endurance while challenging your spatial awareness. Whether you prefer smashing the spacebar or jitter-clicking your mouse, mastering this momentum-based challenge will elevate your performance in top-tier competitive games.
          </p>

          {/* Ultimate Hardware Check Box */}
          <div style={{ backgroundColor: 'rgba(0, 240, 255, 0.05)', borderLeft: '4px solid #00f0ff', padding: '1.5rem', borderRadius: '0 12px 12px 0', marginBottom: '3rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.25rem', fontWeight: 800, marginTop: 0, marginBottom: '0.75rem' }}>
              <MousePointer2 size={20} color="#00f0ff" />
              The Ultimate &quot;New Mouse &amp; Keyboard Check&quot;
            </h3>
            <p style={{ color: '#9ca3af', margin: 0, lineHeight: '1.6' }}>
              Did you recently upgrade your gaming setup? <strong>CPS Rush</strong> acts as an incredibly effective <strong>new mouse check</strong> and keyboard switch tester. Use the mouse mode to verify your main button&apos;s debounce time and ensure it doesn&apos;t suffer from accidental double-clicking. Switch to Keyboard mode to test your mechanical switch actuation point (like Cherry MX or optical switches) by spamming the spacebar to generate maximum jumping momentum!
            </p>
          </div>

          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '1.2rem' }}>
            Why High CPS Elevates Your Gameplay
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Clicking speed is a universal skill that dictates how quickly you can execute actions per minute (APM). Practicing your click stamina on our CPS platformer directly prepares your muscles for intense moments in the world&apos;s most popular gaming titles:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '3.5rem' }}>
            {['Minecraft', 'Roblox', 'Fortnite', 'Grand Theft Auto V', 'Call of Duty: Warzone', 'League of Legends', 'Counter-Strike 2', 'PUBG: Battlegrounds', 'Genshin Impact', 'Among Us'].map((game) => (
              <div key={game} style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#e5e7eb', fontWeight: 600, fontSize: '0.9rem' }}>
                <Zap size={16} color="#ff00aa" /> {game}
              </div>
            ))}
          </div>

          {/* FAQs & Pro Strategies */}
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '1rem', marginBottom: '2rem' }}>
            Pro Gamer FAQs &amp; Strategies
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Minecraft */}
            <div>
              <h3 style={{ color: '#00f0ff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                How to get fast CPS in Minecraft?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0, lineHeight: '1.7' }}>
                In <strong>Minecraft</strong>, a high CPS rate reduces your incoming knockback during PvP encounters and is required for complex speed-bridging techniques. To achieve fast CPS, players utilize specialized hand grips. <strong>Jitter Clicking</strong> involves vibrating your forearm muscles to tap the mouse, yielding 10-14 CPS. <strong>Butterfly Clicking</strong> uses your index and middle fingers to strike the button alternately, often hitting 15-20 CPS. You can test both methods safely in CPS Rush to see how much speed boost you can generate!
              </p>
            </div>

            {/* PUBG */}
            <div>
              <h3 style={{ color: '#00f0ff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                How to improve CPS in PUBG: Battlegrounds?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0, lineHeight: '1.7' }}>
                If you are using designated marksman rifles (DMRs) or burst-fire weapons in <strong>PUBG</strong>, your tapping speed determines your time-to-kill (TTK). To improve, you must practice <em>trigger discipline</em>. Instead of tensing your whole hand, rely on short, explosive taps using just your fingertip. Practicing in this tool ensures you can maintain a high fire rate without your hand cramping during the final circles.
              </p>
            </div>

            {/* Valorant */}
            <div>
              <h3 style={{ color: '#00f0ff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                How to increase clicking speed and accuracy in Valorant?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0, lineHeight: '1.7' }}>
                Unlike tracking-heavy games, <strong>Valorant</strong> requires precise, controlled clicks. However, during pistol rounds, being able to rapid-fire a Classic or Frenzy is essential. To increase your speed while maintaining accuracy, make sure your wrist is anchored to the desk or mousepad. The movement tracking in CPS Rush helps you decouple your clicking action from your tracking action, ensuring your crosshair doesn&apos;t shake when you click rapidly.
              </p>
            </div>

            {/* Reaction Time */}
            <div>
              <h3 style={{ color: '#00f0ff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                How to improve reaction time in FPS games?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0, lineHeight: '1.7' }}>
                In high-octane FPS games like <strong>Counter-Strike 2 (CS2)</strong> and fast-paced battle royales, human reaction time is the defining factor of success. To improve:
                <br/><br/>
                1. <strong>Visual Prediction:</strong> In CPS Rush, you have to predict platform gaps and adjust your clicking speed dynamically. This trains your brain to process visual depth faster.<br/>
                2. <strong>Hardware Optimization:</strong> Playing on a 144Hz or 240Hz monitor drastically reduces input lag.<br/>
                3. <strong>Warm-up Routines:</strong> Play 3-5 rounds of this tool before launching your competitive matches to wake up your central nervous system and get the blood flowing to your hands.
              </p>
            </div>

            {/* General Health Tip */}
            <div style={{ backgroundColor: 'rgba(255, 0, 170, 0.05)', border: '1px solid rgba(255, 0, 170, 0.2)', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff00aa', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                <Shield size={18} /> A Note on Wrist Health
              </h4>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
                Generating extremely high CPS via jittering or intense spacebar tapping can strain your forearm tendons. To avoid repetitive strain injuries or carpal tunnel syndrome, always perform wrist stretches before gaming and avoid practicing these intense mechanics for more than 10-15 minutes at a time without resting.
              </p>
            </div>

          </div>
        </div>
        {/* ================= SEO ARTICLE SECTION END ================= */}

      </div>
    </div>
  );
}
