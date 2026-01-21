import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

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
    navigate(getBackPath());
  };

  return {
    source,
    getBackLabel,
    getBackPath,
    goBack,
  };
};
