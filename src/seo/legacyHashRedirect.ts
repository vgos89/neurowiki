
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LegacyHashRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    
    // Only intervene if there is a hash path (legacy routing)
    if (hash && hash.startsWith('#/')) {
      const path = hash.substring(1); // Remove '#' e.g. "/calculators?id=nihss"
      
      // Parse query params to convert ?id=xxx to /xxx
      const [pathname, search] = path.split('?');
      const params = new URLSearchParams(search);
      
      let newPath = pathname;

      // Handle specific legacy migration patterns: ?id= → canonical calculator routes
      if (pathname === '/calculators' && params.has('id')) {
        const id = params.get('id');
        const legacyToCanonical: Record<string, string> = {
          nihss: 'nihss',
          ich: 'ich-score',
          abcd2: 'abcd2-score',
          'has-bled': 'has-bled-score',
          rope: 'rope-score',
          gcs: 'glasgow-coma-scale',
        };
        if (id && legacyToCanonical[id]) {
          newPath = `/calculators/${legacyToCanonical[id]}`;
        } else if (id) {
          newPath = `/calculators/${id}`;
        }
      }

      // Perform the redirect (replace history to avoid back-button loops)
      navigate(newPath, { replace: true });
    }
  }, [navigate]);

  return null;
};

export default LegacyHashRedirect;
