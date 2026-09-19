import type { Metadata } from 'next';
import LeaderboardPage from '@/views/LeaderboardPage';

export const metadata: Metadata = {
  title: "Leaderboard - Top CPS & WPM Scores | FixedAim",
  description: "See the highest CPS and WPM scores from players around the world.",
  alternates: {
    canonical: "https://fixedaim.com/leaderboard",
  },
  openGraph: {
    title: "Leaderboard - Top CPS & WPM Scores | FixedAim",
    description: "See the highest CPS and WPM scores from players around the world.",
    url: "https://fixedaim.com/leaderboard",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboard - Top CPS & WPM Scores | FixedAim",
    description: "See the highest CPS and WPM scores from players around the world.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <LeaderboardPage />;
}
