// LAYOUT_SPEC §1.3.2 / HUB_SPEC §6.1
// Toggles ?favs=true on the current route, preserving other params.
import { useSearchParams } from 'react-router-dom';

export function useFavoritesFilter(): { isActive: boolean; toggle: () => void } {
  const [searchParams, setSearchParams] = useSearchParams();
  const isActive = searchParams.get('favs') === 'true';

  const toggle = () => {
    const next = new URLSearchParams(searchParams);
    if (isActive) {
      next.delete('favs');
    } else {
      next.set('favs', 'true');
    }
    setSearchParams(next, { replace: true });
  };

  return { isActive, toggle };
}
