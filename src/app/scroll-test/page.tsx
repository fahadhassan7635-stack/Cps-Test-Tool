import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "Scroll Speed Test - Mouse Wheel Speed Checker | FixedAim",
  description: "Measure how fast your mouse wheel scrolls. Check scroll lines per second and see if your mouse wheel is performing at its best.",
  alternates: {
    canonical: "https://fixedaim.com/scroll-test",
  },
  openGraph: {
    title: "Scroll Speed Test - Mouse Wheel Speed Checker | FixedAim",
    description: "Measure how fast your mouse wheel scrolls. Check scroll lines per second and see if your mouse wheel is performing at its best.",
    url: "https://fixedaim.com/scroll-test",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scroll Speed Test - Mouse Wheel Speed Checker | FixedAim",
    description: "Measure how fast your mouse wheel scrolls. Check scroll lines per second and see if your mouse wheel is performing at its best.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
