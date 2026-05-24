import { Table, Tag, Select, Button, Space, Rate, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { adminUpdateOrderStatusAPI, getAdminOrdersAPI, type OrderStatus } from '../../api/order.api';
import type { OrderProduct, Review } from '../../types/order';
import { getApiErrorMessage } from '../../utils/apiError';
import styles from './ManageOrders.module.css';

type OrderStatusFilter = OrderStatus | 'all';

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
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');

  const fetchOrders = useCallback(async (status: OrderStatusFilter) => {
    try {
      setLoading(true);
      const data = await getAdminOrdersAPI(status === 'all' ? undefined : status);
      setOrders(data);
    } catch {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [fetchOrders, statusFilter]);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    setDraftStatuses((prev) => ({ ...prev, [orderId]: status }));
  };

  const submitStatusChange = async (orderId: string, fallbackStatus: OrderStatus) => {
    const nextStatus = draftStatuses[orderId] || fallbackStatus;

    try {
      setUpdatingId(orderId);
      await adminUpdateOrderStatusAPI(orderId, nextStatus);
      setDraftStatuses((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      setOrders((prev) =>
        prev
          .map((order) => (order._id === orderId ? { ...order, status: nextStatus } : order))
          .filter((order) => statusFilter === 'all' || order.status === statusFilter),
      );
      message.success('Order status updated');
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, 'Failed to update status'));
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
      <Space className={styles.filters}>
        <span>Filter by status:</span>
        <Select
          value={statusFilter}
          className={styles.filterSelect}
          options={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          onChange={(status: OrderStatusFilter) => setStatusFilter(status)} 
        />
      </Space>
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
