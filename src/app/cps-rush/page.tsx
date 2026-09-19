import type { Metadata } from 'next';
import CpsRush from '@/views/CpsRush';

export const metadata: Metadata = {
  title: "CPS Rush - Burst Click Speed Game | FixedAim",
  description: "Short, intense clicking rounds to push your peak burst CPS to the limit. Race against the clock, beat your personal best, and see how fast you can truly click.",
};

export default function Page() {
  return <CpsRush />;
}
