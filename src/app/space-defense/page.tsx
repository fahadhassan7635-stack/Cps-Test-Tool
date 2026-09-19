import type { Metadata } from 'next';
import SpaceDefensePage from '@/views/SpaceDefensePage';

export const metadata: Metadata = {
  title: "Space Defense Game - Click Fast Under Pressure | FixedAim",
  description: "Defend your base from incoming threats in this free browser clicking game. Wave-based difficulty ramps up fast — can you keep up and protect your space station?",
};

export default function Page() {
  return <SpaceDefensePage />;
}
