import type { Metadata } from 'next';
import AimTrainerPage from '@/views/AimTrainerPage';

export const metadata: Metadata = {
  title: "Aim Trainer - Free Browser FPS Aim Practice | FixedAim",
  description: "Sharpen your FPS aim in the browser — no download needed. Choose Easy, Medium, Hard, or Flick mode. Track accuracy, combos, and personal records instantly.",
};

export default function Page() {
  return <AimTrainerPage />;
}
