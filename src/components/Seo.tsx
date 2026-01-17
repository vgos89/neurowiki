
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMeta } from '../seo/routeMeta';

const Seo: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const meta = getRouteMeta(location.pathname);
    const domain = 'https://neurowiki.ai';
    const canonicalUrl = `${domain}${location.pathname === '/' ? '' : location.pathname}`;
    const isStaging = window.location.hostname.endsWith('.pages.dev');

    // Set Document Title
    document.title = meta.title;

    // Helper to set/update meta tags
    const setMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    setMeta('description', meta.description);
    if (meta.keywords) setMeta('keywords', meta.keywords);

    // Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // Open Graph
    setMeta('og:site_name', 'NeuroWiki', 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:title', meta.title, 'property');
    setMeta('og:description', meta.description, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    if (meta.image) setMeta('og:image', meta.image, 'property');

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', meta.title);
    setMeta('twitter:description', meta.description);
    if (meta.image) setMeta('twitter:image', meta.image);

    // Prevent Indexing on pages.dev
    if (isStaging) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      // Ensure we allow indexing on production if previously set to noindex
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta && robotsMeta.getAttribute('content') === 'noindex, nofollow') {
        document.head.removeChild(robotsMeta);
      }
    }

  }, [location]);

  return null;
};

export default Seo;
