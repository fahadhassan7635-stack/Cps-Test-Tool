import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "Mouse Accuracy Test - DPI & Tracking Precision Test | FixedAim",
  description: "Test your mouse tracking accuracy and find your ideal DPI. Get a path efficiency score and detect cursor tremor.",
  alternates: {
    canonical: "https://fixedaim.com/mouse-accuracy",
  },
  openGraph: {
    title: "Mouse Accuracy Test - DPI & Tracking Precision Test | FixedAim",
    description: "Test your mouse tracking accuracy and find your ideal DPI. Get a path efficiency score and detect cursor tremor.",
    url: "https://fixedaim.com/mouse-accuracy",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mouse Accuracy Test - DPI & Tracking Precision Test | FixedAim",
    description: "Test your mouse tracking accuracy and find your ideal DPI. Get a path efficiency score and detect cursor tremor.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
