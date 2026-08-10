import { useEffect } from 'react';

/* ─────────────────────────────────────────────
   Site-wide constants — edit here, nowhere else
───────────────────────────────────────────────*/
const SITE_URL = 'https://fixedaim.com';
const SITE_NAME = 'FixedAim';
const SITE_LOGO = `${SITE_URL}/gun-pfp-192.png`;
const DEFAULT_OG_IMAGE = `${SITE_URL}/gun-pfp-192.png`;
const TWITTER_HANDLE = ''; // Set to '@handle' when you have one

/* ─────────────────────────────────────────────
   Public types — preserved from original API
───────────────────────────────────────────────*/
export interface FAQItem {
  question: string;
  answer: string;
}

export interface ArticleMeta {
  publishedTime: string;
  modifiedTime?: string;
  authorName?: string;
  authorUrl?: string;
  imageUrl?: string;
}

export interface SEOProps {
  /** Full page title, e.g. "CPS Test – FixedAim" */
  title: string;
  /** 50–160 character page description */
  description: string;
  /**
   * Canonical URL for this page.
   * May be absolute ("https://fixedaim.com/cps-test") or
   * root-relative ("/cps-test") — both are handled.
   */
  url: string;
  /** Override canonical if it differs from url (rare) */
  canonical?: string;
  /** Set true for interactive tools/games */
  isWebApplication?: boolean;
  applicationCategory?: 'GameApplication' | 'UtilitiesApplication' | 'EducationalApplication';
  /** Intermediate breadcrumb steps between Home and current page */
  breadcrumbs?: { name: string; url: string }[];
  /** Supply to inject FAQPage schema */
  faqs?: FAQItem[];
  /** Supply to switch WebPage → Article schema */
  article?: ArticleMeta;
  /** Override the OG/Twitter share image */
  ogImage?: string;
  /**
   * Controls the robots meta tag.
   * Defaults to 'index, follow'.
   * Pass 'noindex, nofollow' for pages you want de-indexed.
   */
  robots?: string;
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────*/

/** Ensures a URL is always absolute using SITE_URL as base. */
function toAbsolute(href: string): string {
  if (!href) return SITE_URL;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  // Root-relative → prepend SITE_URL (strip trailing slash from SITE_URL first)
  return `${SITE_URL.replace(/\/$/, '')}/${href.replace(/^\//, '')}`;
}

/** Normalise a canonical: strip hash, optionally normalise trailing slash. */
function normaliseCanonical(href: string): string {
  const abs = toAbsolute(href);
  // Remove fragment identifiers from canonical URLs
  return abs.split('#')[0];
}

/* ─────────────────────────────────────────────
   Low-level DOM helpers
   All helpers are idempotent: they find-or-create,
   never duplicate.
───────────────────────────────────────────────*/

function setMetaName(name: string, content: string): HTMLMetaElement {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return el;
}

function setMetaProperty(property: string, content: string): HTMLMetaElement {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return el;
}

function removeMetaProperty(property: string): void {
  const el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (el) el.remove();
}

function setLinkCanonical(href: string): void {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/* ─────────────────────────────────────────────
   SEO Component
───────────────────────────────────────────────*/
export default function SEO({
  title,
  description,
  url,
  canonical,
  isWebApplication = false,
  applicationCategory = 'UtilitiesApplication',
  breadcrumbs = [],
  faqs,
  article,
  ogImage,
  robots = 'index, follow',
}: SEOProps) {
  useEffect(() => {
    const pageUrl = toAbsolute(url);
    const canonicalUrl = normaliseCanonical(canonical ?? url);
    const resolvedOgImage = ogImage ?? DEFAULT_OG_IMAGE;

    /* ── Document title ── */
    document.title = title;

    /* ── Canonical ── */
    setLinkCanonical(canonicalUrl);

    /* ── Standard meta ── */
    setMetaName('description', description);
    setMetaName('robots', robots);

    /* ── Open Graph ── */
    setMetaProperty('og:type', article ? 'article' : 'website');
    setMetaProperty('og:site_name', SITE_NAME);
    setMetaProperty('og:title', title);
    setMetaProperty('og:description', description);
    setMetaProperty('og:url', pageUrl);
    setMetaProperty('og:image', resolvedOgImage);

    /* ── Article OG — set when article exists, remove when it doesn't ── */
    if (article) {
      setMetaProperty('article:published_time', article.publishedTime);
      if (article.modifiedTime) {
        setMetaProperty('article:modified_time', article.modifiedTime);
      } else {
        removeMetaProperty('article:modified_time');
      }
    } else {
      // Clean up stale article meta from a previous route
      removeMetaProperty('article:published_time');
      removeMetaProperty('article:modified_time');
    }

    /* ── Twitter / X Card ── */
    setMetaName('twitter:card', 'summary_large_image');
    if (TWITTER_HANDLE) setMetaName('twitter:site', TWITTER_HANDLE);
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', resolvedOgImage);

    /* ════════════════════════════
       JSON-LD Schema Assembly
    ════════════════════════════ */
    const schemas: object[] = [];

    /* 1. Organization — site-level, same on every page */
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: SITE_LOGO,
      },
      sameAs: [],
    });

    /* 2. WebSite — site-level */
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      publisher: { '@id': `${SITE_URL}/#organization` },
    });

    /* 3. WebApplication — only for interactive tools/games */
    if (isWebApplication) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': `${pageUrl}#webapp`,
        name: title,
        url: pageUrl,
        description,
        applicationCategory,
        operatingSystem: 'WebBrowser',
        inLanguage: 'en',
        isAccessibleForFree: true,
        publisher: { '@id': `${SITE_URL}/#organization` },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      });
    }

    /* 4. WebPage or Article — always present */
    const webPageType = article ? 'Article' : 'WebPage';
    const webPageSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': webPageType,
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      image: {
        '@type': 'ImageObject',
        url: resolvedOgImage,
      },
    };

    if (article) {
      webPageSchema['datePublished'] = article.publishedTime;
      if (article.modifiedTime) webPageSchema['dateModified'] = article.modifiedTime;
      if (article.authorName) {
        webPageSchema['author'] = {
          '@type': 'Person',
          name: article.authorName,
          ...(article.authorUrl && { url: article.authorUrl }),
        };
      }
      if (article.imageUrl) {
        webPageSchema['image'] = {
          '@type': 'ImageObject',
          url: article.imageUrl,
        };
      }
    }

    schemas.push(webPageSchema);

    /* 5. BreadcrumbList
       Rules:
       - Homepage (pageUrl === SITE_URL or SITE_URL+'/') gets no breadcrumbs —
         a trail of just "Home" is meaningless and wastes a rich result.
       - All other pages get: Home › [intermediate] › Current Page
       - All URLs must be absolute.
       - No duplicates.
    */
    const isHomepage =
      pageUrl === SITE_URL ||
      pageUrl === `${SITE_URL}/`;

    if (!isHomepage) {
      const breadcrumbItems: Record<string, unknown>[] = [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
      ];

      // Intermediate crumbs from props
      breadcrumbs.forEach((crumb, i) => {
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: i + 2,
          name: crumb.name,
          item: toAbsolute(crumb.url),
        });
      });

      // Current page — only add if not already the last item
      const lastItem = breadcrumbItems[breadcrumbItems.length - 1];
      const lastUrl = lastItem.item as string;
      if (lastUrl !== pageUrl) {
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: breadcrumbItems.length + 1,
          name: title,
          item: pageUrl,
        });
      }

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
      });
    }

    /* 6. FAQPage — only when FAQs are actually supplied */
    if (faqs && faqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    /* ── Inject all schemas — remove stale script first ── */
    const existingScript = document.getElementById('dynamic-schema-markup');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamic-schema-markup';
    script.text = JSON.stringify(schemas);
    document.head.appendChild(script);

    /* ── Cleanup on unmount ── */
    return () => {
      const s = document.getElementById('dynamic-schema-markup');
      if (s) s.remove();
    };
  }, [
    title,
    description,
    url,
    canonical,
    isWebApplication,
    applicationCategory,
    breadcrumbs,
    faqs,
    article,
    ogImage,
    robots,
  ]);

  return null;
}