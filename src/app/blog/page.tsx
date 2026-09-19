import type { Metadata } from 'next';
import BlogPage from '@/views/BlogPage';

export const metadata: Metadata = {
  title: "Blog - Tips, Guides & Updates | FixedAim",
  description: "Read the latest tips, improvement guides, and platform updates from the FixedAim team. Learn how to click faster, type better, and improve your gaming reflexes.",
};

export default function Page() {
  return <BlogPage />;
}
