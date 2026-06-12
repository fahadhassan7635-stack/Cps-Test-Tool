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

const seoArticles = [
  {
    to: '/typing-test',
    icon: '⌨️',
    color: 'var(--neon-cyan)',
    title: 'Typing Speed Test — Find Your True WPM Without Creating an Account',
    badge: 'WPM',
    content: [
      'Want to know exactly how fast you type? Our <strong>Typing Speed Test</strong> gives you the raw numbers instantly. You\'ll see your WPM, accuracy, and exactly how many typos you made in real-time. No sign-ups or downloads needed.',
      'Let\'s talk numbers. The average person types around <strong>40 WPM</strong>. If you work in an office, you\'re probably hitting 60 WPM. But if you\'re a hardcore touch typist or a programmer, you should be pushing past <strong>90 to 100 WPM</strong>. Some competitive typists even hit 150+ WPM on short bursts.',
      'We set up different modes depending on what you want to practice. Quote mode feels like actual daily typing, while our code snippets mode will heavily test your shift-key and symbol accuracy.',
      '<strong>The secret to typing faster:</strong> Stop looking at your hands. Memorize the home row (ASDF / JKL;). Even just 10 minutes of daily practice without looking down will bump your speed by 20 WPM in a few weeks.',
    ],
    faqs: [
      { q: 'What counts as a "good" typing speed?', a: 'Anything over 65 WPM is great for daily work. If you write code or heavy documentation, aim for 80+. If you\'re currently stuck under 40 WPM, taking a week to learn proper finger placement will change your life.' },
      { q: 'Raw WPM vs. Net WPM: What\'s the difference?', a: 'Raw WPM is just how many keys you smashed. Net WPM is your actual usable speed because it subtracts your mistakes. If you type 100 words but mess up 20 of them, your Net WPM drops. Net is the only score that really matters.' },
      { q: 'Can I actually reach 100 WPM?', a: 'Absolutely. Most people plateau at 70 WPM because they use bad finger habits. If you force yourself to use all ten fingers and practice for a few months, 100 WPM is totally doable.' },
    ],
  },
  {
    to: '/cps-test',
    icon: '🖱️',
    color: 'var(--neon-green)',
    title: 'CPS Test — Check Your Clicks Per Second',
    badge: 'CPS',
    content: [
      'The <strong>CPS Test</strong> is exactly what it sounds like: a timer, a clicking box, and a tracker that tells you your exact clicks per second. It\'s the go-to benchmark for Minecraft PvP players trying to prove they aren\'t using an auto-clicker.',
      'If you just casually click using your index finger, you\'ll probably land around <strong>5 to 7 CPS</strong>. Gamers using the jitter clicking technique usually sit around <strong>11 to 14 CPS</strong>. If you butterfly click, hitting 15+ is pretty standard.',
      'We offer a few time limits, but the <strong>5-second test</strong> is the golden rule. It\'s long enough to see if you can hold your speed, but short enough that your arm doesn\'t completely gas out.',
      '<strong>A quick tip on technique:</strong> Jitter clicking is great for combat because you still have decent control over your mouse. Butterfly clicking might get you a higher score here, but good luck aiming accurately in-game while doing it.',
    ],
    faqs: [
      { q: 'How much CPS do I actually need for Minecraft?', a: 'For older combat systems (like 1.8.9), 10 CPS is the sweet spot. Going higher than 15 CPS barely registers because of the server\'s 20-tick limit anyway. Anything above that is just flexing.' },
      { q: 'Will jitter clicking hurt my hand?', a: 'It can, especially if you tense up your wrist instead of your forearm. Take breaks. If your hand starts feeling numb or tingly, stop immediately. A high score isn\'t worth RSI (Repetitive Strain Injury).' },
      { q: 'Why is my score lower on the 10-second test?', a: 'Because human muscles get tired fast. You can sprint for 2 seconds, but you can\'t sprint for 10. Longer tests show your stamina, not just your peak burst speed.' },
    ],
  },
  {
    to: '/reaction-time',
    icon: '⚡',
    color: 'var(--neon-orange)',
    title: 'Reaction Time Test — How Fast Are Your Reflexes?',
    badge: 'REFLEX',
    content: [
      'Ever wonder why you lost that sniper duel in Valorant? Your <strong>Reaction Time</strong> might be the reason. This test measures the exact millisecond gap between the screen turning green and your finger clicking the mouse.',
      'The average person sits around <strong>200ms to 250ms</strong>. Pro FPS players? They routinely hit between <strong>150ms and 170ms</strong>. Dropping below 150ms is incredibly rare and usually means you have god-tier genetics or an insanely low-latency gaming setup.',
      'We randomize the delay between 1.5 and 5 seconds so you can\'t guess when it\'s going to happen. Also, we calculate your score based on the <strong>median</strong>, not the average. This way, one accidental early click doesn\'t ruin your whole run.',
      '<strong>Want a better score?</strong> Drink some coffee, get a full night\'s sleep, and use a 144Hz (or higher) monitor. Playing on a 60Hz screen adds about 16ms of pure delay that you literally can\'t fix with practice.',
    ],
    faqs: [
      { q: 'What is a good reaction time for gaming?', a: 'If you\'re consistently under 200ms, you have a solid advantage over most casual players. But remember, pure reaction time is just one part of the puzzle. Crosshair placement and game sense usually win fights before reaction time even matters.' },
      { q: 'Can I practice to get faster reflexes?', a: 'Yes and no. You can lower your score by 10-20ms just by getting used to the test and warming up. But everyone has a biological limit based on how fast their nervous system sends signals.' },
      { q: 'Is my phone or laptop screen making me slower?', a: 'Yes. Phones, TVs, and standard office monitors have noticeable input lag. If you really want an accurate test of your body\'s speed, do this on a wired mouse with a high refresh rate gaming monitor.' },
    ],
  },
  {
    to: '/aim-trainer',
    icon: '🎯',
    color: 'var(--neon-red)',
    title: 'Browser Aim Trainer — Warm Up Before Ranked',
    badge: 'AIM',
    content: [
      'Don\'t feel like launching a bulky software just to warm up? Our <strong>Aim Trainer</strong> runs right in your browser. Just pick your target size, hit start, and get your wrist moving before you queue up for a match.',
      'We built this to focus on the big three: <strong>flicking</strong> (hitting static dots fast), <strong>tracking</strong> (keeping your crosshair on a moving target), and <strong>micro-adjustments</strong> (tiny, precise movements).',
      'The system is dynamic. If you\'re hitting 90% of your shots, the targets will start shrinking and moving faster. It constantly pushes you out of your comfort zone, which is the only way your muscle memory actually improves.',
      '<strong>Pro tip:</strong> Don\'t chase high scores. Use this for 5 to 10 minutes max just to wake up your hand-eye coordination. You\'ll notice your first game of the day feels way less clunky.',
    ],
    faqs: [
      { q: 'Does a 2D browser aim trainer actually help in 3D games?', a: 'Yes. Aiming is mostly about mouse control. Whether you\'re clicking a 2D dot or a 3D head in CS2, you\'re still training the connection between your brain, your eyes, and your hand.' },
      { q: 'What sensitivity should I use?', a: 'Whatever you use in your main game. Match your DPI and Windows mouse speed. Training on a random, super-fast sensitivity will just mess up the muscle memory you\'ve already built.' },
    ],
  },
  {
    to: '/spacebar',
    icon: '▭',
    color: 'var(--neon-cyan)',
    title: 'Spacebar Counter — Test Your Tapping Speed',
    badge: 'SPACEBAR',
    content: [
      'It sounds like a meme, but the <strong>Spacebar Counter</strong> is actually super useful. The spacebar is the biggest, most abused key on your board. Whether you\'re bunny-hopping, playing rhythm games, or just speed typing, spacebar timing is everything.',
      'If you play Geometry Dash, you know that missing a spacebar tap by a millisecond ruins a run. Speedrunners use rapid taps to abuse movement mechanics. Even in normal typing, your thumb hits space more than any other finger hits any other key.',
      'You can run 5s, 10s, or 30s tests. Watch the rhythm graph at the end—it shows if you keep a steady pace or if your thumb completely gives up halfway through the test.',
      '<strong>Keyboard tip:</strong> Linear switches (like Cherry MX Reds) are way better for this than clicky switches. Since they don\'t have a tactile bump, you can rapidly flutter your thumb without fighting the keyboard\'s resistance.',
    ],
    faqs: [
      { q: 'What is a fast spacebar speed?', a: 'Hitting 8 presses a second is pretty good. If you can maintain 11+ across a 10-second test, you either play way too much osu! or you have insane thumb stamina.' },
      { q: 'Why does my keyboard miss some of my spacebar hits?', a: 'Your keyboard might have a slow debounce delay, or the switch itself is getting mushy. Some cheaper keyboards physically can\'t register inputs as fast as you can tap.' },
    ],
  },
  {
    to: '/key-visualizer',
    icon: '👁️',
    color: 'var(--neon-purple)',
    title: 'Key Visualizer — Test Your Keyboard Ghosting & NKRO',
    badge: 'LIVE',
    content: [
      'The <strong>Key Visualizer</strong> is a live, on-screen display of exactly what your keyboard is doing. It\'s perfect for finding out if your keyboard has hardware issues, or for using as an overlay while streaming.',
      'Its best feature is testing for <strong>Ghosting (NKRO)</strong>. Cheap keyboards can only process 3 or 4 keys at a time. Mash your WASD keys, hold Shift, and hit Space. Did one of those keys not light up on our visualizer? That\'s ghosting, and it will get you killed in FPS games.',
      'Streamers love this tool. If you play rhythm games, speedruns, or fighting games, you can just add this URL as a Browser Source in OBS. Your viewers will see your exact inputs in real-time without you downloading any sketchy third-party software.',
      'The visualizer shows three states: solid color when you hold a key, a fading trail when you let go, and dark when idle. It\'s also a great way to test if your custom macros are actually firing correctly.',
    ],
    faqs: [
      { q: 'What exactly is Keyboard Ghosting?', a: 'It\'s a hardware limitation. When you press too many keys at once, the keyboard\'s circuitry gets confused and "drops" an input. Gaming keyboards advertise "N-Key Rollover" (NKRO), meaning they can register every single key pressed at the same time.' },
      { q: 'How do I make the background transparent for OBS?', a: 'Just add the URL as a Browser Source in OBS Studio. You can apply a simple custom CSS rule right inside OBS (`body { background: transparent !important; }`) to hide our website background and only show the floating keys.' },
    ],
  },
  {
    to: '/double-click',
    icon: '🖱️',
    color: 'var(--neon-green)',
    title: 'Double Click Test — Check Your Mouse for Dying Switches',
    badge: 'MOUSE',
    content: [
      'Is your mouse acting weird? Dragging files by accident or firing two shots instead of one? You probably have a failing switch. Our <strong>Double Click Test</strong> measures the exact time between your clicks to diagnose hardware defects.',
      'Here\'s what happens inside a dying mouse: the tiny metal spring in the switch gets worn out and starts "bouncing." When you click once, the metal bounces and touches the contact twice. To the computer, it looks like two insanely fast clicks.',
      'Our tool creates a live interval graph. A normal, healthy human click usually has a gap of 100ms or more. If our graph shows clicks happening with a <strong>10ms to 30ms gap</strong>, that\'s switch bounce. A human physically cannot double-click that fast.',
      '<strong>How to fix it:</strong> Check if your mouse software (like Razer Synapse or Glorious Core) has a "Debounce Time" slider. Turn it up to 12ms. If you don\'t have that option, you either need to solder a new switch into the mouse, or just buy a new one.',
    ],
    faqs: [
      { q: 'Which gaming mice are known for double-clicking?', a: 'Older Logitech mice (like the G Pro Wireless Gen 1, G305, and early G502s) were notorious for this because of the Omron 50M switches they used. Most modern top-tier mice now use optical switches, which use light beams instead of metal contacts, making double-clicking literally impossible.' },
      { q: 'Are you sure it\'s the mouse and not just my finger twitching?', a: 'Yes. If you look at the test results and see intervals under 50ms, it is 100% a hardware defect. Human fingers simply don\'t bounce that fast.' },
    ],
  },
  {
    to: '/accuracy',
    icon: '📏',
    color: 'var(--neon-yellow)',
    title: 'Keyboard Accuracy Test — Stop Making Typos',
    badge: 'ACCURACY',
    content: [
      'Speed means nothing if you have to hit backspace every three seconds. Our <strong>Keyboard Accuracy Test</strong> forces you to slow down and exposes exactly which fingers are making the most mistakes.',
      'We calculate your score simply: correct keystrokes divided by total keystrokes. But more importantly, the test tracks your error patterns. Are you constantly hitting "r" instead of "t"? This tool will map out those bad habits.',
      'We built the test phrases specifically to trip you up. You\'ll deal with tricky adjacent keys, capital letters thrown into the middle of sentences, and heavy number-row usage.',
      '<strong>Why this matters:</strong> Every time you make a mistake, fixing it costs you about 3 to 5 seconds of time and totally breaks your flow state. A typist going 80 WPM with 99% accuracy will finish a document way faster than a 110 WPM typist with 85% accuracy.',
    ],
    faqs: [
      { q: 'What is a good typing accuracy percentage?', a: 'Anything below 95% means you are wasting a ton of time correcting yourself. You should aim for 97% to 98% for everyday typing. If you write code, aim for 99%—one missed semicolon can ruin your day.' },
      { q: 'How do I stop mistyping specific keys?', a: 'Slow down. Figure out which key transition messes you up, and practice typing just those words at half speed. You have to overwrite your bad muscle memory with slow, deliberate practice.' },
    ],
  },
  {
    to: '/scroll-test',
    icon: '↕️',
    color: 'var(--neon-cyan)',
    title: 'Scroll Speed Test — Check Your Mouse Wheel',
    badge: 'SCROLL',
    content: [
      'The <strong>Scroll Test</strong> tracks how many wheel ticks you can register in a second. It\'s a fun challenge, but it\'s also an incredible diagnostic tool to see if your mouse\'s scroll encoder is dirty or breaking.',
      'If you scroll down, but the page occasionally jumps up for a split second, your scroll encoder is dying. This test graphs out every single tick. If your graph has random dips or gaps, your hardware is at fault.',
      'If you have a mouse with an "infinite scroll" unlock wheel (like the Logitech G502 or MX Master), you can hit 60 to 80 ticks per second easily. Standard notched wheels will max out around 12 ticks per second.',
    ],
    faqs: [
      { q: 'Why does my scroll wheel jump in the wrong direction?', a: 'Dust, pet hair, or just mechanical wear and tear inside the wheel encoder. Sometimes blowing hard into the wheel gaps fixes it. If not, the encoder is worn out.' },
      { q: 'Does scrolling speed actually matter for anything?', a: 'In games like CS2 or Apex Legends, players bind "Jump" or "Tap Strafe" to the scroll wheel. A consistent, tactile scroll wheel is massive for hitting movement tech perfectly.' },
    ],
  },
  {
    to: '/mouse-accuracy',
    icon: '🖲️',
    color: 'var(--neon-green)',
    title: 'Mouse Accuracy Test — Find Your Perfect DPI',
    badge: 'TRACKING',
    content: [
      'This isn\'t just about clicking a dot. The <strong>Mouse Accuracy Test</strong> tracks the exact path your cursor takes to get to the target. It\'s the absolute best way to figure out if your DPI is set too high.',
      'We give you a report based on a few things: Did you click inside the circle? How fast did you get there? And most importantly, <strong>Path Efficiency</strong>. Did you move in a perfectly straight line, or did your cursor curve wildly before landing on the target?',
      'If your path efficiency is terrible, you are over-correcting. This usually means your sensitivity is too high. You\'re over-shooting the target and having to pull back at the last millisecond.',
      '<strong>How to test your DPI:</strong> Run this test three times. Once at 400 DPI, once at 800, and once at 1600. Look at which setting gives you the straightest lines and least deviation. That is your natural sensitivity.',
    ],
    faqs: [
      { q: 'What DPI do pro players use?', a: 'Most FPS pros sit heavily at 800 DPI nowadays. 400 DPI requires massive arm movements, and anything over 1600 DPI usually picks up tiny, unwanted hand twitches.' },
      { q: 'Why is my cursor path always curved?', a: 'Because your elbow and wrist act as pivot points, creating a natural arc when you move your arm. Learning to combine wrist and arm movement to draw a straight line is the secret to god-tier aim.' },
    ],
  },
  {
    to: '/sniper-mode',
    icon: '🔭',
    color: 'var(--neon-red)',
    title: 'Sniper Mode — Train Your Micro-Flicks',
    badge: 'PRECISION',
    content: [
      'Standard aiming is fast and loose. Sniper aiming is completely different. <strong>Sniper Mode</strong> forces you to hit tiny targets with minimal movement, simulating what it feels like to hold an angle with an AWP or Operator.',
      'When you use a sniper, you pre-aim an angle, hold your mouse perfectly still, and make a tiny micro-flick when the enemy appears. We track your <strong>Crosshair Stability</strong> to see how much your hand shakes while waiting for the shot.',
      'If you have a habit of over-flicking your targets, this mode will humble you fast. A score of over 85% stability with low overshoot means your sniper mechanics are super solid.',
      '<strong>A weird trick that works:</strong> Pay attention to your breathing. Inhale, exhale halfway, and gently hold your breath while waiting for the click. It physically stops your hand from having micro-tremors.',
    ],
    faqs: [
      { q: 'How do I stop shooting past the target?', a: 'First, lower your scoped sensitivity in-game (pros often use 0.8x to 0.9x of their normal sens). Second, practice intentionally flicking past the target and smoothly pulling back, instead of trying to violently stop on a dime.' },
    ],
  },
  {
    to: '/space-defense',
    icon: '🚀',
    color: 'var(--neon-purple)',
    title: 'Space Defense — Can You Click Fast Under Pressure?',
    badge: 'GAME',
    content: [
      'Anyone can hit 12 CPS on a massive, stationary square. But can you do it while tracking multiple moving targets? <strong>Space Defense</strong> combines raw click speed with target prioritization. If three ships hit the bottom, game over.',
      'The early waves are slow and easy. By wave 8, you\'re dealing with armored targets that require multiple clicks. By wave 13, it\'s complete chaos and purely a test of how calm you can stay under pressure.',
      'We punish spamming. The game calculates an accuracy multiplier. If you just wildly click everywhere hoping to hit something, your score will tank. Deliberately clicking 7 times a second with high accuracy will always beat frantic 14 CPS spam.',
      'Players usually find out that their "in-game CPS" is way lower than their benchmark CPS. Closing the gap between those two numbers is exactly how you win chaotic close-range fights in games like Apex Legends.',
    ],
    faqs: [
      { q: 'What\'s the strategy for surviving the later waves?', a: 'Don\'t look at the cluster. Focus entirely on the ships closest to the bottom. Click a target twice, instantly snap to the next one. Smooth, deliberate movements will save you; panic shaking will get you killed.' },
    ],
  },
  {
    to: '/voyager-game',
    icon: '🌌',
    color: 'var(--neon-cyan)',
    title: 'Voyager — The Ultimate Evasion Warm-up',
    badge: 'ENDLESS',
    content: [
      '<strong>Voyager</strong> is pure flow state. You control a ship with your cursor, dodging an endless, escalating field of asteroids. No shooting, just survival. It\'s arguably the best overall neurological warm-up on the platform.',
      'At first, it\'s easy. But the density and speed ramp up infinitely. To survive past the two-minute mark, you have to stop looking at your ship and start looking at the empty spaces between the asteroids.',
      'This trains predictive tracking. You have to read where an object is going to be two seconds from now, and position your mouse accordingly. Playing this for 5 minutes before booting up a ranked match wakes up your spatial awareness instantly.',
    ],
    faqs: [
      { q: 'What is a good survival time?', a: 'If you can hit 60 seconds, you\'ve grasped the basics. Pushing past 2 minutes requires serious focus. If you break 3 minutes, you have elite mouse control.' },
      { q: 'How is this different from an Aim Trainer?', a: 'Aim trainers teach you to move your mouse *to* an object. Voyager teaches you to maneuver your mouse *around* objects smoothly. Both are critical components of total mouse control.' },
    ],
  },
  {
    to: '/cps-rush',
    icon: '💥',
    color: 'var(--neon-red)',
    title: 'CPS Rush — Pure Burst Speed',
    badge: 'RUSH',
    content: [
      'If the standard CPS test is a sprint, <strong>CPS Rush</strong> is a 1-rep max. You get 1 second to click as fast as humanly possible, followed by a 2-second break. This repeats for 10 grueling rounds.',
      'We take your top 7 rounds and drop the 3 lowest to calculate your score. Why? Because this test completely isolates your peak neuromuscular burst speed. Most players find they score 2 to 3 CPS higher here than they do on the 5-second test.',
      'Look closely at your round-by-round graph. If your score steadily drops from 14 down to 9, you are tensing your hand way too hard and burning out. If you stay consistent round after round, your clicking technique is solid and sustainable.',
    ],
    faqs: [
      { q: 'Why is burst CPS important?', a: 'Think about a shotgun fight in Fortnite or a quick melee trade in Minecraft. You don\'t need to click for 10 seconds straight; you just need absolute maximum speed for exactly 1 second. This trains that exact scenario.' },
      { q: 'How do I stop my arm from hurting during this?', a: 'Relax your wrist. If you are jitter clicking, the vibration should come from your forearm, not your hand. If it hurts, stop. Take the 2-second break seriously to reset your tension.' },
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

      {/* Hero */}
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

      {/* Category Cards */}
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

      {/* Quick Launch */}
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

      {/* Leaderboard + Daily Challenge */}
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

      {/* Gear Section */}
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

      {/* SEO Article Section */}
      <hr style={{ borderColor: 'var(--border)', margin: '3rem 0' }} />

      <section style={{ marginBottom: '4rem' }}>
        <div className="section-label">Complete Guide</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: '800', marginBottom: '0.5rem' }}>
          Everything You Need to Know About Our Tools
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '700px' }}>
          Detailed breakdowns of every tool — what it measures, why it matters, how to improve your score, and which gear actually helps.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
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

                {isExpanded && (
                  <div style={{ padding: '0 1.75rem 1.75rem', borderTop: `1px solid ${article.color}20` }}>
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
                        Frequently Asked Questions
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {article.faqs.map((faq, fi) => (
                          <div key={fi}>
                            <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
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
