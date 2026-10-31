import type { Metadata } from 'next';
import InternetSpeedPage from '@/views/InternetSpeedPage';

export const metadata: Metadata = {
  title: "Internet Speed Test – Check Download, Upload & Ping | FixedAim",
  description: "Free internet speed test by FixedAim: measure your download speed, upload speed, ping, jitter and packet loss in seconds. Learn what a good speed is and fix slow connections.",
  alternates: {
    canonical: "https://fixedaim.com/internet-speed",
  },
  openGraph: {
    title: "Internet Speed Test – Check Download, Upload & Ping | FixedAim",
    description: "Free internet speed test by FixedAim: measure your download speed, upload speed, ping, jitter and packet loss in seconds. Learn what a good speed is and fix slow connections.",
    url: "https://fixedaim.com/internet-speed",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Internet Speed Test – Check Download, Upload & Ping | FixedAim",
    description: "Free internet speed test by FixedAim: measure your download speed, upload speed, ping, jitter and packet loss in seconds.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <InternetSpeedPage />;
}
