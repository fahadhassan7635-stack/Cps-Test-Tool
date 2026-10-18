import type { Metadata } from 'next';
import DynamicPage from './DynamicPage';

export const metadata: Metadata = {
  title: "Space Defense - Meteor Shooter & CPS Aim Game | FixedAim",
  description: "Defend your ship from incoming meteor waves in this free space shooter arcade. Train your CPS, flick aim, and reflexes with boss battles, 5 power-ups, and difficulty modes.",
  keywords: [
    "space defense",
    "space defense game",
    "meteor shooter game",
    "asteroid shooter online",
    "cps shooter game",
    "aim training space game",
    "free space shooter browser",
    "click speed arcade",
    "space defense high score",
    "flick aim trainer game",
    "space arcade game",
    "fixedaim space defense",
  ],
  alternates: {
    canonical: "https://fixedaim.com/space-defense",
  },
  openGraph: {
    title: "Space Defense - Meteor Shooter & CPS Aim Game | FixedAim",
    description: "Defend your ship from incoming meteor waves in this free space shooter arcade. Train your CPS, flick aim, and reflexes with boss battles, 5 power-ups, and difficulty modes.",
    url: "https://fixedaim.com/space-defense",
    siteName: "FixedAim",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Space Defense - Meteor Shooter & CPS Aim Game | FixedAim",
    description: "Defend your ship from incoming meteor waves in this free space shooter arcade. Train your CPS, flick aim, and reflexes.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <DynamicPage />;
}
