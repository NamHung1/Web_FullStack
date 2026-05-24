import { useEffect } from 'react';
import { Spin, message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const finishOAuthLogin = async () => {
      const token = searchParams.get('token');

      if (!token) {
        message.error('Missing OAuth token');
        navigate('/login');
        return;
      }

      try {
        localStorage.setItem('token', token);
        const res = await api.get('/auth/me');
        login(res.data, token);

        message.success('Login with Google successful!');

        if (res.data?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch {
        localStorage.removeItem('token');
        message.error('Google login failed');
        navigate('/login');
      }
    };

    finishOAuthLogin();
  }, [login, navigate, searchParams]);

  return <Spin fullscreen tip="Logging you in..." />;
}
