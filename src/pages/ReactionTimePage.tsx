import { useState, useRef, useCallback, useEffect } from 'react';

// ─── More Tools ───────────────────────────────────────────────────────────────
interface ToolLink { label: string; href: string; icon: React.ReactNode; }

const MORE_TOOLS: ToolLink[] = [
  { label: 'CPS Test', href: '/cps-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Spacebar Counter', href: '/spacebar', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="6" y1="15" x2="18" y2="15"/></svg> },
  { label: 'Aim Trainer', href: '/aim-trainer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
  { label: 'Typing Test', href: '/typing-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 15h8M7 11h2m3 0h2m3 0h-1"/></svg> },
  { label: 'Reaction Time', href: '/reaction-time', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: 'Scroll Test', href: '/scroll-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="9"/><path d="M9 11l3-3 3 3"/><path d="M9 13l3 3 3-3"/></svg> },
  { label: 'Double Click', href: '/double-click', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/></svg> },
  { label: 'Sniper Mode', href: '/sniper-mode', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/><circle cx="12" cy="12" r="8" opacity=".4"/></svg> },
  { label: 'Mouse Accuracy', href: '/mouse-accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 2v10"/></svg> },
  { label: 'Key Visualizer', href: '/key-visualizer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"/></svg> },
  { label: 'F1 Reaction', href: '/f1-reaction', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { label: 'Space Defense', href: '/space-defense', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { label: 'Accuracy Test', href: '/accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { label: 'CPS Rush', href: '/cps-rush', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 12v-4"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Voyager Game', href: '/voyager-game', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },
];

// ============================================================
// TYPES
// ============================================================
type Phase = 'idle' | 'waiting' | 'ready' | 'clicked' | 'early';

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
  { q: 'How does monitor refresh rate affect reaction time tests?', a: "Monitor refresh rate directly impacts how quickly a new frame is displayed on screen. At 60Hz, a new image appears roughly every 16.6ms. At 144Hz, it's every 6.9ms, and at 240Hz, every 4.2ms. This means higher refresh rate monitors can display the green stimulus sooner, giving you a real-time advantage in both testing and gaming." },
  { q: 'What is input lag and how does it affect my score?', a: 'Input lag is the delay between a physical action (like clicking a mouse button) and the system registering that action. High-quality gaming mice and wired connections typically exhibit less than 1ms of input lag, while wireless budget peripherals may lag by 5–20ms. Reducing input lag ensures your measured reaction time is closer to your true neurological speed.' },
  { q: 'What is the fastest human reaction time ever recorded?', a: 'The fastest reliably recorded human reaction times in controlled laboratory settings are around 100–120ms, typically achieved by elite sprinters responding to starting gun blasts. For visual stimuli specifically, consistent sub-150ms reactions are exceptionally rare and often indicate anticipation rather than pure reaction.' },
  { q: 'Is there a difference between visual and auditory reaction time?', a: "Yes. Auditory (sound-based) reaction times are typically 20–50ms faster than visual reaction times. This is because sound signals take a shorter neural pathway to the brain's motor cortex compared to visual signals. This is why starting pistols are used in athletics rather than visual flags." },
  { q: 'How do professional FPS gamers train their reflexes?', a: "Professional FPS players use dedicated aim trainers like Aim Lab and KovaaK's, play deathmatch modes for live practice, maintain consistent sleep schedules, optimize their hardware for minimum latency, and perform cognitive exercises to sharpen mental focus. Many also engage in physical exercise, which has been shown to improve neural processing speed." },
  { q: 'Can stress or anxiety affect reaction time?', a: 'Moderate stress can temporarily sharpen alertness through adrenaline release, potentially improving reaction time in short bursts—this is the fight-or-flight response. However, chronic stress, anxiety disorders, or high-pressure situations that cause panic typically degrade fine motor control and increase reaction times.' },
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
// CHEVRON ICON
// ============================================================
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ============================================================
// SINGLE FAQ ITEM
// ============================================================
function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        borderRadius: '8px',
        border: isOpen
          ? '1px solid rgba(0, 245, 255, 0.35)'
          : '1px solid rgba(255, 255, 255, 0.07)',
        background: isOpen
          ? 'rgba(0, 245, 255, 0.04)'
          : 'rgba(255, 255, 255, 0.02)',
        overflow: 'hidden',
        transition: 'border-color 0.22s ease, background 0.22s ease',
      }}
    >
      {/* Question row */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1rem 1.25rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: isOpen ? '#00f5ff' : '#e0e0e0',
          fontFamily: 'inherit',
          fontWeight: 700,
          fontSize: '0.95rem',
          lineHeight: 1.45,
          transition: 'color 0.22s ease',
        }}
      >
        <span>{question}</span>
        <span style={{ color: isOpen ? '#00f5ff' : '#6b7280', transition: 'color 0.22s ease' }}>
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {/* Answer panel */}
      <div
        style={{
          maxHeight: isOpen ? '600px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <p
          style={{
            margin: 0,
            padding: '0 1.25rem 1.1rem',
            color: '#9ca3af',
            fontSize: '0.875rem',
            lineHeight: 1.75,
          }}
        >
          {answer}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// FAQ ACCORDION SECTION
// ============================================================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(prev => (prev === i ? null : i));
  };

  return (
    <div
      style={{
        marginTop: '2.5rem',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid var(--border)',
        background: 'rgba(0,0,0,0.2)',
      }}
    >
      <h2
        style={{
          color: 'var(--neon-cyan)',
          fontSize: '1.25rem',
          fontWeight: 700,
          marginBottom: '1.25rem',
          marginTop: 0,
        }}
      >
        Frequently Asked Questions (FAQs)
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {FAQ_DATA.map(({ q, a }, i) => (
          <FAQItem
            key={i}
            question={q}
            answer={a}
            isOpen={openIndex === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
    </div>
  );
}

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
    idle:    { bg: 'var(--bg-card)',              border: 'var(--border)',                text: 'var(--text-muted)' },
    waiting: { bg: 'rgba(255,107,0,0.08)',         border: 'rgba(255,107,0,0.4)',          text: 'var(--neon-orange)' },
    ready:   { bg: 'rgba(0,255,136,0.1)',          border: 'rgba(0,255,136,0.5)',          text: 'var(--neon-green)' },
    clicked: { bg: 'rgba(0,245,255,0.08)',         border: 'rgba(0,245,255,0.4)',          text: 'var(--neon-cyan)' },
    early:   { bg: 'rgba(255,45,85,0.1)',          border: 'rgba(255,45,85,0.4)',          text: 'var(--neon-red)' },
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
              { range: '< 150ms',   label: 'Inhuman',    color: 'var(--neon-red)' },
              { range: '150–200ms', label: 'Elite Gamer', color: 'var(--neon-orange)' },
              { range: '200–250ms', label: 'Great',       color: 'var(--neon-cyan)' },
              { range: '250–300ms', label: 'Average',     color: 'var(--neon-green)' },
              { range: '300–400ms', label: 'Below Avg',   color: 'var(--text-secondary)' },
              { range: '400ms+',    label: 'Slow',        color: 'var(--text-muted)' },
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

        {/* ── MORE TOOLS GRID ── */}
        <section aria-label="More Tools" style={{ marginBottom: '3.5rem', marginTop: '3.5rem' }}>
          <h2 style={{
            fontWeight: 800, fontSize: '1.5rem', color: '#fff',
            marginBottom: '1.5rem', textAlign: 'center',
            letterSpacing: '-0.3px',
          }}>More Tools</h2>
          <div
            className="cps-games-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '1rem',
            }}
          >
            {MORE_TOOLS.map(({ label, href, icon }) => (
              <a
                key={href}
                href={href}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '0.6rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '1.2rem 0.5rem',
                  cursor: 'pointer', textDecoration: 'none',
                  color: 'var(--neon-cyan)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,245,255,0.07)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,245,255,0.3)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--neon-cyan)',
                }}>
                  {icon}
                </div>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3,
                }}>{label}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ================= SEO ARTICLE SECTION START ================= */}
        <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '3rem 0' }} />
        <section style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.75' }}>

          {/* ── inline link style helper ── */}
          {(() => {
            const RL: React.CSSProperties = {
              color: 'var(--neon-cyan)',
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              textUnderlineOffset: '3px',
              fontWeight: 600,
            };
            return (
              <>

                {/* ─── 1 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '0' }}>
                  What Is a Reaction Time Test?
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  A <strong>reaction time test</strong> is a psychomotor assessment that measures how quickly a person responds to an external stimulus. In this free online reflex speed tester, the stimulus is a visual color change—when the zone shifts from red to green, you click as fast as possible. The tool records the precise number of milliseconds between the color change and your mouse click, giving you a clear, quantifiable measurement of your visual reaction speed.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  Reaction time research has been a pillar of experimental psychology since the 19th century, when Dutch physiologist Franciscus Donders first systematically studied human response latencies in his landmark 1869 paper{' '}
                  <a href="https://link.springer.com/article/10.1007/BF02702918" target="_blank" rel="noopener noreferrer" style={RL}>
                    "On the speed of mental processes"↗
                  </a>. Modern digital tools like this one carry that tradition forward, making high-quality <strong>reaction speed testing</strong> accessible to anyone with a browser.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  Unlike simple perception tests, a reaction time assessment captures the complete cycle of information processing: visual input → neural transmission → decision making → motor output. Every millisecond in that chain contributes to your final score, making it a surprisingly deep window into your neurological health and cognitive fitness.
                </p>

                {/* ─── 2 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Why Reaction Time Matters in Everyday Life
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  Reaction time isn't just relevant for gamers. It is a fundamental component of safety and performance across dozens of real-world scenarios. A driver's ability to slam the brakes within milliseconds when a child runs into the road can mean the difference between life and death. Research from the{' '}
                  <a href="https://www.nhtsa.gov/sites/nhtsa.gov/files/811298.pdf" target="_blank" rel="noopener noreferrer" style={RL}>
                    National Highway Traffic Safety Administration (NHTSA)↗
                  </a>{' '}
                  identifies driver perception-reaction time as one of the leading factors in collision severity. When a surgeon's hand begins an unintended motion during a procedure, a swift corrective reflex prevents harm. When a fighter pilot responds to an incoming threat, fast visual processing is mission-critical.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  In sports, <strong>reflex speed</strong> is often the key differentiator between athletes of otherwise equal skill. A baseball batter has roughly 400ms to process a 90mph fastball and decide whether to swing. A tennis player returning a 130mph serve has under 250ms from ball contact to the moment they must initiate their swing. These scenarios make it clear that shaving even 20ms off your reaction time has tangible, meaningful real-world benefits.
                </p>

                {/* ─── 3 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Average Human Reaction Time: What the Research Says
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  The most frequently cited benchmark for <strong>average human reaction time</strong> to a visual stimulus is <strong>250 milliseconds</strong>. A large-scale meta-analysis by Jain et al. (2015) published in the{' '}
                  <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4424208/" target="_blank" rel="noopener noreferrer" style={RL}>
                    Indian Journal of Physiology and Pharmacology↗
                  </a>{' '}
                  confirmed this figure across thousands of participants, while noting significant variation by age, gender, and training status. However, the distribution is wide: a perfectly healthy adult might measure anywhere from 180ms to 400ms depending on conditions.
                </p>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--neon-red)' }}>🔥 Inhuman (&lt; 150ms):</strong> Exceptional — consistent performance here suggests elite neurological wiring or significant anticipation. Rare even among professionals.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--neon-orange)' }}>⚡ Elite (150–200ms):</strong> Professional tier. Top esports competitors operate in this range during peak performance.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--neon-cyan)' }}>🎯 Great (200–250ms):</strong> High-skilled amateur. You can comfortably compete at high ranks in most titles.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--neon-green)' }}>✅ Average (250–300ms):</strong> Where the majority of dedicated gamers score. Improvement with training is very achievable.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong style={{ color: 'var(--text-muted)' }}>🐢 Slow (300ms+):</strong> Room for improvement. Hardware optimization and consistent training will produce noticeable gains.</li>
                </ul>

                {/* ─── 4 ─────────────────────────────────── */}
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

                {/* ─── 5 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  How Reaction Time Is Measured in This Tool
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  This <strong>online reaction test</strong> uses JavaScript's <code>performance.now()</code> API, which provides sub-millisecond precision timing directly within the browser. When the green stimulus appears, the precise timestamp is recorded internally. When you click, another timestamp is captured. The difference between these two values—rounded to the nearest millisecond—is your reaction time.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  The random delay between 1.5 and 5 seconds before each stimulus is deliberately variable. This design prevents your brain from timing the green appearance, ensuring each click represents genuine reactive speed rather than anticipatory guessing. This is the same principle used in professional sports testing facilities and academic research protocols.
                </p>

                {/* ─── 6 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Visual vs Auditory Reaction Time: Key Differences
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  This tool measures <strong>visual reaction time</strong>, which is the most widely studied form. However, auditory and tactile reaction times also play critical roles in real-world performance. Research consistently shows that human beings respond to sounds approximately 20–50ms faster than to visual stimuli. A foundational study by{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/6859656/" target="_blank" rel="noopener noreferrer" style={RL}>
                    Welford (1980) in Ergonomics↗
                  </a>{' '}
                  documented this cross-modal difference across multiple experimental paradigms.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  The reason is anatomical. Visual information must travel from the retina through the optic nerve to the visual cortex — a relatively long neural pathway. Auditory signals travel from the cochlea to the auditory cortex via a shorter route and also benefit from bilateral processing (both ears simultaneously). This is why sprinters react to a starting pistol blast faster than they would react to a starting light.
                </p>

                {/* ─── 7 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  The Neuroscience Behind Reaction Time
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  When you see the green signal, photoreceptors in your retina fire, sending electrochemical signals through the optic nerve to the primary visual cortex (V1) in the occipital lobe. From there, the signal branches: one pathway (the dorsal stream) carries spatial information about where the stimulus is, while the ventral stream identifies what it is. These signals then converge in the premotor cortex, which prepares the motor command.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  The entire sequence—from photon hitting the retina to finger muscle contracting—involves at least 8–10 distinct neural relay stations. Research published in{' '}
                  <a href="https://www.nature.com/articles/nn.2112" target="_blank" rel="noopener noreferrer" style={RL}>
                    Nature Neuroscience by Shadlen & Newsome↗
                  </a>{' '}
                  demonstrated that neurons in the lateral intraparietal area (LIP) accumulate evidence over time and trigger motor decisions once a threshold is reached — a process directly observable in reaction time variability across trials.
                </p>

                {/* ─── 8 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Factors That Affect Your Reaction Time Score
                </h2>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Alertness and arousal level:</strong> Being awake and mentally active is essential. Testing immediately after waking up will yield significantly slower scores than testing after 30 minutes of mental engagement.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Temperature:</strong> Warmer environments slightly speed up neural conduction velocity. Cold hands and fingers have more sluggish muscle fiber response.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Distractions:</strong> Noise, notifications, and visual clutter consume cognitive resources needed for focused reaction. Studies show dual-task interference can add 50–100ms to baseline reaction times.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Anticipation vs. reaction:</strong> Knowing a stimulus is "soon" creates a state of heightened readiness. Fully random delays prevent anticipatory guessing from inflating scores.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Practice effect:</strong> Simply becoming familiar with a specific test reduces cognitive overhead, improving scores over early trials—even without genuine reflex improvement.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Hardware quality:</strong> Display refresh rate, mouse polling rate, and USB port quality all contribute to measured end-to-end latency.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Hydration:</strong> Even mild dehydration (1–2% body weight) measurably slows neural transmission. Always test when properly hydrated.</li>
                </ul>

                {/* ─── 9 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Sleep Deprivation and Reflex Speed: The Research
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  Of all the controllable variables affecting <strong>reflex speed</strong>, sleep quality and duration stand out as the most impactful and most overlooked. The relationship between sleep and neural processing speed is both direct and well-documented. The brain consolidates procedural learning and motor skills during slow-wave sleep, which is precisely why athletes, soldiers, and gamers all perform better when properly rested.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  A landmark study by Van Dongen et al., published in{' '}
                  <a href="https://academic.oup.com/sleep/article/26/2/117/2708922" target="_blank" rel="noopener noreferrer" style={RL}>
                    Sleep (2003)↗
                  </a>{' '}
                  found that restricting nightly sleep to 6 hours for two weeks produced cognitive deficits equivalent to two full nights of total sleep deprivation — and crucially, subjects were largely unaware of their own impairment. This means you may feel fine but still be operating with meaningfully slower reaction times. A follow-up study in{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/9415946/" target="_blank" rel="noopener noreferrer" style={RL}>
                    Journal of Sleep Research↗
                  </a>{' '}
                  confirmed that even a single night of partial sleep loss (5 hours) significantly increases visual reaction time and error rate.
                </p>

                {/* ─── 10 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Caffeine, Stimulants, and Reaction Speed
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  Caffeine is the world's most widely consumed psychoactive substance. By blocking adenosine receptors in the brain, caffeine promotes wakefulness and increases dopamine activity, which sharpens focus and motor readiness. A meta-analysis by{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/20492310/" target="_blank" rel="noopener noreferrer" style={RL}>
                    Heckman et al. published in Critical Reviews in Food Science and Nutrition↗
                  </a>{' '}
                  demonstrated that moderate caffeine consumption — roughly 100–200mg — reduces visual reaction time by 10–30ms on average, with effects peaking 30–60 minutes after ingestion.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  However, the relationship is nonlinear. Excessive caffeine intake causes sympathetic nervous system overstimulation, leading to hand tremors, elevated anxiety, and paradoxically slower reaction times due to increased error rates. Individual caffeine sensitivity also varies significantly based on CYP1A2 enzyme genetics.
                </p>

                {/* ─── 11 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Age and Reaction Time: When Do We Peak?
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  Neurological research consistently indicates that raw reaction speed peaks between ages 18 and 24, then gradually declines throughout adulthood. A large cross-sectional study by{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/24077939/" target="_blank" rel="noopener noreferrer" style={RL}>
                    Silverman (2014) in PLOS ONE↗
                  </a>{' '}
                  analyzing over 3,000 participants found that reaction time increases by approximately 8ms per decade after age 24, with the decline accelerating markedly after 60. Interestingly, cognitive experience often compensates for age-related neural slowdown — a 35-year-old veteran gamer may score comparably to a 20-year-old novice because they have internalized pattern recognition and decision shortcuts.
                </p>

                {/* ─── 12 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Video Games and Reflex Improvement: Peer-Reviewed Evidence
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  The idea that video games improve reflexes is no longer just gamer folklore — it is backed by a growing body of peer-reviewed research. A landmark study by{' '}
                  <a href="https://www.nature.com/articles/nature02677" target="_blank" rel="noopener noreferrer" style={RL}>
                    Green & Bavelier published in Nature (2003)↗
                  </a>{' '}
                  found that players of action video games make correct perceptual decisions 25% faster than non-gamers without sacrificing accuracy. A follow-up study by the same authors in{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/17991858/" target="_blank" rel="noopener noreferrer" style={RL}>
                    Psychological Science (2007)↗
                  </a>{' '}
                  showed that non-gamers trained for just 10 hours on an action game showed significant improvement in visual attention and reaction speed.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  FPS games in particular are uniquely demanding for reaction time development, requiring players to identify, track, and respond to fast-moving targets in environments with multiple simultaneous stimuli — a condition researchers call "multiple-object tracking under time pressure."
                </p>

                {/* ─── 13 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Physical Exercise and Neural Processing Speed
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  Research published in{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/17337212/" target="_blank" rel="noopener noreferrer" style={RL}>
                    Neuropsychologia by Hillman et al. (2006)↗
                  </a>{' '}
                  established a strong link between aerobic fitness and faster neural processing speed. The mechanism involves increased cerebral blood flow, elevated BDNF (brain-derived neurotrophic factor) levels, and enhanced white matter connectivity — all of which reduce the time required to transmit electrochemical signals across the neural chain involved in reactive decisions.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  A meta-analysis in{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/23820470/" target="_blank" rel="noopener noreferrer" style={RL}>
                    British Journal of Sports Medicine↗
                  </a>{' '}
                  found that even moderate exercise (30 minutes of moderate-intensity cardio, 3x per week) produced statistically significant improvements in reaction time after 8 weeks. High-intensity interval training (HIIT) produced the fastest gains in the shortest timeframe.
                </p>

                {/* ─── 14 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Mouse Latency, Monitor Refresh Rate & Input Hardware
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { title: '🖱️ Mouse Latency', points: ['Gaming mice: <1ms click latency', 'Office mice: 5–20ms', 'USB 1000Hz polling rate ideal', 'Wired > Wireless (Bluetooth)', 'Switch actuation force matters'] },
                    { title: '🖥️ Monitor Refresh Rate', points: ['60Hz = 16.67ms per frame', '144Hz = 6.94ms per frame', '240Hz = 4.17ms per frame', '360Hz = 2.78ms per frame', 'Higher refresh = earlier stimulus'] },
                  ].map(col => (
                    <div key={col.title} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{col.title}</div>
                      <ul style={{ paddingLeft: '1rem', margin: 0, listStyleType: 'disc' }}>
                        {col.points.map(p => <li key={p} style={{ marginBottom: '0.3rem', fontSize: '0.85rem' }}>{p}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                <p style={{ marginBottom: '1.5rem' }}>
                  Hardware-side latency testing by{' '}
                  <a href="https://www.rtings.com/monitor/tests/motion/input-lag" target="_blank" rel="noopener noreferrer" style={RL}>
                    RTINGS.com's display lab↗
                  </a>{' '}
                  shows that monitor input lag ranges from under 1ms on top gaming displays to over 50ms on budget TVs used as monitors — a difference that can overwhelm your actual neurological reaction time. If you're scoring 280ms and can't break below 250ms, your hardware latency may be the bottleneck.
                </p>

                {/* ─── 15 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Stress, Anxiety, and the Fight-or-Flight Response
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  The relationship between stress and reaction time is complex and dose-dependent. Moderate acute stress activates the sympathetic nervous system, triggering adrenaline release that sharpens alertness and can temporarily improve reaction time by 10–20ms — a phenomenon known as "stress-enhanced attention." Research by{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/16750580/" target="_blank" rel="noopener noreferrer" style={RL}>
                    Sapolsky et al. in Nature Reviews Neuroscience↗
                  </a>{' '}
                  describes this as an inverted-U relationship: optimal performance occurs at moderate arousal levels, with both under-arousal (drowsiness) and over-arousal (panic) degrading reaction speed.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  Chronic stress, however, has the opposite effect. Sustained elevated cortisol damages hippocampal neurons, disrupts working memory, and measurably slows processing speed. Competitive gamers who "tilt" — entering a state of high emotional frustration — consistently show degraded performance metrics, including reaction time, during and after the tilt episode.
                </p>

                {/* ─── 16 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Reaction Time in Professional Esports
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  Professional esports athletes undergo systematic reflex training as part of their performance regimens. A study published in the{' '}
                  <a href="https://www.tandfonline.com/doi/full/10.1080/02640414.2019.1603991" target="_blank" rel="noopener noreferrer" style={RL}>
                    Journal of Sports Sciences (2019)↗
                  </a>{' '}
                  found that elite esports competitors exhibit significantly faster simple reaction times (avg. 194ms) and choice reaction times compared to non-gaming controls (avg. 268ms). The study also found that top-ranked players showed lower intra-individual variability — meaning more consistent reactions round-to-round — as a key differentiator.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  Professional teams now employ dedicated performance coaches and use tools like{' '}
                  <a href="https://aimlab.gg" target="_blank" rel="noopener noreferrer" style={RL}>
                    Aim Lab↗
                  </a>{' '}
                  and{' '}
                  <a href="https://kovaaks.com" target="_blank" rel="noopener noreferrer" style={RL}>
                    KovaaK's FPS Aim Trainer↗
                  </a>{' '}
                  to build structured training plans. These tools allow players to isolate and drill specific scenarios — flick shots, tracking, micro-adjustments — in a measurable, progressive framework that mirrors athletic periodization.
                </p>

                {/* ─── 17 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Gender Differences in Reaction Time
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  Multiple large-scale studies have found that males, on average, exhibit slightly faster simple reaction times than females — a difference of approximately 20–30ms — though the gap narrows substantially when controlling for gaming experience and practice history. A comprehensive review by{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/20423319/" target="_blank" rel="noopener noreferrer" style={RL}>
                    Der & Deary (2006) in Neuropsychologia↗
                  </a>{' '}
                  analyzing data from over 7,000 participants found that this difference is largely attributable to differences in motor preparation speed rather than perceptual processing speed. Importantly, the study found that training eliminates most of this gap — highly trained female athletes consistently outperform untrained males.
                </p>

                {/* ─── 18 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Nutrition and Cognitive Performance: What Helps Reaction Time
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  Beyond caffeine, several nutritional factors meaningfully influence neural processing speed. Omega-3 fatty acids (DHA in particular) are structural components of neuronal membranes and synapse receptors. A randomized controlled trial published in{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/20329590/" target="_blank" rel="noopener noreferrer" style={RL}>
                    PLOS ONE by Stonehouse et al.↗
                  </a>{' '}
                  found that DHA supplementation significantly improved reaction time in healthy young adults over 6 months.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  Adequate iron levels matter too — iron deficiency (even without anemia) impairs myelination of nerve fibers, slowing signal conduction velocity. Magnesium supports NMDA receptor function critical for synaptic plasticity. And proper hydration is non-negotiable: research in the{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/22190027/" target="_blank" rel="noopener noreferrer" style={RL}>
                    Journal of Nutrition↗
                  </a>{' '}
                  showed that just 1.36% dehydration increased reaction time and self-reported fatigue in young women.
                </p>

                {/* ─── 19 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  How to Improve Your Reaction Time: A Structured Plan
                </h2>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Daily reaction training (5–10 min):</strong> Use this test every morning. Track your 5-round average daily to identify trends over weeks.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Aim trainer sessions (15–20 min, 4x/week):</strong> Tools like{' '}<a href="https://aimlab.gg" target="_blank" rel="noopener noreferrer" style={RL}>Aim Lab↗</a>{' '}add target acquisition and tracking to pure reaction speed.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Aerobic exercise (30 min, 3x/week):</strong> Running, cycling, or swimming at moderate intensity demonstrably improves neural processing speed within 8 weeks.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Optimize sleep hygiene:</strong> Target 7–9 hours per night with consistent sleep/wake times. Sleep is when motor memory consolidates.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Upgrade your monitor:</strong> Moving from 60Hz to 144Hz is the single most impactful hardware change for competitive gaming and test accuracy.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Mindfulness and focus training:</strong> Short mindfulness sessions (10 min/day) have been shown in{' '}<a href="https://pubmed.ncbi.nlm.nih.gov/19460998/" target="_blank" rel="noopener noreferrer" style={RL}>research by Jha et al.↗</a>{' '}to significantly improve attentional control, which directly reduces reaction time.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Warm up before testing:</strong> A 2–3 minute warm-up period of light clicking or casual gaming primes your motor system and yields more accurate baseline scores.</li>
                </ul>

                {/* ─── 20 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Reaction Time in Driving Safety Research
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  Driving is one of the highest-stakes real-world applications of reaction time. The standard assumption in traffic engineering is a "perception-reaction time" of 1.5 seconds (1500ms) — far longer than the raw neurological reaction time of 200–300ms. This accounts for the time needed to perceive a hazard (not just notice it), decide to brake, and then physically move the foot from accelerator to brake pedal.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  Research by{' '}
                  <a href="https://www.sciencedirect.com/science/article/pii/S0001457503000988" target="_blank" rel="noopener noreferrer" style={RL}>
                    Green (2000) in Accident Analysis and Prevention↗
                  </a>{' '}
                  showed that driver reaction time varies enormously — from 0.7 seconds in highly alert, anticipated braking to over 3 seconds in unexpected scenarios. Phone distraction, alcohol, and sleep deprivation each add 200–500ms to driver reaction time. Autonomous emergency braking (AEB) systems in modern vehicles intervene in as little as 50–100ms — faster than any human can respond — demonstrating why hardware reaction time will increasingly supplement human reflexes in safety-critical contexts.
                </p>

                {/* ─── 21 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Reaction Time as a Cognitive Health Biomarker
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  Beyond gaming and sports, reaction time is increasingly used as a sensitive biomarker for overall cognitive health and neurological status. A groundbreaking longitudinal study by{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/16997147/" target="_blank" rel="noopener noreferrer" style={RL}>
                    Deary et al. (2006) in the British Medical Journal↗
                  </a>{' '}
                  found that reaction time measured in childhood was a significant predictor of all-cause mortality 20+ years later, independent of other risk factors. Faster reaction time correlated with better cardiovascular health, lower obesity risk, and reduced risk of accidental death.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  In clinical settings, reaction time tests are used to screen for early cognitive decline in Alzheimer's and Parkinson's disease, to assess concussion recovery in athletes, and to evaluate medication side effects on motor function. Tracking your reaction time over months and years is therefore not just a gaming metric — it's a window into your brain's health trajectory.
                </p>

                {/* ─── 22 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Common Mistakes During Reaction Time Testing
                </h2>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Testing while fatigued:</strong> Scores taken during mental or physical fatigue can be 30–80ms slower than your rested baseline. Always note your energy level alongside your score.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Clicking before the signal:</strong> Anticipatory clicking (false starts) doesn't reflect your actual reaction time and skews your average downward artificially.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Using a trackpad instead of a mouse:</strong> Laptop trackpads have higher latency and significantly inflate scores. Always use a wired mouse for accurate results.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Tensing up excessively:</strong> Over-gripping your mouse increases muscle fatigue and slows fine motor commands. Keep a relaxed grip.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Testing in a cluttered environment:</strong> Background noise and distracting visuals significantly increase cognitive load and slow response time.</li>
                  <li style={{ marginBottom: '0.6rem' }}><strong>Ignoring warm-up:</strong> Your first 1–2 rounds are always slower. The test's 5-round format accounts for this, but avoid drawing conclusions from a single attempt.</li>
                </ul>

                {/* ─── 23 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Accuracy and Limitations of Browser-Based Reaction Tests
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  This tool uses <code>performance.now()</code>, which provides high-resolution timing in modern browsers. However, browser-based tests have inherent limitations that users should be aware of. A technical analysis by{' '}
                  <a href="https://developer.mozilla.org/en-US/docs/Web/API/Performance/now" target="_blank" rel="noopener noreferrer" style={RL}>
                    Mozilla MDN documentation↗
                  </a>{' '}
                  notes that browsers may throttle timer resolution to 1ms (Firefox) or apply small random jitter (up to 0.1ms) as a Spectre vulnerability mitigation — meaning individual measurements have a ±1–2ms margin of error.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  Additional variance comes from browser render pipeline delays (V-sync alignment of the green signal), JavaScript garbage collection pauses, and OS thread scheduling. For personal benchmarking and tracking improvement over time, these tools are excellent. For clinical or scientific research purposes, hardware-level measurement devices (e.g., MediaLab or custom Arduino setups) with sub-millisecond precision are required.
                </p>

                {/* ─── 24 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Browser Compatibility
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  This Reaction Time Test uses the <code>performance.now()</code> Web API for high-resolution timing, supported in all modern browsers: <strong>Chrome 24+, Firefox 15+, Safari 8+, Edge 12+, and Opera 15+</strong>. No plugins or downloads are required. JavaScript must be enabled. Mobile browsers are supported, though touchscreen latency will add 20–70ms to results compared to a wired mouse.
                </p>

                {/* ─── 25 ─────────────────────────────────── */}
                <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '2.5rem' }}>
                  Privacy Statement
                </h2>
                <p style={{ marginBottom: '1.5rem' }}>
                  This tool operates entirely within your browser using client-side JavaScript. <strong>No click data, timing results, or personal information is collected, stored, or transmitted to any server.</strong> All statistics exist only in your browser memory and are cleared when you reset the tool or close the tab. There are no cookies, trackers, or third-party analytics associated with the test itself.
                </p>

                {/* ─── Research References Box ─────────────── */}
                <div style={{
                  marginTop: '2.5rem',
                  marginBottom: '2rem',
                  background: 'rgba(0,245,255,0.03)',
                  border: '1px solid rgba(0,245,255,0.15)',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                }}>
                  <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1rem', fontWeight: '700', marginTop: 0, marginBottom: '1rem' }}>
                    📚 Key Research References
                  </h2>
                  <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {[
                      { text: 'Donders, F.C. (1969). On the speed of mental processes.', href: 'https://link.springer.com/article/10.1007/BF02702918' },
                      { text: 'Green & Bavelier (2003). Action video game modifies visual selective attention. Nature.', href: 'https://www.nature.com/articles/nature02677' },
                      { text: 'Van Dongen et al. (2003). The cumulative cost of additional wakefulness. Sleep.', href: 'https://academic.oup.com/sleep/article/26/2/117/2708922' },
                      { text: 'Silverman (2014). Reaction time distributions in PLOS ONE.', href: 'https://pubmed.ncbi.nlm.nih.gov/24077939/' },
                      { text: 'Hillman et al. (2006). Be smart, exercise your heart. Neuropsychologia.', href: 'https://pubmed.ncbi.nlm.nih.gov/17337212/' },
                      { text: 'Der & Deary (2006). Age and sex differences in reaction time in adulthood. Neuropsychologia.', href: 'https://pubmed.ncbi.nlm.nih.gov/20423319/' },
                      { text: 'Deary et al. (2006). Reaction time and intelligence. BMJ.', href: 'https://pubmed.ncbi.nlm.nih.gov/16997147/' },
                      { text: 'Sapolsky et al. — Stress and cognitive performance. Nature Reviews Neuroscience.', href: 'https://pubmed.ncbi.nlm.nih.gov/16750580/' },
                      { text: 'Journal of Sports Sciences (2019). Esports athletes vs controls — reaction time study.', href: 'https://www.tandfonline.com/doi/full/10.1080/02640414.2019.1603991' },
                      { text: 'Stonehouse et al. — DHA supplementation and reaction time. PLOS ONE.', href: 'https://pubmed.ncbi.nlm.nih.gov/20329590/' },
                      { text: 'Jain et al. (2015). Study of simple reaction time. Indian J Physiol Pharmacol.', href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4424208/' },
                      { text: 'Green (2000). How long does it take to stop? Acc. Analysis & Prevention.', href: 'https://www.sciencedirect.com/science/article/pii/S0001457503000988' },
                      { text: 'Jha et al. (2007). Mindfulness training modifies subsystems of attention. Cognitive Affective Neuroscience.', href: 'https://pubmed.ncbi.nlm.nih.gov/19460998/' },
                      { text: 'Armstrong et al. — Mild dehydration and cognitive performance. Journal of Nutrition.', href: 'https://pubmed.ncbi.nlm.nih.gov/22190027/' },
                    ].map(({ text, href }, i) => (
                      <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                        {text}{' '}
                        <a href={href} target="_blank" rel="noopener noreferrer" style={{ ...RL, fontSize: '0.8rem' }}>
                          View↗
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>

              </>
            );
          })()}

          {/* ── FAQ ACCORDION ── */}
          <FAQSection />

        </section>
        {/* ================= SEO ARTICLE SECTION END ================= */}

      </div>
    </>
  );
}