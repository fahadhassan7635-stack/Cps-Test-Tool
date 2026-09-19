import type { Metadata } from 'next';
import SpaceWavesGame from '@/views/SpaceWavesGame';

export const metadata: Metadata = {
  title: "Space Waves - Arcade Dodge & Timing Game | FixedAim",
  description: "A side-scrolling arcade dodge game with procedural obstacles and parallax space backgrounds. Sharpen your timing, test your reflexes, and beat your high score.",
};

export default function Page() {
  return <SpaceWavesGame />;
}
