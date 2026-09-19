import type { Metadata } from 'next';
import CPSTestPage from '@/views/CPSTestPage';

export const metadata: Metadata = {
  title: "CPS Test - Free Click Speed Test Online | FixedAim",
  description: "Test your CPS (Clicks Per Second) for free. Measure click speed with 1s–100s timer modes, compare your scores, and challenge yourself to click faster.",
  alternates: {
    canonical: "https://fixedaim.com/cps-test",
  },
  openGraph: {
    title: "CPS Test - Free Click Speed Test Online | FixedAim",
    description: "Test your CPS (Clicks Per Second) for free. Measure click speed with 1s–100s timer modes, compare your scores, and challenge yourself to click faster.",
    url: "https://fixedaim.com/cps-test",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CPS Test - Free Click Speed Test Online | FixedAim",
    description: "Test your CPS (Clicks Per Second) for free. Measure click speed with 1s–100s timer modes, compare your scores, and challenge yourself to click faster.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <CPSTestPage />;
}
