import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare interface ScrollPageWrapperProps {
  children: React.ReactNode;
}

const ScrollPageWrapper = ({ children }: ScrollPageWrapperProps) => {
  const location = useLocation();
  useLayoutEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, [location.pathname]);
  return children;
};

export default ScrollPageWrapper;
