import type { Metadata } from 'next';
import CPSTestPage from '@/views/CPSTestPage';

export const metadata: Metadata = {
  title: "CPS Test - Free Click Speed Test Online | FixedAim",
  description: "Test your CPS (Clicks Per Second) for free. Measure click speed with 1s–100s timer modes, compare your scores, and challenge yourself to click faster.",
};

export default function Page() {
  return <CPSTestPage />;
}
