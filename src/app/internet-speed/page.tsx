import type { Metadata } from 'next';
import InternetSpeedPage from '@/views/InternetSpeedPage';

export const metadata: Metadata = {
  title: "Internet Speed Test – Check Download, Upload & Ping | FixedAim",
  description: "Free internet speed test — measure download, upload, ping, jitter & packet loss in seconds. No sign-up needed. Start your speed test now on FixedAim.",
  alternates: {
    canonical: "https://fixedaim.com/internet-speed",
  },
  openGraph: {
    title: "Internet Speed Test – Check Download, Upload & Ping | FixedAim",
    description: "Free internet speed test — measure download, upload, ping, jitter & packet loss in seconds. No sign-up needed. Start your speed test now on FixedAim.",
    url: "https://fixedaim.com/internet-speed",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Internet Speed Test – Check Download, Upload & Ping | FixedAim",
    description: "Free internet speed test — measure download, upload, ping, jitter & packet loss. No sign-up. Start now on FixedAim.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <InternetSpeedPage />;
}
