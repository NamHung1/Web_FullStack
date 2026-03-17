import { Table, Tag, Select, Button, Space, Rate, message } from 'antd';
import { useEffect, useState } from 'react';
import { adminUpdateOrderStatusAPI } from '../../api/order.api';
import type { OrderProduct, Review } from '../../types/order';
import api from '../../api/axios';
import styles from './ManageOrders.module.css';

type OrderStatus = 'pending' | 'completed' | 'cancelled';

interface Order {
  _id: string;
  userId: { name: string; email: string };
  products: OrderProduct[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftStatuses, setDraftStatuses] = useState<Record<string, OrderStatus>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
    } catch {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    setDraftStatuses((prev) => ({ ...prev, [orderId]: status }));
  };

  const submitStatusChange = async (orderId: string, fallbackStatus: OrderStatus) => {
    const nextStatus = draftStatuses[orderId] || fallbackStatus;

    try {
      setUpdatingId(orderId);
      await adminUpdateOrderStatusAPI(orderId, nextStatus);
      setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status: nextStatus } : order)));
      message.success('Order status updated');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const renderReview = (review?: Review | null) => {
    if (!review) {
      return <Tag>Not reviewed</Tag>;
    }

    return (
      <Space direction="vertical" size={0}>
        <Rate disabled value={review.rating} />
        <span>{review.comment || '-'}</span>
      </Space>
    );
  };


  const columns = [
    {
      title: 'User',
      dataIndex: 'userId',
      render: (user: { name: string; email: string }) => `${user.name} (${user.email})`,
    },
    {
      title: 'Products',
      dataIndex: 'products',
      render: (products: OrderProduct[]) => (
        <Space direction="vertical" size={2}>
          {products.map((item) => (
            <span key={item.productId._id}>
              {item.productId.name} x {item.quantity}
            </span>
          ))}
        </Space>
      ),
    },
    {
      title: 'Reviews',
      dataIndex: 'products',
      render: (products: OrderProduct[]) => (
        <Space direction="vertical" size={6}>
          {products.map((item) => (
            <div key={`${item.productId._id}-review`}>
              <strong>{item.productId.name}:</strong> {renderReview(item.review)}
            </div>
          ))}
        </Space>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      render: (total: number) => `$${total}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: OrderStatus) => (
        <Tag color={status === 'completed' ? 'green' : status === 'cancelled' ? 'red' : 'orange'}>{status}</Tag>
      ),
    },
    {
      title: 'Update Status',
      render: (_: unknown, record: Order) => {
        const selectedStatus = draftStatuses[record._id] || record.status;

        return (
          <Space className={styles.statusControls}>
            <Select
              size="small"
              value={selectedStatus}
              className={styles.statusSelect}
              options={[
                { value: 'pending', label: 'pending' },
                { value: 'completed', label: 'completed' },
                { value: 'cancelled', label: 'cancelled' },
              ]}
              onChange={(status: OrderStatus) => handleStatusChange(record._id, status)}
            />
            <Button
              size="small"
              type="primary"
              loading={updatingId === record._id}
              disabled={selectedStatus === record.status}
              onClick={() => submitStatusChange(record._id, record.status)}
            >
              Save
            </Button>
          </Space>
        );
      },
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
        className={styles.table}
        dataSource={orders}
        columns={columns}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />
    </div>
  );
}
