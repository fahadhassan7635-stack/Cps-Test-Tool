import type { Metadata } from 'next';
import VoyagerGame from '@/views/VoyagerGame';

export const metadata: Metadata = {
  title: "Voyager Game - Endless Mouse Evasion Arcade | FixedAim",
  description: "Dodge obstacles in this endless mouse-controlled evasion game. Difficulty scales continuously — great as a pre-game warm-up to sharpen your mouse precision.",
};

export default function Page() {
  return <VoyagerGame />;
}
