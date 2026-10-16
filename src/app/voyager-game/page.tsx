import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "Voyager Game - Space Endurance Arcade & CPS Trainer | FixedAim",
  description: "Guide the Voyager ship through an endless asteroid field. Improve your CPS with this free space endurance arcade game — track Peak CPS, survive boss asteroids, collect power-ups, and unlock achievements.",
  keywords: [
    "voyager game", "voyager space game", "asteroid dodge game", "space endurance game",
    "cps trainer game", "clicks per second game", "spacebar cps game", "mouse clicking game",
    "online space arcade", "free browser game", "endurance clicker game", "fixedaim voyager",
    "boost clicking game", "peak cps tracker", "dodge asteroid game", "cps improvement game",
  ],
  alternates: {
    canonical: "https://fixedaim.com/voyager-game",
  },
  openGraph: {
    title: "Voyager Game - Space Endurance Arcade & CPS Trainer | FixedAim",
    description: "Guide the Voyager ship through an endless asteroid field. Improve your CPS with this free space endurance arcade game — track Peak CPS, survive boss asteroids, collect power-ups, and unlock achievements.",
    url: "https://fixedaim.com/voyager-game",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voyager Game - Space Endurance Arcade & CPS Trainer | FixedAim",
    description: "Guide the Voyager ship through an endless asteroid field. Improve your CPS with this free space endurance arcade game.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
