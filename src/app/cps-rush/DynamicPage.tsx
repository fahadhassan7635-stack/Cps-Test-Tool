"use client";

import dynamic from 'next/dynamic';

const CpsRush = dynamic(
  () => import('@/views/CpsRush'),
  {
    ssr: false,
    loading: () => (<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080d14' }}><p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Loading...</p></div>),
  }
);

export default function DynamicPage() {
  return <CpsRush />;
}
