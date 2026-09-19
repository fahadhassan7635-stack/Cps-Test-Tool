import type { Metadata } from 'next';
import HomePage from '@/views/HomePage';

export const metadata: Metadata = {
  title: "FixedAim - Free CPS Test, Aim Trainer & Typing Speed Test Online",
  description: "The ultimate free platform to test clicking speed, typing WPM, reaction time, and aim precision. No signup needed. Play, test, and improve instantly.",
};

export default function Page() {
  return <HomePage />;
}
