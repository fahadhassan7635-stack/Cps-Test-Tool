import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "Typing Speed Test - Free WPM Test Online | FixedAim",
  description: "Find your true typing speed in words per minute with our free WPM test. No account needed. Track accuracy, speed, and improve your typing skills instantly.",
  alternates: {
    canonical: "https://fixedaim.com/typing-test",
  },
  openGraph: {
    title: "Typing Speed Test - Free WPM Test Online | FixedAim",
    description: "Find your true typing speed in words per minute with our free WPM test. No account needed. Track accuracy, speed, and improve your typing skills instantly.",
    url: "https://fixedaim.com/typing-test",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Typing Speed Test - Free WPM Test Online | FixedAim",
    description: "Find your true typing speed in words per minute with our free WPM test. No account needed. Track accuracy, speed, and improve your typing skills instantly.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
