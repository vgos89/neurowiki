import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

/**
 * Two-hook navigation boundary.
 *
 * useBackNavigation (src/hooks/useBackNavigation.ts)
 *   → SPA-safe back-nav behavior only. Use when you need to go back and don't
 *     care about source context or label. Takes a fallback path for direct-entry.
 *
 * useNavigationSource (this hook)
 *   → Source context (?from=, ?category= query params) + label resolution +
 *     goBack / handleBack aliases. Use when you need to render source-aware
 *     labels ("Back to Guide" vs "Back to Trials") or read navigation source.
 *
 * Do NOT inline `window.history.length > 1` in components — use one of these hooks.
 */
interface NavigationSource {
  from: 'guide' | 'calculators' | 'pathways' | 'trials' | 'home' | null;
  category: string | null;
}

export const useNavigationSource = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const source: NavigationSource = {
    from: searchParams.get('from') as NavigationSource['from'],
    category: searchParams.get('category'),
  };

  const getBackLabel = (): string => {
    if (source.from) {
      switch (source.from) {
        case 'guide':
          return 'Back to Guide';
        case 'calculators':
          return 'Back to Calculators';
        case 'pathways':
          return 'Back to Pathways';
        case 'trials':
          return 'Back to Trials';
        default:
          return 'Back';
      }
    }
    const path = location.pathname;
    if (path.startsWith('/guide/')) return 'Back to Guide';
    if (path.startsWith('/calculators/')) return 'Back to Calculators';
    if (path.startsWith('/pathways/')) return 'Back to Pathways';
    if (path.startsWith('/trials/')) return 'Back to Trials';
    return 'Back';
  };

  const getBackPath = (): string => {
    const categoryParam = source.category ? `?open=${encodeURIComponent(source.category)}` : '';

    if (source.from) {
      switch (source.from) {
        case 'guide':
          return `/guide${categoryParam}`;
        case 'calculators':
          return `/calculators${categoryParam}`;
        case 'pathways':
          return `/pathways${categoryParam}`;
        case 'trials':
          return `/trials${categoryParam}`;
        default:
          return '/';
      }
    }

    const path = location.pathname;
    if (path.startsWith('/guide/')) return '/guide';
    if (path.startsWith('/calculators/') || path === '/calculators') return '/calculators';
    if (path.startsWith('/pathways/')) return '/pathways';
    if (path.startsWith('/trials/')) return '/trials';
    return '/';
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(getBackPath());
    }
  };

  const handleBack = goBack;

  return {
    source,
    getBackLabel,
    getBackPath,
    goBack,
    handleBack,
  };
};
