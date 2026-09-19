import type { Metadata } from 'next';
import MouseAccuracyPage from '@/views/MouseAccuracyPage';

export const metadata: Metadata = {
  title: "Mouse Accuracy Test - DPI & Tracking Precision Test | FixedAim",
  description: "Test your mouse tracking accuracy and find your ideal DPI. Get a path efficiency score, detect cursor tremor, and fine-tune your sensitivity for peak precision.",
};

export default function Page() {
  return <MouseAccuracyPage />;
}
