import { useParams } from 'react-router-dom';
import { Button, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import { getProductAPI } from '../../api/product.api';
import { addToCartAPI } from '../../api/cart.api';
import { useCart } from '../../hooks/useCart';
import type { Product } from '../../types/product';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { incrementCount } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const data = await getProductAPI(productId);
      setProduct(data);
    } catch {
      message.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAdding(true);
    try {
      await addToCartAPI(product._id, 1);
      incrementCount(1);
      message.success('Added to cart');
    } catch {
      message.error('Failed to add to cart. Please login first.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const categoryName = typeof product.category === 'object' ? product.category?.name : '';

  return (
    <div className={styles.container}>
      <img src={product.images?.[0] || 'https://picsum.photos/300'} className={styles.image} alt={product.name} />

      <div className={styles.info}>
        <h2>{product.name}</h2>

        {categoryName ? <p>Category: {categoryName}</p> : null}

        <p>Stock: {product.stock}</p>

        <p className={styles.price}>${product.price}</p>

        <p>{product.description}</p>

        <Button type="primary" loading={adding} onClick={handleAddToCart}>Add to Cart</Button>
      </div>
    </div>
  );
}
