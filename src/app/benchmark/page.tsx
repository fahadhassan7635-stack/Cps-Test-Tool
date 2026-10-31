import type { Metadata } from 'next';
import BenchmarkPage from '@/views/BenchmarkPage';

export const metadata: Metadata = {
  title: "Benchmark Hub – Internet Speed Test | FixedAim",
  description: "Benchmark your internet connection speed with real-time download, upload, ping, jitter & packet loss tests. Free, no sign-up required — FixedAim.",
  alternates: {
    canonical: "https://fixedaim.com/benchmark",
  },
  openGraph: {
    title: "Benchmark Hub – Internet Speed Test | FixedAim",
    description: "Benchmark your internet connection speed with real-time download, upload, ping, jitter & packet loss tests. Free, no sign-up required — FixedAim.",
    url: "https://fixedaim.com/benchmark",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Benchmark Hub – Internet Speed Test | FixedAim",
    description: "Benchmark your internet speed — download, upload, ping, jitter & packet loss. Free on FixedAim.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <BenchmarkPage />;
}
