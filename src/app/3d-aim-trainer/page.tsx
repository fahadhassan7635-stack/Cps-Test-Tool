import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "3D Aim Trainer - Browser FPS Practice in 3D | FixedAim",
  description: "Practice flicking, tracking, and precision in a true 3D spatial environment — no download required.",
  alternates: {
    canonical: "https://fixedaim.com/3d-aim-trainer",
  },
  openGraph: {
    title: "3D Aim Trainer - Browser FPS Practice in 3D | FixedAim",
    description: "Practice flicking, tracking, and precision in a true 3D spatial environment — no download required.",
    url: "https://fixedaim.com/3d-aim-trainer",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Aim Trainer - Browser FPS Practice in 3D | FixedAim",
    description: "Practice flicking, tracking, and precision in a true 3D spatial environment — no download required.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
