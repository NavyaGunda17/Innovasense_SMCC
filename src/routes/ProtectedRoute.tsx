import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../store/store';
import { useLayoutAnimation } from '../context/LayoutAnimationContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
   const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
 const location = useLocation();
   const { isLoggingOut } = useLayoutAnimation();

 
  if (!isAuthenticated && !isLoggingOut ) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 