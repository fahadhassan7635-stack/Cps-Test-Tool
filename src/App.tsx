import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { usePageTracking } from './hooks/usePageTracking';

// ---------------------------------------------------------------------------
// Page components — imported statically to avoid hydration flicker (double load)
// ---------------------------------------------------------------------------
import HomePage from './pages/HomePage';
import CPSTestPage from './pages/CPSTestPage';
import TypingTestPage from './pages/TypingTestPage';
import ReactionTimePage from './pages/ReactionTimePage';
import AimTrainerPage from './pages/AimTrainerPage';
import KeyVisualizerPage from './pages/KeyVisualizerPage';
import SpacebarPage from './pages/SpacebarPage';
import MousePage from './pages/MousePage';
import KeyboardPage from './pages/KeyboardPage';
import AimPage from './pages/AimPage';
import LeaderboardPage from './pages/LeaderboardPage';
import BlogPage from './pages/BlogPage';
import DoubleClickPage from './pages/DoubleClickPage';
import ScrollTestPage from './pages/ScrollTestPage';
import MouseAccuracyPage from './pages/MouseAccuracyPage';
import ThreeDAimTrainerPage from './pages/3DAimTrainer';
import AccuracyTestPage from './pages/AccuracyTestPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import SpaceDefensePage from './pages/SpaceDefensePage';
import VoyagerGame from './pages/VoyagerGame';
import GamesPage from './pages/GamesPage';
import F1ReactionPage from './pages/F1ReactionPage';
import CpsRush from './pages/CpsRush';
import SpaceWavesGame from './pages/SpaceWavesGame';

import SEO from './components/SEO';

const SITE_URL = 'https://fixedaim.com';

type AppCategory =
  | 'GameApplication'
  | 'UtilitiesApplication'
  | 'EducationalApplication';

interface PageMeta {
  title: string;
  desc: string;
  applicationCategory?: AppCategory;
}

const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'FixedAim - Free CPS Test, Aim Trainer & Typing Speed Test Online',
    desc:  'The ultimate free platform to test clicking speed, typing WPM, reaction time, and aim precision. No signup needed. Play, test, and improve instantly.',
  },

  'cps-test': {
    title: 'CPS Test - Free Click Speed Test Online | FixedAim',
    desc:  'Test your CPS (Clicks Per Second) for free. Measure click speed with 1s–100s timer modes, compare your scores, and challenge yourself to click faster.',
    applicationCategory: 'UtilitiesApplication',
  },
  'typing-test': {
    title: 'Typing Speed Test - Free WPM Test Online | FixedAim',
    desc:  'Find your true typing speed in words per minute with our free WPM test. No account needed. Track accuracy, speed, and improve your typing skills instantly.',
    applicationCategory: 'EducationalApplication',
  },
  'reaction-time': {
    title: 'Reaction Time Test - Human Reflex Speed Test | FixedAim',
    desc:  'How fast are your reflexes? Measure your reaction time in milliseconds, average across multiple attempts, and see how you compare to the human average.',
    applicationCategory: 'UtilitiesApplication',
  },
  'aim-trainer': {
    title: 'Aim Trainer - Free Browser FPS Aim Practice | FixedAim',
    desc:  'Sharpen your FPS aim in the browser — no download needed. Choose Easy, Medium, Hard, or Flick mode. Track accuracy, combos, and personal records instantly.',
    applicationCategory: 'GameApplication',
  },
  'key-visualizer': {
    title: 'Key Visualizer - Live Keystroke Display Online | FixedAim',
    desc:  'See every keystroke visualised in real time. Perfect for streamers, typists, and keyboard enthusiasts. Tracks modifier keys, holds, and key press frequency.',
    applicationCategory: 'UtilitiesApplication',
  },
  'spacebar': {
    title: 'Spacebar Counter - Space Click Speed Test | FixedAim',
    desc:  'Test how fast you can tap the spacebar. Choose your timer, spam the space key, and see your CPS score. Simple, free, and instant — no signup required.',
    applicationCategory: 'UtilitiesApplication',
  },
  'double-click': {
    title: 'Double Click Test - Mouse Switch Health Checker | FixedAim',
    desc:  'Diagnose double-click issues from worn mouse switches. Detects accidental double clicks in real time and shows click intervals so you can spot problems fast.',
    applicationCategory: 'UtilitiesApplication',
  },
  'scroll-test': {
    title: 'Scroll Speed Test - Mouse Wheel Speed Checker | FixedAim',
    desc:  'Measure how fast your mouse wheel scrolls. Check scroll lines per second, test your scroll speed, and see if your mouse wheel is performing at its best.',
    applicationCategory: 'UtilitiesApplication',
  },
  'mouse-accuracy': {
    title: 'Mouse Accuracy Test - DPI & Tracking Precision Test | FixedAim',
    desc:  'Test your mouse tracking accuracy and find your ideal DPI. Get a path efficiency score, detect cursor tremor, and fine-tune your sensitivity for peak precision.',
    applicationCategory: 'UtilitiesApplication',
  },
  '3d-aim-trainer': {
    title: '3D Aim Trainer - Browser FPS Practice in 3D | FixedAim',
    desc:  'Practice flicking, tracking, and precision in a true 3D spatial environment — no download required. The most realistic browser aim trainer available for free.',
    applicationCategory: 'GameApplication',
  },
  'accuracy': {
    title: 'Keyboard Accuracy Test - Stop Typos & Track Errors | FixedAim',
    desc:  'Find which keys you mistype the most. Track your per-key error rate, see your accuracy percentage, and target problem keys to eliminate typos for good.',
    applicationCategory: 'EducationalApplication',
  },

  'space-defense': {
    title: 'Space Defense Game - Click Fast Under Pressure | FixedAim',
    desc:  'Defend your base from incoming threats in this free browser clicking game. Wave-based difficulty ramps up fast — can you keep up and protect your space station?',
    applicationCategory: 'GameApplication',
  },
  'voyager-game': {
    title: 'Voyager Game - Endless Mouse Evasion Arcade | FixedAim',
    desc:  'Dodge obstacles in this endless mouse-controlled evasion game. Difficulty scales continuously — great as a pre-game warm-up to sharpen your mouse precision.',
    applicationCategory: 'GameApplication',
  },
  'f1-reaction': {
    title: 'F1 Reaction Test - Formula 1 Race Start Simulator | FixedAim',
    desc:  'Simulate an authentic F1 lights-out race start. Measure your reaction time in milliseconds like a real Formula 1 driver — and watch out for jump starts!',
    applicationCategory: 'GameApplication',
  },
  'cps-rush': {
    title: 'CPS Rush - Burst Click Speed Game | FixedAim',
    desc:  'Short, intense clicking rounds to push your peak burst CPS to the limit. Race against the clock, beat your personal best, and see how fast you can truly click.',
    applicationCategory: 'GameApplication',
  },
  'space-waves': {
    title: 'Space Waves - Arcade Dodge & Timing Game | FixedAim',
    desc:  'A side-scrolling arcade dodge game with procedural obstacles and parallax space backgrounds. Sharpen your timing, test your reflexes, and beat your high score.',
    applicationCategory: 'GameApplication',
  },

  'mouse': {
    title: 'Mouse Tools - CPS, Accuracy & Scroll Tests | FixedAim',
    desc:  'Browse all free mouse testing tools on FixedAim: CPS test, double click test, scroll speed test, mouse accuracy, and more. No signup — just open and test.',
  },
  'keyboard': {
    title: 'Keyboard Tools - Typing, Accuracy & Key Tests | FixedAim',
    desc:  'Browse all free keyboard testing tools on FixedAim: typing speed test, key visualizer, spacebar counter, accuracy test, and more. Start testing instantly.',
  },
  'aim': {
    title: 'Aim & Reaction Tools - Browser Trainers | FixedAim',
    desc:  'Browse all free aim and reaction tools on FixedAim: aim trainer, 3D aim trainer, reaction time test, F1 reaction test, and more. Train in your browser for free.',
  },
  'games': {
    title: 'Skill Games - Free Browser Arcade Games | FixedAim',
    desc:  'Play free browser skill games on FixedAim: Space Defense, Voyager, CPS Rush, Space Waves, and more. Sharpen your reflexes and clicking speed while having fun.',
  },
  'leaderboard': {
    title: 'Leaderboard - Top CPS & WPM Scores | FixedAim',
    desc:  'See the highest CPS and WPM scores from players around the world. Can you make it onto the FixedAim global leaderboard? Test your skills and submit your score.',
  },
  'hall-of-fame': {
    title: 'Hall of Fame - All-Time Best Scores | FixedAim',
    desc:  'The all-time best CPS, WPM, and reaction scores from the FixedAim community. See the records, challenge them, and earn your place in the hall of fame.',
  },
  'blog': {
    title: 'Blog - Tips, Guides & Updates | FixedAim',
    desc:  'Read the latest tips, improvement guides, and platform updates from the FixedAim team. Learn how to click faster, type better, and improve your gaming reflexes.',
  },
  'privacy-policy': {
    title: 'Privacy Policy | FixedAim',
    desc:  'Read the FixedAim Privacy Policy to understand how we collect, use, and protect your data. We are committed to keeping your information safe and transparent.',
  },
  'terms': {
    title: 'Terms of Service | FixedAim',
    desc:  'Read the FixedAim Terms of Service. By using our free tools and games you agree to these terms. Fair use, no spam, no abuse — simple rules for everyone.',
  },
  'contact': {
    title: 'Contact Us - Get in Touch with FixedAim | FixedAim',
    desc:  'Have a question, suggestion, or found a bug? Get in touch with the FixedAim team. We read every message and aim to respond as quickly as possible.',
  },
};

function RouteWithSEO({ path, children }: { path: string, children: React.ReactNode }) {
  const meta = PAGE_META[path] || {
    title: 'FixedAim - Free Browser Skill Testing Platform',
    desc:  'Test your clicking speed, typing speed, reaction time, aim precision, and more for free.',
  };
  const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}/${path}`;

  return (
    <>
      <SEO
        title={meta.title}
        description={meta.desc}
        url={url}
        isWebApplication={!!meta.applicationCategory}
        applicationCategory={meta.applicationCategory}
      />
      {children}
    </>
  );
}

// ---------------------------------------------------------------------------
// AppRoutes — key={location.pathname} fixes double animation on navigation
// React destroys the old tree completely before mounting the new one,
// so fade-in-up animations fire exactly once per page visit.
// ---------------------------------------------------------------------------
function AppRoutes() {
  usePageTracking();
  const location = useLocation(); // ← NEW

  return (
    <Routes location={location} key={location.pathname}> {/* ← key fixes double animation */}
      <Route path="/" element={<Layout />}>
        <Route index element={<RouteWithSEO path="/"><HomePage /></RouteWithSEO>} />

        <Route path="cps-test"       element={<RouteWithSEO path="cps-test"><CPSTestPage /></RouteWithSEO>} />
        <Route path="typing-test"    element={<RouteWithSEO path="typing-test"><TypingTestPage /></RouteWithSEO>} />
        <Route path="reaction-time"  element={<RouteWithSEO path="reaction-time"><ReactionTimePage /></RouteWithSEO>} />
        <Route path="aim-trainer"    element={<RouteWithSEO path="aim-trainer"><AimTrainerPage /></RouteWithSEO>} />
        <Route path="key-visualizer" element={<RouteWithSEO path="key-visualizer"><KeyVisualizerPage /></RouteWithSEO>} />
        <Route path="spacebar"       element={<RouteWithSEO path="spacebar"><SpacebarPage /></RouteWithSEO>} />
        <Route path="double-click"   element={<RouteWithSEO path="double-click"><DoubleClickPage /></RouteWithSEO>} />
        <Route path="scroll-test"    element={<RouteWithSEO path="scroll-test"><ScrollTestPage /></RouteWithSEO>} />
        <Route path="mouse-accuracy" element={<RouteWithSEO path="mouse-accuracy"><MouseAccuracyPage /></RouteWithSEO>} />
        <Route path="3d-aim-trainer" element={<RouteWithSEO path="3d-aim-trainer"><ThreeDAimTrainerPage /></RouteWithSEO>} />
        <Route path="accuracy"       element={<RouteWithSEO path="accuracy"><AccuracyTestPage /></RouteWithSEO>} />
        <Route path="space-defense"  element={<RouteWithSEO path="space-defense"><SpaceDefensePage /></RouteWithSEO>} />
        <Route path="voyager-game"   element={<RouteWithSEO path="voyager-game"><VoyagerGame /></RouteWithSEO>} />
        <Route path="f1-reaction"    element={<RouteWithSEO path="f1-reaction"><F1ReactionPage /></RouteWithSEO>} />
        <Route path="cps-rush"       element={<RouteWithSEO path="cps-rush"><CpsRush /></RouteWithSEO>} />
        <Route path="space-waves"    element={<RouteWithSEO path="space-waves"><SpaceWavesGame /></RouteWithSEO>} />

        <Route path="mouse"    element={<RouteWithSEO path="mouse"><MousePage /></RouteWithSEO>} />
        <Route path="keyboard" element={<RouteWithSEO path="keyboard"><KeyboardPage /></RouteWithSEO>} />
        <Route path="aim"      element={<RouteWithSEO path="aim"><AimPage /></RouteWithSEO>} />
        <Route path="games"    element={<RouteWithSEO path="games"><GamesPage /></RouteWithSEO>} />

        <Route path="leaderboard"  element={<RouteWithSEO path="leaderboard"><LeaderboardPage /></RouteWithSEO>} />
        <Route path="hall-of-fame" element={<RouteWithSEO path="hall-of-fame"><LeaderboardPage /></RouteWithSEO>} />

        <Route path="blog"           element={<RouteWithSEO path="blog"><BlogPage /></RouteWithSEO>} />
        <Route path="privacy-policy" element={<RouteWithSEO path="privacy-policy"><PrivacyPolicy /></RouteWithSEO>} />
        <Route path="terms"          element={<RouteWithSEO path="terms"><TermsPage /></RouteWithSEO>} />
        <Route path="contact"        element={<RouteWithSEO path="contact"><ContactPage /></RouteWithSEO>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
