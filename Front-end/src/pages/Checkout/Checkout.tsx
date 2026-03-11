import { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Card, List, Empty, Select, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCartAPI } from '../../api/cart.api';
import { createOrderAPI } from '../../api/order.api';
import { useCart } from '../../hooks/useCart';
import styles from './Checkout.module.css';

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface CartItem {
  productId: Product;
  quantity: number;
}

export default function Checkout() {
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await getCartAPI();
      setItems(data?.items || []);
    } catch {
      message.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.productId.price, 0),
    [items],
  );

  const onFinish = async (values: { address: string; phone: string; paymentMethod: 'cod' | 'bank_transfer' | 'momo' }) => {
    if (!items.length) {
      message.warning('Your cart is empty');
      return;
    }

    try {
      setPlacingOrder(true);
      await createOrderAPI(values);
      await refreshCartCount();
      message.success('Order placed successfully');
      navigate('/orders');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.empty}>
        <Empty description="Your cart is empty" />
        <Button type="primary" onClick={() => navigate('/cart')}>
          Back to Cart
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h2>Checkout</h2>
        <List
          className={styles.orderList}
          dataSource={items}
          renderItem={(item) => (
            <List.Item>
              <span>{item.productId.name} x {item.quantity}</span>
              <strong>${(item.quantity * item.productId.price).toLocaleString()}</strong>
            </List.Item>
          )}
        />

        <p className={styles.total}>Total: ${totalPrice.toLocaleString()}</p>

        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ paymentMethod: 'cod' }}
        >
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: 'Please enter shipping address' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Payment Method"
            name="paymentMethod"
            rules={[{ required: true, message: 'Please choose payment method' }]}
          >
            <Select
              options={[
                { value: 'cod', label: 'Cash on Delivery (COD)' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'momo', label: 'MoMo' },
              ]}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={placingOrder}>
            Place Order
          </Button>
        </Form>
      </Card>
    </div>
  );
}