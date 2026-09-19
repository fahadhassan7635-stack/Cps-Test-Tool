import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";

const SITE_URL = "https://fixedaim.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FixedAim - Free CPS Test, Aim Trainer & Typing Speed Test Online",
    template: "%s | FixedAim",
  },
  description:
    "The ultimate free platform to test clicking speed, typing WPM, reaction time, and aim precision. No signup needed. Play, test, and improve instantly.",
  keywords: [
    "CPS test", "click speed test", "typing speed test", "WPM test",
    "reaction time test", "aim trainer", "spacebar counter",
    "key visualizer", "mouse accuracy", "double click test",
    "scroll test", "free gaming tools",
  ],
  authors: [{ name: "FixedAim" }],
  creator: "FixedAim",
  publisher: "FixedAim",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "FixedAim",
    title: "FixedAim - Free CPS Test, Aim Trainer & Typing Speed Test Online",
    description:
      "The ultimate free platform to test clicking speed, typing WPM, reaction time, and aim precision. No signup needed.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FixedAim - Free Gaming Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FixedAim - Free CPS Test, Aim Trainer & Typing Speed Test Online",
    description:
      "The ultimate free platform to test clicking speed, typing WPM, reaction time, and aim precision.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/gun-pfp-192.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
