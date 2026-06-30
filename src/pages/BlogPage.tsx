import { useState } from 'react';

const posts = [
  {
    id: 1,
    emoji: '⌨️',
    tag: 'Typing',
    tagColor: 'var(--neon-cyan)',
    title: 'WPM Typing Test Guide: How to Actually Hit 120+ WPM',
    excerpt: 'Stuck at 60 WPM? Stop randomly smashing keys. Here is the exact typing practice routine used by competitive typists to double their speed without hand pain.',
    readTime: '8 min read',
    body: `If you are stuck hovering around 60 to 70 WPM, I know exactly how frustrating it is. You feel like your fingers are moving as fast as humanly possible, but the numbers just won't go up. Mashing the keyboard harder isn't the fix. Hitting 120+ WPM requires a complete reset of how your brain maps your keyboard.

**Stop Looking at Your Hands (Seriously)**
This is the hardest pill to swallow. If you are looking down, you have a hard speed cap of about 80 WPM. Put a towel over your hands while you take a typing test. You are going to drop down to 30 WPM for a few days, and it will be miserable. But once your muscle memory locks in the home row (ASDF and JKL;), your speed will permanently skyrocket.

**Accuracy is Speed in Disguise**
Here is the math nobody talks about: hitting the backspace key costs you an entire word's worth of time. If you type at 120 WPM but your accuracy is 85%, your actual output is slower than a guy typing 80 WPM with 99% accuracy. Slow down. Don't speed up until you can hit 98% accuracy consistently on a WPM typing test.

**The 15-Minute Daily Routine**
Don't grind a typing test for 3 hours straight on a Sunday. Your fingers will fatigue, and you'll build bad habits. 
- 5 minutes: Warm up with a basic alphabet typing drill.
- 5 minutes: Practice the 200 most common English words (they make up half of everything you type online).
- 5 minutes: Try to set a new personal best on a 60-second typing test.

**Does Hardware Matter?**
Yes and no. A $200 custom mechanical keyboard won't magically make you type 140 WPM. However, switching from a mushy laptop membrane keyboard to a board with tactile switches (like Cherry MX Browns) will absolutely reduce your typo rate, giving you an instant small boost in your effective WPM.`
  },
  {
    id: 2,
    emoji: '🖱️',
    tag: 'CPS',
    tagColor: 'var(--neon-green)',
    title: 'CPS Test Secrets: How to Increase Your Clicks Per Second',
    excerpt: 'Want to take less knockback in Minecraft PvP? Here is the truth about jitter clicking, butterfly clicking, and getting a higher score on a CPS test.',
    readTime: '7 min read',
    body: `If you play Minecraft PvP, Bedwars, or literally any clicker game, you already know that your Clicks Per Second (CPS) is the holy grail metric. Getting your CPS higher isn't just about trying harder; it is an entirely physical skill. If you want to boost your score on a CPS test, here is how the top players actually do it.

**The Reality of CPS Scores**
Before we get into techniques, let's look at the benchmarks:
- 1 to 5 CPS: Casual web browsing speed. 
- 6 to 9 CPS: Average gamer. You'll survive most casual games.
- 10 to 14 CPS: Sweaty PvP territory. This is where you start taking noticeably less knockback in Minecraft.
- 15+ CPS: You are using advanced clicking methods, or your mouse is doing the heavy lifting for you.

**How to Physically Click Faster**
You can't just normal-click your way to 15 CPS. Your index finger simply doesn't have the fast-twitch muscle fibers for it.
- **Jitter Clicking:** You tense up your forearm so hard that your hand physically vibrates over the left click. It gets you up to 14 CPS easily, but it makes your crosshair shake violently. (Also, doing this for hours hurts. A lot.)
- **Butterfly Clicking:** You alternate slapping the left click with your index and middle fingers. It looks goofy, but it easily pushes 15 to 20 CPS. 
- **Drag Clicking:** Dragging your finger across a matte mouse button so friction causes the switch to bounce dozens of times a second. Great for bridging in Minecraft, terrible for actual combat.

**The Hardware Cheat Code**
If your mouse has heavy, stiff switches, your CPS is going to suck no matter how good your technique is. You want a gaming mouse with optical switches or very light mechanical switches (like the Razer DeathAdder or Logitech G Pro X). Also, check your mouse software to see if you can lower the "Debounce Time". Lower debounce means the mouse registers clicks faster, instantly boosting your CPS test results.`
  },
  {
    id: 3,
    emoji: '⚡',
    tag: 'Reaction',
    tagColor: 'var(--neon-orange)',
    title: 'Reaction Time Test: Average Scores and How to Get Faster',
    excerpt: 'Dying before you even see the enemy in Valorant or CS2? Here is the science behind gaming reaction times and the setup tweaks that actually make you faster.',
    readTime: '8 min read',
    body: `We've all been there: you hold an angle in CS2 or Valorant, someone peeks, and you're dead before your brain even processes they were on your screen. You take a reaction time test, get 250ms, and assume you just have slow genetics. But what if your brain is fine, and your setup is just terrible?

**What is a Good Reaction Time?**
- Under 150ms: Absolute freak of nature. Pro player genetics (or you guessed early).
- 160ms to 190ms: Super competitive. You are going to win the vast majority of raw aim duels.
- 200ms to 250ms: The global average. Totally normal for a healthy adult.
- 260ms+: You are probably sleep-deprived, playing on a TV, or using wireless gear from 2012.

**The Secret Killers of Reaction Time**
Your biological reaction time is only part of the equation. "System Latency" is the massive hidden delay that is holding you back.
- **Refresh Rate:** If you are playing on a 60Hz monitor, you are literally seeing the game 16 milliseconds in the past compared to a 144Hz player. Upgrading your monitor is the only true "pay to win" hardware in gaming.
- **Sleep & Hydration:** Playing on 5 hours of sleep adds about 30ms to your delay. It's the equivalent of playing on a server with high ping. 
- **Cold Hands:** If your room is freezing, the blood flow to your fingers drops, making it physically impossible to click the mouse fast enough when you react.

**Can You Actually Train Your Brain?**
You can't change your fundamental biology, but you can train your anticipation. Pro players don't just have insane raw reaction times; they pre-aim exactly where the enemy is going to be so they don't have to think, they just have to click. 
Before booting up a ranked match, spend 5 minutes running a reaction time test. It wakes up your central nervous system and gets your eyes dialed in.`
  },
  {
    id: 4,
    emoji: '🎯',
    tag: 'Aim',
    tagColor: 'var(--neon-red)',
    title: 'Aim Trainer Guide: How to Build Elite FPS Aim From Scratch',
    excerpt: 'Stop mindlessly shooting at dots. Learn the structured routine that FPS coaches use to build god-tier mouse control and tracking.',
    readTime: '10 min read',
    body: `Booting up an aim trainer and wildly flicking at targets for an hour while listening to Spotify isn't going to make you a Radiant player. You are just reinforcing bad habits. If you want raw mechanical aim, you need a structured routine.

**Step 1: Fix Your Sensitivity Once and For All**
Stop changing your DPI every time you miss an easy shot in Apex or Overwatch. Find a sensitivity between 200 and 400 eDPI (your mouse DPI multiplied by your in-game sensitivity) and never touch it again. Muscle memory takes weeks to build, and you destroy it every time you tweak the slider.

**The Holy Trinity of Aiming**
An aim trainer breaks your mouse control down into three distinct skills:
- **Flicking:** Snapping your crosshair to a target instantly. It looks amazing on a Twitch highlight reel, but it's actually the least reliable way to aim.
- **Tracking:** Keeping your crosshair glued to a target that is strafing unpredictably. This is what separates average Apex Legends players from predators.
- **Micro-adjustments:** That tiny little movement you make to hit the headshot when your initial flick was slightly off. This is what actually wins gunfights in tactical shooters.

**The 30-Day Blueprint**
- Week 1: Go painfully slow. Focus exclusively on drawing a perfectly straight line from point A to point B without curving your mouse path.
- Week 2: Add tracking scenarios. Stop death-gripping your mouse. Keep your wrist and forearm completely relaxed.
- Week 3: Shrink the targets. Force yourself to be precise instead of just fast. Speed comes naturally from precision.
- Week 4: Play dynamic scenarios where targets move vertically and horizontally at random intervals.

Remember, an aim trainer is just a gym. Don't stress over getting a high score on the leaderboard. Focus on perfect technique, and the kills will follow in-game.`
  },
  {
    id: 5,
    emoji: '🚀',
    tag: 'Spacebar',
    tagColor: 'var(--neon-cyan)',
    title: 'Spacebar Counter: How to Maximize Your Spacebar CPS Test Score',
    excerpt: 'From Geometry Dash timings to CS2 movement tech, the spacebar is your most abused key. Here is how to tap it faster and score higher on a spacebar counter.',
    readTime: '5 min read',
    body: `It sounds like a meme, but spacebar speed is a highly specialized, legitimate skill. The spacebar is the biggest, most heavily utilized key on your board. Whether you are chaining bunny-hops in CS2, tapping out extreme demons in Geometry Dash, or playing rhythm games like osu!mania, your spacebar timing is everything.

**What is a Good Spacebar Speed?**
If you run a 10-second spacebar counter test, hitting 7 to 8 presses a second is a solid baseline for a gamer. If you can maintain 11+ CPS across a full test, you either have insane thumb stamina or you have been grinding rhythm games for years. 

**Techniques to Increase Your Spacebar CPS**
You can't just mash your thumb normally and expect to hit double digits.
- **The Rigid Thumb:** Keep your thumb perfectly straight and rigid, and vibrate your wrist instead of moving the thumb joint. This is great for short, 5-second burst tests.
- **Two-Thumb Technique:** Hover your left and right thumbs over opposite sides of the spacebar and alternate tapping them rapidly. This easily boosts your CPS test score by 20 to 30%.
- **The Hover:** Do not let your finger fully leave the surface of the keycap. Minimize the travel distance so you are only resetting the switch just enough to actuate it again.

**Why Your Keyboard Hardware Matters**
Not all spacebars are created equal. Linear switches (like Cherry MX Reds or Speed Silvers) are vastly superior for rapid tapping compared to heavy clicky switches. Because linears don't have a tactile bump, you can rapidly flutter your thumb without fighting the keyboard's internal resistance. 
Also, cheap membrane keyboards are notorious for having terrible stabilizers. If your spacebar feels mushy or binds when you press it on the edge, it is physically holding your spacebar test score back.`
  },
  {
    id: 6,
    emoji: '⌨️',
    tag: 'Keyboard',
    tagColor: 'var(--neon-green)',
    title: 'Key Visualizer: How to Test Keyboard Ghosting and NKRO',
    excerpt: 'Is your budget gaming keyboard dropping inputs during intense fights? Learn how to use a keyboard visualizer to test your hardware limits.',
    readTime: '6 min read',
    body: `A Key Visualizer is a live, on-screen display of exactly what your keyboard is doing. Sure, it looks cool as a stream overlay, but it's actually the ultimate diagnostic tool to find out if your keyboard is secretly getting you killed in-game.

**What Is Keyboard Ghosting?**
This is the number one reason you need a keyboard tester. Cheap, non-gaming keyboards can only process 3 or 4 keys at a single time due to how their internal wiring matrix is built. Try this: hold down W and D (like you are moving diagonally), hold Shift to sprint, and hit Spacebar to jump. Did the spacebar not light up on the key visualizer? That is ghosting. Your keyboard literally dropped the input. In an FPS game, that means you just failed a jump peek and died.

**N-Key Rollover (NKRO) Explained**
Premium gaming keyboards advertise "NKRO" or "N-Key Rollover". This means no matter how many keys you press at the exact same time, every single one registers independently. You can test this on our visualizer by literally pressing down your entire left hand on the board. If every key lights up, your board has true NKRO.

**For Streamers and Rhythm Gamers**
If you play osu!, Clone Hero, Geometry Dash, or do speedruns, your viewers want to see your live inputs. You can add our Key Visualizer as a Browser Source in OBS. Just drop the URL in, set a transparent background with CSS, and you instantly have a clean, lag-free input overlay for your stream.

**Things to Look Out For During a Test:**
- Keys that flicker rapidly or double-register on a single, firm press (this means the switch contact leaf is failing).
- Broken stabilizers that cause a key to not register if pressed too far on the left or right edge.
- Making sure your custom AutoHotkey scripts or QMK macros are firing the exact sequence you programmed.`
  },
  {
    id: 7,
    emoji: '🖱️',
    tag: 'Mouse',
    tagColor: 'var(--neon-red)',
    title: 'Double Click Test: How to Diagnose Dying Mouse Switches',
    excerpt: 'Is your mouse firing twice when you only clicked once? Here is how to use a double click test to diagnose switch bounce and save your hardware.',
    readTime: '6 min read',
    body: `We have all experienced this nightmare. You click once to drag a file on your desktop, and it opens it instead. Or you try to tap-fire a single bullet in CS2, and your gun shoots twice, ruining your recoil reset. You aren't going crazy—your mouse switch is dying. 

**What Is Switch Bounce?**
Inside a traditional gaming mouse is a tiny, incredibly thin metal spring. When you click, that metal touches a contact point to send a signal. Over time (usually after a few million clicks), that spring gets weak. When you click it once, the metal physically "bounces" against the contact multiple times before settling. To your PC, it looks like you just double-clicked at the speed of light.

**How to Read Double Click Test Results**
Our Double Click Test measures the exact millisecond gap between your clicks. 
- A normal, intentional human double-click usually has a gap of 80ms to 150ms.
- If our graph shows a gap of 10ms to 30ms, that is a guaranteed hardware defect. A human finger cannot physically release and re-click a mouse that fast.

**How to Fix a Double Clicking Mouse**
Before you throw a $150 mouse in the trash, try these fixes:
- **Increase Debounce Time:** Open your mouse software (like Razer Synapse, Logitech G Hub, or Glorious Core) and look for "debounce" settings. Turn it up to 10ms or 12ms. This tells the mouse to ignore the physical bounce.
- **The Windows Fix:** Go to the Windows Control Panel mouse settings and max out the double-click speed slider. It's a temporary software band-aid, but it works.

**The Harsh Reality of Gaming Mice:**
Older Logitech mice (especially those using the infamous Omron 50M switches) are notorious for developing double-click issues within a year. Modern mice are moving to Optical Switches, which use lasers instead of metal springs to register clicks. Optical switches literally cannot double-click, making them the superior choice for competitive gamers.`
  },
  {
    id: 8,
    emoji: '⌨️',
    tag: 'Typing',
    tagColor: 'var(--neon-cyan)',
    title: 'Keyboard Accuracy Test: Why Precision Beats Raw Speed',
    excerpt: 'A 100 WPM typist with bad accuracy is vastly slower than an 80 WPM typist. Here is why the backspace key is your worst enemy.',
    readTime: '7 min read',
    body: `Everyone loves to flex their high WPM screenshots on Discord, but nobody talks about the metric that actually dictates your real-world typing speed: raw accuracy. Mashing keys fast means absolutely nothing if you have to hit the backspace key every single sentence.

**The Backspace Penalty**
Think about the mechanics of making a typo. You have to visually realize you made the mistake, stop your forward momentum, stretch your pinky to hit backspace, re-type the correct key, and then try to regain your rhythm. That single typo just cost you the time it would have taken to type an entire word. 

**The Math Doesn't Lie**
- A typist cruising at 80 WPM at 99% accuracy will finish drafting an email faster than a 110 WPM typist going at 85% accuracy.
- If you work in programming or data entry, 99% accuracy isn't a luxury, it is mandatory. One missed semicolon breaks the whole build.

**How to Fix Your Sloppy Typing Habits**
Our Keyboard Accuracy test is designed to force you to slow down and expose your worst habits. 
- **Identify Problem Keys:** Look at your test results. Are you constantly hitting 'r' instead of 't'? Your muscle memory for your left index finger is slightly skewed.
- **Isolate the Weakness:** Practice typing specific words that contain those exact keys at half your normal speed until your brain remaps the distance.

**The Golden Rules of Accuracy:**
- 95% accuracy is the absolute minimum standard. If you drop below this on a typing test, you are just wasting your own time. Slow down.
- Rushing causes forearm tension, and physical tension causes typos. Relax your wrists and let your fingers glide.
- Don't just practice with lowercase words. Practice tests with heavy punctuation, numbers, and capital letters, as that is where 90% of real-world errors actually happen.`
  },
  {
    id: 9,
    emoji: '↕️',
    tag: 'Mouse',
    tagColor: 'var(--neon-green)',
    title: 'Scroll Test: Measure Your Mouse Wheel Speed and Health',
    excerpt: 'From bunny-hopping in Apex Legends to scrolling giant codebases. Check if your mouse scroll wheel encoder is skipping ticks or dying.',
    readTime: '5 min read',
    body: `Nobody thinks about their mouse scroll wheel until it starts acting up. Whether you are navigating massive 10,000-line spreadsheets, or binding "Jump" to scroll-down to hit tap-strafes in Apex Legends, your mouse wheel needs to be incredibly fast and perfectly flawless.

**Why Test Your Scroll Wheel?**
Over time, the mechanical rotary encoder inside your mouse gets filled with dust, pet hair, or just naturally wears out. You might be scrolling down a web page, but the screen randomly jumps up for a split second. Our Scroll Test visualizes and graphs out every single tick your mouse sends. If your graph shows random dips, backward spikes, or missed inputs, your hardware is failing.

**Wheel Types and Max Speeds**
- **Standard Notched Wheels:** You feel a distinct physical "bump" for every step. These usually max out around 10 to 15 ticks per second for a normal human scrolling fast. They are essential for precise weapon switching in FPS games.
- **Infinite Scroll Wheels:** Mice like the Logitech G502 or MX Master let you unlock the wheel to spin freely on a ball bearing. You can easily hit 60 to 80 ticks per second. 

**Gaming Applications for High Scroll Speeds**
In games like CS2 and Apex Legends, high-level players bind jump to the scroll wheel. Why? Because sending 10 jump inputs in a fraction of a second guarantees you hit the exact frame required for a bunny-hop when you hit the ground. A failing scroll wheel means dead-sliding and losing your momentum.

**Quick Fixes for Bad Wheels:**
- Blow a can of compressed air directly into the gaps on the side of the wheel. It genuinely fixes 80% of skipping issues caused by dust interfering with the optical encoder.
- Stop pressing down so hard while scrolling; excessive downward force grinds the mechanical encoder housing faster.`
  },
  {
    id: 10,
    emoji: '🖲️',
    tag: 'Aim',
    tagColor: 'var(--neon-red)',
    title: 'Mouse Accuracy Test: Find Your Perfect Gaming DPI',
    excerpt: 'Higher DPI does not mean better aim. Learn how to track your cursor path and find the exact sensitivity that fits your muscle memory.',
    readTime: '7 min read',
    body: `Mouse accuracy is entirely different from reaction time. It is the raw measure of your hand-eye coordination. If you consistently overshoot heads in Valorant, or find yourself constantly adjusting your crosshair after a flick, your mouse sensitivity settings are actively working against you.

**The 25,000 DPI Myth**
Gaming mouse boxes advertise 25,000+ DPI like it's a superpower. It is a pure marketing gimmick. Look at the desks of professional FPS players—99% of them play at 400 or 800 DPI. Why? Because at ultra-high DPI, every single heartbeat, desk bump, or micro-tremor translates into your cursor vibrating off the target. High DPI introduces human error.

**Understanding Path Efficiency**
Our mouse accuracy test doesn't just check if you clicked the target; it tracks the exact pixel-path you drew to get there. 
- A perfectly straight line means your muscle memory is fully synced with your sensitivity.
- A sweeping curved arc means you are pivoting entirely from your wrist bone instead of using your forearm.
- A zig-zag or hook at the end of the line means your sensitivity is too high—you are physically overshooting the target and having to pull the mouse backward to correct it.

**How to Find Your Perfect DPI**
Run our accuracy test three times. Do it once at 400 DPI, once at 800, and once at 1600. Analyze the data. The setting that gives you the straightest path and the highest first-click hit percentage is your natural DPI. Lock it in and never change it again.

**Pro Advice for Better Control:**
- Turn off "Enhance Pointer Precision" in Windows mouse settings. This is built-in mouse acceleration, and it completely ruins muscle memory because your cursor moves different distances based on how fast you swipe.
- Get a massive desk-sized mousepad. Arm-aiming at low sensitivity is mathematically far more accurate than wrist-aiming at high sensitivity.`
  },
  {
    id: 11,
    emoji: '🔭',
    tag: 'Aim',
    tagColor: 'var(--neon-orange)',
    title: 'Sniper Mode Training: Master Long-Range Precision Aim',
    excerpt: 'Sniping requires a totally different motor skill than spraying an assault rifle. Here is how to hold angles, stop shaking, and hit the micro-flicks.',
    readTime: '8 min read',
    body: `Standard aiming is fast, loose, and allows for on-the-fly corrections. Sniper aiming is completely unforgiving. When you hold an AWP in CS2 or an Operator in Valorant, you don't get a second chance to spray. You need absolute, unwavering precision on the very first click.

**The Difference in Aim Mechanics**
When using an assault rifle, you react, flick, and instantly pull down to control recoil. When sniping, the meta is completely different: you pre-aim an angle, hold your mouse perfectly still, wait for the target's shoulder to walk into your crosshair, and make a tiny micro-flick if necessary. It requires extreme patience and zero hand tremors.

**The Shaky Hand Problem**
If you notice your crosshair vibrating while holding a tight angle, you have too much tension in your arm, or your posture is terrible. 
Here is a trick real-world marksmen use: Pay attention to your breathing. Inhale, exhale halfway, and hold your breath gently while waiting for the click. It physically stabilizes your chest, shoulder, and arm.

**How to Stop Overshooting Flicks**
The biggest mistake amateur snipers make is flicking too hard and shooting past the target. 
- **Lower your scoped sensitivity:** Go into your game settings and find the scoped multiplier. Pros often set this to 0.8x or 0.9x so their sniper movements are slightly slower than their hip-fire.
- **The Pull and Hold:** Intentionally practice flicking slightly past the target, and smoothly dragging back to it, rather than trying to violently stop your mouse on a dime. 

**Training Tips for Snipers:**
- Never practice sniper flicks and tracking heavy weapons in the same session. It confuses your muscle memory.
- Play off-angles. Your raw aim doesn't matter at all if the enemy just pre-fires your obvious hiding spot.`
  },
  {
    id: 12,
    emoji: '🚀',
    tag: 'Game',
    tagColor: 'var(--neon-cyan)',
    title: 'Space Defense Game: Master Aiming Under High Pressure',
    excerpt: 'Raw aim is useless if you panic when things get chaotic on screen. Learn how to prioritize targets and maintain high CPS with actual accuracy.',
    readTime: '6 min read',
    body: `Anyone can hit 12 CPS on a massive, stationary square. Anyone can hit a headshot when they have 5 full seconds to line it up on a bot. But can you maintain your clicking speed while tracking multiple fast-moving targets across the screen? Space Defense bridges the massive gap between raw statistical aim and actual in-game gaming pressure.

**The Trap of Panic Clicking**
The game severely punishes you for spamming. If you wildly click empty space hoping to hit a ship, your accuracy multiplier tanks. The player who clicks deliberately at 7 CPS with 90% accuracy will completely obliterate the score of the player frantically mashing 14 CPS at 40% accuracy.

**Target Prioritization is Everything**
High-scoring players don't look at the massive cluster of enemies spawning at the top of the screen. They develop an instant visual hierarchy:
1. Fastest threats near the bottom of the screen (immediate danger).
2. Armored threats that require multiple clicks to destroy.
3. Clustered threats on the edges.

If you stare at the whole swarm, your brain freezes. Focus exclusively on the lowest line of defense.

**Why This Helps Your Real Gameplay**
This game trains your brain to handle visual clutter. In games like Overwatch, Apex Legends, or even League of Legends team fights, the screen is a mess of particle effects and multiple targets. Space Defense trains you to ignore the noise, pick a single target, track it smoothly, execute your clicks, and immediately transition to the next without tensing up your arm.`
  },
  {
    id: 13,
    emoji: '🌌',
    tag: 'Game',
    tagColor: 'var(--neon-green)',
    title: 'Voyager Game: Evasion, Flow State, and Smooth Mouse Control',
    excerpt: 'Standard aim trainers teach you to hit targets. Voyager teaches you how to maneuver smoothly around obstacles without crashing and burning.',
    readTime: '7 min read',
    body: `The Voyager game is an exercise in pure flow state. You pilot a spacecraft with your mouse cursor through an endlessly accelerating, infinitely generating asteroid field. There is no shooting, no crosshairs, and no enemies to click—just pure, unadulterated mouse control and spatial awareness.

**Why Evasion Matters Just as Much as Aim**
Aim trainers teach you to aggressively move your mouse *to* an object. Voyager teaches you to maneuver your mouse *around* objects smoothly. If your mouse movements are jerky, tense, and anxious, you will crash immediately as the speed ramps up. You have to learn to glide.

**The "Look Ahead" Technique**
Beginners crash early because they are staring directly at their own ship. Expert players don't even look at their ship—they are staring at the top half of the screen, mapping out the gaps 2 or 3 seconds before they even reach them. Your peripheral vision is incredibly good at keeping your ship safe; your central focus needs to be on predicting the future path.

**Inducing the Flow State**
To survive past the two-minute mark at high speeds, you have to let your subconscious motor skills take over. 
- Turn off your second monitor stream or YouTube video. 
- Put on a playlist of instrumental or synth-wave music. 
- Let your eyes relax and take in the whole screen rather than darting aggressively from rock to rock.

Playing Voyager for 5 minutes before booting up a ranked match is the ultimate warm-up. It forces simultaneous activation of visual processing and fine motor control, waking your brain up faster than any energy drink ever could.`
  },
  {
    id: 14,
    emoji: '💥',
    tag: 'CPS',
    tagColor: 'var(--neon-red)',
    title: 'CPS Rush: The Ultimate Burst Speed CPS Challenge',
    excerpt: 'A standard 60-second test measures stamina. CPS Rush measures your absolute peak 1-rep max clicking speed. Can you survive 10 rounds of hell?',
    readTime: '6 min read',
    body: `If the standard CPS test is a long-distance marathon, CPS Rush is a 1-rep max deadlift. You get exactly 1 second to click as fast as humanly possible, followed by a brief 2-second break. You repeat this for 10 grueling rounds. 

**Why Burst Speed Matters in Gaming**
Think about a pump shotgun box-fight in Fortnite, or a quick sword trade in Minecraft. You rarely need to click for 10 seconds straight; you just need absolute maximum clicking speed for exactly 1 second to win the exchange. This test isolates that exact, high-intensity scenario.

**Reading Your Round-by-Round Results**
Because this test is incredibly short, most players will score 2 to 3 CPS higher on a given round here than they do on the standard 5-second test. 
But you need to look closely at your round-by-round graph to see your endurance. 
- If your score is 14, 14, 13, 14... you have fantastic technique and stamina.
- If your score goes 15, 12, 9, 7... you are tensing your hand way too hard on the first round and instantly burning out your fast-twitch muscles.

**How to Dominate the Rush**
- Force yourself to relax during the 2-second break. Physically lift your finger off the mouse, take a breath, and reset your grip.
- If you are jitter clicking, the vibration needs to come from your forearm, not from a tense death-grip on the mouse itself.
- Use a mouse with low actuation force. Heavy, stiff clicks will completely ruin your 1-second burst potential.

**A Quick Medical Warning:**
Do not play CPS Rush for an hour straight. Maximum tension bursts are incredibly taxing on your finger and wrist tendons. Do a few runs, get your high score, and give your hand a long rest.`
  },
  {
    id: 15,
    emoji: '🖱️',
    tag: 'Mouse',
    tagColor: 'var(--neon-green)',
    title: 'Best Gaming Mice for High CPS and Aim — 2025 Tier List',
    excerpt: 'Your hardware absolutely matters. We break down the top mice used by pros for maximizing click speed, CPS tests, and maintaining perfect tracking.',
    readTime: '6 min read',
    body: `Let's get one thing straight immediately: buying a $150 mouse won't magically make you a professional gamer. But a bad mouse will absolutely put a hard ceiling on your skills. Heavy shells, stiff switches, and bad sensors limit your CPS and reaction time. Here is the hardware the elite players are actually using right now.

**#1 Logitech G Pro X Superlight 2**
There is a reason half the professional eSports scene uses this mouse. At 60 grams, it feels like nothing is in your hand. The new hybrid optical-mechanical switches mean you get the satisfying physical "click" feel, but the laser actuation means zero debounce delay. It is perfect for rapid clicking and tracking.

**#2 Razer DeathAdder V3 Pro**
If you have larger hands and hate the symmetrical egg shape of the Superlight, this ergonomic beast is the king. Razer's optical switches are widely considered the fastest on the market for pure CPS spamming. It is incredibly easy to jitter click or butterfly click on this shell design.

**#3 Endgame Gear XM2we**
The undisputed budget king. For under $90, you get premium optical switches, an insane matte coating for sweaty hands, and a shape that forces your hand into a perfect, aggressive claw grip. It is built like an absolute tank.

**What to Look For When Buying:**
- **Weight:** Keep it under 70g. Heavier mice cause micro-fatigue during long aim training sessions.
- **Switches:** Optical switches are vastly superior to Mechanical. Opticals literally cannot double-click and have lower input lag.
- **Skates:** Virgin grade PTF/Teflon feet are mandatory. If your mouse feels "sticky" or muddy on the pad, upgrade the skates, don't buy a whole new mouse.`
  },
  {
    id: 16,
    emoji: '⚡',
    tag: 'Reaction',
    tagColor: 'var(--neon-orange)',
    title: 'System Tweaks to Instantly Improve PC Reaction Time',
    excerpt: 'Stop blaming your reflexes. Your PC setup might be adding 30ms of hidden input lag. Here is how to optimize Windows and your gaming gear.',
    readTime: '7 min read',
    body: `You might think your reaction time is terrible, but your computer might just be processing inputs like a toaster. Input lag is the silent killer in competitive gaming. It doesn't matter how fast you click if your PC takes 30 milliseconds to render the gunshot on screen. Here is how to strip away the delay and get true 1-to-1 responsiveness.

**The Monitor Refresh Rate Bottleneck**
If you are playing on a standard 60Hz monitor, you are seeing frames 16.6 milliseconds after they actually happen on the server. A 144Hz monitor cuts that delay down to 6.9ms. A 240Hz monitor drops it to an insane 4.1ms. Upgrading from 60Hz to 144Hz+ is the most impactful hardware upgrade you can make for competitive gaming.

**Optimize Windows for Gaming Latency**
Windows has a ton of background bloatware that causes micro-stutters and input delay:
- Turn on "Game Mode" in Windows settings to prioritize CPU resources.
- Turn OFF "Enhance Pointer Precision" in mouse settings. (This is built-in mouse acceleration and it ruins raw input).
- Make sure your mouse is plugged directly into the motherboard IO on the back of your PC, not into a cheap USB hub or monitor passthrough.

**Mouse Polling Rate Matters**
Go into your mouse software (Synapse, G Hub, etc.). Is your polling rate set to 125Hz or 500Hz? Change it to 1000Hz immediately. This tells the mouse to report its position to the PC one thousand times a second. (Note: 4000Hz and 8000Hz mice exist now, but they can cause CPU stuttering on older PCs, so stick to 1000Hz unless you have a top-tier CPU).

**NVIDIA Reflex & AMD Anti-Lag**
If your game supports it (Valorant, CS2, and Apex Legends do), turn these settings ON in the video menus. They prevent your CPU and GPU from holding frames in a render queue, dropping your overall system latency by a massive margin.

Do these tweaks, restart your PC, and take our Reaction Time Test again. You will likely shave 15 to 20ms off your score instantly.`
  }
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
