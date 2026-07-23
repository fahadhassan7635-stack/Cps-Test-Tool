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
            <Route index element={<HomePage />} />

            <Route path="cps-test"      element={<CPSTestPage />} />
            <Route path="typing-test"   element={<TypingTestPage />} />
            <Route path="reaction-time" element={<ReactionTimePage />} />
            <Route path="aim-trainer"   element={<AimTrainerPage />} />
            <Route path="key-visualizer" element={<KeyVisualizerPage />} />
            <Route path="spacebar"      element={<SpacebarPage />} />
            <Route path="double-click"  element={<DoubleClickPage />} />
            <Route path="scroll-test"   element={<ScrollTestPage />} />
            <Route path="mouse-accuracy" element={<MouseAccuracyPage />} />
            <Route path="3d-aim-trainer" element={<ThreeDAimTrainerPage />} />
            <Route path="accuracy"      element={<AccuracyTestPage />} />
            <Route path="space-defense" element={<SpaceDefensePage />} />
            <Route path="voyager-game"  element={<VoyagerGame />} />
            <Route path="f1-reaction"   element={<F1ReactionPage />} />
            <Route path="cps-rush"      element={<CpsRush />} />
            <Route path="space-waves"   element={<SpaceWavesGame />} />

            {/* Category Pages */}
            <Route path="mouse"    element={<MousePage />} />
            <Route path="keyboard" element={<KeyboardPage />} />
            <Route path="aim"      element={<AimPage />} />
            <Route path="games"    element={<GamesPage />} />

            <Route path="leaderboard"  element={<LeaderboardPage />} />
            <Route path="hall-of-fame" element={<LeaderboardPage />} />

            <Route path="blog"           element={<BlogPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms"          element={<TermsPage />} />
            <Route path="contact"        element={<ContactPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
