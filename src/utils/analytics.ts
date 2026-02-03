// Google Analytics helper functions

export const GA_MEASUREMENT_ID = 'G-0PD4HYYNTP';

// Track page views (if using React Router)
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
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
