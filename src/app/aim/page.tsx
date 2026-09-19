import type { Metadata } from 'next';
import AimPage from '@/views/AimPage';

export const metadata: Metadata = {
  title: "Aim & Reaction Tools - Browser Trainers | FixedAim",
  description: "Browse all free aim and reaction tools on FixedAim.",
  alternates: {
    canonical: "https://fixedaim.com/aim",
  },
  openGraph: {
    title: "Aim & Reaction Tools - Browser Trainers | FixedAim",
    description: "Browse all free aim and reaction tools on FixedAim.",
    url: "https://fixedaim.com/aim",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aim & Reaction Tools - Browser Trainers | FixedAim",
    description: "Browse all free aim and reaction tools on FixedAim.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <AimPage />;
}
