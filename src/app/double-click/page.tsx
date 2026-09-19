import type { Metadata } from 'next';
import DoubleClickPage from '@/views/DoubleClickPage';

export const metadata: Metadata = {
  title: "Double Click Test - Mouse Switch Health Checker | FixedAim",
  description: "Diagnose double-click issues from worn mouse switches. Detects accidental double clicks in real time.",
  alternates: {
    canonical: "https://fixedaim.com/double-click",
  },
  openGraph: {
    title: "Double Click Test - Mouse Switch Health Checker | FixedAim",
    description: "Diagnose double-click issues from worn mouse switches. Detects accidental double clicks in real time.",
    url: "https://fixedaim.com/double-click",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Double Click Test - Mouse Switch Health Checker | FixedAim",
    description: "Diagnose double-click issues from worn mouse switches. Detects accidental double clicks in real time.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DoubleClickPage />;
}
