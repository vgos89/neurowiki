import React from 'react';
import { useLocation } from 'react-router-dom';
import { isPublished } from '../config/contentStatus';
import { ComingSoon } from './ComingSoon';

interface PublishGateProps {
  children: React.ReactNode;
  /** Optional: override the path check (useful for dynamic routes) */
  path?: string;
  /** Backward-compatible alias used in route declarations. */
  routeId?: string;
}

export const PublishGate: React.FC<PublishGateProps> = ({ children, path, routeId }) => {
  const location = useLocation();
  const checkPath = routeId ?? path ?? location.pathname;

  if (!isPublished(checkPath)) {
    return <ComingSoon />;
  }

  return <>{children}</>;
};

export default PublishGate;
