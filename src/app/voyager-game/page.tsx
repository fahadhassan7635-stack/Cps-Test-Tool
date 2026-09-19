import type { Metadata } from 'next';
import VoyagerGame from '@/views/VoyagerGame';

export const metadata: Metadata = {
  title: "Voyager Game - Endless Mouse Evasion Arcade | FixedAim",
  description: "Dodge obstacles in this endless mouse-controlled evasion game. Difficulty scales continuously.",
  alternates: {
    canonical: "https://fixedaim.com/voyager-game",
  },
  openGraph: {
    title: "Voyager Game - Endless Mouse Evasion Arcade | FixedAim",
    description: "Dodge obstacles in this endless mouse-controlled evasion game. Difficulty scales continuously.",
    url: "https://fixedaim.com/voyager-game",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voyager Game - Endless Mouse Evasion Arcade | FixedAim",
    description: "Dodge obstacles in this endless mouse-controlled evasion game. Difficulty scales continuously.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <VoyagerGame />;
}
