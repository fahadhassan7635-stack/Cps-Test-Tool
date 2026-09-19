import type { Metadata } from 'next';
import MousePage from '@/views/MousePage';

export const metadata: Metadata = {
  title: "Mouse Tools - CPS, Accuracy & Scroll Tests | FixedAim",
  description: "Browse all free mouse testing tools on FixedAim.",
  alternates: {
    canonical: "https://fixedaim.com/mouse",
  },
  openGraph: {
    title: "Mouse Tools - CPS, Accuracy & Scroll Tests | FixedAim",
    description: "Browse all free mouse testing tools on FixedAim.",
    url: "https://fixedaim.com/mouse",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mouse Tools - CPS, Accuracy & Scroll Tests | FixedAim",
    description: "Browse all free mouse testing tools on FixedAim.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <MousePage />;
}
