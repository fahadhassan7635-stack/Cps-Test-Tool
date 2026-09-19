import type { Metadata } from 'next';
import PrivacyPolicy from '@/views/PrivacyPolicy';

export const metadata: Metadata = {
  title: "Privacy Policy | FixedAim",
  description: "Read the FixedAim Privacy Policy to understand how we collect, use, and protect your data. We are committed to keeping your information safe and transparent.",
};

export default function Page() {
  return <PrivacyPolicy />;
}
