import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "Blog - Tips, Guides & Updates | FixedAim",
  description: "Read the latest tips, improvement guides, and platform updates from the FixedAim team.",
  alternates: {
    canonical: "https://fixedaim.com/blog",
  },
  openGraph: {
    title: "Blog - Tips, Guides & Updates | FixedAim",
    description: "Read the latest tips, improvement guides, and platform updates from the FixedAim team.",
    url: "https://fixedaim.com/blog",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Tips, Guides & Updates | FixedAim",
    description: "Read the latest tips, improvement guides, and platform updates from the FixedAim team.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
