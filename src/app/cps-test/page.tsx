import type { Metadata } from 'next';
import CPSTestPage from '@/views/CPSTestPage';

export const metadata: Metadata = {
  title: "CPS Test - Free Click Speed Test Online | FixedAim",
  description: "Test your CPS (Clicks Per Second) online. Master Left Click, Right Click, Butterfly Clicking, Jitter Clicking, and Drag Clicking with custom timers, live graph, and instant ranks.",
  keywords: [
    "CPS test",
    "click speed test",
    "what is left click test",
    "left click cps test",
    "what is right click test",
    "what is butterfly click test",
    "what is jitter click test",
    "what is drag click test",
    "butterfly clicking",
    "jitter clicking",
    "drag click test",
    "right click cps test",
    "kohi click test",
    "minecraft pvp click speed",
  ],
  alternates: {
    canonical: "https://fixedaim.com/cps-test",
  },
  openGraph: {
    title: "CPS Test - Free Click Speed Test Online | FixedAim",
    description: "Test your CPS (Clicks Per Second) online. Master Right Click, Butterfly Clicking, Jitter Clicking, and Drag Clicking with custom timers, live graph, and instant ranks.",
    url: "https://fixedaim.com/cps-test",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CPS Test - Free Click Speed Test Online | FixedAim",
    description: "Test your CPS (Clicks Per Second) online. Master Right Click, Butterfly Clicking, Jitter Clicking, and Drag Clicking with custom timers, live graph, and instant ranks.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <CPSTestPage />;
}
