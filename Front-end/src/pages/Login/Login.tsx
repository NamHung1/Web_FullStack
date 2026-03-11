import { Form, Input, Button, Card, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        ...values,
        email: values.email.toLowerCase()
      });
      login(res.data.user, res.data.token);
      message.success('Login successful!');
      navigate('/');
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

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h2>Login</h2>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>

          <Form.Item label="Password" name="password">
            <Input.Password />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form>

        <p className={styles.text}>
          No account? <Link to="/register">Register</Link>
        </p>
      </Card>
    </div>
  );
}
