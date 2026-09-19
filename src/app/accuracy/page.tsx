import type { Metadata } from 'next';
import AccuracyTestPage from '@/views/AccuracyTestPage';

export const metadata: Metadata = {
  title: "Keyboard Accuracy Test - Stop Typos & Track Errors | FixedAim",
  description: "Find which keys you mistype the most. Track your per-key error rate, see your accuracy percentage, and target problem keys to eliminate typos for good.",
};

export default function Page() {
  return <AccuracyTestPage />;
}
