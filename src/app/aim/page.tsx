import type { Metadata } from 'next';
import AimPage from '@/views/AimPage';

export const metadata: Metadata = {
  title: "Aim & Reaction Tools - Browser Trainers | FixedAim",
  description: "Browse all free aim and reaction tools on FixedAim: aim trainer, 3D aim trainer, reaction time test, F1 reaction test, and more. Train in your browser for free.",
};

export default function Page() {
  return <AimPage />;
}
