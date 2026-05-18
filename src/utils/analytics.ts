// Google Analytics helper functions

export const GA_MEASUREMENT_ID = 'G-0PD4HYYNTP';

/**
 * Track a page view with an explicit title.
 *
 * Why we pass page_title explicitly: GA4's auto-page_view (from gtag config or
 * Enhanced Measurement on history changes) reads document.title at the moment
 * it fires. On direct entries (search results, deep links) GA4 fires BEFORE
 * Seo.tsx's useEffect runs, so it captures the static index.html fallback
 * title instead of the route-specific title. Passing page_title here gives
 * us the correct title regardless of when document.title finishes updating.
 *
 * Called from Seo.tsx on every route change AFTER document.title is set.
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: url,
      page_title: title ?? document.title,
      page_location: window.location.href,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track user role selection
export const trackUserRole = (role: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'select_role', {
      event_category: 'user_onboarding',
      event_label: role,
      user_role: role,
    });
    
    // Also set as user property for future tracking
    (window as any).gtag('set', 'user_properties', {
      user_role: role,
    });
  }
};

// Track calculator usage
export const trackCalculatorUsed = (
  calculatorName: string,
  resultValue?: string | number
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'calculator_used', {
      event_category: 'calculators',
      calculator_name: calculatorName,
      result_value: resultValue,
    });
  }
};

// Track search queries
export const trackSearch = (
  searchTerm: string,
  resultsCount?: number
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'search', {
      event_category: 'engagement',
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }
};

// Track quick tool clicks
export const trackQuickToolClick = (toolName: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'quick_tool_click', {
      event_category: 'navigation',
      tool_name: toolName,
    });
  }
};

export const CONSENT_STORAGE_KEY = 'neurowiki-analytics-consent';

export const loadGA = (): void => {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.__gaLoaded) return;
  w.__gaLoaded = true;

  w.dataLayer = w.dataLayer || [];
  // GA4 gtag API requires the arguments object, not a rest-param array
  w.gtag = function() { w.dataLayer.push(arguments); }; // eslint-disable-line prefer-rest-params
  w.gtag('js', new Date());
  // send_page_view:false — we fire page_view manually from Seo.tsx after
  // document.title is set, so GA4 captures the correct route-specific title
  // instead of the static index.html fallback. Closes the title-capture
  // bug surfaced by 2026-05-18 weekly report.
  w.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: false,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
};
