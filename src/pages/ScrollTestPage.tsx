import { useState, useRef, useEffect, useCallback } from 'react';

const DURATIONS = [5, 10, 15, 30];

export default function ScrollTestPage() {
  const [scrollCount, setScrollCount] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [timeLeft, setTimeLeft] = useState(10);
  const [duration, setDuration] = useState(10);
  const [customTime, setCustomTime] = useState<string>('');
  const [upScrolls, setUpScrolls] = useState(0);
  const [downScrolls, setDownScrolls] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);
  const zoneRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef(duration);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(soundOn);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  // Lazily create (and resume) the AudioContext. Browsers require a user
  // gesture before audio can start, so we create it on first scroll/click.
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new Ctor();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Short synthesized "tick" so every scroll notch gets audible feedback.
  // Pitch is nudged slightly by direction so up/down scrolls sound distinct.
  const playTick = useCallback((dir: 'up' | 'down') => {
    if (!soundOnRef.current) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = dir === 'up' ? 920 : 640;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio isn't critical to the test — fail silently if unsupported.
    }
  }, [getAudioContext]);

  // Little celebratory chime when the test ends.
  const playFinishChime = useCallback(() => {
    if (!soundOnRef.current) return;
    try {
      const ctx = getAudioContext();
      [660, 880, 1100].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.09;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch {
      // no-op
    }
  }, [getAudioContext]);

  const getRank = (cpsValue: number) => {
    if (cpsValue >= 45) return {
      name: 'Machine',
      emoji: '🤖',
      color: 'var(--neon-red, #ff2d55)',
      stars: 5,
      desc: '"Unbelievable dynamic velocity! Your flywheel rotations operate at cybernetic levels. Pure hardware mastery!"'
    };
    if (cpsValue >= 35) return {
      name: 'Cheetah',
      emoji: '🐆',
      color: 'var(--neon-orange, #f97316)',
      stars: 4,
      desc: '"Blistering performance! Your continuous finger strokes cut through the scrolling matrix with relentless raw speed."'
    };
    if (cpsValue >= 25) return {
      name: 'Fox',
      emoji: '🦊',
      color: 'var(--neon-cyan, #00f5ff)',
      stars: 3,
      desc: '"Sharp, tactical, and incredibly responsive. Excellent finger flick mechanics and scroll wheel coordination."'
    };
    if (cpsValue >= 15) return {
      name: 'Turtle',
      emoji: '🐢',
      color: 'var(--neon-green, #10b981)',
      stars: 2,
      desc: '"Steady execution, but you are playing it safe. Try looser grip styles to unlock your real mechanical threshold!"'
    };
    return {
      name: 'Snail',
      emoji: '🐌',
      color: 'var(--text-secondary, #94a3b8)',
      stars: 1,
      desc: '"Very passive crawl rhythm. Shake out your hand, align your index finger, and apply faster burst ticks!"'
    };
  };

  const endTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase('done');
    playFinishChime();
  }, [playFinishChime]);

  const start = () => {
    setPhase('running');
    setScrollCount(0);
    setUpScrolls(0);
    setDownScrolls(0);
    getAudioContext(); // unlock audio on the user gesture that starts the test

    const currentDur = durationRef.current;
    setTimeLeft(currentDur);
    startTime.current = performance.now();

    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      const left = Math.max(0, currentDur - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        endTest();
      }
    }, 50);
    zoneRef.current?.focus();
  };

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('idle');
    setScrollCount(0);
    setUpScrolls(0);
    setDownScrolls(0);
    setTimeLeft(durationRef.current);
  }, []);

  const handleCustomTimeSet = () => {
    const time = parseInt(customTime);
    if (time > 0) {
      setDuration(time);
      durationRef.current = time;
      resetGame();
      setTimeLeft(time);
    }
  };

  useEffect(() => {
    const handleNativeWheel = (e: WheelEvent) => {
      if (phase === 'running') {
        e.preventDefault();

        const dir = e.deltaY > 0 ? 'down' : 'up';
        setDirection(dir);
        setScrollCount(prev => prev + 1);
        if (dir === 'up') setUpScrolls(prev => prev + 1);
        else setDownScrolls(prev => prev + 1);
        playTick(dir);

        const t = setTimeout(() => setDirection(null), 300);
        return () => clearTimeout(t);
      }
    };

    const zoneElement = zoneRef.current;
    if (zoneElement) {
      zoneElement.addEventListener('wheel', handleNativeWheel, { passive: false });
    }

    return () => {
      if (zoneElement) {
        zoneElement.removeEventListener('wheel', handleNativeWheel);
      }
    };
  }, [phase, playTick]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    document.body.style.overflow = phase === 'done' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  useEffect(() => () => { audioCtxRef.current?.close(); }, []);

  const liveCps = phase === 'running' && (duration - timeLeft) > 0
    ? (scrollCount / (duration - timeLeft)).toFixed(1)
    : '0.0';

  const finalCps = duration > 0 ? (scrollCount / duration).toFixed(2) : '0.00';
  const progress = phase === 'running' ? ((duration - timeLeft) / duration) * 100 : phase === 'done' ? 100 : 0;
  const currentRank = getRank(parseFloat(finalCps));

  // ---------------------------------------------------------------------
  // Long-form SEO content: 30+ H2 sections (3000+ words) + 30+ FAQ entries.
  // Kept as data arrays and mapped over so the JSX below stays readable.
  // ---------------------------------------------------------------------
  const articleSections: { heading: string; paragraphs: string[] }[] = [
    {
      heading: 'What Is a Scroll Wheel Test (CPS Checker)?',
      paragraphs: [
        'A scroll wheel test is a browser-based diagnostic tool that measures how many times you can move your mouse wheel in a fixed window of time, expressed as scrolls per second (CPS). Every time you nudge the wheel, your operating system fires a "wheel" event containing a delta value that tells the browser how far and in which direction the wheel moved. This page listens for those events, counts them, and divides the total by the elapsed time to produce your CPS score.',
        'Unlike a simple click counter, a scroll wheel test also tracks direction, so you can see exactly how many notches you scrolled upward versus downward. That distinction matters because most wheel encoders are not perfectly symmetrical — some people find it easier to scroll down quickly with their index finger than to reverse direction and scroll up, and this tool makes that asymmetry visible.',
      ],
    },
    {
      heading: 'Why Scroll Speed Matters for Gamers and Professionals',
      paragraphs: [
        'In tactical shooters and sandbox games, the scroll wheel often doubles as a weapon-switch or hotbar-cycle input. A responsive wheel with a high achievable CPS means fewer missed inputs during a fast weapon swap or inventory change. In creative and productivity software, a smooth-spinning wheel reduces the number of discrete hand movements needed to move through long documents, spreadsheets, or timelines, which can meaningfully cut down on repetitive strain over a full workday.',
        'Competitive players sometimes train scroll speed the same way they train click speed, treating the wheel as a secondary macro input. Office workers rarely think about it consciously, but a worn-out or gritty encoder can silently slow down everyday navigation across thousands of small scroll actions per week.',
      ],
    },
    {
      heading: 'How Scroll Wheel Sensors Work',
      paragraphs: [
        'Most mechanical scroll wheels sit on a rotary encoder: a small disc with alternating conductive or optical segments. As the wheel turns, two sensors read the segments slightly out of phase with each other, which lets the controller determine both the amount of rotation and its direction. Each detent — the little click you feel as you scroll — corresponds to one step of that encoder.',
        'Premium mice replace the mechanical encoder with an optical one, using an infrared beam and a slotted disc instead of physical contacts. Optical encoders wear out far more slowly because there is no metal-on-metal contact, which is why many high-end gaming mice advertise scroll wheels rated for tens of millions of steps.',
      ],
    },
    {
      heading: 'Understanding the CPS Formula Used by This Tool',
      paragraphs: [
        'The core calculation behind every score on this page is simple: total scroll notches divided by test duration in seconds. During the test itself, the live counter uses elapsed time so far rather than the full duration, which is why your live number can look higher than your final number — early bursts of speed are averaged against a smaller denominator.',
        'Once the timer reaches zero, the tool recalculates using the fixed test length you selected, which gives a stable, comparable figure you can use to track improvement across multiple attempts.',
      ],
    },
    {
      heading: 'Mechanical vs. Optical Scroll Encoders',
      paragraphs: [
        'Mechanical encoders are cheaper to manufacture and give a distinct tactile "step" that many users prefer for precision tasks like adjusting a single row in a spreadsheet. Their downside is gradual wear: dust and oxidation on the contact points eventually cause skipped or doubled steps.',
        'Optical encoders trade a bit of that tactile feedback for durability and consistency. Because there is no physical wear surface, an optical wheel is less likely to lose accuracy over years of heavy use, which is one reason they show up more often in mice marketed toward long-term competitive players.',
      ],
    },
    {
      heading: 'Free-Spin vs. Ratchet Scroll Wheels',
      paragraphs: [
        'A ratchet wheel clicks through discrete steps and is the default on almost every mouse. A free-spin (or hyper-scroll) wheel can be toggled into a mode with no resistance at all, letting a single flick spin the wheel for several seconds and register dozens of scroll notches almost instantly.',
        'Free-spin mode is fantastic for flying through long documents or spreadsheets but is generally disabled for precision tasks, since it is easy to overshoot a target row or menu item. If your mouse has this feature, expect noticeably higher CPS scores while it is engaged.',
      ],
    },
    {
      heading: 'How This Test Captures and Measures Your Scrolls',
      paragraphs: [
        'When you scroll inside the test zone, the browser fires a native wheel event carrying a deltaY value. A positive deltaY means the wheel moved away from you (down), and a negative value means it moved toward you (up). This tool listens for that event with `passive: false` so it can call `preventDefault()`, which stops the page itself from scrolling and keeps every notch dedicated to your score.',
        'Each event increments the total counter and the relevant directional counter, updates the on-screen icon animation, and — new in this version — triggers a short audio tick so you get both visual and auditory confirmation that your input registered.',
      ],
    },
    {
      heading: 'New: Real-Time Sound Feedback While You Scroll',
      paragraphs: [
        'Every scroll notch you make during an active test now plays a short synthesized tick through your speakers or headphones, generated live with the Web Audio API rather than a pre-recorded sound file. Scrolling up produces a slightly higher-pitched tick and scrolling down a slightly lower one, so with your eyes closed you could still tell which direction you just moved.',
        'When the timer hits zero, a short three-note chime plays to mark the end of the run. Sound can be toggled off at any time with the speaker button above the test zone if you would rather test in silence — for example, in a quiet office or late at night.',
      ],
    },
    {
      heading: 'Why Audio Feedback Improves a Scroll Wheel Test',
      paragraphs: [
        'Human reaction and rhythm tend to sync more naturally with audio cues than with visual ones alone, because sound processing in the brain has lower latency than visual processing. A ticking sound on every notch gives you a metronome-like rhythm to chase, which can help you settle into a faster, steadier scrolling cadence rather than scrolling in uneven bursts.',
        'Audio feedback also helps catch missed inputs. If you expect a tick on every notch and one goes silent, that is often a sign the wheel skipped a step — useful information whether you are testing your own reflexes or diagnosing a mouse that feels "off."',
      ],
    },
    {
      heading: 'Best Mice for High CPS Scrolling',
      paragraphs: [
        'Mice built for high scroll throughput typically combine an optical or hybrid encoder with a free-spin toggle and a weighted flywheel that keeps spinning briefly after a flick. Look for scroll wheels rated for tens of millions of cycles, tactile detents that are firm enough to count accurately at speed, and software that lets you fine-tune scroll line count per notch.',
        'For most people, though, a comfortable grip matters more than any spec sheet number — a wheel that is easy to reach without straining your index finger will let you sustain a higher CPS over a longer test than a technically superior wheel that is awkward to use.',
      ],
    },
    {
      heading: 'Scroll Wheel Test vs. Click Speed Test',
      paragraphs: [
        'A click speed test measures how many times you can press a mouse button in a fixed window, usually reported in clicks per second (also abbreviated CPS, which can cause confusion). A scroll wheel test measures rotational input instead of button presses, and the two use different muscles: clicking relies on finger flexion, while scrolling relies on a rolling motion of the fingertip against a ridged surface.',
        'Many players who score well on one test do not automatically score well on the other, since the two motions train different fine-motor patterns. Trying both is a useful way to get a fuller picture of your mouse-hand dexterity.',
      ],
    },
    {
      heading: 'How to Improve Your Scroll Wheel Speed',
      paragraphs: [
        'Start with grip: resting your index finger lightly on the wheel with a slightly bent knuckle usually gives more range of motion than a flat, stiff finger. Short, repeated flicks tend to outperform one long continuous roll, since each flick lets the encoder register a clean, discrete step rather than a blurred continuous motion.',
        'Warming up your hand for thirty seconds before a timed attempt — light finger stretches and a few practice scrolls — can noticeably reduce the "cold start" dip most people show in the first second or two of a test.',
      ],
    },
    {
      heading: 'Common Scroll Wheel Problems and How to Fix Them',
      paragraphs: [
        'A wheel that skips steps, scrolls in the wrong direction occasionally, or feels gritty is usually suffering from dust buildup on the encoder contacts. Compressed air around the base of the wheel, followed by a few dozen full-speed spins, clears out most light debris.',
        'If cleaning does not help, the encoder itself may be worn out — a common failure point on budget mice after a few years of daily use. At that point, replacing the mouse (or the encoder, for people comfortable with a soldering iron) is usually more practical than continued troubleshooting.',
      ],
    },
    {
      heading: 'Scroll Wheel Test for Gaming: Minecraft, Valorant, CS2, and Apex',
      paragraphs: [
        'In Minecraft, rapid scrolling through the hotbar is a common technique for quickly switching between blocks or tools during builds and PvP encounters. In Valorant and CS2, some players bind jump to the scroll wheel to make bunny-hopping and jump-peeking more consistent, which puts real mechanical demand on the wheel during fast-paced rounds.',
        'In Apex Legends, wheel-based binds are popular for weapon switching during fights, where a fraction of a second saved on a swap can decide an engagement. None of these use cases require an extremely high CPS ceiling, but they do reward a wheel that registers every intended step without skipping.',
      ],
    },
    {
      heading: 'Scroll Wheel Test for Programmers, Analysts, and Office Workers',
      paragraphs: [
        'Anyone who spends hours moving through long files, logs, or spreadsheets benefits from a wheel that tracks fast, deliberate input accurately. A smooth, high-CPS-capable wheel means fewer separate scroll actions are needed to cover the same distance, which adds up to less repetitive strain across a workday.',
        'Running this test occasionally is also a quick, informal way to notice if your work mouse has started degrading, well before it becomes annoying enough to interrupt your workflow.',
      ],
    },
    {
      heading: 'The Science of Human Finger Reflex Speed',
      paragraphs: [
        'The index finger is capable of extremely fast repetitive motion because it is controlled by a dense concentration of motor neurons relative to its size — a disproportionately large share of the brain\'s motor cortex is devoted to fine finger control compared to larger muscle groups. This is part of why finger-based inputs like scrolling and clicking can reach far higher repetition rates than, say, tapping a foot.',
        'Sustained high-speed finger motion is still limited by tendon fatigue, though, which is why almost everyone shows a small drop-off in CPS over a 30-second test compared to a 5-second burst.',
      ],
    },
    {
      heading: 'A Brief History of the Computer Mouse Scroll Wheel',
      paragraphs: [
        'Early computer mice, dating back to the 1960s and popularized through the 1980s, had no scroll wheel at all — scrolling was done entirely through on-screen scrollbars operated by clicking and dragging. The now-familiar physical scroll wheel was popularized in the mid-1990s and quickly became a standard third input alongside the two primary buttons.',
        'Since then, the basic ratchet-wheel design has been refined with tilt-scroll for horizontal movement, free-spin modes for rapid document navigation, and haptic or optical variants aimed at durability and precision.',
      ],
    },
    {
      heading: 'How Browsers Capture and Report Wheel Events',
      paragraphs: [
        'Modern browsers expose scroll input through the WheelEvent interface, which includes deltaX, deltaY, and deltaZ values describing motion along each axis, plus a deltaMode field describing whether those values are measured in pixels, lines, or pages. This test only reads deltaY, since a standard vertical scroll wheel only produces vertical motion.',
        'Because wheel events can fire the default page-scroll behavior, this tool calls preventDefault() on every event inside the active test zone, which requires registering the listener as non-passive. That is a small but important implementation detail — without it, your browser would scroll the whole page instead of just updating the counter.',
      ],
    },
    {
      heading: 'Scroll Wheel Test Accuracy and Its Limitations',
      paragraphs: [
        'Because this test relies on the operating system correctly reporting one wheel event per physical detent, results can vary slightly between operating systems, browsers, and mouse drivers. Some trackpads and virtual scroll implementations emit multiple small deltaY events per physical gesture rather than one clean event per notch, which can inflate CPS numbers compared to a traditional mechanical mouse wheel.',
        'For that reason, this tool is best used as a relative measure — comparing your own scores across attempts on the same device — rather than as an absolute, cross-device benchmark.',
      ],
    },
    {
      heading: 'Tips to Get a Higher CPS Score',
      paragraphs: [
        'Rest your wrist on the desk so your finger, not your whole arm, is doing the work — this isolates the motion and reduces fatigue. Keep your finger curved rather than flat against the wheel, since a curved finger has a longer effective stroke per flick.',
        'Practice short, repeated bursts rather than one long continuous roll; discrete flicks tend to register more cleanly on most encoders than a smeared continuous motion, especially at the very top of your speed range.',
      ],
    },
    {
      heading: 'Running a Scroll Wheel Test on a Laptop Trackpad',
      paragraphs: [
        'Laptop trackpads do not have a physical wheel, but two-finger vertical swipes generate the same underlying wheel events, so this test still works on a trackpad. Because trackpad gestures are continuous rather than stepped, expect noticeably different — often higher and less consistent — CPS numbers than you would get from a mechanical mouse wheel.',
        'If you are trying to compare scores across sessions, it is best to stick with either a mouse or a trackpad consistently rather than switching between the two, since the input mechanics are fundamentally different.',
      ],
    },
    {
      heading: 'Scroll Wheel Maintenance and Cleaning Guide',
      paragraphs: [
        'Regular light maintenance extends the life of a mechanical scroll wheel significantly. Every few months, use a can of compressed air to blow dust out from around the base of the wheel where it meets the mouse shell, and spin the wheel a few dozen times afterward to work loose any remaining debris.',
        'Avoid liquid cleaners near the wheel housing, since moisture can accelerate corrosion on the encoder\'s contact points. If your mouse allows it, occasionally removing the top shell to clean the encoder directly will catch buildup that compressed air alone cannot reach.',
      ],
    },
    {
      heading: 'Understanding the Snail-to-Machine Ranking System',
      paragraphs: [
        'This tool sorts your final CPS into five tiers — Snail, Turtle, Fox, Cheetah, and Machine — as a quick, gamified way to interpret an otherwise abstract number. The thresholds are set so that casual, occasional scrolling lands in the lower tiers while sustained, deliberate high-speed input is needed to reach Cheetah or Machine.',
        'The ranking is meant to be motivating rather than strictly scientific — treat it as a fun benchmark for your own progress rather than an objective measure of mouse quality.',
      ],
    },
    {
      heading: 'Using This Test for Esports Training Routines',
      paragraphs: [
        'Players building a warm-up routine before ranked matches sometimes add a short scroll wheel test alongside click-speed and aim-training drills, treating it as one more way to wake up fine motor control in the scrolling hand before a session.',
        'Tracking your CPS over several weeks of casual practice can reveal whether targeted warm-ups are actually improving your baseline speed, or whether your day-to-day scores are simply noisy from session to session.',
      ],
    },
    {
      heading: 'DPI, Polling Rate, and Scroll Sensitivity Explained',
      paragraphs: [
        'DPI (dots per inch) describes how far the cursor moves on screen relative to physical mouse movement, and polling rate describes how often the mouse reports its position to the computer per second — neither one directly affects the scroll wheel\'s encoder resolution.',
        'Scroll sensitivity, usually set in your operating system or mouse software, controls how many lines or pixels the page moves per wheel notch, but it does not change how many notches you can physically produce in a second. This test measures the latter — your raw physical scrolling rate — independent of whatever sensitivity setting you have configured.',
      ],
    },
    {
      heading: 'Ergonomics: Preventing Wrist and Finger Strain While Scrolling',
      paragraphs: [
        'Repeated high-speed scrolling, especially in short intense bursts, can strain the same tendons used for clicking and typing if done without breaks. Keeping your wrist neutral (neither bent up nor down) and letting your finger do the work rather than your whole hand reduces unnecessary tension.',
        'If you use scroll-heavy binds regularly in games or spend long stretches scrolling through documents at work, periodic hand stretches and short breaks are a simple way to avoid overuse discomfort building up over time.',
      ],
    },
    {
      heading: 'Tracking Personal Records Across Multiple Attempts',
      paragraphs: [
        'Because this tool resets fully between attempts, you can run the test repeatedly to chase a personal best without needing to reload the page. Testing at the same duration each time (for example, always using the 15-second preset) makes your scores directly comparable, since CPS naturally trends slightly lower on longer tests due to fatigue.',
        'Keeping an informal log of your best scores by duration and by mouse can help you notice patterns — such as a favorite mouse consistently outperforming another, or your morning scores being higher than your late-night ones.',
      ],
    },
    {
      heading: 'How Custom Duration Testing Works',
      paragraphs: [
        'Beyond the four preset durations, you can enter any custom time in seconds to tailor the test to your own training routine — a 3-second burst test for peak speed, or a 60-second endurance test for sustained consistency. Setting a custom duration immediately updates the countdown and resets your current attempt.',
        'Longer durations tend to produce lower average CPS than short bursts, since finger speed naturally tapers off after the first few seconds of maximal effort — this is a normal and expected pattern, not a sign of a problem with your input device.',
      ],
    },
    {
      heading: 'Scroll Wheel Testing for Content Reviewers and QA Teams',
      paragraphs: [
        'Quality assurance testers and content reviewers who spend entire shifts scrolling through logs, transcripts, or moderation queues can use a wheel speed test as a quick, informal hardware check before a long shift, similar to how a typist might check their keyboard.',
        'A sudden, unexplained drop in your usual CPS score can be an early warning sign of a failing encoder, giving you time to source a replacement mouse before it becomes disruptive mid-shift.',
      ],
    },
    {
      heading: 'Choosing the Right Mouse for Scroll-Heavy Work',
      paragraphs: [
        'If most of your day involves long-document navigation rather than gaming, prioritize a mouse with a comfortable, easily reachable wheel and, ideally, a free-spin toggle for covering long distances quickly. Precision detents matter less here than in gaming contexts, since you are usually scrolling for distance rather than for split-second timing.',
        'For gaming-oriented use, prioritize a firm, well-defined tactile step so binds relying on the scroll wheel register consistently under fast, repeated input.',
      ],
    },
    {
      heading: 'Interpreting Your Up vs. Down Scroll Balance',
      paragraphs: [
        'This tool separately tracks upward and downward scroll counts, which can reveal an asymmetry in your technique — many right-handed users find it slightly easier to scroll downward with a rolling index-finger motion than to reverse and scroll upward with the same fluidity.',
        'A large imbalance between your up and down counts is not inherently a problem, but noticing it can help you consciously practice your weaker direction if a particular game or workflow depends on it.',
      ],
    },
    {
      heading: 'Final Thoughts on Scroll Wheel Speed and Everyday Use',
      paragraphs: [
        'Scroll wheel speed is a small, often overlooked part of overall mouse performance, but it quietly affects everything from gaming binds to everyday document navigation. Testing it occasionally — now with audible feedback on every notch — gives you a simple, repeatable way to track your own technique and to catch hardware wear before it becomes a real annoyance.',
        'Whether you are chasing a Machine-tier rank for fun, training for a specific game bind, or just curious how your mouse holds up after years of use, this tool gives you a fast, no-signup way to find out.',
      ],
    },
  ];

  const faqs: { q: string; a: string }[] = [
    { q: 'How is CPS (scrolls per second) calculated on this page?', a: 'Total scroll notches are divided by the test duration in seconds: Scroll Count ÷ Time Duration. Longer tests reward consistency, while shorter tests reward raw burst speed.' },
    { q: 'Why did my score drop when I switched from a 5-second to a 30-second test?', a: 'Finger speed naturally tapers off after the first few seconds of maximal effort due to fatigue, so average CPS over a longer window is almost always lower than a short burst.' },
    { q: 'Does this test work with a laptop trackpad?', a: 'Yes. A two-finger vertical swipe fires the same wheel events a mouse does, though continuous trackpad gestures often produce different, less consistent numbers than a stepped mechanical wheel.' },
    { q: 'Why do I hear a sound every time I scroll?', a: 'Sound feedback is generated live with the Web Audio API to confirm each scroll notch registered. Upward scrolls play a slightly higher tone and downward scrolls a slightly lower one.' },
    { q: 'Can I turn the scroll sound off?', a: 'Yes, use the speaker toggle above the test zone to mute tick sounds at any time — your scores and the countdown are unaffected either way.' },
    { q: 'Why does my browser tab not scroll while the test is running?', a: 'The test zone intentionally blocks the default page-scroll behavior while active so that every notch goes toward your score instead of moving the page.' },
    { q: 'What mouse is best for a high CPS score?', a: 'Mice with optical encoders, a free-spin toggle, and a comfortable, reachable wheel position tend to support higher sustained scroll speeds than basic ratchet-only wheels.' },
    { q: 'Is a higher CPS always better?', a: 'Not necessarily. Precision tasks like adjusting a single spreadsheet row often benefit more from controlled, deliberate scrolling than from raw top-end speed.' },
    { q: 'Why do my up and down scroll counts differ?', a: 'Many people find one scrolling direction slightly more natural due to finger mechanics. A moderate imbalance between up and down counts is completely normal.' },
    { q: 'Can I set a custom test duration?', a: 'Yes, enter any number of seconds in the Custom field and press Set. This immediately updates the countdown for your next attempt.' },
    { q: 'Does this tool store or upload my scores?', a: 'No account or server storage is used here — your results exist only in your current browser session and reset if you refresh the page.' },
    { q: 'Why does my wheel sometimes skip a step?', a: 'Skipped steps are usually caused by dust or debris on the encoder contacts. A can of compressed air around the wheel base, followed by a few dozen spins, often resolves it.' },
    { q: 'What is a free-spin or hyper-scroll wheel?', a: 'It is a wheel that can be toggled into a near-frictionless mode, letting a single flick spin for several seconds and register many scroll notches almost instantly.' },
    { q: 'Is scroll wheel speed useful in games like Minecraft or CS2?', a: 'Yes, wheel-based binds are commonly used for hotbar switching, weapon swaps, and jump-related mechanics, where consistent registration matters more than raw top speed.' },
    { q: 'Why is my live CPS number different from my final score?', a: 'The live counter divides by elapsed time so far, which can look higher early on. The final score always divides by the full selected test duration for a stable comparison.' },
    { q: 'Can this test damage my mouse?', a: 'No. Normal scrolling, even at high speed, is well within the design tolerance of any standard scroll wheel and will not cause damage.' },
    { q: 'How often should I clean my scroll wheel?', a: 'Light cleaning every few months with compressed air is usually enough for typical use; heavier daily use may benefit from more frequent cleaning.' },
    { q: 'What is a good average CPS score?', a: 'Most casual users land in the Snail-to-Turtle range (under 25 CPS). Fox and above generally requires deliberate, practiced fast scrolling technique.' },
    { q: 'Why does the ranking use animal names?', a: 'The Snail-to-Machine tiers are a lighthearted, memorable way to translate an abstract number into a sense of relative performance.' },
    { q: 'Does scroll sensitivity setting affect my CPS score?', a: 'No. Scroll sensitivity changes how far the page moves per notch, not how many physical notches you can produce per second, which is what this tool measures.' },
    { q: 'Can I use this test to check if my mouse wheel is failing?', a: 'Yes. A sudden, unexplained drop in your usual score, or missing ticks during a run, can be an early sign of encoder wear.' },
    { q: 'Why does the modal appear when the test ends?', a: 'It presents your final CPS, rank, and scroll breakdown in one place, along with quick options to reset or immediately try again.' },
    { q: 'Is there a difference between mechanical and optical scroll wheels?', a: 'Mechanical wheels give a firmer tactile click but wear faster over time; optical wheels use a light sensor instead of physical contacts and generally last longer.' },
    { q: 'Can I retry the test immediately after finishing?', a: 'Yes, the "Try Again" button on the results screen resets your counters and starts a fresh attempt right away using the same duration.' },
    { q: 'Why does my score vary a lot between attempts?', a: 'Short bursts of finger speed are naturally variable session to session; running several attempts and looking at your average gives a more reliable picture than any single run.' },
    { q: 'Does this test measure horizontal (tilt) scrolling?', a: 'No, only vertical scroll input (deltaY) is measured, since that is what a standard scroll wheel produces.' },
    { q: 'Can I use this on a touchscreen device?', a: 'Touch-drag scrolling does not reliably fire the same wheel events as a physical mouse, so results on touch-only devices may be inconsistent or unavailable.' },
    { q: 'Why does the icon move up and down while I scroll?', a: 'It is a visual cue mirroring your scroll direction in real time, complementing the audio tick so you get both sight and sound confirmation of each input.' },
    { q: 'What happens if I click Reset mid-test?', a: 'The timer stops immediately, all counters return to zero, and the test returns to the idle "Click to Start" state at your currently selected duration.' },
    { q: 'Is a scroll wheel test the same as a click speed test?', a: 'No. A click speed test measures button presses per second, while this tool measures wheel rotation notches per second — different muscles and different mechanics are involved.' },
    { q: 'Do professional gamers actually train scroll speed?', a: 'Some competitive players include scroll-wheel drills in warm-up routines when their game binds depend on fast, reliable wheel input, though it is less common than click or aim training.' },
    { q: 'Why is sound feedback helpful for a timing-based test like this?', a: 'Audio cues are processed faster by the brain than visual cues, so a rhythmic tick can help you settle into a steadier, faster scrolling cadence than visual feedback alone.' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPopIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Mouse Tool</div>
        <h1 className="tool-title">Scroll Wheel Test</h1>
        <p className="tool-subtitle">Test your scroll wheel speed and sensitivity — now with sound feedback</p>
      </div>

      {/* Duration selector with Custom Input + Sound toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
        {DURATIONS.map(d => (
          <button key={d} onClick={() => { setDuration(d); durationRef.current = d; resetGame(); setTimeLeft(d); setCustomTime(''); }}
            disabled={phase === 'running'}
            style={{
              padding: '0.4rem 1rem', borderRadius: '8px',
              border: duration === d && !customTime ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
              background: duration === d && !customTime ? 'rgba(0,245,255,0.15)' : 'var(--bg-card)',
              color: duration === d && !customTime ? 'var(--neon-cyan)' : 'var(--text-secondary)',
              fontWeight: '700', cursor: phase === 'running' ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem', transition: 'all 0.2s',
            }}>{d}s</button>
        ))}

        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '0.2rem 0.2rem 0.2rem 0.6rem'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Custom:</span>
          <input
            type="number"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            disabled={phase === 'running'}
            placeholder="sec"
            style={{
              width: '50px', background: 'transparent', border: 'none',
              color: 'var(--neon-cyan)', fontWeight: '700', outline: 'none',
              textAlign: 'center', fontSize: '0.85rem'
            }}
          />
          <button
            onClick={handleCustomTimeSet}
            disabled={phase === 'running' || !customTime}
            style={{
              padding: '0.3rem 0.8rem', borderRadius: '6px',
              background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)',
              color: 'var(--neon-cyan)', fontWeight: '700', cursor: phase === 'running' || !customTime ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem', transition: 'all 0.2s',
            }}
          >Set</button>
        </div>

        <button
          onClick={() => setSoundOn(s => !s)}
          title={soundOn ? 'Mute scroll sound' : 'Enable scroll sound'}
          style={{
            padding: '0.4rem 0.9rem', borderRadius: '8px',
            border: soundOn ? '1px solid var(--neon-green, #10b981)' : '1px solid var(--border)',
            background: soundOn ? 'rgba(16,185,129,0.12)' : 'var(--bg-card)',
            color: soundOn ? 'var(--neon-green, #10b981)' : 'var(--text-secondary)',
            fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s',
          }}
        >{soundOn ? '🔊 Sound On' : '🔇 Sound Off'}</button>
      </div>

      {/* Dashboard Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { value: scrollCount, label: 'Total', color: 'var(--neon-cyan)' },
          { value: upScrolls, label: '↑ Up', color: 'var(--neon-green)' },
          { value: downScrolls, label: '↓ Down', color: 'var(--neon-orange)' },
          { value: phase === 'running' ? liveCps : parseFloat(finalCps).toFixed(1), label: 'CPS', color: 'var(--neon-purple)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="progress-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Main Interaction Window */}
      <div
        ref={zoneRef}
        tabIndex={0}
        onClick={phase === 'idle' ? start : undefined}
        style={{
          width: '100%', minHeight: '280px',
          background: 'var(--bg-card)',
          border: `2px solid ${phase === 'running' ? (direction === 'up' ? 'var(--neon-green)' : direction === 'down' ? 'var(--neon-orange)' : 'var(--neon-cyan)') : 'var(--border)'}`,
          borderRadius: '16px', cursor: phase === 'idle' ? 'pointer' : 'default',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '1rem', userSelect: 'none', outline: 'none', marginBottom: '1.5rem',
          transition: 'border-color 0.1s',
          boxShadow: phase === 'running' ? '0 0 30px rgba(0,245,255,0.08)' : 'none',
          padding: '1.5rem'
        }}
      >
        {phase === 'idle' && (
          <>
            <div style={{ fontSize: '4rem' }}>🔄</div>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--neon-cyan)' }}>Click to Start</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Then scroll your mouse wheel as fast as possible!</span>
          </>
        )}

        {phase === 'running' && (
          <>
            <div style={{
              fontSize: '4rem',
              transform: direction === 'up' ? 'translateY(-8px)' : direction === 'down' ? 'translateY(8px)' : 'translateY(0)',
              transition: 'transform 0.1s',
              color: direction === 'up' ? 'var(--neon-green)' : direction === 'down' ? 'var(--neon-orange)' : 'var(--text-secondary)',
            }}>🔄</div>
            <div style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--neon-cyan)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{scrollCount}</div>
            <span style={{ color: 'var(--text-secondary)' }}>🔄 Keep scrolling inside this box!</span>
            <span style={{ color: 'var(--neon-orange)', fontWeight: '700' }}>{timeLeft.toFixed(1)}s</span>
          </>
        )}

        {phase === 'done' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>🏁</span>
            <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--neon-cyan)', lineHeight: 1 }}>
              {parseFloat(finalCps).toFixed(2)} <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-secondary)' }}>CPS</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: currentRank.color }}>
              Rank: {currentRank.name}
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              You scrolled <strong>{scrollCount}</strong> times in {duration} seconds.
            </span>
          </div>
        )}
      </div>

      {phase === 'running' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease-in' }}>
          <button
            onClick={(e) => { e.stopPropagation(); resetGame(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#1e2235', border: '1px solid #2a3047',
              color: '#ffffff', padding: '0.6rem 1.25rem',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: '600', transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#252a40'; e.currentTarget.style.borderColor = '#3b4363'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1e2235'; e.currentTarget.style.borderColor = '#2a3047'; }}
          >
            <div style={{
              background: '#3b82f6', color: 'white',
              borderRadius: '4px', width: '22px', height: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </div>
            Reset
          </button>
        </div>
      )}

      {/* ================= MODERN ANIMAL SPLIT RESULT MODAL ================= */}
      {phase === 'done' && currentRank && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            zIndex: 999, animation: 'fadeIn 0.3s ease-out forwards',
          }} onClick={() => resetGame()} />

          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: '560px', background: '#0d1117',
            border: `2px solid ${currentRank.color}`, borderRadius: '20px', padding: '2rem 1.5rem',
            textAlign: 'center', zIndex: 1000,
            animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            boxShadow: `0 0 40px ${currentRank.color}25`,
          }}>
            <button onClick={() => resetGame()} style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${currentRank.color}40`,
              color: currentRank.color, width: '32px', height: '32px',
              borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem',
              alignItems: 'center', minHeight: '130px', marginBottom: '1.25rem'
            }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '1rem', height: '100%'
              }}>
                <span style={{ fontSize: '4.5rem', lineHeight: '1', filter: `drop-shadow(0 0 15px ${currentRank.color}40)` }}>
                  {currentRank.emoji}
                </span>
              </div>

              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Rank is
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: currentRank.color, fontStyle: 'italic', margin: '0.1rem 0' }}>
                  {currentRank.name}!
                </div>

                <div style={{ display: 'flex', gap: '3px', marginBottom: '0.5rem' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ fontSize: '1.2rem', color: i < currentRank.stars ? '#ffca28' : 'rgba(255,255,255,0.1)' }}>
                      ★
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  You Scrolled with the speed of <strong style={{ color: '#fff', fontSize: '1.15rem', fontVariantNumeric: 'tabular-nums' }}>{parseFloat(finalCps).toFixed(2)}</strong> CPS
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.25)', padding: '0.85rem 1rem', borderRadius: '12px',
              borderLeft: `3px solid ${currentRank.color}`, fontStyle: 'italic', color: '#cbd5e1',
              fontSize: '0.88rem', textAlign: 'left', marginBottom: '1.25rem', lineHeight: '1.5'
            }}>
              {currentRank.desc}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[
                { value: scrollCount, label: 'Total Scrolls', color: 'var(--neon-cyan)' },
                { value: upScrolls, label: 'Up Scrolls (↑)', color: 'var(--neon-green)' },
                { value: downScrolls, label: 'Down Scrolls (↓)', color: 'var(--neon-orange)' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '0.5rem 0.25rem',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => resetGame()}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                🔄 Reset
              </button>
              <button
                className="btn btn-primary"
                onClick={() => { resetGame(); setTimeout(() => start(), 100); }}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', flex: 1, maxWidth: '160px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: currentRank.color, borderColor: currentRank.color, color: '#000', fontWeight: '700' }}
              >
                ▶ Try Again
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= SEO ARTICLE: 30+ H2 SECTIONS, 3000+ WORDS ================= */}
      <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '3rem 0' }} />
      <section style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.75' }}>
        {articleSections.map((sec, idx) => (
          <div key={idx} style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontWeight: '700',
              fontSize: idx === 0 ? '1.5rem' : '1.3rem',
              marginBottom: '1rem',
              color: idx % 2 === 0 ? 'var(--neon-cyan)' : '#fff',
              marginTop: '0',
            }}>
              {sec.heading}
            </h2>
            {sec.paragraphs.map((p, pIdx) => (
              <p key={pIdx} style={{ marginBottom: '1rem' }}>{p}</p>
            ))}
          </div>
        ))}

        {/* Rank Reference Table */}
        <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem', marginTop: '2rem' }}>
          Scroll Speed (CPS) Performance Hierarchy
        </h2>
        <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: '#fff' }}>
                <th style={{ padding: '0.5rem 0.75rem' }}>Rank Badge</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>CPS Threshold</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Skill Summary</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: '#94a3b8' }}>Snail</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>Less than 15 CPS</td>
                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>Casual web browsing pace. Normal physical finger movement.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: 'var(--neon-green)' }}>Turtle</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>15 - 24 CPS</td>
                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>Standard gaming reflexes. Clean wheel step coordination.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: 'var(--neon-cyan)' }}>Fox</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>25 - 34 CPS</td>
                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>Advanced finger flicking techniques or high-spec mechanical encoders.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: 'var(--neon-orange)' }}>Cheetah</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>35 - 44 CPS</td>
                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>Exceptional mechanics. Typically reached via advanced mouse hyper-scrolling.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: 'var(--neon-purple)' }}>Machine</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>45+ CPS</td>
                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>Top-tier physical burst limits or automated free-spin infinite wheel options.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FAQ Section: 30+ entries */}
        <div style={{ marginTop: '2.5rem', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--neon-purple)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', marginTop: '0' }}>
            Frequently Asked Questions (FAQs)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {faqs.map((item, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  style={{
                    border: isOpen ? '1px solid var(--neon-cyan)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: '1rem', background: 'transparent', border: 'none', cursor: 'pointer',
                      padding: '0.9rem 1.1rem', textAlign: 'left',
                    }}
                  >
                    <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>
                      {item.q}
                    </h3>
                    <svg
                      width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke={isOpen ? 'var(--neon-cyan)' : 'var(--text-muted)'}
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.1rem 1rem 1.1rem', animation: 'fadeIn 0.2s ease-in' }}>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
