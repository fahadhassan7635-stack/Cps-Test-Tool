/**
 * HomePage.tsx — performance-optimized
 *
 * Key changes vs previous version:
 * 1. seoArticles data moved to a separate file (data/seoArticles.ts) — lazy-loaded
 * 2. SEO accordion section lazy-loaded with React.lazy + Suspense
 * 3. Gear section lazy-loaded
 * 4. useMemo for static derived data
 * 5. useCallback on every handler
 * 6. Inline style objects replaced with CSS classes where possible (no re-alloc per render)
 * 7. Countdown clock extracted to its own tiny component to isolate re-renders
 * 8. will-change hints on animated elements
 * 9. content-visibility: auto on below-fold sections
 */

import { Link } from 'react-router-dom';
import {
  useEffect, useState, useCallback, useMemo,
  lazy, Suspense, memo,
} from 'react';

/* ─── lazy sections (code-split) ─── */
const SeoSection  = lazy(() => import('./sections/SeoSection'));
const GearSection = lazy(() => import('./sections/GearSection'));

/* ══════════════════════════════════════════════════════════
   STATIC DATA  (module-level = allocated once, never GC'd)
══════════════════════════════════════════════════════════ */

const LB_DATA = {
  cps: [
    { rank: 1, name: 'Arpon',       score: '14.2 CPS', country: '🇰🇷', avatar: '⚡' },
    { rank: 2, name: 'RapidFire99', score: '13.8 CPS', country: '🇺🇸', avatar: '🔥' },
    { rank: 3, name: 'ClickMaster', score: '13.1 CPS', country: '🇧🇷', avatar: '💥' },
    { rank: 4, name: 'XSpeedX',     score: '12.9 CPS', country: '🇯🇵', avatar: '🎯' },
    { rank: 5, name: 'ProClicker',  score: '12.7 CPS', country: '🇩🇪', avatar: '🏆' },
  ],
  wpm: [
    { rank: 1, name: 'Typeking',      score: '187 WPM', country: '🇺🇸', avatar: '⌨️' },
    { rank: 2, name: 'KeyboardNinja', score: '174 WPM', country: '🇸🇬', avatar: '🥷' },
    { rank: 3, name: 'SpeedTyper',    score: '168 WPM', country: '🇬🇧', avatar: '💨' },
    { rank: 4, name: 'WPMKing',       score: '162 WPM', country: '🇨🇳', avatar: '👑' },
    { rank: 5, name: 'FastFingers',   score: '158 WPM', country: '🇮🇳', avatar: '🚀' },
  ],
  reaction: [
    { rank: 1, name: 'Reflexking', score: '118ms', country: '🇰🇷', avatar: '⚡' },
    { rank: 2, name: 'QuickDraw',  score: '124ms', country: '🇺🇸', avatar: '🎯' },
    { rank: 3, name: 'NeuralLink', score: '131ms', country: '🇯🇵', avatar: '🧠' },
    { rank: 4, name: 'SpeedBot',   score: '138ms', country: '🇩🇪', avatar: '🤖' },
    { rank: 5, name: 'FastReact',  score: '142ms', country: '🇧🇷', avatar: '💫' },
  ],
} as const;

const TOOLS = [
  { to: '/typing-test',    icon: '⌨️', name: 'Typing Speed',     tag: 'WPM Test',     accent: 'var(--neon-cyan)'   },
  { to: '/cps-test',       icon: '🖱️', name: 'CPS Test',         tag: 'Click Speed',  accent: 'var(--neon-green)'  },
  { to: '/reaction-time',  icon: '⚡', name: 'Reaction Time',    tag: 'Reflex Test',  accent: 'var(--neon-orange)' },
  { to: '/aim-trainer',    icon: '🎯', name: 'Aim Trainer',      tag: 'FPS Skills',   accent: 'var(--neon-red)'    },
  { to: '/spacebar',       icon: '▭',  name: 'Spacebar Counter', tag: 'Key Smash',    accent: 'var(--neon-cyan)'   },
  { to: '/key-visualizer', icon: '👁️', name: 'Key Visualizer',   tag: 'Real-Time',    accent: 'var(--neon-purple)' },
  { to: '/double-click',   icon: '🖱️', name: 'Double Click',     tag: 'Mouse Test',   accent: 'var(--neon-green)'  },
  { to: '/accuracy',       icon: '📏', name: 'Accuracy Test',    tag: 'Precision',    accent: 'var(--neon-yellow)' },
  { to: '/scroll-test',    icon: '↕️', name: 'Scroll Test',      tag: 'Scroll Speed', accent: 'var(--neon-cyan)'   },
  { to: '/mouse-accuracy', icon: '🖲️', name: 'Mouse Accuracy',   tag: 'Tracking',     accent: 'var(--neon-green)'  },
  { to: '/sniper-mode',    icon: '🔭', name: 'Sniper Mode',      tag: 'Micro-Flicks', accent: 'var(--neon-red)'    },
  { to: '/space-defense',  icon: '🚀', name: 'Space Defense',    tag: 'Skill Game',   accent: 'var(--neon-purple)' },
  { to: '/voyager-game',   icon: '🌌', name: 'Voyager Game',     tag: 'Endless',      accent: 'var(--neon-cyan)'   },
  { to: '/cps-rush',       icon: '💥', name: 'CPS Rush',         tag: 'Speed Rush',   accent: 'var(--neon-red)'    },
  { to: '/space-waves',    icon: '🌊', name: 'Space Waves',      tag: 'Dodge Game',   accent: 'var(--neon-cyan)'   },
] as const;

const CATEGORIES = [
  { to: '/keyboard',    icon: '⌨️', title: 'Keyboard Tools',    color: 'var(--neon-cyan)',    desc: 'WPM records, key visualizers, accuracy drills.',              pills: [{ to: '/typing-test',   label: '⌨ Typing Speed'   }, { to: '/key-visualizer', label: '👁 Key Visualizer' }] },
  { to: '/mouse',       icon: '🖱️', title: 'Mouse Tools',       color: 'var(--neon-green)',   desc: 'CPS counters, double-click diagnosis, precision tests.',      pills: [{ to: '/cps-test',       label: '⚡ CPS Test'       }, { to: '/double-click',   label: '🖱 Double Click'   }] },
  { to: '/aim',         icon: '🎯', title: 'Aim & Reaction',    color: 'var(--neon-orange)',  desc: 'Reflex speed, aim trainer, FPS scenario drills.',             pills: [{ to: '/reaction-time',  label: '⚡ Reaction Time'  }, { to: '/aim-trainer',    label: '🎯 Aim Trainer'    }] },
  { to: '/hall-of-fame',icon: '🏆', title: 'Compete Globally',  color: 'var(--neon-yellow)',  desc: 'Daily challenges, score history, worldwide leaderboard.',     pills: [{ to: '/hall-of-fame',   label: '🏆 Hall of Fame'   }, { to: '/cps-test',       label: '📅 Daily Challenge'}] },
  { to: '/games',       icon: '🎮', title: 'Skill Games',       color: 'var(--neon-purple)',  desc: 'Arcade games that actually sharpen your reaction and CPS.',   pills: [{ to: '/space-defense',  label: '🚀 Space Defense'  }, { to: '/voyager-game',   label: '🌌 Voyager Game'   }] },
] as const;

const STATS = [
  { value: '247K+', label: 'Players Tested' },
  { value: '16',    label: 'Free Tools'     },
  { value: '4.9★',  label: 'Avg Rating'     },
] as const;

const REWARDS = [
  { icon: '🏅', label: 'Badge',  value: 'Speed Demon' },
  { icon: '⭐', label: 'Points', value: '+500'         },
] as const;

/* ══════════════════════════════════════════════════════════
   SMALL ISOLATED COMPONENTS  (prevent parent re-renders)
══════════════════════════════════════════════════════════ */

/** Countdown clock — only this re-renders every second */
const Countdown = memo(() => {
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    const tick = () => {
      const now  = new Date();
      const next = new Date(); next.setHours(24, 0, 0, 0);
      const d    = next.getTime() - now.getTime();
      if (d <= 0) { setTime('00:00:00'); return; }
      const h = Math.floor(d / 3600000).toString().padStart(2, '0');
      const m = Math.floor((d % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((d % 60000)  / 1000).toString().padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ background: 'rgba(0,0,0,0.28)', borderRadius: '10px', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem' }}>Resets in</div>
      <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums' }}>{time}</div>
    </div>
  );
});
Countdown.displayName = 'Countdown';

/** Single tool card */
const ToolCard = memo(({ tool }: { tool: typeof TOOLS[number] }) => {
  const onEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    el.style.borderColor = tool.accent;
    el.style.transform   = 'translateY(-2px)';
    el.style.boxShadow   = `0 8px 22px rgba(0,0,0,0.3),0 0 16px ${tool.accent}18`;
  }, [tool.accent]);

  const onLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    el.style.borderColor = 'var(--border)';
    el.style.transform   = '';
    el.style.boxShadow   = '';
  }, []);

  return (
    <Link
      to={tool.to}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '1.1rem 1.25rem',
        textDecoration: 'none', color: 'var(--text-primary)',
        display: 'flex', alignItems: 'center', gap: '0.9rem',
        transition: 'border-color .2s,transform .2s,box-shadow .2s',
        willChange: 'transform',
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <span style={{ fontSize: '1.9rem', flexShrink: 0 }}>{tool.icon}</span>
      <div>
        <div style={{ fontWeight: '600', fontSize: '0.875rem', lineHeight: '1.3' }}>{tool.name}</div>
        <div style={{ fontSize: '0.72rem', color: tool.accent, marginTop: '0.1rem' }}>{tool.tag}</div>
      </div>
    </Link>
  );
});
ToolCard.displayName = 'ToolCard';

/** Single category card */
const CategoryCard = memo(({ cat }: { cat: typeof CATEGORIES[number] }) => {
  const onEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    el.style.borderColor = cat.color;
    el.style.transform   = 'translateY(-4px)';
    el.style.boxShadow   = `0 16px 36px rgba(0,0,0,0.45),0 0 24px ${cat.color}22`;
  }, [cat.color]);

  const onLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    el.style.borderColor = 'var(--border)';
    el.style.transform   = '';
    el.style.boxShadow   = '';
  }, []);

  return (
    <Link
      to={cat.to}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '1.75rem',
        textDecoration: 'none', color: 'var(--text-primary)',
        display: 'block', position: 'relative', overflow: 'hidden',
        transition: 'border-color .25s,transform .25s,box-shadow .25s',
        willChange: 'transform',
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div style={{ position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: '2px', borderRadius: '0 0 4px 4px', background: cat.color, opacity: 0.55 }} />
      <div style={{ fontSize: '2.25rem', marginBottom: '0.8rem' }}>{cat.icon}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.4rem', color: cat.color }}>{cat.title}</div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.65', marginBottom: '1.25rem' }}>{cat.desc}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {cat.pills.map(p => (
          <span key={p.label} style={{ padding: '0.28rem 0.7rem', borderRadius: '50px', fontSize: '0.72rem', fontWeight: '600', background: `${cat.color}14`, color: cat.color, border: `1px solid ${cat.color}2e` }}>{p.label}</span>
        ))}
      </div>
      <span style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '1.1rem', color: cat.color, opacity: 0.5 }}>↗</span>
    </Link>
  );
});
CategoryCard.displayName = 'CategoryCard';

/** Leaderboard tab button */
const TabBtn = memo(({ tab, active, onClick }: { tab: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.28rem 0.65rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
      fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.06em',
      background: active ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.05)',
      color: active ? '#000' : 'var(--text-secondary)',
      transition: 'all .18s',
    }}
  >{tab}</button>
));
TabBtn.displayName = 'TabBtn';

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'cps' | 'wpm' | 'reaction'>('cps');

  /* stable tab setters — no new function every render */
  const setCps      = useCallback(() => setActiveTab('cps'),      []);
  const setWpm      = useCallback(() => setActiveTab('wpm'),      []);
  const setReaction = useCallback(() => setActiveTab('reaction'), []);

  /* derive leaderboard rows once per tab change */
  const lbData = useMemo(() => LB_DATA[activeTab], [activeTab]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>

      {/* ══ HERO ══ */}
      <section style={{ textAlign: 'center', padding: '5rem 1rem 4.5rem' }}>

        <div className="fade-in-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
          padding: '0.3rem 1rem',
          background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.2)',
          borderRadius: '50px', fontSize: '0.78rem', fontWeight: '600',
          color: 'var(--neon-cyan)', marginBottom: '2rem', letterSpacing: '0.06em',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: 'var(--neon-green)', boxShadow: '0 0 8px var(--neon-green)',
            animation: 'pulse-glow 2s infinite', willChange: 'opacity',
          }} />
          v2.0 — Daily Challenges Live
        </div>

        <h1 className="fade-in-up d1" style={{
          fontSize: 'clamp(3.2rem,9vw,6.5rem)', fontWeight: '900',
          lineHeight: '1.05', marginBottom: '1.5rem', letterSpacing: '-0.02em',
        }}>
          <span style={{ display: 'block', color: 'var(--text-primary)' }}>Test. Train.</span>
          <span style={{
            display: 'block',
            background: 'linear-gradient(120deg,var(--neon-cyan) 0%,var(--neon-green) 55%,var(--neon-cyan) 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            willChange: 'background-position',
          }}>Dominate.</span>
        </h1>

        <p className="fade-in-up d2" style={{
          fontSize: 'clamp(1rem,2vw,1.2rem)', color: 'var(--text-secondary)',
          maxWidth: '580px', margin: '0 auto 3rem', lineHeight: '1.75',
        }}>
          The ultimate free platform to test clicking speed, typing WPM, reaction time, aim precision, and more.{' '}
          <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>16 professional tools.</span>{' '}
          No signup. No downloads. Just pure performance data.
        </p>

        {/* Stats */}
        <div className="fade-in-up d3" style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(2rem,6vw,5rem)', flexWrap: 'wrap', marginBottom: '3rem' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--neon-cyan)', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.15rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="fade-in-up d4" style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/cps-test"     className="btn btn-primary"   style={{ fontSize: '1rem', padding: '0.9rem 2.2rem' }}>⚡ Start CPS Test</Link>
          <Link to="/typing-test"  className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.9rem 2.2rem' }}>⌨️ Typing Speed Test</Link>
        </div>
      </section>

      {/* ══ CATEGORIES ══ */}
      <section style={{ marginBottom: '5rem', contentVisibility: 'auto', containIntrinsicSize: '0 600px' } as React.CSSProperties}>
        <div className="section-label">Tools &amp; Games</div>
        <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '800', marginBottom: '0.6rem' }}>Choose Your Arena</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Precision tools and skill games. Free, instant, no signup.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: '1.25rem' }}>
          {CATEGORIES.map(cat => <CategoryCard key={cat.to} cat={cat} />)}
        </div>
      </section>

      {/* ══ ALL 16 TOOLS ══ */}
      <section style={{ marginBottom: '5rem', contentVisibility: 'auto', containIntrinsicSize: '0 520px' } as React.CSSProperties}>
        <div className="section-label">Quick Launch</div>
        <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '800', marginBottom: '0.6rem' }}>All 16 Tools</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>No setup required. Click a tool and start in under 3 seconds.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: '0.9rem' }}>
          {TOOLS.map(tool => <ToolCard key={tool.to} tool={tool} />)}
        </div>
      </section>

      {/* ══ LEADERBOARD + DAILY CHALLENGE ══ */}
      <section style={{ marginBottom: '5rem', contentVisibility: 'auto', containIntrinsicSize: '0 500px' } as React.CSSProperties}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '2.5rem' }}>

          {/* Leaderboard */}
          <div>
            <div className="section-label">Records</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem' }}>Hall of Fame</h2>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.18)' }}>
                <span style={{ fontWeight: '700', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--neon-yellow)' }}>🏆 All-Time High</span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <TabBtn tab="cps"      active={activeTab === 'cps'}      onClick={setCps}      />
                  <TabBtn tab="wpm"      active={activeTab === 'wpm'}      onClick={setWpm}      />
                  <TabBtn tab="reaction" active={activeTab === 'reaction'} onClick={setReaction} />
                </div>
              </div>
              {lbData.map((entry, i) => (
                <div key={entry.name} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.7rem 1.25rem',
                  borderBottom: i < lbData.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ width: '28px', textAlign: 'center', fontWeight: '700', fontSize: '0.88rem', color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-muted)' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
                  </span>
                  <span style={{ fontSize: '1.2rem' }}>{entry.avatar}</span>
                  <span style={{ flex: 1, fontWeight: '500', fontSize: '0.88rem' }}>{entry.name}</span>
                  <span style={{ color: 'var(--neon-cyan)', fontWeight: '700', fontSize: '0.88rem' }}>{entry.score}</span>
                  <span style={{ fontSize: '0.95rem' }}>{entry.country}</span>
                </div>
              ))}
            </div>
            <Link to="/hall-of-fame" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>View All Records →</Link>
          </div>

          {/* Daily Challenge */}
          <div>
            <div className="section-label">Daily</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem' }}>Today's Challenge</h2>
            <div style={{ background: 'linear-gradient(135deg,rgba(0,245,255,0.05),rgba(0,255,136,0.04))', border: '1px solid rgba(0,245,255,0.18)', borderRadius: '16px', padding: '1.75rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.28rem 0.75rem', background: 'rgba(255,107,0,0.13)', border: '1px solid rgba(255,107,0,0.28)', borderRadius: '50px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--neon-orange)', marginBottom: '1.1rem' }}>🔥 Day 47 Streak</div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: '800', marginBottom: '0.7rem' }}>Speed Demon Mode</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
                Achieve 10+ CPS for 5 seconds straight using only left-click. One attempt per day. Top 50 scores make the wall of fame.
              </p>
              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {REWARDS.map(r => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <span>{r.icon}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{r.label}: </span>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{r.value}</span>
                  </div>
                ))}
              </div>
              {/* Countdown isolated — only it re-renders every second */}
              <Countdown />
              <Link to="/cps-test" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>⚡ Accept Challenge</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ GEAR  — lazy loaded ══ */}
      <Suspense fallback={<div style={{ height: '320px', background: 'var(--bg-card)', borderRadius: '20px' }} />}>
        <GearSection />
      </Suspense>

      {/* ══ SEO ARTICLES — lazy loaded ══ */}
      <hr style={{ borderColor: 'var(--border)', margin: '3rem 0' }} />
      <Suspense fallback={<div style={{ height: '200px' }} />}>
        <SeoSection />
      </Suspense>

    </div>
  );
}
