import type { Metadata } from 'next';
import DAimTrainer from '@/views/3DAimTrainer';

export const metadata: Metadata = {
  title: "3D Aim Trainer - Browser FPS Practice in 3D | FixedAim",
  description: "Practice flicking, tracking, and precision in a true 3D spatial environment — no download required. The most realistic browser aim trainer available for free.",
};

export default function Page() {
  return <DAimTrainer />;
}
