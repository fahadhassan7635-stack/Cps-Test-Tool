import type { Metadata } from 'next';
import ApmDrillPage from '@/views/ApmDrillPage';

export const metadata: Metadata = {
  title: "APM Drill - Actions Per Minute Speed Test Online | FixedAim",
  description: "Measure your actions per minute with surgical precision. Free online APM speed test and drill with real-time analytics, grid modes, and keyboard speed trainer.",
  alternates: {
    canonical: "https://fixedaim.com/apm-drill",
  },
  openGraph: {
    title: "APM Drill - Actions Per Minute Speed Test Online | FixedAim",
    description: "Measure your actions per minute with surgical precision. Free online APM speed test and drill with real-time analytics, grid modes, and keyboard speed trainer.",
    url: "https://fixedaim.com/apm-drill",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "APM Drill - Actions Per Minute Speed Test Online | FixedAim",
    description: "Measure your actions per minute with surgical precision. Free online APM speed test and drill with real-time analytics, grid modes, and keyboard speed trainer.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <ApmDrillPage />;
}
