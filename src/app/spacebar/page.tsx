import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "Spacebar Counter - Free Spacebar Speed Test Online | FixedAim",
  description: "Test your spacebar speed online. Master butterfly spacebar tapping, jitter click counter on spacebar, and train for Minecraft, rhythm games, and FPS.",
  keywords: [
    "spacebar counter",
    "spacebar test",
    "butterfly spacebar test",
    "jitter click counter spacebar",
    "spacebar clicker",
    "spacebar cps test",
    "where to use spacebar counter",
    "minecraft spacebar test",
    "spacebar speed test",
    "space bar clicker",
    "geometry dash spacebar",
  ],
  alternates: {
    canonical: "https://fixedaim.com/spacebar",
  },
  openGraph: {
    title: "Spacebar Counter - Free Spacebar Speed Test Online | FixedAim",
    description: "Test your spacebar speed online. Master butterfly spacebar tapping, jitter click counter on spacebar, and train for Minecraft, rhythm games, and FPS.",
    url: "https://fixedaim.com/spacebar",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spacebar Counter - Free Spacebar Speed Test Online | FixedAim",
    description: "Test your spacebar speed online. Master butterfly spacebar tapping, jitter click counter on spacebar, and train for Minecraft, rhythm games, and FPS.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
