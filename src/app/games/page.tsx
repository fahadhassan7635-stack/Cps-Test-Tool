import type { Metadata } from 'next';
import GamesPage from '@/views/GamesPage';

export const metadata: Metadata = {
  title: "Skill Games - Free Browser Arcade Games | FixedAim",
  description: "Play free browser skill games on FixedAim: Space Defense, Voyager, CPS Rush, Space Waves, and more. Sharpen your reflexes and clicking speed while having fun.",
};

export default function Page() {
  return <GamesPage />;
}
