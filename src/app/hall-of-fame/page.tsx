import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "Hall of Fame - All-Time Best Scores | FixedAim",
  description: "The all-time best CPS, WPM, and reaction scores from the FixedAim community.",
  alternates: {
    canonical: "https://fixedaim.com/hall-of-fame",
  },
  openGraph: {
    title: "Hall of Fame - All-Time Best Scores | FixedAim",
    description: "The all-time best CPS, WPM, and reaction scores from the FixedAim community.",
    url: "https://fixedaim.com/hall-of-fame",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hall of Fame - All-Time Best Scores | FixedAim",
    description: "The all-time best CPS, WPM, and reaction scores from the FixedAim community.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
