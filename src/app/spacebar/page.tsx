import type { Metadata } from 'next';
import SpacebarPage from '@/views/SpacebarPage';

export const metadata: Metadata = {
  title: "Spacebar Counter - Space Click Speed Test | FixedAim",
  description: "Test how fast you can tap the spacebar. Choose your timer, spam the space key, and see your CPS score. Simple, free, and instant.",
  alternates: {
    canonical: "https://fixedaim.com/spacebar",
  },
  openGraph: {
    title: "Spacebar Counter - Space Click Speed Test | FixedAim",
    description: "Test how fast you can tap the spacebar. Choose your timer, spam the space key, and see your CPS score. Simple, free, and instant.",
    url: "https://fixedaim.com/spacebar",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spacebar Counter - Space Click Speed Test | FixedAim",
    description: "Test how fast you can tap the spacebar. Choose your timer, spam the space key, and see your CPS score. Simple, free, and instant.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <SpacebarPage />;
}
