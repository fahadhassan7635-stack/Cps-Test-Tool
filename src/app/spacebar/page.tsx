import type { Metadata } from 'next';
import SpacebarPage from '@/views/SpacebarPage';

export const metadata: Metadata = {
  title: "Spacebar Counter - Space Click Speed Test | FixedAim",
  description: "Test how fast you can tap the spacebar. Choose your timer, spam the space key, and see your CPS score. Simple, free, and instant — no signup required.",
};

export default function Page() {
  return <SpacebarPage />;
}
