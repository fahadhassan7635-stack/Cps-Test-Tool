import { useEffect } from 'react';

const SITE_URL = 'https://fixedaim.com';
const SITE_NAME = 'FixedAim';
const SITE_LOGO = `${SITE_URL}/gun-pfp-192.png`;
const DEFAULT_OG_IMAGE = `${SITE_URL}/gun-pfp-192.png`;
const TWITTER_HANDLE = '';

interface FAQItem {
  question: string;
  answer: string;
}

interface ArticleMeta {
  publishedTime: string;
  modifiedTime?: string;
  authorName?: string;
  authorUrl?: string;
  imageUrl?: string;
}

interface SEOProps {
  title: string;
  description: string;
  url: string;
  isWebApplication?: boolean;
  applicationCategory?: 'GameApplication' | 'UtilitiesApplication' | 'EducationalApplication';
  breadcrumbs?: { name: string; url: string }[];
  faqs?: FAQItem[];
  article?: ArticleMeta;
  canonical?: string;
  ogImage?: string;
}

export default function SEO({
  title,
  description,
  url,
  isWebApplication = false,
  applicationCategory = 'UtilitiesApplication',
  breadcrumbs = [],
  faqs,
  article,
  canonical,
  ogImage,
}: SEOProps) {
  useEffect(() => {
    /* ── Document title ── */
    document.title = title;

    /* ── Meta helpers ── */
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
      return el;
    };

    const setMetaName = (name: string, content: string) => {
      const el = setMeta(`meta[name="${name}"]`, 'name', name);
      el.setAttribute('content', content);
    };

    const setMetaProperty = (property: string, content: string) => {
      const el = setMeta(`meta[property="${property}"]`, 'property', property);
      el.setAttribute('content', content);
    };

    /* ── Canonical ── */
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonical ?? url);

    /* ── Standard meta ── */
    setMetaName('description', description);
    setMetaName('robots', 'index, follow');

    /* ── Open Graph ── */
    setMetaProperty('og:type', article ? 'article' : 'website');
    setMetaProperty('og:site_name', SITE_NAME);
    setMetaProperty('og:title', title);
    setMetaProperty('og:description', description);
    setMetaProperty('og:url', url);
    setMetaProperty('og:image', ogImage ?? DEFAULT_OG_IMAGE);

    /* ── Twitter / X Card ── */
    setMetaName('twitter:card', 'summary_large_image');
    if (TWITTER_HANDLE) setMetaName('twitter:site', TWITTER_HANDLE);
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', ogImage ?? DEFAULT_OG_IMAGE);

    /* ── Article meta ── */
    if (article) {
      setMetaProperty('article:published_time', article.publishedTime);
      if (article.modifiedTime) setMetaProperty('article:modified_time', article.modifiedTime);
    }

    /* ════════════════════════════
       JSON-LD Schema Assembly
    ════════════════════════════ */
    const schemas: object[] = [];

    /* 1. Organization */
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: SITE_LOGO,
      },
      sameAs: [],
    });

    /* 2. WebSite */
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { '@id': `${SITE_URL}/#organization` },
    });

    /* 3. WebApplication (optional) */
    if (isWebApplication) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': `${url}#webapp`,
        name: title,
        url,
        description,
        applicationCategory: applicationCategory,
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

    /* 4. WebPage — always present */
    const webPageSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': article ? 'Article' : 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      image: {
        '@type': 'ImageObject',
        url: ogImage ?? DEFAULT_OG_IMAGE,
      },
    };

    /* 4a. Article enrichment */
    if (article) {
      webPageSchema['@type'] = 'Article';
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

    /* 5. BreadcrumbList */
    const breadcrumbItems = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      ...breadcrumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${SITE_URL}${crumb.url}`,
      })),
    ];

    const lastItem = breadcrumbItems[breadcrumbItems.length - 1];
    if (lastItem.item !== url && url !== `${SITE_URL}/`) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: breadcrumbItems.length + 1,
        name: title,
        item: url,
      });
    }

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    });

    /* 6. FAQPage (optional) */
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

    /* ── Inject all schemas as a single script tag ── */
    const existingScript = document.getElementById('dynamic-schema-markup');
    if (existingScript) document.head.removeChild(existingScript);

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamic-schema-markup';
    script.text = JSON.stringify(schemas);
    document.head.appendChild(script);

    return () => {
      const s = document.getElementById('dynamic-schema-markup');
      if (s && document.head.contains(s)) document.head.removeChild(s);
    };
  }, [title, description, url, isWebApplication, applicationCategory, breadcrumbs, faqs, article, canonical, ogImage]);

  return null;
}
