import { Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { getOrdersAPI } from '../../api/order.api';
import styles from './Orders.module.css';

interface Order {
  _id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrdersAPI();
      setOrders(data);
    } catch (error) {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      render: (id: string) => id.slice(-8),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      render: (t: number) => `$${t}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => (
        <Tag color={s === 'completed' ? 'green' : s === 'cancelled' ? 'red' : 'orange'}>{s}</Tag>
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
      <h1>Your Orders</h1>
      <Table dataSource={orders} columns={columns} rowKey="_id" loading={loading} />
    </div>
  );
}
