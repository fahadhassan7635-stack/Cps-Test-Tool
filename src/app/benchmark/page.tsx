import type { Metadata } from 'next';
import BenchmarkPage from '@/views/BenchmarkPage';

export const metadata: Metadata = {
  title: "Benchmark Hub - Internet Speed, Reaction, CPS & Performance Tests | FixedAim",
  description: "Test and benchmark your network speed, latency, clicking speed, typing WPM, and peripheral input performance with real-time analytics. Free online benchmarks.",
  alternates: {
    canonical: "https://fixedaim.com/benchmark",
  },
  openGraph: {
    title: "Benchmark Hub - Internet Speed, Reaction, CPS & Performance Tests | FixedAim",
    description: "Test and benchmark your network speed, latency, clicking speed, typing WPM, and peripheral input performance with real-time analytics. Free online benchmarks.",
    url: "https://fixedaim.com/benchmark",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Benchmark Hub - Internet Speed, Reaction, CPS & Performance Tests | FixedAim",
    description: "Test and benchmark your network speed, latency, clicking speed, typing WPM, and peripheral input performance with real-time analytics.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <BenchmarkPage />;
}
