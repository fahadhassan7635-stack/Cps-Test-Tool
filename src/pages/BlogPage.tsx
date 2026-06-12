import { useState } from 'react';

const posts = [
  {
    id: 1,
    emoji: '⌨️',
    tag: 'Typing',
    tagColor: 'var(--neon-cyan)',
    date: 'May 2, 2025',
    title: 'How to Go From 60 to 120 WPM in 30 Days',
    excerpt: 'Stop randomly smashing keys. Here is the exact roadmap used by competitive typists to double their speed without ruining their accuracy.',
    readTime: '8 min read',
    body: `Stuck at 60 WPM? You're not alone. Hitting 120 WPM isn't about moving your fingers faster—it's about moving them smarter. If you're tired of being average, here is the exact 30-day roadmap to double your speed.

**Week 1: Unlearn Your Bad Habits**
Stop looking at your hands. Seriously. Put a towel over your keyboard if you have to. Learn the home row (ASDF and JKL;) properly. You will type slower this week. Accept it, and let your muscle memory reset.

**Week 2: The Accuracy Phase**
Speed comes from not hitting the backspace key. If you are typing 100 WPM but hitting backspace every four seconds, you are actually typing 60 WPM. Slow down and aim for a strict 98% accuracy rate.

**Week 3: Push Your Limits**
Now we sprint. Do 60-second bursts where you intentionally type just a little faster than you're comfortable with. You will make mistakes, but you are forcing your brain to process words faster. 

**Week 4: Real-World Application**
Stop practicing random letters. Practice the 200 most common English words. They make up 50% of everything you will ever type. 

**The Hard Truth:**
- 15 minutes of daily practice beats a 2-hour marathon on Sunday
- Fix the specific keys you always miss instead of just typing randomly
- Good posture actually matters for wrist stamina
- A mechanical keyboard won't magically fix bad finger placement`,
  },
  {
    id: 2,
    emoji: '🖱️',
    tag: 'CPS',
    tagColor: 'var(--neon-green)',
    date: 'Apr 28, 2025',
    title: 'CPS Test: What Is Clicks Per Second and How to Improve It',
    excerpt: 'Everything from Minecraft PvP mechanics to world records. Learn how to increase your raw click speed without giving yourself carpal tunnel.',
    readTime: '7 min read',
    body: `Clicks Per Second (CPS) is the holy grail metric for Minecraft PvP, osu! players, and clicker game addicts. If you want to know how you stack up or how to physically click faster, here is the breakdown.

**Where Do You Stand?**
Let's be real about the numbers:
- 1 to 5 CPS: You are just casually browsing the web
- 6 to 9 CPS: Average gamer. Totally fine for most casual games
- 10 to 14 CPS: Sweaty PvP territory. This is where you start taking less knockback in Minecraft
- 15+ CPS: You are either butterfly clicking like a madman or breaking your mouse

**How People Actually Click Faster**
- Normal Clicking: Just your index finger. Caps out around 8 CPS. Safe, accurate, and won't ruin your aim.
- Jitter Clicking: Flexing your forearm to vibrate your finger. Gets you 10 to 14 CPS but makes your crosshair shake violently.
- Butterfly Clicking: Slapping the left click with two fingers interchangeably. Insanely fast (15+ CPS), but banned on a lot of servers.

**Hardware Matters**
If your mouse is heavy and has stiff clicks, your CPS will naturally be lower. Look for mice with optical switches—they don't have the internal debounce delay that slows down mechanical switches.

**Quick Tips to Improve:**
- Do 5-second tests. 60-second tests just ruin your stamina
- Angle your hand so your finger rests naturally, don't force an awkward grip
- Stretch your wrists! Carpal tunnel is not worth a Bedwars win`,
  },
  {
    id: 3,
    emoji: '⚡',
    tag: 'Reaction',
    tagColor: 'var(--neon-orange)',
    date: 'Apr 20, 2025',
    title: 'Reaction Time Test: Average Scores and How to Get Faster',
    excerpt: 'Dying before you even see the enemy? Here is the science behind gaming reaction times and the setup tweaks that actually make you faster.',
    readTime: '8 min read',
    body: `In games like Valorant or CS2, dying before you even realize you saw the guy is the worst feeling. Your reaction time dictates who wins the duel. Here is how to measure it and actually make it faster.

**What Is a Good Reaction Time?**
- 150ms or less: Absolute freak of nature. Pro player genetics or a god-tier setup
- 150 to 190ms: Super competitive. You probably win most of your raw aim duels
- 200 to 250ms: The global average. Totally normal
- 250ms+: You might be playing on a TV, or you desperately need some coffee

**The Secret Killers of Reaction Time**
Most people don't have slow brains, they just have bad habits and bad setups:
- Sleep: Playing on 5 hours of sleep adds about 30ms to your delay. It's like playing on a bad server.
- Refresh Rate: A 60Hz monitor puts you 16ms behind a 144Hz monitor automatically.
- Cold Hands: If your hands are freezing, your fingers physically cannot click fast enough.

**Can You Actually Get Faster?**
Yes, but only to a point. You can't change your basic biology, but you can train your anticipation. Pros don't just react faster; they pre-aim where the action is going to happen so they have less thinking to do.

**The Pre-Game Warmup:**
- Do 5 minutes of raw reaction testing before booting up ranked
- Drink some water (even mild dehydration kills your focus)
- Make sure your room isn't freezing cold`,
  },
  {
    id: 4,
    emoji: '🎯',
    tag: 'Aim',
    tagColor: 'var(--neon-red)',
    date: 'Apr 10, 2025',
    title: 'Aim Trainer Guide: How to Build Elite FPS Aim From Scratch',
    excerpt: 'Stop mindlessly shooting at dots. Learn the structured routine that FPS coaches use to build god-tier mouse control.',
    readTime: '10 min read',
    body: `Booting up an aim trainer and wildly flicking at dots for an hour isn't going to make you a Radiant player. You need a structured routine. Here is how to actually build raw mechanical aim from the ground up.

**Step 1: Fix Your Sensitivity**
Stop changing your DPI every time you have a bad game. Find a sensitivity between 200 and 400 eDPI (your mouse DPI multiplied by in-game sens) and stick to it. Muscle memory takes weeks to build.

**The Holy Trinity of Aiming**
- Flicking: Snapping to a target instantly. Looks flashy, but is actually the least reliable way to aim.
- Tracking: Keeping your crosshair glued to a moving target. Essential for Apex Legends or Overwatch.
- Micro-adjustments: That tiny little movement to hit the headshot when your flick was slightly off. This is what wins fights.

**The 30-Day Blueprint**
- Week 1: Go slow. Focus on drawing a straight line from point A to point B without curving your mouse path.
- Week 2: Add tracking. Stop tensing your arm so hard; keep your wrist relaxed.
- Week 3: Shrink the targets. Force yourself to be precise, not just fast.
- Week 4: Play dynamic scenarios where targets move unpredictably.

**Things to Remember:**
- Good crosshair placement beats good flicking 9 times out of 10
- 15 minutes of focused aim training is better than 2 hours of autopilot grinding
- Aim trainers are a gym, not the main game. Don't stress over high scores`,
  },
  {
    id: 5,
    emoji: '🚀',
    tag: 'Spacebar',
    tagColor: 'var(--neon-cyan)',
    date: 'Apr 5, 2025',
    title: 'Spacebar Counter: How Fast Can You Press the Spacebar?',
    excerpt: 'From Geometry Dash timings to CS2 movement tech, the spacebar is your most abused key. Here is how to tap it faster.',
    readTime: '5 min read',
    body: `It sounds like a meme, but spacebar speed is a legitimate skill. The spacebar is the biggest, most abused key on your board. Whether you're bunny-hopping in CS2, playing rhythm games like osu!, or just speed typing, spacebar timing is everything.

**What Is a Fast Spacebar Speed?**
Hitting 8 presses a second is solid. If you can maintain 11+ across a 10-second test, you either play way too much Geometry Dash or you have insane thumb stamina. 

**Techniques to Increase Speed**
- Single thumb: Keep your thumb rigid and vibrate your wrist. Good for short bursts.
- Two-thumb technique: Alternate left and right thumbs rapidly. This easily boosts your score by 20%.
- The hover: Don't let your thumb leave the surface of the keycap. Minimize travel distance.

**Why Your Keyboard Matters**
Not all spacebars are created equal. Linear switches (like Cherry MX Reds) are way better for rapid tapping than clicky switches. Since they don't have a tactile bump, you can rapidly flutter your thumb without fighting the keyboard's resistance. 

**Pro Tips:**
- Warm up your hands. Cold thumbs lock up instantly
- Cheaper membrane keyboards might literally not register hits as fast as you can press
- Test on the 10-second mode to see if your stamina drops off a cliff`,
  },
  {
    id: 6,
    emoji: '⌨️',
    tag: 'Keyboard',
    tagColor: 'var(--neon-green)',
    date: 'Mar 30, 2025',
    title: 'Key Visualizer: How to Test Keyboard Ghosting and NKRO',
    excerpt: 'Is your budget keyboard dropping inputs during intense fights? Learn how to use a visualizer to test your hardware limits.',
    readTime: '6 min read',
    body: `A Key Visualizer is a live, on-screen display of exactly what your keyboard is doing. Sure, it looks cool on a Twitch stream, but it's actually the ultimate diagnostic tool to find out if your keyboard is holding you back.

**What Is Keyboard Ghosting?**
This is the main reason you need a visualizer. Cheap keyboards can only process 3 or 4 keys at a time. Mash your WASD keys, hold Shift, and hit Space. Did one of those keys not light up on the visualizer? That's ghosting. It means your keyboard literally stopped sending signals, which will get you killed in FPS games.

**N-Key Rollover (NKRO)**
Gaming keyboards advertise "NKRO". This means no matter how many keys you press at the exact same time, every single one registers. Test this by pressing down your entire left hand on the board. 

**For Streamers and Rhythm Gamers**
If you play osu!, Clone Hero, or do speedruns, viewers want to see your inputs. You can add our Key Visualizer as a Browser Source in OBS. Just drop the URL in, set a transparent background, and you instantly have a live input overlay.

**Things to Look Out For:**
- Keys that flicker or double-register on a single press (hardware defect)
- Finding out which finger you incorrectly favor for hitting the spacebar
- Testing if your custom AutoHotkey or QMK macros are firing properly`,
  },
  {
    id: 7,
    emoji: '🖱️',
    tag: 'Mouse',
    tagColor: 'var(--neon-red)',
    date: 'Mar 25, 2025',
    title: 'Double Click Test: Diagnose Dying Mouse Switches',
    excerpt: 'Is your mouse firing twice when you only clicked once? Here is how to test for switch bounce and save your hardware.',
    readTime: '6 min read',
    body: `We have all been there. You click to drag a file, and it opens it instead. Or you shoot a single bullet in a game, and your gun fires twice. You aren't going crazy—your mouse switch is probably dying. 

**What Is Switch Bounce?**
Inside a gaming mouse is a tiny metal spring. When you click, the metal touches a contact point. Over time, that spring gets weak. When you click it once, the metal physically "bounces" against the contact multiple times. To your computer, it looks like you just double-clicked at the speed of light.

**How to Read the Test Results**
Our Double Click Test measures the exact millisecond gap between your clicks. 
- Human double-clicks usually have a gap of 80ms to 150ms.
- If our graph shows a gap of 10ms to 30ms, that is a hardware defect. A human finger cannot physically bounce that fast.

**How to Fix It**
Before you throw the mouse away, try this:
- Increase Debounce Time: Open your mouse software (Razer Synapse, Logitech G Hub) and look for debounce settings. Turn it up to 10ms or 12ms.
- The Windows Fix: Max out the double-click speed in your Windows Control Panel. It's a band-aid, but it works temporarily.

**The Harsh Reality:**
- Older Logitech mice (using Omron 50M switches) are notorious for this issue
- Modern optical switches (which use lasers instead of metal springs) literally cannot double-click
- If your mouse is out of warranty, soldering a new switch costs 2 dollars and takes 10 minutes`,
  },
  {
    id: 8,
    emoji: '⌨️',
    tag: 'Typing',
    tagColor: 'var(--neon-cyan)',
    date: 'Mar 20, 2025',
    title: 'Keyboard Accuracy Test: Why Precision Beats Raw Speed',
    excerpt: 'A 100 WPM typist with bad accuracy is slower than an 80 WPM typist. Here is why the backspace key is your worst enemy.',
    readTime: '7 min read',
    body: `Everyone flexes their WPM, but nobody talks about the metric that actually dictates real-world speed: accuracy. Hitting keys fast means absolutely nothing if you have to hit the backspace key every five seconds.

**The Backspace Penalty**
Think about what happens when you make a typo. You have to realize you made the mistake, stop your flow, hit backspace, type the correct key, and restart your momentum. That single typo just cost you the time it takes to type an entire word. 

**The Math Doesn't Lie**
- A typist going 80 WPM at 99% accuracy will finish an email faster than a 110 WPM typist going 85% accuracy.
- In programming, 99% accuracy isn't optional. One missed semicolon breaks the whole build.

**How to Fix Your Sloppy Typing**
Our Keyboard Accuracy test forces you to slow down and exposes your worst habits. 
- Find your problem keys. Are you constantly hitting 'r' instead of 't'? Your muscle memory is slightly skewed.
- Practice typing words that contain those specific keys at half speed.

**The Golden Rules of Accuracy:**
- 95% is the absolute minimum standard. Anything lower, and you are wasting your own time
- Rushing causes tension, and tension causes typos. Relax your hands
- Don't practice with random words. Practice with punctuation and numbers, as that's where most errors happen`,
  },
  {
    id: 9,
    emoji: '↕️',
    tag: 'Mouse',
    tagColor: 'var(--neon-green)',
    date: 'Mar 15, 2025',
    title: 'Scroll Test: Measure Your Mouse Wheel Speed and Health',
    excerpt: 'From bunny-hopping in games to scrolling giant codebases. Check if your mouse encoder is skipping ticks or dying.',
    readTime: '5 min read',
    body: `Nobody thinks about their scroll wheel until it starts acting up. Whether you are navigating massive spreadsheets or binding "Jump" to scroll-down in Apex Legends, your mouse wheel needs to be fast and flawless.

**Why Test Your Scroll Wheel?**
Over time, the mechanical encoder inside your mouse gets filled with dust, pet hair, or just wears out. You might scroll down, but the screen jumps up for a split second. Our Scroll Test graphs out every single tick. If your graph has random dips or backward spikes, your hardware is failing.

**Wheel Types and Speeds**
- Standard Notched Wheels: You feel a physical "bump" every step. These usually max out around 10 to 15 ticks per second. Great for precise weapon switching.
- Infinite Scroll Wheels: Mice like the Logitech G502 let you unlock the wheel to spin freely. You can easily hit 60 to 80 ticks per second. 

**Gaming Applications**
In CS2 and Apex Legends, players bind jump to the scroll wheel. Why? Because sending 10 jump inputs in a fraction of a second guarantees you hit the exact frame required for bunny-hopping or tap-strafing.

**Quick Fixes for Bad Wheels:**
- Blow compressed air directly into the gaps of the wheel. It fixes 80% of skipping issues
- Don't press down too hard while scrolling; it grinds the encoder faster
- If you use infinite scroll for gaming, be careful not to accidentally bump it mid-fight`,
  },
  {
    id: 10,
    emoji: '🖲️',
    tag: 'Aim',
    tagColor: 'var(--neon-red)',
    date: 'Mar 10, 2025',
    title: 'Mouse Accuracy Test: Find Your Perfect DPI',
    excerpt: 'Higher DPI does not mean better aim. Learn how to track your cursor path and find the sensitivity that actually fits your hand.',
    readTime: '7 min read',
    body: `Mouse accuracy is entirely different from reaction time. It’s the raw measure of your hand-eye coordination. If you consistently miss the X button on a browser window, or overshoot heads in Valorant, your sensitivity settings are messing with you.

**The DPI Myth**
Gaming mice advertise 25,000+ DPI like it's a superpower. It's a marketing gimmick. Most FPS pros play at 400 or 800 DPI. Why? Because at ultra-high DPI, every single heartbeat, coffee tremor, or deep breath translates into your cursor vibrating off the target.

**Path Efficiency Explained**
Our accuracy test doesn't just check if you hit the dot; it tracks the line you drew to get there. 
- A straight line means your muscle memory matches your sensitivity perfectly.
- A curved arc means you are pivoting entirely from your wrist instead of using your arm.
- A zig-zag at the end means your sensitivity is too high, and you are overshooting and having to pull back.

**How to Find Your Perfect DPI**
Run the test three times. Do it once at 400 DPI, once at 800, and once at 1600. Look at the data. The setting that gives you the straightest path and the highest hit percentage is your natural DPI. Stick to it.

**Pro Advice for Better Control:**
- Turn off "Enhance Pointer Precision" in Windows. It's mouse acceleration, and it ruins muscle memory
- Get a massive mousepad. Arm-aiming is far more accurate than wrist-aiming
- Clean your mouse skates. Friction variance kills precision`,
  },
  {
    id: 11,
    emoji: '🔭',
    tag: 'Aim',
    tagColor: 'var(--neon-orange)',
    date: 'Mar 5, 2025',
    title: 'Sniper Mode Training: Master Long-Range Precision Aim',
    excerpt: 'Sniping requires a totally different motor skill than rifle spray. Here is how to hold angles, stop shaking, and hit the micro-flicks.',
    readTime: '8 min read',
    body: `Standard aiming is fast, loose, and allows for corrections. Sniper aiming is completely different. When you hold an AWP or an Operator, you don't get a second chance. You need absolute, unwavering precision.

**The Difference in Mechanics**
When using an assault rifle, you react, flick, and pull down for recoil. When sniping, you pre-aim an angle, hold your mouse perfectly still, wait for the target to walk into your crosshair, and make a tiny micro-flick. It requires extreme patience and zero hand tremors.

**The Shaky Hand Problem**
If you notice your crosshair vibrating while holding an angle, you have too much tension in your arm. 
Here is a trick real shooters use: Pay attention to your breathing. Inhale, exhale halfway, and hold your breath gently while waiting for the click. It physically stabilizes your chest and arm.

**How to Stop Overshooting**
The biggest mistake snipers make is flicking too hard and shooting past the target. 
- First, lower your scoped sensitivity in-game. Pros often set their scope multiplier to 0.8x or 0.9x.
- Second, practice the "pull and hold." Intentionally flick slightly past the target, and smoothly drag back to it, rather than trying to violently stop on a dime.

**Training Tips for Snipers:**
- Never practice sniper flicks and tracking in the same session. It confuses your brain
- Play off-angles. Your raw aim doesn't matter if the enemy pre-fires your obvious hiding spot
- Don't stare at the crosshair. Stare at the corner the enemy is going to peek from`,
  },
  {
    id: 12,
    emoji: '🚀',
    tag: 'Game',
    tagColor: 'var(--neon-cyan)',
    date: 'Feb 28, 2025',
    title: 'Space Defense Game: Master Aim Under Pressure',
    excerpt: 'Raw aim is useless if you panic when things get chaotic. Learn how to prioritize targets and maintain high CPS with accuracy.',
    readTime: '6 min read',
    body: `Anyone can hit 12 CPS on a massive, stationary square. Anyone can hit a headshot when they have 5 seconds to line it up. But can you maintain your clicking speed while tracking multiple moving targets? Space Defense bridges the gap between raw stats and actual gaming pressure.

**The Trap of Panic Clicking**
The game punishes you for spamming. If you wildly click empty space hoping to hit a ship, your accuracy multiplier tanks. The player who clicks deliberately at 7 CPS with 90% accuracy will completely obliterate the player frantically mashing 14 CPS at 40% accuracy.

**Target Prioritization**
High-scoring players don't look at the cluster of enemies at the top of the screen. They develop an instant hierarchy:
1. Fastest threats near the bottom
2. Armored threats that require multiple clicks
3. Clustered threats on the edges

If you look at the whole swarm, your brain freezes. Focus on the lowest line of defense.

**Why This Helps Your Real Gameplay**
This game trains your brain to handle visual clutter. In games like Overwatch or Apex Legends, team fights are a mess of visual effects and multiple targets. Space Defense trains you to ignore the noise, pick a target, track it smoothly, and execute your clicks without tensing up your arm.

**Strategies for High Waves:**
- Stop aiming where the ship is; click slightly ahead of its path
- Do not hold your breath. Oxygen starvation ruins fine motor control
- Keep your wrist planted. Large arm movements are too slow for the later waves`,
  },
  {
    id: 13,
    emoji: '🌌',
    tag: 'Game',
    tagColor: 'var(--neon-green)',
    date: 'Feb 20, 2025',
    title: 'Voyager Game: Evasion, Flow State, and Mouse Control',
    excerpt: 'Aim trainers teach you to hit targets. Voyager teaches you how to maneuver smoothly around obstacles without crashing.',
    readTime: '7 min read',
    body: `The Voyager game is pure flow state. You pilot a spacecraft with your cursor through an endlessly accelerating asteroid field. There is no shooting, no enemies to click—just pure, unadulterated mouse control and spatial awareness.

**Why Evasion Matters**
Aim trainers teach you to move your mouse *to* an object. Voyager teaches you to maneuver your mouse *around* objects smoothly. If your mouse movements are jerky and anxious, you will crash immediately. You have to glide.

**The "Look Ahead" Technique**
Beginners crash because they are staring at their own ship. Expert players don't even look at their ship—they are staring at the top half of the screen, mapping out the gaps 2 or 3 seconds before they even reach them. Your peripheral vision will keep your ship safe; your central focus needs to be on the future.

**Inducing the Flow State**
To survive past the two-minute mark, you have to let your subconscious take over. 
- Turn off your second monitor stream. 
- Put on instrumental music. 
- Let your eyes relax and take in the whole screen rather than darting around.

**The Ultimate Warm-Up:**
Playing Voyager for 5 minutes before booting up a ranked match is incredible. It forces simultaneous activation of visual processing and fine motor control. It wakes your brain up faster than any coffee ever could.`,
  },
  {
    id: 14,
    emoji: '💥',
    tag: 'CPS',
    tagColor: 'var(--neon-red)',
    date: 'Feb 15, 2025',
    title: 'CPS Rush: The Ultimate Burst Speed Challenge',
    excerpt: 'A 60-second test measures stamina. CPS Rush measures your absolute peak 1-rep max clicking speed. Can you survive 10 rounds?',
    readTime: '6 min read',
    body: `If the standard CPS test is a long-distance run, CPS Rush is a 1-rep max deadlift. You get 1 second to click as fast as humanly possible, followed by a 2-second break. Repeat for 10 grueling rounds. 

**Why Burst Speed Matters**
Think about a shotgun fight in Fortnite, or a quick sword trade in Minecraft. You don't need to click for 10 seconds straight; you just need absolute maximum speed for exactly 1 second to win the exchange. This test isolates that exact scenario.

**Reading Your Results**
Because this test is so short, most players will score 2 to 3 CPS higher here than they do on the standard 5-second test. 
But look closely at your round-by-round graph. 
- If your score is 14, 14, 13, 14... you have great technique.
- If your score goes 15, 12, 9, 7... you are tensing your hand way too hard and instantly burning out your fast-twitch muscles.

**How to Dominate the Rush**
- Relax during the 2-second break. Physically lift your finger off the mouse and breathe.
- If you are jitter clicking, the vibration should come from your forearm, not a death grip on the mouse.
- Use a mouse with low actuation force. Stiff clicks will ruin your 1-second burst potential.

**A Quick Warning:**
Do not play CPS Rush for an hour straight. Maximum tension bursts are taxing on your tendons. Do a few runs, get your high score, and give your hand a rest.`,
  },
  {
    id: 15,
    emoji: '🖱️',
    tag: 'Mouse',
    tagColor: 'var(--neon-green)',
    date: 'Feb 10, 2025',
    title: 'Best Gaming Mice for High CPS and Aim — 2025 Picks',
    excerpt: 'Your hardware matters. We break down the top mice used by pros for maximizing click speed and maintaining perfect tracking.',
    readTime: '6 min read',
    body: `Let's get one thing straight: a good mouse won't magically make you a pro. But a bad mouse will absolutely hold you back. Heavy shells, stiff switches, and bad sensors put a physical ceiling on your CPS and reaction time. Here is what the elite players are actually using right now.

**#1 Logitech G Pro X Superlight 2**
There is a reason half the pro scene uses this. At 60 grams, it feels like nothing is in your hand. The new hybrid optical-mechanical switches mean you get the satisfying "click" feel, but the laser actuation means zero debounce delay. Perfect for rapid clicking.

**#2 Razer DeathAdder V3 Pro**
If you have larger hands and hate the symmetrical egg shape of the Superlight, this is the king. Razer's optical switches are widely considered the fastest on the market for pure CPS spamming. It's incredibly easy to jitter click on this shell.

**#3 Endgame Gear XM2we**
The budget king. For under $90, you get optical switches, an insane coating for sweaty hands, and a shape that forces you into a perfect claw grip. It's built like a tank.

**What to Look For When Buying:**
- Weight: Keep it under 70g. Heavier mice cause micro-fatigue during long aim training sessions.
- Switches: Optical > Mechanical. Opticals literally cannot double-click and have lower input lag.
- Skates: PTF/Teflon feet are mandatory. If your mouse feels "sticky" on the pad, upgrade the skates, not the whole mouse.`,
  },
  {
    id: 16,
    emoji: '⚡',
    tag: 'Reaction',
    tagColor: 'var(--neon-orange)',
    date: 'Feb 5, 2025',
    title: 'Hardware Tweaks to Instantly Improve Reaction Time',
    excerpt: 'Stop blaming your reflexes. Your setup might be adding 30ms of input lag. Here is how to optimize Windows and your gear.',
    readTime: '7 min read',
    body: `You might think your reaction time is slow, but your computer might just be processing things like a toaster. Input lag is the silent killer in competitive gaming. Here is how to strip away the delay and get true 1-to-1 responsiveness.

**The Monitor Bottleneck**
If you are playing on a 60Hz monitor, you are seeing frames 16.6 milliseconds after they happen. A 144Hz monitor cuts that down to 6.9ms. A 240Hz monitor drops it to 4.1ms. Upgrading your monitor is the only "pay to win" shortcut in gaming. It literally lets you see the enemy earlier.

**Optimize Windows for Gaming**
Windows has a ton of background junk that causes micro-stutters:
- Turn on "Game Mode" in Windows settings
- Turn OFF "Enhance Pointer Precision" (this is built-in mouse acceleration)
- Make sure your mouse is plugged directly into the motherboard IO, not a USB hub or monitor passthrough.

**Polling Rate Matters**
Go into your mouse software. Is your polling rate set to 125Hz or 500Hz? Change it to 1000Hz immediately. This tells the mouse to report its position to the PC one thousand times a second, rather than just 125. 

**NVIDIA Reflex & AMD Anti-Lag**
If your game supports it (Valorant, CS2, Apex do), turn these settings ON in the video menus. They prevent your CPU and GPU from holding frames in a queue, dropping your overall system latency by a massive margin.

**The Reality Check:**
Once you do all these tweaks, take the Reaction Time Test again. If your score drops by 20ms, it wasn't your brain holding you back—it was your hardware.`,
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
