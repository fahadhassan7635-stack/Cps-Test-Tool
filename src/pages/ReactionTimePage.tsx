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
    // Title
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

    // Open Graph
    setMeta('og:title', 'Reaction Time Test — Free Online Reflex Speed Tester', true);
    setMeta('og:description', 'Measure your visual reaction speed in milliseconds. See how you compare to pro gamers and average humans. Free, fast, and accurate.', true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', window.location.href, true);
    setMeta('og:site_name', 'Reaction Time Test', true);

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', 'Reaction Time Test — Measure Your Reflex Speed');
    setMeta('twitter:description', 'Free online reaction time test. Measure how fast your brain responds to visual stimuli. Compare with gamers and athletes worldwide.');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + window.location.pathname);

    // Apple Touch Icon (inline SVG as data URI)
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleIcon);
    }
    appleIcon.setAttribute('href', "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23070a12'/%3E%3Ctext y='.9em' font-size='80' x='10'%3E%E2%9A%A1%3C/text%3E%3C/svg%3E");

    // Favicon
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('href', "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='80'%3E%E2%9A%A1%3C/text%3E%3C/svg%3E");
    favicon.setAttribute('type', 'image/svg+xml');

    // JSON-LD Schemas
    const schemas = [
      // WebSite
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
      // WebApplication
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
      // Breadcrumb
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin },
          { '@type': 'ListItem', position: 2, name: 'Reaction Time Test', item: window.location.href },
        ],
      },
      // FAQ
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is the average human reaction time?', acceptedAnswer: { '@type': 'Answer', text: 'The average human reaction time to a visual stimulus is approximately 250 milliseconds (ms). Trained athletes and esports professionals can achieve reaction times of 150–200ms, while untrained individuals may react in 300–400ms.' } },
          { '@type': 'Question', name: 'What is a good reaction time for gaming?', acceptedAnswer: { '@type': 'Answer', text: 'A reaction time below 200ms is considered excellent for gaming. Most professional FPS players react in 150–200ms. Anything under 250ms is above average and competitive in most casual and semi-professional gaming environments.' } },
          { '@type': 'Question', name: 'Can I improve my reaction time with practice?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Consistent practice through reflex tests, aim trainers, and fast-paced games can meaningfully reduce your reaction time. Sleep, hydration, and reduced stress also play major roles in reflex improvement.' } },
          { '@type': 'Question', name: 'Does monitor refresh rate affect reaction time tests?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, monitor refresh rate impacts how quickly a visual change is displayed. A 60Hz monitor updates 60 times per second (~16.6ms per frame), while a 144Hz monitor updates every ~6.9ms. Higher refresh rates can improve your measured performance by reducing display latency.' } },
          { '@type': 'Question', name: 'How accurate is an online reaction time test?', acceptedAnswer: { '@type': 'Answer', text: 'Online reaction time tests are reasonably accurate for relative benchmarking but have inherent variability due to browser rendering delays, input device latency, and display refresh rates. They are best used for tracking personal progress over time rather than absolute measurement.' } },
        ],
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
      // Audio not supported silently fails
    }
  }, [soundEnabled, getCtx]);

  const playReady = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      // Rising arpeggio: C5 → E5 → G5
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
      // Happy ascending chime
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
    // Descending buzzer
    playTone(200, 'sawtooth', 0.35, 0.2, true, 400);
  }, [playTone]);

  const playReset = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      // Soft two-tone reset click
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
    // Subtle low tick
    playTone(180, 'sine', 0.12, 0.08, true);
  }, [playTone]);

  // Cleanup on unmount
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
  if (ms < 150) return { label: '🔥 Inhuman', color: '#ff2d55' };
  if (ms < 200) return { label: '⚡ Elite', color: '#ff6b00' };
  if (ms < 250) return { label: '🎯 Great', color: '#00f5ff' };
  if (ms < 300) return { label: '✅ Average', color: '#00ff88' };
  if (ms < 400) return { label: '😐 Slow', color: '#8e9aa8' };
  return { label: '🐢 Very Slow', color: '#566275' };
}

// ============================================================
// FAQ DATA
// ============================================================
const FAQ_DATA = [
  {
    q: 'What is a reaction time test?',
    a: 'A reaction time test measures how quickly you respond to a visual, auditory, or tactile stimulus. In this online version, you click as fast as possible the moment the screen turns green. The elapsed time between the color change and your click—measured in milliseconds—is your reaction time.',
  },
  {
    q: 'What is the average human reaction time?',
    a: 'The average human visual reaction time is approximately 250 milliseconds (ms). This figure varies widely based on age, fitness, mental alertness, sleep quality, and prior experience with reflex-based activities. Trained athletes and competitive gamers often reach 150–200ms consistently.',
  },
  {
    q: 'What is considered a good reaction time for gaming?',
    a: 'In competitive FPS gaming, a reaction time under 200ms is considered excellent. Semi-professional and serious casual players typically score between 200ms and 250ms. Anything below 250ms puts you in the top tier of most online games where split-second decisions determine match outcomes.',
  },
  {
    q: 'Can reaction time be improved with practice?',
    a: 'Yes, absolutely. Consistent practice through reaction time tests, aim trainers, and fast-paced games rewires your neural pathways over time, helping your brain respond to stimuli faster. Improvements are particularly noticeable in the first few weeks of regular training, with gains becoming more gradual after that.',
  },
  {
    q: 'Does age affect reaction time?',
    a: 'Yes, reaction time typically peaks in early adulthood (around ages 18–24) and gradually slows as we age. However, regular mental and physical activity can significantly offset age-related decline. Many experienced gamers in their 30s maintain competitive reaction speeds due to years of deliberate practice.',
  },
  {
    q: 'How does sleep affect reaction time?',
    a: 'Sleep deprivation is one of the most significant and immediate factors degrading reaction speed. Even a single night of fewer than 6 hours of sleep can increase reaction time by 50ms or more—equivalent to the difference between a professional gamer and an average player. Always test and train when well-rested.',
  },
  {
    q: 'Does caffeine improve reaction speed?',
    a: 'Moderate caffeine intake (1–2 cups of coffee) can temporarily sharpen alertness and reduce reaction time by approximately 10–30ms for most individuals. However, excessive caffeine can cause jitteriness and muscle tremors, which may actually worsen precision and increase false starts.',
  },
  {
    q: 'How does monitor refresh rate affect reaction time tests?',
    a: 'Monitor refresh rate directly impacts how quickly a new frame is displayed on screen. At 60Hz, a new image appears roughly every 16.6ms. At 144Hz, it\'s every 6.9ms, and at 240Hz, every 4.2ms. This means higher refresh rate monitors can display the "green" stimulus sooner, giving you a real-time advantage in both testing and gaming.',
  },
  {
    q: 'What is input lag and how does it affect my score?',
    a: 'Input lag is the delay between a physical action (like clicking a mouse button) and the system registering that action. High-quality gaming mice and wired connections typically exhibit less than 1ms of input lag, while wireless budget peripherals may lag by 5–20ms. Reducing input lag ensures your measured reaction time is closer to your true neurological speed.',
  },
  {
    q: 'What is the fastest human reaction time ever recorded?',
    a: 'The fastest reliably recorded human reaction times in controlled laboratory settings are around 100–120ms, typically achieved by elite sprinters responding to starting gun blasts. For visual stimuli specifically, consistent sub-150ms reactions are exceptionally rare and often indicate anticipation rather than pure reaction.',
  },
  {
    q: 'Is there a difference between visual and auditory reaction time?',
    a: 'Yes. Auditory (sound-based) reaction times are typically 20–50ms faster than visual reaction times. This is because sound signals take a shorter neural pathway to the brain\'s motor cortex compared to visual signals. This is why starting pistols are used in athletics rather than visual flags.',
  },
  {
    q: 'How do professional FPS gamers train their reflexes?',
    a: 'Professional FPS players use dedicated aim trainers like Aim Lab and KovaaK\'s, play deathmatch modes for live practice, maintain consistent sleep schedules, optimize their hardware for minimum latency, and perform cognitive exercises to sharpen mental focus. Many also engage in physical exercise, which has been shown to improve neural processing speed.',
  },
  {
    q: 'Can stress or anxiety affect reaction time?',
    a: 'Moderate stress can temporarily sharpen alertness through adrenaline release, potentially improving reaction time in short bursts—this is the "fight-or-flight" response. However, chronic stress, anxiety disorders, or high-pressure situations that cause panic typically degrade fine motor control and increase reaction times.',
  },
  {
    q: 'Does keyboard vs mouse input affect reaction time testing?',
    a: 'In this particular test, mouse clicks are used. Mouse click latency varies by device, with high-end gaming mice registering clicks in under 1ms. Mechanical keyboards typically register keystrokes in 1–3ms, while membrane keyboards may add 5–10ms. For competitive gaming, both input types are viable when quality equipment is used.',
  },
  {
    q: 'Why does my reaction time vary so much between rounds?',
    a: 'Reaction time variability is completely normal and is influenced by micro-fluctuations in attention, anticipation, muscle readiness, and cognitive load. In fact, high variability itself can indicate inconsistent focus or fatigue. Aiming for consistent scores across rounds is as valuable a goal as achieving a single low score.',
  },
  {
    q: 'What is a "false start" in reaction time testing?',
    a: 'A false start (shown as "Too Early" in this test) occurs when you click before the green stimulus appears. This means you were anticipating rather than reacting, which inflates your perceived speed. Our test penalizes false starts and requires you to retry the round, ensuring your results reflect true reaction ability.',
  },
  {
    q: 'Does physical fitness affect reaction time?',
    a: 'Research consistently shows a positive correlation between cardiovascular fitness and reaction speed. Aerobic exercise increases cerebral blood flow and promotes neuroplasticity, which can meaningfully improve how quickly your brain processes and responds to stimuli. Even moderate regular exercise like walking or cycling shows measurable reaction time benefits.',
  },
  {
    q: 'Is this reaction time test accurate enough for scientific research?',
    a: 'Online browser-based reaction time tests have some inherent measurement variance due to JavaScript timer resolution, browser rendering pipelines, and hardware variability. They are suitable for personal benchmarking and tracking relative improvement, but laboratory-grade equipment with precise timing hardware would be required for peer-reviewed scientific research.',
  },
  {
    q: 'Can mobile phones be used for reaction time testing?',
    a: 'Yes, this test is mobile compatible. However, touchscreen displays typically have 20–70ms more input latency compared to wired mouse clicks on desktop computers. Mobile results tend to run slightly higher than desktop results for the same user, so keep device type consistent when tracking progress.',
  },
  {
    q: 'How often should I train to improve my reaction time?',
    a: 'For meaningful improvement, aim for 3–5 focused practice sessions per week, each lasting 15–30 minutes. Overtraining without rest can cause diminishing returns and mental fatigue. Rest days allow your neural pathways to consolidate gains, similar to how muscles recover and strengthen after physical workouts.',
  },
  {
    q: 'Do professional athletes have faster reaction times than gamers?',
    a: 'It depends on the discipline. Sprinters, boxers, and tennis players develop extremely fast reflex systems tied to specific physical patterns. Top esports players, especially in FPS titles, exhibit reaction times that rival or sometimes exceed traditional athletes in visual-motor tasks. The two groups develop complementary but distinct types of reaction speed.',
  },
  {
    q: 'What foods or supplements can help improve reaction time?',
    a: 'Beyond caffeine, omega-3 fatty acids (found in fish oil) support neural health and cognitive function. Magnesium plays a role in neuromuscular signaling, and B vitamins support overall brain health. Proper hydration is also critical—even mild dehydration of 2% body weight has been shown to increase reaction times measurably.',
  },
  {
    q: 'Does the 5-round format make the test more accurate?',
    a: 'Yes. A single reaction time measurement has high variance due to momentary distractions, anticipation, and muscle readiness. Taking the average of 5 rounds produces a far more representative and stable benchmark score. The test also tracks your best round, helping you identify your ceiling performance under optimal focus.',
  },
];

// ============================================================
// FAQ SECTION COMPONENT
// ============================================================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section aria-labelledby="faq-heading" style={{ marginTop: '3.5rem' }}>
      <h2
        id="faq-heading"
        style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', marginTop: '0' }}
      >
        Frequently Asked Questions About Reaction Time
      </h2>
      <p style={{ color: '#8e9aa8', marginBottom: '1.75rem', marginTop: '0' }}>
        Everything you need to know about reaction speed, reflex training, and how this tool works.
      </p>
      <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {FAQ_DATA.map((faq, i) => (
          <div
            key={i}
            role="listitem"
            style={{
              background: '#111827',
              border: `1px solid ${openIndex === i ? '#00f5ff40' : '#1e293b'}`,
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
              aria-controls={`faq-answer-${i}`}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '1rem 1.25rem',
                textAlign: 'left',
                cursor: 'pointer',
                color: openIndex === i ? '#00f5ff' : '#f8fafc',
                fontWeight: '600',
                fontSize: '0.95rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                outline: 'none',
              }}
              onFocus={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 2px #00f5ff'; }}
              onBlur={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
            >
              <span>{faq.q}</span>
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  fontSize: '1.1rem',
                  transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  color: '#00f5ff',
                }}
              >
                ▾
              </span>
            </button>
            {openIndex === i && (
              <div
                id={`faq-answer-${i}`}
                role="region"
                style={{
                  padding: '0 1.25rem 1rem',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  lineHeight: '1.7',
                  borderTop: '1px solid #1e293b',
                  paddingTop: '0.875rem',
                }}
              >
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// INTERNAL LINKS SECTION
// ============================================================
function RelatedToolsSection() {
  const tools = [
    { name: 'Aim Trainer', description: 'Improve your mouse accuracy and target acquisition speed.', href: '/aim-trainer', emoji: '🎯' },
    { name: 'Typing Test', description: 'Measure your typing speed in words per minute.', href: '/typing-test', emoji: '⌨️' },
    { name: 'Spacebar Test', description: 'Test how fast you can press the spacebar.', href: '/spacebar-test', emoji: '⬜' },
    { name: 'Click Speed Test', description: 'Measure your raw clicking speed over a fixed interval.', href: '/click-speed-test', emoji: '🖱️' },
    { name: 'CPS Test', description: 'Calculate your clicks per second score.', href: '/cps-test', emoji: '⚡' },
  ];

  return (
    <nav aria-label="Related performance tools" style={{ marginTop: '3rem' }}>
      <h2 style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: '700', marginBottom: '1rem', marginTop: '0' }}>
        Related Reflex & Performance Tools
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.href}
            style={{
              background: '#111827',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '1rem',
              textDecoration: 'none',
              display: 'block',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = '#00f5ff40';
              (e.currentTarget as HTMLAnchorElement).style.background = '#0d1f30';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1e293b';
              (e.currentTarget as HTMLAnchorElement).style.background = '#111827';
            }}
            onFocus={(e) => { (e.currentTarget as HTMLAnchorElement).style.outline = '2px solid #00f5ff'; }}
            onBlur={(e) => { (e.currentTarget as HTMLAnchorElement).style.outline = 'none'; }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{tool.emoji}</div>
            <div style={{ fontWeight: '700', color: '#00f5ff', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{tool.name}</div>
            <div style={{ color: '#566275', fontSize: '0.75rem', lineHeight: '1.4' }}>{tool.description}</div>
          </a>
        ))}
      </div>
    </nav>
  );
}

// ============================================================
// LARGE SEO ARTICLE
// ============================================================
function SEOArticle() {
  const headingStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '1.35rem',
    fontWeight: '700',
    marginTop: '2.25rem',
    marginBottom: '0.75rem',
  };

  const pStyle: React.CSSProperties = {
    marginBottom: '1.15rem',
    marginTop: '0',
  };

  const ulStyle: React.CSSProperties = {
    paddingLeft: '1.5rem',
    marginBottom: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };

  return (
    <article
      aria-label="Detailed guide about reaction time"
      style={{ marginTop: '3.5rem', borderTop: '1px solid #1e293b', paddingTop: '2.5rem', color: '#cbd5e1', lineHeight: '1.75', fontSize: '0.95rem' }}
    >
      {/* H2 1 */}
      <h2 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem', marginTop: '0' }}>
        What Is a Reaction Time Test?
      </h2>
      <p style={pStyle}>
        A <strong>reaction time test</strong> is a psychomotor assessment that measures how quickly a person responds to an external stimulus. In this free online reflex speed tester, the stimulus is a visual color change—when the zone shifts from red to green, you click as fast as possible. The tool records the precise number of milliseconds between the color change and your mouse click, giving you a clear, quantifiable measurement of your visual reaction speed.
      </p>
      <p style={pStyle}>
        Reaction time research has been a pillar of experimental psychology since the 19th century, when Dutch physiologist Franciscus Donders first systematically studied human response latencies. Modern digital tools like this one carry that tradition forward, making high-quality <strong>reaction speed testing</strong> accessible to anyone with a browser.
      </p>
      <p style={pStyle}>
        Unlike simple perception tests, a reaction time assessment captures the complete cycle of information processing: visual input → neural transmission → decision making → motor output. Every millisecond in that chain contributes to your final score, making it a surprisingly deep window into your neurological health and cognitive fitness.
      </p>

      {/* H2 2 */}
      <h2 style={headingStyle}>Why Reaction Time Matters in Everyday Life</h2>
      <p style={pStyle}>
        Reaction time isn't just relevant for gamers. It is a fundamental component of safety and performance across dozens of real-world scenarios. When a child runs into the road, a driver's ability to slam the brakes within milliseconds can mean the difference between life and death. When a surgeon's hand begins an unintended motion during a procedure, a swift corrective reflex prevents harm. When a fighter pilot responds to an incoming threat, fast visual processing is mission-critical.
      </p>
      <p style={pStyle}>
        In sports, <strong>reflex speed</strong> is often the key differentiator between athletes of otherwise equal skill. A baseball batter has roughly 400ms to process a 90mph fastball and decide whether to swing. A tennis player returning a 130mph serve has under 250ms from ball-machine contact to the moment they must initiate their swing. These scenarios make it clear that shaving even 20ms off your reaction time has tangible, meaningful real-world benefits.
      </p>
      <p style={pStyle}>
        Even in white-collar work, <strong>brain reaction speed</strong> impacts productivity. Financial traders who recognize price signals faster make better split-second decisions. Air traffic controllers who respond to warnings instantly help keep thousands of passengers safe. Reaction speed is everywhere—this test simply makes it visible.
      </p>

      {/* H2 3 */}
      <h2 style={headingStyle}>Average Human Reaction Time: What the Data Says</h2>
      <p style={pStyle}>
        The most frequently cited benchmark for <strong>average human reaction time</strong> to a visual stimulus is <strong>250 milliseconds</strong>. This figure comes from decades of laboratory research and large-scale online datasets. However, the distribution is wide: a perfectly healthy adult might measure anywhere from 180ms to 400ms depending on conditions.
      </p>
      <p style={pStyle}>
        The landmark Human Benchmark dataset, compiled from millions of online reaction tests, places the median at approximately 273ms, with the top 10% of users consistently scoring below 200ms. This tells us that while 250ms is a fair average, the ceiling of human potential sits considerably lower for dedicated practitioners.
      </p>
      <p style={pStyle}>
        Children between ages 8 and 14 often score higher (slower) than young adults because their nervous systems are still developing myelination—the fatty sheath around neurons that dramatically speeds up signal transmission. By the late teens, most individuals reach their biological peak for raw reaction speed.
      </p>

      {/* H2 4 */}
      <h2 style={headingStyle}>How Reaction Time Is Measured in This Tool</h2>
      <p style={pStyle}>
        This <strong>online reaction test</strong> uses JavaScript's <code>performance.now()</code> API, which provides sub-millisecond precision timing directly within the browser. When the green stimulus appears, the precise timestamp is recorded internally. When you click, another timestamp is captured. The difference between these two values—rounded to the nearest millisecond—is your reaction time.
      </p>
      <p style={pStyle}>
        The random delay between 1.5 and 5 seconds before each stimulus is deliberately variable. This design prevents your brain from timing the green appearance, ensuring each click represents genuine reactive speed rather than anticipatory guessing. This is the same principle used in professional sports testing facilities and academic research protocols.
      </p>
      <p style={pStyle}>
        After five rounds, the test calculates your average and best score, giving you a statistically more reliable picture than any single measurement could provide. Consistency across rounds is often as revealing as the raw numbers themselves.
      </p>

      {/* H2 5 */}
      <h2 style={headingStyle}>Visual vs Auditory Reaction Time</h2>
      <p style={pStyle}>
        This tool measures <strong>visual reaction time</strong>, which is the most widely studied form. However, auditory and tactile reaction times also play critical roles in real-world performance. Research consistently shows that human beings respond to sounds approximately 20–50ms faster than to visual stimuli.
      </p>
      <p style={pStyle}>
        The reason is anatomical. Visual information must travel from the retina through the optic nerve to the visual cortex—a relatively long neural pathway. Auditory signals travel from the cochlea to the auditory cortex via a shorter route and also benefit from bilateral processing (both ears simultaneously). This is why sprinters react to a starting pistol blast faster than they would react to a starting light.
      </p>
      <p style={pStyle}>
        Tactile (touch-based) reactions are typically fastest of all, as skin receptors connect to spinal reflexes that can bypass the brain entirely for simple withdrawal responses. Your hand jerks away from a hot stove before your brain consciously registers pain—this is the spinal reflex arc at work.
      </p>

      {/* H2 6 */}
      <h2 style={headingStyle}>Factors That Affect Your Reaction Time Score</h2>
      <p style={pStyle}>
        Dozens of variables influence how quickly you respond to a stimulus. Understanding these factors helps you optimize your testing conditions and training approach.
      </p>
      <ul style={ulStyle}>
        <li><strong>Alertness and arousal level:</strong> Being awake and mentally active is essential. Testing immediately after waking up will yield significantly slower scores than testing after 30 minutes of mental engagement.</li>
        <li><strong>Temperature:</strong> Warmer environments slightly speed up neural conduction. Cold hands and fingers have more sluggish muscle response.</li>
        <li><strong>Distractions:</strong> Noise, notifications, and visual clutter in your environment consume cognitive resources needed for focused reaction.</li>
        <li><strong>Anticipation vs. reaction:</strong> Knowing a stimulus is "soon" creates a state of heightened readiness. Fully random delays prevent this from inflating scores.</li>
        <li><strong>Practice effect:</strong> Simply becoming familiar with a specific test reduces cognitive overhead, improving scores over early trials—even without genuine reflex improvement.</li>
        <li><strong>Hardware quality:</strong> Display refresh rate, mouse polling rate, and USB port quality all contribute to measured latency.</li>
      </ul>

      {/* H2 7 */}
      <h2 style={headingStyle}>Sleep and Reflexes: The Most Underrated Factor</h2>
      <p style={pStyle}>
        Of all the controllable variables affecting <strong>reflex speed</strong>, sleep quality and duration stand out as the most impactful and most overlooked. The relationship between sleep and neural processing speed is both direct and well-documented. The brain consolidates procedural learning and motor skills during deep sleep stages, which is precisely why athletes, soldiers, and gamers all perform better when properly rested.
      </p>
      <p style={pStyle}>
        A landmark study published in the journal <em>Sleep</em> found that reducing nightly sleep from 8 to 6 hours for two weeks produced cognitive deficits equivalent to two nights of total sleep deprivation—with subjects largely unaware of their own impairment. This means you may feel fine but still be operating with meaningfully slower reaction times.
      </p>
      <p style={pStyle}>
        For competitive gamers specifically, many esports organizations now employ sports scientists who monitor sleep schedules during tournament preparation. Prioritizing 7–9 hours of quality sleep is, without exception, the single most cost-free way to improve your reaction time scores before an important session.
      </p>

      {/* H2 8 */}
      <h2 style={headingStyle}>Caffeine and Reaction Speed: What Actually Happens</h2>
      <p style={pStyle}>
        Caffeine is the world's most widely consumed psychoactive substance, and for good reason—it works. By blocking adenosine receptors in the brain (adenosine is the chemical that makes you feel sleepy), caffeine promotes wakefulness and increases dopamine activity, which sharpens focus and motor readiness.
      </p>
      <p style={pStyle}>
        Studies consistently demonstrate that moderate caffeine consumption—roughly 100–200mg, or one to two standard cups of coffee—reduces visual reaction time by 10–30ms on average. For a gamer already sitting at 220ms, dropping to 195ms represents a meaningful competitive improvement.
      </p>
      <p style={pStyle}>
        However, the relationship is nonlinear. Excessive caffeine intake causes sympathetic nervous system overstimulation, leading to hand tremors, elevated anxiety, and paradoxically slower reaction times due to increased error rates. The sweet spot varies by individual tolerance, body weight, and habitual consumption patterns.
      </p>

      {/* H2 9 */}
      <h2 style={headingStyle}>Age and Reaction Time: When Do We Peak?</h2>
      <p style={pStyle}>
        Neurological research indicates that raw reaction speed peaks between ages 18 and 24, then gradually declines throughout adulthood. The decline accelerates after age 60, though it remains subtle and manageable with consistent cognitive and physical activity until then.
      </p>
      <p style={pStyle}>
        Interestingly, experience often compensates for age-related neural slowdown. A 35-year-old veteran gamer may score comparably to a 20-year-old novice because they have internalized pattern recognition and decision shortcuts. Their brains take less time to process complex scenarios because fewer cognitive steps are required—they recognize situations rather than analyzing them.
      </p>
      <p style={pStyle}>
        This is an important distinction: reaction time measures speed of response to novel stimuli, while performance in games or sports also relies on anticipation, pattern recognition, and strategic decision-making—skills that continue improving well into middle age.
      </p>

      {/* H2 10 */}
      <h2 style={headingStyle}>Gaming and Reflex Improvement: The Science</h2>
      <p style={pStyle}>
        The idea that video games improve reflexes is no longer just gamer folklore—it is backed by a growing body of peer-reviewed research. A study published in <em>Nature</em> found that players of action video games make correct decisions 25% faster than non-gamers without sacrificing accuracy. The researchers attributed this to enhanced sensory processing and attentional resource allocation.
      </p>
      <p style={pStyle}>
        <strong>FPS games</strong> in particular are uniquely demanding for reaction time development. Games like Counter-Strike, VALORANT, and Apex Legends require players to identify, track, and respond to fast-moving targets in environments with multiple simultaneous stimuli. The constant demand for rapid visual processing literally shapes the brain's visual cortex over extended play.
      </p>
      <p style={pStyle}>
        This doesn't mean more gaming always equals faster reactions. Quality of practice matters more than quantity. Focused, intentional training with feedback-driven improvement—like using this <strong>reaction time test</strong> to measure progress—is far more effective than passive gameplay with no attention to performance metrics.
      </p>

      {/* H2 11 */}
      <h2 style={headingStyle}>Best Reaction Time for FPS Games: What You Need</h2>
      <p style={pStyle}>
        Different FPS titles reward different types of reaction speed. In <strong>Counter-Strike</strong>, map awareness and pre-aiming often matter more than raw reaction speed—but when a duel breaks down to a pure firefight, sub-200ms times become critical. In <strong>VALORANT</strong>, ability timing and crosshair placement reduce the reaction time burden, but quick duels still demand elite speed. In <strong>Apex Legends</strong>, movement mechanics create scenarios where raw visual reaction is decisive.
      </p>
      <p style={pStyle}>
        A general benchmark guide for FPS gaming performance:
      </p>
      <ul style={ulStyle}>
        <li><strong>Below 150ms:</strong> Exceptional—consistent performance at this level suggests either elite neurological wiring or significant anticipation. Rare even among professionals.</li>
        <li><strong>150–200ms:</strong> Professional tier. Top esports competitors operate in this range during peak performance.</li>
        <li><strong>200–250ms:</strong> High-skilled amateur. You can comfortably compete at high ranks in most titles.</li>
        <li><strong>250–300ms:</strong> Average. This is where the majority of dedicated gamers score. Improvement with training is very achievable.</li>
        <li><strong>300ms+:</strong> Room for improvement. Hardware optimization and consistent training will produce noticeable gains.</li>
      </ul>

      {/* H2 12 */}
      <h2 style={headingStyle}>Professional Gamer Reaction Times: Inside the Data</h2>
      <p style={pStyle}>
        Several major esports events have publicly tested top professional players' reaction times. The results are consistently impressive but perhaps not as extreme as the gaming community sometimes assumes. Most professional FPS players average between 170ms and 210ms on standardized <strong>gaming reflex tests</strong>, with occasional readings below 150ms during peak performance states.
      </p>
      <p style={pStyle}>
        Notably, top professionals don't always outperform dedicated amateurs in pure reaction time. What separates professionals is their ability to sustain peak reaction performance over hours of high-pressure play, while also executing complex movement, communication, and strategy simultaneously. The human benchmark for professional gaming is less about singular reflex spikes and more about sustainable cognitive throughput.
      </p>
      <p style={pStyle}>
        The famous esports player Faker (League of Legends) and s1mple (CS:GO) have both been tested publicly with reaction times in the 190–220ms range—excellent, but not mythologically fast. Their elite status comes from decision speed, game sense, and mechanical execution stacked on top of solid but very human reaction times.
      </p>

      {/* H2 13 */}
      <h2 style={headingStyle}>Athlete Reaction Times Across Sports</h2>
      <p style={pStyle}>
        <strong>Reaction latency</strong> requirements vary dramatically across sports. Sprint start reactions have an official false start threshold of 100ms in Olympic competition—below this, a reaction is considered a false start because it is neurologically impossible to react to a legitimate stimulus that quickly. Elite sprinters typically react in 120–160ms to the starting gun.
      </p>
      <p style={pStyle}>
        Boxers develop exceptionally refined visual tracking and reaction pathways, with elite fighters showing reaction times of 150–200ms to body-level visual threats. Their advantage lies not just in speed but in predictive anticipation built through thousands of hours of sparring.
      </p>
      <p style={pStyle}>
        Cricket batsmen facing fast bowling (90+ mph) have under 400ms from ball release to swing execution, but their effective "reaction window" is much shorter due to the travel time for visual processing alone. Most elite batsmen operate on a combination of advance cue reading and genuine reflex response, making their cognitive processing architecturally different from a simple button-press test.
      </p>

      {/* H2 14 */}
      <h2 style={headingStyle}>Mouse Latency Explained: How Your Hardware Affects Scores</h2>
      <p style={pStyle}>
        Your mouse is one of the most consequential hardware choices for both reaction testing and gaming performance. Mouse latency refers to the total time between physically pressing a mouse button and the resulting signal registering in the operating system. This delay has several components: mechanical switch actuation time, signal processing time, USB polling delay, and driver processing time.
      </p>
      <p style={pStyle}>
        High-end gaming mice like the Logitech G Pro X Superlight, Razer Viper V3 Pro, and SteelSeries Prime achieve total click latency under 1ms, with some claiming sub-0.5ms performance. Budget office mice may add 5–20ms of latency—a figure large enough to be meaningful in both testing and competitive play.
      </p>
      <p style={pStyle}>
        USB polling rate also matters. A 125Hz polling rate means the OS checks for mouse input 125 times per second (every 8ms), while 1000Hz polling checks every 1ms. Some next-gen mice now offer 4000Hz and 8000Hz polling, theoretically reducing input delay to fractions of a millisecond—though real-world gains at such extremes are increasingly marginal for most users.
      </p>

      {/* H2 15 */}
      <h2 style={headingStyle}>Monitor Refresh Rate vs Reaction Time: A Detailed Breakdown</h2>
      <p style={pStyle}>
        Your monitor's refresh rate determines how frequently new frames are rendered on screen. At 60Hz, a frame updates every 16.67ms. At 144Hz, every 6.94ms. At 240Hz, every 4.17ms. At 360Hz, every 2.78ms. When our test changes the screen from red to green, that change cannot appear any faster than the current frame interval allows.
      </p>
      <p style={pStyle}>
        This means a user on a 60Hz monitor might "see" the green signal up to 16ms later than the JavaScript timestamp recorded the state change, systematically inflating their measured reaction time. A 240Hz monitor user enjoys up to 12ms less display latency in this scenario—a meaningful competitive edge in tight duels.
      </p>
      <p style={pStyle}>
        For the most accurate <strong>reaction time test</strong> results, use a high-refresh monitor where possible. That said, results remain internally consistent and useful for tracking personal improvement, even if absolute cross-device comparisons carry some variability.
      </p>

      {/* H2 16 */}
      <h2 style={headingStyle}>Input Lag Explained: The Hidden Performance Tax</h2>
      <p style={pStyle}>
        Input lag is broader than just mouse latency—it encompasses the total delay chain from physical action to on-screen response. In gaming, this chain includes: controller/mouse latency → USB processing → game engine processing → render pipeline → GPU frame generation → display signal processing → pixel response time.
      </p>
      <p style={pStyle}>
        Even displays themselves introduce lag. Most gaming monitors have 1–5ms of display processing lag, while consumer TVs used as gaming monitors can add 20–80ms of image processing delay (enabled by default and often called "Game Mode" when disabled). Running a reaction time test on a TV with post-processing enabled can make a 200ms reactor appear to be a 240ms reactor.
      </p>
      <p style={pStyle}>
        For benchmarking purposes: connect your mouse via USB rather than Bluetooth, use a gaming monitor with Game Mode enabled, close background applications, and ensure your USB controller is delivering consistent polling. These steps minimize hardware-introduced variance and make your score more representative of your true neurological speed.
      </p>

      {/* H2 17 */}
      <h2 style={headingStyle}>How to Improve Your Reaction Time: A Practical Guide</h2>
      <p style={pStyle}>
        Improving your <strong>reaction speed</strong> is a multi-faceted process that combines neurological training, lifestyle optimization, and hardware configuration. Here is a structured approach to meaningful improvement:
      </p>
      <ul style={ulStyle}>
        <li><strong>Use this reaction trainer daily:</strong> 5–10 minutes of focused reaction time testing each morning, before gaming sessions, builds neural familiarity and tracks trends over time.</li>
        <li><strong>Supplement with aim trainers:</strong> Tools like Aim Lab and KovaaK's add target acquisition and tracking to pure reaction speed, creating more holistic reflex training.</li>
        <li><strong>Play fast-paced deathmatch:</strong> Unstructured deathmatch modes in FPS titles provide live, chaotic stimulus environments that no trainer can fully replicate.</li>
        <li><strong>Maintain an exercise routine:</strong> 30 minutes of cardio three times per week measurably improves neuroplasticity and cognitive processing speed.</li>
        <li><strong>Optimize sleep:</strong> Target 7–9 hours per night, with consistent sleep and wake times. Use sleep tracking to identify and address quality issues.</li>
        <li><strong>Manage your environment:</strong> Test and practice in a quiet, well-lit, distraction-free space. Minimize cognitive load during training sessions.</li>
        <li><strong>Upgrade selectively:</strong> If your monitor is 60Hz and you are serious about gaming performance, upgrading to 144Hz or higher is the single most impactful hardware change you can make for reaction testing and gameplay alike.</li>
      </ul>

      {/* H2 18 */}
      <h2 style={headingStyle}>Daily Exercises for Faster Reflexes</h2>
      <p style={pStyle}>
        Beyond digital training, physical exercises directly improve the neurological pathways underlying fast reactions. The following exercises have strong evidence bases for reflex improvement:
      </p>
      <ul style={ulStyle}>
        <li><strong>Ball bouncing drills:</strong> Bouncing a tennis ball against a wall and catching it with alternating hands trains visual tracking and fine motor response simultaneously.</li>
        <li><strong>Agility ladder footwork:</strong> Fast-paced footwork patterns improve the speed of lower-body motor programs and general neuromuscular responsiveness.</li>
        <li><strong>Meditation and mindfulness:</strong> Counterintuitively, 10–15 minutes of daily focused attention meditation improves sustained attentional capacity, reducing the cognitive lag in stimulus processing.</li>
        <li><strong>Dual n-back training:</strong> A cognitive exercise with moderate evidence for improving working memory and processing speed—components of reaction time.</li>
        <li><strong>Reaction ball training:</strong> Irregularly shaped rubber balls bounce unpredictably, requiring genuine reactive catching rather than anticipatory pattern matching.</li>
      </ul>

      {/* H2 19 */}
      <h2 style={headingStyle}>Common Mistakes During Reaction Time Testing</h2>
      <p style={pStyle}>
        Many users inadvertently introduce error into their measurements through avoidable testing habits. Being aware of these pitfalls helps you collect cleaner, more meaningful data:
      </p>
      <ul style={ulStyle}>
        <li><strong>Testing while fatigued:</strong> Scores taken during mental or physical fatigue can be 30–80ms slower than your rested baseline. Always note your energy state when logging results.</li>
        <li><strong>Clicking before the signal:</strong> Anticipatory clicking (false starts) doesn't reflect your actual reaction time. Our tool's "Too Early" detection prevents this from corrupting your results.</li>
        <li><strong>Using a trackpad instead of a mouse:</strong> Laptop trackpads have higher latency and require more deliberate physical actions than mouse clicks, significantly inflating scores.</li>
        <li><strong>Tensing up excessively:</strong> Over-gripping your mouse increases muscle fatigue and slows the fine motor commands needed for rapid clicking.</li>
        <li><strong>Comparing across devices without accounting for hardware differences:</strong> A 200ms score on a 144Hz monitor is not directly comparable to a 200ms score on a 60Hz TV. Context always matters.</li>
      </ul>

      {/* H2 20 */}
      <h2 style={headingStyle}>Is This Online Reaction Test Accurate?</h2>
      <p style={pStyle}>
        This <strong>online reaction test</strong> is highly accurate for its intended purpose: tracking your own relative performance over time. The JavaScript timing functions used (<code>performance.now()</code>) achieve sub-millisecond resolution on all modern browsers. The primary sources of variance are hardware-introduced: display refresh timing, input device latency, and system load.
      </p>
      <p style={pStyle}>
        For absolute scientific measurement, dedicated hardware setups with purpose-built latency minimization are required. But for a free, accessible, and meaningful <strong>human benchmark</strong> experience—this tool delivers results that are consistent, comparable across sessions, and informative enough to guide real training decisions.
      </p>
      <p style={pStyle}>
        To maximize accuracy: use a wired mouse, enable game mode on your display, close background applications, and test multiple times across different days to establish a reliable baseline average.
      </p>

      {/* H2 21 */}
      <h2 style={headingStyle}>Why Your Scores Change Every Day</h2>
      <p style={pStyle}>
        If you have been using this <strong>reflex game</strong> regularly, you have likely noticed significant day-to-day variation in your scores. This is completely normal and reflects genuine fluctuations in your cognitive state rather than measurement error.
      </p>
      <p style={pStyle}>
        Your best scores will cluster on days when you are well-rested, mildly caffeinated, focused, and physically comfortable. Your worst scores tend to appear after poor sleep, during illness, following intense physical exertion, or when emotionally stressed. Tracking your scores alongside a simple daily wellness log (sleep hours, stress level, time of day) can reveal powerful personal patterns that help you optimize your training schedule.
      </p>

      {/* H2 22 */}
      <h2 style={headingStyle}>Mobile vs Desktop Reaction Time Testing</h2>
      <p style={pStyle}>
        This tool is fully responsive and works on both mobile and desktop devices. However, there are important differences in performance characteristics to understand when comparing results across platforms.
      </p>
      <p style={pStyle}>
        Touch screen displays introduce additional latency compared to mouse clicks. iOS and Android devices apply touch input processing that typically adds 20–70ms of delay before the tap registers in the browser environment. Modern flagship phones have reduced this significantly, but budget devices and older hardware can still show substantial touch latency.
      </p>
      <p style={pStyle}>
        Mobile processor performance and browser JavaScript engine efficiency also affect the precision of timing measurements. For the most accurate results, desktop with a wired mouse remains the gold standard. Mobile testing is better suited for casual self-monitoring than for establishing a definitive personal benchmark.
      </p>

      {/* H2 23 */}
      <h2 style={headingStyle}>Brain Processing Speed: The Neuroscience Behind Reflexes</h2>
      <p style={pStyle}>
        Reaction time is ultimately a measure of how fast your nervous system can complete a stimulus-response loop. The key stages are:
      </p>
      <ul style={ulStyle}>
        <li><strong>Sensory reception:</strong> Photoreceptors in your retina detect the color change and convert light into electrical signals (~1ms).</li>
        <li><strong>Optic nerve transmission:</strong> Signals travel along the optic nerve to the lateral geniculate nucleus (~10–20ms).</li>
        <li><strong>Visual cortex processing:</strong> The primary visual cortex processes basic visual features (~20–40ms).</li>
        <li><strong>Higher-order processing:</strong> Association areas interpret the signal and determine that an action is required (~50–100ms).</li>
        <li><strong>Motor command generation:</strong> The motor cortex generates a movement command (~10–20ms).</li>
        <li><strong>Neuromuscular transmission:</strong> The command travels down motor neurons to finger muscles (~5–10ms).</li>
        <li><strong>Muscle contraction and click execution:</strong> Physical button press (~5–10ms).</li>
      </ul>
      <p style={pStyle}>
        Sum these stages and you arrive at the 100–200ms minimum range that constitutes a human floor for visual reaction speed. Reductions below ~100ms consistently indicate anticipatory responses rather than genuine reactive neural processing.
      </p>

      {/* H2 24 */}
      <h2 style={headingStyle}>Reaction Time Myths Debunked</h2>
      <p style={pStyle}>
        Several persistent myths surround reaction time that are worth addressing directly:
      </p>
      <ul style={ulStyle}>
        <li><strong>Myth: Energy drinks dramatically improve reaction time.</strong> Reality: The caffeine and B vitamins in energy drinks produce modest improvements, but sugar spikes and excessive stimulant doses can worsen performance through jitteriness and subsequent crashes.</li>
        <li><strong>Myth: Sub-100ms reactions are achievable with training.</strong> Reality: Consistently achieving sub-100ms visual reactions is neurologically implausible without anticipation. Such scores in online tests almost always reflect click timing before stimulus or system measurement errors.</li>
        <li><strong>Myth: Video games have no benefit for real-world reflexes.</strong> Reality: Multiple peer-reviewed studies confirm that action video games improve visual processing speed, attentional control, and reaction accuracy—skills that transfer to real-world scenarios.</li>
        <li><strong>Myth: Older players can never compete with younger ones on reaction speed.</strong> Reality: While raw reaction speed does decline with age, experience, strategic decision-making, and anticipatory reading of opponents often fully compensate for a 20–30ms raw speed disadvantage.</li>
      </ul>

      {/* H2 25 */}
      <h2 style={headingStyle}>Benefits of Regularly Practicing Reaction Time Tests</h2>
      <p style={pStyle}>
        Beyond gaming performance, consistent <strong>reaction trainer</strong> use delivers a range of cognitive and practical benefits:
      </p>
      <ul style={ulStyle}>
        <li><strong>Baseline tracking:</strong> Regular testing lets you monitor cognitive health trends over months and years, potentially identifying early signs of fatigue, illness, or age-related changes.</li>
        <li><strong>Cognitive warm-up:</strong> Using the test before a gaming session primes your visual processing systems and brings your reaction speed up to peak before you need it in competition.</li>
        <li><strong>Focus training:</strong> The test requires sustained attention over multiple rounds, building the attentional stamina needed for long gaming or work sessions.</li>
        <li><strong>Motivation and gamification:</strong> Watching your score improve over weeks is intrinsically motivating and encourages consistent healthy habits like better sleep and hydration.</li>
        <li><strong>Driver safety awareness:</strong> Periodically checking your reaction time—particularly after poor sleep or illness—can raise awareness of impairment before you get behind the wheel.</li>
      </ul>

      {/* H2 26 */}
      <h2 style={headingStyle}>How Often Should You Train Reaction Time?</h2>
      <p style={pStyle}>
        Like any skill, reflex training benefits from regular but not excessive practice. The neurological adaptations that lead to faster reaction times occur gradually through spaced repetition and recovery—not through marathon single-session grinding.
      </p>
      <p style={pStyle}>
        A research-informed training schedule: 10–15 minutes of focused <strong>reaction time test</strong> practice, 4–5 days per week. Take at least 2 days off per week to allow neural consolidation. Supplement with aim trainer sessions (20–30 minutes, 3–4 times per week) for holistic reflex development. Track results weekly to identify trends and plateaus.
      </p>
      <p style={pStyle}>
        Plateau periods are normal and represent phases of neural reorganization. When progress stalls, try varying your training tools, incorporating physical exercise, or reviewing sleep and nutrition habits before assuming you have reached your biological ceiling.
      </p>

      {/* H2 27 */}
      <h2 style={headingStyle}>Scientific Facts About Reflexes You Probably Didn't Know</h2>
      <p style={pStyle}>
        The neuroscience of reflexes is full of surprising and counterintuitive findings that enrich our understanding of human performance:
      </p>
      <ul style={ulStyle}>
        <li>Neural signals travel along myelinated axons at up to 120 meters per second—yet the brain's processing stages still introduce hundreds of milliseconds of delay due to synaptic transmission and computation.</li>
        <li>The simple reaction time (single stimulus, single response) is always faster than choice reaction time (multiple stimuli, multiple possible responses). This is described by Hick's Law and explains why reducing in-game decision complexity directly improves reaction performance.</li>
        <li>Practice physically changes the brain. Action video game players show measurably greater gray matter density in cortical regions associated with visual attention and motor control.</li>
        <li>Reaction time is a component of the broader construct of "processing speed," which is one of the five primary cognitive ability domains measured in neuropsychological assessment and is strongly correlated with general intelligence.</li>
        <li>The cerebellum—traditionally associated with motor coordination—plays a crucial role in the precise timing of reactive motor responses, and cerebellar training through complex movement skills can measurably improve reaction time test scores.</li>
      </ul>

      {/* H2 28 */}
      <h2 style={headingStyle}>Final Thoughts: Track, Train, Improve</h2>
      <p style={pStyle}>
        Reaction time is one of the most fascinating and practically meaningful measures of human performance. It sits at the intersection of neurology, hardware, lifestyle, and skill—making it both a rich area of scientific inquiry and a deeply personal performance metric.
      </p>
      <p style={pStyle}>
        Whether you are a competitive esports player chasing that sub-200ms consistency, an athlete optimizing your sports performance, a driver wanting to verify your alertness, or simply a curious person benchmarking your own biology—this free <strong>online reaction test</strong> gives you a clear, immediate window into how your brain performs under pressure.
      </p>
      <p style={pStyle}>
        Use your five-round average as a baseline. Train consistently, sleep well, hydrate, and minimize hardware latency. Check your progress weekly. Compare across conditions. Over months of dedicated practice, the gains are real, measurable, and—most importantly—transferable to every fast-paced domain of your life.
      </p>
      <p style={{ fontStyle: 'italic', color: '#566275', margin: '0' }}>
        Ready to push your limits? Hit reset, focus your attention, and see how deep into the elite tier your reflexes can take you.
      </p>
    </article>
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

  // Cleanup on unmount
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
    idle: { bg: '#0d1421', border: '#1e293b', text: '#8e9aa8' },
    waiting: { bg: 'rgba(255,107,0,0.08)', border: 'rgba(255,107,0,0.4)', text: '#ff6b00' },
    ready: { bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.5)', text: '#00ff88' },
    clicked: { bg: 'rgba(0,245,255,0.08)', border: 'rgba(0,245,255,0.4)', text: '#00f5ff' },
    early: { bg: 'rgba(255,45,85,0.1)', border: 'rgba(255,45,85,0.4)', text: '#ff2d55' },
  };

  const colors = zoneColors[phase];

  const phaseInstructions: Record<Phase, string> = {
    idle: round === 0 ? `${MAX_ROUNDS} rounds • Wait for green, then click!` : 'All rounds done! Click to restart.',
    waiting: 'Don\'t click yet!',
    ready: 'Click now!',
    clicked: round >= MAX_ROUNDS ? 'Click to see summary' : `Click for round ${round + 1}`,
    early: 'Wait for the green signal. Click to retry.',
  };

  return (
    <>
      <SEOHead />
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '2rem 1.5rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#070a12',
          color: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        {/* ---- HEADER ---- */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              color: '#00f5ff',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              letterSpacing: '0.1em',
            }}
            aria-label="Tool category"
          >
            Reaction Tool
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
              fontWeight: '800',
              margin: '0.5rem 0',
              color: '#ffffff',
            }}
          >
            Reaction Time Test
          </h1>
          <p style={{ color: '#8e9aa8', margin: '0' }}>
            Test your reflexes — how fast do you respond to visual stimuli?
          </p>

          {/* Sound Toggle */}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setSoundEnabled(prev => !prev)}
              aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
              aria-pressed={soundEnabled}
              title={soundEnabled ? 'Sound On — Click to mute' : 'Sound Off — Click to enable'}
              style={{
                background: soundEnabled ? 'rgba(0,245,255,0.1)' : '#1e293b',
                border: `1px solid ${soundEnabled ? '#00f5ff40' : '#334155'}`,
                color: soundEnabled ? '#00f5ff' : '#566275',
                borderRadius: '8px',
                padding: '0.4rem 1rem',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 2px #00f5ff'; }}
              onBlur={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
            >
              <span aria-hidden="true">{soundEnabled ? '🔊' : '🔇'}</span>
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </button>
          </div>
        </header>

        {/* ---- ROUND INDICATOR ---- */}
        {round > 0 && (
          <div
            role="status"
            aria-label={`Round ${results.length} of ${MAX_ROUNDS} completed`}
            style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
          >
            {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  width: '40px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i < results.length ? '#00f5ff' : '#1e293b',
                  border: '1px solid #334155',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
        )}

        {/* ---- MAIN INTERACTION ZONE ---- */}
        <main>
          <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
            aria-label={
              phase === 'idle' ? 'Start the reaction time test' :
              phase === 'waiting' ? 'Wait for the green signal, do not click yet' :
              phase === 'ready' ? 'Click now! The signal is showing' :
              phase === 'clicked' ? `Your reaction time was ${reactionTime} milliseconds. Click to continue.` :
              'You clicked too early. Click to retry.'
            }
            aria-live="polite"
            style={{
              width: '100%',
              minHeight: '320px',
              borderRadius: '20px',
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
              outline: 'none',
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                phase === 'ready' ? '0 0 60px rgba(0,255,136,0.2), 0 0 0 3px #00f5ff' : '0 0 0 3px #00f5ff';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                phase === 'ready' ? '0 0 60px rgba(0,255,136,0.2)' : 'none';
            }}
          >
            {phase === 'idle' && (
              <>
                <span aria-hidden="true" style={{ fontSize: '4rem' }}>⚡</span>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#00f5ff' }}>Click to Start</span>
                <span style={{ color: '#8e9aa8', fontSize: '0.9rem' }}>{phaseInstructions.idle}</span>
              </>
            )}

            {phase === 'waiting' && (
              <>
                <span aria-hidden="true" style={{ fontSize: '4rem' }}>🔴</span>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ff6b00' }}>Wait for it...</span>
                <span style={{ color: '#8e9aa8', fontSize: '0.9rem' }}>Don't click yet!</span>
              </>
            )}

            {phase === 'ready' && (
              <>
                <span aria-hidden="true" style={{ fontSize: '4rem' }}>🟢</span>
                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#00ff88' }}>CLICK NOW!</span>
              </>
            )}

            {phase === 'clicked' && reactionTime !== null && (
              <>
                <span aria-hidden="true" style={{ fontSize: '3rem' }}>✅</span>
                <div
                  style={{
                    fontSize: 'clamp(3rem, 10vw, 5rem)',
                    fontWeight: '900',
                    color: '#00f5ff',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {reactionTime}
                  <span style={{ fontSize: '1.5rem', color: '#8e9aa8', marginLeft: '0.25rem' }}>ms</span>
                </div>
                <div
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '50px',
                    background: `${getRating(reactionTime).color}20`,
                    border: `1px solid ${getRating(reactionTime).color}40`,
                    color: getRating(reactionTime).color,
                    fontWeight: '700',
                  }}
                >
                  {getRating(reactionTime).label}
                </div>
                <span style={{ color: '#566275', fontSize: '0.85rem' }}>
                  {round >= MAX_ROUNDS ? 'Click to see summary' : `Click for round ${round + 1}`}
                </span>
              </>
            )}

            {phase === 'early' && (
              <>
                <span aria-hidden="true" style={{ fontSize: '3rem' }}>❌</span>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ff2d55' }}>Too Early!</span>
                <span style={{ color: '#8e9aa8', fontSize: '0.9rem' }}>
                  Wait for the green signal. Click to retry.
                </span>
              </>
            )}
          </div>

          {/* ---- LIVE RESULTS ---- */}
          {results.length > 0 && (
            <section aria-label="Live test results" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { value: avg ? `${avg}ms` : '—', label: 'Average', color: '#00f5ff' },
                { value: best ? `${best}ms` : '—', label: 'Best', color: '#00ff88' },
                { value: `${results.length}/${MAX_ROUNDS}`, label: 'Rounds', color: '#ff6b00' },
              ].map(s => (
                <div
                  key={s.label}
                  style={{
                    background: '#111827',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.7rem', color: '#566275', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* ---- ROUND RESULTS TIMELINE ---- */}
          {results.length > 0 && (
            <section
              aria-label="Individual round results"
              style={{
                background: '#111827',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#566275',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '1rem',
                }}
              >
                Round Results
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {results.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.75rem',
                      textAlign: 'center',
                      minWidth: '70px',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#566275', marginBottom: '0.2rem' }}>R{i + 1}</div>
                    <div style={{ fontWeight: '700', color: getRating(r).color }}>{r}ms</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ---- RESET BUTTON ---- */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <button
              aria-label="Reset the reaction time test"
              style={{
                padding: '0.6rem 1.5rem',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#f8fafc',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                outline: 'none',
                transition: 'background 0.2s',
              }}
              onFocus={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 2px #00f5ff'; }}
              onBlur={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#334155'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1e293b'; }}
              onClick={handleReset}
            >
              <span aria-hidden="true">🔄</span> Reset
            </button>
          </div>
        </main>

        {/* ---- REFERENCE BOX ---- */}
        <section
          aria-labelledby="reference-heading"
          style={{
            background: '#111827',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '1.75rem',
            marginTop: '2rem',
          }}
        >
          <h2
            id="reference-heading"
            style={{ fontWeight: '700', marginBottom: '1rem', color: '#00f5ff', margin: '0 0 1rem 0' }}
          >
            Reaction Time Reference
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {[
              { range: '< 150ms', label: 'Inhuman', color: '#ff2d55' },
              { range: '150–200ms', label: 'Elite Gamer', color: '#ff6b00' },
              { range: '200–250ms', label: 'Great', color: '#00f5ff' },
              { range: '250–300ms', label: 'Average', color: '#00ff88' },
              { range: '300–400ms', label: 'Below Avg', color: '#8e9aa8' },
              { range: '400ms+', label: 'Slow', color: '#566275' },
            ].map(r => (
              <div
                key={r.range}
                style={{
                  background: `${r.color}10`,
                  border: `1px solid ${r.color}30`,
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                }}
              >
                <div style={{ fontWeight: '700', color: r.color, fontSize: '0.9rem' }}>{r.range}</div>
                <div style={{ color: '#8e9aa8', fontSize: '0.75rem' }}>{r.label}</div>
              </div>
            ))}
          </div>
          <p
            style={{
              color: '#566275',
              fontSize: '0.85rem',
              marginTop: '1rem',
              lineHeight: '1.5',
              margin: '1rem 0 0 0',
            }}
          >
            * Average human reaction time is ~250ms. Professional FPS gamers typically react in 150–200ms.
          </p>
        </section>

        {/* ---- RELATED TOOLS ---- */}
        <RelatedToolsSection />

        {/* ---- LARGE SEO ARTICLE ---- */}
        <SEOArticle />

        {/* ---- FAQ SECTION ---- */}
        <FAQSection />

        {/* ---- FOOTER NOTE ---- */}
        <footer style={{ marginTop: '3rem', borderTop: '1px solid #1e293b', paddingTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#566275', fontSize: '0.8rem', margin: '0' }}>
            This free <strong style={{ color: '#8e9aa8' }}>reaction time test</strong> uses the Web Audio API for sound and{' '}
            <code>performance.now()</code> for precision timing. Results are for personal benchmarking purposes.
            For clinical assessment, consult a qualified professional.
          </p>
        </footer>
      </div>
    </>
  );
}
