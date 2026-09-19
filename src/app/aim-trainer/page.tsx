import type { Metadata } from 'next';
import AimTrainerPage from '@/views/AimTrainerPage';

export const metadata: Metadata = {
  title: "Aim Trainer - Free Browser FPS Aim Practice | FixedAim",
  description: "Sharpen your FPS aim in the browser — no download needed. Choose Easy, Medium, Hard, or Flick mode. Track accuracy, combos, and personal records instantly.",
  alternates: {
    canonical: "https://fixedaim.com/aim-trainer",
  },
  openGraph: {
    title: "Aim Trainer - Free Browser FPS Aim Practice | FixedAim",
    description: "Sharpen your FPS aim in the browser — no download needed. Choose Easy, Medium, Hard, or Flick mode. Track accuracy, combos, and personal records instantly.",
    url: "https://fixedaim.com/aim-trainer",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aim Trainer - Free Browser FPS Aim Practice | FixedAim",
    description: "Sharpen your FPS aim in the browser — no download needed. Choose Easy, Medium, Hard, or Flick mode. Track accuracy, combos, and personal records instantly.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <AimTrainerPage />;
}
