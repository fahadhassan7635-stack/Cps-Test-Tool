import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  isWebApplication?: boolean;
  applicationCategory?: string;
  featureList?: string[];
  breadcrumbs?: BreadcrumbItem[];
  robots?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  inLanguage?: string;
}

const BASE_URL = 'https://fixedaim.com';
const DEFAULT_IMAGE = `${BASE_URL}/og-default.png`;
const TWITTER_HANDLE = '@fixedaim'; // replace with your actual handle

export default function SEO({
  title,
  description,
  url,
  image = DEFAULT_IMAGE,
  isWebApplication = false,
  applicationCategory = 'UtilitiesApplication',
  featureList,
  breadcrumbs,
  robots = 'index, follow',
  twitterCard = 'summary_large_image',
  inLanguage = 'en',
}: SEOProps) {
  useEffect(() => {
    // ─── Helpers ────────────────────────────────────────────────────────────
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        const parts = selector.match(/\[([^\]]+)="([^"]+)"\]/);
        if (parts) el.setAttribute(parts[1], parts[2]);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // ─── Title ──────────────────────────────────────────────────────────────
    document.title = title;

    // ─── Canonical ──────────────────────────────────────────────────────────
    setLink('canonical', url);

    // ─── Basic Meta ─────────────────────────────────────────────────────────
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="robots"]', 'content', robots);

    // ─── Open Graph ─────────────────────────────────────────────────────────
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="og:site_name"]', 'content', 'FixedAim');
    setMeta('meta[property="og:locale"]', 'content', inLanguage === 'en' ? 'en_US' : inLanguage);

    // ─── Twitter Card ───────────────────────────────────────────────────────
    setMeta('meta[name="twitter:card"]', 'content', twitterCard);
    setMeta('meta[name="twitter:site"]', 'content', TWITTER_HANDLE);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', image);

    // ─── Build Breadcrumb schema ─────────────────────────────────────────────
    const buildBreadcrumbSchema = () => {
      const items: Array<{ '@type': string; position: number; name: string; item: string }> = [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL + '/' },
      ];

      if (breadcrumbs && breadcrumbs.length > 0) {
        breadcrumbs.forEach((crumb, idx) => {
          items.push({
            '@type': 'ListItem',
            position: idx + 2,
            name: crumb.name,
            item: crumb.url,
          });
        });
      } else if (url !== BASE_URL + '/') {
        items.push({ '@type': 'ListItem', position: 2, name: title, item: url });
      }

      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items,
      };
    };

    // ─── Build WebPage schema ────────────────────────────────────────────────
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      url,
      description,
      inLanguage,
      isPartOf: {
        '@type': 'WebSite',
        name: 'FixedAim',
        url: BASE_URL + '/',
      },
      breadcrumb: buildBreadcrumbSchema(),
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: image,
      },
    };

    // ─── Assemble all schemas ────────────────────────────────────────────────
    const schemas: object[] = [webPageSchema, buildBreadcrumbSchema()];

    if (isWebApplication) {
      schemas.unshift({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: title,
        url,
        description,
        applicationCategory,
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        inLanguage,
        ...(featureList && featureList.length > 0 && { featureList }),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      });
    }

    // ─── Inject JSON-LD ──────────────────────────────────────────────────────
    const existingScript = document.getElementById('dynamic-schema-markup');
    if (existingScript) document.head.removeChild(existingScript);

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamic-schema-markup';
    script.text = JSON.stringify(schemas);
    document.head.appendChild(script);

    // ─── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      const s = document.getElementById('dynamic-schema-markup');
      if (s && document.head.contains(s)) document.head.removeChild(s);
    };
  }, [title, description, url, image, isWebApplication, applicationCategory, featureList, robots, twitterCard, inLanguage, breadcrumbs]);

  return null;
}
