import type { Metadata } from 'next';
import SpaceWavesGame from '@/views/SpaceWavesGame';

export const metadata: Metadata = {
  title: "Space Waves - Arcade Dodge & Timing Game | FixedAim",
  description: "A side-scrolling arcade dodge game with procedural obstacles and parallax space backgrounds.",
  alternates: {
    canonical: "https://fixedaim.com/space-waves",
  },
  openGraph: {
    title: "Space Waves - Arcade Dodge & Timing Game | FixedAim",
    description: "A side-scrolling arcade dodge game with procedural obstacles and parallax space backgrounds.",
    url: "https://fixedaim.com/space-waves",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Space Waves - Arcade Dodge & Timing Game | FixedAim",
    description: "A side-scrolling arcade dodge game with procedural obstacles and parallax space backgrounds.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <SpaceWavesGame />;
}
