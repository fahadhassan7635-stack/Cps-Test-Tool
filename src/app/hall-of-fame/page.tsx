import type { Metadata } from 'next';
import LeaderboardPage from '@/views/LeaderboardPage';

export const metadata: Metadata = {
  title: "Hall of Fame - All-Time Best Scores | FixedAim",
  description: "The all-time best CPS, WPM, and reaction scores from the FixedAim community. See the records, challenge them, and earn your place in the hall of fame.",
};

export default function Page() {
  return <LeaderboardPage />;
}
