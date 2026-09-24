import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "CPS Rush - Burst Click Speed Game | FixedAim",
  description: "Short, intense clicking rounds to push your peak burst CPS to the limit.",
  alternates: {
    canonical: "https://fixedaim.com/cps-rush",
  },
  openGraph: {
    title: "CPS Rush - Burst Click Speed Game | FixedAim",
    description: "Short, intense clicking rounds to push your peak burst CPS to the limit.",
    url: "https://fixedaim.com/cps-rush",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CPS Rush - Burst Click Speed Game | FixedAim",
    description: "Short, intense clicking rounds to push your peak burst CPS to the limit.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
