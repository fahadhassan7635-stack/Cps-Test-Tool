import type { Metadata } from 'next';
import ReactionTimePage from '@/views/ReactionTimePage';

export const metadata: Metadata = {
  title: "Reaction Time Test - Human Reflex Speed Test | FixedAim",
  description: "How fast are your reflexes? Measure your reaction time in milliseconds, average across multiple attempts, and see how you compare to the human average.",
  alternates: {
    canonical: "https://fixedaim.com/reaction-time",
  },
  openGraph: {
    title: "Reaction Time Test - Human Reflex Speed Test | FixedAim",
    description: "How fast are your reflexes? Measure your reaction time in milliseconds, average across multiple attempts, and see how you compare to the human average.",
    url: "https://fixedaim.com/reaction-time",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reaction Time Test - Human Reflex Speed Test | FixedAim",
    description: "How fast are your reflexes? Measure your reaction time in milliseconds, average across multiple attempts, and see how you compare to the human average.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <ReactionTimePage />;
}
