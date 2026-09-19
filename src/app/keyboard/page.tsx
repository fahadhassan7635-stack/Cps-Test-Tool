import type { Metadata } from 'next';
import KeyboardPage from '@/views/KeyboardPage';

export const metadata: Metadata = {
  title: "Keyboard Tools - Typing, Accuracy & Key Tests | FixedAim",
  description: "Browse all free keyboard testing tools on FixedAim.",
  alternates: {
    canonical: "https://fixedaim.com/keyboard",
  },
  openGraph: {
    title: "Keyboard Tools - Typing, Accuracy & Key Tests | FixedAim",
    description: "Browse all free keyboard testing tools on FixedAim.",
    url: "https://fixedaim.com/keyboard",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keyboard Tools - Typing, Accuracy & Key Tests | FixedAim",
    description: "Browse all free keyboard testing tools on FixedAim.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <KeyboardPage />;
}
