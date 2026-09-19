import type { Metadata } from 'next';
import MousePage from '@/views/MousePage';

export const metadata: Metadata = {
  title: "Mouse Tools - CPS, Accuracy & Scroll Tests | FixedAim",
  description: "Browse all free mouse testing tools on FixedAim: CPS test, double click test, scroll speed test, mouse accuracy, and more. No signup — just open and test.",
};

export default function Page() {
  return <MousePage />;
}
