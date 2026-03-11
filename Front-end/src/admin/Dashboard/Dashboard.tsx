import { Card, Row, Col, Spin } from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import styles from './Dashboard.module.css';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/admin/dashboard');

      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <Row gutter={[20, 20]}>
        <Col xs={24} md={12} lg={6}>
          <Card className={styles.card}>
            <UserOutlined className={styles.icon} />

            <h3>Total Users</h3>

            <p className={styles.number}>{stats?.totalUsers}</p>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card className={styles.card}>
            <ShoppingOutlined className={styles.icon} />

            <h3>Total Products</h3>

            <p className={styles.number}>{stats?.totalProducts}</p>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card className={styles.card}>
            <ShoppingCartOutlined className={styles.icon} />

            <h3>Total Orders</h3>

            <p className={styles.number}>{stats?.totalOrders}</p>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card className={styles.card}>
            <DollarOutlined className={styles.icon} />

            <h3>Revenue</h3>

            <p className={styles.number}>${(stats?.revenue ?? 0).toLocaleString()}</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
