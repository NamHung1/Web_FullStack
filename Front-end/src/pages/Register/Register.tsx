import { Form, Input, Button, Card, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import api from '../../api/axios';
import { useState } from 'react';
import { getApiErrorMessage } from '../../utils/apiError';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterForm) => {
    try {
      setLoading(true);

      await api.post('/auth/register', {
        ...values,
        email: values.email.toLowerCase(),
      });

      message.success('Register successful! Please login.');

      navigate('/login');
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, 'Register failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h2>Create Account</h2>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input placeholder="Your name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Invalid email format' },
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Register
          </Button>
        </Form>

        <p className={styles.text}>
          Already have account? <Link to="/login">Login</Link>
        </p>
      </Card>
    </div>
  );
}
