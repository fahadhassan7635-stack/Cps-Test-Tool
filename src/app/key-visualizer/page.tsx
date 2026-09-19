import type { Metadata } from 'next';
import KeyVisualizerPage from '@/views/KeyVisualizerPage';

export const metadata: Metadata = {
  title: "Key Visualizer - Live Keystroke Display Online | FixedAim",
  description: "See every keystroke visualised in real time. Perfect for streamers, typists, and keyboard enthusiasts. Tracks modifier keys, holds, and key press frequency.",
};

export default function Page() {
  return <KeyVisualizerPage />;
}
