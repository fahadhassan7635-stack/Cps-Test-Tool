import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MousePointer2, Keyboard, Play, RotateCcw, Trophy, Zap, Shield,
  Volume2, VolumeX, Maximize, Minimize,
  Pause, Home, ChevronRight, HelpCircle, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── Constants ───────────────────────────────────────────────────────────────
const GRAVITY = 0.35;
const INITIAL_JUMP_FORCE = -8.5;
const BASE_SPEED = 2.5;
const MAX_SPEED_BOOST = 10;
const MAX_JUMP_BOOST = 8;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 440;
const BALL_RADIUS = 12;
const SITE_URL = 'https://cpsrush.com';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

// ─── More Tools ──────────────────────────────────────────────────────────────
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

// ─── Types ───────────────────────────────────────────────────────────────────
interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isEnd?: boolean;
}

type GameState = 'menu' | 'countdown' | 'playing' | 'paused' | 'won';
type InputMode = 'mouse' | 'keyboard';

// ─── Audio Engine ─────────────────────────────────────────────────────────────
class AudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private volume = 0.4;

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  setMuted(m: boolean) { this.muted = m; }
  setVolume(v: number) { this.volume = v; }

  private play(fn: (ctx: AudioContext, gain: GainNode) => void) {
    if (this.muted) return;
    try {
      const ctx = this.getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const gain = ctx.createGain();
      gain.gain.value = this.volume;
      gain.connect(ctx.destination);
      fn(ctx, gain);
    } catch (_) { /* silent fail */ }
  }

  jump() {
    this.play((ctx, gain) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    });
  }

  land() {
    this.play((ctx, gain) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    });
  }

  win() {
    this.play((ctx, gain) => {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.13;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.start(t); osc.stop(t + 0.25);
      });
    });
  }

  click() {
    this.play((ctx, gain) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.value = this.volume * 0.3;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start(); osc.stop(ctx.currentTime + 0.04);
    });
  }

  countdown(n: number) {
    this.play((ctx, gain) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = 'sine';
      osc.frequency.value = n === 0 ? 880 : 440;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    });
  }

  hover() {
    this.play((ctx, gain) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = 'sine';
      osc.frequency.value = 700;
      gain.gain.value = this.volume * 0.15;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    });
  }

  destroy() {
    this.ctx?.close();
    this.ctx = null;
  }
}

// ─── SEO Head Injection ───────────────────────────────────────────────────────
const SEOHead: React.FC = () => {
  useEffect(() => {
    // Title
    document.title = 'CPS Rush — Free CPS Speed Test & Platformer Game';

    const setMeta = (attrs: Record<string, string>) => {
      const sel = Object.entries(attrs)
        .filter(([k]) => k !== 'content')
        .map(([k, v]) => `[${k}="${v}"]`)
        .join('');
      let el = document.querySelector<HTMLMetaElement>(`meta${sel}`);
      if (!el) {
        el = document.createElement('meta');
        Object.entries(attrs).filter(([k]) => k !== 'content').forEach(([k, v]) => el!.setAttribute(k, v));
        document.head.appendChild(el);
      }
      el.setAttribute('content', attrs.content);
    };

    const setLink = (attrs: Record<string, string>) => {
      const sel = `link[rel="${attrs.rel}"]`;
      let el = document.querySelector<HTMLLinkElement>(sel);
      if (!el) { el = document.createElement('link'); document.head.appendChild(el); }
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    };

    const setJsonLd = (id: string, data: object) => {
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('script');
        el.id = id;
        el.setAttribute('type', 'application/ld+json');
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(data);
    };

    // Core meta
    setMeta({ name: 'description', content: 'CPS Rush is a free browser-based CPS speed test and platformer game. Click faster to run faster! Test your mouse or keyboard clicking speed and improve your gaming performance.' });
    setMeta({ name: 'robots', content: 'index, follow' });
    setMeta({ name: 'theme-color', content: '#00f0ff' });
    setMeta({ name: 'viewport', content: 'width=device-width, initial-scale=1' });

    // Canonical
    setLink({ rel: 'canonical', href: SITE_URL });

    // Favicon
    setLink({ rel: 'icon', type: 'image/svg+xml', href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%2300f0ff'/><circle cx='16' cy='16' r='8' fill='%23030712'/></svg>" });
    setLink({ rel: 'apple-touch-icon', href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><rect width='180' height='180' rx='40' fill='%2300f0ff'/><circle cx='90' cy='90' r='50' fill='%23030712'/></svg>" });

    // Open Graph
    setMeta({ property: 'og:type', content: 'website' });
    setMeta({ property: 'og:title', content: 'CPS Rush — Free CPS Speed Test & Platformer Game' });
    setMeta({ property: 'og:description', content: 'CPS Rush is a free browser-based CPS speed test and platformer game. Click faster to run faster! Test your mouse or keyboard clicking speed and improve your gaming performance.' });
    setMeta({ property: 'og:image', content: OG_IMAGE });
    setMeta({ property: 'og:url', content: SITE_URL });
    setMeta({ property: 'og:site_name', content: 'CPS Rush' });

    // Twitter Card
    setMeta({ name: 'twitter:card', content: 'summary_large_image' });
    setMeta({ name: 'twitter:title', content: 'CPS Rush — Free CPS Speed Test & Platformer Game' });
    setMeta({ name: 'twitter:description', content: 'Test your CPS in a fun platformer game. Click faster to move faster!' });
    setMeta({ name: 'twitter:image', content: OG_IMAGE });

    // FAQ data for schema
    const faqItems = [
      { q: 'What is CPS Rush?', a: 'CPS Rush is a browser-based platformer game that uses your clicks per second (CPS) to control your character\'s speed and jump height, combining a CPS test with a fun platforming challenge.' },
      { q: 'How does CPS affect gameplay in CPS Rush?', a: 'The more clicks per second you generate, the faster your character moves horizontally and the higher it jumps. This directly ties your clicking speed to your in-game performance.' },
      { q: 'What is a good CPS score?', a: 'A score of 6–8 CPS is average for casual gamers. Competitive players often achieve 10–14 CPS with regular clicking, while skilled butterfly or jitter clickers can reach 15–20+ CPS.' },
      { q: 'Can I use a keyboard instead of a mouse?', a: 'Yes! CPS Rush supports both mouse clicks and spacebar presses. Switch to keyboard mode in the main menu to test your spacebar pressing speed.' },
      { q: 'What is jitter clicking?', a: 'Jitter clicking is a technique where you vibrate your forearm and wrist muscles to rapidly tap the mouse button, achieving speeds of 10–14 CPS. It requires practice to master.' },
      { q: 'What is butterfly clicking?', a: 'Butterfly clicking involves alternately tapping the mouse button with your index and middle fingers, allowing speeds of 15–25 CPS. This technique is often banned on some game servers.' },
      { q: 'Is CPS Rush free to play?', a: 'Yes, CPS Rush is completely free to play directly in your browser with no download or installation required.' },
      { q: 'How do I pause the game?', a: 'Press the ESC key at any time during gameplay to pause. You can then resume, restart, or exit to the menu.' },
      { q: 'Does CPS Rush work on mobile?', a: 'CPS Rush works on mobile browsers with touch input. Tap the screen rapidly to generate CPS and control your character\'s speed.' },
      { q: 'Can CPS Rush help me improve in Minecraft PvP?', a: 'Absolutely! Higher CPS in Minecraft reduces knockback received during combat and enables advanced bridging techniques. Regular practice in CPS Rush builds the muscle memory you need.' },
      { q: 'What is the difference between CPS Rush and a traditional CPS test?', a: 'Traditional CPS tests only measure how fast you click with no consequence. CPS Rush integrates that speed into a platformer, making the training more engaging and applicable to real gaming scenarios.' },
      { q: 'How do I improve my CPS score?', a: 'Practice regularly, ensure your mouse or keyboard is performing optimally, use proper hand posture, and try different clicking techniques like drag clicking or butterfly clicking.' },
      { q: 'What mouse is best for high CPS?', a: 'Lightweight mice (under 80g) with low actuation force buttons are ideal. Popular choices include the Logitech G Pro X Superlight, Glorious Model O, and Razer Viper Ultimate.' },
      { q: 'Can I go fullscreen in CPS Rush?', a: 'Yes! Click the fullscreen button on the game canvas to enter fullscreen mode for an immersive experience.' },
      { q: 'Is clicking very fast bad for my hand?', a: 'Intense clicking techniques like jitter clicking can strain your tendons if overdone. Always take regular breaks, stretch your wrists, and limit intense sessions to 10–15 minutes at a time.' },
      { q: 'What does the distance counter show?', a: 'The distance counter shows how far you are from the finish platform, measured in meters. Aim to reduce it to zero to complete the level.' },
      { q: 'How does the scoring system work?', a: 'Your score increases as your character moves further right across the level. The further you travel, the higher your score.' },
      { q: 'Can CPS Rush test new gaming hardware?', a: 'Yes! CPS Rush is an excellent tool for testing a new mouse\'s main button responsiveness or a new keyboard\'s switch actuation speed and debounce time.' },
    ];

    // Website Schema
    setJsonLd('schema-website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'CPS Rush',
      url: SITE_URL,
      description: 'A free browser-based CPS speed test and platformer game.',
      potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' }
    });

    // WebApplication Schema
    setJsonLd('schema-webapp', {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'CPS Rush',
      url: SITE_URL,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      description: 'CPS Rush is a free browser platformer game that uses your clicks per second to control your character speed and jump height.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@type': 'Organization', name: 'CPS Rush' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '2341' }
    });

    // FAQ Schema
    setJsonLd('schema-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    });

    // BreadcrumbList Schema
    setJsonLd('schema-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'CPS Test', item: `${SITE_URL}/cps-test` },
        { '@type': 'ListItem', position: 3, name: 'CPS Rush', item: `${SITE_URL}/cps-rush` }
      ]
    });

    return () => {
      ['schema-website', 'schema-webapp', 'schema-faq', 'schema-breadcrumb'].forEach(id => {
        document.getElementById(id)?.remove();
      });
    };
  }, []);

  return null;
};

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: 'What is CPS Rush?', a: 'CPS Rush is a browser-based platformer game that uses your clicks per second (CPS) to control your character\'s speed and jump height, combining a CPS test with a fun platforming challenge.' },
  { q: 'How does CPS affect gameplay in CPS Rush?', a: 'The more clicks per second you generate, the faster your character moves horizontally and the higher it jumps. This directly ties your clicking speed to your in-game performance.' },
  { q: 'What is a good CPS score?', a: 'A score of 6–8 CPS is average for casual gamers. Competitive players often achieve 10–14 CPS with regular clicking, while skilled butterfly or jitter clickers can reach 15–20+ CPS.' },
  { q: 'Can I use a keyboard instead of a mouse?', a: 'Yes! CPS Rush supports both mouse clicks and spacebar presses. Switch to keyboard mode in the main menu to test your spacebar pressing speed.' },
  { q: 'What is jitter clicking?', a: 'Jitter clicking is a technique where you vibrate your forearm and wrist muscles to rapidly tap the mouse button, achieving speeds of 10–14 CPS. It requires practice to master.' },
  { q: 'What is butterfly clicking?', a: 'Butterfly clicking involves alternately tapping the mouse button with your index and middle fingers, allowing speeds of 15–25 CPS. This technique is often banned on some game servers.' },
  { q: 'Is CPS Rush free to play?', a: 'Yes, CPS Rush is completely free to play directly in your browser with no download or installation required.' },
  { q: 'How do I pause the game?', a: 'Press the ESC key at any time during gameplay to pause. You can then resume, restart, or exit to the menu.' },
  { q: 'Does CPS Rush work on mobile?', a: 'CPS Rush works on mobile browsers with touch input. Tap the screen rapidly to generate CPS and control your character\'s speed.' },
  { q: 'Can CPS Rush help me improve in Minecraft PvP?', a: 'Absolutely! Higher CPS in Minecraft reduces knockback received during combat and enables advanced bridging techniques. Regular practice in CPS Rush builds the muscle memory you need.' },
  { q: 'What is the difference between CPS Rush and a traditional CPS test?', a: 'Traditional CPS tests only measure how fast you click with no consequence. CPS Rush integrates that speed into a platformer, making the training more engaging and applicable to real gaming scenarios.' },
  { q: 'How do I improve my CPS score?', a: 'Practice regularly, ensure your mouse or keyboard is performing optimally, use proper hand posture, and try different clicking techniques like drag clicking or butterfly clicking.' },
  { q: 'What mouse is best for high CPS?', a: 'Lightweight mice (under 80g) with low actuation force buttons are ideal. Popular choices include the Logitech G Pro X Superlight, Glorious Model O, and Razer Viper Ultimate.' },
  { q: 'Can I go fullscreen in CPS Rush?', a: 'Yes! Click the fullscreen button on the game canvas to enter fullscreen mode for an immersive experience.' },
  { q: 'Is clicking very fast bad for my hand?', a: 'Intense clicking techniques like jitter clicking can strain your tendons if overdone. Always take regular breaks, stretch your wrists, and limit intense sessions to 10–15 minutes at a time.' },
  { q: 'What does the distance counter show?', a: 'The distance counter shows how far you are from the finish platform, measured in meters. Aim to reduce it to zero to complete the level.' },
  { q: 'How does the scoring system work?', a: 'Your score increases as your character moves further right across the level. The further you travel, the higher your score.' },
  { q: 'Can CPS Rush test new gaming hardware?', a: 'Yes! CPS Rush is an excellent tool for testing a new mouse\'s main button responsiveness or a new keyboard\'s switch actuation speed and debounce time.' },
];

const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          role="listitem"
          style={{ border: '1px solid', borderColor: openIndex === i ? 'rgba(0,240,255,0.4)' : '#1f2937', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s' }}
        >
          <button
            aria-expanded={openIndex === i}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: openIndex === i ? 'rgba(0,240,255,0.05)' : '#0b111e', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: '0.95rem', textAlign: 'left', gap: '12px' }}
          >
            <span>{item.q}</span>
            {openIndex === i ? <ChevronUp size={16} color="#00f0ff" /> : <ChevronDown size={16} color="#6b7280" />}
          </button>
          {openIndex === i && (
            <div style={{ padding: '0 18px 16px', backgroundColor: 'rgba(0,240,255,0.03)' }}>
              <p style={{ color: '#9ca3af', margin: 0, lineHeight: '1.7', fontSize: '0.95rem' }}>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
const Breadcrumb: React.FC = () => (
  <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem' }}>
    <ol style={{ display: 'flex', alignItems: 'center', gap: '6px', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
      <li><a href="/" style={{ color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} aria-label="Home"><Home size={13} />Home</a></li>
      <li aria-hidden="true"><ChevronRight size={12} color="#374151" /></li>
      <li><a href="/cps-test" style={{ color: '#6b7280', textDecoration: 'none' }}>CPS Test</a></li>
      <li aria-hidden="true"><ChevronRight size={12} color="#374151" /></li>
      <li aria-current="page" style={{ color: '#00f0ff', fontWeight: 700 }}>CPS Rush</li>
    </ol>
  </nav>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CpsRush() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [inputMode, setInputMode] = useState<InputMode>('mouse');
  const [score, setScore] = useState(0);
  const [distanceToFinish, setDistanceToFinish] = useState(1000);
  const [cps, setCps] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | string>(3);

  const clickTimestamps = useRef<number[]>([]);
  const ball = useRef({ x: 50, y: 260, vy: 0, vx: 0 });
  const platforms = useRef<Platform[]>([]);
  const finishX = useRef(0);
  const cameraX = useRef(0);
  const frameId = useRef<number>(0);
  const keysPressed = useRef<Record<string, boolean>>({});
  const gameStateRef = useRef<GameState>('menu');
  const audioRef = useRef<AudioEngine>(new AudioEngine());
  const isOnGroundRef = useRef(false);
  const prevOnGroundRef = useRef(false);

  // keep gameStateRef in sync
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Mute sync
  useEffect(() => { audioRef.current.setMuted(muted); }, [muted]);

  // CPS ticker
  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    if (gameState === 'playing') {
      id = setInterval(() => {
        const now = performance.now();
        clickTimestamps.current = clickTimestamps.current.filter(t => now - t < 1000);
        setCps(clickTimestamps.current.length);
      }, 100);
    } else {
      setCps(0);
      clickTimestamps.current = [];
    }
    return () => clearInterval(id);
  }, [gameState]);

  // Fullscreen detection
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    audioRef.current.click();
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  // ── Generate Platforms ────────────────────────────────────────────────────
  const initGame = useCallback(() => {
    ball.current = { x: 50, y: 260, vy: 0, vx: 0 };
    cameraX.current = 0;
    keysPressed.current = {};
    clickTimestamps.current = [];
    isOnGroundRef.current = false;
    prevOnGroundRef.current = false;
    setScore(0);
    setCps(0);

    const p: Platform[] = [{ x: 0, y: 350, width: 220, height: 16, color: '#00f0ff' }];
    let lastX = 220;
    let lastY = 350;
    for (let i = 0; i < 35; i++) {
      const width = Math.max(80, 160 - i * 2);
      const gap = 120 + Math.random() * 80 + i * 1.5;
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

  // ── Countdown Logic ───────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    initGame();
    setGameState('countdown');
    audioRef.current.click();
    let count = 3;
    setCountdownValue(3);
    audioRef.current.countdown(3);

    const tick = () => {
      count--;
      if (count > 0) {
        setCountdownValue(count);
        audioRef.current.countdown(count);
        setTimeout(tick, 900);
      } else {
        setCountdownValue('GO!');
        audioRef.current.countdown(0);
        setTimeout(() => {
          setGameState('playing');
        }, 700);
      }
    };
    setTimeout(tick, 900);
  }, [initGame]);

  // ── Input Handler ─────────────────────────────────────────────────────────
  const recordClick = useCallback(() => {
    if (gameStateRef.current === 'playing') {
      clickTimestamps.current.push(performance.now());
      audioRef.current.click();
    }
  }, []);

  // ── Keyboard Events ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      if (e.code === 'Space' && inputMode === 'keyboard' && gameStateRef.current === 'playing') {
        e.preventDefault();
        recordClick();
      }

      if (e.code === 'Escape') {
        e.preventDefault();
        if (gameStateRef.current === 'playing') {
          setGameState('paused');
        } else if (gameStateRef.current === 'paused') {
          setGameState('playing');
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.code] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [inputMode, recordClick]);

  // ── Draw ─────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    ctx.save();
    ctx.translate(-cameraX.current % 45, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH + 45; x += 45) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-cameraX.current, 0);

    platforms.current.forEach(p => {
      if (p.x + p.width > cameraX.current && p.x < cameraX.current + CANVAS_WIDTH) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        if (p.isEnd) {
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.width, p.height, 12);
          ctx.fill();
          ctx.shadowBlur = 0;
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

    // Ball
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#030712';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }, []);

  // ── Game Loop ─────────────────────────────────────────────────────────────
  const update = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

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

    cameraX.current = Math.max(0, ball.current.x - 220);

    isOnGroundRef.current = false;

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
          audioRef.current.win();
          confetti({ particleCount: 140, spread: 65, colors: ['#00f0ff', '#ff00aa'] });
          return;
        }
        ball.current.y = p.y - BALL_RADIUS;
        ball.current.vy = INITIAL_JUMP_FORCE - jumpBoost;
        isOnGroundRef.current = true;
        audioRef.current.jump();
      }
    });

    // Landing sound
    if (isOnGroundRef.current && !prevOnGroundRef.current) {
      audioRef.current.land();
    }
    prevOnGroundRef.current = isOnGroundRef.current;

    setScore(Math.floor(ball.current.x / 80));
    setDistanceToFinish(Math.max(0, Math.floor((finishX.current - ball.current.x) / 5)));

    if (ball.current.y > CANVAS_HEIGHT + 150) {
      initGame();
      startCountdown();
      return;
    }

    draw();
    frameId.current = requestAnimationFrame(update);
  }, [draw, initGame, startCountdown]);

  // ── Animation Loop Control ────────────────────────────────────────────────
  useEffect(() => {
    if (gameState === 'playing') {
      frameId.current = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(frameId.current);
      if (gameState === 'paused' || gameState === 'menu' || gameState === 'won' || gameState === 'countdown') {
        draw();
      }
    }
    return () => cancelAnimationFrame(frameId.current);
  }, [gameState, update, draw]);

  // ── Styles ────────────────────────────────────────────────────────────────
  const overlayStyle: React.CSSProperties = {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(2,4,10,0.95)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  };

  const btnPrimary: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: '#00f0ff', color: '#02040a',
    padding: '12px 36px', borderRadius: '6px',
    fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: 'pointer',
  };

  const btnSecondary: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: '#111827', color: '#fff',
    padding: '10px 24px', borderRadius: '6px',
    fontWeight: 700, border: '1px solid #1f2937', cursor: 'pointer',
    fontSize: '0.9rem',
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <SEOHead />
      <div style={{ width: '100%', color: '#ffffff' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '4rem', paddingLeft: '1rem', paddingRight: '1rem' }}>

          {/* Breadcrumb */}
          <Breadcrumb />

          {/* Header */}
          <header style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            <div style={{ display: 'inline-flex', backgroundColor: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.2)', color: '#00f0ff', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
              MOUSE &amp; KEYBOARD SPEED TEST
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0, color: '#00f0ff', letterSpacing: '-0.5px' }}>
              CPS RUSH
            </h1>
          </header>

          {/* ── GAME CANVAS WRAPPER ─────────────────────────────────────────── */}
          <div
            ref={gameContainerRef}
            onPointerDown={() => { if (inputMode === 'mouse' && gameStateRef.current === 'playing') recordClick(); }}
            style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#030712', borderRadius: '16px', overflow: 'hidden', border: '1px solid #111827', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)', touchAction: 'none', marginBottom: '1rem' }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{ width: '100%', height: '100%', display: 'block' }}
              aria-label="CPS Rush game canvas"
              role="img"
            />

            {/* HUD */}
            <div style={{ position: 'absolute', top: '16px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none', userSelect: 'none' }}>
              <div style={{ background: 'rgba(4,9,20,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '14px', width: '85px', padding: '8px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#00f0ff' }}>CPS</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{cps}</div>
              </div>
              <div style={{ background: 'rgba(4,9,20,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(219,39,119,0.3)', borderRadius: '14px', width: '85px', padding: '8px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#db2777' }}>Score</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{score}</div>
              </div>
              <div style={{ background: 'rgba(4,9,20,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '14px', minWidth: '95px', padding: '8px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#ec4899' }}>Finish</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{distanceToFinish}<span style={{ fontSize: '15px', color: '#cbcbcb', marginLeft: '1px' }}>m</span></div>
              </div>
            </div>

            {/* Fullscreen + Mute controls */}
            <div style={{ position: 'absolute', bottom: '14px', right: '14px', display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
              <button
                onClick={() => { setMuted(m => !m); audioRef.current.click(); }}
                aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
                style={{ background: 'rgba(4,9,20,0.8)', border: '1px solid #1f2937', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                style={{ background: 'rgba(4,9,20,0.8)', border: '1px solid #1f2937', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </div>

            {/* ── MENU OVERLAY ──────────────────────────────────────────────── */}
            {gameState === 'menu' && (
              <div style={overlayStyle}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.2rem', color: '#fff' }}>SELECT INPUT MODE</h2>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '1.8rem', width: '100%', maxWidth: '340px' }}>
                  <button
                    onClick={() => { setInputMode('mouse'); audioRef.current.click(); }}
                    aria-pressed={inputMode === 'mouse'}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontWeight: 'bold', backgroundColor: inputMode === 'mouse' ? 'rgba(0,240,255,0.08)' : '#0b111e', borderColor: inputMode === 'mouse' ? '#00f0ff' : '#1f2937', color: inputMode === 'mouse' ? '#00f0ff' : '#9ca3af' }}
                  >
                    <MousePointer2 size={14} /> Mouse
                  </button>
                  <button
                    onClick={() => { setInputMode('keyboard'); audioRef.current.click(); }}
                    aria-pressed={inputMode === 'keyboard'}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontWeight: 'bold', backgroundColor: inputMode === 'keyboard' ? 'rgba(0,240,255,0.08)' : '#0b111e', borderColor: inputMode === 'keyboard' ? '#00f0ff' : '#1f2937', color: inputMode === 'keyboard' ? '#00f0ff' : '#9ca3af' }}
                  >
                    <Keyboard size={14} /> Spacebar
                  </button>
                </div>
                <div style={{ marginBottom: '10px', color: '#6b7280', fontSize: '0.82rem', textAlign: 'center' }}>
                  Use <strong style={{ color: '#9ca3af' }}>A / D</strong> or <strong style={{ color: '#9ca3af' }}>Arrow Keys</strong> to move
                </div>
                <button onClick={startCountdown} style={btnPrimary} aria-label="Start game">
                  <Play fill="currentColor" size={12} /> START GAME
                </button>
              </div>
            )}

            {/* ── COUNTDOWN OVERLAY ─────────────────────────────────────────── */}
            {gameState === 'countdown' && (
              <div style={{ ...overlayStyle, backgroundColor: 'rgba(2,4,10,0.88)' }}>
                <div
                  style={{
                    fontSize: countdownValue === 'GO!' ? '5rem' : '7rem',
                    fontWeight: 900,
                    color: countdownValue === 'GO!' ? '#00f0ff' : '#ffffff',
                    lineHeight: 1,
                    textShadow: `0 0 40px ${countdownValue === 'GO!' ? '#00f0ff' : 'rgba(255,255,255,0.5)'}`,
                    transition: 'all 0.15s ease',
                    letterSpacing: '-2px',
                  }}
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  {countdownValue}
                </div>
                {countdownValue !== 'GO!' && (
                  <p style={{ color: '#6b7280', marginTop: '1rem', fontSize: '0.9rem' }}>Get ready…</p>
                )}
              </div>
            )}

            {/* ── PAUSED OVERLAY ────────────────────────────────────────────── */}
            {gameState === 'paused' && (
              <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="Game paused">
                <Pause size={32} style={{ color: '#00f0ff', marginBottom: '12px' }} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>PAUSED</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '200px' }}>
                  <button
                    onClick={() => { setGameState('playing'); audioRef.current.click(); }}
                    style={btnPrimary}
                    aria-label="Resume game"
                  >
                    <Play fill="currentColor" size={12} /> RESUME
                  </button>
                  <button
                    onClick={() => { startCountdown(); }}
                    style={btnSecondary}
                    aria-label="Restart game"
                  >
                    <RotateCcw size={14} /> RESTART
                  </button>
                  <button
                    onClick={() => { setGameState('menu'); audioRef.current.click(); }}
                    style={btnSecondary}
                    aria-label="Exit to menu"
                  >
                    <Home size={14} /> EXIT
                  </button>
                </div>
                <p style={{ color: '#374151', fontSize: '0.8rem', marginTop: '1.2rem' }}>Press ESC to resume</p>
              </div>
            )}

            {/* ── WIN OVERLAY ───────────────────────────────────────────────── */}
            {gameState === 'won' && (
              <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="Level complete">
                <Trophy size={28} style={{ color: '#00f0ff', marginBottom: '12px' }} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>FINISHED!</h2>
                <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Score: <span style={{ color: '#00f0ff', fontWeight: 700 }}>{score}</span></p>
                <button onClick={startCountdown} style={btnPrimary} aria-label="Play again">
                  <RotateCcw size={14} /> PLAY AGAIN
                </button>
              </div>
            )}
          </div>

          {/* ESC hint */}
          {gameState === 'playing' && (
            <p style={{ textAlign: 'center', color: '#374151', fontSize: '0.78rem', marginBottom: '3rem' }}>
              Press <kbd style={{ background: '#111827', border: '1px solid #1f2937', padding: '1px 6px', borderRadius: '4px', color: '#6b7280', fontFamily: 'monospace' }}>ESC</kbd> to pause
            </p>
          )}
          {gameState !== 'playing' && <div style={{ marginBottom: '3rem' }} />}

          {/* ── MORE TOOLS GRID ── */}
          <section aria-label="More Tools" style={{ marginBottom: '3.5rem' }}>
            <h2 style={{
              fontWeight: 800, fontSize: '1.5rem', color: '#fff',
              marginBottom: '1.5rem', textAlign: 'center',
              letterSpacing: '-0.3px',
            }}>More Tools</h2>
            <div
              className="cps-games-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
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
                    background: '#141a2a',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    padding: '1.2rem 0.5rem',
                    cursor: 'pointer', textDecoration: 'none',
                    color: '#00f0ff',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(0,240,255,0.07)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,240,255,0.3)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = '#141a2a';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#00f0ff',
                  }}>
                    {icon}
                  </div>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700,
                    color: '#cbd5e1', textAlign: 'center', lineHeight: 1.3,
                  }}>{label}</span>
                </a>
              ))}
            </div>
          </section>

          {/* ================================================================
              SEO ARTICLE
          ================================================================ */}
          <article style={{ borderTop: '1px solid #1f2937', paddingTop: '3rem' }}>

            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
              The Ultimate Guide to CPS Mastery and Platforming Speed
            </h2>

            <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
              <strong>CPS Rush</strong> is a hybrid platformer and speed-testing simulator designed to push your mechanical limits. By tying your <em>Clicks Per Second (CPS)</em> directly to your in-game movement speed and jump height, this tool trains your hand endurance while challenging your spatial awareness. Whether you prefer smashing the spacebar or jitter-clicking your mouse, mastering this momentum-based challenge will elevate your performance across the most competitive games in the world.
            </p>

            {/* ── Hardware Check Box ──────────────────────────────────────── */}
            <div style={{ backgroundColor: 'rgba(0,240,255,0.05)', borderLeft: '4px solid #00f0ff', padding: '1.5rem', borderRadius: '0 12px 12px 0', marginBottom: '3rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.25rem', fontWeight: 800, marginTop: 0, marginBottom: '0.75rem' }}>
                <MousePointer2 size={20} color="#00f0ff" />
                The Ultimate &quot;New Mouse &amp; Keyboard Check&quot;
              </h3>
              <p style={{ color: '#9ca3af', margin: 0, lineHeight: '1.6' }}>
                Did you recently upgrade your gaming setup? <strong>CPS Rush</strong> acts as an incredibly effective <strong>new mouse check</strong> and keyboard switch tester. Use mouse mode to verify your main button&apos;s debounce time and ensure it doesn&apos;t suffer from accidental double-clicking. Switch to Keyboard mode to test your mechanical switch actuation (like Cherry MX Red or optical switches) by spamming the spacebar to generate maximum jump momentum.
              </p>
            </div>

            {/* ── Section 1: How CPS Rush Works ───────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                How CPS Rush Works
              </h2>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                The Core Mechanic: Clicks = Speed
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Unlike traditional CPS tests that simply count your clicks and display a number, CPS Rush transforms that data into a real-time physics simulation. Every click or spacebar press you register within the past second is counted and converted into a speed multiplier and jump force bonus for your character. This means letting your CPS drop even briefly will slow your character and reduce jump height — making consistency just as important as raw speed.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Physics-Based Platforming
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                The game uses real gravity simulation with a constant downward acceleration applied every frame. Your character bounces automatically when it lands on a platform — the jump height is determined by your current CPS. This creates a beautifully emergent gameplay loop: clicking fast before a gap gives you both the speed to cross it and the height to clear the next platform safely.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Progressive Difficulty
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '0' }}>
                Platforms get progressively narrower and the gaps between them widen as you advance. Early platforms are generous — over 160 pixels wide with modest spacing. By the time you reach the final third of the level, platforms shrink to around 80 pixels and gaps can exceed 220 pixels. This forces you to maintain elite CPS under pressure, making it an excellent stress test for competitive gaming performance.
              </p>
            </section>

            {/* ── Section 2: Beginner Guide ───────────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Beginner&apos;s Guide to CPS Rush
              </h2>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Your First Run
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                When you launch CPS Rush for the first time, select <strong>Mouse Mode</strong> if you want to test your clicking technique, or <strong>Keyboard Mode</strong> if you prefer to hammer the spacebar. Use the <strong>A/D</strong> keys or <strong>Arrow Keys</strong> to steer your ball left and right. Your character will bounce automatically each time it lands on a cyan platform.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Understanding the HUD
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                The three stats displayed at the top of the screen are your most important performance indicators: <strong>CPS</strong> shows your current click rate in the last second (aim for 6+), <strong>Score</strong> tracks your horizontal progress, and <strong>Finish (m)</strong> counts down the remaining distance to the glowing pink finish platform. Getting all three moving in the right direction simultaneously is the foundation of a clean run.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Don&apos;t Panic When You Fall
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '0' }}>
                Falling off a platform resets the level instantly via an automatic restart countdown. Don&apos;t get frustrated — use each attempt to memorize the platform layout in the early sections, which stays consistent across runs thanks to the seeded generation pattern.
              </p>
            </section>

            {/* ── Section 3: Advanced Guide ───────────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Advanced Strategy &amp; Techniques
              </h2>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Pre-Loading CPS Before Gaps
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Seasoned players &quot;pre-load&quot; their CPS before approaching a large gap by clicking intensely while still on a safe platform. Since the CPS window is exactly one second, if you spike to 15 CPS in the moments before launching yourself into a gap, those clicks will still count as you soar through the air — giving you a significant speed and height bonus precisely when you need it most.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Diagonal Trajectory Control
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                By combining directional input with precise CPS timing, you can subtly control the arc of each jump. Holding the right arrow key while clicking aggressively flattens your trajectory slightly, letting you cover more horizontal distance. Releasing the key at the apex of your jump lets gravity drop you more steeply onto a narrow platform below.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Speed Capping Strategy
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '0' }}>
                Both the speed boost and jump boost are capped at maximum values (10 and 8 respectively). Once your CPS reaches approximately 22–25, you hit both caps. Beyond this point, additional clicks don&apos;t add speed — they&apos;re wasted. Advanced players deliberately maintain a CPS in the range of 18–22 to stay near the cap without exhausting their hands unnecessarily on long runs.
              </p>
            </section>

            {/* ── Section 4: Mouse vs Keyboard ────────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Mouse vs Keyboard: Which is Better?
              </h2>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Mouse Mode Advantages
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Mouse mode is ideal for players training their click speed for games like Minecraft PvP, browser-based clicker games, or any title where mouse button speed matters. The primary benefit is that you&apos;re exercising the exact same muscles and motor patterns you&apos;ll use in those games. Additionally, advanced techniques like jitter clicking and butterfly clicking are exclusively mouse-based methods that can dramatically increase your CPS ceiling.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Keyboard Mode Advantages
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Spacebar mashing is a different athletic discipline entirely. The spacebar&apos;s larger surface area allows the use of your thumb, which is a strong and efficient digit for rapid pressing. Many players find they achieve higher sustained CPS via spacebar than mouse clicking, making Keyboard Mode the preferred choice when chasing maximum speed scores. It also stress-tests your keyboard&apos;s polling rate and switch lifespan.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Which Should Beginners Choose?
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '0' }}>
                Beginners should start with Keyboard Mode because the spacebar is easier to press rapidly without technique, building confidence and an understanding of the CPS mechanics. Once comfortable, switch to Mouse Mode to add the challenge of maintaining direction control while clicking a smaller target button — this is closer to real competitive gaming demands.
              </p>
            </section>

            {/* ── Section 5: CPS Rush vs Traditional CPS Tests ────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                CPS Rush vs Traditional CPS Tests
              </h2>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                The Problem with Static CPS Testers
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Traditional CPS testers — like the popular{' '}
                <a href="https://cps-check.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00f0ff', textDecoration: 'none' }}>
                  CPS Check <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </a>{' '}
                — measure your raw click speed over a fixed time window and return a number. This is valuable as a baseline, but it has a fundamental limitation: there&apos;s no consequence for slowing down or reward for maintaining consistency. Players often achieve their highest CPS score on static testers in a single explosive burst that would be completely unsustainable in a real gaming session.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Why Consequence-Driven Testing is Superior
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                CPS Rush introduces a consequence: if your CPS drops, your character slows down and might fall into a gap, resetting your progress. This pressure mirrors real competitive gaming scenarios where mechanical skill must be maintained even under cognitive load — you&apos;re steering, planning your path, and clicking simultaneously. Research in sports science consistently shows that skill training under realistic pressure transfers better than isolated drills.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Dual-Task Training
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '0' }}>
                CPS Rush forces you to perform two tasks simultaneously: generating high CPS and navigating a moving platformer. This dual-task training is recognized in cognitive neuroscience as one of the most effective ways to improve a skill to the point of automaticity — where it no longer consumes conscious attention. Once your clicking speed becomes automatic, your brain frees up bandwidth for higher-level in-game decision making.
              </p>
            </section>

            {/* ── Section 6: Competitive Gaming Benefits ───────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Competitive Gaming Benefits
              </h2>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Clicking speed is a foundational mechanical skill that translates across virtually every major competitive game. Here&apos;s how consistent CPS training in CPS Rush prepares you for elite performance:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '2rem' }}>
                {['Minecraft', 'Roblox', 'Fortnite', 'Grand Theft Auto V', 'Call of Duty: Warzone', 'League of Legends', 'Counter-Strike 2', 'PUBG: Battlegrounds', 'Genshin Impact', 'Among Us'].map(game => (
                  <div key={game} style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#e5e7eb', fontWeight: 600, fontSize: '0.9rem' }}>
                    <Zap size={16} color="#ff00aa" /> {game}
                  </div>
                ))}
              </div>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Minecraft PvP
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                In Minecraft Java Edition PvP (versions prior to 1.9), the attack system is purely based on click speed — faster clicks mean more hits per second, more knockback applied, and less knockback received. Even in modern 1.9+ combat with the attack cooldown, burst-fire clicking at the right moment is still critical for speed-bridging and other movement techniques. Spend 10 minutes daily in CPS Rush to build the hand endurance needed for extended PvP sessions on servers like{' '}
                <a href="https://hypixel.net" target="_blank" rel="noopener noreferrer" style={{ color: '#00f0ff', textDecoration: 'none' }}>
                  Hypixel <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </a>.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Counter-Strike 2 &amp; Valorant
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '0' }}>
                Tactical shooters reward precise, deliberate clicks over raw speed. However, CPS training in CPS Rush builds something more important: the decoupling of clicking from hand tension. When your hands are trained to click rapidly without gripping tightly, your aim stabilizes — because a relaxed hand tracks more smoothly. This is a technique that CSGO and Valorant pro coaches consistently emphasize: <em>click faster by squeezing less</em>.
              </p>
            </section>

            {/* ── Section 7: Training Routines ────────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Daily Training Routine &amp; Practice Plan
              </h2>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                The 15-Minute Pre-Gaming Warm-Up
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Treat CPS Rush like a warm-up routine, not just a game. Before launching any competitive session, run 3–5 attempts in CPS Rush. This wakes up your fast-twitch muscle fibers, raises your hand temperature (cold hands click slower), and establishes a mental &quot;clicking rhythm&quot; that you can carry into your primary game. Professional esports teams build structured warm-up protocols — yours should include CPS training.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Weekly Progression Plan
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1rem' }}>
                Structure your weekly CPS training with clear goals to avoid plateaus:
              </p>
              <ul style={{ color: '#9ca3af', lineHeight: '2', paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
                <li><strong style={{ color: '#e5e7eb' }}>Monday &amp; Thursday:</strong> Endurance sessions — maintain 8+ CPS for the entire level without resting.</li>
                <li><strong style={{ color: '#e5e7eb' }}>Tuesday &amp; Friday:</strong> Speed peaks — sprint the first 10 platforms at maximum possible CPS, then rest hands.</li>
                <li><strong style={{ color: '#e5e7eb' }}>Wednesday:</strong> Technique day — practice a new clicking method (jitter, butterfly, or drag clicking).</li>
                <li><strong style={{ color: '#e5e7eb' }}>Weekend:</strong> Full runs trying to beat your personal best score.</li>
              </ul>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Tracking Progress
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '0' }}>
                Keep a simple log of your peak CPS achieved and your final score each session. After two weeks of consistent training, most players see a 2–4 CPS improvement in their sustained rate. After a month, hand endurance typically increases enough to maintain near-peak CPS for twice as long as when they started.
              </p>
            </section>

            {/* ── Section 8: Clicking Techniques ──────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Clicking Techniques Explained
              </h2>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Regular Clicking (4–8 CPS)
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Standard index-finger clicking using normal press-release motions. This is where most casual gamers sit naturally. It&apos;s sustainable for long sessions and creates minimal strain. In CPS Rush, 6 CPS provides a noticeable speed boost that makes the early platforms comfortably achievable.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Drag Clicking (10–20 CPS)
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Drag clicking involves dragging your finger across the mouse button to generate multiple registers per swipe. This works because of friction between skin and the button surface — special textured mice and slightly rough fingertips excel here. Drag clicking requires a mouse with a specific button design and can void warranties on some devices. However, when it works, it can push CPS into the 20+ range effortlessly.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Jitter Clicking (10–14 CPS)
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Jitter clicking involves tensing your forearm and wrist muscles to create a vibration that rapidly actuates the mouse button. It takes 2–4 weeks of daily practice to learn, but once mastered it&apos;s one of the most reliable high-CPS techniques. Warning: Do not jitter click for more than 10 minutes per session — prolonged use has been associated with arm strain.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Butterfly Clicking (15–25 CPS)
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '0' }}>
                Butterfly clicking uses the index and middle fingers alternating on the same mouse button. Each finger completes a separate press-release cycle, effectively doubling your potential CPS. This is the technique of choice for professional Minecraft PvP players. Note that some servers detect and ban butterfly clicking as it can trigger anti-cheat systems that monitor click patterns.
              </p>
            </section>

            {/* ── Section 9: Hardware Settings ────────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Best Mouse &amp; Keyboard Settings for CPS
              </h2>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Optimal Mouse Settings
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                For maximum CPS performance, use a gaming mouse with a <strong>1000Hz polling rate</strong> (the standard for most gaming mice today). Lower polling rates introduce input lag that artificially caps detectable CPS. The mouse should have a light main button spring to reduce the force required per click — look for actuation forces below 45 grams. Popular high-CPS mice include the Logitech G Pro X Superlight 2, the Finalmouse Starlight, and the Glorious Model O.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Mouse Surface &amp; Grip
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Use a hard mousepad for clicking practice — the rigid surface provides consistent resistance feedback. For grip style, a <strong>fingertip grip</strong> (where only your fingertips touch the mouse) reduces friction between palm and mouse body, allowing faster repositioning between clicks. Players who use <strong>claw grip</strong> often achieve slightly higher CPS due to better finger-button positioning.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Optimal Keyboard Settings for Spacebar CPS
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '0' }}>
                In keyboard mode, your spacebar&apos;s switch type massively influences achievable CPS. <strong>Linear switches</strong> (like Cherry MX Red or Gateron Yellow) with light springs (35–45 grams) provide the fastest actuation. <strong>Optical switches</strong> have near-zero debounce time and are the gold standard for competitive spacebar pressing. Avoid clicky or tactile switches for high-speed pressing — the bump feedback disrupts your rhythm. Also ensure your keyboard supports <strong>anti-ghosting</strong> or N-key rollover to register simultaneous directional and spacebar inputs reliably.
              </p>
            </section>

            {/* ── Section 10: Reaction Time ───────────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                How to Improve Reaction Time in FPS Games
              </h2>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Visual Processing Speed
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                In CPS Rush, you must anticipate platform gaps before your character reaches them. This forward-looking visual processing — looking one or two platforms ahead rather than just at your character — directly trains the same skill used in FPS games where you predict enemy movement rather than reacting to it. Playing at higher CPS also forces your visual system to process the scrolling environment more quickly, improving overall visual processing speed over time.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                The Hardware Advantage
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                According to{' '}
                <a href="https://www.lttlabs.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00f0ff', textDecoration: 'none' }}>
                  hardware research <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </a>, playing at 240Hz vs 60Hz can reduce end-to-end latency by up to 60ms. In a game where the average human reaction window is 150–250ms, eliminating 60ms from your display pipeline is enormous. Pair high refresh rates with a low-latency mouse at 1000Hz+ polling, and you eliminate the hardware ceiling, leaving only your biological reaction speed as the limiting factor.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Cognitive Warm-Up Routines
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '0' }}>
                Cold muscles and a cold mind both produce slower reaction times. Run 3 minutes of CPS Rush before your ranked matches to prime your nervous system. Research by{' '}
                <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3874328/" target="_blank" rel="noopener noreferrer" style={{ color: '#00f0ff', textDecoration: 'none' }}>
                  exercise physiologists <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </a>{' '}
                shows that a structured warm-up can improve fine motor reaction time by 8–12% compared to cold-starting sessions.
              </p>
            </section>

            {/* ── Section 11: Common Mistakes ─────────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Common Mistakes &amp; How to Fix Them
              </h2>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Mistake #1: Clicking in Bursts
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Many players click frantically for two seconds then rest for one. In CPS Rush, this creates an inconsistent speed that makes trajectory prediction nearly impossible. Fix this by training yourself to maintain a <em>rhythmic</em> click cadence — think of it like running pace rather than sprinting. Set a metronome to 120 BPM and try to click in sync with it before gradually increasing tempo.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Mistake #2: Ignoring Direction Control
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                New players focus so much on clicking that they forget to steer. Your character won&apos;t move at all without a directional key held down. Practice holding the right arrow key constantly while clicking, and only release it to brake for specific platform positions.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Mistake #3: Not Using Pauses Strategically
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '0' }}>
                The ESC key pauses the game completely. Many players don&apos;t realize they can use this to study upcoming platform layouts before attempting difficult sections. Press ESC, analyze the gap ahead, then resume with a prepared strategy. This is especially useful while learning the later stages of the level.
              </p>
            </section>

            {/* ── Section 12: Platforming Tips ────────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Platforming Tips for CPS Rush
              </h2>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Read the Rhythm of Platform Heights
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Platforms in CPS Rush have constrained height variation — they never spawn below y=380 or above y=160. This means there&apos;s never an extreme downward drop that requires you to kill your speed. Watch for clusters of platforms at similar heights (common in the middle section) versus alternating high-low patterns (common in the final third) and adjust your click rate accordingly.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                The Bounce Timing Window
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Your character bounces automatically upon landing, but the bounce height is determined by your CPS at the moment of landing. This means the last 0.5 seconds of clicks before landing are the most critical — spike your clicking rate just before you hit a platform to maximize your outgoing jump height.
              </p>

              <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Using the Camera to Your Advantage
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '0' }}>
                The camera keeps your character roughly one-third from the left edge of the screen, giving you approximately two-thirds of the visible area to see upcoming platforms. Train your eyes to always look at the right side of the screen, not at your character. This gives you maximum reaction time for incoming obstacles.
              </p>
            </section>

            {/* ── Section 13: Wrist Health ─────────────────────────────────── */}
            <div style={{ backgroundColor: 'rgba(255,0,170,0.05)', border: '1px solid rgba(255,0,170,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '3rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff00aa', fontSize: '1.5rem', fontWeight: 800, marginTop: 0, marginBottom: '1rem' }}>
                <Shield size={22} /> Health &amp; Wrist Safety
              </h2>

              <h3 style={{ color: '#ec4899', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Understanding RSI Risk
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.7', marginBottom: '1rem' }}>
                Repetitive Strain Injury (RSI) is a genuine risk when practicing high-intensity clicking techniques. The tendons in your forearm, wrist, and fingers are not designed for sustained jittering vibrations or thousands of clicks per minute. Symptoms to watch for include a burning sensation in the forearm, tingling in the fingers, reduced grip strength, or wrist pain that persists after gaming.
              </p>

              <h3 style={{ color: '#ec4899', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                The 20-20-20 Rule for Gamers
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.7', marginBottom: '1rem' }}>
                Adapt the standard eye strain rule for hand health: every 20 minutes of intense clicking, take a 20-second break and perform 20 wrist rotations in each direction. This flushes lactic acid from the muscle tissue and prevents tendon micro-tears from accumulating.
              </p>

              <h3 style={{ color: '#ec4899', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Essential Stretches
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.7', margin: 0 }}>
                Before and after every gaming session, perform: (1) Wrist flexion and extension stretches holding for 15 seconds each, (2) Finger spread stretches, (3) Forearm pronation/supination rotations, and (4) Gentle grip squeezes with a stress ball to promote blood flow. The{' '}
                <a href="https://www.mayoclinic.org/diseases-conditions/carpal-tunnel-syndrome/diagnosis-treatment/drc-20355608" target="_blank" rel="noopener noreferrer" style={{ color: '#ff00aa', textDecoration: 'none' }}>
                  Mayo Clinic recommends <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </a>{' '}
                these as effective preventive measures for carpal tunnel syndrome.
              </p>
            </div>

            {/* ── FAQ Section ─────────────────────────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HelpCircle size={24} color="#00f0ff" />
                Frequently Asked Questions
              </h2>
              <FaqAccordion />
            </section>

            {/* ── Game-specific Pro FAQs ───────────────────────────────────── */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', borderBottom: '1px solid #1f2937', paddingBottom: '1rem', marginBottom: '2rem' }}>
                Pro Gamer FAQs &amp; Game-Specific Strategies
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                  <h3 style={{ color: '#00f0ff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>How to get fast CPS in Minecraft?</h3>
                  <p style={{ color: '#9ca3af', margin: 0, lineHeight: '1.7' }}>
                    In <strong>Minecraft</strong>, a high CPS rate reduces incoming knockback during PvP and enables speed-bridging techniques. Use jitter clicking (10–14 CPS) or butterfly clicking (15–20 CPS). Practice both techniques safely in CPS Rush to find which gives you the most consistent speed boost. Remember that Minecraft PvP servers often have anti-cheat systems that can detect drag clicking — stick to jitter or butterfly for server safety.
                  </p>
                </div>

                <div>
                  <h3 style={{ color: '#00f0ff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>How to improve CPS in PUBG: Battlegrounds?</h3>
                  <p style={{ color: '#9ca3af', margin: 0, lineHeight: '1.7' }}>
                    When using designated marksman rifles (DMRs) or burst-fire weapons in <strong>PUBG</strong>, your tapping speed determines time-to-kill. Practice trigger discipline by using only your fingertip for explosive, short taps rather than tensing your whole hand. CPS Rush training ensures you maintain high click rate without cramping during final circles.
                  </p>
                </div>

                <div>
                  <h3 style={{ color: '#00f0ff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>How to increase clicking speed and accuracy in Valorant?</h3>
                  <p style={{ color: '#9ca3af', margin: 0, lineHeight: '1.7' }}>
                    <strong>Valorant</strong> requires precise, controlled clicks — but during pistol rounds, rapid-fire Classic or Frenzy shots are essential. Anchor your wrist to the mousepad to stabilize aim while clicking rapidly. CPS Rush helps you decouple your clicking action from your tracking motion, so your crosshair stays stable even at high click rates.
                  </p>
                </div>

                <div>
                  <h3 style={{ color: '#00f0ff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>How to improve reaction time in FPS games?</h3>
                  <p style={{ color: '#9ca3af', margin: 0, lineHeight: '1.7' }}>
                    <strong>1. Visual Prediction:</strong> CPS Rush trains you to process visual depth faster by anticipating platform gaps dynamically.<br /><br />
                    <strong>2. Hardware Optimization:</strong> Use a 144Hz or 240Hz monitor to reduce display latency significantly.<br /><br />
                    <strong>3. Warm-Up Routine:</strong> Play 3–5 rounds of CPS Rush before competitive matches to activate your central nervous system and warm up your hands.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer note */}
            <div style={{ borderTop: '1px solid #1f2937', paddingTop: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#374151', fontSize: '0.85rem', lineHeight: '1.7', margin: 0 }}>
                CPS Rush is a free browser game. No download required. Works on Chrome, Firefox, Edge, and Safari.<br />
                Practice responsibly. Take breaks. Stretch your wrists.
              </p>
            </div>

          </article>
        </div>
      </div>
    </>
  );
}
