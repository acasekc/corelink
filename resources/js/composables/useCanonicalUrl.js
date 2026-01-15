import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useCanonicalUrl() {
  const location = useLocation();
  
  return useMemo(() => {
    // Always use https://corelink.dev as the domain, preserve path and query
    const pathname = location.pathname;
    const search = location.search;
    return 'https://corelink.dev' + pathname + search;
  }, [location.pathname, location.search]);
}
