import type { Metadata } from 'next';
import TermsPage from '@/views/TermsPage';

export const metadata: Metadata = {
  title: "Terms of Service | FixedAim",
  description: "Read the FixedAim Terms of Service. By using our free tools and games you agree to these terms. Fair use, no spam, no abuse — simple rules for everyone.",
};

export default function Page() {
  return <TermsPage />;
}
