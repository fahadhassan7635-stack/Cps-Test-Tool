import type { Metadata } from 'next';
import GamesPage from '@/views/GamesPage';

export const metadata: Metadata = {
  title: "Skill Games - Free Browser Arcade Games | FixedAim",
  description: "Play free browser skill games on FixedAim.",
  alternates: {
    canonical: "https://fixedaim.com/games",
  },
  openGraph: {
    title: "Skill Games - Free Browser Arcade Games | FixedAim",
    description: "Play free browser skill games on FixedAim.",
    url: "https://fixedaim.com/games",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Games - Free Browser Arcade Games | FixedAim",
    description: "Play free browser skill games on FixedAim.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <GamesPage />;
}
