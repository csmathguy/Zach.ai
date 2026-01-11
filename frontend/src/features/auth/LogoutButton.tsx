import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

interface LogoutButtonProps {
  className?: string;
}

export const LogoutButton = ({ className }: LogoutButtonProps): JSX.Element => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleLogout} disabled={loading} className={className}>
      {loading ? 'Logging out...' : 'Log out'}
    </button>
  );
};
