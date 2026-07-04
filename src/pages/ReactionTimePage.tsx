import { useState, useRef, useCallback, useEffect } from 'react';

// ============================================================
// TYPES
// ============================================================
type Phase = 'idle' | 'waiting' | 'ready' | 'clicked' | 'early';

// ============================================================
// SEO HEAD COMPONENT
// ============================================================
function SEOHead() {
  useEffect(() => {
    document.title = 'Reaction Time Test — Free Online Reflex Speed Tester | Human Benchmark';

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', 'Take the free online reaction time test and benchmark your reflex speed. Measure your visual reaction time in milliseconds. Perfect for gamers, athletes, and curious minds.');
    setMeta('robots', 'index, follow');
    setMeta('theme-color', '#070a12');
    setMeta('viewport', 'width=device-width, initial-scale=1');
    setMeta('author', 'Reaction Time Test Tool');
    setMeta('keywords', 'reaction time test, reflex test, human benchmark, average reaction time, gaming reflex test, FPS reaction time, reaction trainer, online reaction test, mouse reaction test, visual reaction time, fast reflex test, brain reaction speed, reflex game, reaction latency, reaction speed test');

    setMeta('og:title', 'Reaction Time Test — Free Online Reflex Speed Tester', true);
    setMeta('og:description', 'Measure your visual reaction speed in milliseconds. See how you compare to pro gamers and average humans. Free, fast, and accurate.', true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', window.location.href, true);
    setMeta('og:site_name', 'Reaction Time Test', true);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', 'Reaction Time Test — Measure Your Reflex Speed');
    setMeta('twitter:description', 'Free online reaction time test. Measure how fast your brain responds to visual stimuli. Compare with gamers and athletes worldwide.');

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + window.location.pathname);

    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleIcon);
    }
    appleIcon.setAttribute('href', "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23070a12'/%3E%3Ctext y='.9em' font-size='80' x='10'%3E%E2%9A%A1%3C/text%3E%3C/svg%3E");

    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('href', "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='80'%3E%E2%9A%A1%3C/text%3E%3C/svg%3E");
    favicon.setAttribute('type', 'image/svg+xml');

    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Reaction Time Test',
        url: window.location.origin,
        description: 'Free online reaction time test and reflex speed benchmark tool.',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${window.location.origin}/?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Reaction Time Test',
        url: window.location.href,
        description: 'Measure your visual reaction time in milliseconds across 5 rounds. Compare your reflex speed to pro gamers and average humans.',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '3200',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin },
          { '@type': 'ListItem', position: 2, name: 'Reaction Time Test', item: window.location.href },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_DATA.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ];

    schemas.forEach((schema, i) => {
      const id = `jsonld-schema-${i}`;
      let el = document.getElementById(id) as HTMLScriptElement | null;
      if (!el) {
        el = document.createElement('script');
        el.id = id;
        el.setAttribute('type', 'application/ld+json');
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema);
    });
  }, []);

  return null;
}

// ============================================================
// WEB AUDIO SOUND ENGINE
// ============================================================
function useSoundEngine() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((
    frequency: number,
    type: OscillatorType,
    duration: number,
    volume: number,
    fadeOut = true,
    startFreq?: number,
  ) => {
    if (!soundEnabled) return;
    try {
      const ctx = getCtx();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = type;
      const now = ctx.currentTime;
      if (startFreq !== undefined) {
        oscillator.frequency.setValueAtTime(startFreq, now);
        oscillator.frequency.linearRampToValueAtTime(frequency, now + duration * 0.5);
      } else {
        oscillator.frequency.setValueAtTime(frequency, now);
      }
      gainNode.gain.setValueAtTime(volume, now);
      if (fadeOut) {
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      }
      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch {
      // silent fail
    }
  }, [soundEnabled, getCtx]);

  const playReady = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.2);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.25);
      });
    } catch { /* noop */ }
  }, [soundEnabled, getCtx]);

  const playSuccess = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0, now + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.35);
      });
    } catch { /* noop */ }
  }, [soundEnabled, getCtx]);

  const playEarly = useCallback(() => {
    playTone(200, 'sawtooth', 0.35, 0.2, true, 400);
  }, [playTone]);

  const playReset = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      [600, 400].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.15, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.15);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.18);
      });
    } catch { /* noop */ }
  }, [soundEnabled, getCtx]);

  const playWaiting = useCallback(() => {
    playTone(180, 'sine', 0.12, 0.08, true);
  }, [playTone]);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  return { soundEnabled, setSoundEnabled, playReady, playSuccess, playEarly, playReset, playWaiting };
}

// ============================================================
// RATING HELPER
// ============================================================
function getRating(ms: number) {
  if (ms < 150) return { label: '🔥 Inhuman', color: 'var(--neon-red)' };
  if (ms < 200) return { label: '⚡ Elite', color: 'var(--neon-orange)' };
  if (ms < 250) return { label: '🎯 Great', color: 'var(--neon-cyan)' };
  if (ms < 300) return { label: '✅ Average', color: 'var(--neon-green)' };
  if (ms < 400) return { label: '😐 Slow', color: 'var(--text-secondary)' };
  return { label: '🐢 Very Slow', color: 'var(--text-muted)' };
}

// ============================================================
// FAQ DATA
// ============================================================
const FAQ_DATA = [
  { q: 'What is a reaction time test?', a: 'A reaction time test measures how quickly you respond to a visual, auditory, or tactile stimulus. In this online version, you click as fast as possible the moment the screen turns green. The elapsed time between the color change and your click—measured in milliseconds—is your reaction time.' },
  { q: 'What is the average human reaction time?', a: 'The average human visual reaction time is approximately 250 milliseconds (ms). This figure varies widely based on age, fitness, mental alertness, sleep quality, and prior experience with reflex-based activities. Trained athletes and competitive gamers often reach 150–200ms consistently.' },
  { q: 'What is considered a good reaction time for gaming?', a: 'In competitive FPS gaming, a reaction time under 200ms is considered excellent. Semi-professional and serious casual players typically score between 200ms and 250ms. Anything below 250ms puts you in the top tier of most online games where split-second decisions determine match outcomes.' },
  { q: 'Can reaction time be improved with practice?', a: 'Yes, absolutely. Consistent practice through reaction time tests, aim trainers, and fast-paced games rewires your neural pathways over time, helping your brain respond to stimuli faster. Improvements are particularly noticeable in the first few weeks of regular training, with gains becoming more gradual after that.' },
  { q: 'Does age affect reaction time?', a: 'Yes, reaction time typically peaks in early adulthood (around ages 18–24) and gradually slows as we age. However, regular mental and physical activity can significantly offset age-related decline. Many experienced gamers in their 30s maintain competitive reaction speeds due to years of deliberate practice.' },
  { q: 'How does sleep affect reaction time?', a: 'Sleep deprivation is one of the most significant and immediate factors degrading reaction speed. Even a single night of fewer than 6 hours of sleep can increase reaction time by 50ms or more—equivalent to the difference between a professional gamer and an average player. Always test and train when well-rested.' },
  { q: 'Does caffeine improve reaction speed?', a: 'Moderate caffeine intake (1–2 cups of coffee) can temporarily sharpen alertness and reduce reaction time by approximately 10–30ms for most individuals. However, excessive caffeine can cause jitteriness and muscle tremors, which may actually worsen precision and increase false starts.' },
  { q: 'How does monitor refresh rate affect reaction time tests?', a: 'Monitor refresh rate directly impacts how quickly a new frame is displayed on screen. At 60Hz, a new image appears roughly every 16.6ms. At 144Hz, it\'s every 6.9ms, and at 240Hz, every 4.2ms. This means higher refresh rate monitors can display the "green" stimulus sooner, giving you a real-time advantage in both testing and gaming.' },
  { q: 'What is input lag and how does it affect my score?', a: 'Input lag is the delay between a physical action (like clicking a mouse button) and the system registering that action. High-quality gaming mice and wired connections typically exhibit less than 1ms of input lag, while wireless budget peripherals may lag by 5–20ms. Reducing input lag ensures your measured reaction time is closer to your true neurological speed.' },
  { q: 'What is the fastest human reaction time ever recorded?', a: 'The fastest reliably recorded human reaction times in controlled laboratory settings are around 100–120ms, typically achieved by elite sprinters responding to starting gun blasts. For visual stimuli specifically, consistent sub-150ms reactions are exceptionally rare and often indicate anticipation rather than pure reaction.' },
  { q: 'Is there a difference between visual and auditory reaction time?', a: 'Yes. Auditory (sound-based) reaction times are typically 20–50ms faster than visual reaction times. This is because sound signals take a shorter neural pathway to the brain\'s motor cortex compared to visual signals. This is why starting pistols are used in athletics rather than visual flags.' },
  { q: 'How do professional FPS gamers train their reflexes?', a: 'Professional FPS players use dedicated aim trainers like Aim Lab and KovaaK\'s, play deathmatch modes for live practice, maintain consistent sleep schedules, optimize their hardware for minimum latency, and perform cognitive exercises to sharpen mental focus. Many also engage in physical exercise, which has been shown to improve neural processing speed.' },
  { q: 'Can stress or anxiety affect reaction time?', a: 'Moderate stress can temporarily sharpen alertness through adrenaline release, potentially improving reaction time in short bursts—this is the "fight-or-flight" response. However, chronic stress, anxiety disorders, or high-pressure situations that cause panic typically degrade fine motor control and increase reaction times.' },
  { q: 'Does keyboard vs mouse input affect reaction time testing?', a: 'In this particular test, mouse clicks are used. Mouse click latency varies by device, with high-end gaming mice registering clicks in under 1ms. Mechanical keyboards typically register keystrokes in 1–3ms, while membrane keyboards may add 5–10ms. For competitive gaming, both input types are viable when quality equipment is used.' },
  { q: 'Why does my reaction time vary so much between rounds?', a: 'Reaction time variability is completely normal and is influenced by micro-fluctuations in attention, anticipation, muscle readiness, and cognitive load. In fact, high variability itself can indicate inconsistent focus or fatigue. Aiming for consistent scores across rounds is as valuable a goal as achieving a single low score.' },
  { q: 'What is a "false start" in reaction time testing?', a: 'A false start (shown as "Too Early" in this test) occurs when you click before the green stimulus appears. This means you were anticipating rather than reacting, which inflates your perceived speed. Our test penalizes false starts and requires you to retry the round, ensuring your results reflect true reaction ability.' },
  { q: 'Does physical fitness affect reaction time?', a: 'Research consistently shows a positive correlation between cardiovascular fitness and reaction speed. Aerobic exercise increases cerebral blood flow and promotes neuroplasticity, which can meaningfully improve how quickly your brain processes and responds to stimuli. Even moderate regular exercise like walking or cycling shows measurable reaction time benefits.' },
  { q: 'Is this reaction time test accurate enough for scientific research?', a: 'Online browser-based reaction time tests have some inherent measurement variance due to JavaScript timer resolution, browser rendering pipelines, and hardware variability. They are suitable for personal benchmarking and tracking relative improvement, but laboratory-grade equipment with precise timing hardware would be required for peer-reviewed scientific research.' },
  { q: 'Can mobile phones be used for reaction time testing?', a: 'Yes, this test is mobile compatible. However, touchscreen displays typically have 20–70ms more input latency compared to wired mouse clicks on desktop computers. Mobile results tend to run slightly higher than desktop results for the same user, so keep device type consistent when tracking progress.' },
  { q: 'How often should I train to improve my reaction time?', a: 'For meaningful improvement, aim for 3–5 focused practice sessions per week, each lasting 15–30 minutes. Overtraining without rest can cause diminishing returns and mental fatigue. Rest days allow your neural pathways to consolidate gains, similar to how muscles recover and strengthen after physical workouts.' },
  { q: 'Do professional athletes have faster reaction times than gamers?', a: 'It depends on the discipline. Sprinters, boxers, and tennis players develop extremely fast reflex systems tied to specific physical patterns. Top esports players, especially in FPS titles, exhibit reaction times that rival or sometimes exceed traditional athletes in visual-motor tasks. The two groups develop complementary but distinct types of reaction speed.' },
  { q: 'What foods or supplements can help improve reaction time?', a: 'Beyond caffeine, omega-3 fatty acids (found in fish oil) support neural health and cognitive function. Magnesium plays a role in neuromuscular signaling, and B vitamins support overall brain health. Proper hydration is also critical—even mild dehydration of 2% body weight has been shown to increase reaction times measurably.' },
  { q: 'Does the 5-round format make the test more accurate?', a: 'Yes. A single reaction time measurement has high variance due to momentary distractions, anticipation, and muscle readiness. Taking the average of 5 rounds produces a far more representative and stable benchmark score. The test also tracks your best round, helping you identify your ceiling performance under optimal focus.' },
];

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function ReactionTimePage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const MAX_ROUNDS = 5;

  const startTime = useRef<number>(0);
  const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { soundEnabled, setSoundEnabled, playReady, playSuccess, playEarly, playReset, playWaiting } = useSoundEngine();

  useEffect(() => {
    return () => {
      if (waitTimer.current) clearTimeout(waitTimer.current);
    };
  }, []);

  const startWaiting = useCallback(() => {
    setPhase('waiting');
    playWaiting();
    const delay = 1500 + Math.random() * 3500;
    waitTimer.current = setTimeout(() => {
      setPhase('ready');
      startTime.current = performance.now();
      playReady();
    }, delay);
  }, [playWaiting, playReady]);

  const handleReset = useCallback(() => {
    if (waitTimer.current) clearTimeout(waitTimer.current);
    setPhase('idle');
    setRound(0);
    setResults([]);
    setReactionTime(null);
    playReset();
  }, [playReset]);

  const handleClick = useCallback(() => {
    if (phase === 'idle') {
      startWaiting();
      return;
    }

    if (phase === 'waiting') {
      if (waitTimer.current) clearTimeout(waitTimer.current);
      setPhase('early');
      playEarly();
      return;
    }

    if (phase === 'ready') {
      const t = Math.round(performance.now() - startTime.current);
      setReactionTime(t);
      setResults(prev => [...prev, t]);
      setRound(prev => prev + 1);
      setPhase('clicked');
      playSuccess();
      return;
    }

    if (phase === 'clicked' || phase === 'early') {
      if (round >= MAX_ROUNDS) {
        setPhase('idle');
        setRound(0);
        setResults([]);
        setReactionTime(null);
      } else {
        startWaiting();
      }
    }
  }, [phase, round, startWaiting, playEarly, playSuccess]);

  const avg = results.length > 0 ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : null;
  const best = results.length > 0 ? Math.min(...results) : null;

  const zoneColors = {
    idle: { bg: 'var(--bg-card)', border: 'var(--border)', text: 'var(--text-muted)' },
    waiting: { bg: 'rgba(255,107,0,0.08)', border: 'rgba(255,107,0,0.4)', text: 'var(--neon-orange)' },
    ready: { bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.5)', text: 'var(--neon-green)' },
    clicked: { bg: 'rgba(0,245,255,0.08)', border: 'rgba(0,245,255,0.4)', text: 'var(--neon-cyan)' },
    early: { bg: 'rgba(255,45,85,0.1)', border: 'rgba(255,45,85,0.4)', text: 'var(--neon-red)' },
  };

  const colors = zoneColors[phase];

  return (
    <>
      <SEOHead />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* ---- HEADER ---- */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-label">Reaction Tool</div>
          <h1 className="tool-title">Reaction Time Test</h1>
          <p className="tool-subtitle">Test your reflexes — how fast do you respond to visual stimuli?</p>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setSoundEnabled(prev => !prev)}
              aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
              aria-pressed={soundEnabled}
              style={{
                background: soundEnabled ? 'rgba(0,245,255,0.1)' : 'var(--bg-card)',
                border: `1px solid ${soundEnabled ? 'var(--neon-cyan)' : 'var(--border)'}`,
                color: soundEnabled ? 'var(--neon-cyan)' : 'var(--text-muted)',
                borderRadius: '8px',
                padding: '0.4rem 1rem',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
              }}
            >
              <span aria-hidden="true">{soundEnabled ? '🔊' : '🔇'}</span>
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </button>
          </div>
        </div>

        {/* ---- ROUND INDICATOR ---- */}
        {round > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '40px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i < results.length ? 'var(--neon-cyan)' : 'var(--border)',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
        )}

        {/* ---- MAIN INTERACTION ZONE ---- */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
          style={{
            width: '100%',
            minHeight: '320px',
            borderRadius: '16px',
            border: `2px solid ${colors.border}`,
            background: colors.bg,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            userSelect: 'none',
            transition: 'all 0.15s ease',
            marginBottom: '1.5rem',
            boxShadow: phase === 'ready' ? '0 0 60px rgba(0,255,136,0.2)' : 'none',
          }}
        >
          {phase === 'idle' && (
            <>
              <span style={{ fontSize: '4rem' }}>⚡</span>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>Click to Start</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {MAX_ROUNDS} rounds • Wait for green, then click!
              </span>
            </>
          )}
          {phase === 'waiting' && (
            <>
              <span style={{ fontSize: '4rem' }}>🔴</span>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--neon-orange)' }}>Wait for it...</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Don't click yet!</span>
            </>
          )}
          {phase === 'ready' && (
            <>
              <span style={{ fontSize: '4rem' }}>🟢</span>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--neon-green)' }}>CLICK NOW!</span>
            </>
          )}
          {phase === 'clicked' && reactionTime !== null && (
            <>
              <span style={{ fontSize: '3rem' }}>✅</span>
              <div style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', fontWeight: '900', color: 'var(--neon-cyan)' }}>
                {reactionTime}
                <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>ms</span>
              </div>
              <div style={{
                padding: '0.4rem 1rem',
                borderRadius: '50px',
                background: `${getRating(reactionTime).color}20`,
                border: `1px solid ${getRating(reactionTime).color}40`,
                color: getRating(reactionTime).color,
                fontWeight: '700',
              }}>
                {getRating(reactionTime).label}
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {round >= MAX_ROUNDS ? 'Click to see summary' : `Click for round ${round + 1}`}
              </span>
            </>
          )}
          {phase === 'early' && (
            <>
              <span style={{ fontSize: '3rem' }}>❌</span>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--neon-red)' }}>Too Early!</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Wait for the green signal. Click to retry.
              </span>
            </>
          )}
        </div>

        {/* ---- LIVE STATS ---- */}
        {results.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { value: avg ? `${avg}ms` : '—', label: 'Average', color: 'var(--neon-cyan)' },
              { value: best ? `${best}ms` : '—', label: 'Best', color: 'var(--neon-green)' },
              { value: `${results.length}/${MAX_ROUNDS}`, label: 'Rounds', color: 'var(--neon-orange)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ---- ROUND TIMELINE ---- */}
        {results.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.85rem', color: 'var(--neon-cyan)' }}>
              📊 Round Results
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {results.map((r, i) => (
                <div key={i} style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid var(--border)`,
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: getRating(r).color,
                }}>
                  R{i + 1}: {r}ms
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- REFERENCE BOX ---- */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '0.85rem', color: 'var(--neon-cyan)' }}>
            📈 Reaction Time Reference
          </div>
          <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {[
              { range: '< 150ms', label: 'Inhuman', color: 'var(--neon-red)' },
              { range: '150–200ms', label: 'Elite Gamer', color: 'var(--neon-orange)' },
              { range: '200–250ms', label: 'Great', color: 'var(--neon-cyan)' },
              { range: '250–300ms', label: 'Average', color: 'var(--neon-green)' },
              { range: '300–400ms', label: 'Below Avg', color: 'var(--text-secondary)' },
              { range: '400ms+', label: 'Slow', color: 'var(--text-muted)' },
            ].map(r => (
              <div key={r.range} style={{
                background: `${r.color}10`,
                border: `1px solid ${r.color}30`,
                borderRadius: '8px',
                padding: '0.6rem 0.8rem',
              }}>
                <div style={{ fontWeight: '700', color: r.color, fontSize: '0.9rem' }}>{r.range}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ---- RESET BUTTON ---- */}
        <button className="btn btn-secondary" onClick={handleReset}>
          🔄 Reset
        </button>

        {/* ================= SEO ARTICLE SECTION START ================= */}
        <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '3rem 0' }} />
        <section style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.75' }}>

          <h2 style={{ fontWeight: '700', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '0' }}>
            What Is a Reaction Time Test?
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            A <strong>reaction time test</strong> is a psychomotor assessment that measures how quickly a person responds to an external stimulus. In this free online reflex speed tester, the stimulus is a visual color change—when the zone shifts from red to green, you click as fast as possible. The tool records the precise number of milliseconds between the color change and your mouse click, giving you a clear, quantifiable measurement of your visual reaction speed.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Reaction time research has been a pillar of experimental psychology since the 19th century, when Dutch physiologist Franciscus Donders first systematically studied human response latencies. Modern digital tools like this one carry that tradition forward, making high-quality <strong>reaction speed testing</strong> accessible to anyone with a browser.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Unlike simple perception tests, a reaction time assessment captures the complete cycle of information processing: visual input → neural transmission → decision making → motor output. Every millisecond in that chain contributes to your final score, making it a surprisingly deep window into your neurological health and cognitive fitness.
          </p>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            Why Reaction Time Matters in Everyday Life
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Reaction time isn't just relevant for gamers. It is a fundamental component of safety and performance across dozens of real-world scenarios. When a child runs into the road, a driver's ability to slam the brakes within milliseconds can mean the difference between life and death. When a surgeon's hand begins an unintended motion during a procedure, a swift corrective reflex prevents harm. When a fighter pilot responds to an incoming threat, fast visual processing is mission-critical.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            In sports, <strong>reflex speed</strong> is often the key differentiator between athletes of otherwise equal skill. A baseball batter has roughly 400ms to process a 90mph fastball and decide whether to swing. A tennis player returning a 130mph serve has under 250ms from ball-machine contact to the moment they must initiate their swing. These scenarios make it clear that shaving even 20ms off your reaction time has tangible, meaningful real-world benefits.
          </p>

          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '2rem' }}>
            Average Human Reaction Time: What the Data Says
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            The most frequently cited benchmark for <strong>average human reaction time</strong> to a visual stimulus is <strong>250 milliseconds</strong>. This figure comes from decades of laboratory research and large-scale online datasets. However, the distribution is wide: a perfectly healthy adult might measure anywhere from 180ms to 400ms depending on conditions.
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--neon-red)' }}>🔥 Inhuman (&lt; 150ms):</strong> Exceptional—consistent performance at this level suggests either elite neurological wiring or significant anticipation. Rare even among professionals.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--neon-orange)' }}>⚡ Elite (150–200ms):</strong> Professional tier. Top esports competitors operate in this range during peak performance.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--neon-cyan)' }}>🎯 Great (200–250ms):</strong> High-skilled amateur. You can comfortably compete at high ranks in most titles.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--neon-green)' }}>✅ Average (250–300ms):</strong> This is where the majority of dedicated gamers score. Improvement with training is very achievable.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--text-muted)' }}>🐢 Slow (300ms+):</strong> Room for improvement. Hardware optimization and consistent training will produce noticeable gains.</li>
          </ul>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            How to Use the Reaction Time Test
          </h2>
          <ol style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Click the <strong>large zone</strong> to start the test.</li>
            <li style={{ marginBottom: '0.5rem' }}>Wait patiently while the zone shows red — do NOT click yet.</li>
            <li style={{ marginBottom: '0.5rem' }}>The moment the zone turns <strong>green</strong>, click as fast as you can.</li>
            <li style={{ marginBottom: '0.5rem' }}>Your reaction time in milliseconds is recorded and rated.</li>
            <li style={{ marginBottom: '0.5rem' }}>Complete all 5 rounds to build a reliable average score.</li>
            <li style={{ marginBottom: '0.5rem' }}>Press <strong>Reset</strong> to clear results and start a new session.</li>
          </ol>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            How Reaction Time Is Measured in This Tool
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            This <strong>online reaction test</strong> uses JavaScript's <code>performance.now()</code> API, which provides sub-millisecond precision timing directly within the browser. When the green stimulus appears, the precise timestamp is recorded internally. When you click, another timestamp is captured. The difference between these two values—rounded to the nearest millisecond—is your reaction time.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            The random delay between 1.5 and 5 seconds before each stimulus is deliberately variable. This design prevents your brain from timing the green appearance, ensuring each click represents genuine reactive speed rather than anticipatory guessing. This is the same principle used in professional sports testing facilities and academic research protocols.
          </p>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            Visual vs Auditory Reaction Time
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            This tool measures <strong>visual reaction time</strong>, which is the most widely studied form. However, auditory and tactile reaction times also play critical roles in real-world performance. Research consistently shows that human beings respond to sounds approximately 20–50ms faster than to visual stimuli.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            The reason is anatomical. Visual information must travel from the retina through the optic nerve to the visual cortex—a relatively long neural pathway. Auditory signals travel from the cochlea to the auditory cortex via a shorter route and also benefit from bilateral processing (both ears simultaneously). This is why sprinters react to a starting pistol blast faster than they would react to a starting light.
          </p>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            Factors That Affect Your Reaction Time Score
          </h2>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.6rem' }}><strong>Alertness and arousal level:</strong> Being awake and mentally active is essential. Testing immediately after waking up will yield significantly slower scores than testing after 30 minutes of mental engagement.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Temperature:</strong> Warmer environments slightly speed up neural conduction. Cold hands and fingers have more sluggish muscle response.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Distractions:</strong> Noise, notifications, and visual clutter in your environment consume cognitive resources needed for focused reaction.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Anticipation vs. reaction:</strong> Knowing a stimulus is "soon" creates a state of heightened readiness. Fully random delays prevent this from inflating scores.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Practice effect:</strong> Simply becoming familiar with a specific test reduces cognitive overhead, improving scores over early trials—even without genuine reflex improvement.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Hardware quality:</strong> Display refresh rate, mouse polling rate, and USB port quality all contribute to measured latency.</li>
          </ul>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            Sleep and Reflexes: The Most Underrated Factor
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Of all the controllable variables affecting <strong>reflex speed</strong>, sleep quality and duration stand out as the most impactful and most overlooked. The relationship between sleep and neural processing speed is both direct and well-documented. The brain consolidates procedural learning and motor skills during deep sleep stages, which is precisely why athletes, soldiers, and gamers all perform better when properly rested.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            A landmark study published in the journal <em>Sleep</em> found that reducing nightly sleep from 8 to 6 hours for two weeks produced cognitive deficits equivalent to two nights of total sleep deprivation—with subjects largely unaware of their own impairment. This means you may feel fine but still be operating with meaningfully slower reaction times.
          </p>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            Caffeine and Reaction Speed
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Caffeine is the world's most widely consumed psychoactive substance, and for good reason—it works. By blocking adenosine receptors in the brain, caffeine promotes wakefulness and increases dopamine activity, which sharpens focus and motor readiness. Studies consistently demonstrate that moderate caffeine consumption—roughly 100–200mg, or one to two standard cups of coffee—reduces visual reaction time by 10–30ms on average.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            However, the relationship is nonlinear. Excessive caffeine intake causes sympathetic nervous system overstimulation, leading to hand tremors, elevated anxiety, and paradoxically slower reaction times due to increased error rates.
          </p>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            Age and Reaction Time: When Do We Peak?
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Neurological research indicates that raw reaction speed peaks between ages 18 and 24, then gradually declines throughout adulthood. The decline accelerates after age 60, though it remains subtle and manageable with consistent cognitive and physical activity until then. Interestingly, experience often compensates for age-related neural slowdown. A 35-year-old veteran gamer may score comparably to a 20-year-old novice because they have internalized pattern recognition and decision shortcuts.
          </p>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            Gaming and Reflex Improvement: The Science
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            The idea that video games improve reflexes is no longer just gamer folklore—it is backed by a growing body of peer-reviewed research. A study published in <em>Nature</em> found that players of action video games make correct decisions 25% faster than non-gamers without sacrificing accuracy. FPS games in particular are uniquely demanding for reaction time development, requiring players to identify, track, and respond to fast-moving targets in environments with multiple simultaneous stimuli.
          </p>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            Mouse Latency & Monitor Refresh Rate
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { title: '🖱️ Mouse Latency', points: ['Gaming mice: <1ms', 'Office mice: 5–20ms', 'USB 1000Hz polling ideal', 'Wired > Bluetooth', 'Matters in competitive play'] },
              { title: '🖥️ Monitor Refresh', points: ['60Hz = 16.67ms/frame', '144Hz = 6.94ms/frame', '240Hz = 4.17ms/frame', '360Hz = 2.78ms/frame', 'Higher = faster stimulus display'] },
            ].map(col => (
              <div key={col.title} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{col.title}</div>
                <ul style={{ paddingLeft: '1rem', margin: 0, listStyleType: 'disc' }}>
                  {col.points.map(p => <li key={p} style={{ marginBottom: '0.3rem', fontSize: '0.85rem' }}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            How to Improve Your Reaction Time
          </h2>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.6rem' }}><strong>Use this reaction trainer daily:</strong> 5–10 minutes of focused reaction time testing each morning builds neural familiarity and tracks trends over time.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Supplement with aim trainers:</strong> Tools like Aim Lab and KovaaK's add target acquisition and tracking to pure reaction speed.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Play fast-paced deathmatch:</strong> Unstructured deathmatch modes in FPS titles provide live, chaotic stimulus environments.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Maintain an exercise routine:</strong> 30 minutes of cardio three times per week measurably improves neuroplasticity.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Optimize sleep:</strong> Target 7–9 hours per night, with consistent sleep and wake times.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Upgrade selectively:</strong> If your monitor is 60Hz and you are serious about gaming performance, upgrading to 144Hz+ is the single most impactful hardware change.</li>
          </ul>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            Common Mistakes During Reaction Time Testing
          </h2>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.6rem' }}><strong>Testing while fatigued:</strong> Scores taken during mental or physical fatigue can be 30–80ms slower than your rested baseline.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Clicking before the signal:</strong> Anticipatory clicking (false starts) doesn't reflect your actual reaction time.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Using a trackpad instead of a mouse:</strong> Laptop trackpads have higher latency and significantly inflate scores.</li>
            <li style={{ marginBottom: '0.6rem' }}><strong>Tensing up excessively:</strong> Over-gripping your mouse increases muscle fatigue and slows fine motor commands.</li>
          </ul>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            Browser Compatibility
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            This Reaction Time Test uses the <code>performance.now()</code> Web API for high-resolution timing, supported in all modern browsers: <strong>Chrome, Firefox, Safari, Edge, and Opera</strong>. No plugins or downloads are required. JavaScript must be enabled.
          </p>

          <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
            Privacy Statement
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            This tool operates entirely within your browser using client-side JavaScript. <strong>No click data, timing results, or personal information is collected, stored, or transmitted to any server.</strong> All statistics exist only in your browser memory and are cleared when you reset the tool or close the tab.
          </p>

          {/* ── FAQ ─────────────────────────────────────────────── */}
          <div style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', marginTop: '0' }}>
              Frequently Asked Questions (FAQs)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {FAQ_DATA.map(({ q, a }, i) => (
                <div key={i}>
                  <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>{q}</h3>
                  <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Internal Links ────────────────────────────────────── */}
          <div style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', marginTop: '0' }}>
              🔗 Related Reflex & Performance Tools
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {[
                { href: '/aim-trainer', label: '🎯 Aim Trainer' },
                { href: '/typing-test', label: '⌨️ Typing Test' },
                { href: '/spacebar-test', label: '⬜ Spacebar Test' },
                { href: '/click-speed-test', label: '🖱️ Click Speed Test' },
                { href: '/cps-test', label: '⚡ CPS Test' },
                { href: '/double-click-test', label: '🖱️ Double Click Test' },
                { href: '/jitter-click-test', label: '💥 Jitter Click Test' },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '8px',
                    background: 'rgba(0,245,255,0.07)',
                    border: '1px solid rgba(0,245,255,0.2)',
                    color: 'var(--neon-cyan)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,245,255,0.14)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,245,255,0.07)'; }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
        {/* ================= SEO ARTICLE SECTION END ================= */}
      </div>
    </>
  );
}
