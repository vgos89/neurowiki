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
