import { Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import styles from './ManageOrders.module.css';

interface Order {
  _id: string;
  userId: { name: string; email: string };
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
    } catch (error) {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'userId',
      render: (user: { name: string; email: string }) => `${user.name} (${user.email})`,
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      render: (total: number) => `$${total}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : status === 'cancelled' ? 'red' : 'orange'}>{status}</Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Manage Orders</h1>
      <Table dataSource={orders} columns={columns} rowKey="_id" loading={loading} />
    </div>
  );
}
