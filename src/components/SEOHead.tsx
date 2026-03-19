import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
}

const SEOHead = ({
  title = 'Powerful Impact Windows | Hurricane Protection Windows & Doors',
  description = 'Professional installation of impact windows and doors for hurricane protection across the United States. Get a free estimate today! Call +1 786 779 7140',
  keywords = 'impact windows, hurricane windows, impact doors, storm protection, hurricane protection, window installation, door installation, Florida, Miami, hurricane resistant',
  canonicalUrl,
  ogImage = '/og-image.png',
  type = 'website',
  structuredData,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Update canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }

    // Add structured data
    if (structuredData) {
      let scriptTag = document.querySelector('script[data-seo="structured-data"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        scriptTag.setAttribute('data-seo', 'structured-data');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, canonicalUrl, ogImage, type, structuredData]);

  return null;
};

// Pre-built structured data for the business
export const businessStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Powerful Impact Windows',
  description: 'Professional installation of impact windows and doors for hurricane protection across the United States.',
  url: 'https://powerfulimpactwindows.com',
  telephone: '+1-786-779-7140',
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
  priceRange: '$$',
  owner: {
    '@type': 'Person',
    name: 'Abelardo Soler',
  },
  sameAs: [
    'https://www.facebook.com/powerfulimpactwindows',
    'https://www.instagram.com/powerfulimpactwindows',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Hurricane Protection Products',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Impact Window Installation',
          description: 'Professional installation of hurricane-resistant impact windows',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Impact Door Installation',
          description: 'Professional installation of hurricane-resistant impact doors',
        },
      },
    ],
  },
};

export const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are impact windows?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Impact windows are specially designed windows that can withstand high winds and flying debris during hurricanes. They are made with laminated glass that stays intact even when broken.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you service all of the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Powerful Impact Windows provides professional installation services across all 50 states in the United States.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I get a free estimate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can get a free estimate by using our online calculator, calling us at +1 786 779 7140, or contacting us via WhatsApp.',
      },
    },
  ],
};

export default SEOHead;
