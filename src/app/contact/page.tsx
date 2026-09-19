import type { Metadata } from 'next';
import ContactPage from '@/views/ContactPage';

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch with FixedAim | FixedAim",
  description: "Have a question, suggestion, or found a bug? Get in touch with the FixedAim team.",
  alternates: {
    canonical: "https://fixedaim.com/contact",
  },
  openGraph: {
    title: "Contact Us - Get in Touch with FixedAim | FixedAim",
    description: "Have a question, suggestion, or found a bug? Get in touch with the FixedAim team.",
    url: "https://fixedaim.com/contact",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - Get in Touch with FixedAim | FixedAim",
    description: "Have a question, suggestion, or found a bug? Get in touch with the FixedAim team.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <ContactPage />;
}
