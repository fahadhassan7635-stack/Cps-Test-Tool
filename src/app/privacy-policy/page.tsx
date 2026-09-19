import type { Metadata } from 'next';
import PrivacyPolicy from '@/views/PrivacyPolicy';

export const metadata: Metadata = {
  title: "Privacy Policy | FixedAim",
  description: "Read the FixedAim Privacy Policy to understand how we collect, use, and protect your data.",
  alternates: {
    canonical: "https://fixedaim.com/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | FixedAim",
    description: "Read the FixedAim Privacy Policy to understand how we collect, use, and protect your data.",
    url: "https://fixedaim.com/privacy-policy",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | FixedAim",
    description: "Read the FixedAim Privacy Policy to understand how we collect, use, and protect your data.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <PrivacyPolicy />;
}
