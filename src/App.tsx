import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// ---------------------------------------------------------------------------
// Lazy-loaded page components — each page is its own JS chunk loaded on demand
// ---------------------------------------------------------------------------
const HomePage            = lazy(() => import('./pages/HomePage'));
const CPSTestPage         = lazy(() => import('./pages/CPSTestPage'));
const TypingTestPage      = lazy(() => import('./pages/TypingTestPage'));
const ReactionTimePage    = lazy(() => import('./pages/ReactionTimePage'));
const AimTrainerPage      = lazy(() => import('./pages/AimTrainerPage'));
const KeyVisualizerPage   = lazy(() => import('./pages/KeyVisualizerPage'));
const SpacebarPage        = lazy(() => import('./pages/SpacebarPage'));
const MousePage           = lazy(() => import('./pages/MousePage'));
const KeyboardPage        = lazy(() => import('./pages/KeyboardPage'));
const AimPage             = lazy(() => import('./pages/AimPage'));
const LeaderboardPage     = lazy(() => import('./pages/LeaderboardPage'));
const BlogPage            = lazy(() => import('./pages/BlogPage'));
const DoubleClickPage     = lazy(() => import('./pages/DoubleClickPage'));
const ScrollTestPage      = lazy(() => import('./pages/ScrollTestPage'));
const MouseAccuracyPage   = lazy(() => import('./pages/MouseAccuracyPage'));
const ThreeDAimTrainerPage = lazy(() => import('./pages/3DAimTrainer'));
const AccuracyTestPage    = lazy(() => import('./pages/AccuracyTestPage'));
const PrivacyPolicy       = lazy(() => import('./pages/PrivacyPolicy'));
const TermsPage           = lazy(() => import('./pages/TermsPage'));
const ContactPage         = lazy(() => import('./pages/ContactPage'));
const SpaceDefensePage    = lazy(() => import('./pages/SpaceDefensePage'));
const VoyagerGame         = lazy(() => import('./pages/VoyagerGame'));
const GamesPage           = lazy(() => import('./pages/GamesPage'));
const F1ReactionPage      = lazy(() => import('./pages/F1ReactionPage'));
const CpsRush             = lazy(() => import('./pages/CpsRush'));
const SpaceWavesGame      = lazy(() => import('./pages/SpaceWavesGame'));

import SEO from './components/SEO';

const PAGE_META: Record<string, { title: string; desc: string; isWeb?: boolean }> = {
  '/': { title: 'FixedAim - The Ultimate CPS & Aim Training Platform', desc: 'The ultimate free platform to test your clicking speed, typing WPM, reaction time, aim precision, and more.', isWeb: true },
  'cps-test': { title: 'CPS Test - Click Speed Test Online', desc: 'Test your clicking speed with our free CPS test tool.', isWeb: true },
  'typing-test': { title: 'Typing Speed Test - WPM Test Online', desc: 'Find your true WPM without creating an account.', isWeb: true },
  'reaction-time': { title: 'Reaction Time Test', desc: 'How fast are your reflexes? Test your reaction time.', isWeb: true },
  'aim-trainer': { title: 'Aim Trainer - FPS Warmup', desc: 'Train your reflexes and sharpen your aim with our browser aim trainer.', isWeb: true },
  'key-visualizer': { title: 'Key Visualizer', desc: 'Live on-screen display of your keyboard inputs.', isWeb: true },
  'spacebar': { title: 'Spacebar Counter', desc: 'Test your spacebar tapping speed.', isWeb: true },
  'double-click': { title: 'Double Click Test', desc: 'Check your mouse for dying switches and double click issues.', isWeb: true },
  'scroll-test': { title: 'Scroll Speed Test', desc: 'Check your mouse wheel scrolling speed.', isWeb: true },
  'mouse-accuracy': { title: 'Mouse Accuracy Test', desc: 'Find your perfect DPI and track your mouse path efficiency.', isWeb: true },
  '3d-aim-trainer': { title: '3D Aim Trainer', desc: 'Master your FPS mechanics in a true spatial environment.', isWeb: true },
  'accuracy': { title: 'Keyboard Accuracy Test', desc: 'Stop making typos and track your keyboard accuracy.', isWeb: true },
  'space-defense': { title: 'Space Defense Game', desc: 'Can you click fast under pressure?', isWeb: true },
  'voyager-game': { title: 'Voyager Game', desc: 'The ultimate evasion warm-up game.', isWeb: true },
  'f1-reaction': { title: 'F1 Reaction Test', desc: 'Simulate a real Formula 1 race start.', isWeb: true },
  'cps-rush': { title: 'CPS Rush', desc: 'Pure burst speed CPS test in short rounds.', isWeb: true },
  'space-waves': { title: 'Space Waves', desc: 'Arcade dodging game to sharpen your timing.', isWeb: true },
  'mouse': { title: 'Mouse Tools', desc: 'Tools to test and improve your mouse skills.', isWeb: false },
  'keyboard': { title: 'Keyboard Tools', desc: 'Tools to test and improve your keyboard skills.', isWeb: false },
  'aim': { title: 'Aim & Reaction Tools', desc: 'Tools to test and improve your aim and reaction time.', isWeb: false },
  'games': { title: 'Skill Games', desc: 'Play skill games to improve your reaction and clicking speed.', isWeb: false },
  'leaderboard': { title: 'Leaderboard', desc: 'Global leaderboard for CPS and WPM scores.', isWeb: false },
  'hall-of-fame': { title: 'Hall of Fame', desc: 'Global leaderboard and hall of fame.', isWeb: false },
  'blog': { title: 'Blog', desc: 'Read the latest updates and articles from FixedAim.', isWeb: false },
  'privacy-policy': { title: 'Privacy Policy', desc: 'Privacy Policy for FixedAim.', isWeb: false },
  'terms': { title: 'Terms of Service', desc: 'Terms of Service for FixedAim.', isWeb: false },
  'contact': { title: 'Contact Us', desc: 'Get in touch with the FixedAim team.', isWeb: false },
};

function RouteWithSEO({ path, children }: { path: string, children: React.ReactNode }) {
  const meta = PAGE_META[path] || { title: 'FixedAim', desc: 'Test your skills', isWeb: false };
  const url = path === '/' ? 'https://fixedaim.com/' : `https://fixedaim.com/${path}`;
  
  return (
    <>
      <SEO title={meta.title} description={meta.desc} url={url} isWebApplication={meta.isWeb} />
      {children}
    </>
  );
}

// Minimal loading screen that matches the site's dark neon aesthetic
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(0,245,255,0.2)',
        borderTop: '3px solid #00f5ff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
        LOADING…
      </span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<RouteWithSEO path="/"><HomePage /></RouteWithSEO>} />

            <Route path="cps-test"      element={<RouteWithSEO path="cps-test"><CPSTestPage /></RouteWithSEO>} />
            <Route path="typing-test"   element={<RouteWithSEO path="typing-test"><TypingTestPage /></RouteWithSEO>} />
            <Route path="reaction-time" element={<RouteWithSEO path="reaction-time"><ReactionTimePage /></RouteWithSEO>} />
            <Route path="aim-trainer"   element={<RouteWithSEO path="aim-trainer"><AimTrainerPage /></RouteWithSEO>} />
            <Route path="key-visualizer" element={<RouteWithSEO path="key-visualizer"><KeyVisualizerPage /></RouteWithSEO>} />
            <Route path="spacebar"      element={<RouteWithSEO path="spacebar"><SpacebarPage /></RouteWithSEO>} />
            <Route path="double-click"  element={<RouteWithSEO path="double-click"><DoubleClickPage /></RouteWithSEO>} />
            <Route path="scroll-test"   element={<RouteWithSEO path="scroll-test"><ScrollTestPage /></RouteWithSEO>} />
            <Route path="mouse-accuracy" element={<RouteWithSEO path="mouse-accuracy"><MouseAccuracyPage /></RouteWithSEO>} />
            <Route path="3d-aim-trainer" element={<RouteWithSEO path="3d-aim-trainer"><ThreeDAimTrainerPage /></RouteWithSEO>} />
            <Route path="accuracy"      element={<RouteWithSEO path="accuracy"><AccuracyTestPage /></RouteWithSEO>} />
            <Route path="space-defense" element={<RouteWithSEO path="space-defense"><SpaceDefensePage /></RouteWithSEO>} />
            <Route path="voyager-game"  element={<RouteWithSEO path="voyager-game"><VoyagerGame /></RouteWithSEO>} />
            <Route path="f1-reaction"   element={<RouteWithSEO path="f1-reaction"><F1ReactionPage /></RouteWithSEO>} />
            <Route path="cps-rush"      element={<RouteWithSEO path="cps-rush"><CpsRush /></RouteWithSEO>} />
            <Route path="space-waves"   element={<RouteWithSEO path="space-waves"><SpaceWavesGame /></RouteWithSEO>} />

            {/* Category Pages */}
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
      </Suspense>
    </BrowserRouter>
  );
}
