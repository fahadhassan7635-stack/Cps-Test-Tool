import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
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
import SniperModePage from './pages/SniperModePage';
import AccuracyTestPage from './pages/AccuracyTestPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';

import SpaceDefensePage from './pages/SpaceDefensePage';
import VoyagerGame from './pages/VoyagerGame';
import GamesPage from './pages/GamesPage';
import F1ReactionPage from './pages/F1ReactionPage';
import CpsRush from './pages/CpsRush';
import SpaceWavesGame from './pages/SpaceWavesGame'; // ADD THIS

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          <Route path="cps-test" element={<CPSTestPage />} />
          <Route path="typing-test" element={<TypingTestPage />} />
          <Route path="reaction-time" element={<ReactionTimePage />} />
          <Route path="aim-trainer" element={<AimTrainerPage />} />
          <Route path="key-visualizer" element={<KeyVisualizerPage />} />
          <Route path="spacebar" element={<SpacebarPage />} />
          <Route path="double-click" element={<DoubleClickPage />} />
          <Route path="scroll-test" element={<ScrollTestPage />} />
          <Route path="mouse-accuracy" element={<MouseAccuracyPage />} />
          <Route path="sniper-mode" element={<SniperModePage />} />
          <Route path="accuracy" element={<AccuracyTestPage />} />
          <Route path="space-defense" element={<SpaceDefensePage />} />
          <Route path="voyager-game" element={<VoyagerGame />} />
          <Route path="f1-reaction" element={<F1ReactionPage />} />
          <Route path="cps-rush" element={<CpsRush />} />
          <Route path="space-waves" element={<SpaceWavesGame />} /> {/* ADD THIS */}

          {/* Category Pages */}
          <Route path="mouse" element={<MousePage />} />
          <Route path="keyboard" element={<KeyboardPage />} />
          <Route path="aim" element={<AimPage />} />
          <Route path="games" element={<GamesPage />} />

          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="hall-of-fame" element={<LeaderboardPage />} />

          <Route path="blog" element={<BlogPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
