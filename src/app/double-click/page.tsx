import type { Metadata } from 'next';
import DoubleClickPage from '@/views/DoubleClickPage';

export const metadata: Metadata = {
  title: "Double Click Test - Mouse Switch Health Checker | FixedAim",
  description: "Diagnose double-click issues from worn mouse switches. Detects accidental double clicks in real time and shows click intervals so you can spot problems fast.",
};

export default function Page() {
  return <DoubleClickPage />;
}
