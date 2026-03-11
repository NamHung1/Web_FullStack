import { useEffect, useState } from 'react';
import { List, Button, Image, message, Empty, Spin, Card } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getCartAPI, removeFromCartAPI } from '../../api/cart.api';
import styles from './Cart.module.css';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartResponseItem {
  productId: Product;
  quantity: number;
}


export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchCart = async () => {
    try {
      const data = await getCartAPI();
      const normalizedItems = (data?.items || []).map((item: CartResponseItem) => ({
        product: item.productId,
        quantity: item.quantity,
      }));

      setItems(normalizedItems);
    } catch (err) {
      console.error(err);
      message.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      message.warning('Please login to view cart');
      setLoading(false);
      return;
    }

    fetchCart();
  }, [token]);

  const removeItem = async (productId: string) => {
    try {
      await removeFromCartAPI(productId);

      setItems((prev) => prev.filter((item) => item.product._id !== productId));

      message.success('Item removed');
    } catch {
      message.error('Remove failed');
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0,
  );

  if (!token) {
    return (
      <div className={styles.loginRequired}>
        <h2>Please login to use cart</h2>
      </div>
    );
  }

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
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Cart</h1>

      <div className={styles.wrapper}>
        <div className={styles.list}>
          <List
            dataSource={items}
            renderItem={(item) => (
              <Card className={styles.itemCard}>
                <div className={styles.item}>
                  <Image
                    src={item.product.images?.[0]}
                    width={100}
                    className={styles.image}
                  />

                  <div className={styles.info}>
                    <h3>{item.product.name}</h3>

                    <p className={styles.price}>${item.product.price}</p>

                    <p>Quantity: {item.quantity}</p>
                  </div>

                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeItem(item.product._id)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            )}
          />
        </div>

        <div className={styles.summary}>
          <Card>
            <h2>Order Summary</h2>

            <p>Total Items: {totalItems}</p>

            <p className={styles.totalPrice}>
              Total Price: ${totalPrice.toLocaleString()}
            </p>

            <Button
              type="primary"
              size="large"
              block
              className={styles.checkout}
            >
              Checkout
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
