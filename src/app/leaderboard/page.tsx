import type { Metadata } from 'next';
import LeaderboardPage from '@/views/LeaderboardPage';

export const metadata: Metadata = {
  title: "Leaderboard - Top CPS & WPM Scores | FixedAim",
  description: "See the highest CPS and WPM scores from players around the world. Can you make it onto the FixedAim global leaderboard? Test your skills and submit your score.",
};

export default function Page() {
  return <LeaderboardPage />;
}
