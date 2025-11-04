import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's a hash in the URL, check if it's a valid CSS selector
    if (hash) {
      // Check if hash looks like a valid CSS selector (starts with # and contains only valid characters)
      const isValidSelector = /^#[a-zA-Z][a-zA-Z0-9_-]*$/.test(hash);
      
      if (isValidSelector) {
        // Small delay to ensure the element is rendered
        setTimeout(() => {
          try {
            const element = document.querySelector(hash);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          } catch (error) {
            // If querySelector fails, just scroll to top
            console.warn('Invalid selector in hash:', hash);
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth'
            });
          }
        }, 100);
      } else {
        // If hash doesn't look like a valid selector (e.g., OAuth callback), scroll to top
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }
    } else {
      // Otherwise, scroll to top when pathname changes
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
