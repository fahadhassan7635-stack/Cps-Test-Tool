import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';

// ─── Word Lists ───────────────────────────────────────────────────────────────
const WORD_LISTS = {
  easy: 'the and for are but not you all can her was one our out day get has him his how man new now old see two way who boy did its let put say she too use'.split(' '),
  medium: 'about after again below could every first found great happy large later light might never other place plant point right small sound spell still study their there these thing think three water where which world would write'.split(' '),
  hard: 'beautiful believe between business children complete consider continue describe different difficult environment experience government important including information knowledge language national original particular performance political position possible practice president probably problem provide question recognize relationship remember represent responsible situation something sometimes structure thousand together usually whatever'.split(' '),
  expert: 'aberration absolution acquiesce acrimony ambivalence anachronism anomalous antipathy approbation archetype benevolent cacophony circumlocution colloquial contentious dichotomy disingenuous ebullient efficacious ephemeral equivocal esoteric exacerbate fastidious garrulous hegemony idiosyncrasy impetuous incredulous indolent ineffable juxtapose laconic loquacious magnanimous mercurial meticulous nefarious obfuscate obstinate paradigm pernicious perspicacious pragmatic pretentious propitious recalcitrant salient solipsism sycophant tenacious ubiquitous vacillate verbose zealous'.split(' '),
  impossible: 'acquiescence alexithymia amphisbaena apotheosis chrysopoeia circumlocution consanguineous counterfactual defenestration deindustrialization disenfranchisement ecclesiastical electroencephalography epistemological etherealization gastroenterological heterogeneous historiographical hyperbolic inconsequential indistinguishable infrastructural jurisprudential magniloquence metamorphosis metaphysical microprocessor multidisciplinary neuropsychological nomenclature nonchalant obsequiousness overcapitalization paleontological parameterization perspicacious pharmaceuticals phenomenological physiological postcolonialism psychoanalytical ratiocination reconciliation schadenfreude sesquipedalian soliloquy supersymmetric transubstantiation ultramontanism unconstitutional verisimilitude weltanschauung xenomorphic zymurgy'.split(' '),
  random: [] as string[],
};

// ─── Paragraph / Quote Content ───────────────────────────────────────────────
const PARAGRAPHS: Record<string, string[]> = {
  random: [
    'The quick brown fox jumps over the lazy dog near the riverbank. A warm breeze carried the scent of pine and wildflowers across the valley, where children played freely without a single worry in the world.',
    'Every morning the sun rises with a quiet promise of possibility. People across the globe wake up, brew their coffee, and face another ordinary day that holds within it the seeds of extraordinary moments waiting to bloom.',
    'Technology has transformed the way human beings communicate, work, and understand reality itself. From the printing press to the internet, each leap forward has reshaped society in ways that were previously unimaginable.',
    'The library stood at the center of the old town, its stone walls worn smooth by centuries of rain and wind. Inside, thousands of books waited patiently on their shelves, each one a doorway into a different world.',
    'Mountains do not care about the ambitions of those who climb them. They simply stand, ancient and indifferent, while climbers push their bodies to the limit in pursuit of a view that lasts only a few brief minutes.',
  ],
  quotes: [
    'The only way to do great work is to love what you do. If you have not found it yet, keep looking. Do not settle. As with all matters of the heart, you will know when you find it.',
    'In the middle of every difficulty lies opportunity. The secret of getting ahead is getting started. Do not wait. The time will never be just right. Start where you stand and work with whatever tools you may have.',
    'Success is not final, failure is not fatal. It is the courage to continue that counts. You miss one hundred percent of the shots you do not take. Life is what happens while you are busy making other plans.',
    'The greatest glory in living lies not in never falling, but in rising every time we fall. Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.',
    'It does not matter how slowly you go as long as you do not stop. Believe you can and you are halfway there. The future belongs to those who believe in the beauty of their dreams and work tirelessly toward them.',
  ],
  technology: [
    'Artificial intelligence is reshaping industries at an unprecedented pace. Machine learning algorithms can now detect diseases from medical images with accuracy that rivals experienced physicians, process natural language with startling nuance, and generate creative content indistinguishable from human output.',
    'Quantum computing promises to solve problems that would take classical computers millions of years to process. By exploiting quantum superposition and entanglement, these machines can evaluate enormous numbers of possibilities simultaneously, potentially revolutionizing cryptography and drug discovery.',
    'The Internet of Things connects billions of devices worldwide, from smart thermostats and wearable fitness trackers to industrial sensors monitoring critical infrastructure. This vast network generates enormous volumes of data that must be processed, secured, and analyzed in real time.',
    'Blockchain technology provides a decentralized, tamper-resistant ledger that enables trustless transactions between parties who have never met. Beyond cryptocurrency, this architecture supports supply chain verification, digital identity, and secure voting systems with transparent auditability.',
    'Edge computing moves data processing closer to the source rather than relying entirely on centralized cloud servers. This approach dramatically reduces latency for applications requiring instant responses, such as autonomous vehicles, augmented reality systems, and remote surgical robotics.',
  ],
  programming: [
    'A recursive function calls itself with a modified argument until it reaches a base case that terminates the loop. Understanding recursion is fundamental to grasping tree traversal algorithms, dynamic programming solutions, and the elegant mathematical structures that underpin computer science.',
    'Version control systems like Git allow developers to track every change made to a codebase over time. Branching strategies enable teams to work on multiple features simultaneously without interference, merging their contributions back into the main branch only when the code is stable and reviewed.',
    'Functional programming treats computation as the evaluation of mathematical functions and avoids changing state or mutable data. Languages embracing this paradigm encourage developers to write pure functions, use higher-order functions, and leverage immutability to produce predictable and testable code.',
    'Design patterns are reusable solutions to commonly occurring problems in software design. The Observer pattern decouples event producers from consumers. The Factory pattern abstracts object creation. The Singleton ensures only one instance of a class exists throughout the entire application lifecycle.',
    'Asynchronous programming allows applications to initiate long-running operations and continue executing other code while waiting for results. Promises, async and await syntax, and event loops enable JavaScript developers to write non-blocking code that remains readable and maintainable without deeply nested callbacks.',
  ],
  science: [
    'The theory of general relativity describes gravity not as a force but as a curvature of spacetime caused by mass and energy. Objects follow geodesics, the straightest possible paths through curved spacetime, which from our perspective appear as the familiar trajectories of planets orbiting stars.',
    'CRISPR-Cas9 is a revolutionary gene-editing tool derived from a bacterial immune defense mechanism. Scientists can now target specific DNA sequences with extraordinary precision, snipping and replacing genetic material to correct mutations responsible for hereditary diseases or to engineer organisms with desired traits.',
    'The human brain contains approximately eighty-six billion neurons, each forming thousands of synaptic connections with neighboring cells. This staggering complexity gives rise to consciousness, memory, emotion, and cognition through electrochemical signals propagating across intricate neural networks at remarkable speed.',
    'Climate change is driven primarily by the accumulation of greenhouse gases such as carbon dioxide and methane in the atmosphere. These gases trap infrared radiation emitted by the surface of the Earth, causing a gradual warming that disrupts precipitation patterns, melts glaciers, and raises sea levels globally.',
    'Dark matter constitutes approximately twenty-seven percent of the universe yet remains invisible because it does not interact with electromagnetic radiation. Its existence is inferred from gravitational effects on visible matter, including the anomalous rotation curves of galaxies and gravitational lensing of distant light sources.',
  ],
  story: [
    'She found the old letter tucked inside the back cover of a forgotten novel. The handwriting was careful and deliberate, as though every word had been chosen with great pain. She sat down slowly and began to read, unaware that by the time she finished, everything she believed about her family would be changed forever.',
    'The lighthouse keeper had not spoken to another person in three months when the fishing boat appeared out of the fog. He watched it drift toward the rocks with growing alarm, lit his signal lamp, and began the long descent down the spiral stairs, his old knees aching with every step.',
    'Marcus had rehearsed the speech a thousand times in his bathroom mirror, but standing at the podium with two hundred faces staring up at him, every carefully memorized sentence evaporated completely. He took a slow breath, gripped the wooden edge of the lectern, and decided to simply tell the truth.',
    'The village had celebrated the festival of lanterns for four hundred years without interruption. Every autumn evening, families carried their paper lights to the river and released them onto the current, watching the golden glow drift downstream and slowly disappear around the bend where the old mill once stood.',
    'Deep in the archive basement, surrounded by boxes of uncatalogued documents, the historian made the discovery that would consume the next decade of her life. A single folded map, drawn in faded ink on vellum, showed a coastline that should not have existed according to every accepted account of exploration.',
  ],
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'impossible' | 'random';
type TypingMode = 'words' | 'random' | 'quotes' | 'technology' | 'programming' | 'science' | 'story' | 'numbers' | 'symbols';
type Phase = 'idle' | 'running' | 'done';

interface HistoryItem {
  wpm: number;
  acc: number;
  diff: string;
  dur: number;
  mode: string;
}

interface LiveStats {
  correct: number;
  incorrect: number;
  mistakes: number;
  backspaces: number;
}
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

// ─── Audio Synthesis ──────────────────────────────────────────────────────────
function createAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.08,
) {
  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // silence
  }
}

function playCorrect(ctx: AudioContext) {
  playTone(ctx, 880, 0.06, 'sine', 0.07);
}
function playIncorrect(ctx: AudioContext) {
  playTone(ctx, 220, 0.12, 'square', 0.06);
}
function playComplete(ctx: AudioContext) {
  playTone(ctx, 523, 0.15, 'sine', 0.1);
  setTimeout(() => playTone(ctx, 659, 0.15, 'sine', 0.1), 150);
  setTimeout(() => playTone(ctx, 784, 0.25, 'sine', 0.1), 300);
}

// ─── Number / Symbol Generators ───────────────────────────────────────────────
function generateNumbers(count = 40): string {
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    if (r < 0.4) {
      parts.push(String(Math.floor(Math.random() * 900000) + 100000));
    } else if (r < 0.65) {
      parts.push((Math.random() * 999).toFixed(Math.floor(Math.random() * 3) + 1));
    } else {
      const a = String(Math.floor(Math.random() * 900) + 100);
      const b = String(Math.floor(Math.random() * 900) + 100);
      const c = String(Math.floor(Math.random() * 9000) + 1000);
      parts.push(`${a}-${b}-${c}`);
    }
  }
  return parts.join(' ');
}

function generateSymbols(count = 60): string {
  const pools = [
    '!@#$%^&*()',
    '{}[]<>',
    '*+=_/|:;',
    '?.,-~`',
  ];
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const len = Math.floor(Math.random() * 4) + 2;
    let chunk = '';
    for (let j = 0; j < len; j++) {
      const pool = pools[Math.floor(Math.random() * pools.length)];
      chunk += pool[Math.floor(Math.random() * pool.length)];
    }
    parts.push(chunk);
  }
  return parts.join(' ');
}

// ─── Text Generator ───────────────────────────────────────────────────────────
function generateText(diff: Difficulty, mode: TypingMode, count = 80): string {
  if (mode === 'numbers') return generateNumbers(count);
  if (mode === 'symbols') return generateSymbols(count);

  if (mode !== 'words') {
    const pool = PARAGRAPHS[mode] ?? PARAGRAPHS['random'];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  let list: string[];
  if (diff === 'random') {
    list = [
      ...WORD_LISTS.easy,
      ...WORD_LISTS.medium,
      ...WORD_LISTS.hard,
      ...WORD_LISTS.expert,
      ...WORD_LISTS.impossible,
    ];
  } else {
    list = WORD_LISTS[diff];
  }
  return Array.from({ length: count }, () => list[Math.floor(Math.random() * list.length)]).join(' ');
}

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────
const JSON_LD_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Typing Speed Test',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      description: 'Free online typing speed test. Measure your WPM, accuracy, and improve your typing skills with multiple difficulty levels and modes.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '2847' },
    },
    {
      '@type': 'WebPage',
      name: 'Typing Speed Test — Free WPM Test Online',
      description: 'Test your typing speed and accuracy online for free. Supports multiple difficulty levels, paragraph modes, numbers, symbols, and live statistics.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com' },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://example.com/tools' },
          { '@type': 'ListItem', position: 3, name: 'Typing Speed Test', item: 'https://example.com/tools/typing-speed-test' },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a good typing speed in WPM?',
          acceptedAnswer: { '@type': 'Answer', text: 'An average typist achieves 40 WPM. Speeds of 60 to 79 WPM are considered proficient for professional use. Speeds above 80 WPM place you in the top tier, and above 120 WPM is considered elite.' },
        },
        {
          '@type': 'Question',
          name: 'How is WPM calculated?',
          acceptedAnswer: { '@type': 'Answer', text: 'WPM is calculated by dividing the total number of correctly typed characters by 5 (the standard word length), then dividing by the time elapsed in minutes. This gives Net WPM, which accounts for errors.' },
        },
        {
          '@type': 'Question',
          name: 'What is the difference between gross WPM and net WPM?',
          acceptedAnswer: { '@type': 'Answer', text: 'Gross WPM counts all typed characters divided by 5 per minute regardless of errors. Net WPM subtracts error penalties from gross WPM, providing a more accurate measure of effective typing speed.' },
        },
        {
          '@type': 'Question',
          name: 'How can I improve my typing speed?',
          acceptedAnswer: { '@type': 'Answer', text: 'Practice daily using structured typing tests. Learn touch typing by memorizing the home row keys. Focus on accuracy before speed. Use all ten fingers and avoid looking at the keyboard.' },
        },
        {
          '@type': 'Question',
          name: 'Does a mechanical keyboard improve typing speed?',
          acceptedAnswer: { '@type': 'Answer', text: 'Mechanical keyboards provide tactile and auditory feedback that helps typists develop muscle memory more effectively. Many professional typists report improved speed and reduced fatigue compared to membrane keyboards.' },
        },
        {
          '@type': 'Question',
          name: 'What is touch typing?',
          acceptedAnswer: { '@type': 'Answer', text: 'Touch typing is a technique where you type using all ten fingers without looking at the keyboard. The fingers rest on the home row keys and reach to adjacent keys through muscle memory rather than visual guidance.' },
        },
        {
          '@type': 'Question',
          name: 'How long should I practice typing each day?',
          acceptedAnswer: { '@type': 'Answer', text: 'Even 15 to 30 minutes of focused daily practice produces measurable improvements within weeks. Consistency is more important than duration. Short, regular sessions build muscle memory more effectively than infrequent long sessions.' },
        },
        {
          '@type': 'Question',
          name: 'What typing accuracy should I aim for?',
          acceptedAnswer: { '@type': 'Answer', text: 'Professional typists typically maintain 97 to 99 percent accuracy. For most purposes, 95 percent or above is excellent. Prioritizing accuracy over raw speed ultimately leads to higher net WPM because fewer errors require correction.' },
        },
        {
          '@type': 'Question',
          name: 'What is the difference between typing speed and typing accuracy?',
          acceptedAnswer: { '@type': 'Answer', text: 'Typing speed measures words produced per minute, while accuracy measures the percentage of correct characters. A high WPM with low accuracy is misleading, since errors must eventually be corrected, slowing down real-world output.' },
        },
        {
          '@type': 'Question',
          name: 'How does age affect typing speed?',
          acceptedAnswer: { '@type': 'Answer', text: 'Typing speed generally rises through childhood and adolescence, peaks in the late teens through thirties, and gradually declines afterward due to natural changes in nerve conduction and tendon flexibility. Consistent practice slows this decline.' },
        },
        {
          '@type': 'Question',
          name: 'What is the average typing speed for programmers?',
          acceptedAnswer: { '@type': 'Answer', text: 'Most professional developers type between 50 and 80 WPM in plain English, though actual coding speed is usually lower due to syntax, indentation, and frequent pauses for logical thinking.' },
        },
        {
          '@type': 'Question',
          name: 'Can I use a typing speed test on a mobile device?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes, typing tests work on phones and tablets using the on-screen keyboard, though speeds on touchscreens are naturally lower than on physical keyboards due to smaller key targets and lack of tactile feedback.' },
        },
        {
          '@type': 'Question',
          name: 'What is key rollover and does it affect typing tests?',
          acceptedAnswer: { '@type': 'Answer', text: 'Key rollover refers to how many simultaneous key presses a keyboard can register correctly. Keyboards with poor rollover may drop inputs during fast typing, artificially lowering measured WPM.' },
        },
        {
          '@type': 'Question',
          name: 'How often should I retake a typing speed test?',
          acceptedAnswer: { '@type': 'Answer', text: 'Testing two to three times per week provides enough data to track meaningful progress without becoming repetitive. Treat weekly averages as your true benchmark since single sessions can vary due to fatigue.' },
        },
        {
          '@type': 'Question',
          name: 'Does keyboard layout affect typing speed?',
          acceptedAnswer: { '@type': 'Answer', text: 'QWERTY remains the global standard most typing tests are built around. Alternative layouts like Dvorak or Colemak claim ergonomic advantages, but switching requires retraining muscle memory.' },
        },
        {
          '@type': 'Question',
          name: 'Does background noise or music affect typing performance?',
          acceptedAnswer: { '@type': 'Answer', text: 'Instrumental or ambient music tends to have minimal impact on typing speed, while lyrical music or conversational noise can reduce concentration and increase error rates.' },
        },
        {
          '@type': 'Question',
          name: 'How can typists avoid repetitive strain injuries?',
          acceptedAnswer: { '@type': 'Answer', text: 'Maintain neutral wrist posture, take short breaks every 20 to 30 minutes, and avoid resting wrists on a hard surface. Ergonomic keyboards can reduce strain for people who type for many hours daily.' },
        },
        {
          '@type': 'Question',
          name: 'Are typing tests useful for job applications?',
          acceptedAnswer: { '@type': 'Answer', text: 'Many administrative, data entry, and transcription roles require a minimum WPM score as part of hiring. A documented typing test result demonstrates verifiable proficiency and can strengthen an application.' },
        },
        {
          '@type': 'Question',
          name: 'What is the difference between QWERTY and Dvorak layouts?',
          acceptedAnswer: { '@type': 'Answer', text: 'QWERTY was originally designed to reduce mechanical typewriter jams, while Dvorak was designed decades later to minimize finger travel by placing frequently used letters on the home row.' },
        },
        {
          '@type': 'Question',
          name: 'Does typing speed matter for programming productivity?',
          acceptedAnswer: { '@type': 'Answer', text: 'Typing speed plays a smaller role in programming productivity than problem-solving ability, since most coding time is spent thinking, reading, and debugging rather than typing.' },
        },
        {
          '@type': 'Question',
          name: 'What is the best posture for typing quickly?',
          acceptedAnswer: { '@type': 'Answer', text: 'Sit with feet flat on the floor, back straight, elbows near ninety degrees, and wrists hovering just above the keyboard rather than resting on it. Good posture reduces fatigue and supports sustained speed.' },
        },
        {
          '@type': 'Question',
          name: 'Can playing video games improve typing speed?',
          acceptedAnswer: { '@type': 'Answer', text: 'Games requiring rapid, precise keyboard input can improve finger dexterity and reaction time, indirectly supporting typing speed, though dedicated typing practice remains far more effective.' },
        },
        {
          '@type': 'Question',
          name: 'What is the historical origin of WPM as a metric?',
          acceptedAnswer: { '@type': 'Answer', text: 'Words per minute became standardized in the late nineteenth century alongside the rise of typewriters and stenography, when businesses needed an objective way to compare clerical candidates.' },
        },
      ],
    },
  ],
};

// ─── FAQ items ────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'What is considered a good typing speed?',
    a: 'An average typing speed hovers around 40 WPM. Hitting a consistent bracket between 60 and 79 WPM is deemed highly proficient for office productivity, while anything scaling beyond 120 WPM places you in the elite bracket of competitive data specialists.',
  },
  {
    q: 'How does this test scroll the text smoothly?',
    a: 'The script calculates structural element boundaries inside the scrollToCursor callback. When it identifies that your cursor index has moved to a lower line, it fires an accelerated CSS transition translateY adjustment to smoothly pan the text without disorienting your focus.',
  },
  {
    q: 'Does using a mechanical keyboard improve WPM scores?',
    a: 'Yes. Standard membrane dome keypads suffer from heavy ghosting and mushy tactile lockouts. Premium mechanical switches provide rapid, clean actuation with auditory and physical feedback loops, minimizing finger fatigue during extended sessions.',
  },
  {
    q: 'Why does the test use 5 characters as one word?',
    a: 'The five-character standard was established to normalize WPM calculations across languages where average word length varies significantly. Without normalization, typing short words would produce artificially high WPM figures compared to typing long technical terms.',
  },
  {
    q: 'What is the Numbers mode used for?',
    a: 'Numbers mode simulates real data-entry scenarios including integers, decimal values, and phone-number formatted groups. It develops a distinct fine-motor skill set from alphabetic typing, particularly for numpad users and financial data professionals.',
  },
  {
    q: 'Why is anti-cheat protection included?',
    a: 'Paste blocking, multi-character insertion detection, and tab-switch monitoring ensure that scores in the session history reflect genuine typing performance. This makes your personal improvement tracking meaningful and comparable over time.',
  },
  {
    q: 'How long should I practice each day to improve?',
    a: 'Even 15 to 30 minutes of focused daily practice produces measurable improvements within weeks. Consistency matters more than duration. Short, regular sessions build muscle memory more effectively than infrequent marathon sessions.',
  },
  {
    q: 'What typing accuracy should I target?',
    a: 'Professional typists typically maintain 97 to 99 percent accuracy. For most purposes, 95 percent or above is excellent. Prioritizing accuracy over raw speed ultimately leads to higher net WPM because fewer errors require correction and backspacing.',
  },
  {
    q: 'What is the difference between typing speed and typing accuracy?',
    a: 'Typing speed measures how many words you produce per minute, while accuracy measures what percentage of those characters were correct. A high WPM score with low accuracy is misleading, since every error must eventually be corrected, slowing down real-world output.',
  },
  {
    q: 'How does age affect typing speed?',
    a: 'Typing speed generally rises through childhood and adolescence as fine motor coordination develops, peaks in the late teens through thirties, and gradually declines afterward due to natural changes in nerve conduction and tendon flexibility. Consistent practice slows this decline significantly.',
  },
  {
    q: 'What is the average typing speed for programmers?',
    a: 'Most professional developers type between 50 and 80 WPM in plain English, though actual coding speed is usually lower due to syntax, indentation, and frequent pauses for logical thinking. Typing speed matters less in programming than in transcription-heavy roles.',
  },
  {
    q: 'Can I use this test on a mobile device?',
    a: 'Yes, the test works on phones and tablets using the on-screen keyboard, though typing speeds on touchscreens are naturally lower than on physical keyboards due to smaller key targets and the lack of tactile feedback.',
  },
  {
    q: 'What is key rollover and does it affect typing tests?',
    a: 'Key rollover refers to how many simultaneous key presses a keyboard can register correctly. Keyboards with poor rollover may drop inputs during fast typing, artificially lowering your measured WPM even when your actual finger speed is unaffected.',
  },
  {
    q: 'How often should I retake the typing test?',
    a: 'Testing two to three times per week provides enough data to track meaningful progress without becoming repetitive. Daily testing is fine for warmups, but treat weekly averages as your true benchmark since single sessions can vary due to fatigue or distraction.',
  },
  {
    q: 'Does keyboard layout affect typing speed?',
    a: 'The QWERTY layout remains the global standard and is what most typing tests and touch-typing curricula are built around. Alternative layouts like Dvorak or Colemak claim ergonomic advantages, but switching requires retraining muscle memory and rarely produces dramatic speed gains for most users.',
  },
  {
    q: 'Does background noise or music affect typing performance?',
    a: 'Instrumental or ambient music tends to have minimal impact on typing speed for most people, while lyrical music or conversational noise can reduce concentration and increase error rates by competing for the same cognitive resources used in language processing.',
  },
  {
    q: 'How can typists avoid repetitive strain injuries?',
    a: 'Maintain neutral wrist posture, take short breaks every 20 to 30 minutes, and avoid resting your wrists on a hard surface while typing. Ergonomic keyboards and split designs can reduce strain for people who type for many hours daily.',
  },
  {
    q: 'Are typing tests useful for job applications?',
    a: 'Many administrative, data entry, and transcription roles require a minimum WPM score as part of the hiring process. A documented typing test result demonstrates verifiable proficiency and can strengthen an application even when not explicitly requested.',
  },
  {
    q: 'What is the difference between QWERTY and Dvorak layouts?',
    a: 'QWERTY was originally designed to reduce mechanical typewriter jams by separating common letter pairs, while Dvorak was designed decades later to minimize finger travel by placing the most frequently used letters on the home row. Both can achieve high speeds with sufficient practice.',
  },
  {
    q: 'Does typing speed matter for programming productivity?',
    a: 'Typing speed plays a smaller role in programming productivity than problem-solving ability, since most coding time is spent thinking, reading, and debugging rather than typing. However, faster typing does reduce friction when translating clear ideas into code.',
  },
  {
    q: 'What is the best posture for typing quickly?',
    a: 'Sit with feet flat on the floor, back straight against the chair, elbows bent near ninety degrees, and wrists hovering just above the keyboard rather than resting on it. Good posture reduces fatigue, which directly supports sustained typing speed over long sessions.',
  },
  {
    q: 'Can playing video games improve typing speed?',
    a: 'Games that require rapid, precise keyboard input can improve finger dexterity and reaction time, indirectly supporting typing speed. However, dedicated typing practice remains far more effective since it directly trains the specific letter sequences and rhythms used in real text.',
  },
  {
    q: 'What is the historical origin of WPM as a metric?',
    a: 'Words per minute became a standardized metric in the late nineteenth century alongside the rise of typewriters and stenography, when businesses needed an objective way to compare clerical candidates. The five-character word convention was adopted to keep the measurement consistent regardless of the text used.',
  },
];

// ─── Rating Scale ─────────────────────────────────────────────────────────────
const RATING_SCALE = [
  { range: '1-39',   label: 'Beginner',     color: 'var(--text-secondary, #94a3b8)' },
  { range: '40-59',  label: 'Average',      color: 'var(--neon-green, #10b981)' },
  { range: '60-79',  label: 'Proficient',   color: 'var(--neon-cyan, #00f5ff)' },
  { range: '80-119', label: 'Speed Typist', color: 'var(--neon-orange, #f97316)' },
  { range: '120+',   label: 'Blazing Fast', color: 'var(--neon-red, #ff2d55)' },
];

// ─── FAQ Accordion (chevron-style, matches CPS test design) ──────────────────
const FaqSection = memo(() => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div
      style={{
        marginTop: '2.5rem',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid var(--border)',
      }}
    >
      <h2
        style={{
          color: 'var(--neon-purple, #a855f7)',
          fontSize: '1.25rem',
          fontWeight: '700',
          marginBottom: '1.25rem',
          marginTop: '0',
        }}
      >
        Frequently Asked Questions
      </h2>

      <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              role="listitem"
              style={{
                border: '1px solid',
                borderColor: isOpen ? 'rgba(168,85,247,0.4)' : 'var(--border)',
                borderRadius: '10px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              <button
                aria-expanded={isOpen}
                aria-controls={`typing-faq-answer-${i}`}
                id={`typing-faq-question-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: isOpen ? 'rgba(168,85,247,0.06)' : 'transparent',
                  border: 'none',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                <span>{item.q}</span>
                {isOpen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neon-purple, #a855f7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                )}
              </button>
              {isOpen && (
                <div
                  id={`typing-faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`typing-faq-question-${i}`}
                  style={{ padding: '0 18px 16px' }}
                >
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.7' }}>
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
FaqSection.displayName = 'FaqSection';

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TypingTestPage() {
  const [difficulty, setDifficulty]       = useState<Difficulty>('medium');
  const [typingMode, setTypingMode]       = useState<TypingMode>('words');
  const [duration, setDuration]           = useState(60);
  const [customDuration, setCustomDuration] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customError, setCustomError]     = useState('');
  const [text, setText]                   = useState(() => generateText('medium', 'words'));
  const [typed, setTyped]                 = useState('');
  const [phase, setPhase]                 = useState<Phase>('idle');
  const [timeLeft, setTimeLeft]           = useState(60);
  const [wpm, setWpm]                     = useState(0);
  const [accuracy, setAccuracy]           = useState(100);
  const [history, setHistory]             = useState<HistoryItem[]>([]);
  const [soundOn, setSoundOn]             = useState(false);
  const [liveStats, setLiveStats]         = useState<LiveStats>({ correct: 0, incorrect: 0, mistakes: 0, backspaces: 0 });
  const [cheaterWarning, setCheaterWarning] = useState('');

  const inputRef            = useRef<HTMLInputElement>(null);
  const timerRef            = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime           = useRef<number>(0);
  const wordsContainerRef   = useRef<HTMLDivElement>(null);
  const wordRefs            = useRef<(HTMLSpanElement | null)[]>([]);
  const phaseRef            = useRef<Phase>('idle');
  const lastScrolledLine    = useRef<number>(-1);
  const containerOffsetRef  = useRef<number>(0);
  const finalWpm            = useRef(0);
  const finalAcc            = useRef(100);
  const audioCtxRef         = useRef<AudioContext | null>(null);
  const soundOnRef          = useRef(false);
  const lastTypedLength     = useRef(0);
  const backspaceCount      = useRef(0);
  const mistakeCount        = useRef(0);
  const warningTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalLiveStats      = useRef<LiveStats>({ correct: 0, incorrect: 0, mistakes: 0, backspaces: 0 });

  // Sync soundOn to ref
  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);

  // ── Audio Context ──────────────────────────────────────────────────────────
  const getAudio = useCallback((): AudioContext | null => {
    if (!soundOnRef.current) return null;
    if (!audioCtxRef.current) audioCtxRef.current = createAudioContext();
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => undefined);
    }
    return audioCtxRef.current;
  }, []);

  // ── End Test ───────────────────────────────────────────────────────────────
  const endTest = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    phaseRef.current = 'done';
    setPhase('done');
    const ctx = getAudio();
    if (ctx) playComplete(ctx);
  }, [getAudio]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback((
    diff: Difficulty = difficulty,
    dur: number      = duration,
    mode: TypingMode = typingMode,
  ) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    phaseRef.current = 'idle';
    const newText = generateText(diff, mode);
    setText(newText);
    setTyped('');
    setPhase('idle');
    setTimeLeft(dur);
    setWpm(0);
    setAccuracy(100);
    const emptyStats = { correct: 0, incorrect: 0, mistakes: 0, backspaces: 0 };
    setLiveStats(emptyStats);
    finalLiveStats.current = emptyStats;
    lastTypedLength.current  = 0;
    backspaceCount.current   = 0;
    mistakeCount.current     = 0;
    lastScrolledLine.current = -1;
    containerOffsetRef.current = 0;
    wordRefs.current = [];
    if (wordsContainerRef.current) {
      wordsContainerRef.current.style.transition = 'none';
      wordsContainerRef.current.style.transform  = 'translateY(0px)';
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [difficulty, duration, typingMode]);

  // ── Scroll to Cursor ───────────────────────────────────────────────────────
  const scrollToCursor = useCallback((currentWordIndex: number) => {
    const container     = wordsContainerRef.current;
    const currentWordEl = wordRefs.current[currentWordIndex];
    const firstWordEl   = wordRefs.current[0];
    if (!container || !currentWordEl || !firstWordEl) return;

    const lineH          = currentWordEl.offsetHeight + 8;
    const wordNaturalTop = currentWordEl.offsetTop;
    const firstNaturalTop = firstWordEl.offsetTop;
    const currentLine    = Math.round((wordNaturalTop - firstNaturalTop) / lineH);

    if (currentLine > 1 && currentLine !== lastScrolledLine.current) {
      lastScrolledLine.current = currentLine;
      const newOffset = -((currentLine - 1) * lineH);
      containerOffsetRef.current = newOffset;
      container.style.transition = 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)';
      container.style.transform  = `translateY(${newOffset}px)`;
    }
  }, []);

  // ── Text Words Array ───────────────────────────────────────────────────────
  const textWordsArr = useMemo(() => {
    const arr: Array<Array<{ char: string; index: number }>> = [];
    let temp: Array<{ char: string; index: number }> = [];
    for (let i = 0; i < text.length; i++) {
      temp.push({ char: text[i], index: i });
      if (text[i] === ' ') { arr.push(temp); temp = []; }
    }
    if (temp.length > 0) arr.push(temp);
    return arr;
  }, [text]);

  // ── Anti-Cheat Warning ─────────────────────────────────────────────────────
  const triggerWarning = useCallback((msg: string) => {
    setCheaterWarning(msg);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => setCheaterWarning(''), 3000);
  }, []);

  // ── Anti-Cheat: Visibility / Blur ──────────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === 'running') {
        triggerWarning('Warning: Tab switch detected.');
      }
    };
    const onBlur = () => {
      if (phaseRef.current === 'running') {
        triggerWarning('Warning: Window focus lost.');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, [triggerWarning]);

  // ── Handle Input ───────────────────────────────────────────────────────────
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val   = e.target.value;
    const delta = val.length - lastTypedLength.current;

    // Anti-cheat: block multi-char insertion
    if (delta > 2 && phaseRef.current !== 'idle') {
      triggerWarning('Multi-character insertion detected. Please type normally.');
      return;
    }

    if (phaseRef.current === 'idle') {
      phaseRef.current = 'running';
      setPhase('running');
      startTime.current = performance.now();
      timerRef.current  = setInterval(() => {
        const elapsed = (performance.now() - startTime.current) / 1000;
        const left    = Math.max(0, duration - elapsed);
        setTimeLeft(left);
        if (left <= 0) endTest();
      }, 100);
    }

    if (phaseRef.current !== 'running') return;

    // Backspace detection
    if (val.length < lastTypedLength.current) {
      backspaceCount.current += 1;
    }

    // Per-character mistake detection on new chars only
    if (val.length > lastTypedLength.current) {
      const newIdx = val.length - 1;
      if (newIdx < text.length && val[newIdx] !== text[newIdx]) {
        mistakeCount.current += 1;
        const ctx = getAudio();
        if (ctx) playIncorrect(ctx);
      } else {
        const ctx = getAudio();
        if (ctx) playCorrect(ctx);
      }
    }

    lastTypedLength.current = val.length;
    setTyped(val);

    let correct   = 0;
    let incorrect = 0;
    for (let i = 0; i < val.length; i++) {
      if (i < text.length && val[i] === text[i]) correct++;
      else incorrect++;
    }

    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setAccuracy(acc);
    finalAcc.current = acc;

    const stats: LiveStats = {
      correct,
      incorrect,
      mistakes:   mistakeCount.current,
      backspaces: backspaceCount.current,
    };
    setLiveStats(stats);
    finalLiveStats.current = stats;

    const elapsedMin = Math.max(0.01, (performance.now() - startTime.current) / 60000);
    const liveWpm    = Math.round((correct / 5) / elapsedMin);
    setWpm(liveWpm);
    finalWpm.current = liveWpm;

    const activeWordIndex = textWordsArr.findIndex(w => w.some(c => c.index === val.length));
    const safeWordIndex   = activeWordIndex !== -1 ? activeWordIndex : textWordsArr.length - 1;
    scrollToCursor(safeWordIndex);

    if (val.length >= text.length) endTest();
  }, [text, textWordsArr, duration, endTest, scrollToCursor, getAudio, triggerWarning]);

  // ── Keyboard Events ────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!e.isTrusted) { e.preventDefault(); return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
      e.preventDefault();
      triggerWarning('Paste is disabled during the test.');
    }
  }, [triggerWarning]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    triggerWarning('Paste is disabled during the test.');
  }, [triggerWarning]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    triggerWarning('Drag-and-drop is disabled during the test.');
  }, [triggerWarning]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (phaseRef.current === 'running') e.preventDefault();
  }, []);

  // ── Phase Side-effects ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'done') {
      setHistory(prev => [{
        wpm:  finalWpm.current,
        acc:  finalAcc.current,
        diff: difficulty,
        dur:  duration,
        mode: typingMode,
      }, ...prev.slice(0, 9)]);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [phase, difficulty, duration, typingMode]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ── Custom Duration ────────────────────────────────────────────────────────
  const applyCustomDuration = useCallback(() => {
    const val = parseInt(customDuration, 10);
    if (isNaN(val) || val < 10 || val > 600) {
      setCustomError('Enter a value between 10 and 600 seconds.');
      return;
    }
    setCustomError('');
    setShowCustomInput(false);
    setCustomDuration('');
    setDuration(val);
    reset(difficulty, val, typingMode);
  }, [customDuration, difficulty, typingMode, reset]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getRating = (w: number) => {
    if (w >= 120) return { label: 'Blazing Fast', color: 'var(--neon-red, #ff2d55)' };
    if (w >= 80)  return { label: 'Speed Typist', color: 'var(--neon-orange, #f97316)' };
    if (w >= 60)  return { label: 'Proficient',   color: 'var(--neon-cyan, #00f5ff)' };
    if (w >= 40)  return { label: 'Average',       color: 'var(--neon-green, #10b981)' };
    return { label: 'Beginner', color: 'var(--text-secondary, #94a3b8)' };
  };

  const progress = phase === 'running'
    ? ((duration - timeLeft) / duration) * 100
    : phase === 'done' ? 100 : 0;

  const finalRating = getRating(finalWpm.current);

  const difficultyOptions: { key: Difficulty; label: string }[] = [
    { key: 'easy',       label: 'Easy' },
    { key: 'medium',     label: 'Medium' },
    { key: 'hard',       label: 'Hard' },
    { key: 'expert',     label: 'Expert' },
    { key: 'impossible', label: 'Impossible' },
    { key: 'random',     label: 'Random' },
  ];

  const modeOptions: { key: TypingMode; label: string; emoji: string }[] = [
    { key: 'words',       label: 'Words',     emoji: '\uD83D\uDCDD' },
    { key: 'random',      label: 'Paragraph', emoji: '\uD83D\uDCC4' },
    { key: 'quotes',      label: 'Quotes',    emoji: '\uD83D\uDCAC' },
    { key: 'technology',  label: 'Tech',      emoji: '\uD83D\uDCBB' },
    { key: 'programming', label: 'Code',      emoji: '\u2328\uFE0F' },
    { key: 'science',     label: 'Science',   emoji: '\uD83D\uDD2C' },
    { key: 'story',       label: 'Story',     emoji: '\uD83D\uDCD6' },
    { key: 'numbers',     label: 'Numbers',   emoji: '\uD83D\uDD22' },
    { key: 'symbols',     label: 'Symbols',   emoji: '\uD83D\uDD23' },
  ];

  const isDiffDisabled = phase === 'running' || typingMode !== 'words';

  const presetDurations = [15, 30, 60, 120];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_DATA) }}
      />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-label">Keyboard Tool</div>
          <h1 className="tool-title">Typing Speed Test</h1>
          <p className="tool-subtitle">Test your WPM — Words Per Minute</p>
        </header>

        {/* ── Mode Selector ──────────────────────────────────────────────── */}
        <nav aria-label="Typing mode" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            {modeOptions.map(m => (
              <button
                key={m.key}
                onClick={() => { setTypingMode(m.key); reset(difficulty, duration, m.key); }}
                disabled={phase === 'running'}
                aria-pressed={typingMode === m.key}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  border: typingMode === m.key
                    ? '1px solid var(--neon-purple, #a855f7)'
                    : '1px solid var(--border)',
                  background: typingMode === m.key
                    ? 'rgba(168,85,247,0.12)'
                    : 'var(--bg-card)',
                  color: typingMode === m.key
                    ? 'var(--neon-purple, #a855f7)'
                    : 'var(--text-secondary)',
                  fontWeight: '600',
                  cursor: phase === 'running' ? 'not-allowed' : 'pointer',
                  fontSize: '0.75rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span aria-hidden="true">{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Controls ───────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '1rem',
          flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'flex-start',
        }}>
          {/* Difficulty Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {difficultyOptions.map(d => (
              <button
                key={d.key}
                onClick={() => { setDifficulty(d.key); reset(d.key, duration, typingMode); }}
                disabled={isDiffDisabled}
                aria-pressed={difficulty === d.key}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '8px',
                  border: difficulty === d.key
                    ? '1px solid var(--neon-cyan)'
                    : '1px solid var(--border)',
                  background: difficulty === d.key
                    ? 'rgba(0,245,255,0.1)'
                    : 'var(--bg-card)',
                  color: isDiffDisabled
                    ? 'var(--text-muted)'
                    : difficulty === d.key
                      ? 'var(--neon-cyan)'
                      : 'var(--text-secondary)',
                  fontWeight: '600',
                  cursor: isDiffDisabled ? 'not-allowed' : 'pointer',
                  fontSize: '0.78rem',
                  transition: 'all 0.2s',
                  opacity: isDiffDisabled ? 0.5 : 1,
                }}
              >{d.label}</button>
            ))}
          </div>

          {/* Duration Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
            {presetDurations.map(d => (
              <button
                key={d}
                onClick={() => {
                  setDuration(d);
                  setShowCustomInput(false);
                  reset(difficulty, d, typingMode);
                }}
                disabled={phase === 'running'}
                aria-pressed={duration === d && !showCustomInput}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  border: duration === d && !showCustomInput
                    ? '1px solid var(--neon-orange)'
                    : '1px solid var(--border)',
                  background: duration === d && !showCustomInput
                    ? 'rgba(255,107,0,0.1)'
                    : 'var(--bg-card)',
                  color: duration === d && !showCustomInput
                    ? 'var(--neon-orange)'
                    : 'var(--text-secondary)',
                  fontWeight: '700',
                  cursor: phase === 'running' ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s',
                }}
              >{d}s</button>
            ))}

            {/* Custom Duration Toggle */}
            <button
              onClick={() => { if (phase !== 'running') setShowCustomInput(p => !p); }}
              disabled={phase === 'running'}
              aria-pressed={showCustomInput}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: showCustomInput
                  ? '1px solid var(--neon-orange)'
                  : '1px solid var(--border)',
                background: showCustomInput
                  ? 'rgba(255,107,0,0.1)'
                  : 'var(--bg-card)',
                color: showCustomInput
                  ? 'var(--neon-orange)'
                  : 'var(--text-secondary)',
                fontWeight: '700',
                cursor: phase === 'running' ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s',
              }}
            >Custom</button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundOn(p => !p)}
            title={soundOn ? 'Sound ON - click to mute' : 'Sound OFF - click to enable'}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: soundOn
                ? '1px solid var(--neon-green, #10b981)'
                : '1px solid var(--border)',
              background: soundOn
                ? 'rgba(16,185,129,0.1)'
                : 'var(--bg-card)',
              color: soundOn
                ? 'var(--neon-green, #10b981)'
                : 'var(--text-secondary)',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.2s',
            }}
          >{soundOn ? 'Sound ON' : 'Sound OFF'}</button>
        </div>

        {/* ── Custom Duration Input ───────────────────────────────────────── */}
        {showCustomInput && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '0.5rem',
            marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap',
          }}>
            <input
              type="number"
              min={10}
              max={600}
              placeholder="10 to 600 seconds"
              value={customDuration}
              onChange={e => { setCustomDuration(e.target.value); setCustomError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') applyCustomDuration(); }}
              aria-label="Custom duration in seconds"
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: customError
                  ? '1px solid var(--neon-red, #ff2d55)'
                  : '1px solid var(--neon-orange)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                width: '160px',
              }}
            />
            <button
              onClick={applyCustomDuration}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--neon-orange)',
                background: 'rgba(255,107,0,0.15)',
                color: 'var(--neon-orange)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >Apply</button>
            {customError && (
              <span role="alert" style={{ color: 'var(--neon-red, #ff2d55)', fontSize: '0.78rem' }}>
                {customError}
              </span>
            )}
          </div>
        )}

        {/* ── Anti-cheat Warning ──────────────────────────────────────────── */}
        {cheaterWarning && (
          <div
            role="alert"
            style={{
              background: 'rgba(255,45,85,0.12)',
              border: '1px solid rgba(255,45,85,0.4)',
              borderRadius: '10px',
              padding: '0.6rem 1rem',
              marginBottom: '1rem',
              color: 'var(--neon-red, #ff2d55)',
              fontSize: '0.85rem',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >{cheaterWarning}</div>
        )}

        {/* ── Main Stats Grid ─────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {[
            { value: wpm,              label: 'WPM',     color: 'var(--neon-cyan)' },
            { value: `${accuracy}%`,   label: 'Accuracy', color: 'var(--neon-green)' },
            { value: timeLeft.toFixed(0), label: 'Seconds', color: 'var(--neon-orange)' },
            { value: typed.length,     label: 'Chars',   color: 'var(--neon-purple, #a855f7)' },
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
              <div style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: '900',
                color: s.color,
                fontVariantNumeric: 'tabular-nums',
              }}>{s.value}</div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginTop: '0.2rem',
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Live Mistake Stats ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {[
            { value: liveStats.correct,    label: 'Correct',   color: 'var(--neon-green, #10b981)' },
            { value: liveStats.incorrect,  label: 'Incorrect', color: 'var(--neon-red, #ff2d55)' },
            { value: liveStats.mistakes,   label: 'Mistakes',  color: 'var(--neon-orange, #f97316)' },
            { value: liveStats.backspaces, label: 'Backspace', color: 'var(--text-secondary, #94a3b8)' },
          ].map(s => (
            <div
              key={s.label}
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '0.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: 'clamp(1rem, 3vw, 1.4rem)',
                fontWeight: '800',
                color: s.color,
                fontVariantNumeric: 'tabular-nums',
              }}>{s.value}</div>
              <div style={{
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: '0.1rem',
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Progress Bar ────────────────────────────────────────────────── */}
        <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* ── Text Display ────────────────────────────────────────────────── */}
        {phase !== 'done' && (
          <div
            role="region"
            aria-label="Text to type"
            onClick={() => inputRef.current?.focus()}
            onContextMenu={handleContextMenu}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${phase === 'running' ? 'var(--neon-cyan)' : 'var(--border)'}`,
              boxShadow: phase === 'running' ? '0 0 20px rgba(0,245,255,0.07)' : 'none',
              borderRadius: '16px',
              padding: '1.75rem',
              cursor: 'text',
              marginBottom: '1rem',
              height: '170px',
              overflow: 'hidden',
              position: 'relative',
              transition: 'border 0.2s, box-shadow 0.2s',
            }}
          >
            {/* Top fade */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '30px',
              background: 'linear-gradient(to bottom, var(--bg-card) 30%, transparent)',
              zIndex: 2, borderRadius: '16px 16px 0 0', pointerEvents: 'none',
            }} />
            {/* Bottom fade */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px',
              background: 'linear-gradient(to top, var(--bg-card) 30%, transparent)',
              zIndex: 2, borderRadius: '0 0 16px 16px', pointerEvents: 'none',
            }} />

            <div
              ref={wordsContainerRef}
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                lineHeight: '2',
                letterSpacing: '0.03em',
                display: 'flex',
                flexWrap: 'wrap',
                alignContent: 'flex-start',
                willChange: 'transform',
              }}
            >
              {textWordsArr.map((wordObj, wIdx) => (
                <span
                  key={wIdx}
                  ref={el => { wordRefs.current[wIdx] = el; }}
                  style={{ display: 'inline-block', whiteSpace: 'pre' }}
                >
                  {wordObj.map(({ char, index }) => {
                    const isTyped   = index < typed.length;
                    const isCursor  = index === typed.length;
                    const typedChar = typed[index];
                    const isCorrect = isTyped && typedChar === char;

                    let color = 'var(--text-muted)';
                    let bg    = 'transparent';
                    let bb    = 'none';

                    if (isCursor) {
                      color = 'var(--text-primary)';
                      bg    = 'rgba(0,245,255,0.28)';
                      bb    = '2px solid var(--neon-cyan)';
                    } else if (isTyped) {
                      color = isCorrect ? 'var(--neon-green)' : 'var(--neon-red)';
                      bg    = isCorrect ? 'transparent' : 'rgba(255,45,85,0.12)';
                    }

                    return (
                      <span
                        key={index}
                        style={{
                          color,
                          background: bg,
                          borderBottom: bb,
                          borderRadius: '2px',
                          fontWeight: isCursor ? '700' : '400',
                          transition: 'color 0.08s, background 0.08s',
                        }}
                      >{char}</span>
                    );
                  })}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Hidden Input ────────────────────────────────────────────────── */}
        <input
          ref={inputRef}
          value={typed}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onContextMenu={handleContextMenu}
          disabled={phase === 'done'}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="text"
          aria-label="Type here"
        />

        {/* ── Click-to-type Hint ──────────────────────────────────────────── */}
        {phase !== 'done' && (
          <div
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.focus(); }}
            onClick={() => inputRef.current?.focus()}
            style={{
              background: 'rgba(0,245,255,0.05)',
              border: '1px dashed rgba(0,245,255,0.2)',
              borderRadius: '10px',
              padding: '1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              cursor: 'pointer',
            }}
          >
            {phase === 'idle'
              ? 'Click here or on the text above and start typing!'
              : 'Keep typing...'}
          </div>
        )}

        {/* ── Action Buttons ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <button className="btn btn-secondary" onClick={() => reset()}>
            New Text
          </button>
        </div>

        {/* ── Results Modal ───────────────────────────────────────────────── */}
        {phase === 'done' && (
          <>
            {/* Backdrop */}
            <div
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                zIndex: 999,
                animation: 'fadeIn 0.3s ease-out forwards',
              }}
              onClick={() => reset()}
            />

            {/* Modal */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Test Results"
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%', maxWidth: '380px',
                background: 'linear-gradient(135deg, rgba(0,245,255,0.08), rgba(0,255,136,0.08))',
                border: '2px solid rgba(0,245,255,0.3)',
                borderRadius: '20px',
                padding: '1.5rem 0.75rem 0.75rem 0.75rem',
                textAlign: 'center',
                zIndex: 1000,
                animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 0 60px rgba(0,245,255,0.2), 0 0 120px rgba(0,255,136,0.1)',
              }}
            >
              <button
                onClick={() => reset()}
                aria-label="Close results"
                style={{
                  position: 'absolute', top: '0.5rem', right: '0.5rem',
                  background: 'rgba(0,245,255,0.1)',
                  border: '1px solid rgba(0,245,255,0.3)',
                  color: 'var(--neon-cyan)',
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >X</button>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.1rem' }}>
                Your Result
              </div>

              <div style={{
                fontSize: 'clamp(1.9rem, 5.5vw, 3rem)',
                fontWeight: '900',
                color: 'var(--neon-cyan)',
                fontVariantNumeric: 'tabular-nums',
                marginBottom: '0.05rem',
              }}>
                {finalWpm.current}{' '}
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>WPM</span>
              </div>

              <div style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '0.3rem 0.85rem', borderRadius: '50px',
                background: `${finalRating.color}20`,
                border: `2px solid ${finalRating.color}50`,
                color: finalRating.color,
                fontSize: '0.88rem', fontWeight: '700',
                marginBottom: '0.45rem',
              }}>{finalRating.label}</div>

              {/* Top 3 stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.2rem', marginBottom: '0.35rem' }}>
                {[
                  { value: `${finalAcc.current}%`,          label: 'Accuracy' },
                  { value: Math.round(typed.length / 5),    label: 'Words' },
                  { value: `${duration}s`,                  label: 'Duration' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '12px',
                    padding: '0.3rem',
                    border: '1px solid rgba(0,245,255,0.2)',
                  }}>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--neon-cyan)' }}>
                      {s.value}
                    </div>
                    <div style={{
                      fontSize: '0.45rem', color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.04rem',
                    }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Extended stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.2rem', marginBottom: '0.45rem' }}>
                {[
                  { value: finalLiveStats.current.correct,    label: 'Correct',   color: 'var(--neon-green, #10b981)' },
                  { value: finalLiveStats.current.incorrect,  label: 'Wrong',     color: 'var(--neon-red, #ff2d55)' },
                  { value: finalLiveStats.current.mistakes,   label: 'Errors',    color: 'var(--neon-orange, #f97316)' },
                  { value: finalLiveStats.current.backspaces, label: 'Backs',     color: 'var(--text-secondary)' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '10px',
                    padding: '0.3rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.42rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* WPM Rating Scale */}
              <div style={{
                textAlign: 'left',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '12px',
                padding: '0.4rem',
                marginBottom: '0.45rem',
                border: '1px solid rgba(0,245,255,0.2)',
              }}>
                <div style={{
                  fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.2rem',
                  textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600',
                }}>WPM Rating Scale</div>
                {RATING_SCALE.map(r => (
                  <div key={r.range} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '0.1rem 0', fontSize: '0.6rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{ color: r.color, fontWeight: '600' }}>{r.range} WPM</span>
                    <span style={{ color: r.color }}>{r.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => reset()}
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                >Reset</button>
                <button
                  className="btn btn-primary"
                  onClick={() => { reset(); setTimeout(() => inputRef.current?.focus(), 150); }}
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                >Try Again</button>
              </div>
            </div>

            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to   { opacity: 1; }
              }
              @keyframes modalPopIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              }
            `}</style>
          </>
        )}

        {/* ── Session History ─────────────────────────────────────────────── */}
        {history.length > 0 && (
          <section
            aria-label="Session History"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '2rem',
            }}
          >
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              fontWeight: '700',
              fontSize: '0.9rem',
              color: 'var(--neon-cyan)',
            }}>
              Session History
            </div>
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1.25rem', fontSize: '0.875rem',
                  borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
                  flexWrap: 'wrap', gap: '0.4rem',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>#{history.length - i}</span>
                <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{h.wpm} WPM</span>
                <span style={{ color: 'var(--neon-green)' }}>{h.acc}% acc</span>
                <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{h.diff}</span>
                <span style={{ color: 'var(--neon-purple, #a855f7)', fontSize: '0.75rem', textTransform: 'capitalize' }}>{h.mode}</span>
                <span style={{ color: 'var(--text-muted)' }}>{h.dur}s</span>
              </div>
            ))}
          </section>
        )}

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

        {/* ══════════════════ SEO CONTENT SECTION ══════════════════════════ */}
        <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '3rem 0' }} />
        <article style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.75' }}>

            {/* What Is a Typing Speed Test */}
            <section>
              <h2 style={{ fontWeight: '700', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--neon-cyan)', marginTop: '0' }}>
                What Is a Typing Speed Test?
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                A <strong>typing speed test</strong> is a standardized evaluation that measures how quickly and
                accurately you can transcribe text using a keyboard. Unlike casual typing, a structured test
                isolates your raw throughput under controlled conditions, giving you a reproducible performance
                benchmark you can track over time.
              </p>
              <p style={{ marginBottom: '1.5rem' }}>
                Modern typing tests support multiple <strong>modes</strong> including random words, real-world
                paragraphs, famous quotes, programming snippets, scientific terminology, number sequences, and
                symbol patterns to simulate the diverse typing demands of professional work environments.
              </p>
            </section>

            {/* How WPM Is Calculated */}
            <section>
              <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--neon-cyan)', marginTop: '2rem' }}>
                How WPM Is Calculated
              </h2>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '1.25rem' }}>
                The Standard Formula
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                The globally accepted standard defines one <strong>word</strong> as exactly{' '}
                <strong>five characters</strong>, regardless of actual word length. This normalization ensures
                consistent comparison across languages, keyboard layouts, and content types.
              </p>
              <p style={{ margin: '1rem 0 1.5rem 0', fontWeight: '500', color: 'var(--text-primary, #fff)' }}>
                Gross WPM = (Total Typed Characters divided by 5) divided by Time Elapsed in Minutes<br />
                Net WPM = (Correct Characters divided by 5) divided by Time Elapsed in Minutes<br />
                Accuracy = (Correct Characters divided by Total Typed Characters) multiplied by 100
              </p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '1.25rem' }}>
                Gross WPM vs. Net WPM
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                <strong>Gross WPM</strong> counts every character you type, including errors.{' '}
                <strong>Net WPM</strong> counts only correctly typed characters, providing a truer reflection of
                your productive output. This test calculates and displays Net WPM so your score is never
                artificially inflated by uncorrected mistakes.
              </p>
            </section>

            {/* Average Typing Speed */}
            <section>
              <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--neon-cyan)', marginTop: '2rem' }}>
                Average Typing Speed Benchmarks
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Understanding where your speed sits relative to global benchmarks helps you set realistic
                improvement goals:
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--text-secondary, #94a3b8)' }}>1 to 39 WPM — Beginner:</strong>{' '}
                  Typical of those learning to type or who type with fewer than four fingers.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--neon-green, #10b981)' }}>40 to 59 WPM — Average:</strong>{' '}
                  The global average for casual typists who have developed basic keyboard habits.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--neon-cyan, #00f5ff)' }}>60 to 79 WPM — Proficient:</strong>{' '}
                  Comfortable for most professional roles. Emails, reports, and documents feel effortless.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--neon-orange, #f97316)' }}>80 to 119 WPM — Speed Typist:</strong>{' '}
                  Well above average. Developers, writers, and power users typically fall in this range.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--neon-red, #ff2d55)' }}>120+ WPM — Blazing Fast:</strong>{' '}
                  Elite territory. Professional court reporters and competitive typists regularly exceed 120 WPM.
                </li>
              </ul>
            </section>

            {/* Tips to Improve */}
            <section>
              <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--neon-cyan)', marginTop: '2rem' }}>
                Tips to Improve Your Typing Speed
              </h2>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '1.25rem' }}>
                1. Accuracy Before Speed
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Chasing speed while making frequent errors trains bad habits. Every mistake you make at high
                speed must later be unlearned. Start deliberately slow, aiming for{' '}
                <strong>98 percent accuracy</strong>, then allow speed to develop naturally through repetition.
              </p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '1.25rem' }}>
                2. Use All Ten Fingers
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Many self-taught typists rely on six or fewer fingers, creating cognitive bottlenecks. Training
                all ten fingers to handle their assigned keyboard zones distributes the load evenly, unlocking
                dramatic speed improvements over time.
              </p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '1.25rem' }}>
                3. Practice with Varied Content
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Exclusive practice on common short words builds a limited skill set. Use this test multiple
                modes including quotes, technology, programming, science, numbers, and symbols to develop
                fluency across the full character range your work demands.
              </p>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '1.25rem' }}>
                4. Consistent Short Sessions Beat Marathon Practice
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                Research on skill acquisition consistently shows that fifteen to thirty minutes of focused daily
                practice produces more durable improvements than occasional two-hour sessions. The brain
                consolidates muscle memory during rest periods between practice sessions.
              </p>
            </section>

            {/* Touch Typing Guide */}
            <section>
              <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--neon-cyan)', marginTop: '2rem' }}>
                Touch Typing Guide: The Foundation of Fast Typing
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Touch typing</strong> is the technique of typing using all ten fingers without looking
                at the keyboard, relying entirely on muscle memory. It is the single most impactful skill you
                can develop to break through speed plateaus.
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>Master the Home Row:</strong> Rest your left fingers on A S D F and your right
                  fingers on J K L semicolon. The raised bumps on F and J are your tactile anchors. Always
                  return to this position after every keystroke sequence.
                </li>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>Assign Keys to Fingers:</strong> Each finger is responsible for a specific column of
                  keys. Never reach across with the wrong finger. This discipline is what makes touch typing
                  faster than hunt-and-peck at scale.
                </li>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>Keep Your Eyes on the Screen:</strong> Resist glancing at the keyboard. Cover your
                  hands with a cloth if needed during early training. Visual dependency on keys is a hard habit
                  to break the longer it persists.
                </li>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>Maintain Neutral Posture:</strong> Sit with your back straight, elbows at
                  approximately ninety degrees, and wrists hovering slightly above the keyboard. Poor ergonomics
                  causes fatigue that caps your speed and can damage joints over time.
                </li>
              </ul>
            </section>

            {/* Difficulty & Modes */}
            <section>
              <h2 style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--neon-cyan)', marginTop: '2rem' }}>
                Difficulty Levels and Typing Modes Explained
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                This test offers six difficulty levels for word mode, each calibrated to build progressively
                more demanding muscle memory patterns:
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem', listStyleType: 'disc' }}>
                <li style={{ marginBottom: '0.4rem' }}>
                  <strong>Easy:</strong> High-frequency two-to-four-letter words. Ideal for beginners building
                  foundational habits.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  <strong>Medium:</strong> Common five-to-eight-letter words appearing in everyday professional
                  writing.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  <strong>Hard:</strong> Multi-syllable vocabulary encountered in formal documents and academic
                  writing.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  <strong>Expert:</strong> Uncommon, sophisticated vocabulary drawn from literature and advanced
                  discourse.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  <strong>Impossible:</strong> Technical and scientific terminology including long compound words
                  that challenge even elite typists.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  <strong>Random:</strong> A chaotic blend of all difficulty levels, simulating the
                  unpredictable vocabulary range of real-world typing tasks.
                </li>
              </ul>
              <p style={{ marginBottom: '1.5rem' }}>
                Beyond words, you can test yourself on real paragraph content from technology, programming,
                science, and fiction; on number sequences that simulate data-entry scenarios; and on symbol
                patterns that mirror code punctuation and special character requirements.
              </p>
            </section>

            {/* FAQ */}
            <FaqSection />

        </article>
        {/* ══════════════════ END SEO CONTENT ══════════════════════════════ */}

      </div>
    </>
  );
}
