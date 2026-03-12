import { Table, Tag, Select, message } from 'antd';
import styles from './ManageOrders.module.css';
import { updateOrderStatusAPI } from '../../api/order.api';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface Order {
  _id: string;
  user: string;
  // product: string,
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'cod' | 'bank_transfer' | 'momo';
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

  const handleStatusChange = async (
    orderId: string,
    status: 'pending' | 'completed' | 'cancelled',
  ) => {
    try {
      await updateOrderStatusAPI(orderId, status);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status } : order,
        ),
      );
      message.success('Order status updated');
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || 'Failed to update status',
      );
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'userId',
      render: (user: { name: string; email: string }) =>
        `${user.name} (${user.email})`,
    },
    // {
    //   title: 'Product name',
    //   dataIndex: 'name',
    //   render: (name: string) => `${product.name}`,
    // },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      render: (total: number) => `$${total}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: Order['status']) => (
        <Tag
          color={
            status === 'completed'
              ? 'green'
              : status === 'cancelled'
                ? 'red'
                : 'orange'
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Update Status',
      render: (_: unknown, record: Order) => (
        <Select
          size="small"
          value={record.status}
          style={{ width: 140 }}
          options={[
            { value: 'pending', label: 'pending' },
            { value: 'completed', label: 'completed' },
            { value: 'cancelled', label: 'cancelled' },
          ]}
          onChange={(status) => handleStatusChange(record._id, status)}
        />
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
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="_id"
        loading={loading}
      />
    </div>
  );
}
