import { useState } from 'react';

const posts = [
  {
    id: 1,
    emoji: '⌨️',
    tag: 'Typing',
    tagColor: 'var(--neon-cyan)',
    date: 'May 2, 2025',
    title: 'How to Go From 60 to 120 WPM in 30 Days',
    excerpt: 'A proven training routine used by competitive typists to double their speed without sacrificing accuracy.',
    readTime: '8 min read',
    body: `Improving your typing speed from 60 to 120 WPM is absolutely achievable in 30 days with the right approach. Here's the proven method:

**Week 1: Foundation**
Focus on proper finger placement using the home row keys (ASDF JKL;). Even if it slows you down initially, this is crucial. Practice for 20 minutes daily using touch-typing exercises.

**Week 2: Accuracy Over Speed**
Don't chase speed yet. Aim for 95%+ accuracy at your current pace. Errors are what truly slow you down in the long run. Use our Accuracy Test tool daily.

**Week 3: Speed Bursts**
Start doing 1-minute sprint sessions. Push beyond your comfort zone for 1 minute, then rest. This trains your muscle memory to reach higher speeds.

**Week 4: Endurance + Common Words**
The most common 200 English words make up 50% of all text. Master these at high speed. Use our Typing Speed Test with Medium difficulty.

**Key Tips:**
- Practice consistently rather than marathon sessions
- Target your weak keys specifically  
- Type real content (articles, code) not just random words
- Maintain proper posture to avoid fatigue`,
  },
  {
    id: 2,
    emoji: '🖱️',
    tag: 'Mouse',
    tagColor: 'var(--neon-green)',
    date: 'Apr 28, 2025',
    title: 'Best Gaming Mice for High CPS — 2025 Roundup',
    excerpt: 'Which mice enable the fastest click speeds? We tested 12 mice over 10,000 clicks each to find out.',
    readTime: '6 min read',
    body: `After testing 12 popular gaming mice with over 10,000 clicks each, here are our findings for CPS performance:

**#1 Logitech G Pro X Superlight 2**
At just 60g, this mouse allows for rapid finger movement without fatigue. The HERO 25K sensor has virtually no debounce delay. Average CPS in testing: 12.4

**#2 Razer DeathAdder V3 Pro**
Optimized trigger actuation force makes clicking effortless. Great for jitter clicking. Average CPS: 11.8

**#3 Endgame Gear XM2we**
Budget-friendly with optical switches that have zero debounce. Average CPS: 11.2

**What Makes a Mouse CPS-Friendly?**
- Low trigger actuation force (< 0.5N)
- No debounce delay (optical switches preferred)
- Lightweight design (< 70g)
- Comfortable grip for your hand size

**Clicking Techniques:**
- **Regular Click**: 4-8 CPS — sustainable for long gaming sessions
- **Jitter Clicking**: 8-14 CPS — vibrate your arm muscles
- **Butterfly Click**: 10-20 CPS — two fingers alternating (may void warranty)

Always check your mouse manufacturer's warranty policy before attempting advanced clicking techniques.`,
  },
  {
    id: 3,
    emoji: '⚡',
    tag: 'Reaction',
    tagColor: 'var(--neon-orange)',
    date: 'Apr 20, 2025',
    title: 'Science-Backed Methods to Reduce Your Reaction Time',
    excerpt: 'Sleep, training schedules, and warm-up drills that elite FPS players use to stay at peak performance.',
    readTime: '7 min read',
    body: `Elite FPS players maintain reaction times of 150-200ms through deliberate lifestyle optimization. Here's what science says works:

**Sleep: The #1 Factor**
Research shows that 7-9 hours of quality sleep reduces reaction time by up to 30%. Even one night of poor sleep (< 6 hours) can increase reaction time by 50ms — a massive disadvantage in competitive play.

**Training Protocol**
- 10 minutes of reaction training before each session
- Use our Reaction Time Test for baseline measurement
- Progress tracking shows improvement over weeks, not days

**Caffeine: Use Wisely**
100-200mg of caffeine (1 cup of coffee) improves reaction time by approximately 10-15ms. However, timing matters — consume 45 minutes before playing. Avoid late-day consumption to protect sleep.

**The Warm-Up Routine Used by Pros**
1. 5 min: Aim trainer (flick shots)
2. 3 min: Reaction time test (5 rounds)
3. 2 min: Tracking exercises

**What Hurts Reaction Time**
- Alcohol (increases RT by 100-200ms even next day)
- Dehydration (5% dehydration = 12ms slower)
- Screen fatigue (take 20-sec breaks every 20 min)
- Poor posture (restricts blood flow to brain)

Consistent daily practice with these tools will show measurable improvement within 2-4 weeks.`,
  },
  {
    id: 4,
    emoji: '🎯',
    tag: 'Aim',
    tagColor: 'var(--neon-red)',
    date: 'Apr 10, 2025',
    title: 'FPS Aim Training: A Complete Beginner\'s Guide',
    excerpt: 'From raw mechanics to game-sense — the complete roadmap to improving your aim in competitive FPS games.',
    readTime: '10 min read',
    body: `Whether you're playing Valorant, CS2, or Apex Legends, this guide covers the fundamentals of developing elite aim.

**Step 1: Fix Your Setup**
Before training your mechanics, optimize your settings:
- Sensitivity: Most pros use 400-800 DPI × 0.3-0.6 in-game sens
- Resolution: Native resolution for clearest targets
- FOV: 90-103 horizontal for FPS games

**Step 2: Master the Fundamentals**
- **Crosshair Placement**: Always keep your crosshair at head height
- **Counter-Strafing**: Stop moving before shooting
- **Spray Control**: Learn first 5-bullet recoil patterns

**Step 3: Structured Training**
Daily 30-minute routine:
- 10 min: Flick shots (use our Aim Trainer)
- 10 min: Tracking (Sniper Mode)
- 10 min: Game-specific scenarios

**Step 4: Review and Analyze**
Record your sessions. Watch back at 0.5x speed to identify aim breaks, unnecessary movements, and timing errors.

The journey from silver to diamond in aim skill takes 3-6 months of consistent, focused practice. There are no shortcuts — but with the right tools and routine, progress is guaranteed.`,
  },
];

export default function BlogPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState('All');

  const tags = ['All', 'Typing', 'Mouse', 'Reaction', 'Aim'];
  const filtered = filter === 'All' ? posts : posts.filter(p => p.tag === filter);
  const post = posts.find(p => p.id === selected);

  if (post) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <button
          onClick={() => setSelected(null)}
          className="btn btn-secondary"
          style={{ marginBottom: '2rem', fontSize: '0.875rem' }}
        >← Back to Blog</button>

        <div style={{ background: `${post.tagColor}15`, height: '160px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', marginBottom: '2rem', border: `1px solid ${post.tagColor}30` }}>
          {post.emoji}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ padding: '0.3rem 0.7rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', background: `${post.tagColor}15`, color: post.tagColor }}>{post.tag}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{post.date}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>📖 {post.readTime}</span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.3' }}>{post.title}</h1>

        <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.9' }}>
          {post.body.split('\n\n').map((para, i) => (
            <p key={i} style={{ marginBottom: '1.25rem' }}>
              {para.split('\n').map((line, j) => (
                <span key={j}>
                  {line.startsWith('**') && line.endsWith('**')
                    ? <strong style={{ color: 'var(--text-primary)' }}>{line.slice(2, -2)}</strong>
                    : line.startsWith('- ')
                    ? <span style={{ display: 'block', paddingLeft: '1rem', borderLeft: `2px solid ${post.tagColor}`, margin: '0.25rem 0', color: 'var(--text-primary)' }}>{line.slice(2)}</span>
                    : line}
                  {j < para.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Knowledge Base</div>
        <h1 className="tool-title">SkillTest Blog</h1>
        <p className="tool-subtitle">Guides, tips, and insights to level up your gaming skills</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}>
        {tags.map(tag => (
          <button key={tag} onClick={() => setFilter(tag)} style={{
            padding: '0.4rem 1rem', borderRadius: '8px',
            border: filter === tag ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
            background: filter === tag ? 'rgba(0,245,255,0.1)' : 'var(--bg-card)',
            color: filter === tag ? 'var(--neon-cyan)' : 'var(--text-secondary)',
            fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s',
          }}>{tag}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filtered.map(post => (
          <div
            key={post.id}
            onClick={() => setSelected(post.id)}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = post.tagColor;
              el.style.transform = 'translateY(-4px)';
              el.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'var(--border)';
              el.style.transform = 'translateY(0)';
              el.style.boxShadow = 'none';
            }}
          >
            <div style={{
              height: '120px',
              background: `linear-gradient(135deg, ${post.tagColor}15, transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3.5rem', borderBottom: '1px solid var(--border)',
            }}>{post.emoji}</div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', background: `${post.tagColor}15`, color: post.tagColor }}>{post.tag}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{post.date}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{post.readTime}</span>
              </div>
              <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{post.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>{post.excerpt}</p>
              <div style={{ marginTop: '1rem', color: post.tagColor, fontWeight: '600', fontSize: '0.85rem' }}>Read more →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
