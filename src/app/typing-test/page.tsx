import type { Metadata } from 'next';
import TypingTestPage from '@/views/TypingTestPage';

export const metadata: Metadata = {
  title: "Typing Speed Test - Free WPM Test Online | FixedAim",
  description: "Find your true typing speed in words per minute with our free WPM test. No account needed. Track accuracy, speed, and improve your typing skills instantly.",
};

export default function Page() {
  return <TypingTestPage />;
}
