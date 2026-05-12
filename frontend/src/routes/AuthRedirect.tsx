import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-evoli-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-evoli-primary animate-spin" />
      </div>
    );
  }

  return <Navigate to={user ? '/projects' : '/login'} replace />;
};
