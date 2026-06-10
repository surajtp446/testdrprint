import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Uses Lenis for smooth-scroll sites — falls back to native scrollTo.
// window.__lenis is set in App.jsx after Lenis initialises.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
