import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useLastLocation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Ignore auth pages
    const ignorePaths = ['/login', '/register', '/forgot-password'];
    if (!ignorePaths.includes(location.pathname)) {
      localStorage.setItem('lastLocation', JSON.stringify({
        pathname: location.pathname,
        search: location.search,
        hash: location.hash
      }));
    }
  }, [location]);

  const navigateToLastLocation = () => {
    const lastLocation = JSON.parse(localStorage.getItem('lastLocation'));
    if (lastLocation) {
      navigate(lastLocation.pathname + lastLocation.search + lastLocation.hash);
    } else {
      navigate('/');
    }
  };

  return { navigateToLastLocation };
}; 