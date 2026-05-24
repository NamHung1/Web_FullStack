import { useCallback, useEffect, useState, useMemo } from 'react';
import { List, Button, Image, message, Empty, Spin, Card } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import {
  getCartAPI,
  removeFromCartAPI,
  updateCartItemQuantityAPI,
} from '../../api/cart.api';
import { useCart } from '../../hooks/useCart';
import { getApiErrorMessage } from '../../utils/apiError';
import styles from './Cart.module.css';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock?: number;
  images?: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartResponseItem {
  productId: Product | null;
  quantity: number;
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { refreshCartCount } = useCart();

  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  // fetch User API
  const fetchCart = useCallback(async () => {
    try {
      const data = await getCartAPI();
      const normalizedItems = (data?.items || [])
        .filter((item: CartResponseItem) => item.productId)
        .map((item: CartResponseItem) => ({
          product: item.productId as Product,
          quantity: item.quantity,
        }));

      setItems(normalizedItems);
      refreshCartCount();
    } catch (err) {
      console.error(err);
      message.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [refreshCartCount]);

  // Cảnh báo yêu cầu đăng nhập
  useEffect(() => {
    if (!token) {
      message.warning('Please login to view cart');
      setLoading(false);
      return;
    }

    fetchCart();
  }, [fetchCart, token]);

  // Xoá sản phẩm ra khỏi rỏ hàng
  const removeItem = async (productId: string) => {
    try {
      await removeFromCartAPI(productId);

      setItems((prev) => prev.filter((item) => item.product._id !== productId));
      refreshCartCount();

      message.success('Item removed');
    } catch {
      message.error('Remove failed');
    }
  };

  // Chính sửa số lượng sản phẩm
  const updateQuantity = async (productId: string, nextQuantity: number) => {
    if (nextQuantity < 1) {
      return;
    }

    setUpdatingId(productId);
    try {
      await updateCartItemQuantityAPI(productId, nextQuantity);

      setItems((prev) =>
        prev.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: nextQuantity }
            : item,
        ),
      );
      refreshCartCount();
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, 'Update quantity failed'));
      fetchCart();
    } finally {
      setUpdatingId(null);
    }
  };

  // Tính tổng số sản phẩm
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  // Tính tổng tiền
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
    [items],
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
            renderItem={(item) => {
              const stock = Number(item.product.stock) || 0;
              const isAtStockLimit = item.quantity >= stock;

              return (
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
                    <p>In stock: {stock}</p>

                    <div className={styles.quantityControls}>
                      <span>Quantity:</span>
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        disabled={
                          item.quantity <= 1 || updatingId === item.product._id
                        }
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity - 1)
                        }
                      />
                      <strong>{item.quantity}</strong>
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        disabled={updatingId === item.product._id || isAtStockLimit}
                        title={isAtStockLimit ? `Only ${stock} item(s) available` : undefined}
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity + 1)
                        }
                      />
                    </div>
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
              );
            }}
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
              onClick={() => navigate('/checkout')}
            >
              Checkout
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
