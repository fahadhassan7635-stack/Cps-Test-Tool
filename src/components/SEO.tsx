import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  url: string;
  isWebApplication?: boolean;
}

export default function SEO({ title, description, url, isWebApplication = false }: SEOProps) {
  useEffect(() => {
    // Set Document Title
    document.title = title;
    
    // Set Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Prepare JSON-LD Schemas
    const schemas: any[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "url": url,
        "description": description
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://fixedaim.com/"
          }
        ]
      }
    ];

    // Add current page to breadcrumb if it's not the home page
    if (url !== "https://fixedaim.com/") {
      schemas[1].itemListElement.push({
        "@type": "ListItem",
        "position": 2,
        "name": title,
        "item": url
      });
    }

    if (isWebApplication) {
      schemas.unshift({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": title,
        "url": url,
        "description": description,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "WebBrowser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      });
    }

    // Inject Script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamic-schema-markup';
    script.text = JSON.stringify(schemas);

    const existingScript = document.getElementById('dynamic-schema-markup');
    if (existingScript) {
      document.head.removeChild(existingScript);
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('dynamic-schema-markup');
      if (scriptToRemove && document.head.contains(scriptToRemove)) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [title, description, url, isWebApplication]);

  return null;
}
