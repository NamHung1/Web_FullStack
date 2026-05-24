import { Table, Tag, Button, Popconfirm, Rate, Modal, Input, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { cancelOrderAPI, getOrdersAPI } from '../../api/order.api';
import { addReviewAPI } from '../../api/review.api';
import type { Order, OrderProduct } from '../../types/order';
import { getApiErrorMessage } from '../../utils/apiError';
import styles from './Orders.module.css';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    orderId: string;
    product?: OrderProduct;
    rating: number;
    comment: string;
  }>({ open: false, orderId: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrdersAPI();
      setOrders(data);
    } catch {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (orderId: string, product: OrderProduct) => {
    setReviewModal({
      open: true,
      orderId,
      product,
      rating: product.review?.rating || 5,
      comment: product.review?.comment || '',
    });
  };

  const submitReview = async () => {
    if (!reviewModal.product) return;

    try {
      setSubmittingReview(true);
      await addReviewAPI({
        orderId: reviewModal.orderId,
        productId: reviewModal.product.productId._id,
        rating: reviewModal.rating,
        comment: reviewModal.comment,
      });
      message.success('Review submitted');
      setReviewModal({ open: false, orderId: '', rating: 5, comment: '' });
      fetchOrders();
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, 'Submit review failed'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      render: (id: string) => id.slice(-8),
    },
    {
      title: 'Products',
      dataIndex: 'products',
      render: (products: Order['products']) => (
        <Space orientation="vertical" size={2}>
          {products.map((item) => (
            <span key={item.productId._id}>
              {item.productId.name} x {item.quantity}
            </span>
          ))}
        </Space>
      ),
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
        if (record.status === 'pending') {
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
        }

        if (record.status === 'completed') {
          return (
            <Space orientation="vertical" size={4}>
              {record.products.map((item) => (
                <Button
                  key={item.productId._id}
                  size="small"
                  onClick={() => openReviewModal(record._id, item)}
                >
                  {item.review ? 'Edit review' : `Review ${item.productId.name}`}
                </Button>
              ))}
            </Space>
          );
        }

        return record.cancelReason ? `Reason: ${record.cancelReason}` : '-';
      },
    },
  ];

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrderAPI(orderId, 'Cancelled by customer');
      message.success('Order cancelled');
      fetchOrders();
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, 'Cancel order failed'));
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
        scroll={{ x: 900 }}
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />
      <Modal
        title={reviewModal.product ? `Review: ${reviewModal.product.productId.name}` : 'Review'}
        open={reviewModal.open}
        onCancel={() => setReviewModal({ open: false, orderId: '', rating: 5, comment: '' })}
        onOk={submitReview}
        confirmLoading={submittingReview}
      >
        <Space orientation="vertical" style={{ width: '100%' }}>
          <Rate
            value={reviewModal.rating}
            onChange={(value) => setReviewModal((prev) => ({ ...prev, rating: value }))}
          />
          <Input.TextArea
            rows={4}
            value={reviewModal.comment}
            placeholder="Write your review"
            onChange={(e) => setReviewModal((prev) => ({ ...prev, comment: e.target.value }))}
          />
        </Space>
      </Modal>
    </div>
  );
}
