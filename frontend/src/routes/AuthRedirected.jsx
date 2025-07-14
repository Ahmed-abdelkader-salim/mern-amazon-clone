import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCurrentUserQuery } from '../app/api';

const AuthRedirected = ({ children }) => {
  const navigate = useNavigate();
  const { data: user, isLoading } = useGetCurrentUserQuery();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return user ? null : children;
};

export default AuthRedirected;