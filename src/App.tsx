import { HashRouter, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <HashRouter>
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
          <Route path="mouse" element={<MousePage />} />
          <Route path="keyboard" element={<KeyboardPage />} />
          <Route path="aim" element={<AimPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="blog" element={<BlogPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
