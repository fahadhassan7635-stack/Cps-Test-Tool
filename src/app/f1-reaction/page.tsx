import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "F1 Reaction Test - Formula 1 Race Start Simulator | FixedAim",
  description: "Simulate an authentic F1 lights-out race start. Measure your reaction time in milliseconds like a real Formula 1 driver.",
  alternates: {
    canonical: "https://fixedaim.com/f1-reaction",
  },
  openGraph: {
    title: "F1 Reaction Test - Formula 1 Race Start Simulator | FixedAim",
    description: "Simulate an authentic F1 lights-out race start. Measure your reaction time in milliseconds like a real Formula 1 driver.",
    url: "https://fixedaim.com/f1-reaction",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "F1 Reaction Test - Formula 1 Race Start Simulator | FixedAim",
    description: "Simulate an authentic F1 lights-out race start. Measure your reaction time in milliseconds like a real Formula 1 driver.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
