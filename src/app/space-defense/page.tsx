import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "Space Defense Game - Click Fast Under Pressure | FixedAim",
  description: "Defend your base from incoming threats in this free browser clicking game. Wave-based difficulty ramps up fast.",
  alternates: {
    canonical: "https://fixedaim.com/space-defense",
  },
  openGraph: {
    title: "Space Defense Game - Click Fast Under Pressure | FixedAim",
    description: "Defend your base from incoming threats in this free browser clicking game. Wave-based difficulty ramps up fast.",
    url: "https://fixedaim.com/space-defense",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Space Defense Game - Click Fast Under Pressure | FixedAim",
    description: "Defend your base from incoming threats in this free browser clicking game. Wave-based difficulty ramps up fast.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
