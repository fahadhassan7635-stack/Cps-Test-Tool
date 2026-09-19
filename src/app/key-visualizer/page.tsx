import type { Metadata } from 'next';
import KeyVisualizerPage from '@/views/KeyVisualizerPage';

export const metadata: Metadata = {
  title: "Key Visualizer - Live Keystroke Display Online | FixedAim",
  description: "See every keystroke visualised in real time. Perfect for streamers, typists, and keyboard enthusiasts.",
  alternates: {
    canonical: "https://fixedaim.com/key-visualizer",
  },
  openGraph: {
    title: "Key Visualizer - Live Keystroke Display Online | FixedAim",
    description: "See every keystroke visualised in real time. Perfect for streamers, typists, and keyboard enthusiasts.",
    url: "https://fixedaim.com/key-visualizer",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Key Visualizer - Live Keystroke Display Online | FixedAim",
    description: "See every keystroke visualised in real time. Perfect for streamers, typists, and keyboard enthusiasts.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <KeyVisualizerPage />;
}
