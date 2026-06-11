import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';

const leaderboardData = {
  cps: [
    { rank: 1, name: 'Arpon', score: '14.2 CPS', country: '🇰🇷', avatar: '⚡' },
    { rank: 2, name: 'RapidFire99', score: '13.8 CPS', country: '🇺🇸', avatar: '🔥' },
    { rank: 3, name: 'ClickMaster', score: '13.1 CPS', country: '🇧🇷', avatar: '💥' },
    { rank: 4, name: 'XSpeedX', score: '12.9 CPS', country: '🇯🇵', avatar: '🎯' },
    { rank: 5, name: 'ProClicker', score: '12.7 CPS', country: '🇩🇪', avatar: '🏆' },
  ],
  wpm: [
    { rank: 1, name: 'Typeking', score: '187 WPM', country: '🇺🇸', avatar: '⌨️' },
    { rank: 2, name: 'KeyboardNinja', score: '174 WPM', country: '🇸🇬', avatar: '🥷' },
    { rank: 3, name: 'SpeedTyper', score: '168 WPM', country: '🇬🇧', avatar: '💨' },
    { rank: 4, name: 'WPMKing', score: '162 WPM', country: '🇨🇳', avatar: '👑' },
    { rank: 5, name: 'FastFingers', score: '158 WPM', country: '🇮🇳', avatar: '🚀' },
  ],
  reaction: [
    { rank: 1, name: 'Reflexking', score: '118ms', country: '🇰🇷', avatar: '⚡' },
    { rank: 2, name: 'QuickDraw', score: '124ms', country: '🇺🇸', avatar: '🎯' },
    { rank: 3, name: 'NeuralLink', score: '131ms', country: '🇯🇵', avatar: '🧠' },
    { rank: 4, name: 'SpeedBot', score: '138ms', country: '🇩🇪', avatar: '🤖' },
    { rank: 5, name: 'FastReact', score: '142ms', country: '🇧🇷', avatar: '💫' },
  ],
};

const tools = [
  { to: '/typing-test', icon: '⌨️', name: 'Typing Speed', tag: 'WPM Test', accent: 'var(--neon-cyan)' },
  { to: '/cps-test', icon: '🖱️', name: 'CPS Test', tag: 'Click Speed', accent: 'var(--neon-green)' },
  { to: '/reaction-time', icon: '⚡', name: 'Reaction Time', tag: 'Reflex Test', accent: 'var(--neon-orange)' },
  { to: '/aim-trainer', icon: '🎯', name: 'Aim Trainer', tag: 'FPS Skills', accent: 'var(--neon-red)' },
  { to: '/spacebar', icon: '▭', name: 'Spacebar Counter', tag: 'Key Smash', accent: 'var(--neon-cyan)' },
  { to: '/key-visualizer', icon: '👁️', name: 'Key Visualizer', tag: 'Real-Time', accent: 'var(--neon-purple)' },
  { to: '/double-click', icon: '🖱️', name: 'Double Click', tag: 'Mouse Test', accent: 'var(--neon-green)' },
  { to: '/accuracy', icon: '📏', name: 'Accuracy Test', tag: 'Precision', accent: 'var(--neon-yellow)' },
  { to: '/scroll-test', icon: '↕️', name: 'Scroll Test', tag: 'Scroll Speed', accent: 'var(--neon-cyan)' },
  { to: '/mouse-accuracy', icon: '🖲️', name: 'Mouse Accuracy', tag: 'Tracking', accent: 'var(--neon-green)' },
  { to: '/sniper-mode', icon: '🔭', name: 'Sniper Mode', tag: 'Micro-Flicks', accent: 'var(--neon-red)' },
  { to: '/space-defense', icon: '🚀', name: 'Space Defense', tag: 'Skill Game', accent: 'var(--neon-purple)' },
  { to: '/voyager-game', icon: '🌌', name: 'Voyager Game', tag: 'Endless', accent: 'var(--neon-cyan)' },
  { to: '/cps-rush', icon: '💥', name: 'CPS Rush', tag: 'Speed Rush', accent: 'var(--neon-red)' },
];

const gearItems = [
  { icon: '🖱️', brand: 'Logitech', name: 'G Pro X Superlight 2', desc: '60g ultralight. 32K DPI. Used by pro FPS players worldwide.', price: '$159.99' },
  { icon: '⌨️', brand: 'Keychron', name: 'Q1 Pro Wireless', desc: 'Gasket-mounted TKL. Perfect for max WPM scores and typing comfort.', price: '$199.99' },
  { icon: '🖥️', brand: 'ASUS', name: 'ROG Swift 360Hz', desc: '360Hz for silky-smooth aim training. Every ms counts at elite level.', price: '$699.99' },
  { icon: '🎧', brand: 'SteelSeries', name: 'Arctis Nova Pro', desc: 'Hi-res audio with active noise cancellation for full focus mode.', price: '$349.99' },
];

const blogPosts = [
  { to: '/blog', emoji: '⌨️', tag: 'Typing', tagColor: 'var(--neon-cyan)', date: 'May 2, 2025', title: 'How to Go From 60 to 120 WPM in 30 Days', excerpt: 'A proven training routine used by competitive typists to double their speed.' },
  { to: '/blog', emoji: '🖱️', tag: 'Mouse', tagColor: 'var(--neon-green)', date: 'Apr 28, 2025', title: 'Best Gaming Mice for High CPS', excerpt: 'Which mice enable the fastest click speeds? We tested 12 mice to find out.' },
  { to: '/blog', emoji: '⚡', tag: 'Reaction', tagColor: 'var(--neon-orange)', date: 'Apr 20, 2025', title: 'Methods to Reduce Reaction Time', excerpt: 'Training schedules and warm-up drills that elite FPS players use daily.' },
];

// ─── SEO Article Data for all tools ───────────────────────────────────────────
const seoArticles = [
  {
    to: '/typing-test',
    icon: '⌨️',
    color: 'var(--neon-cyan)',
    title: 'Typing Speed Test — Measure Your WPM Online',
    badge: 'WPM',
    content: [
      'Our free <strong>Typing Speed Test</strong> measures how many <strong>Words Per Minute (WPM)</strong> you can type with real-time accuracy tracking. The average person types between 38–40 WPM, while professional typists hit 65–75 WPM. Competitive touch typists regularly exceed 100 WPM.',
      'This tool uses randomized word sets, code snippets, and quote passages to simulate real-world typing scenarios. Every session tracks your raw WPM, net WPM (after accuracy penalty), error count, and accuracy percentage. Use it daily to build muscle memory on your keyboard layout — whether you\'re on QWERTY, Dvorak, or Colemak.',
      '<strong>Pro tip:</strong> Focus on accuracy first, not speed. Typing at 80 WPM with 98% accuracy beats 120 WPM with 85% accuracy in real productivity terms.',
    ],
    faqs: [
      { q: 'What is a good typing speed?', a: '60 WPM is considered proficient. 80+ WPM is excellent for office work. 100+ WPM puts you in the top 5% of typists worldwide.' },
      { q: 'How do I improve my WPM fast?', a: 'Practice touch typing for 15 minutes daily, focus on your weakest keys, and never look at the keyboard. Consistency beats intensity.' },
    ],
  },
  {
    to: '/cps-test',
    icon: '🖱️',
    color: 'var(--neon-green)',
    title: 'CPS Test — How Many Clicks Per Second Can You Do?',
    badge: 'CPS',
    content: [
      'The <strong>CPS Test (Clicks Per Second Test)</strong> is the most popular tool for gamers who want to measure their mouse clicking speed. A casual user averages 5–7 CPS, while competitive Minecraft PvP players aim for 10–14 CPS using advanced clicking techniques.',
      'This test supports multiple durations: 1 second, 5 seconds, 10 seconds, and 30 seconds. A longer test duration gives a more accurate average CPS since it smooths out burst clicks. Results are logged so you can track your improvement over time.',
      '<strong>Clicking techniques tested:</strong> Regular clicking (3–7 CPS), Jitter clicking (10–14 CPS), Butterfly clicking (12–16 CPS), and Drag clicking (25–100+ CPS). Each technique has different use cases in games like Minecraft, Roblox, and various FPS titles.',
    ],
    faqs: [
      { q: 'What is a good CPS score?', a: 'Above 8 CPS is good for casual gaming. 12+ CPS is competitive. 16+ CPS using butterfly or drag clicking is considered elite.' },
      { q: 'Does mouse quality affect CPS?', a: 'Yes. A mouse with a higher polling rate (1000Hz+) and low debounce time registers clicks more accurately, giving you a true CPS reading.' },
    ],
  },
  {
    to: '/reaction-time',
    icon: '⚡',
    color: 'var(--neon-orange)',
    title: 'Reaction Time Test — Measure Your Reflex Speed in Milliseconds',
    badge: 'REFLEX',
    content: [
      'The <strong>Reaction Time Test</strong> measures how quickly you respond to a visual stimulus in milliseconds (ms). The average human reaction time is 200–250ms. Elite esports athletes and professional FPS gamers often achieve 150–180ms through consistent training and warm-up routines.',
      'Our test uses a randomized delay system to prevent anticipation cheating. You\'ll see multiple rounds per session, and the median score is used as your result (not the average) to reduce the impact of accidental early clicks or distractions.',
      'Reaction time is affected by sleep quality, caffeine intake, screen refresh rate, and practice. A 144Hz or 240Hz monitor can reduce perceived latency, but your actual neural response time improves only with deliberate training.',
    ],
    faqs: [
      { q: 'What is a good reaction time?', a: 'Under 200ms is excellent. 150–180ms is what top esports pros average. Below 150ms is exceptional and rare.' },
      { q: 'Can I improve my reaction time?', a: 'Yes! Regular practice, proper sleep, caffeine in moderation, and visual training exercises can shave 20–40ms off your baseline over weeks.' },
    ],
  },
  {
    to: '/aim-trainer',
    icon: '🎯',
    color: 'var(--neon-red)',
    title: 'Aim Trainer — Sharpen Your FPS Aiming Skills Online',
    badge: 'AIM',
    content: [
      'The <strong>Aim Trainer</strong> is designed for FPS gamers who want to improve their target acquisition speed, flick accuracy, and tracking ability — all without launching a full game. It\'s used as a warm-up tool by players of Valorant, CS2, Apex Legends, Overwatch 2, and Fortnite.',
      'Targets spawn at randomized positions with varying sizes and speeds. Your session stats include accuracy percentage, average time-to-click per target, targets hit vs missed, and a final score. The dynamic difficulty increases target speed as your accuracy improves.',
      '<strong>Use it as a pre-game ritual:</strong> 5 minutes on the aim trainer before a ranked session warms up your hand-eye coordination, gets your mouse sensitivity feeling natural, and puts you in a focused mental state.',
    ],
    faqs: [
      { q: 'Is browser aim training actually effective?', a: 'Yes, for warming up and building habits. While specialized software like Aimlabs offers more modes, browser-based training is proven to help with consistency and muscle memory.' },
      { q: 'What mouse sensitivity should I use for aim training?', a: 'Use the exact same sensitivity as your game. Training at a different sens will hurt, not help. Consistency is everything.' },
    ],
  },
  {
    to: '/spacebar',
    icon: '▭',
    color: 'var(--neon-cyan)',
    title: 'Spacebar Counter — Test Your Space Key Speed',
    badge: 'SPACEBAR',
    content: [
      'The <strong>Spacebar Counter</strong> tests how many times you can press the space bar within a set time limit. It\'s a deceptively simple test that reveals a lot about your finger stamina, rhythm, and keyboard actuation consistency.',
      'Spacebar clicking speed matters more than you think — in games like Jump King, Only Up, Geometry Dash, and various platformers, your space bar response time and press frequency directly impact your performance. This tool is also used by speedrunners to warm up.',
      'The test is available in 5-second, 10-second, and 30-second modes. Your score is displayed as total hits and average hits per second. Typing keyboard spacebar switches (linear vs tactile vs clicky) can produce noticeably different scores.',
    ],
    faqs: [
      { q: 'What is a good spacebar speed?', a: 'Most users hit 8–12 presses per second in a 5-second burst. Consistent 10+ presses per second is considered fast.' },
      { q: 'Does my keyboard switch type matter?', a: 'Linear switches (like Red or Silver) are fastest for rapid pressing. Clicky and tactile switches add slight resistance that can slow down your rate.' },
    ],
  },
  {
    to: '/key-visualizer',
    icon: '👁️',
    color: 'var(--neon-purple)',
    title: 'Key Visualizer — Real-Time Keyboard Input Display',
    badge: 'LIVE',
    content: [
      'The <strong>Key Visualizer</strong> displays every keystroke you make in real time on a virtual keyboard layout. Every key lights up as you press it — making it perfect for verifying your keyboard\'s N-key rollover (NKRO), identifying stuck or ghosting keys, and creating satisfying keyboard showcase clips.',
      'This tool is used by keyboard enthusiasts to test new builds, by gamers to verify that all keybinds are registering without ghosting, and by streamers who want an overlay-style display showing their inputs to viewers.',
      'It supports full keyboard layouts including TKL and full-size boards. Modifier keys (Shift, Ctrl, Alt, Win) are tracked separately. The display uses color-coded highlighting to show which keys are currently held versus recently released.',
    ],
    faqs: [
      { q: 'What is keyboard ghosting?', a: 'Ghosting is when certain key combinations fail to register because the keyboard\'s controller can\'t handle simultaneous inputs. NKRO keyboards eliminate this entirely.' },
      { q: 'Can I use this to record my typing for videos?', a: 'Yes! Use a screen recorder or OBS to capture your key visualizer session and overlay it on gaming footage or programming tutorials.' },
    ],
  },
  {
    to: '/double-click',
    icon: '🖱️',
    color: 'var(--neon-green)',
    title: 'Double Click Test — Check Your Mouse Switch for Double Clicking',
    badge: 'MOUSE',
    content: [
      'The <strong>Double Click Test</strong> measures the interval between two mouse clicks to determine if your mouse is registering clean single clicks or accidentally double-clicking. Mouse double-clicking is a hardware defect caused by worn-out switch debounce mechanisms — commonly seen in older Razer, Logitech, and SteelSeries mice.',
      'This test is critical if you\'re experiencing issues in games where a single click unexpectedly selects multiple items, fires twice, or places two blocks instead of one in Minecraft. It shows you the exact millisecond interval between registered clicks.',
      '<strong>How to read results:</strong> If your mouse registers two clicks when you physically click once, and the interval between them is under 40–50ms, your switch debounce is failing. Time to replace the switch or the mouse.',
    ],
    faqs: [
      { q: 'What causes mouse double clicking?', a: 'Worn-out Omron or Kailh switch springs lose their debounce timing. The capacitor meant to filter signal noise degrades over time and with heavy use.' },
      { q: 'Can double clicking be fixed?', a: 'Sometimes. You can replace the mouse switch (if you have soldering skills), adjust the debounce time in mouse software, or use the manufacturer\'s warranty.' },
    ],
  },
  {
    to: '/accuracy',
    icon: '📏',
    color: 'var(--neon-yellow)',
    title: 'Keyboard Accuracy Test — How Precise Is Your Typing?',
    badge: 'ACCURACY',
    content: [
      'The <strong>Keyboard Accuracy Test</strong> isolates your typing precision from your raw speed. While a typing speed test rewards both speed and accuracy together, this test presents letter sequences, word patterns, and tricky character combinations specifically designed to trigger common typos.',
      'Your accuracy score is calculated as the percentage of correct keystrokes out of total keystrokes. Results also show your most frequently mistyped key pairs — extremely useful for identifying which finger transitions are weakest on your keyboard layout.',
      'Accuracy matters more in professional settings. A programmer making frequent syntax errors, or a data entry operator mistyping figures, costs more time in corrections than the raw speed advantage gains. This test helps you identify and fix those bottlenecks specifically.',
    ],
    faqs: [
      { q: 'What typing accuracy should I aim for?', a: '95%+ is the professional standard for typists. 98%+ is excellent. 100% accuracy at moderate speed beats 95% accuracy at high speed for error-prone tasks.' },
      { q: 'How do I fix common typing errors?', a: 'Slow down on your problem key pairs and practice them in isolation. Tools like MonkeyType\'s custom word lists let you drill specific patterns.' },
    ],
  },
  {
    to: '/scroll-test',
    icon: '↕️',
    color: 'var(--neon-cyan)',
    title: 'Scroll Test — Measure Your Mouse Scroll Wheel Speed',
    badge: 'SCROLL',
    content: [
      'The <strong>Scroll Test</strong> measures how fast you can scroll with your mouse wheel and verifies that your scroll wheel is registering every tick accurately. It\'s a quick hardware verification tool and a surprisingly competitive speed challenge.',
      'Scroll speed matters for productivity workflows — navigating long documents, code files, and web pages faster reduces fatigue and cognitive load. Mice with free-spin scroll wheels (like the Logitech MX Master 3) can scroll thousands of lines per second in free-spin mode.',
      'The test records total scroll ticks per second and plots your scroll rhythm on a live graph. You can spot irregularities like missed ticks, double-tick events, or scroll wheel encoder degradation that causes inconsistent input.',
    ],
    faqs: [
      { q: 'Why does my scroll wheel skip?', a: 'Scroll wheel encoders wear out over time. Dust accumulation is the most common cause. Compressed air cleaning often fixes intermittent skipping.' },
      { q: 'What mouse has the fastest scroll wheel?', a: 'Logitech MX Master 3S and G502 X Plus have the highest-speed free-spin magnetic scroll wheels. They can scroll over 1,000 lines per second in free-spin mode.' },
    ],
  },
  {
    to: '/mouse-accuracy',
    icon: '🖲️',
    color: 'var(--neon-green)',
    title: 'Mouse Accuracy Test — Track Your Cursor Precision',
    badge: 'TRACKING',
    content: [
      'The <strong>Mouse Accuracy Test</strong> challenges you to click targets as quickly and precisely as possible. Unlike the aim trainer (which focuses on FPS-style targeting), this test measures your general mouse control — how smoothly you move from point A to point B and how often you land inside the target zone.',
      'Your results include an accuracy percentage, average deviation from target center in pixels, and a movement path visualization showing how direct or curved your cursor paths are. Overshoot, undershoot, and tremor patterns are all visible in the path data.',
      'This test is directly relevant to graphic designers, video editors, UI/UX professionals, and anyone who works with fine cursor control all day. High DPI settings cause overshooting while low DPI causes labored movements — finding your ideal DPI is something this test helps you calibrate.',
    ],
    faqs: [
      { q: 'What DPI should I use for best accuracy?', a: 'Most professional FPS players use 400–800 DPI with high in-game sensitivity. Designers often prefer 800–1200 DPI. The ideal DPI is one where you feel neither rushed nor restricted.' },
      { q: 'Does mouse pad size affect accuracy?', a: 'Absolutely. A large mouse pad lets you use lower DPI with full arm movements, which is more accurate and less fatiguing than high DPI with wrist-only movements.' },
    ],
  },
  {
    to: '/sniper-mode',
    icon: '🔭',
    color: 'var(--neon-red)',
    title: 'Sniper Mode — Train Your Micro-Flick and Precision Aim',
    badge: 'PRECISION',
    content: [
      '<strong>Sniper Mode</strong> is an extreme precision challenge that simulates long-range target acquisition in FPS games. Targets are small, move unpredictably, and require controlled micro-flick movements rather than large arm sweeps. It directly trains the fine motor control needed for AWP/sniper rifle aiming in games like CS2 and Valorant.',
      'The challenge uses a zoomed-in viewport and smaller hitboxes than the standard aim trainer, forcing you to move your mouse in tiny, deliberate increments. Every shot you fire is analyzed for overshoot distance and reaction delay.',
      'Professional snipers in esports warm up with precision drills specifically to train their hand steadiness. This mode replicates that training — helping you eliminate the "shaky crosshair syndrome" that plagues players who switch from assault rifles to sniper rifles mid-game.',
    ],
    faqs: [
      { q: 'How do I stop overshooting my targets?', a: 'Lower your mouse sensitivity and practice stopping your crosshair exactly on the target before clicking. Use a controlled exhale technique — breathe out slowly as you aim.' },
      { q: 'Is sniper aim different from regular aim?', a: 'Yes. Sniping relies on micro-adjustments and stillness, while tracking aims involve continuous movement. They use different muscle groups and require separate training.' },
    ],
  },
  {
    to: '/space-defense',
    icon: '🚀',
    color: 'var(--neon-purple)',
    title: 'Space Defense — The Ultimate Click Speed Skill Game',
    badge: 'GAME',
    content: [
      '<strong>Space Defense</strong> is an arcade-style skill game where enemy ships descend toward your base and you must click them to destroy them before they reach the bottom of the screen. It combines clicking speed, accuracy, and target prioritization into a single chaotic challenge.',
      'The game features wave-based difficulty scaling — early waves train your basic clicking rhythm, while later waves introduce fast-moving enemies, armored targets requiring multiple clicks, and cluster formations that punish inaccurate clicking. Your final score is determined by enemies destroyed, accuracy, and highest wave reached.',
      'This is the ultimate test of whether your CPS practice translates into real gaming performance. Many players who score 12+ CPS in the raw CPS test discover their effective CPS drops to 7–8 when they also need to aim accurately under pressure — exactly the gap this game trains you to close.',
    ],
    faqs: [
      { q: 'What is the best strategy for high scores?', a: 'Prioritize the fastest-moving enemies first. Click clusters from the edges inward. Never panic-click the center — it wastes clicks and misses targets.' },
      { q: 'Does Space Defense improve real game performance?', a: 'Yes. The combination of speed, accuracy, and decision-making under pressure directly maps to FPS and RTS game mechanics. Players report measurable improvement after 2 weeks of daily play.' },
    ],
  },
  {
    to: '/voyager-game',
    icon: '🌌',
    color: 'var(--neon-cyan)',
    title: 'Voyager Game — Endless Reflex & Endurance Challenge',
    badge: 'ENDLESS',
    content: [
      '<strong>Voyager Game</strong> is an endless skill-based game where you pilot a spacecraft through an increasingly dense asteroid field. Your ship\'s movement is controlled by mouse position, and your survival time determines your score. Asteroids accelerate as your score increases, creating a pure reflex and endurance test.',
      'Unlike games with a fixed ending, Voyager\'s endless format creates a flow state — the kind of effortless focus where your hands react faster than your conscious mind can process. It\'s the same psychological state that elite esports players describe during peak performance.',
      'Voyager is used by our community as a reaction time warm-up and a mental focus calibration tool. Five minutes of Voyager before a gaming session measurably improves cursor control smoothness and reaction consistency, according to user reports in our community.',
    ],
    faqs: [
      { q: 'How long can top players survive?', a: 'The current platform record is over 4 minutes 30 seconds. Most players plateau between 90–180 seconds. Consistent improvement comes from smooth mouse movements rather than fast jerky reactions.' },
      { q: 'Does Voyager Game work on mobile?', a: 'It\'s optimized for desktop mouse control. While it technically loads on mobile, touch-based control significantly changes the difficulty curve and accuracy of results.' },
    ],
  },
  {
    to: '/cps-rush',
    icon: '💥',
    color: 'var(--neon-red)',
    title: 'CPS Rush — Burst Clicking Under Extreme Time Pressure',
    badge: 'RUSH',
    content: [
      '<strong>CPS Rush</strong> is the most intense clicking challenge on the platform. You have only 1 second per round to click as fast as humanly possible — and then you get 2 seconds of rest before the next round begins. Ten rounds are played back-to-back, and your final score is the average of your top 7 rounds (3 lowest are dropped).',
      'This format simulates the burst-clicking mechanics used in games like Minecraft PvP, where you need maximum CPS for short engagements rather than sustained clicking over long periods. It rewards your peak clicking performance while filtering out warm-up inconsistency.',
      'CPS Rush sessions reveal whether your clicking technique degrades under fatigue. Players who maintain consistent CPS across all 10 rounds have more reliable technique than those whose scores drop sharply in rounds 7–10. Stamina and form are just as important as raw speed.',
    ],
    faqs: [
      { q: 'What clicking technique is best for CPS Rush?', a: 'Butterfly clicking produces the highest burst CPS (12–18 CPS) and is ideal for 1-second rounds. Jitter clicking is good for sustained speed but causes hand fatigue over 10 rounds.' },
      { q: 'Is CPS Rush different from the regular CPS test?', a: 'Yes. The regular CPS test measures sustained speed. CPS Rush measures your absolute peak burst performance under psychological time pressure — a fundamentally different skill.' },
    ],
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'cps' | 'wpm' | 'reaction'>('cps');
  const [challengeTime, setChallengeTime] = useState('00:00:00');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const tick = useCallback(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();

    if (diff <= 0) {
      setChallengeTime('00:00:00');
      return;
    }

    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    setChallengeTime(`${h}:${m}:${s}`);
  }, []);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const lbData = leaderboardData[activeTab];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', paddingBottom: '3rem' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: '5rem 1rem 4rem' }}>
        <div className="fade-in-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.3rem 1rem',
          background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)',
          borderRadius: '50px', fontSize: '0.8rem', fontWeight: '600',
          color: 'var(--neon-cyan)', marginBottom: '2rem',
          letterSpacing: '0.05em',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: 'var(--neon-green)', display: 'inline-block',
            boxShadow: '0 0 8px var(--neon-green)',
            animation: 'pulse-glow 2s infinite',
          }} />
          v2.0 — Daily Challenges Live
        </div>

        <h1 className="fade-in-up d1" style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: '900',
          lineHeight: '1.1',
          marginBottom: '1.5rem',
        }}>
          <span style={{ display: 'block', color: 'var(--text-primary)' }}>Test Train </span>
          <span style={{
            display: 'block',
            background: 'linear-gradient(135deg, var(--neon-cyan) 0%, var(--neon-green) 50%, var(--neon-cyan) 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Dominate </span>
        </h1>

        <p className="fade-in-up d2" style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '600px', margin: '0 auto 2.5rem',
          lineHeight: '1.7',
        }}>
          The ultimate free platform to test your clicking speed, typing WPM, reaction time, aim precision, and more. 14 professional tools. No signup. No downloads. Just pure performance data.
        </p>

        <div className="fade-in-up d3" style={{
          display: 'flex', justifyContent: 'center', gap: '3rem',
          flexWrap: 'wrap', marginBottom: '2.5rem',
        }}>
          {[
            { value: '247K+', label: 'Players Tested' },
            { value: '14', label: 'Free Tools' },
            { value: '4.9★', label: 'Avg Rating' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--neon-cyan)' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="fade-in-up d4" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/cps-test" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
            ⚡ Start CPS Test
          </Link>
          <Link to="/typing-test" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
            ⌨️ Typing Speed Test
          </Link>
        </div>
      </section>

      {/* ── Category Cards ───────────────────────────────────────────────── */}
      <section style={{ marginBottom: '4rem' }}>
        <div className="section-label">Tools & Games</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '0.75rem' }}>Choose Your Arena</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Precision tools and skill games. Free, instant, no signup required.</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {[
            {
              to: '/keyboard', icon: '⌨️', title: 'Keyboard Tools',
              desc: 'Test and improve your typing speed, accuracy, and keyboard mastery. From WPM records to key visualizers.',
              color: 'var(--neon-cyan)',
              pills: [
                { to: '/typing-test', label: '⌨ Typing Speed' },
                { to: '/key-visualizer', label: '👁 Key Visualizer' },
              ],
            },
            {
              to: '/mouse', icon: '🖱️', title: 'Mouse Tools',
              desc: 'Measure clicks per second, test double-click intervals, and challenge your overall mouse precision.',
              color: 'var(--neon-green)',
              pills: [
                { to: '/cps-test', label: '⚡ CPS Test' },
                { to: '/double-click', label: '🖱 Double Click' },
              ],
            },
            {
              to: '/aim', icon: '🎯', title: 'Aim & Reaction',
              desc: 'Train your reflexes, sharpen your aim, and simulate real FPS-style scenarios with moving targets.',
              color: 'var(--neon-orange)',
              pills: [
                { to: '/reaction-time', label: '⚡ Reaction Time' },
                { to: '/aim-trainer', label: '🎯 Aim Trainer' },
              ],
            },
            {
              to: '/hall-of-fame', icon: '🏆', title: 'Compete Globally',
              desc: 'Submit your scores, track your history, complete daily challenges, and climb the worldwide leaderboard.',
              color: 'var(--neon-yellow)',
              pills: [
                { to: '/hall-of-fame', label: '🏆 Hall of Fame' },
                { to: '/cps-test', label: '📅 Daily Challenge' },
              ],
            },
            {
              to: '/games', icon: '🎮', title: 'Skill Games',
              desc: 'Try our interactive games to develop your reaction time and CPS skills in a highly engaging environment.',
              color: 'var(--neon-purple)',
              pills: [
                { to: '/space-defense', label: '🚀 Space Defense' },
                { to: '/voyager-game', label: '🌌 Voyager Game' },
              ],
            },
          ].map(cat => (
            <Link
              key={cat.to}
              to={cat.to}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid var(--border)`,
                borderRadius: '16px',
                padding: '1.75rem',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                display: 'block',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = cat.color;
                el.style.transform = 'translateY(-6px)';
                el.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${cat.color}20`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--border)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: cat.color }}>{cat.title}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>{cat.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {cat.pills.map(p => (
                  <span key={p.label} style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: `${cat.color}15`,
                    color: cat.color,
                    border: `1px solid ${cat.color}30`,
                  }}>{p.label}</span>
                ))}
              </div>
              <span style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                fontSize: '1.25rem', color: cat.color, opacity: 0.6,
              }}>↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Quick Launch ─────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '4rem' }}>
        <div className="section-label">Quick Launch</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '0.75rem' }}>Jump In Instantly</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>No setup required. Click a tool and start testing in under 3 seconds.</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {tools.map(tool => (
            <Link
              key={tool.to}
              to={tool.to}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = tool.accent;
                el.style.transform = 'translateY(-3px)';
                el.style.boxShadow = `0 10px 25px rgba(0,0,0,0.3), 0 0 20px ${tool.accent}20`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--border)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '2rem' }}>{tool.icon}</span>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{tool.name}</div>
                <div style={{ fontSize: '0.75rem', color: tool.accent }}>{tool.tag}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Leaderboard + Daily Challenge ────────────────────────────────── */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
        }}>
          <div>
            <div className="section-label">Records</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>
              Hall of Fame: Benchmark Scores
            </h2>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '1rem',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(0,0,0,0.2)',
              }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--neon-yellow)' }}>
                  🏆 ALL-TIME HIGH
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {(['cps', 'wpm', 'reaction'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '0.3rem 0.7rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: activeTab === tab ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === tab ? '#000' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                      }}
                    >{tab}</button>
                  ))}
                </div>
              </div>

              {lbData.map((entry, i) => (
                <div key={entry.name} className="lb-row" style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  borderBottom: i < lbData.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{
                    width: '28px', textAlign: 'center', fontWeight: '700',
                    fontSize: '0.9rem',
                    color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-muted)',
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
                  </span>
                  <span style={{ fontSize: '1.25rem' }}>{entry.avatar}</span>
                  <span style={{ flex: 1, fontWeight: '500', fontSize: '0.9rem' }}>{entry.name}</span>
                  <span style={{ color: 'var(--neon-cyan)', fontWeight: '700', fontSize: '0.9rem' }}>{entry.score}</span>
                  <span style={{ fontSize: '1rem' }}>{entry.country}</span>
                </div>
              ))}
            </div>

            <Link to="/hall-of-fame" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              View All Records →
            </Link>
          </div>

          <div>
            <div className="section-label">Daily</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>Today's Challenge</h2>

            <div style={{
              background: 'linear-gradient(135deg, rgba(0,245,255,0.05), rgba(0,255,136,0.05))',
              border: '1px solid rgba(0,245,255,0.2)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.3rem 0.75rem',
                background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)',
                borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700',
                color: 'var(--neon-orange)', marginBottom: '1rem',
              }}>🔥 Day 47 Streak</div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Speed Demon Mode</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Achieve 10+ CPS for 5 seconds straight using only left-click. One attempt per day. Top 50 scores make the wall of fame.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {[
                  { icon: '🏅', label: 'Badge', value: 'Speed Demon' },
                  { icon: '⭐', label: 'Points', value: '+500' },
                ].map(r => (
                  <div key={r.label} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px', fontSize: '0.875rem',
                  }}>
                    <span>{r.icon}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{r.label}: </span>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '1rem',
                textAlign: 'center', marginBottom: '1.5rem',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Resets in</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums' }}>
                  {challengeTime}
                </div>
              </div>

              <Link to="/cps-test" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                ⚡ Accept Challenge
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog + Gear ──────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <div>
            <div className="section-label">Knowledge Base</div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem' }}>Improve Your Game</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {blogPosts.map(post => (
                <Link
                  key={post.title}
                  to={post.to}
                  style={{
                    display: 'flex', gap: '1rem', padding: '1.25rem', background: 'var(--bg-card)',
                    border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = post.tagColor)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{
                    width: '70px', height: '70px', flexShrink: 0,
                    background: `linear-gradient(135deg, ${post.tagColor}15, transparent)`,
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', border: `1px solid ${post.tagColor}30`
                  }}>
                    {post.emoji}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700', background: `${post.tagColor}15`, color: post.tagColor, textTransform: 'uppercase' }}>
                        {post.tag}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{post.date}</span>
                    </div>
                    <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff', marginBottom: '0.3rem', lineHeight: '1.4' }}>{post.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5', margin: 0 }}>{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <Link to="/blog" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
                Read All Articles →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gear Section ─────────────────────────────────────────────────── */}
      <section style={{
        marginBottom: '4rem',
        background: 'rgba(8,13,20,0.6)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '3rem 2rem',
      }}>
        <div className="section-label">Gear Up</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '0.75rem' }}>Top Gaming Gear Picks</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Equipment used by top performers on our leaderboard. Affiliate links help keep this platform free.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {gearItems.map(gear => (
            <a key={gear.name} href="#affiliate" className="gear-card" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>{gear.icon}</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{gear.brand}</div>
              <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem' }}>{gear.name}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5', marginBottom: '1rem' }}>{gear.desc}</p>
              <div style={{ color: 'var(--neon-green)', fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{gear.price}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>*Affiliate link — commission earned</div>
            </a>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SEO ARTICLE SECTION — All 14 Tools
      ══════════════════════════════════════════════════════════════════════ */}
      <hr style={{ borderColor: 'var(--border)', margin: '3rem 0' }} />

      <section style={{ marginBottom: '4rem' }}>
        <div className="section-label">Complete Guide</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: '800', marginBottom: '0.5rem' }}>
          Everything You Need to Know About Our Tools
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '700px' }}>
          Detailed breakdowns of every tool — what it measures, why it matters, how to improve your score, and which gear actually helps.
        </p>

        {/* Tool Navigation Pills */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem',
        }}>
          {seoArticles.map(a => (
            <button
              key={a.to}
              onClick={() => {
                const el = document.getElementById(`seo-${a.to.replace('/', '')}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '50px',
                border: `1px solid ${a.color}40`,
                background: `${a.color}10`,
                color: a.color,
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = `${a.color}25`;
                (e.currentTarget as HTMLButtonElement).style.borderColor = a.color;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = `${a.color}10`;
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${a.color}40`;
              }}
            >
              {a.icon} {a.badge}
            </button>
          ))}
        </div>

        {/* Article Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {seoArticles.map(article => {
            const isExpanded = expandedArticle === article.to;
            return (
              <article
                key={article.to}
                id={`seo-${article.to.replace('/', '')}`}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${isExpanded ? article.color : 'var(--border)'}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'border-color 0.3s ease',
                  scrollMarginTop: '80px',
                }}
              >
                {/* Article Header — always visible, clickable to expand */}
                <button
                  onClick={() => setExpandedArticle(isExpanded ? null : article.to)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '1.5rem 1.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    textAlign: 'left',
                  }}
                >
                  {/* Icon bubble */}
                  <div style={{
                    width: '52px', height: '52px', flexShrink: 0,
                    background: `${article.color}15`,
                    border: `1px solid ${article.color}30`,
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>
                    {article.icon}
                  </div>

                  {/* Title + badge */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.15rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        background: `${article.color}20`,
                        color: article.color,
                      }}>{article.badge}</span>
                    </div>
                    <h3 style={{
                      color: 'var(--text-primary)',
                      fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                      fontWeight: '700',
                      margin: 0,
                      lineHeight: '1.35',
                    }}>
                      {article.title}
                    </h3>
                  </div>

                  {/* Expand indicator */}
                  <div style={{
                    width: '32px', height: '32px', flexShrink: 0,
                    border: `1px solid ${article.color}40`,
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: article.color,
                    fontSize: '1rem',
                    transition: 'transform 0.3s ease',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>
                    ▾
                  </div>
                </button>

                {/* Expandable body */}
                {isExpanded && (
                  <div style={{
                    padding: '0 1.75rem 1.75rem',
                    borderTop: `1px solid ${article.color}20`,
                  }}>
                    {/* Main content paragraphs */}
                    <div style={{ marginBottom: '1.75rem', paddingTop: '1.25rem' }}>
                      {article.content.map((para, i) => (
                        <p
                          key={i}
                          style={{
                            color: 'var(--text-secondary)',
                            lineHeight: '1.8',
                            fontSize: '0.95rem',
                            marginBottom: i < article.content.length - 1 ? '1rem' : '0',
                          }}
                          dangerouslySetInnerHTML={{ __html: para }}
                        />
                      ))}
                    </div>

                    {/* FAQ */}
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${article.color}20`,
                      borderRadius: '12px',
                      padding: '1.25rem',
                      marginBottom: '1.5rem',
                    }}>
                      <h4 style={{
                        color: article.color,
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '1rem',
                        marginTop: 0,
                      }}>
                        ❓ Frequently Asked Questions
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {article.faqs.map((faq, fi) => (
                          <div key={fi}>
                            <div style={{
                              color: 'var(--text-primary)',
                              fontWeight: '600',
                              fontSize: '0.9rem',
                              marginBottom: '0.3rem',
                            }}>
                              Q: {faq.q}
                            </div>
                            <div style={{
                              color: 'var(--text-secondary)',
                              fontSize: '0.875rem',
                              lineHeight: '1.65',
                              paddingLeft: '0.75rem',
                              borderLeft: `2px solid ${article.color}40`,
                            }}>
                              {faq.a}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      to={article.to}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1.4rem',
                        background: `${article.color}15`,
                        border: `1px solid ${article.color}50`,
                        borderRadius: '8px',
                        color: article.color,
                        fontWeight: '700',
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = `${article.color}25`;
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = article.color;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = `${article.color}15`;
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = `${article.color}50`;
                      }}
                    >
                      {article.icon} Launch {article.badge} Tool →
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

    </div>
  );
}
