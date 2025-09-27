import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/auth/LoginForm';

export default function Login() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <LoginForm />;
}