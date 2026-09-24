"use client";

import dynamic from 'next/dynamic';

const KeyVisualizerPage = dynamic(
  () => import('@/views/KeyVisualizerPage'),
  {
    ssr: false,
    loading: () => (<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080d14' }}><p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Loading...</p></div>),
  }
);

export default function DynamicPage() {
  return <KeyVisualizerPage />;
}
