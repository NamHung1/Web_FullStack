import { useParams } from 'react-router-dom';
import { Button, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import { getProductAPI } from '../../api/product.api';
import styles from './ProductDetail.module.css';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const data = await getProductAPI(productId);
      setProduct(data);
    } catch (error) {
      message.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className={styles.container}>
      <img src={product.images?.[0] || 'https://picsum.photos/300'} className={styles.image} />

      <div className={styles.info}>
        <h2>{product.name}</h2>

        <p className={styles.price}>${product.price}</p>

        <p>{product.description}</p>

        <Button type="primary">Add to Cart</Button>
      </div>
    </div>
  );
}
