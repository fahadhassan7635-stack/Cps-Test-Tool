"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Maximize, Minimize } from 'lucide-react';


interface ToolLink { label: string; href: string; icon: React.ReactNode; }

const MORE_TOOLS: ToolLink[] = [
  { label: 'CPS Test', href: '/cps-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Spacebar Counter', href: '/spacebar', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="6" y1="15" x2="18" y2="15"/></svg> },
  { label: 'Aim Trainer', href: '/aim-trainer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
  { label: 'Typing Test', href: '/typing-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 15h8M7 11h2m3 0h2m3 0h-1"/></svg> },
  { label: 'Reaction Time', href: '/reaction-time', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: 'Scroll Test', href: '/scroll-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="9"/><path d="M9 11l3-3 3 3"/><path d="M9 13l3 3 3-3"/></svg> },
  { label: 'Double Click', href: '/double-click', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/></svg> },
  { label: '3D Aim Trainer', href: '/3d-aim-trainer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/><circle cx="12" cy="12" r="8" opacity=".4"/></svg> },
  { label: 'Mouse Accuracy', href: '/mouse-accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 2v10"/></svg> },
  { label: 'Key Visualizer', href: '/key-visualizer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"/></svg> },
  { label: 'F1 Reaction', href: '/f1-reaction', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { label: 'Space Defense', href: '/space-defense', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { label: 'Accuracy Test', href: '/accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { label: 'CPS Rush', href: '/cps-rush', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 12v-4"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Voyager Game', href: '/voyager-game', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },
  { label: 'Space Waves', href: '/space-waves', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg> }
];

export default function SniperModePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

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

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'relative', background: '#0a0a0c', overflow: 'hidden' }}>
                {!gameStarted ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #1a2332 0%, #080d14 100%)', zIndex: 10 }}>
            <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>3D Aim Trainer</h2>
            <p style={{ color: '#8b949e', marginBottom: '2rem', textAlign: 'center', maxWidth: '400px' }}>A full 3D environment to train your flicking and tracking. Requires WebGL.</p>
            <button 
              onClick={() => setGameStarted(true)}
              style={{
                background: 'linear-gradient(135deg, #ff2d55, #ff6b00)',
                color: '#fff', border: 'none', padding: '1rem 2.5rem',
                fontSize: '1.1rem', fontWeight: 700, borderRadius: '50px',
                cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,45,85,0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Start Game
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src="/3d-aim-trainer.html"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="fullscreen"
            title="3D Aim Trainer"
          />
        )}
          <div style={{ position: 'absolute', top: '16px', left: '20px', zIndex: 100, pointerEvents: 'none' }}>
            <h1 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              3D Aim Trainer
            </h1>
          </div>
        <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '8px', zIndex: 100 }}>
          <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} style={{ background: 'rgba(4,9,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      <section aria-label="More Tools" style={{ maxWidth: '1000px', margin: '4rem auto 0 auto', padding: '0 2rem' }}>
        <h2 style={{
          fontWeight: 800, fontSize: '1.5rem', color: '#fff',
          marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '-0.3px',
        }}>More Tools</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '1rem',
        }}>
          {MORE_TOOLS.map(({ label, href, icon }) => (
            <a
              key={href}
              href={href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '0.6rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                padding: '1.2rem 0.5rem',
                cursor: 'pointer', textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = `rgba(79,195,247,0.08)`;
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(79,195,247,0.35)`;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#4fc3f7', transition: 'color 0.3s ease',
              }}>
                {icon}
              </div>
              <span style={{ color: '#d1d1de', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>{label}</span>
            </a>
          ))}
        </div>
      </section>
      
      
      
      
      <article style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', color: '#cbd5e1', fontFamily: 'system-ui, sans-serif', lineHeight: '1.6' }}>
        
        {/* Table of Contents */}
        <nav aria-label="Table of Contents" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', marginTop: 0 }}>Table of Contents</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem' }}>
            <li><a href="#introduction" style={{ color: '#4fc3f7', textDecoration: 'none' }}>1. Introduction to FPS Aim Training</a></li>
            <li><a href="#fixedaim-features" style={{ color: '#4fc3f7', textDecoration: 'none' }}>2. Why Choose FixedAim?</a></li>
            <li><a href="#how-to-use" style={{ color: '#4fc3f7', textDecoration: 'none' }}>3. How to Use FixedAim</a></li>
            <li><a href="#training-plan" style={{ color: '#4fc3f7', textDecoration: 'none' }}>4. 7-Day Beginner Training Plan</a></li>
            <li><a href="#game-specific" style={{ color: '#4fc3f7', textDecoration: 'none' }}>5. Game-Specific Aim Training (CS2, Valorant, Apex)</a></li>
            <li><a href="#aim-mechanics" style={{ color: '#4fc3f7', textDecoration: 'none' }}>6. Core Aim Mechanics Explained</a></li>
            <li><a href="#ergonomics-grips" style={{ color: '#4fc3f7', textDecoration: 'none' }}>7. Mouse Grips & Ergonomics</a></li>
            <li><a href="#comparison" style={{ color: '#4fc3f7', textDecoration: 'none' }}>8. FixedAim vs. Desktop Trainers</a></li>
            <li><a href="#hardware" style={{ color: '#4fc3f7', textDecoration: 'none' }}>9. Hardware & Settings Checklist</a></li>
            <li><a href="#faq" style={{ color: '#4fc3f7', textDecoration: 'none' }}>10. Frequently Asked Questions</a></li>
          </ul>
        </nav>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: '#fff', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>The Ultimate Guide to FPS Aim Training</h1>
        
        <section id="introduction" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Introduction to FPS Aim Training</h2>
          <p style={{ marginBottom: '1rem' }}>
            Aim training in a three-dimensional environment has revolutionized how competitive gamers prepare for tactical shooters and battle royales. Unlike simple 2D clicker games, an online aim practice tool immerses you in a simulated spatial environment that requires precise camera rotation, crosshair placement, and depth perception.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            According to principles of <a href="https://en.wikipedia.org/wiki/Motor_learning" target="_blank" rel="noopener noreferrer" style={{ color: '#4fc3f7', textDecoration: 'none' }}>motor learning</a>, the specificity of practice is paramount. When you train in a dedicated 3D space, you are engaging the exact spatial awareness mechanisms relied upon in actual gameplay. Consistent, targeted repetition may lead to structural changes in the brain that support rapid, automatic execution of complex motor tasks, commonly referred to as building "muscle memory."
          </p>
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 32px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(79,195,247,0.3)', transition: 'transform 0.2s' }}>
              Start Training Now
            </button>
          </div>
        </section>

        <section id="fixedaim-features" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Why Choose FixedAim?</h2>
          <p style={{ marginBottom: '1rem' }}>
            Built by passionate developers and competitive gamers, FixedAim provides a seamless, friction-free environment to hone your mechanics. We understand that you want to train without bloat, loading screens, or paywalls.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { title: '100% Free & Unlocked', desc: 'No premium subscriptions or hidden features.' },
              { title: 'Browser-Based', desc: 'Runs directly in your browser. Compatible with Chrome, Edge, Firefox, and Safari.' },
              { title: 'No Installation', desc: 'Zero downloads required. Get straight into the action in seconds.' },
              { title: 'Privacy First', desc: 'No login required. Your data and stats stay local to your machine.' }
            ].map((feature, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#4fc3f7', marginBottom: '0.5rem', marginTop: 0 }}>{feature.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem' }}>Live Performance Tracking</h3>
          <p style={{ marginBottom: '1rem' }}>Our tool doesn't just let you shoot targets; it tracks every micro-movement to provide real-time performance statistics, including:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#00f5ff' }}>Accuracy (%):</strong> Your precision rating. Hitting 90%+ consistently is better than missing fast.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#00ff88' }}>Hits & Misses:</strong> Raw hit and miss counts to evaluate your volume of fire and trigger discipline.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#bf5af2' }}>Score:</strong> An aggregated point system rewarding both speed and accuracy.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#ffd60a' }}>Session Time:</strong> A live timer to ensure you don't overtrain and hit cognitive fatigue.</li>
          </ul>
        </section>
        
        <section id="how-to-use" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>How to Use FixedAim (Step-by-Step)</h2>
          <p style={{ marginBottom: '1rem' }}>Getting started with FixedAim is incredibly simple. Follow these steps to begin your first session:</p>
          <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Match Your Sensitivity:</strong> Before starting, ensure your mouse DPI is set to your usual gaming standard (e.g., 400, 800, or 1600 DPI).</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Start the Trainer:</strong> Click the "Start Training" button at the top of the page. Your mouse cursor will lock to the screen for a true FPS experience.</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Acquire Targets:</strong> 3D targets will spawn randomly in the virtual environment. Look around using your mouse.</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Shoot and Track:</strong> Left-click to shoot. For moving targets, track them smoothly across your screen before firing.</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Analyze Your Stats:</strong> Press ESC at any time to pause the game and unlock your cursor. Review your Accuracy, Hits, and Misses on the HUD.</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Iterate and Repeat:</strong> Hit "Resume" to continue or "Restart" to wipe the slate clean and try for a higher score!</li>
          </ol>
        </section>
        
        <section id="training-plan" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>7-Day Beginner Training Plan</h2>
          <p style={{ marginBottom: '1rem' }}>Consistency is the secret to building mechanical skill. If you are new to aim training, follow this structured 7-day routine. Spend <strong>15 to 20 minutes daily</strong> on FixedAim to build foundational muscle memory without burning out.</p>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1.25rem' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: '#4fc3f7' }}>Days 1 & 2: Accuracy Over Speed</strong><br/>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Focus purely on hitting the target. Do not rush your clicks. Aim for a minimum of <strong>90% accuracy</strong>. If you miss, slow down. This builds the initial neural pathways.</span>
              </li>
              <li style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: '#00ff88' }}>Days 3 & 4: Micro-Corrections</strong><br/>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Flick to the target quickly, but pause for a split-second to verify your crosshair is centered before clicking. Try to maintain <strong>85% accuracy</strong> while increasing initial flick speed.</span>
              </li>
              <li style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: '#bf5af2' }}>Days 5 & 6: Pushing the Pace</strong><br/>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Start trusting your muscle memory. Shoot the moment you feel the crosshair is on target. Your accuracy may drop to <strong>75-80%</strong>, but your targets-per-minute (Score) should increase significantly.</span>
              </li>
              <li>
                <strong style={{ color: '#ffd60a' }}>Day 7: The Benchmark Test</strong><br/>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Treat today as a ranked match. Do a 3-minute warm-up, then do 3 serious runs. Record your highest Score and Accuracy. This is your new baseline for the following week!</span>
              </li>
            </ul>
          </div>
        </section>

        <section id="game-specific" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Game-Specific Aim Training</h2>
          <p style={{ marginBottom: '1rem' }}>Different first-person shooters demand entirely different subsets of aiming mechanics. Tailoring your training to the game you play is critical for competitive success.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(180deg, rgba(255,70,85,0.05) 0%, rgba(0,0,0,0.2) 100%)', border: '1px solid rgba(255,70,85,0.2)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ color: '#ff4655', marginTop: 0, marginBottom: '0.75rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff4655"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
                Tactical Shooters (Valorant, CS2)
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1rem' }}>Tactical FPS games have extremely low Time-To-Kill (TTK). A single headshot ends the fight. Therefore, training should prioritize:</p>
              <ul style={{ paddingLeft: '1.2rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Crosshair Placement:</strong> Pre-aiming corners at head height.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Micro-Flicks:</strong> Tiny, fast adjustments from a good crosshair position directly to the target's head.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Click Timing:</strong> Firing at the exact moment you counter-strafe to an absolute stop.</li>
              </ul>
            </div>
            
            <div style={{ background: 'linear-gradient(180deg, rgba(0,255,136,0.05) 0%, rgba(0,0,0,0.2) 100%)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ color: '#00ff88', marginTop: 0, marginBottom: '0.75rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#00ff88"><circle cx="12" cy="12" r="10" fill="none" stroke="#00ff88" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Tracking Shooters (Apex, Overwatch)
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1rem' }}>These games feature high TTK, fast player movement, and verticality. You cannot rely on a single flick shot. Training must focus on:</p>
              <ul style={{ paddingLeft: '1.2rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Smooth Tracking:</strong> Keeping the crosshair glued to a target that is strafing unpredictably.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Reactivity:</strong> How quickly you can change the direction of your mouse when the enemy changes strafe direction.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Target Switching:</strong> Rapidly transitioning fire from one low-HP target to another during team fights.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="aim-mechanics" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Core Aim Mechanics Explained</h2>
          <p style={{ marginBottom: '1rem' }}>Aiming is a cluster of distinct sub-skills. Identifying your weakest link can help you structure a more effective training routine.</p>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1rem' }}>Visualizing Aim Mechanics</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px dashed #4fc3f7', margin: '0 auto 0.5rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: '10px', height: '10px', background: '#ff4444', borderRadius: '50%', transform: 'translate(-50%, -50%)' }}></div>
                  <svg width="80" height="80" style={{ position: 'absolute', top: 0, left: 0 }}><path d="M 40,40 L 70,20" stroke="#4fc3f7" strokeWidth="2" markerEnd="url(#arrowhead)"/></svg>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Flicking</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', margin: '0 auto 0.5rem', position: 'relative', overflow: 'hidden' }}>
                   <div style={{ position: 'absolute', top: '50%', left: '20%', width: '14px', height: '14px', background: '#00ff88', borderRadius: '50%', transform: 'translate(-50%, -50%)' }}></div>
                   <svg width="80" height="80" style={{ position: 'absolute', top: 0, left: 0 }}><path d="M 16,40 Q 40,10 64,40" stroke="#00ff88" strokeWidth="2" fill="none"/></svg>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Tracking</span>
              </div>
            </div>
          </div>

          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#00f5ff' }}>Flicking:</strong> The rapid, explosive movement of the crosshair to a target. It relies heavily on spatial memory and fast twitch responses.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#00ff88' }}>Tracking:</strong> Keeping the crosshair smoothly locked onto a moving target. Requires continuous visual processing.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#bf5af2' }}>Crosshair Placement:</strong> Pre-aiming at the exact height and angle where an enemy is likely to appear, minimizing the need for drastic flicks.</li>
          </ul>
        </section>

        <section id="ergonomics-grips" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Mouse Grips & Ergonomics</h2>
          <p style={{ marginBottom: '1rem' }}>The way you interact physically with your mouse drastically impacts your aiming potential and long-term health. The Esports medical community frequently warns about Repetitive Strain Injuries (RSI) stemming from poor ergonomics.</p>
          
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem' }}>The 3 Primary Mouse Grips</h3>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Palm Grip:</strong> The entire hand rests on the mouse. Offers high stability and smooth tracking control, but limits vertical range of motion. Great for low sensitivity players.</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Claw Grip:</strong> The base of the palm rests on the mouse, with fingers arched like a claw. Provides a hybrid of stability and quick micro-adjustment capabilities. The most popular grip among tactical shooter pros.</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Fingertip Grip:</strong> Only the fingertips touch the mouse. Offers maximum speed and vertical agility, but requires excellent fine motor control and can be fatiguing. Best for tracking-heavy games.</li>
          </ul>

          <div style={{ background: 'rgba(255,200,0,0.1)', borderLeft: '4px solid #ffcc00', padding: '1rem 1.5rem', borderRadius: '0 8px 8px 0' }}>
            <h4 style={{ color: '#ffcc00', marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem' }}>Ergonomic Warning: Beware the "Death Grip"</h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
              Squeezing your mouse too tightly (the "death grip") creates immense tension in your forearm flexors, leading to "aim shake" (micro-tremors) and significantly increasing the risk of carpal tunnel syndrome. Consciously practice a relaxed grip during aim training sessions.
            </p>
          </div>
        </section>

        <section id="comparison" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>FixedAim vs. Desktop Trainers</h2>
          <p style={{ marginBottom: '1rem' }}>How does our browser aim trainer stack up against heavy desktop clients like Aim Lab or KovaaK's?</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <thead>
                <tr style={{ background: 'rgba(79,195,247,0.1)', borderBottom: '1px solid rgba(79,195,247,0.3)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#fff' }}>Feature</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#4fc3f7' }}>FixedAim</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#9ca3af' }}>Desktop Trainers</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Installation Required</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>No (Browser-based)</td>
                  <td style={{ padding: '0.75rem', color: '#ff4444' }}>Yes (10GB+ Downloads)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Account & Login</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>Not Required</td>
                  <td style={{ padding: '0.75rem', color: '#ff4444' }}>Required</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Engine Technology</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>WebGL (Instant Load)</td>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Unity / Unreal Engine</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Custom Drills</td>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1', fontWeight: 'bold' }}>Core fundamentals</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88' }}>Extensive Sandbox</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Updates & Patches</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>Seamless (Always updated)</td>
                  <td style={{ padding: '0.75rem', color: '#ff4444' }}>Manual client updates</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Performance Impact</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>Ultra Lightweight</td>
                  <td style={{ padding: '0.75rem', color: '#ff4444' }}>Heavy CPU/GPU usage</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Price</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>100% Free</td>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Free or Paid</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="hardware" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Hardware & Settings Checklist</h2>
          <p style={{ marginBottom: '1rem' }}>Your hardware settings determine the physical mapping between hand movement and crosshair movement. For the best training results, optimize the following:</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,245,255,0.08)', borderBottom: '1px solid rgba(0,245,255,0.2)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#00f5ff' }}>Setting / Hardware</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#00f5ff' }}>Recommendation</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#00f5ff' }}>Why it matters</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 600 }}>Mouse DPI</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>400 - 1600 DPI</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>Lower DPI is standard for precision. Higher DPI reduces input delay marginally but requires very low in-game sensitivity.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 600 }}>Raw Input</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88' }}>ON</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>Bypasses Windows mouse acceleration, ensuring 1:1 consistent mapping of physical to virtual movement.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 600 }}>Monitor Refresh Rate</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>144Hz+ Minimum</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>Provides more recent visual information, drastically improving tracking of fast-moving targets.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 600 }}>Mouse Weight</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>&lt; 70 grams</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>Lighter mice have less inertia, making flicking and sudden stops significantly more precise.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="faq" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { q: 'What is eDPI and why does it matter?', a: 'eDPI (effective Dots Per Inch) is calculated by multiplying your mouse DPI by your in-game sensitivity. It acts as a universal metric allowing you to compare true sensitivities across different games and settings.' },
              { q: 'How often should I use an aim trainer?', a: 'Consistency is key. 15-30 minutes daily is vastly superior to a single 3-hour session once a week. Aim for frequent, focused sessions without causing cognitive fatigue.' },
              { q: 'Can aim training improve my rank?', a: 'Aim training can help elevate your mechanical baseline. However, ranking up also requires strong game sense, positioning, and team communication. Excellent mechanics complement good decision-making.' },
              { q: 'Is wrist aiming or arm aiming better?', a: 'A combination is optimal. Use your arm for large, sweeping movements to protect your wrist, and use your wrist/fingertips for precise micro-adjustments.' },
              { q: 'Does mouse pad surface affect aim?', a: 'Yes. Hard pads offer lower friction for faster flicks, while cloth pads offer more control and stopping power, which many players prefer for tactical shooters.' },
              { q: 'What is "aim shake" and how do I fix it?', a: 'Aim shake often results from a tense grip (deathgripping) or high sensitivity. To fix it, consciously relax your hand, lower your sensitivity if necessary, and ensure proper desk ergonomics.' },
              { q: 'How long does it take to see results?', a: 'While some players feel "warmed up" immediately, structural improvements to your mechanics typically take 2-4 weeks of consistent, daily practice to become noticeable in-game.' },
              { q: 'Should I play with raw input on?', a: 'Yes. Raw input bypasses Windows cursor acceleration, ensuring your sensitivity is perfectly linear at all speeds. You should enable raw input in every competitive FPS.' },
              { q: 'Does playing rhythm games help aim?', a: 'Partially. Rhythm games improve hand-eye coordination and reaction speed, but the transfer is indirect compared to dedicated 3D aim training.' },
              { q: 'How does sleep affect aim?', a: 'Sleep is when motor memories consolidate. Poor sleep measurably degrades reaction time and fine motor precision. Do not expect peak aiming performance if you are sleep-deprived.' },
              { q: 'What is crosshair placement?', a: 'Crosshair placement is pre-aiming your crosshair at the exact height and angle where an enemy is likely to appear, significantly reducing the distance you need to flick.' },
              { q: 'Is higher FOV better for aiming?', a: 'Higher FOV makes targets appear smaller and slower, while lower FOV makes them appear larger but faster. Your aim trainer FOV should exactly match your primary game for accurate muscle memory transfer.' },
              { q: 'Do heavier mice make aiming harder?', a: 'Heavier mice have more inertia, making them harder to start and stop quickly. The competitive standard has largely shifted to lightweight mice (under 70g) for optimal control.' }
            ].map(({ q, a }, i) => (
              <details key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)', padding: '1rem' }}>
                <summary style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                  {q}
                </summary>
                <p style={{ marginTop: '0.75rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: 0 }}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <a href="/cps-test" style={{ color: '#4fc3f7', textDecoration: 'none', fontWeight: 600 }}>CPS Test</a>
          <span style={{ color: '#4b5563' }}>|</span>
          <a href="/reaction-time" style={{ color: '#4fc3f7', textDecoration: 'none', fontWeight: 600 }}>Reaction Time</a>
          <span style={{ color: '#4b5563' }}>|</span>
          <a href="/mouse-accuracy" style={{ color: '#4fc3f7', textDecoration: 'none', fontWeight: 600 }}>Mouse Accuracy</a>
          <span style={{ color: '#4b5563' }}>|</span>
          <a href="/typing-test" style={{ color: '#4fc3f7', textDecoration: 'none', fontWeight: 600 }}>Typing Test</a>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#4b5563', textAlign: 'center', marginTop: '2rem' }}>
          This guide provides actionable insights for competitive players seeking to improve their mechanical skills through targeted practice.
        </p>
      </article>




    </div>
  );
}








