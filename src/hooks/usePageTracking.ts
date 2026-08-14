// src/hooks/usePageTracking.ts
// Tracks SPA route changes and sends page_view events to GA4.
// Usage: call once inside App.tsx (or your router root component).

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function usePageTracking(): void {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);
}
