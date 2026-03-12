import { Form, Input, Button, Card, message } from 'antd';
import { FacebookOutlined, GoogleOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';

type OAuthProviders = {
  google: boolean;
  facebook: boolean;
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [oauthProviders, setOauthProviders] = useState<OAuthProviders>({
    google: false,
    facebook: false,
  });

  useEffect(() => {
    const fetchOAuthProviders = async () => {
      try {
        const res = await api.get('/auth/oauth-providers');
        setOauthProviders(res.data);
      } catch (_error) {
        setOauthProviders({ google: false, facebook: false });
      }
    };

    fetchOAuthProviders();
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        ...values,
        email: values.email.toLowerCase(),
      });
      login(res.data.user, res.data.token);
      message.success('Login successful!');
      if (res.data.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleFacebookLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/facebook`;
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h2 className={styles.title_login}>Login</h2>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>

          <Form.Item label="Password" name="password">
            <Input.Password />
          </Form.Item>

          <Button htmlType="submit" block loading={loading} className={styles.btn_login}>
            Login
          </Button>
        </Form>

        {(oauthProviders.google || oauthProviders.facebook) && (
          <div className={styles.oauthSection}>
            {oauthProviders.google && (
              <Button block onClick={handleGoogleLogin} className={styles.btn_google}>
                <GoogleOutlined />
                Login with Google
              </Button>
            )}

            {oauthProviders.facebook && (
              <Button block onClick={handleFacebookLogin} className={styles.btn_facebook}>
                <FacebookOutlined />
                Login with Facebook
              </Button>
            )}
          </div>
        )}

        <p className={styles.text}>
          No account? <Link to="/register" className={styles.link_register}>Register</Link>
        </p>
      </Card>
    </div>
  );
}
