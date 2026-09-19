import type { Metadata } from 'next';
import ReactionTimePage from '@/views/ReactionTimePage';

export const metadata: Metadata = {
  title: "Reaction Time Test - Human Reflex Speed Test | FixedAim",
  description: "How fast are your reflexes? Measure your reaction time in milliseconds, average across multiple attempts, and see how you compare to the human average.",
};

export default function Page() {
  return <ReactionTimePage />;
}
