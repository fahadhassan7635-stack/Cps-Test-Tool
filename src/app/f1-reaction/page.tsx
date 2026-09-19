import type { Metadata } from 'next';
import FReactionPage from '@/views/F1ReactionPage';

export const metadata: Metadata = {
  title: "F1 Reaction Test - Formula 1 Race Start Simulator | FixedAim",
  description: "Simulate an authentic F1 lights-out race start. Measure your reaction time in milliseconds like a real Formula 1 driver — and watch out for jump starts!",
};

export default function Page() {
  return <FReactionPage />;
}
