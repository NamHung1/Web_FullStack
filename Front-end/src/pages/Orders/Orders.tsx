import { Table, Tag, Button, Popconfirm, message } from 'antd';
import { useEffect, useState } from 'react';
import { cancelOrderAPI, getOrdersAPI } from '../../api/order.api';
import styles from './Orders.module.css';

interface Order {
  _id: string;
  totalPrice: number;
  status: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'momo';
  cancelReason?: string;
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
      title: 'Payment',
      dataIndex: 'paymentMethod',
      render: (method: Order['paymentMethod']) =>
        method === 'cod' ? 'COD' : method === 'bank_transfer' ? 'Bank Transfer' : 'MoMo',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      render: (_: unknown, record: Order) => {
        if (record.status !== 'pending') {
          return record.cancelReason ? `Reason: ${record.cancelReason}` : '-';
        }

        return (
          <Popconfirm
            title="Cancel this order?"
            onConfirm={() => handleCancel(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small">
              Cancel
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrderAPI(orderId, 'Cancelled by customer');
      message.success('Order cancelled');
      fetchOrders();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cancel order failed');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Your Orders</h1>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 700 }}
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />
    </div>
  );
}
