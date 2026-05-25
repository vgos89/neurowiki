import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMeta } from '../seo/routeMeta';
import { getSchemaForRoute } from '../seo/schema';
import { trackPageView } from '../utils/analytics';

const JSON_LD_SCRIPT_ID = 'neurowiki-json-ld';

// SEO B3 (2026-05-15): fallback social-share image used when a route does
// not declare its own meta.image. Pathway/calculator pages intentionally
// don't ship custom og:image assets (per V — "we can't add images to the
// pathways, that will not look good"); they fall back to the branded
// site-shell og-image.png so link previews still render a brand card
// instead of a missing-image placeholder.
// v=3 bump (2026-05-19): new OG image generated via Nano Banana from the
// brief at docs/og-image-brief.md. The query suffix forces iMessage /
// Twitter / Slack / LinkedIn / Facebook to refetch instead of serving
// the cached prior image.
const DEFAULT_OG_IMAGE = 'https://www.neurowiki.ai/og-image.png?v=4';

const Seo: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const meta = getRouteMeta(location.pathname);
    const domain = 'https://www.neurowiki.ai';
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
    setMeta('og:image', meta.image || DEFAULT_OG_IMAGE, 'property');

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', meta.title);
    setMeta('twitter:description', meta.description);
    setMeta('twitter:image', meta.image || DEFAULT_OG_IMAGE);

    // JSON-LD structured data (MedicalWebPage, SoftwareApplication, Organization)
    let scriptJsonLd = document.getElementById(JSON_LD_SCRIPT_ID) as HTMLScriptElement | null;
    const schema = getSchemaForRoute(location.pathname, meta);
    if (schema) {
      if (!scriptJsonLd) {
        scriptJsonLd = document.createElement('script');
        scriptJsonLd.id = JSON_LD_SCRIPT_ID;
        scriptJsonLd.type = 'application/ld+json';
        document.head.appendChild(scriptJsonLd);
      }
      scriptJsonLd.textContent = JSON.stringify(schema);
    } else if (scriptJsonLd) {
      scriptJsonLd.remove();
    }

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

    // Fire page_view AFTER all meta + title are set. Passes title explicitly
    // so GA4 captures the route-specific title (not the static fallback from
    // index.html). Paired with `send_page_view:false` in loadGA() to prevent
    // double-firing. Fixes title-capture bug from 2026-05-18 weekly report.
    if (!isStaging) {
      trackPageView(location.pathname, meta.title);
    }
  }, [location]);

  return null;
};

export default Seo;
