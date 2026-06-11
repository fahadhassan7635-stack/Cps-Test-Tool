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
    tag: 'CPS',
    tagColor: 'var(--neon-green)',
    date: 'Apr 28, 2025',
    title: 'CPS Test: What Is Clicks Per Second and How to Improve It',
    excerpt: 'Everything you need to know about CPS testing — from average scores to world records and the best techniques to increase your click speed.',
    readTime: '7 min read',
    body: `The CPS Test (Clicks Per Second Test) measures how many times you can click your mouse button within a set time period. It\'s a critical metric for Minecraft PvP, competitive gaming, and general mouse performance testing.

**What Is a Good CPS Score?**
Understanding where you stand is the first step to improvement:
- 1-5 CPS: Beginner range — normal casual clicking
- 6-9 CPS: Average gamer range — solid for most games
- 10-14 CPS: Advanced range — competitive Minecraft PvP level
- 15-20 CPS: Expert range — requires butterfly or jitter clicking
- 20+ CPS: World-record territory — extremely difficult to sustain

**Why CPS Matters in Gaming**
In Minecraft PvP, a higher CPS gives you knockback advantage over opponents. In browser games and clicker games, raw click speed determines progression. Even in RTS games like StarCraft, faster clicks translate to higher APM (Actions Per Minute).

**The 3 Main Clicking Techniques**
- Regular Clicking: 4-8 CPS using normal finger movement. Sustainable for hours of play. Best for accuracy-dependent tasks.
- Jitter Clicking: 8-14 CPS by tensing your arm and wrist muscles to create rapid vibrations. Effective but can cause wrist strain over time.
- Butterfly Clicking: 12-20 CPS using two fingers alternating rapidly on the same mouse button. The fastest sustainable technique but may violate some game server rules.

**How to Practice for Higher CPS**
- Use our CPS Test tool daily with the 5-second and 10-second modes
- Track your average score over a week to see trends
- Practice butterfly clicking on a surface before attempting on mouse
- Warm up your fingers before serious CPS attempts
- Take breaks every 15 minutes to prevent repetitive strain injury

**What Hardware Affects CPS?**
- Mouse switch type: Optical switches (like Razer) have zero debounce delay
- Mouse weight: Lighter mice (under 70g) reduce finger fatigue
- Click actuation force: Lower force switches allow faster clicking
- Mouse polling rate: 1000Hz ensures every click registers instantly

**World Record CPS Scores**
The world record for highest CPS in a 5-second test exceeds 14 clicks per second on average, with peak bursts reaching 25+ CPS using butterfly technique. Our leaderboard tracks top performers daily.

**CPS Test Tips for Best Results**
- Use your index finger primarily for maximum control
- Position your hand so your finger naturally rests on the button
- Click from the knuckle joint, not just the fingertip
- Stay relaxed — tension actually reduces speed
- Use the 5-second test to measure peak CPS and 60-second test for endurance CPS`,
  },
  {
    id: 3,
    emoji: '⚡',
    tag: 'Reaction',
    tagColor: 'var(--neon-orange)',
    date: 'Apr 20, 2025',
    title: 'Reaction Time Test: Average Scores, World Records & How to Get Faster',
    excerpt: 'What is a good reaction time? How do elite gamers achieve sub-150ms responses? Science-backed methods to measure and improve your reaction speed.',
    readTime: '8 min read',
    body: `Your reaction time is the milliseconds between seeing a stimulus and responding to it. In gaming, this single metric can be the difference between winning and losing a crucial gunfight.

**Average Human Reaction Time by Category**
- 100-150ms: Elite esports pro range (top 1% of humans)
- 150-200ms: Competitive gamer range (top 5-10%)
- 200-250ms: Average young adult (18-25 years old)
- 250-300ms: Average adult reaction time (25-40 years old)
- 300-400ms: Slower than average — room for significant improvement
- 400ms+: Indicates fatigue, age factor, or need for training

**What Affects Your Reaction Time?**
Your reaction time is influenced by dozens of factors:
- Age: Peaks at 18-24, gradually increases after 30
- Sleep quality: 7-9 hours reduces RT by up to 30%
- Caffeine: 100-200mg improves RT by approximately 10-15ms
- Dehydration: Just 5% dehydration slows you by 12ms average
- Alcohol: Even next-day effects increase RT by 100-200ms
- Screen fatigue: Increases significantly after 2+ hours without breaks
- Ambient temperature: Cold environments slow neural transmission

**The Science Behind Reaction Time**
When your eyes detect movement, visual signals travel to the occipital lobe, processed by the visual cortex, then signals travel through the motor cortex down to your finger muscles. This entire chain takes a minimum of ~100ms even with perfect neural efficiency. Training doesn\'t speed up neurons — it trains your brain to anticipate and pre-load motor commands.

**How to Improve Reaction Time: Proven Methods**
- Daily reaction time training for 10-15 minutes shows measurable improvement within 2 weeks
- Play games with unpredictable stimuli rather than fixed patterns
- Practice in varied conditions to generalize your reflexes
- Use peripheral vision training — pros react to motion before fully focusing on it
- Meditation and mindfulness reduce cognitive delay in decision-making

**Pro Warm-Up Routine for Reaction Speed**
- 5 minutes: Simple reaction time test (click as soon as color changes)
- 3 minutes: Choice reaction test (different keys for different colors)
- 2 minutes: Predictive timing (click before the timer hits zero)

**Reaction Time vs Response Time**
Pure reaction time measures simple stimulus response. In real gaming, you\'re measuring response time — which includes reaction time PLUS decision time. Decision time can be trained by increasing game knowledge so choices become automatic rather than deliberate.

**Why Your Reaction Time Varies**
You\'ll notice your reaction time fluctuates between attempts. This is normal. Factors include: attention level at the exact moment, random neural noise, finger position, and whether you anticipated the stimulus. Take averages over 10+ attempts for accurate measurement.`,
  },
  {
    id: 4,
    emoji: '🎯',
    tag: 'Aim',
    tagColor: 'var(--neon-red)',
    date: 'Apr 10, 2025',
    title: 'Aim Trainer Guide: How to Build Elite FPS Aim From Scratch',
    excerpt: 'From raw mechanics to game-sense — the complete roadmap to improving your aim in competitive FPS games like Valorant, CS2, and Apex Legends.',
    readTime: '10 min read',
    body: `Whether you\'re playing Valorant, CS2, or Apex Legends, this guide covers the fundamentals of developing elite aim through structured aim trainer practice.

**Why Use an Aim Trainer?**
Aim trainers isolate the mechanical skill of targeting without the complexity of a full game. Studies show that 15-20 minutes of focused aim trainer practice is equivalent to 2+ hours of in-game practice for pure mechanical improvement.

**Step 1: Fix Your Setup First**
Before training mechanics, optimize your physical setup:
- Sensitivity: Most pros use 400-800 DPI × 0.3-0.6 in-game sensitivity
- Mousepad: Large (XL) mousepads prevent running out of space during flicks
- Monitor: Higher refresh rates (144Hz+) make target tracking significantly easier
- Chair and desk height: Your elbow should be at 90-100 degrees when mousing

**Step 2: Master the Three Aim Types**
Every aim scenario falls into one of three categories:
- Flick Aim: Rapidly moving crosshair to a target from far away. Trained with our Aim Trainer in fast mode.
- Tracking Aim: Following a moving target smoothly. Critical for games like Apex where characters strafe constantly.
- Micro-adjustment Aim: Fine-tuning crosshair position by small amounts. The most important aim type for headshots.

**Step 3: Crosshair Placement (Most Underrated Skill)**
Before mechanics, fix your crosshair habits:
- Always keep crosshair at head height
- Pre-aim common angles before rounding corners
- Good crosshair placement reduces required flick distance by 80%
- This single habit improvement raises effective aim more than any training

**Step 4: 30-Day Aim Training Program**
- Week 1: Flick shots only — build neural pathways for large movements
- Week 2: Add tracking exercises — 50% flick, 50% tracking
- Week 3: Precision mode — smaller targets at closer range
- Week 4: Mixed scenarios — simulate real game conditions

**Step 5: Game-Specific Application**
Transfer your aim trainer gains to your actual game:
- Play 15 min aim trainer, then immediately play ranked
- The neural pathways are freshest right after training
- Review replays looking specifically at aim — not game decisions
- Identify your most common miss pattern (over-flicking vs under-flicking)

**Common Aim Training Mistakes**
- Training too fast: Slow down and prioritize hitting targets over speed
- Ignoring weak side: Practice your non-dominant direction equally
- No consistency: 20 min daily beats 3 hours once a week
- Wrong scenarios: Match your training to your actual game\'s mechanics
- Skipping warm-up: Your first 5 minutes are always your worst aim`,
  },
  {
    id: 5,
    emoji: '🚀',
    tag: 'Spacebar',
    tagColor: 'var(--neon-cyan)',
    date: 'Apr 5, 2025',
    title: 'Spacebar Counter: How Fast Can You Press the Spacebar? Tips & Records',
    excerpt: 'The spacebar counter test measures your spacebar pressing speed. Learn techniques, average scores, and how to beat your personal best.',
    readTime: '5 min read',
    body: `The Spacebar Counter test measures how many times you can press the spacebar within a given time period. It\'s one of the most popular keyboard speed tests online, used for gaming benchmarks, typing warm-ups, and just pure fun competition.

**Why Test Your Spacebar Speed?**
- Competitive gaming: Many games use spacebar for jumping, dodging, or ability activation
- Rhythm games: Spacebar timing is critical in games like osu! and Friday Night Funkin
- Benchmark your keyboard: Mechanical keyboards often outperform membrane in rapid spacebar tests
- Personal challenge: Beat your own record and compete on leaderboards

**Average Spacebar Counter Scores**
- Under 5 hits/second: Casual, non-gaming pressing speed
- 5-8 hits/second: Average gamer spacebar speed
- 8-12 hits/second: Competitive gamer range
- 12-15 hits/second: Advanced — requires technique optimization
- 15+ hits/second: Expert level — world-record territory

**Techniques to Increase Spacebar Speed**
- Single finger method: Use your dominant thumb with a firm, quick pressing motion from the joint
- Two-thumb technique: Alternate both thumbs rapidly for 20%+ speed increase
- Palm technique: Rock your palm forward and back rapidly — less accurate but very fast
- Hover technique: Keep thumb hovering just above spacebar surface, reducing travel distance

**Keyboard Type Impact on Spacebar CPS**
- Mechanical keyboards (linear switches): Fastest due to consistent actuation and no mushiness
- Optical keyboards: Zero debounce, extremely responsive for rapid pressing
- Membrane keyboards: Slower due to rubber dome resistance and inconsistent feel
- Laptop keyboards: Generally slowest due to shallow key travel

**How to Practice Spacebar Speed**
- Use our Spacebar Counter in 5-second, 10-second, and 30-second modes
- Track your score daily at the same time (morning vs evening scores differ)
- Warm up your thumb and wrist before attempting record scores
- Practice the two-thumb technique on any flat surface throughout the day
- Hydrate — finger dexterity drops noticeably when dehydrated

**Spacebar Speed in Gaming Contexts**
In Minecraft, spacebar is used for jumping — critical for parkour servers. In fighting games, it\'s often mapped to special moves. In browser games like cookie clicker variants, raw spacebar speed determines score. The versatility of spacebar speed testing makes it relevant across dozens of gaming genres.`,
  },
  {
    id: 6,
    emoji: '⌨️',
    tag: 'Keyboard',
    tagColor: 'var(--neon-green)',
    date: 'Mar 30, 2025',
    title: 'Key Visualizer: How to Analyze Your Typing Patterns and Fix Weak Keys',
    excerpt: 'A key visualizer shows exactly which keys you press, how hard, and how often. Use this data to eliminate typing bottlenecks.',
    readTime: '6 min read',
    body: `A Key Visualizer is a tool that displays your keypresses in real-time, showing which keys you use most frequently, your typing patterns, and identifying which specific keys are slowing you down.

**What Does a Key Visualizer Show You?**
- Heat maps of your most-used keys
- Real-time visual feedback of each keypress
- Finger assignment errors (using wrong fingers for certain keys)
- Dead zones where you hesitate or make errors
- Rhythm patterns and timing between keypresses

**Why Key Visualization Matters for Typists**
Most typists have 3-5 "problem keys" that are responsible for 80% of their errors and slowdowns. Without visualization, these are nearly impossible to identify consciously because typing happens too fast. Key visualizers make the invisible visible — exposing exactly where your muscle memory breaks down.

**How to Use the Key Visualizer for Improvement**
- Type a 2-minute passage and observe which keys light up with hesitation
- Look for keys you activate with the wrong finger (common: B, Y, and number keys)
- Note any keys that rarely appear — these need deliberate practice
- Compare your pattern to the optimal 10-finger touch-typing layout
- Create targeted drills for your 3 weakest keys

**Common Key Visualizer Findings and Fixes**
- B key confusion: Should be pressed by left index finger, but most typists use right
- Number row avoidance: Typists often stop to look at numbers — practice blind
- Shift key timing: Right shift for left-hand letters, left shift for right-hand letters
- Backspace overuse: High backspace frequency indicates accuracy problem before speed problem
- Enter key reach: Should not require full hand movement — practice minimal wrist movement

**Key Visualizer for Gaming**
Gamers use key visualizers to analyze their in-game key usage:
- WASD frequency maps show movement patterns
- Ability key timing reveals reaction habits
- Identifies whether you\'re pressing optimal keys or developing bad habits
- Useful for streamers who want to display keypresses to viewers

**Setting Up Optimal Key Layout**
After analyzing your key visualizer data, you may want to consider:
- Remapping rarely-used default keys to more accessible positions
- Adjusting repeat rate for keys used in gaming (WASD)
- Testing alternative layouts like Dvorak or Colemak if QWERTY shows severe inefficiencies
- Custom macros for frequently-typed sequences

**The Professional Typist\'s Analysis Method**
Professional transcriptionists analyze their key visualizer data weekly. They look for three metrics: keystroke accuracy per key, average time between keypress and release (dwell time), and transition time between specific key pairs. This granular data allows targeted improvement that general typing tests can\'t provide.`,
  },
  {
    id: 7,
    emoji: '🖱️',
    tag: 'Mouse',
    tagColor: 'var(--neon-red)',
    date: 'Mar 25, 2025',
    title: 'Double Click Test: Diagnose and Fix Mouse Double-Click Problems',
    excerpt: 'Is your mouse double-clicking when you single-click? Or failing to register double-clicks? Learn how to test, diagnose, and fix your mouse.',
    readTime: '6 min read',
    body: `Double-clicking issues are among the most frustrating mouse problems. Your mouse might double-click when you single-click (causing accidental file opens, game inputs, or selection errors), or fail to register intentional double-clicks. Our Double Click Test helps you diagnose exactly what\'s happening.

**Types of Double-Click Problems**
- Phantom double-click: Mouse registers two clicks when you press once — the most common defect
- Missed double-click: Mouse registers single click when you quickly click twice
- Inconsistent registration: Intermittent failure to register clicks correctly
- Delayed click: Click registers significantly after physical button press

**Why Do Mice Develop Double-Click Issues?**
The main culprit is the mouse switch (usually an Omron switch). Inside the switch is a small metal contact leaf that can:
- Develop carbon buildup on contact points from normal use
- Weaken spring tension over time causing false triggers
- Physically bend or crack after millions of actuations
- Accumulate dust and debris that causes bouncing contacts

Most gaming mice are rated for 10-50 million clicks. Heavy gamers can exceed this in 1-2 years.

**How to Use the Double Click Test**
- Single-click test: Click once and verify only one registration appears
- Double-click test: Double-click rapidly and verify exactly two registrations
- Speed threshold test: Click at different speeds to find your mouse\'s debounce timing
- Stress test: Click 100 times and count registration accuracy percentage

**Diagnosing Your Double-Click Problem**
If your mouse fails the test, determine severity:
- Occasional failure (less than 5% of clicks): Cleaning may fix this
- Frequent failure (5-20% of clicks): Switch replacement recommended
- Consistent failure (20%+ of clicks): Replace mouse or switch immediately
- Only at high click speeds: May be normal debounce behavior

**Fixing Double-Click Issues**
- Software fix: Increase Windows double-click speed in Control Panel to reduce sensitivity
- Cleaning method: Use compressed air and isopropyl alcohol on switch contacts
- Debounce adjustment: Some mice have software to adjust debounce timing
- Switch replacement: Soldering a new Omron switch costs under $5 and extends mouse life by years

**When to Replace vs Repair**
- Under $30 mice: Replacement usually more practical than repair
- $50+ gaming mice: Switch replacement is highly cost-effective
- Limited edition or favorite mouse: Always worth attempting repair first
- Warranty still valid: Contact manufacturer — double-click defects are often covered

**Double Click Speed Settings by Use Case**
Windows allows customizing double-click registration speed. Optimal settings:
- Gaming: Slower double-click speed reduces accidental double-clicks during rapid single clicking
- Office productivity: Medium speed for comfortable file management
- Accessibility: Slowest setting for users with motor control difficulties`,
  },
  {
    id: 8,
    emoji: '⌨️',
    tag: 'Typing',
    tagColor: 'var(--neon-cyan)',
    date: 'Mar 20, 2025',
    title: 'Keyboard Accuracy Test: Why Precision Matters More Than Speed',
    excerpt: 'Your typing accuracy percentage affects your effective speed more than raw WPM. Here\'s how to measure, understand, and dramatically improve your accuracy.',
    readTime: '7 min read',
    body: `Most people focus obsessively on WPM (words per minute) but ignore the metric that actually determines real-world typing performance: accuracy. Our Keyboard Accuracy Test reveals the truth about your typing efficiency.

**Understanding Effective WPM**
Raw WPM measures how fast your fingers move. Effective WPM (also called Net WPM) accounts for errors:
Net WPM = (Raw WPM) × (Accuracy %)
- 80 WPM at 90% accuracy = 72 effective WPM
- 60 WPM at 99% accuracy = 59.4 effective WPM
- These typists perform nearly identically despite a 20 WPM raw speed gap

**Why High Accuracy Is Actually Faster**
When you make an error, you must: recognize the error, move to backspace, delete characters, retype correctly. This correction process costs 2-5x the time of the original keystrokes. At 95% accuracy, errors cost more time than the speed advantage of typing recklessly.

**What Is a Good Typing Accuracy Score?**
- Under 90%: Significant accuracy problem — prioritize this before speed
- 90-95%: Below average — room for improvement
- 95-98%: Good — acceptable for most professional contexts
- 98-99%: Excellent — professional transcription level
- 99%+: Exceptional — competitive typing benchmark

**Common Causes of Typing Errors**
- Rushing: Attempting speeds faster than muscle memory supports
- Incorrect finger assignment: Wrong fingers reaching to certain keys
- Poor posture: Hunching creates tension that disrupts fine motor control
- Cold hands: Reduces finger dexterity and tactile feedback
- Distractions: Cognitive load splits attention from typing task
- Unfamiliar words: Rare words interrupt automatic typing rhythm

**The Accuracy Training Method**
- Set your typing test to a slow, comfortable speed
- Attempt 100% accuracy — stop and retype any word with errors
- Gradually increase speed only after achieving 98%+ at current pace
- This method feels painfully slow but produces lasting improvement

**Targeted Accuracy Drills**
- Identify your three most error-prone keys using key visualizer
- Create custom drills focused on those specific key pairs
- Practice common error pairs: th, he, in, er, an (most frequent English bigrams)
- Use our Keyboard Accuracy Test in hard mode to stress-test your limits

**Typing Accuracy for Programmers**
Code has zero tolerance for errors — a single character mistake breaks the program. Programming-specific accuracy training includes:
- Special character accuracy ({, }, [, ], ;, :)
- Number row accuracy (critical for writing code)
- Case accuracy (JavaScript is case-sensitive)
- Symbol pair training (quotes, brackets, parentheses)

**Measuring Progress**
Track your accuracy weekly, not daily. Daily variance is high due to factors outside your control. Weekly averages reveal true improvement trends. Celebrate 1% accuracy improvements — they represent thousands of fewer errors per day of typing.`,
  },
  {
    id: 9,
    emoji: '🖱️',
    tag: 'Mouse',
    tagColor: 'var(--neon-green)',
    date: 'Mar 15, 2025',
    title: 'Scroll Test: How to Test and Improve Your Mouse Scroll Speed and Accuracy',
    excerpt: 'The scroll test measures your mouse wheel performance — speed, smoothness, and accuracy. Find out if your scroll wheel is holding you back.',
    readTime: '5 min read',
    body: `The Scroll Test measures how fast and accurately you can scroll using your mouse wheel. While often overlooked, scroll performance significantly impacts productivity, gaming, and browsing efficiency.

**Why Test Your Scroll Speed?**
- Long document navigation: Fast, accurate scrolling saves hours in document-heavy work
- Web browsing: Efficient scrolling improves reading and research speed
- Gaming: Many games use scroll wheel for weapon switching, zoom control, and inventory management
- Minecraft PvP: Scroll wheel weapon switching is used competitively for faster item selection than number keys
- Design and video editing: Precise scrolling through timelines and layers

**Scroll Test Metrics Explained**
- Scroll speed: How many scroll events per second your wheel generates
- Scroll accuracy: Whether scrolling stops exactly where intended
- Smoothness: Absence of jumping or irregular step sizes
- Resistance: Physical wheel tension — affects both speed and precision

**Average Scroll Wheel Performance**
- Slow scroll rate: Under 3 clicks per second — typical for basic office mice
- Medium scroll rate: 3-6 clicks per second — standard gaming mice
- Fast scroll rate: 6-10 clicks per second — performance gaming mice
- Free-spin mode: Unlimited scroll speed (Logitech MX Master, G502)

**Types of Mouse Scroll Wheels**
- Notched/stepped scroll: Click-by-click feedback — precise and predictable
- Free-spin scroll: Momentum-based continuous scrolling — fast but less precise
- Dual-mode scroll: Switch between notched and free-spin (Logitech\'s SmartShift)
- Tilt scroll: Side-to-side scrolling for horizontal navigation

**Improving Scroll Wheel Speed and Control**
- Adjust mouse scroll speed in system settings (3-5 lines per scroll is optimal for most users)
- Clean the scroll wheel — dust and debris cause inconsistent resistance
- Practice rhythmic scrolling rather than random speed bursts
- For gaming, consider mapping scroll wheel to more intuitive in-game actions

**Scroll Wheel Maintenance**
Over time, scroll wheels develop issues:
- Skipping: Wheel scrolls in wrong direction occasionally — common Logitech G502 issue
- Resistance increase: Accumulation of debris increases friction
- Rattling: Loose encoder wheel — may need replacement
- Cleaning method: Compressed air + isopropyl alcohol on the encoder fixes most scroll issues

**Scroll Optimization for Different Use Cases**
- Productivity: Enable high scroll speed (10+ lines) for fast document navigation
- Gaming: Reduce scroll speed for precise weapon switching without overshooting
- Design work: Use slowest scroll for pixel-level timeline precision
- General browsing: 3-5 lines per scroll balances speed and control`,
  },
  {
    id: 10,
    emoji: '🎯',
    tag: 'Aim',
    tagColor: 'var(--neon-red)',
    date: 'Mar 10, 2025',
    title: 'Mouse Accuracy Test: Measure and Improve Your Cursor Precision',
    excerpt: 'Mouse accuracy goes beyond aim — it affects everything from professional design work to competitive gaming. Here\'s how to test and improve it systematically.',
    readTime: '7 min read',
    body: `Mouse accuracy is the measure of how precisely you can move your cursor to intended targets. Whether you\'re a graphic designer, data analyst, or competitive gamer, cursor precision directly impacts your performance and efficiency.

**What Mouse Accuracy Test Measures**
- Target acquisition speed: How quickly you move cursor to a target
- Overshooting rate: How often your cursor passes beyond the target
- Precision at distance: Accuracy at short vs long cursor movements
- Consistency: Variance between identical movement attempts
- Fitts\'s Law performance: Speed-accuracy tradeoff across target sizes

**Mouse Accuracy Benchmarks**
- 70-80% accuracy: Beginner — basic motor control established
- 80-90% accuracy: Average user — functional for everyday computing
- 90-95% accuracy: Proficient — good for gaming and productivity
- 95-98% accuracy: Advanced — approaching professional-level control
- 98%+ accuracy: Elite — professional gaming or design level

**Factors That Determine Mouse Accuracy**
- Mouse sensor quality: High-quality sensors (HERO 25K, TrueMove Pro) track without prediction errors
- Mouse acceleration: Acceleration on or off changes required muscle memory (turn off for gaming)
- Surface quality: Proper mousepad reduces inconsistent friction
- DPI settings: Counter-intuitively, very high DPI reduces accuracy for most users
- Arm position: Wrist-only aiming limits control versus arm-aiming

**The DPI Accuracy Paradox**
Higher DPI does not mean better accuracy. Most professional players use 400-1600 DPI despite mice going up to 25,000+ DPI. At very high DPI, even microscopic hand tremors translate to large cursor movements, making precision more difficult. Find your optimal DPI with our accuracy test at multiple sensitivity settings.

**Improving Mouse Accuracy: Structured Approach**
- Baseline test: Complete our Mouse Accuracy Test and record your score
- DPI optimization: Test your accuracy at 400, 800, 1600 DPI to find your personal optimum
- Surface upgrade: Test accuracy improvement on proper gaming mousepad vs desk
- Daily drills: 10 minutes of precision exercises targeting small clicks
- Macro pattern practice: Trace geometric shapes (circles, squares) for control development

**Mouse Accuracy for Different Professions**
- Graphic designers: Precision in small target selection, bezier curve control
- Video editors: Frame-precise timeline scrubbing
- Software developers: Small UI element clicking, code selection
- Competitive gamers: High-speed target acquisition under pressure
- Photo editors: Pixel-level brush control

**Hardware That Improves Mouse Accuracy**
- Gaming mousepads: Consistent surface texture eliminates friction variance
- Wrist rest: Reduces wrist fatigue that degrades accuracy over long sessions
- Ambidextrous mice: Better for some users who\'ve been using wrong shape
- Weights: Some mice have adjustable weights — heavier can improve accuracy for precise work`,
  },
  {
    id: 11,
    emoji: '🎯',
    tag: 'Aim',
    tagColor: 'var(--neon-orange)',
    date: 'Mar 5, 2025',
    title: 'Sniper Mode Training: Master Long-Range Precision Aim',
    excerpt: 'Sniper mode requires a completely different skillset than standard aiming. Learn the techniques that pro snipers use to guarantee first-shot accuracy.',
    readTime: '8 min read',
    body: `Sniper mode in aim training focuses on the most demanding precision skill in FPS gaming: single-shot, high-consequence accuracy. Unlike spray-and-pray mechanics, sniping demands that every shot counts.

**What Makes Sniper Aim Different**
Standard aiming allows for follow-up shots to correct misses. Sniper mechanics eliminate this safety net:
- Single shot to eliminate — no spray patterns to rely on
- Scope mechanics add a visual processing layer before shooting
- Bullet travel time requires target leading in many games
- High-pressure situations amplify the psychological challenge
- Slow fire rate punishes misses with long recovery time

**The 4 Core Sniper Skills**
- Scope flick accuracy: Moving scope to target and shooting in one motion
- Pre-aiming angles: Positioning scope at predicted enemy locations before they appear
- Hold angles: Maintaining steady aim on an angle while waiting
- Target leading: Shooting ahead of moving targets at range

**Sniper Mode Training Protocol**
Begin with our Sniper Mode tool using these progressions:

Week 1 — Stationary targets: Focus entirely on first-shot accuracy. Accept slow pace. Hit 90%+ before advancing.

Week 2 — Slow movement: Track slowly moving targets. Learn the rhythm of smooth scope movement.

Week 3 — Fast movement: Introduce faster targets. Practice flicking and following simultaneously.

Week 4 — Mixed scenarios: Random target types and speeds. Simulates real game conditions.

**Scope Mechanics and Breath Control**
Top sniper players describe a technique called "breath sync" — waiting for the natural pause between inhale and exhale before clicking. Even with a mouse, this mental pattern creates a moment of stillness that improves first-shot accuracy by 15-25% in testing.

**Counter-Intuitive Sniper Tips**
- Slower scope movement = more accurate shots (don\'t rush the aim)
- Pre-scope before committing — have general direction ready
- Don\'t hold breath too long — after 3 seconds, micro-tremors increase
- Un-scope between shots resets your visual processing (prevents tunnel vision)
- Position matters more than reaction — always hold angles from cover

**Common Sniper Mistakes**
- Scope rushing: Moving crosshair too fast, overshooting targets consistently
- Shooting while moving scope: Fire only when scope is momentarily still
- Predictable positioning: Enemies learn your angles — vary your spots
- Tunnel vision: Focusing only on known angles, getting flanked from others
- Emotional shooting: Missing once and rushing next shot in frustration

**Translating Sniper Mode Training to Real Games**
- AWP in CS2: Practice counter-strafing before scoping
- DMR in Apex: Lead running targets by 1-2 character widths at range
- Snipers in Warzone: Learn bullet drop compensation for 100m+ shots
- Bolt actions generally: Movement discipline is more important than raw aim

**Equipment for Sniper Precision**
- Lower sensitivity: Most pro AWPers use lower sens than riflers for precision
- High DPI + low in-game: Combines smooth tracking with precise micro-adjustments
- G-Sync/FreeSync: Reduces visual tearing that disrupts scope tracking
- High refresh monitor: 144Hz+ makes moving target tracking noticeably easier`,
  },
  {
    id: 12,
    emoji: '🚀',
    tag: 'Game',
    tagColor: 'var(--neon-cyan)',
    date: 'Feb 28, 2025',
    title: 'Space Defense Game: Strategy Guide and High Score Tips',
    excerpt: 'Master the Space Defense game with proven strategies, optimal upgrade paths, and the reflexes training techniques that top scorers use.',
    readTime: '6 min read',
    body: `Space Defense combines real-time strategy with reaction speed, creating one of the most engaging skill-testing games on our platform. This guide covers everything from beginner fundamentals to high-score strategies.

**Game Mechanics Overview**
In Space Defense, incoming threats approach from multiple directions and must be neutralized before breaching your defensive perimeter. The challenge escalates with:
- Increasing enemy speed across waves
- Multiple simultaneous threats requiring priority decisions
- Special enemy types with unique movement patterns
- Power-up management under time pressure

**The Priority System: What to Target First**
High-scoring players develop an instant priority hierarchy:
1. Fastest incoming threats (reach perimeter first if untouched)
2. Clustered threats (single shot or ability eliminates multiple)
3. Special/boss enemies (higher damage if they breach)
4. Slow single threats (can be deferred momentarily)

Developing this prioritization as instinct rather than conscious decision is the key difference between average and top scores.

**Optimal Upgrade Path**
Based on analysis of top scores, the efficient upgrade sequence:
- First: Range upgrades — see and engage threats earlier
- Second: Fire rate — handle multiple simultaneous threats
- Third: Damage — eliminate tougher enemies in fewer shots
- Fourth: Special abilities — situational but powerful in late waves

Resist upgrading health/defense early — offense score multipliers outweigh defensive benefits in early waves.

**Wave Pattern Recognition**
Each wave has patterns that repeat with variation. High scorers describe entering a state of "pattern flow" where responses become automatic:
- Wave 1-5: Learn the basic movement patterns
- Wave 6-15: Mixed patterns — practice priority decisions
- Wave 16+: Speed increases require pre-aiming at predicted positions

**The Reaction-Strategy Balance**
Space Defense uniquely demands both raw reaction speed and strategic thinking simultaneously. Use our Reaction Time Test to benchmark your base reaction speed. Players with under 200ms reaction time have a measurable advantage in late waves where multiple fast threats appear simultaneously.

**High Score Psychology**
Top scorers consistently report:
- Playing in sessions under 45 minutes (mental fatigue degrades performance sharply)
- Warm-up rounds at lower difficulty before attempting high score runs
- Post-session analysis of where score multiplier broke down
- Consistent time of day for play when reaction time is personally optimal

**Technical Performance Tips**
- Frame rate: Higher FPS makes fast-moving threats visually trackable
- Input latency: Wired connection or polling rate optimization reduces click-to-action delay
- Screen resolution: Higher resolution makes small targets more distinguishable
- Monitor position: Center of screen at eye level reduces head movement fatigue`,
  },
  {
    id: 13,
    emoji: '🌌',
    tag: 'Game',
    tagColor: 'var(--neon-green)',
    date: 'Feb 20, 2025',
    title: 'Voyager Game Guide: Navigation Challenges and Skill Progression',
    excerpt: 'The Voyager game tests precision control, spatial awareness, and patience. Here\'s how to progress through every challenge level.',
    readTime: '7 min read',
    body: `The Voyager game challenges players to navigate through increasingly complex spatial environments, testing precision mouse control, spatial reasoning, and sustained concentration. It\'s one of our most skill-demanding games.

**Understanding Voyager\'s Core Mechanics**
Voyager tests three distinct skills simultaneously:
- Precision path navigation: Moving through narrow corridors without touching walls
- Spatial memory: Remembering path layouts to anticipate turns
- Sustained concentration: Maintaining focus through long sequences without errors
- Speed-accuracy tradeoff: Balancing fast progression with error avoidance

**Beginner Progression Guide**
New players should focus on these fundamentals first:

Fundamental 1 — Mouse control smoothness: Jerky, rushed movements cause wall contact. Practice slow, deliberate navigation before increasing speed.

Fundamental 2 — Look ahead: Your attention should be 2-3 turns ahead of your current position. Players who look only at their current position are always reacting too late.

Fundamental 3 — Path centerline: Navigate through the exact center of passages. This provides maximum margin for error on both sides.

Fundamental 4 — Corner technique: Slow down before corners, accelerate through them. Rushing into corners is the #1 beginner mistake.

**Intermediate Strategies**
Once fundamentals are solid:
- Develop pattern memory for recurring maze configurations
- Identify "safe zones" — wide sections where you can briefly recover focus
- Use micro-pauses before difficult sections — brief stillness resets your cursor to center
- Build speed gradually — add 10% speed to each session\'s personal best

**Advanced Technique: Flow State Navigation**
Expert Voyager players describe a flow state where navigation becomes semi-automatic. To access this state:
- Complete 10-15 minutes of easy levels to warm up
- Gradually increase difficulty until you\'re at your challenge threshold
- At the right difficulty, conscious thought reduces to path prediction only
- Your hands handle execution automatically while your mind stays 3-5 turns ahead

**The Concentration Factor**
Voyager uniquely punishes mental fatigue. Performance data shows:
- First 5 minutes: Performance improves as you warm up
- Minutes 5-20: Peak performance window
- After 20 minutes: Error rate increases significantly
- Optimal session length: 15-20 minute focused sessions

**Using Mouse Accuracy Training to Improve Voyager**
Our Mouse Accuracy Test and Voyager share the same underlying skill: precise cursor placement under time pressure. Players who score above 95% in mouse accuracy typically progress 2x faster through Voyager difficulty levels. Alternate between both tools in each training session for cross-training benefits.

**Voyager-Specific Mouse Settings**
- Lower DPI: 400-800 DPI provides more control for narrow navigation
- Disable mouse acceleration: Consistent movement response is critical for muscle memory
- Slow cursor speed: OS cursor speed should be moderate — not maximum
- Large mousepad: Prevents running out of space during wide navigation movements

**Community High Score Strategies**
Top Voyager scorers share these advanced insights:
- Memorize the first 30% of each map layout — the rest often follows patterns
- Use the "ghost line" technique — mentally project your path before moving
- Breathe steadily — breath holding creates micro-tension that disrupts smooth movement
- Practice the hardest section of each level 20+ times in isolation before full runs`,
  },
  {
    id: 14,
    emoji: '⚡',
    tag: 'CPS',
    tagColor: 'var(--neon-red)',
    date: 'Feb 15, 2025',
    title: 'CPS Rush: How to Dominate Speed Clicking Challenges',
    excerpt: 'CPS Rush is the ultimate test of sustained click speed under pressure. Master the techniques and mental strategies to achieve top scores.',
    readTime: '6 min read',
    body: `CPS Rush takes the click speed challenge to its extreme — testing not just your peak click rate but your ability to sustain maximum clicking speed under the pressure of a countdown timer. It\'s the most psychologically demanding click speed challenge we offer.

**What Makes CPS Rush Different from Standard CPS Test**
The standard CPS test gives you a relaxed window to click freely. CPS Rush adds:
- Time pressure that causes psychological interference with physical performance
- Score multipliers that reward sustained consistency over peak bursts
- Dynamic difficulty that accelerates as your score increases
- Penalty systems that punish inconsistency more than slow speed

**The Psychology of Speed Under Pressure**
Research in motor performance shows that conscious focus on speed actually reduces speed. This is known as "paralysis by analysis" or "choking." In CPS Rush:
- Thinking about clicking slows you down
- Focusing on score instead of clicking also slows you down
- The optimal mental state is relaxed focus on a point beyond the task

Elite performers in CPS Rush describe their mental state as "watching themselves click from a distance" — dissociating conscious thought from physical execution.

**Physical Preparation for CPS Rush**
- Warm up hands with 30 seconds of gentle finger flexing before each attempt
- Maintain room temperature above 18°C — cold hands dramatically reduce dexterity
- Keep your clicking hand at a relaxed 90-degree angle at elbow
- Ensure your mouse is at proper height — too low creates wrist strain that slows clicking

**The 3 Clicking Techniques Compared in Rush Mode**
Regular Clicking in Rush Mode:
- Sustainable for the full duration
- Average 6-8 CPS maintained
- Lowest fatigue, best consistency
- Recommended for scores: Good to Great

Jitter Clicking in Rush Mode:
- Peaks at 10-13 CPS but fatigues after 15-20 seconds
- Requires deliberate rest periods
- High variance in score — risky strategy
- Recommended for scores: Great to Elite (experienced only)

Butterfly Clicking in Rush Mode:
- Highest potential CPS (14-20)
- Significant coordination overhead — inconsistency penalty risk
- Requires weeks of technique development
- Recommended for: World-record attempts only

**Pacing Strategy for Maximum Score**
The most common CPS Rush mistake is starting too fast and fatiguing. Optimal strategy:
- Start at 80% of your maximum click speed
- Maintain this pace through the first half
- Increase to 90% in the second quarter
- Maximum effort in final 10-15 seconds only

This pacing consistently outscores those who start at maximum and fade.

**Building CPS Rush Endurance**
Train specifically for sustained clicking:
- Daily: 3 sets of 30-second maximum clicking with 60-second rest between sets
- Weekly: One session of 2-minute sustained moderate-speed clicking for endurance
- Progressive overload: Add 5 seconds to your endurance sets each week
- Track your CPS consistency — the gap between your best and worst 5-second intervals shows your endurance level

**Common Mistakes That Kill Your CPS Rush Score**
- Death grip: Squeezing the mouse stiffens fingers and reduces click speed
- Wrong posture: Hunching creates tension throughout the arm chain
- Inconsistent rhythm: Penalty-triggering irregular clicking patterns
- Mental checking: Glancing at score mid-attempt disrupts physical rhythm
- Premature fatigue: Not warming up causes earlier-than-necessary performance drop`,
  },
  {
    id: 15,
    emoji: '🖱️',
    tag: 'Mouse',
    tagColor: 'var(--neon-green)',
    date: 'Feb 10, 2025',
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
- Low trigger actuation force (less than 0.5N)
- No debounce delay (optical switches preferred)
- Lightweight design (under 70g)
- Comfortable grip for your hand size

**Clicking Techniques:**
- Regular Click: 4-8 CPS — sustainable for long gaming sessions
- Jitter Clicking: 8-14 CPS — vibrate your arm muscles
- Butterfly Click: 10-20 CPS — two fingers alternating (may void warranty)

Always check your mouse manufacturer\'s warranty policy before attempting advanced clicking techniques.`,
  },
  {
    id: 16,
    emoji: '⚡',
    tag: 'Reaction',
    tagColor: 'var(--neon-orange)',
    date: 'Feb 5, 2025',
    title: 'Science-Backed Methods to Reduce Your Reaction Time',
    excerpt: 'Sleep, training schedules, and warm-up drills that elite FPS players use to stay at peak performance.',
    readTime: '7 min read',
    body: `Elite FPS players maintain reaction times of 150-200ms through deliberate lifestyle optimization. Here\'s what science says works:

**Sleep: The #1 Factor**
Research shows that 7-9 hours of quality sleep reduces reaction time by up to 30%. Even one night of poor sleep (under 6 hours) can increase reaction time by 50ms — a massive disadvantage in competitive play.

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
];

export default function BlogPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState('All');

  const tags = ['All', 'Typing', 'CPS', 'Reaction', 'Aim', 'Spacebar', 'Keyboard', 'Mouse', 'Game'];
  const filtered = filter === 'All' ? posts : posts.filter(p => p.tag === filter);
  const post = posts.find(p => p.id === selected);

  if (post) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <button
          onClick={() => setSelected(null)}
          className="btn btn-secondary"
          style={{ marginBottom: '2rem', fontSize: '0.875rem' }}
        >
          ← Back to Blog
        </button>

        <div
          style={{
            background: `${post.tagColor}15`,
            height: '160px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '5rem',
            marginBottom: '2rem',
            border: `1px solid ${post.tagColor}30`,
          }}
        >
          {post.emoji}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              padding: '0.3rem 0.7rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '700',
              background: `${post.tagColor}15`,
              color: post.tagColor,
            }}
          >
            {post.tag}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{post.date}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>📖 {post.readTime}</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            fontWeight: '800',
            marginBottom: '1.5rem',
            lineHeight: '1.3',
          }}
        >
          {post.title}
        </h1>

        <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.9' }}>
          {post.body.split('\n\n').map((para, i) => (
            <p key={i} style={{ marginBottom: '1.25rem' }}>
              {para.split('\n').map((line, j) => (
                <span key={j}>
                  {line.startsWith('**') && line.endsWith('**') ? (
                    <strong style={{ color: 'var(--text-primary)' }}>{line.slice(2, -2)}</strong>
                  ) : line.startsWith('- ') ? (
                    <span
                      style={{
                        display: 'block',
                        paddingLeft: '1rem',
                        borderLeft: `2px solid ${post.tagColor}`,
                        margin: '0.25rem 0',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {line.slice(2)}
                    </span>
                  ) : (
                    line
                  )}
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="section-label">Knowledge Base</div>
        <h1 className="tool-title">SkillTest Blog</h1>
        <p className="tool-subtitle">
          Guides, tips, and insights to level up your gaming and typing skills
        </p>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}
      >
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              border:
                filter === tag ? '1px solid var(--neon-cyan)' : '1px solid var(--border)',
              background:
                filter === tag ? 'rgba(0,245,255,0.1)' : 'var(--bg-card)',
              color:
                filter === tag ? 'var(--neon-cyan)' : 'var(--text-secondary)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => setSelected(p.id)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = p.tagColor;
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
            <div
              style={{
                height: '120px',
                background: `linear-gradient(135deg, ${p.tagColor}15, transparent)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {p.emoji}
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    background: `${p.tagColor}15`,
                    color: p.tagColor,
                  }}
                >
                  {p.tag}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.date}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {p.readTime}
                </span>
              </div>
              <h3
                style={{
                  fontWeight: '700',
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  lineHeight: '1.4',
                }}
              >
                {p.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                {p.excerpt}
              </p>
              <div
                style={{
                  marginTop: '1rem',
                  color: p.tagColor,
                  fontWeight: '600',
                  fontSize: '0.85rem',
                }}
              >
                Read more →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
