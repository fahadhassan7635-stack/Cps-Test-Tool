import type { Metadata } from 'next';
import ContactPage from '@/views/ContactPage';

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch with FixedAim | FixedAim",
  description: "Have a question, suggestion, or found a bug? Get in touch with the FixedAim team. We read every message and aim to respond as quickly as possible.",
};

export default function Page() {
  return <ContactPage />;
}
