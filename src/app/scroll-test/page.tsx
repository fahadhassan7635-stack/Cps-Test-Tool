import type { Metadata } from 'next';
import ScrollTestPage from '@/views/ScrollTestPage';

export const metadata: Metadata = {
  title: "Scroll Speed Test - Mouse Wheel Speed Checker | FixedAim",
  description: "Measure how fast your mouse wheel scrolls. Check scroll lines per second, test your scroll speed, and see if your mouse wheel is performing at its best.",
};

export default function Page() {
  return <ScrollTestPage />;
}
