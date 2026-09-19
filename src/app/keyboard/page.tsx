import type { Metadata } from 'next';
import KeyboardPage from '@/views/KeyboardPage';

export const metadata: Metadata = {
  title: "Keyboard Tools - Typing, Accuracy & Key Tests | FixedAim",
  description: "Browse all free keyboard testing tools on FixedAim: typing speed test, key visualizer, spacebar counter, accuracy test, and more. Start testing instantly.",
};

export default function Page() {
  return <KeyboardPage />;
}
