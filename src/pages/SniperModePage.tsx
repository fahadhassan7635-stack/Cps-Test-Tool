import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Target {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

type Phase = 'idle' | 'running' | 'done';
type FeedbackType = 'perfect' | 'hit' | 'miss' | null;

const HIT_RADIUS = 18;
const PERFECT_RADIUS = 7;
const GAME_DURATION = 30;

export default function SniperModePage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState<{ type: FeedbackType; text: string } | null>(null);
  const [swayPct, setSwayPct] = useState(0.5);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mutable refs for animation loop (avoid stale closures)
  const phaseRef = useRef<Phase>('idle');
  const targetRef = useRef<Target | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const breathTRef = useRef(0);
  const hitRef = useRef(0);
  const totalRef = useRef(0);
  const scoreRef = useRef(0);
  const missRef = useRef(0);

  const makeTarget = useCallback((): Target | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const w = canvas.width;
    const h = canvas.height;
    const size = 10;
    return {
      id: Date.now(),
      x: size + 60 + Math.random() * (w - size * 2 - 120),
      y: size + 60 + Math.random() * (h - size * 2 - 120),
      vx: (Math.random() - 0.5) * 3.2,
      vy: (Math.random() - 0.5) * 3.2,
      size,
    };
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const area = areaRef.current;
    if (!canvas || !area) return;
    const rect = area.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  const getScopeOffset = useCallback(() => {
    const t = breathTRef.current;
    const swayX = Math.sin(t * 1.1) * 10 + Math.sin(t * 2.7) * 4;
    const swayY = Math.cos(t * 0.9) * 8 + Math.cos(t * 2.3) * 3;
    const pct = (Math.sin(t * 0.5) + 1) / 2;
    setSwayPct(pct);
    return { swayX, swayY };
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (phaseRef.current !== 'running') return;

    // Advance breath
    breathTRef.current += 0.018;
    const { swayX, swayY } = getScopeOffset();

    // Move target
    const t = targetRef.current;
    if (t) {
      t.x += t.vx;
      t.y += t.vy;
      if (t.x <= t.size || t.x >= w - t.size) t.vx *= -1;
      if (t.y <= t.size || t.y >= h - t.size) t.vy *= -1;
      t.x = Math.max(t.size, Math.min(w - t.size, t.x));
      t.y = Math.max(t.size, Math.min(h - t.size, t.y));

      // Draw target glow rings
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,45,85,0.08)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,45,85,0.15)';
      ctx.fill();

      // Target body
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
      ctx.fillStyle = '#ff2d55';
      ctx.fill();

      // Target center dot
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // Scope center (mouse + sway)
    const cx = mouseRef.current.x + swayX;
    const cy = mouseRef.current.y + swayY;

    const dist = t ? Math.hypot(cx - t.x, cy - t.y) : 9999;
    const aligned = dist <= HIT_RADIUS;
    const perfect = dist <= PERFECT_RADIUS;

    const scopeColor = perfect
      ? 'rgba(0,230,120,0.9)'
      : aligned
      ? 'rgba(255,215,0,0.85)'
      : 'rgba(255,255,255,0.75)';

    const scopeColorFaint = perfect
      ? 'rgba(0,230,120,0.4)'
      : aligned
      ? 'rgba(255,215,0,0.4)'
      : 'rgba(255,255,255,0.2)';

    const scopeR = 54;
    const gap = 8;

    // Scope vignette overlay
    const grad = ctx.createRadialGradient(cx, cy, scopeR * 0.6, cx, cy, scopeR * 2.2);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.arc(cx, cy, scopeR, 0, Math.PI * 2, true);
    ctx.fillStyle = grad;
    ctx.fill('evenodd');

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR, 0, Math.PI * 2);
    ctx.strokeStyle = scopeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Middle ring
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = scopeColorFaint;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR * 0.2, 0, Math.PI * 2);
    ctx.strokeStyle = scopeColor;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Crosshair lines
    ctx.strokeStyle = scopeColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - scopeR, cy); ctx.lineTo(cx - gap, cy);
    ctx.moveTo(cx + gap, cy);   ctx.lineTo(cx + scopeR, cy);
    ctx.moveTo(cx, cy - scopeR); ctx.lineTo(cx, cy - gap);
    ctx.moveTo(cx, cy + gap);   ctx.lineTo(cx, cy + scopeR);
    ctx.stroke();

    // Mil-dot ticks
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.8;
    const tickLen = 4;
    for (let i = 1; i <= 3; i++) {
      const off = scopeR * (i / 4);
      ctx.beginPath();
      ctx.moveTo(cx - off, cy - tickLen / 2); ctx.lineTo(cx - off, cy + tickLen / 2);
      ctx.moveTo(cx + off, cy - tickLen / 2); ctx.lineTo(cx + off, cy + tickLen / 2);
      ctx.moveTo(cx - tickLen / 2, cy - off); ctx.lineTo(cx + tickLen / 2, cy - off);
      ctx.moveTo(cx - tickLen / 2, cy + off); ctx.lineTo(cx + tickLen / 2, cy + off);
      ctx.stroke();
    }

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = perfect ? '#00e678' : aligned ? '#ffd700' : 'rgba(255,255,255,0.9)';
    ctx.fill();

    animRef.current = requestAnimationFrame(drawFrame);
  }, [getScopeOffset]);

  const showFeedback = useCallback((type: FeedbackType, text: string) => {
    setFeedback({ type, text });
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 900);
  }, []);

  const handleShoot = useCallback((clientX: number, clientY: number) => {
    if (phaseRef.current !== 'running') return;
    const canvas = canvasRef.current;
    const area = areaRef.current;
    if (!canvas || !area) return;

    const rect = area.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const t = breathTRef.current;
    const swayX = Math.sin(t * 1.1) * 10 + Math.sin(t * 2.7) * 4;
    const swayY = Math.cos(t * 0.9) * 8 + Math.cos(t * 2.3) * 3;
    const cx = mx + swayX;
    const cy = my + swayY;

    const target = targetRef.current;
    if (!target) return;

    const dist = Math.hypot(cx - target.x, cy - target.y);
    totalRef.current++;

    if (dist <= PERFECT_RADIUS) {
      scoreRef.current += 200;
      hitRef.current++;
      setScore(scoreRef.current);
      showFeedback('perfect', '★ Perfect Hit! +200');
      targetRef.current = makeTarget();
    } else if (dist <= HIT_RADIUS) {
      scoreRef.current += 100;
      hitRef.current++;
      setScore(scoreRef.current);
      showFeedback('hit', '✓ Hit! +100');
      targetRef.current = makeTarget();
    } else {
      missRef.current++;
      setMisses(missRef.current);
      showFeedback('miss', '✕ Miss');
    }
  }, [makeTarget, showFeedback]);

  const startGame = useCallback(() => {
    resizeCanvas();
    phaseRef.current = 'running';
    hitRef.current = 0;
    totalRef.current = 0;
    scoreRef.current = 0;
    missRef.current = 0;
    breathTRef.current = 0;
    setPhase('running');
    setScore(0);
    setMisses(0);
    setTimeLeft(GAME_DURATION);
    setFeedback(null);
    targetRef.current = makeTarget();

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(drawFrame);

    if (timerRef.current) clearInterval(timerRef.current);
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 0.1;
      const left = Math.max(0, GAME_DURATION - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current!);
        cancelAnimationFrame(animRef.current);
        phaseRef.current = 'done';
        targetRef.current = null;
        setPhase('done');
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }, 100);
  }, [makeTarget, drawFrame, resizeCanvas]);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    phaseRef.current = 'idle';
    targetRef.current = null;
    setPhase('idle');
    setScore(0);
    setMisses(0);
    setTimeLeft(GAME_DURATION);
    setFeedback(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Mouse/touch tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  }, []);

  useEffect(() => {
    resizeCanvas();
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [resizeCanvas]);

  const acc = totalRef.current > 0
    ? Math.round((hitRef.current / totalRef.current) * 100)
    : 100;

  const feedbackStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px 20px',
    borderRadius: '24px',
    fontWeight: 800,
    fontSize: '1.05rem',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    transition: 'opacity 0.15s',
    opacity: feedback ? 1 : 0,
    ...(feedback?.type === 'perfect'
      ? { background: 'rgba(0,230,120,0.15)', color: '#00e678', border: '1px solid rgba(0,230,120,0.4)' }
      : feedback?.type === 'hit'
      ? { background: 'rgba(255,215,0,0.13)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.4)' }
      : { background: 'rgba(255,45,85,0.13)', color: '#ff2d55', border: '1px solid rgba(255,45,85,0.4)' }),
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Aim Tool</div>
        <h1 className="tool-title">Sniper Mode</h1>
        <p className="tool-subtitle">
          Move to align the scope center with the target — click to shoot. Compensate for breathing sway!
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { value: score, label: 'Score', color: 'var(--neon-cyan)' },
          { value: `${acc}%`, label: 'Accuracy', color: 'var(--neon-green)' },
          { value: misses, label: 'Misses', color: 'var(--neon-red)' },
          { value: timeLeft.toFixed(1), label: 'Time', color: 'var(--neon-orange)' },
        ].map(s => (
          <div
            key={s.label}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: '1rem' }}>
        <div
          className="progress-fill"
          style={{ width: `${((GAME_DURATION - timeLeft) / GAME_DURATION) * 100}%` }}
        />
      </div>

      {/* Arena */}
      <div
        ref={areaRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onClick={e => handleShoot(e.clientX, e.clientY)}
        onTouchEnd={e => {
          e.preventDefault();
          const t = e.changedTouches[0];
          if (t) handleShoot(t.clientX, t.clientY);
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: '380px',
          background: '#080d14',
          border: `2px solid ${phase === 'running' ? 'rgba(255,45,85,0.5)' : 'var(--border)'}`,
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: phase === 'running' ? 'none' : 'default',
          marginBottom: '1.5rem',
        }}
      >
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />

        {/* Feedback toast */}
        <div style={feedbackStyle}>{feedback?.text ?? ''}</div>

        {/* Breath / sway meter */}
        {phase === 'running' && (
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              right: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '0.62rem', color: '#6b7280', textTransform: 'uppercase' }}>Sway</span>
            <div style={{ width: '80px', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.round(swayPct * 100)}%`,
                  background: 'rgba(0,180,255,0.7)',
                  borderRadius: '4px',
                  transition: 'width 0.05s',
                }}
              />
            </div>
          </div>
        )}

        {/* Idle / Done overlay */}
        {phase !== 'running' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '4rem' }}>🔭</span>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: phase === 'done' ? 'var(--neon-orange)' : 'var(--neon-red)',
              }}
            >
              {phase === 'done' ? `Final Score: ${score}` : 'Align scope center — click to shoot'}
            </span>
            {phase === 'done' && (
              <span style={{ color: 'var(--neon-green)' }}>
                {acc}% Accuracy — {hitRef.current} hits / {totalRef.current} shots
              </span>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
        {phase !== 'running' && (
          <button className="btn btn-primary" onClick={startGame}>
            {phase === 'done' ? '▶ Play Again' : '🔭 Start Sniper Mode'}
          </button>
        )}
        {phase !== 'idle' && (
          <button className="btn btn-secondary" onClick={resetGame}>
            🔄 Reset
          </button>
        )}
      </div>

      {/* SEO / Education Section */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2.5rem',
          marginTop: '3rem',
        }}
      >
        <article style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.8' }}>
          <h2
            style={{
              fontWeight: 800,
              fontSize: '2rem',
              marginBottom: '1.5rem',
              color: 'var(--neon-red)',
              marginTop: 0,
              letterSpacing: '-0.5px',
            }}
          >
            The Ultimate Guide to Sniper Aiming & Target Tracking
          </h2>

          <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#d1d5db' }}>
            The <strong>Sniper Mode Aim Trainer</strong> is an advanced visual calibration tool designed specifically
            to evaluate and sharpen your <strong>Tracking Aim</strong>. Unlike static clicking tools, tracking requires
            your hand muscles to maintain continuous synchronization with an unpredictable, moving target. Whether you
            are using a sniper rifle to hit a running player or tracking a fast-moving vehicle, mastering your dynamic
            cursor control is the ultimate key to dominating competitive tactical shooters.
          </p>

          <div
            style={{
              background: 'rgba(255, 45, 85, 0.05)',
              borderLeft: '4px solid var(--neon-red)',
              borderRadius: '0 12px 12px 0',
              padding: '1.5rem',
              marginBottom: '2.5rem',
            }}
          >
            <h3
              style={{
                color: '#fff',
                fontSize: '1.3rem',
                fontWeight: 700,
                marginTop: 0,
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🖱️ The Ultimate &quot;New Mouse&quot; Tracking Check
            </h3>
            <p style={{ margin: 0, color: '#9ca3af' }}>
              Just bought a premium gaming mouse? Our Sniper Mode is the absolute best way to perform a{' '}
              <strong>new mouse check</strong>. By tracking the small bouncing dot, you can instantly verify your
              sensor&apos;s polling rate stability, test your PTFE mouse skates for smooth gliding, and fine-tune your
              DPI before stepping into ranked matches.
            </p>
          </div>

          <h3 style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Why Tracking Precision Dominates Modern Gaming
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Sniping and tracking are universally feared skills. A player who can consistently hit a moving target
            applies immense psychological pressure on the enemy team. Training your tracking aim dramatically boosts
            your performance in these popular games:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '3rem',
            }}
          >
            {[
              'Minecraft', 'Roblox', 'Fortnite', 'Grand Theft Auto V',
              'Call of Duty: Warzone', 'League of Legends', 'Counter-Strike 2',
              'PUBG: Battlegrounds', 'Genshin Impact', 'Among Us',
            ].map(game => (
              <div
                key={game}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: '#e5e7eb',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ color: 'var(--neon-red)' }}>🔭</span> {game}
              </div>
            ))}
          </div>

          <h2
            style={{
              fontWeight: 800,
              fontSize: '1.8rem',
              marginBottom: '1.5rem',
              color: '#fff',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '1rem',
            }}
          >
            Pro Sniping Strategies & Aim FAQs
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                How to improve Snipe and Tracking Aim in PUBG & Warzone?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                In large-scale Battle Royales like <strong>PUBG: Battlegrounds</strong> and{' '}
                <strong>Call of Duty: Warzone</strong>, enemies are rarely standing still. To hit a running target with
                a Kar98k or HDR, you must master the art of &quot;leading&quot; your shot. Our Sniper Mode helps you
                build the muscle memory required to track a target seamlessly without jittering your wrist. The
                constant directional changes of the red dot train your eyes to predict movement vectors perfectly.
              </p>
            </div>

            <div>
              <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                How to increase precision with Sniper Rifles in CS2 & Valorant?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                Using the AWP in <strong>Counter-Strike 2</strong> or the Operator in Valorant requires extreme
                discipline. If you miss your first shot, you are likely dead. Playing our Sniper Mode daily trains you
                to click the mouse exactly when your crosshair aligns with a tiny moving hitbox, drastically improving
                your single-shot accuracy.
              </p>
            </div>

            <div>
              <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                How to get better Bow Aim and PvP Tracking in Minecraft?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                While &quot;Fast CPS&quot; is famous for sword combat in <strong>Minecraft</strong>, tracking is what
                wins ranged bow fights. Sniper mode forces you to keep your cursor glued to the target, enhancing your
                PvP tracking skills on popular servers like Hypixel.
              </p>
            </div>

            <div>
              <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                How to improve reaction time to unpredictable movement?
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                When the target hits a wall, it bounces back instantly, replicating an enemy suddenly changing
                direction. To improve your reaction time:
                <br /><br />
                <strong>1. Don&apos;t Predict, React:</strong> Keep your eyes locked on the dot itself, not your crosshair.
                <br />
                <strong>2. Relax Your Grip:</strong> A relaxed grip allows for smoother micro-adjustments.
                <br />
                <strong>3. Higher Refresh Rate:</strong> Playing on a 144Hz or 240Hz monitor significantly lowers visual
                reaction latency.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255, 107, 0, 0.05)',
                border: '1px solid rgba(255,107,0,0.2)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginTop: '1rem',
              }}
            >
              <h4 style={{ color: 'var(--neon-orange)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                💡 Pro Tip: Optimize Your Sensitivity (eDPI)
              </h4>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.9rem' }}>
                If you find yourself constantly &quot;overshooting&quot; the red target, your mouse sensitivity is too
                high. Lowering your DPI (e.g., to 400 or 800) and using your forearm to track movements provides
                exponentially higher consistency than relying solely on your wrist.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
