import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "Keyboard Accuracy Test - Stop Typos & Track Errors | FixedAim",
  description: "Find which keys you mistype the most. Track your per-key error rate and target problem keys to eliminate typos.",
  alternates: {
    canonical: "https://fixedaim.com/accuracy",
  },
  openGraph: {
    title: "Keyboard Accuracy Test - Stop Typos & Track Errors | FixedAim",
    description: "Find which keys you mistype the most. Track your per-key error rate and target problem keys to eliminate typos.",
    url: "https://fixedaim.com/accuracy",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keyboard Accuracy Test - Stop Typos & Track Errors | FixedAim",
    description: "Find which keys you mistype the most. Track your per-key error rate and target problem keys to eliminate typos.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
